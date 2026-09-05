import hmac
import hashlib
import os
from typing import Tuple

# Configurable Webhook Secret & Bypass Setting
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET", "whsec_demo_razorpay_fintech_2026")
BYPASS_SIGNATURE_VERIFY = os.getenv("BYPASS_SIGNATURE_VERIFY", "True").lower() in ("true", "1", "yes")

def verify_razorpay_signature(raw_payload: bytes, signature_header: str | None, secret: str = RAZORPAY_WEBHOOK_SECRET) -> Tuple[bool, str]:
    """
    Authenticates Razorpay webhook payloads using HMAC SHA256 digest verification.
    
    Returns:
        (is_valid: bool, reason: str)
    """
    if BYPASS_SIGNATURE_VERIFY and not signature_header:
        return True, "BYPASSED_FOR_LOCAL_SANDBOX_DEMO"
        
    if not signature_header:
        return False, "Missing X-Razorpay-Signature header"
        
    try:
        expected_signature = hmac.new(
            key=secret.encode("utf-8"),
            msg=raw_payload,
            digestmod=hashlib.sha256
        ).hexdigest()
        
        # Constant-time comparison to prevent timing attacks
        is_match = hmac.compare_digest(expected_signature, signature_header.strip())
        if is_match:
            return True, "SIGNATURE_VERIFIED_AUTHENTIC"
        else:
            return False, "HMAC SHA256 Signature mismatch"
    except Exception as e:
        return False, f"Signature verification error: {str(e)}"
