"""
Migration Script: Convert Float Money Columns to Exact Integer Paise
AI Finance Controller (ReconOps)

PURPOSE:
Converts all monetary float columns across all database tables into exact integer paise (1 INR = 100 paise).
This eliminates floating-point representation drift and ensures the fundamental accounting equation:
Gross - Refunds - Fee - GST = Net holds down to 0 paise.

ROUNDING SPECIFICATION:
- Rounding Rule: ROUND_HALF_UP (Commercial rounding, halves round away from zero: 0.5 paise -> 1 paisa).
- Where rounding happens: ONLY at the conversion boundary during this migration and when ingesting external feeds.
- All stored values inside SQLite will have INTEGER column affinity and integer values in paise.

TABLES MIGRATED:
- payments: amount, fee, tax, amount_refunded
- settlements: amount, gross_amount, fees, tax
- settlement_items: amount, fee, tax
- bank_transactions: credit, debit, balance
- reconciliation_results: expected_amount, actual_amount, difference
- exceptions: expected_amount, actual_amount, difference
- forecast_snapshots: current_cash, pending_settlements, expected_receivables_7d, expected_outflows_7d, projected_7d, projected_30d
"""

import os
import shutil
import sqlite3
import datetime
from decimal import Decimal, ROUND_HALF_UP

PAISE_PER_RUPEE = 100
ONE_PAISA = Decimal("0.01")


def rupee_float_to_paise(val) -> int:
    if val is None:
        return 0
    d = Decimal(str(val))
    quantized = d.quantize(ONE_PAISA, rounding=ROUND_HALF_UP)
    return int(quantized * PAISE_PER_RUPEE)


def run_migration(db_path: str = "finance_controller.db") -> dict:
    if not os.path.exists(db_path):
        return {"status": "SKIPPED", "reason": f"Database file {db_path} does not exist."}

    # 1. Create a safe backup
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = f"{db_path}.bak_{timestamp}"
    shutil.copy2(db_path, backup_path)
    print(f"[MIGRATION] Created backup at {backup_path}")

    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = OFF;")
    cursor = conn.cursor()

    stats = {}

    try:
        # Check existing table schemas
        tables = [r[0] for r in cursor.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]

        # -------------------------------------------------------------
        # 1. PAYMENTS
        # -------------------------------------------------------------
        if "payments" in tables:
            rows = cursor.execute("SELECT id, merchant_id, lineage_id, order_id, amount, currency, status, method, fee, tax, amount_refunded, customer_email, captured_at, created_at FROM payments").fetchall()
            cursor.execute("DROP TABLE IF EXISTS payments_paise;")
            cursor.execute("""
                CREATE TABLE payments_paise (
                    id VARCHAR PRIMARY KEY,
                    merchant_id VARCHAR,
                    lineage_id VARCHAR,
                    order_id VARCHAR,
                    amount INTEGER NOT NULL,
                    currency VARCHAR DEFAULT 'INR',
                    status VARCHAR DEFAULT 'captured',
                    method VARCHAR DEFAULT 'upi',
                    fee INTEGER DEFAULT 0,
                    tax INTEGER DEFAULT 0,
                    amount_refunded INTEGER DEFAULT 0,
                    customer_email VARCHAR,
                    captured_at DATETIME,
                    created_at DATETIME
                );
            """)
            migrated_rows = []
            for r in rows:
                migrated_rows.append((
                    r[0], r[1], r[2], r[3],
                    rupee_float_to_paise(r[4]),
                    r[5], r[6], r[7],
                    rupee_float_to_paise(r[8]),
                    rupee_float_to_paise(r[9]),
                    rupee_float_to_paise(r[10]),
                    r[11], r[12], r[13]
                ))
            cursor.executemany("INSERT INTO payments_paise VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)", migrated_rows)
            cursor.execute("DROP TABLE payments;")
            cursor.execute("ALTER TABLE payments_paise RENAME TO payments;")
            cursor.execute("CREATE INDEX IF NOT EXISTS ix_payments_id ON payments (id);")
            cursor.execute("CREATE INDEX IF NOT EXISTS ix_payments_lineage_id ON payments (lineage_id);")
            cursor.execute("CREATE INDEX IF NOT EXISTS ix_payments_order_id ON payments (order_id);")
            stats["payments"] = len(migrated_rows)

        # -------------------------------------------------------------
        # 2. SETTLEMENTS
        # -------------------------------------------------------------
        if "settlements" in tables:
            rows = cursor.execute("SELECT id, merchant_id, lineage_id, amount, gross_amount, fees, tax, utr, status, settlement_period, created_at FROM settlements").fetchall()
            cursor.execute("DROP TABLE IF EXISTS settlements_paise;")
            cursor.execute("""
                CREATE TABLE settlements_paise (
                    id VARCHAR PRIMARY KEY,
                    merchant_id VARCHAR,
                    lineage_id VARCHAR,
                    amount INTEGER NOT NULL,
                    gross_amount INTEGER DEFAULT 0,
                    fees INTEGER DEFAULT 0,
                    tax INTEGER DEFAULT 0,
                    utr VARCHAR NOT NULL,
                    status VARCHAR DEFAULT 'processed',
                    settlement_period VARCHAR,
                    created_at DATETIME
                );
            """)
            migrated_rows = []
            for r in rows:
                migrated_rows.append((
                    r[0], r[1], r[2],
                    rupee_float_to_paise(r[3]),
                    rupee_float_to_paise(r[4]),
                    rupee_float_to_paise(r[5]),
                    rupee_float_to_paise(r[6]),
                    r[7], r[8], r[9], r[10]
                ))
            cursor.executemany("INSERT INTO settlements_paise VALUES (?,?,?,?,?,?,?,?,?,?,?)", migrated_rows)
            cursor.execute("DROP TABLE settlements;")
            cursor.execute("ALTER TABLE settlements_paise RENAME TO settlements;")
            cursor.execute("CREATE INDEX IF NOT EXISTS ix_settlements_id ON settlements (id);")
            cursor.execute("CREATE INDEX IF NOT EXISTS ix_settlements_lineage_id ON settlements (lineage_id);")
            cursor.execute("CREATE INDEX IF NOT EXISTS ix_settlements_utr ON settlements (utr);")
            stats["settlements"] = len(migrated_rows)

        # -------------------------------------------------------------
        # 3. SETTLEMENT ITEMS
        # -------------------------------------------------------------
        if "settlement_items" in tables:
            rows = cursor.execute("SELECT id, settlement_id, payment_id, type, amount, fee, tax FROM settlement_items").fetchall()
            cursor.execute("DROP TABLE IF EXISTS settlement_items_paise;")
            cursor.execute("""
                CREATE TABLE settlement_items_paise (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    settlement_id VARCHAR,
                    payment_id VARCHAR,
                    type VARCHAR DEFAULT 'payment',
                    amount INTEGER NOT NULL,
                    fee INTEGER DEFAULT 0,
                    tax INTEGER DEFAULT 0
                );
            """)
            migrated_rows = []
            for r in rows:
                migrated_rows.append((
                    r[0], r[1], r[2], r[3],
                    rupee_float_to_paise(r[4]),
                    rupee_float_to_paise(r[5]),
                    rupee_float_to_paise(r[6])
                ))
            cursor.executemany("INSERT INTO settlement_items_paise VALUES (?,?,?,?,?,?,?)", migrated_rows)
            cursor.execute("DROP TABLE settlement_items;")
            cursor.execute("ALTER TABLE settlement_items_paise RENAME TO settlement_items;")
            cursor.execute("CREATE INDEX IF NOT EXISTS ix_settlement_items_settlement_id ON settlement_items (settlement_id);")
            cursor.execute("CREATE INDEX IF NOT EXISTS ix_settlement_items_payment_id ON settlement_items (payment_id);")
            stats["settlement_items"] = len(migrated_rows)

        # -------------------------------------------------------------
        # 4. BANK TRANSACTIONS
        # -------------------------------------------------------------
        if "bank_transactions" in tables:
            rows = cursor.execute("SELECT id, lineage_id, transaction_date, value_date, description, reference, credit, debit, balance, bank_utr FROM bank_transactions").fetchall()
            cursor.execute("DROP TABLE IF EXISTS bank_transactions_paise;")
            cursor.execute("""
                CREATE TABLE bank_transactions_paise (
                    id VARCHAR PRIMARY KEY,
                    lineage_id VARCHAR,
                    transaction_date DATETIME NOT NULL,
                    value_date DATETIME NOT NULL,
                    description VARCHAR NOT NULL,
                    reference VARCHAR,
                    credit INTEGER DEFAULT 0,
                    debit INTEGER DEFAULT 0,
                    balance INTEGER DEFAULT 0,
                    bank_utr VARCHAR
                );
            """)
            migrated_rows = []
            for r in rows:
                migrated_rows.append((
                    r[0], r[1], r[2], r[3], r[4], r[5],
                    rupee_float_to_paise(r[6]),
                    rupee_float_to_paise(r[7]),
                    rupee_float_to_paise(r[8]),
                    r[9]
                ))
            cursor.executemany("INSERT INTO bank_transactions_paise VALUES (?,?,?,?,?,?,?,?,?,?)", migrated_rows)
            cursor.execute("DROP TABLE bank_transactions;")
            cursor.execute("ALTER TABLE bank_transactions_paise RENAME TO bank_transactions;")
            cursor.execute("CREATE INDEX IF NOT EXISTS ix_bank_transactions_id ON bank_transactions (id);")
            cursor.execute("CREATE INDEX IF NOT EXISTS ix_bank_transactions_lineage_id ON bank_transactions (lineage_id);")
            cursor.execute("CREATE INDEX IF NOT EXISTS ix_bank_transactions_reference ON bank_transactions (reference);")
            cursor.execute("CREATE INDEX IF NOT EXISTS ix_bank_transactions_bank_utr ON bank_transactions (bank_utr);")
            stats["bank_transactions"] = len(migrated_rows)

        # -------------------------------------------------------------
        # 5. RECONCILIATION RESULTS
        # -------------------------------------------------------------
        if "reconciliation_results" in tables:
            rows = cursor.execute("SELECT id, recon_batch_id, lineage_id, settlement_id, bank_transaction_id, match_status, match_score, matching_method, expected_amount, actual_amount, difference, reason, created_at FROM reconciliation_results").fetchall()
            cursor.execute("DROP TABLE IF EXISTS reconciliation_results_paise;")
            cursor.execute("""
                CREATE TABLE reconciliation_results_paise (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    recon_batch_id VARCHAR,
                    lineage_id VARCHAR,
                    settlement_id VARCHAR,
                    bank_transaction_id VARCHAR,
                    match_status VARCHAR DEFAULT 'UNRESOLVED',
                    match_score FLOAT DEFAULT 0.0,
                    matching_method VARCHAR DEFAULT 'RULE_UTR',
                    expected_amount INTEGER DEFAULT 0,
                    actual_amount INTEGER DEFAULT 0,
                    difference INTEGER DEFAULT 0,
                    reason TEXT,
                    created_at DATETIME
                );
            """)
            migrated_rows = []
            for r in rows:
                migrated_rows.append((
                    r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7],
                    rupee_float_to_paise(r[8]),
                    rupee_float_to_paise(r[9]),
                    rupee_float_to_paise(r[10]),
                    r[11], r[12]
                ))
            cursor.executemany("INSERT INTO reconciliation_results_paise VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)", migrated_rows)
            cursor.execute("DROP TABLE reconciliation_results;")
            cursor.execute("ALTER TABLE reconciliation_results_paise RENAME TO reconciliation_results;")
            cursor.execute("CREATE INDEX IF NOT EXISTS ix_reconciliation_results_recon_batch_id ON reconciliation_results (recon_batch_id);")
            cursor.execute("CREATE INDEX IF NOT EXISTS ix_reconciliation_results_lineage_id ON reconciliation_results (lineage_id);")
            cursor.execute("CREATE INDEX IF NOT EXISTS ix_reconciliation_results_settlement_id ON reconciliation_results (settlement_id);")
            cursor.execute("CREATE INDEX IF NOT EXISTS ix_reconciliation_results_bank_transaction_id ON reconciliation_results (bank_transaction_id);")
            stats["reconciliation_results"] = len(migrated_rows)

        # -------------------------------------------------------------
        # 6. EXCEPTIONS
        # -------------------------------------------------------------
        if "exceptions" in tables:
            rows = cursor.execute("SELECT id, lineage_id, recon_result_id, settlement_id, bank_transaction_id, exception_type, severity, expected_amount, actual_amount, difference, confidence, ai_explanation, status, recommended_action, resolution_notes, resolved_by, resolved_at, created_at FROM exceptions").fetchall()
            cursor.execute("DROP TABLE IF EXISTS exceptions_paise;")
            cursor.execute("""
                CREATE TABLE exceptions_paise (
                    id VARCHAR PRIMARY KEY,
                    lineage_id VARCHAR,
                    recon_result_id INTEGER,
                    settlement_id VARCHAR,
                    bank_transaction_id VARCHAR,
                    exception_type VARCHAR NOT NULL,
                    severity VARCHAR DEFAULT 'MEDIUM',
                    expected_amount INTEGER DEFAULT 0,
                    actual_amount INTEGER DEFAULT 0,
                    difference INTEGER DEFAULT 0,
                    confidence FLOAT DEFAULT 0.0,
                    ai_explanation JSON,
                    status VARCHAR DEFAULT 'OPEN',
                    recommended_action VARCHAR,
                    resolution_notes TEXT,
                    resolved_by VARCHAR,
                    resolved_at DATETIME,
                    created_at DATETIME
                );
            """)
            migrated_rows = []
            for r in rows:
                migrated_rows.append((
                    r[0], r[1], r[2], r[3], r[4], r[5], r[6],
                    rupee_float_to_paise(r[7]),
                    rupee_float_to_paise(r[8]),
                    rupee_float_to_paise(r[9]),
                    r[10], r[11], r[12], r[13], r[14], r[15], r[16], r[17]
                ))
            cursor.executemany("INSERT INTO exceptions_paise VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", migrated_rows)
            cursor.execute("DROP TABLE exceptions;")
            cursor.execute("ALTER TABLE exceptions_paise RENAME TO exceptions;")
            cursor.execute("CREATE INDEX IF NOT EXISTS ix_exceptions_id ON exceptions (id);")
            cursor.execute("CREATE INDEX IF NOT EXISTS ix_exceptions_lineage_id ON exceptions (lineage_id);")
            stats["exceptions"] = len(migrated_rows)

        # -------------------------------------------------------------
        # 7. FORECAST SNAPSHOTS
        # -------------------------------------------------------------
        if "forecast_snapshots" in tables:
            rows = cursor.execute("SELECT id, date, current_cash, pending_settlements, expected_receivables_7d, expected_outflows_7d, projected_7d, projected_30d, confidence_score, details FROM forecast_snapshots").fetchall()
            cursor.execute("DROP TABLE IF EXISTS forecast_snapshots_paise;")
            cursor.execute("""
                CREATE TABLE forecast_snapshots_paise (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date DATETIME,
                    current_cash INTEGER DEFAULT 0,
                    pending_settlements INTEGER DEFAULT 0,
                    expected_receivables_7d INTEGER DEFAULT 0,
                    expected_outflows_7d INTEGER DEFAULT 0,
                    projected_7d INTEGER DEFAULT 0,
                    projected_30d INTEGER DEFAULT 0,
                    confidence_score FLOAT DEFAULT 85.0,
                    details JSON
                );
            """)
            migrated_rows = []
            for r in rows:
                migrated_rows.append((
                    r[0], r[1],
                    rupee_float_to_paise(r[2]),
                    rupee_float_to_paise(r[3]),
                    rupee_float_to_paise(r[4]),
                    rupee_float_to_paise(r[5]),
                    rupee_float_to_paise(r[6]),
                    rupee_float_to_paise(r[7]),
                    r[8], r[9]
                ))
            cursor.executemany("INSERT INTO forecast_snapshots_paise VALUES (?,?,?,?,?,?,?,?,?,?)", migrated_rows)
            cursor.execute("DROP TABLE forecast_snapshots;")
            cursor.execute("ALTER TABLE forecast_snapshots_paise RENAME TO forecast_snapshots;")
            stats["forecast_snapshots"] = len(migrated_rows)

        conn.commit()
        print(f"[MIGRATION SUCCESS] All tables migrated to integer paise. Stats: {stats}")
        return {"status": "SUCCESS", "backup": backup_path, "stats": stats}

    except Exception as e:
        conn.rollback()
        print(f"[MIGRATION ERROR] Rollback triggered: {e}")
        # Restore backup if something went wrong
        shutil.copy2(backup_path, db_path)
        raise e
    finally:
        conn.close()


if __name__ == "__main__":
    db_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "finance_controller.db")
    if not os.path.exists(db_file):
        db_file = "finance_controller.db"
    run_migration(db_file)
