from django.contrib import admin
from .models import Lead, AnalysisRun, Recommendation, Execution, ExecutionItem


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ("id", "company", "contact_name", "stage", "value_inr", "created_at", "first_contact_at")
    list_filter = ("stage", "source")
    search_fields = ("company", "contact_name", "owner")


@admin.register(AnalysisRun)
class AnalysisRunAdmin(admin.ModelAdmin):
    list_display = ("id", "dataset_name", "created_at")
    search_fields = ("dataset_name",)


@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = ("id", "rule_code", "title", "severity", "status", "affected_count", "metric_before", "metric_after_target")
    list_filter = ("severity", "status", "rule_code")


@admin.register(Execution)
class ExecutionAdmin(admin.ModelAdmin):
    list_display = ("id", "recommendation", "started_at", "items_count")


@admin.register(ExecutionItem)
class ExecutionItemAdmin(admin.ModelAdmin):
    list_display = ("id", "execution", "lead", "action", "simulated_at")
    search_fields = ("action", "note")
