"""
Money Helper Module - AI Finance Controller (ReconOps)

FINANCIAL SPECIFICATION:
All monetary values in the database are stored as exact integer PAISE (1 INR = 100 paise).
This guarantees:
1. Exact integer arithmetic without binary floating-point drift (e.g. 0.1 + 0.2 != 0.3).
2. Elimination of fractional cent/paisa leakage across aggregate transactions.
3. Perfect adherence to the accounting identity:
   Gross Inflow - Refunds - Fees - Taxes = Net Settlement (exact down to 0 paise).

ROUNDING SPECIFICATION:
- Rounding Rule: Bankers / Standard Commercial Round Half-Up (ROUND_HALF_UP).
  Halves round away from zero (e.g. 0.5 paise rounds to 1 paisa).
- Where rounding happens: ONLY at external ingestion/conversion boundaries
  (e.g., when receiving external float/string JSON payloads from Razorpay or Bank statements).
- Within the engine, database, and ledger: strictly integer paise arithmetic.
"""

from decimal import Decimal, ROUND_HALF_UP
from typing import Union, Optional

PAISE_PER_RUPEE = 100
ONE_PAISA = Decimal("0.01")
TOLERANCE_PAISE = 5  # 5 paise = ₹0.05 accounting tolerance threshold


def quantize_inr(val: Union[float, int, str, Decimal, None]) -> float:
    """
    Quantizes a rupee value to 2 decimal places using standard ROUND_HALF_UP and returns float.
    Used for legacy rupee float interfaces and display formatting.
    Example:
        0.3000000004 -> 0.30
        100.506 -> 100.51
        None -> 0.0
    """
    if val is None:
        return 0.0
    d = Decimal(str(val))
    return float(d.quantize(ONE_PAISA, rounding=ROUND_HALF_UP))


def rupees_to_paise(val: Union[float, int, str, Decimal, None]) -> int:
    """
    Converts a value in INR Rupees to integer paise using strict ROUND_HALF_UP.
    Example:
        100.50 -> 10050
        100.504 -> 10050
        100.506 -> 10051
        None -> 0
    """
    if val is None:
        return 0
    d = Decimal(str(val))
    quantized_rupees = d.quantize(ONE_PAISA, rounding=ROUND_HALF_UP)
    return int(quantized_rupees * PAISE_PER_RUPEE)


def paise_to_rupees(paise: Union[int, float, None]) -> float:
    """
    Converts integer paise to float rupees for API serialization and frontend display.
    Guarantees exact 2 decimal places.
    Example:
        10050 -> 100.50
        None -> 0.0
    """
    if paise is None:
        return 0.0
    d = Decimal(int(round(paise))) / Decimal(PAISE_PER_RUPEE)
    return float(d.quantize(ONE_PAISA, rounding=ROUND_HALF_UP))


def format_inr(paise: Union[int, float, None], symbol: bool = True) -> str:
    """
    Formats integer paise as Indian Rupee string with standard Indian number grouping.
    e.g. 29778117 paise -> "₹2,97,781.17" or "-₹500.00"
    """
    if paise is None:
        return "₹0.00" if symbol else "0.00"
    
    int_paise = int(round(paise))
    is_negative = int_paise < 0
    abs_paise = abs(int_paise)
    rupees_part = abs_paise // PAISE_PER_RUPEE
    paise_part = abs_paise % PAISE_PER_RUPEE

    # Indian numbering format: last 3 digits, then groups of 2
    s = str(rupees_part)
    if len(s) <= 3:
        formatted_rupees = s
    else:
        last3 = s[-3:]
        rest = s[:-3]
        groups = []
        while len(rest) > 2:
            groups.insert(0, rest[-2:])
            rest = rest[:-2]
        if rest:
            groups.insert(0, rest)
        formatted_rupees = ",".join(groups) + "," + last3

    formatted = f"{formatted_rupees}.{paise_part:02d}"
    prefix = "-" if is_negative else ""
    return f"{prefix}₹{formatted}" if symbol else f"{prefix}{formatted}"


def verify_accounting_equation(
    gross_paise: int,
    refunds_paise: int,
    fees_paise: int,
    tax_paise: int,
    net_paise: int
) -> tuple[bool, int]:
    """
    Verifies that:
        Gross - Refunds - Fees - Tax == Net
    Returns:
        (is_valid: bool, variance_paise: int)
        where variance_paise = (Gross - Refunds - Fees - Tax) - Net
    """
    expected_net = gross_paise - refunds_paise - fees_paise - tax_paise
    variance = expected_net - net_paise
    return (variance == 0, variance)

