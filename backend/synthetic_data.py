import os
import random
import datetime
import csv
from typing import List, Dict, Any, Tuple

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

def ensure_data_dir():
    os.makedirs(DATA_DIR, exist_ok=True)

def generate_synthetic_dataset(
    num_payments: int = 500,
    seed: int = 42
) -> Dict[str, Any]:
    """
    Generates a realistic fintech dataset of:
    - Payments (500+)
    - Settlements (100+)
    - Bank Transactions (500+)
    - Ground Truth CSV for Precision / Recall / False Match evaluation
    """
    random.seed(seed)
    ensure_data_dir()

    start_date = datetime.datetime(2026, 8, 15, 9, 0, 0)
    
    payments = []
    settlements = []
    settlement_items = []
    bank_transactions = []
    ground_truth = []

    # 1. Generate Payments
    payment_methods = ["upi", "card", "netbanking", "wallet"]
    payment_method_weights = [0.65, 0.20, 0.10, 0.05]
    
    print(f"Generating {num_payments} synthetic payments...")
    
    for i in range(1, num_payments + 1):
        pay_id = f"pay_{i:04d}"
        order_id = f"ord_{1000 + i}"
        
        # Payment amount between 500 and 25,000 INR
        base_amt = round(random.choice([
            random.uniform(400, 2500),
            random.uniform(2500, 8000),
            random.uniform(8000, 25000),
            5000.0, 8000.0, 2500.0, 7000.0, 10000.0
        ]), 2)
        
        method = random.choices(payment_methods, weights=payment_method_weights)[0]
        
        # Razorpay fee model: ~2% standard + 18% GST on fee
        fee_rate = 0.02 if method == "card" else 0.015 if method == "netbanking" else 0.008
        fee = round(base_amt * fee_rate, 2)
        tax = round(fee * 0.18, 2)
        
        # Timestamps spread over 15 days
        created_delta = datetime.timedelta(
            days=random.randint(0, 14),
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59)
        )
        pay_created = start_date + created_delta
        
        # Refund probability 3%
        is_refunded = random.random() < 0.03
        refund_amt = base_amt if is_refunded and random.random() < 0.5 else (round(base_amt * 0.4, 2) if is_refunded else 0.0)
        status = "refunded" if (refund_amt == base_amt) else "captured"
        
        payments.append({
            "id": pay_id,
            "merchant_id": "mer_001",
            "order_id": order_id,
            "amount": base_amt,
            "currency": "INR",
            "status": status,
            "method": method,
            "fee": fee,
            "tax": tax,
            "amount_refunded": refund_amt,
            "customer_email": f"customer_{i}@example.com",
            "captured_at": pay_created.isoformat(),
            "created_at": pay_created.isoformat()
        })

    # 2. Group payments into Settlements (1 to 6 payments per settlement)
    # Target approx num_payments // 4 settlements
    pay_idx = 0
    setl_id_counter = 1
    
    # Track assigned anomalies
    anomaly_categories = [
        "CLEAN_MATCH",             # 80%
        "AMOUNT_MISMATCH",          # 5%
        "MISSING_BANK_ENTRY",       # 4%
        "DUPLICATE_BANK_ENTRY",     # 3%
        "TIMING_DIFFERENCE",        # 3%
        "REFUND_MISMATCH",          # 2%
        "FEE_TAX_MISMATCH",         # 1%
        "UNKNOWN_BANK_ENTRY"        # 2% (injected directly to bank)
    ]
    anomaly_weights = [0.80, 0.05, 0.04, 0.03, 0.03, 0.02, 0.01, 0.02]

    bank_running_balance = 1250000.00 # Starting balance ₹12.5L
    
    while pay_idx < len(payments):
        batch_size = min(random.randint(1, 6), len(payments) - pay_idx)
        batch_payments = payments[pay_idx : pay_idx + batch_size]
        pay_idx += batch_size
        
        setl_id = f"setl_{setl_id_counter:04d}"
        utr_num = f"AXIS{random.randint(10000000, 99999999)}"
        
        gross_amt = round(sum(p["amount"] for p in batch_payments), 2)
        total_fees = round(sum(p["fee"] for p in batch_payments), 2)
        total_tax = round(sum(p["tax"] for p in batch_payments), 2)
        total_refunds = round(sum(p["amount_refunded"] for p in batch_payments), 2)
        
        expected_settlement_amt = round(gross_amt - total_fees - total_tax - total_refunds, 2)
        if expected_settlement_amt <= 0:
            expected_settlement_amt = gross_amt
            
        latest_pay_date = max(datetime.datetime.fromisoformat(p["created_at"]) for p in batch_payments)
        setl_date = latest_pay_date + datetime.timedelta(days=1, hours=random.randint(1, 4))
        
        # Pick anomaly type for this settlement
        anomaly_type = random.choices(anomaly_categories[:-1], weights=anomaly_weights[:-1])[0]
        
        actual_settlement_amt = expected_settlement_amt
        settlement_status = "processed"
        
        # Link items
        for p in batch_payments:
            settlement_items.append({
                "settlement_id": setl_id,
                "payment_id": p["id"],
                "type": "payment" if p["amount_refunded"] == 0 else "refund",
                "amount": p["amount"],
                "fee": p["fee"],
                "tax": p["tax"]
            })
            
        settlements.append({
            "id": setl_id,
            "merchant_id": "mer_001",
            "amount": actual_settlement_amt,
            "gross_amount": gross_amt,
            "fees": total_fees,
            "tax": total_tax,
            "utr": utr_num,
            "status": settlement_status,
            "settlement_period": f"{latest_pay_date.strftime('%Y-%m-%d')} Batch",
            "created_at": setl_date.isoformat(),
            "target_anomaly": anomaly_type
        })
        
        # 3. Create Corresponding Bank Transaction(s) based on Anomaly Type
        bank_tx_id = f"tx_bank_{setl_id_counter:04d}"
        bank_credit_amt = actual_settlement_amt
        bank_tx_date = setl_date + datetime.timedelta(hours=random.randint(2, 8))
        bank_val_date = bank_tx_date
        bank_utr = utr_num
        
        # Narration formats observed in real Indian banks
        narration_templates = [
            f"NEFT/RZPY/{utr_num}/SETTLEMENT/{latest_pay_date.strftime('%d%b')}",
            f"RAZORPAY-{utr_num}-SETL-CREDIT",
            f"CMS/0029381/{utr_num}/RZP-SETL",
            f"NEFT-RZP-{utr_num}-PAYMENTS",
            f"RZPY/{utr_num}/SETL_CREDIT"
        ]
        description = random.choice(narration_templates)
        
        if anomaly_type == "CLEAN_MATCH":
            # Exact clean match
            bank_running_balance += bank_credit_amt
            bank_transactions.append({
                "id": bank_tx_id,
                "transaction_date": bank_tx_date.isoformat(),
                "value_date": bank_val_date.isoformat(),
                "description": description,
                "reference": f"REF_{utr_num[-6:]}",
                "credit": bank_credit_amt,
                "debit": 0.0,
                "balance": round(bank_running_balance, 2),
                "bank_utr": bank_utr
            })
            ground_truth.append({
                "settlement_id": setl_id,
                "bank_transaction_id": bank_tx_id,
                "true_match_status": "MATCHED",
                "true_exception_type": "NONE",
                "true_difference": 0.0,
                "anomaly_label": "CLEAN_MATCH"
            })
            
        elif anomaly_type == "AMOUNT_MISMATCH":
            # Realistic difference (e.g. gateway dispute hold or unexpected fee adjustment ₹200 - ₹850)
            diff = random.choice([200.0, 450.0, 850.0, 1200.0])
            bank_credit_amt = round(max(100.0, actual_settlement_amt - diff), 2)
            bank_running_balance += bank_credit_amt
            bank_transactions.append({
                "id": bank_tx_id,
                "transaction_date": bank_tx_date.isoformat(),
                "value_date": bank_val_date.isoformat(),
                "description": description,
                "reference": f"REF_{utr_num[-6:]}",
                "credit": bank_credit_amt,
                "debit": 0.0,
                "balance": round(bank_running_balance, 2),
                "bank_utr": bank_utr
            })
            ground_truth.append({
                "settlement_id": setl_id,
                "bank_transaction_id": bank_tx_id,
                "true_match_status": "MISMATCH",
                "true_exception_type": "AMOUNT_MISMATCH",
                "true_difference": diff,
                "anomaly_label": "AMOUNT_MISMATCH"
            })
            
        elif anomaly_type == "MISSING_BANK_ENTRY":
            # Settlement processed by Razorpay, but no bank credit exists
            ground_truth.append({
                "settlement_id": setl_id,
                "bank_transaction_id": "NONE",
                "true_match_status": "UNRESOLVED",
                "true_exception_type": "MISSING_SETTLEMENT",
                "true_difference": actual_settlement_amt,
                "anomaly_label": "MISSING_BANK_ENTRY"
            })
            
        elif anomaly_type == "DUPLICATE_BANK_ENTRY":
            # Bank credit posted twice by mistake
            bank_running_balance += bank_credit_amt
            bank_transactions.append({
                "id": bank_tx_id,
                "transaction_date": bank_tx_date.isoformat(),
                "value_date": bank_val_date.isoformat(),
                "description": description,
                "reference": f"REF_{utr_num[-6:]}",
                "credit": bank_credit_amt,
                "debit": 0.0,
                "balance": round(bank_running_balance, 2),
                "bank_utr": bank_utr
            })
            # Duplicate entry 10 minutes later
            dup_tx_id = f"tx_bank_dup_{setl_id_counter:04d}"
            bank_running_balance += bank_credit_amt
            bank_transactions.append({
                "id": dup_tx_id,
                "transaction_date": (bank_tx_date + datetime.timedelta(minutes=10)).isoformat(),
                "value_date": bank_val_date.isoformat(),
                "description": description + " (DUP)",
                "reference": f"REF_{utr_num[-6:]}",
                "credit": bank_credit_amt,
                "debit": 0.0,
                "balance": round(bank_running_balance, 2),
                "bank_utr": bank_utr
            })
            ground_truth.append({
                "settlement_id": setl_id,
                "bank_transaction_id": bank_tx_id,
                "true_match_status": "PARTIAL",
                "true_exception_type": "DUPLICATE_ENTRY",
                "true_difference": bank_credit_amt,
                "anomaly_label": "DUPLICATE_BANK_ENTRY"
            })
            
        elif anomaly_type == "TIMING_DIFFERENCE":
            # Value date delayed by 3 business days (e.g. weekend/bank holiday)
            delayed_val_date = bank_tx_date + datetime.timedelta(days=3)
            bank_running_balance += bank_credit_amt
            bank_transactions.append({
                "id": bank_tx_id,
                "transaction_date": bank_tx_date.isoformat(),
                "value_date": delayed_val_date.isoformat(),
                "description": description,
                "reference": f"REF_{utr_num[-6:]}",
                "credit": bank_credit_amt,
                "debit": 0.0,
                "balance": round(bank_running_balance, 2),
                "bank_utr": bank_utr
            })
            ground_truth.append({
                "settlement_id": setl_id,
                "bank_transaction_id": bank_tx_id,
                "true_match_status": "MATCHED",
                "true_exception_type": "TIMING_DIFFERENCE",
                "true_difference": 0.0,
                "anomaly_label": "TIMING_DIFFERENCE"
            })
            
        elif anomaly_type == "REFUND_MISMATCH":
            # Refund deducted from settlement, but mismatch of ₹300
            diff = 300.0
            bank_credit_amt = round(max(50.0, actual_settlement_amt - diff), 2)
            bank_running_balance += bank_credit_amt
            bank_transactions.append({
                "id": bank_tx_id,
                "transaction_date": bank_tx_date.isoformat(),
                "value_date": bank_val_date.isoformat(),
                "description": description,
                "reference": f"REF_{utr_num[-6:]}",
                "credit": bank_credit_amt,
                "debit": 0.0,
                "balance": round(bank_running_balance, 2),
                "bank_utr": bank_utr
            })
            ground_truth.append({
                "settlement_id": setl_id,
                "bank_transaction_id": bank_tx_id,
                "true_match_status": "MISMATCH",
                "true_exception_type": "REFUND_MISMATCH",
                "true_difference": diff,
                "anomaly_label": "REFUND_MISMATCH"
            })
            
        elif anomaly_type == "FEE_TAX_MISMATCH":
            # Slight rounding or MDR tier calculation mismatch ₹45
            diff = 45.0
            bank_credit_amt = round(max(50.0, actual_settlement_amt - diff), 2)
            bank_running_balance += bank_credit_amt
            bank_transactions.append({
                "id": bank_tx_id,
                "transaction_date": bank_tx_date.isoformat(),
                "value_date": bank_val_date.isoformat(),
                "description": description,
                "reference": f"REF_{utr_num[-6:]}",
                "credit": bank_credit_amt,
                "debit": 0.0,
                "balance": round(bank_running_balance, 2),
                "bank_utr": bank_utr
            })
            ground_truth.append({
                "settlement_id": setl_id,
                "bank_transaction_id": bank_tx_id,
                "true_match_status": "MISMATCH",
                "true_exception_type": "FEE_TAX_MISMATCH",
                "true_difference": diff,
                "anomaly_label": "FEE_TAX_MISMATCH"
            })

        setl_id_counter += 1

    # 4. Inject a few Unidentified direct Bank Transactions (Unknown entries e.g. direct vendor credit / unknown refund)
    for u in range(1, 5):
        unknown_id = f"tx_bank_unk_{u:03d}"
        unknown_amt = round(random.choice([1500.0, 3200.0, 5000.0, 8400.0]), 2)
        bank_running_balance += unknown_amt
        unk_date = start_date + datetime.timedelta(days=random.randint(3, 12), hours=14)
        bank_transactions.append({
            "id": unknown_id,
            "transaction_date": unk_date.isoformat(),
            "value_date": unk_date.isoformat(),
            "description": f"IMPS/DIRECT-CREDIT/ACC9827103/MISC_INFLOW_{u}",
            "reference": f"UNK_REF_{u:03d}",
            "credit": unknown_amt,
            "debit": 0.0,
            "balance": round(bank_running_balance, 2),
            "bank_utr": f"IMPS{random.randint(100000, 999999)}"
        })
        ground_truth.append({
            "settlement_id": "NONE",
            "bank_transaction_id": unknown_id,
            "true_match_status": "UNRESOLVED",
            "true_exception_type": "UNKNOWN_BANK_ENTRY",
            "true_difference": unknown_amt,
            "anomaly_label": "UNKNOWN_BANK_ENTRY"
        })

    # Also add standard operating debits to Bank Statement (AWS, Server, Office, Salary)
    op_expenses = [
        ("AWS INFRASTRUCTURE CLOUD BILL", 45200.00, 5),
        ("OFFICE LEASE & MAINTENANCE", 85000.00, 1),
        ("VENDOR PAYROLL DISBURSEMENT BATCH", 185000.00, 10),
        ("GOOGLE WORKSPACE & DOMAINS", 12400.00, 8),
        ("RAZORPAY DIRECT SUBSCRIPTION FEE", 3500.00, 12)
    ]
    for desc, debit_amt, day_offset in op_expenses:
        debit_date = start_date + datetime.timedelta(days=day_offset, hours=10)
        bank_running_balance -= debit_amt
        bank_transactions.append({
            "id": f"tx_bank_deb_{day_offset:02d}",
            "transaction_date": debit_date.isoformat(),
            "value_date": debit_date.isoformat(),
            "description": f"NEFT/DEBIT/{desc}",
            "reference": f"DR_{random.randint(10000, 99999)}",
            "credit": 0.0,
            "debit": debit_amt,
            "balance": round(bank_running_balance, 2),
            "bank_utr": f"DR_UTR_{random.randint(100000, 999999)}"
        })

    # Sort bank transactions by date
    bank_transactions.sort(key=lambda x: x["transaction_date"])

    # 5. Write CSV Files
    _write_csv(os.path.join(DATA_DIR, "payments.csv"), payments)
    _write_csv(os.path.join(DATA_DIR, "settlements.csv"), settlements)
    _write_csv(os.path.join(DATA_DIR, "settlement_items.csv"), settlement_items)
    _write_csv(os.path.join(DATA_DIR, "bank_statement.csv"), bank_transactions)
    _write_csv(os.path.join(DATA_DIR, "ground_truth.csv"), ground_truth)

    print(f"Generated {len(payments)} payments, {len(settlements)} settlements, {len(bank_transactions)} bank transactions, and {len(ground_truth)} ground truth labels.")

    return {
        "payments_count": len(payments),
        "settlements_count": len(settlements),
        "bank_transactions_count": len(bank_transactions),
        "ground_truth_count": len(ground_truth),
        "payments": payments,
        "settlements": settlements,
        "settlement_items": settlement_items,
        "bank_transactions": bank_transactions,
        "ground_truth": ground_truth
    }

def _write_csv(filepath: str, data: List[Dict[str, Any]]):
    if not data:
        return
    keys = data[0].keys()
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        writer.writerows(data)

if __name__ == "__main__":
    generate_synthetic_dataset(500)
