from django.db import models


class Lead(models.Model):
    STAGE_CHOICES = [
        ("new", "New"),
        ("contacted", "Contacted"),
        ("qualified", "Qualified"),
        ("quoted", "Quoted"),
        ("won", "Won"),
        ("lost", "Lost"),
    ]

    company = models.CharField(max_length=255)
    contact_name = models.CharField(max_length=255, blank=True)
    source = models.CharField(max_length=100, blank=True)
    value_inr = models.FloatField(default=0.0)
    stage = models.CharField(max_length=50, choices=STAGE_CHOICES, db_index=True)
    created_at = models.DateTimeField()
    first_contact_at = models.DateTimeField(null=True, blank=True)
    last_activity_at = models.DateTimeField(null=True, blank=True)
    owner = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.company} ({self.stage})"


class AnalysisRun(models.Model):
    dataset_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    metrics_json = models.JSONField(default=dict)

    def __str__(self):
        return f"Run #{self.id} - {self.dataset_name} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"


class Recommendation(models.Model):
    SEVERITY_CHOICES = [
        ("high", "High"),
        ("medium", "Medium"),
        ("low", "Low"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    run = models.ForeignKey(AnalysisRun, on_delete=models.CASCADE, related_name="recommendations")
    rule_code = models.CharField(max_length=50)
    title = models.CharField(max_length=255)
    detail = models.TextField(blank=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    affected_count = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    metric_before = models.FloatField(default=0.0)
    metric_after_target = models.FloatField(default=0.0)
    metric_unit = models.CharField(max_length=50, default="hours")
    proposed_action = models.CharField(max_length=255)

    def __str__(self):
        return f"[{self.rule_code}] {self.title} ({self.status})"


class Execution(models.Model):
    recommendation = models.ForeignKey(Recommendation, on_delete=models.CASCADE, related_name="executions")
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    items_count = models.IntegerField(default=0)

    def __str__(self):
        return f"Execution #{self.id} for Rec #{self.recommendation_id}"


class ExecutionItem(models.Model):
    execution = models.ForeignKey(Execution, on_delete=models.CASCADE, related_name="items")
    lead = models.ForeignKey(Lead, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=255)
    simulated_at = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True)

    def __str__(self):
        return f"{self.action} ({self.execution_id})"
