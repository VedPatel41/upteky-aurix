from rest_framework import serializers
from django.contrib.auth.models import User
from api.models import AnalysisRun, Recommendation, Execution, ExecutionItem, Lead


class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "name", "is_staff", "is_superuser"]

    def get_name(self, obj):
        full = obj.get_full_name()
        return full if full else obj.username


class SignupSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=6, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)

    def validate_email(self, value):
        normalized = value.strip().lower()
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError("An account with this email address already exists.")
        return normalized

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        email = validated_data["email"]
        name = validated_data["name"]
        password = validated_data["password"]

        username = email.split("@")[0]
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        parts = name.strip().split(" ", 1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ""

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )
        return user


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
    user = UserSerializer(read_only=True)
    recommendations = RecommendationSerializer(many=True, read_only=True)

    class Meta:
        model = AnalysisRun
        fields = ["id", "user", "dataset_name", "created_at", "metrics_json", "recommendations"]


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
