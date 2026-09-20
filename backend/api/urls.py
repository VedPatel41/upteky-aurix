from django.urls import path
from api.views import (
    HealthCheckView,
    SignupView,
    LoginView,
    CurrentUserView,
    LogoutView,
    CustomTokenRefreshView,
    SeedView,
    UploadView,
    RunMetricsView,
    RunRecommendationsView,
    ApproveRecommendationView,
    RejectRecommendationView,
    ExecutionImpactView,
)

urlpatterns = [
    # Health
    path("health", HealthCheckView.as_view(), name="health"),
    path("health/", HealthCheckView.as_view(), name="health_slash"),

    # Authentication
    path("auth/signup", SignupView.as_view(), name="auth_signup"),
    path("auth/signup/", SignupView.as_view(), name="auth_signup_slash"),
    path("auth/login", LoginView.as_view(), name="auth_login"),
    path("auth/login/", LoginView.as_view(), name="auth_login_slash"),
    path("auth/refresh", CustomTokenRefreshView.as_view(), name="auth_refresh"),
    path("auth/refresh/", CustomTokenRefreshView.as_view(), name="auth_refresh_slash"),
    path("auth/me", CurrentUserView.as_view(), name="auth_me"),
    path("auth/me/", CurrentUserView.as_view(), name="auth_me_slash"),
    path("auth/logout", LogoutView.as_view(), name="auth_logout"),
    path("auth/logout/", LogoutView.as_view(), name="auth_logout_slash"),

    # Telemetry & Workflows
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
