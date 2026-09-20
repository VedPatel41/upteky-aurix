from rest_framework import serializers
from api.models import AnalysisRun, Recommendation, Execution, ExecutionItem, Lead


class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = ["id", "company", "contact_name", "source", "value_inr", "stage", "created_at", "first_contact_at", "last_activity_at", "owner"]


class RecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recommendation
        fields = [
            "id",
            "rule_code",
            "title",
            "detail",
            "severity",
            "affected_count",
            "status",
            "metric_before",
            "metric_after_target",
            "metric_unit",
            "proposed_action",
        ]


class AnalysisRunSerializer(serializers.ModelSerializer):
    recommendations = RecommendationSerializer(many=True, read_only=True)

    class Meta:
        model = AnalysisRun
        fields = ["id", "dataset_name", "created_at", "metrics_json", "recommendations"]


class ExecutionItemSerializer(serializers.ModelSerializer):
    company = serializers.CharField(source="lead.company", read_only=True)

    class Meta:
        model = ExecutionItem
        fields = ["id", "action", "company", "simulated_at", "note"]


class ExecutionSerializer(serializers.ModelSerializer):
    items = ExecutionItemSerializer(many=True, read_only=True)

    class Meta:
        model = Execution
        fields = ["id", "recommendation", "started_at", "finished_at", "items_count", "items"]
