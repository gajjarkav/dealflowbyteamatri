from decimal import Decimal
import decimal

TWO_PLACES = Decimal("0.01")

def _q(value: Decimal) -> Decimal:
    """Quantize to 2 decimal places."""
    return Decimal(value).quantize(TWO_PLACES, rounding=decimal.ROUND_HALF_UP)

def compute_line(line) -> None:
    """
    Computes and mutates a QuotationLine's totals in-place.
    """
    qty = Decimal(line.qty)
    unit_price = Decimal(line.unit_price)
    discount_pct = Decimal(line.discount_pct or 0)
    tax_pct = Decimal(line.tax_pct or 0)

    # Base line subtotal
    line.line_subtotal = _q(qty * unit_price)
    
    # Line discount
    line.line_discount = _q(line.line_subtotal * (discount_pct / Decimal("100")))
    
    # Net before tax
    net_before_tax = line.line_subtotal - line.line_discount
    
    # Line tax
    line.line_tax = _q(net_before_tax * (tax_pct / Decimal("100")))
    
    # Final total
    line.line_total = net_before_tax + line.line_tax

def recompute(quotation) -> None:
    """
    Computes and mutates a Quotation's totals in-place based on its lines.
    Order-level discount stacks on top of line-level discounts.
    """
    subtotal = Decimal("0")
    discount_total = Decimal("0")
    tax_total = Decimal("0")
    total = Decimal("0")
    cost_total = Decimal("0")
    
    # Sum up line values
    for line in quotation.lines:
        compute_line(line)
        subtotal += line.line_subtotal
        discount_total += line.line_discount
        tax_total += line.line_tax
        total += line.line_total
        cost_total += _q(Decimal(line.qty) * Decimal(line.cost_price))
        
    # Apply order-level discount
    order_discount_pct = Decimal(quotation.order_discount_pct or 0)
    
    if order_discount_pct > 0:
        # Order discount applies to the net subtotal (after line discounts)
        net_subtotal = subtotal - discount_total
        order_discount_amt = _q(net_subtotal * (order_discount_pct / Decimal("100")))
        
        # Increase the total discount
        discount_total += order_discount_amt
        
        # We need to re-calculate taxes since the taxable amount changed.
        # To do this accurately, we distribute the order discount proportionally 
        # across all lines, but for this simpler implementation, we can just 
        # apply the order discount to the total taxable amount.
        
        # Simpler approach: calculate effective tax rate or recalculate total tax
        # Total tax = sum of (line_net * (1 - order_discount_pct) * line_tax_pct)
        new_tax_total = Decimal("0")
        for line in quotation.lines:
            line_net = line.line_subtotal - line.line_discount
            line_net_after_order_disc = line_net * (Decimal("1") - order_discount_pct / Decimal("100"))
            new_tax_total += _q(line_net_after_order_disc * (Decimal(line.tax_pct) / Decimal("100")))
            
        tax_total = new_tax_total
        total = (subtotal - discount_total) + tax_total

    quotation.subtotal = _q(subtotal)
    quotation.discount_total = _q(discount_total)
    quotation.tax_total = _q(tax_total)
    quotation.total = _q(total)
    quotation.cost_total = _q(cost_total)
    
    # Margin calculation: (total_before_tax - cost_total) / total_before_tax * 100
    total_before_tax = quotation.subtotal - quotation.discount_total
    if total_before_tax > 0:
        margin = ((total_before_tax - quotation.cost_total) / total_before_tax) * Decimal("100")
        quotation.margin_pct = _q(margin)
    else:
        quotation.margin_pct = Decimal("0.00")
