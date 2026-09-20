from django.urls import path
from api.views import (
    HealthCheckView,
    SeedView,
    UploadView,
    RunMetricsView,
    RunRecommendationsView,
    ApproveRecommendationView,
    RejectRecommendationView,
    ExecutionImpactView,
)

urlpatterns = [
    path("health", HealthCheckView.as_view(), name="health"),
    path("health/", HealthCheckView.as_view(), name="health_slash"),
    path("seed", SeedView.as_view(), name="seed"),
    path("seed/", SeedView.as_view(), name="seed_slash"),
    path("upload", UploadView.as_view(), name="upload"),
    path("upload/", UploadView.as_view(), name="upload_slash"),
    path("runs/<str:run_id>/metrics", RunMetricsView.as_view(), name="run_metrics"),
    path("runs/<str:run_id>/recommendations", RunRecommendationsView.as_view(), name="run_recommendations"),
    path("recommendations/<int:rec_id>/approve", ApproveRecommendationView.as_view(), name="approve_recommendation"),
    path("recommendations/<int:rec_id>/reject", RejectRecommendationView.as_view(), name="reject_recommendation"),
    path("executions/<str:exec_id>/impact", ExecutionImpactView.as_view(), name="execution_impact"),
]
