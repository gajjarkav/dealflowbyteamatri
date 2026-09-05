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
