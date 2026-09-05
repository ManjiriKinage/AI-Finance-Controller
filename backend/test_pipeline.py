import pytest
import os
import sys
import hmac
import hashlib
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.database import Base, engine, SessionLocal
from backend.models import Payment, Settlement, BankTransaction, ExceptionRecord, ReconciliationResult, ProcessedWebhook, quantize_inr
from backend.app import seed_database_internal
from backend.security import verify_razorpay_signature, RAZORPAY_WEBHOOK_SECRET
from backend.recon_engine import ReconciliationEngine
from backend.cash_intelligence import CashIntelligenceEngine
from backend.ai_service import AIControllerService
from backend.daily_close import DailyCloseEngine
from backend.what_if import WhatIfEngine
from backend.event_stream import generate_live_webhook_event, get_recent_events, inject_live_delayed_settlement

def test_full_pipeline():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # 1. Seed dataset
        seed_database_internal(db, num_payments=300)
        
        # 2. Check counts
        payments_count = db.query(Payment).count()
        settlements_count = db.query(Settlement).count()
        bank_count = db.query(BankTransaction).count()
        
        assert payments_count >= 300
        assert settlements_count >= 50
        assert bank_count >= 50
        
        # 3. Check reconciliation results
        recon_count = db.query(ReconciliationResult).count()
        assert recon_count > 0
        
        # 4. Check exceptions
        exceptions = db.query(ExceptionRecord).all()
        assert len(exceptions) > 0
        first_ex = exceptions[0]
        
        # 5. Check Daily Close & Money Trail
        close_eng = DailyCloseEngine(db)
        daily_close = close_eng.compute_daily_close()
        assert daily_close["payments_processed_gross"] > 0
        assert "fastest_routes_to_close" in daily_close
        assert len(daily_close["fastest_routes_to_close"]) >= 1

        first_setl = db.query(Settlement).first()
        trail = close_eng.get_money_trail(first_setl.id)
        assert "lineage_id" in trail
        assert len(trail["nodes"]) == 5

        # 6. Check Deep Investigator with SQL Audit
        what_if_eng = WhatIfEngine(db)
        investigation = what_if_eng.run_deep_investigation(first_ex.id)
        assert len(investigation["investigation_steps"]) == 7
        assert investigation["investigation_steps"][0]["sql_audit"] is not None

        # 7. Check Phase 4: Accuracy Stress Test (5,000 records)
        engine_inst = ReconciliationEngine(db)
        stress_res = engine_inst.run_accuracy_stress_test(5000)
        assert stress_res["dataset_records_count"] == 5000
        assert stress_res["precision_pct"] > 99.0
        assert len(stress_res["adversarial_tests"]) == 7
        assert all(t["status"] == "PASS" for t in stress_res["adversarial_tests"])

        # 8. Check Phase 4: Calculation Proof & Decimal Quantization
        calc_proof = engine_inst.get_calculation_proof(first_setl.id)
        assert "proof_steps" in calc_proof
        assert len(calc_proof["proof_steps"]) == 7
        assert "formula_string" in calc_proof
        assert quantize_inr(0.3000000004) == 0.30

        # 9. Check Phase 4: Challenge Controller
        first_match = db.query(ReconciliationResult).filter(ReconciliationResult.match_status == "MATCHED").first()
        if first_match:
            challenge_res = engine_inst.challenge_match_decision(first_match.id)
            assert "decision_margin_pct" in challenge_res
            assert challenge_res["challenge_status"] in ["CONFIRMED_SECURE", "DOWNGRADED_TO_REVIEW"]

        # 10. Check Razorpay HMAC Signature Verification & Idempotency
        sample_payload = b'{"event":"payment.captured","id":"evt_test_1001"}'
        valid_sig = hmac.new(
            RAZORPAY_WEBHOOK_SECRET.encode("utf-8"),
            sample_payload,
            hashlib.sha256
        ).hexdigest()
        
        is_valid, reason = verify_razorpay_signature(sample_payload, valid_sig)
        assert is_valid is True
        assert reason == "SIGNATURE_VERIFIED_AUTHENTIC"
        
        is_invalid, err_reason = verify_razorpay_signature(sample_payload, "invalid_sig_abc")
        assert is_invalid is False
        assert "mismatch" in err_reason

        print("All pipeline tests including HMAC verification, Decimal Quantization, and Stress Testing passed!")
    finally:
        db.close()

if __name__ == "__main__":
    test_full_pipeline()
