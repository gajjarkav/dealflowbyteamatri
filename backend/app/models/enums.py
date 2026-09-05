import enum

class RoleEnum(str, enum.Enum):
    admin = "admin"
    sales_manager = "sales_manager"
    finance = "finance"
    sales_rep = "sales_rep"
    customer = "customer"

class TierEnum(str, enum.Enum):
    bronze = "bronze"
    silver = "silver"
    gold = "gold"

class PurposeEnum(str, enum.Enum):
    signup_verify = "signup_verify"
    login_2fa = "login_2fa"
    password_reset = "password_reset"
    invite_set_password = "invite_set_password"
    magic_link = "magic_link"

class IntervalEnum(str, enum.Enum):
    monthly = "monthly"
    quarterly = "quarterly"
    yearly = "yearly"

class ProrationRuleEnum(str, enum.Enum):
    daily = "daily"
    none = "none"
    full_period = "full_period"

class CancellationRuleEnum(str, enum.Enum):
    no_refund = "no_refund"
    prorated_credit = "prorated_credit"
    full_refund_within_days = "full_refund_within_days"

class MovementReasonEnum(str, enum.Enum):
    adjustment = "adjustment"
    sale = "sale"
    ret = "return"
    receive = "receive"

class QuotationStatus(str, enum.Enum):
    draft = "draft"
    pending_approval = "pending_approval"
    approved = "approved"
    sent = "sent"
    under_negotiation = "under_negotiation"
    confirmed = "confirmed"
    in_fulfillment = "in_fulfillment"
    invoiced = "invoiced"
    paid = "paid"
    rejected = "rejected"
    revision_requested = "revision_requested"
    cancelled = "cancelled"

class ApprovalStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    returned = "returned"

class ApprovalTrigger(str, enum.Enum):
    rep_confirm = "rep_confirm"
    portal_counter = "portal_counter"
    edit_after_approval = "edit_after_approval"

class EventType(str, enum.Enum):
    created = "created"
    line_added = "line_added"
    line_updated = "line_updated"
    line_removed = "line_removed"
    discount_changed = "discount_changed"
    confirmed = "confirmed"
    approval_requested = "approval_requested"
    step_approved = "step_approved"
    step_rejected = "step_rejected"
    step_returned = "step_returned"
    auto_approved = "auto_approved"
    upsell_added = "upsell_added"
    upsell_dismissed = "upsell_dismissed"
    status_changed = "status_changed"
    note = "note"
