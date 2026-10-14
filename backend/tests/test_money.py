"""
Unit and Integration Tests for Phase 1: Money Correctness & Integer Paise Architecture
AI Finance Controller (ReconOps)
"""

import pytest
import os
import sys
import sqlite3
from decimal import Decimal

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.money import (
    rupees_to_paise,
    paise_to_rupees,
    quantize_inr,
    format_inr,
    verify_accounting_equation,
    TOLERANCE_PAISE,
    PAISE_PER_RUPEE
)
from backend.database import Base, engine, SessionLocal
from backend.models import (
    Payment, Settlement, SettlementItem, BankTransaction,
    ExceptionRecord, ReconciliationResult
)
from backend.schemas import (
    PaymentResponse, SettlementResponse, BankTransactionResponse,
    ExceptionResponse, ReconciliationResultResponse
)


class TestMoneyHelper:
    """Tests for shared money helper functions and rounding rules."""

    def test_rupees_to_paise_round_half_up(self):
        """Test strict ROUND_HALF_UP boundary conditions."""
        # Exact values
        assert rupees_to_paise(100.00) == 10000
        assert rupees_to_paise(100.50) == 10050
        assert rupees_to_paise("100.50") == 10050
        assert rupees_to_paise(Decimal("100.50")) == 10050
        assert rupees_to_paise(None) == 0

        # Round Half-Up boundaries
        # 100.504 rounds down to 10050
        assert rupees_to_paise(100.504) == 10050
        # 100.505 rounds UP to 10051
        assert rupees_to_paise(100.505) == 10051
        # 100.506 rounds UP to 10051
        assert rupees_to_paise(100.506) == 10051
        # 0.005 rounds UP to 1 paisa
        assert rupees_to_paise(0.005) == 1
        # 0.004 rounds down to 0 paise
        assert rupees_to_paise(0.004) == 0

    def test_paise_to_rupees(self):
        """Test integer paise to float rupees conversion."""
        assert paise_to_rupees(10000) == 100.00
        assert paise_to_rupees(10050) == 100.50
        assert paise_to_rupees(10051) == 100.51
        assert paise_to_rupees(1) == 0.01
        assert paise_to_rupees(0) == 0.00
        assert paise_to_rupees(None) == 0.00

    def test_quantize_inr(self):
        """Test legacy 2-decimal quantizer."""
        assert quantize_inr(0.3000000004) == 0.30
        assert quantize_inr(100.505) == 100.51
        assert quantize_inr(None) == 0.00

    def test_format_inr_indian_grouping(self):
        """Test standard Indian number formatting (₹2,97,781.17)."""
        assert format_inr(29778117) == "₹2,97,781.17"
        assert format_inr(50000) == "₹500.00"
        assert format_inr(10000000) == "₹1,00,000.00"
        assert format_inr(125000000) == "₹12,50,000.00"
        assert format_inr(0) == "₹0.00"
        assert format_inr(-50000) == "-₹500.00"
        assert format_inr(29778117, symbol=False) == "2,97,781.17"

    def test_no_floating_point_drift_on_large_sum(self):
        """
        Fintech requirement: Sum of thousands of small items must be exact to 0 paise.
        In IEEE-754 binary floats: 0.10 + 0.20 != 0.30, and summing 0.07 * 10,000 drifts to 700.0000000000001.
        In integer paise: 7 paise * 10,000 = exactly 70,000 paise (₹700.00).
        """
        num_items = 10000
        
        # Float arithmetic fails exact equality:
        assert (0.1 + 0.2) != 0.3  # IEEE-754 binary floating drift: 0.30000000000000004
        float_items = [0.07] * num_items
        float_sum = sum(float_items)
        assert float_sum != 700.00  # Proves floating point drift exists: 700.0000000000001

        # Integer paise arithmetic guarantees exact equality:
        paise_items = [rupees_to_paise(0.07)] * num_items
        total_paise = sum(paise_items)
        assert total_paise == 70000  # Exactly 70,000 paise
        assert paise_to_rupees(total_paise) == 700.00  # Exactly ₹700.00


    def test_accounting_equation_holds_exactly(self):
        """
        FINANCIAL IDENTITY TEST:
        Gross - Refunds - Fee - GST = Net must hold down to 0 paise without any leakage.
        """
        # Test Case 1: Standard transaction batch
        gross = rupees_to_paise("24423.21")     # 2442321 paise
        refunds = rupees_to_paise("0.00")       # 0 paise
        fees = rupees_to_paise("291.38")        # 29138 paise
        tax = rupees_to_paise("52.44")          # 5244 paise
        expected_net = gross - refunds - fees - tax # 2407939 paise

        is_valid, variance = verify_accounting_equation(gross, refunds, fees, tax, expected_net)
        assert is_valid is True
        assert variance == 0

        # Test Case 2: Multi-item batch with refunds and fractional paise rounded half-up
        gross_items = [rupees_to_paise(x) for x in [1500.50, 2499.00, 899.99, 12000.00]]
        total_gross = sum(gross_items)
        
        refund_items = [rupees_to_paise(x) for x in [500.00, 150.50]]
        total_refunds = sum(refund_items)
        
        # 2% fee on gross, 18% GST on fee
        fee_rate = Decimal("0.02")
        gst_rate = Decimal("0.18")
        
        total_fee = sum(int((Decimal(p) * fee_rate).quantize(Decimal("1"), rounding="ROUND_HALF_UP")) for p in gross_items)
        total_tax = int((Decimal(total_fee) * gst_rate).quantize(Decimal("1"), rounding="ROUND_HALF_UP"))
        
        net = total_gross - total_refunds - total_fee - total_tax
        
        is_valid, variance = verify_accounting_equation(total_gross, total_refunds, total_fee, total_tax, net)
        assert is_valid is True
        assert variance == 0


class TestDatabaseMoneyIntegrity:
    """Tests verifying SQLite schema integer affinity, model properties, and serialization."""

    def test_database_columns_are_integers(self):
        """Verifies SQLite tables have true INTEGER affinity for all money columns."""
        db_path = "finance_controller.db"
        if not os.path.exists(db_path):
            pytest.skip("finance_controller.db not found for schema inspection")

        conn = sqlite3.connect(db_path)
        c = conn.cursor()

        expected_integer_columns = {
            "payments": ["amount", "fee", "tax", "amount_refunded"],
            "settlements": ["amount", "gross_amount", "fees", "tax"],
            "settlement_items": ["amount", "fee", "tax"],
            "bank_transactions": ["credit", "debit", "balance"],
            "reconciliation_results": ["expected_amount", "actual_amount", "difference"],
            "exceptions": ["expected_amount", "actual_amount", "difference"]
        }

        for table, cols in expected_integer_columns.items():
            info = c.execute(f"PRAGMA table_info({table})").fetchall()
            col_types = {row[1]: row[2].upper() for row in info}
            for col in cols:
                assert col in col_types, f"Column {col} missing in table {table}"
                assert "INT" in col_types[col], f"Column {table}.{col} has type {col_types[col]}, expected INTEGER"

        conn.close()

    def test_orm_models_expose_paise_and_rupees(self):
        """Verifies ORM models return exact int paise and float rupees."""
        db = SessionLocal()
        try:
            p = db.query(Payment).first()
            if p:
                assert isinstance(p.amount, int)
                assert isinstance(p.amount_paise, int)
                assert isinstance(p.amount_rupees, float)
                assert p.amount == p.amount_paise
                assert p.amount_rupees == paise_to_rupees(p.amount)

            s = db.query(Settlement).first()
            if s:
                assert isinstance(s.amount, int)
                assert isinstance(s.amount_paise, int)
                assert isinstance(s.amount_rupees, float)
                assert s.amount == s.amount_paise
                assert s.amount_rupees == paise_to_rupees(s.amount)

            b = db.query(BankTransaction).first()
            if b:
                assert isinstance(b.credit, int)
                assert isinstance(b.credit_paise, int)
                assert isinstance(b.credit_rupees, float)

            e = db.query(ExceptionRecord).first()
            if e:
                assert isinstance(e.difference, int)
                assert isinstance(e.difference_paise, int)
                assert isinstance(e.difference_rupees, float)
        finally:
            db.close()

    def test_pydantic_api_serialization(self):
        """Verifies API response schemas correctly serialize ORM integer paise to rupees and paise."""
        db = SessionLocal()
        try:
            p = db.query(Payment).first()
            if p:
                resp = PaymentResponse.model_validate(p)
                assert resp.amount == paise_to_rupees(p.amount)
                assert resp.amount_paise == p.amount

            s = db.query(Settlement).first()
            if s:
                resp = SettlementResponse.model_validate(s)
                assert resp.amount == paise_to_rupees(s.amount)
                assert resp.amount_paise == s.amount

            b = db.query(BankTransaction).first()
            if b:
                resp = BankTransactionResponse.model_validate(b)
                assert resp.credit == paise_to_rupees(b.credit)
                assert resp.credit_paise == b.credit

            e = db.query(ExceptionRecord).first()
            if e:
                resp = ExceptionResponse.model_validate(e)
                assert resp.difference == paise_to_rupees(e.difference)
                assert resp.difference_paise == e.difference
        finally:
            db.close()


if __name__ == "__main__":
    pytest.main(["-v", __file__])
