from django.contrib import admin
from .models import Lead, AnalysisRun, Recommendation, Execution, ExecutionItem


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ("id", "company", "contact_name", "stage", "value_inr", "owner", "created_at")
    list_filter = ("stage", "source")
    search_fields = ("company", "contact_name", "owner")
    ordering = ("-id",)


@admin.register(AnalysisRun)
class AnalysisRunAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "dataset_name", "created_at")
    list_filter = ("user", "created_at")
    search_fields = ("dataset_name", "user__username", "user__email")
    ordering = ("-id",)


@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = ("id", "run", "rule_code", "title", "severity", "status", "affected_count", "metric_before", "metric_after_target")
    list_filter = ("severity", "status", "rule_code")
    search_fields = ("title", "rule_code")
    ordering = ("-id",)


@admin.register(Execution)
class ExecutionAdmin(admin.ModelAdmin):
    list_display = ("id", "recommendation", "items_count", "started_at")
    list_filter = ("started_at",)
    ordering = ("-id",)


@admin.register(ExecutionItem)
class ExecutionItemAdmin(admin.ModelAdmin):
    list_display = ("id", "execution", "lead", "action", "simulated_at")
    list_filter = ("action",)
    search_fields = ("action", "note", "lead__company")
    ordering = ("-id",)
