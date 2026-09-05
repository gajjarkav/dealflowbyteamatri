from decimal import Decimal
from typing import List, Dict, Any
from pydantic import BaseModel

class RiskSettings(BaseModel):
    risk_weights_blended: Decimal
    risk_weights_worst_line: Decimal
    risk_weights_margin_penalty: Decimal
    target_margin_pct: Decimal

def calculate_risk(
    lines: List[Dict[str, Any]], 
    order_discount_pct: Decimal, 
    order_margin_pct: Decimal, 
    settings: RiskSettings
) -> Dict[str, Any]:
    """
    Pure function to calculate risk score.
    lines must contain: id, product_name, category_name, line_subtotal, discount_pct, allowed_discount_pct
    """
    if not lines:
        return {
            "risk": Decimal("0"),
            "blended": Decimal("0"),
            "worst_line": Decimal("0"),
            "margin_penalty": Decimal("0"),
            "margin_pct": order_margin_pct,
            "target_margin": settings.target_margin_pct,
            "weights": {
                "blended": settings.risk_weights_blended,
                "worst_line": settings.risk_weights_worst_line,
                "margin_penalty": settings.risk_weights_margin_penalty
            },
            "lines": [],
            "violations_count": 0
        }

    total_subtotal = sum((l.get("line_subtotal", Decimal("0")) for l in lines), Decimal("0"))
    
    order_disc = order_discount_pct / Decimal("100")
    
    blended = Decimal("0")
    worst = Decimal("0")
    violations_count = 0
    
    line_details = []

    for line in lines:
        line_disc = line.get("discount_pct", Decimal("0")) / Decimal("100")
        allowed = line.get("allowed_discount_pct", Decimal("0")) / Decimal("100")
        subtotal = line.get("line_subtotal", Decimal("0"))
        
        # effective_line_discount_i = 1 − (1 − line_disc_i)(1 − order_disc)
        effective_line_disc = Decimal("1") - (Decimal("1") - line_disc) * (Decimal("1") - order_disc)
        
        # excess_i = max(0, effective_line_discount_i − allowed_i) # percentage points
        # To get percentage points, multiply by 100
        excess = max(Decimal("0"), (effective_line_disc - allowed) * Decimal("100"))
        
        if excess > 0:
            violations_count += 1
            
        weight = subtotal / total_subtotal if total_subtotal > 0 else Decimal("0")
        contribution = excess * weight
        
        blended += contribution
        if excess > worst:
            worst = excess
            
        line_details.append({
            "line_id": str(line.get("id")),
            "product": line.get("product_name"),
            "category": line.get("category_name"),
            "discount": (effective_line_disc * Decimal("100")).quantize(Decimal("0.01")),
            "allowed": (allowed * Decimal("100")).quantize(Decimal("0.01")),
            "excess": excess.quantize(Decimal("0.01")),
            "weight": weight.quantize(Decimal("0.001")),
            "contribution": contribution.quantize(Decimal("0.01"))
        })

    margin_pen = max(Decimal("0"), settings.target_margin_pct - order_margin_pct)
    
    risk = (
        settings.risk_weights_blended * blended + 
        settings.risk_weights_worst_line * worst + 
        settings.risk_weights_margin_penalty * margin_pen
    )
    
    return {
        "risk": risk.quantize(Decimal("0.01")),
        "blended": blended.quantize(Decimal("0.01")),
        "worst_line": worst.quantize(Decimal("0.01")),
        "margin_penalty": margin_pen.quantize(Decimal("0.01")),
        "margin_pct": order_margin_pct.quantize(Decimal("0.01")),
        "target_margin": settings.target_margin_pct.quantize(Decimal("0.01")),
        "weights": {
            "blended": settings.risk_weights_blended,
            "worst_line": settings.risk_weights_worst_line,
            "margin_penalty": settings.risk_weights_margin_penalty
        },
        "lines": line_details,
        "violations_count": violations_count
    }
