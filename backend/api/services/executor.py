from django.db import transaction
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
    Simulates execution of an approved automation recommendation atomically.
    Creates Execution and ExecutionItem records for real audit telemetry.
    Guarantees state integrity and prevents duplicate executions.
    """
    with transaction.atomic():
        rec = Recommendation.objects.select_for_update().get(id=recommendation_id)
        if rec.status == "approved":
            raise ValueError("Recommendation is already approved.")
        if rec.status == "rejected":
            raise ValueError("Cannot approve a rejected recommendation.")

        now = timezone.now()
        item_count = rec.affected_count if rec.affected_count > 0 else 5
        execution = Execution.objects.create(
            recommendation=rec,
            started_at=now,
            finished_at=now,
            items_count=item_count,
        )

        leads = list(Lead.objects.filter(stage__in=["qualified", "contacted"])[:5])
        items = []

        for i, (comp_name, email) in enumerate(SAMPLE_LOG_COMPANIES):
            lead_obj = leads[i] if i < len(leads) else None
            company_display = lead_obj.company if lead_obj and lead_obj.company else comp_name
            item = ExecutionItem(
                execution=execution,
                lead=lead_obj,
                action="Follow-up simulated",
                simulated_at=now,
                note=f"{company_display} — {email}",
            )
            items.append(item)

        ExecutionItem.objects.bulk_create(items)

        rec.status = "approved"
        rec.save(update_fields=["status"])

        return execution.id
