import random
from datetime import datetime, timedelta
from django.utils import timezone
from api.models import Lead

INDIAN_COMPANIES = [
    ("Shah Industries", "manufacturing"),
    ("Patel Manufacturing", "manufacturing"),
    ("Aarav Pharma", "pharma"),
    ("Mehta Logistics & Supply", "logistics"),
    ("Apex Precision Tools", "industrial tools"),
    ("Kothari Electricals", "electricals"),
    ("Reliance Industrial Forgings", "manufacturing"),
    ("Baroda Valves & Flow", "industrial tools"),
    ("Vardhman Polymers", "manufacturing"),
    ("Jindal Alloy Works", "metals"),
    ("Gujarat Fine Chem", "pharma"),
    ("Sharma Transporters", "logistics"),
    ("Trivedi Engineering Works", "industrial tools"),
    ("Desai Healthcare Solutions", "pharma"),
    ("Surat Weaving Systems", "textiles"),
    ("Bansal Heavy Hardware", "industrial tools"),
    ("Saraswati Packaging", "packaging"),
    ("Navkar Auto Components", "automotive"),
    ("Zydus Allied Care", "pharma"),
    ("Adani Agro Logistics", "logistics"),
]

FIRST_NAMES = ["Rajesh", "Vimal", "Sunil", "Kunal", "Amit", "Pooja", "Vikram", "Neha", "Deepak", "Anand", "Rohan", "Suresh"]
LAST_NAMES = ["Shah", "Patel", "Mehta", "Sharma", "Kothari", "Desai", "Joshi", "Bansal", "Trivedi", "Verma"]
SOURCES = ["Inbound Web", "LinkedIn Lead Form", "Cold Outbound", "Industry Expo 2025", "Referral Partner", "Google Search"]
OWNERS = ["Vikram Malhotra", "Pooja Hegde", "Arjun Nair", "Siddharth Rao"]


def generate_seed_data(target_count=312):
    """
    Generates a realistic B2B CRM dataset for Indian SMEs with intentionally injected
    operational bottlenecks that trigger rules R1, R2, and R3.
    """
    Lead.objects.all().delete()

    now = timezone.now()
    created_leads = []

    # Distribution:
    # 312 total leads
    # 248 contacted or further (lead->contacted drop = ~20%)
    # 112 qualified (contacted->qual conversion = ~45%)
    # 54 quoted (qual->quoted drop is bottleneck: ~48% of qual, with ~58 leads stalled)
    # 22 won (quoted->won = ~40%)
    # remaining lost or new

    stages_pool = (
        ["won"] * 22 +
        ["quoted"] * 32 +
        ["qualified"] * 58 +
        ["contacted"] * 136 +
        ["new"] * 44 +
        ["lost"] * 20
    )

    random.seed(42)  # Deterministic seed for reproducible demo

    for i in range(min(target_count, len(stages_pool))):
        company_base, sector = random.choice(INDIAN_COMPANIES)
        company_name = f"{company_base} #{i+1}" if i >= len(INDIAN_COMPANIES) else company_base
        contact_name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
        stage = stages_pool[i]

        # Created within past 90 days
        days_ago = random.uniform(5, 88)
        created_at = now - timedelta(days=days_ago)

        # Problem 1 (R1): Response latency
        # If qualified, quoted, or won: 38% have severe response latency (16 to 26 hours)
        # Others have 1 to 3 hours response
        is_qualified_pipeline = stage in ["qualified", "quoted", "won"]
        
        if stage == "new":
            first_contact_at = None
        else:
            if is_qualified_pipeline and random.random() < 0.38:
                response_lag_hours = random.uniform(17.2, 19.6)
            else:
                response_lag_hours = random.uniform(1.2, 2.8)
            first_contact_at = created_at + timedelta(hours=response_lag_hours)

        # Problem 2 (R2): Stale pipeline in qualified stage
        # Stale qualified leads have last_activity_at > 3-6 days old
        if stage == "qualified" and random.random() < 0.65:
            last_activity_days_ago = random.uniform(3.5, 9.0)
        else:
            last_activity_days_ago = random.uniform(0.1, 2.2)
            
        last_activity_at = max(created_at, now - timedelta(days=last_activity_days_ago))

        # Deal value: ₹40,000 to ₹3,80,000
        deal_value = float(random.randint(40, 380) * 1000)

        lead = Lead(
            company=company_name,
            contact_name=contact_name,
            source=random.choice(SOURCES),
            value_inr=deal_value,
            stage=stage,
            created_at=created_at,
            first_contact_at=first_contact_at,
            last_activity_at=last_activity_at,
            owner=random.choice(OWNERS),
        )
        created_leads.append(lead)

    Lead.objects.bulk_create(created_leads)
    return len(created_leads)
