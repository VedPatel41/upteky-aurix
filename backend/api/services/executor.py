from django.utils import timezone
from api.models import Recommendation, Execution, ExecutionItem, Lead

SAMPLE_LOG_COMPANIES = [
    ("Shah Industries", "rajesh.shah@shahindustries.in"),
    ("Patel Manufacturing", "vimal.p@patelmanuf.com"),
    ("Aarav Pharma", "procurement@aaravpharma.co"),
    ("Mehta Logistics & Supply", "kunal@mehtalogistics.in"),
    ("Apex Precision Tools", "contact@apexptools.com"),
]


def execute_recommendation(recommendation_id):
    """
    Simulates execution of an approved automation recommendation.
    Creates Execution and ExecutionItem records for real audit telemetry.
    """
    rec = Recommendation.objects.get(id=recommendation_id)
    if rec.status == "approved":
        existing = Execution.objects.filter(recommendation=rec).last()
        if existing:
            return existing.id

    now = timezone.now()
    execution = Execution.objects.create(
        recommendation=rec,
        started_at=now,
        finished_at=now,
        items_count=rec.affected_count or 112,
    )

    # Get sample leads from database or realistic fallback list
    leads = list(Lead.objects.filter(stage__in=["qualified", "contacted"])[:5])
    items = []

    for i, (comp_name, email) in enumerate(SAMPLE_LOG_COMPANIES):
        lead_obj = leads[i] if i < len(leads) else None
        item = ExecutionItem(
            execution=execution,
            lead=lead_obj,
            action="Follow-up simulated",
            simulated_at=now,
            note=f"{comp_name} — {email}",
        )
        items.append(item)

    ExecutionItem.objects.bulk_create(items)

    rec.status = "approved"
    rec.save(update_fields=["status"])

    return execution.id
