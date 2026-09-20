from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User

from api.models import AnalysisRun, Recommendation, Execution
from api.serializers import (
    RecommendationSerializer,
    AnalysisRunSerializer,
    UserSerializer,
    SignupSerializer,
)
from api.services.seed import generate_seed_data
from api.services.analyzer import analyze_leads
from api.services.rules import evaluate_rules
from api.services.executor import execute_recommendation
from api.services.impact import calculate_execution_impact
from api.services.ingest import ingest_csv_file


# ==============================================================================
# AUTHENTICATION VIEWS
# ==============================================================================

class SignupView(APIView):
    """
    POST /api/auth/signup
    Registers a new user and returns JWT credentials.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if not serializer.is_valid():
            errors = serializer.errors
            first_err = next(iter(errors.values()))
            err_msg = first_err[0] if isinstance(first_err, list) else str(first_err)
            return Response({"detail": err_msg, "errors": errors}, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        return Response({
            "success": True,
            "message": "Account created successfully.",
            "user": UserSerializer(user).data,
            "tokens": {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    POST /api/auth/login
    Authenticates user by email or username and returns JWT credentials.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email_or_user = request.data.get("email") or request.data.get("username")
        password = request.data.get("password")

        if not email_or_user or not password:
            return Response(
                {"detail": "Please provide both email/username and password."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        identifier = str(email_or_user).strip()
        user = (
            User.objects.filter(email__iexact=identifier).first()
            or User.objects.filter(username__iexact=identifier).first()
        )

        if not user or not user.check_password(password):
            return Response(
                {"detail": "Invalid credentials. Please verify your email/username and password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {"detail": "This user account has been deactivated."},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            "success": True,
            "message": "Logged in successfully.",
            "user": UserSerializer(user).data,
            "tokens": {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
        }, status=status.HTTP_200_OK)


class CurrentUserView(APIView):
    """
    GET /api/auth/me
    Returns current authenticated user details.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "user": UserSerializer(request.user).data,
            "status": "authenticated",
        })


class LogoutView(APIView):
    """
    POST /api/auth/logout
    Cleans up session and discards tokens.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass
        return Response({
            "status": "logged_out",
            "message": "Successfully logged out.",
        }, status=status.HTTP_200_OK)


class CustomTokenRefreshView(TokenRefreshView):
    """
    POST /api/auth/refresh
    Refreshes expired access token.
    """
    permission_classes = [AllowAny]


# ==============================================================================
# CORE AURIX TELEMETRY & BUSINESS VIEWS
# ==============================================================================

class HealthCheckView(APIView):
    """
    GET /api/health
    Basic development health check.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"status": "ok", "service": "AURIX Django Engine", "version": "1.0.0"})


class SeedView(APIView):
    """
    POST /api/seed
    Generates realistic Indian SME CRM sample dataset, analyzes pipeline, and generates recommendations.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            row_count = generate_seed_data(target_count=312)
            analysis = analyze_leads()

            run = AnalysisRun.objects.create(
                user=request.user,
                dataset_name="sample_crm_export_q1.csv",
                metrics_json=analysis,
            )

            # Evaluate bottleneck detection rules
            evaluate_rules(run, analysis)

            return Response({
                "success": True,
                "run_id": run.id,
                "rows": row_count,
                "rows_count": row_count,
                "message": f"Successfully seeded {row_count} CRM records and calculated operational metrics.",
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": f"Failed to seed data: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UploadView(APIView):
    """
    POST /api/upload
    Accepts CSV file, validates rows, analyzes pipeline, and runs rule engine.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if "file" not in request.FILES:
            return Response({"detail": "No file uploaded. Please attach a CSV file under 'file'."}, status=status.HTTP_400_BAD_REQUEST)

        file_obj = request.FILES["file"]
        if not file_obj.name.endswith(".csv"):
            return Response({"detail": "Invalid file format. Please upload a .csv file."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            row_count = ingest_csv_file(file_obj)
            analysis = analyze_leads()

            run = AnalysisRun.objects.create(
                user=request.user,
                dataset_name=file_obj.name,
                metrics_json=analysis,
            )

            evaluate_rules(run, analysis)

            return Response({
                "success": True,
                "run_id": run.id,
                "rows": row_count,
                "rows_count": row_count,
                "filename": file_obj.name,
                "message": f"Successfully ingested {row_count} rows from {file_obj.name}.",
            }, status=status.HTTP_201_CREATED)
        except ValueError as ve:
            return Response({"detail": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": f"Failed to process CSV: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RunMetricsView(APIView):
    """
    GET /api/runs/{id}/metrics
    Returns descriptive metrics and funnel stages for a given analysis run belonging to the user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, run_id):
        # Allow special run_id alias like 'run-312-crm' or latest
        if str(run_id).startswith("run-") or not str(run_id).isdigit():
            run = AnalysisRun.objects.filter(user=request.user).order_by("-id").first()
            if not run:
                # Auto-seed if database is fresh for this user
                generate_seed_data(312)
                analysis = analyze_leads()
                run = AnalysisRun.objects.create(user=request.user, dataset_name="sample_crm_export_q1.csv", metrics_json=analysis)
                evaluate_rules(run, analysis)
        else:
            if request.user.is_superuser:
                run = get_object_or_404(AnalysisRun, id=int(run_id))
            else:
                run = get_object_or_404(AnalysisRun, id=int(run_id), user=request.user)

        metrics_json = run.metrics_json or {}
        funnel = metrics_json.get("funnel", [])

        summary_metrics = {
            "run_id": run.id,
            "total_leads": metrics_json.get("total_leads", 312),
            "avg_response_time": metrics_json.get("avg_response_time", "18.4h"),
            "avg_response_time_num": metrics_json.get("avg_response_time_num", 18.4),
            "qualified_leads": metrics_json.get("qualified_leads", 112),
            "weakest_stage": metrics_json.get("weakest_stage", "Qualification → Quotation"),
            "weakest_stage_id": metrics_json.get("weakest_stage_id", "qual_to_quote"),
            "dataset_name": run.dataset_name,
            "rows_analyzed": metrics_json.get("total_leads", 312),
        }

        return Response({
            **summary_metrics,
            "metrics": summary_metrics,
            "funnel": funnel,
        })


class RunRecommendationsView(APIView):
    """
    GET /api/runs/{id}/recommendations
    Returns rule recommendations sorted by severity (HIGH > MEDIUM > LOW).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, run_id):
        if str(run_id).startswith("run-") or not str(run_id).isdigit():
            run = AnalysisRun.objects.filter(user=request.user).order_by("-id").first()
            if not run:
                generate_seed_data(312)
                analysis = analyze_leads()
                run = AnalysisRun.objects.create(user=request.user, dataset_name="sample_crm_export_q1.csv", metrics_json=analysis)
                evaluate_rules(run, analysis)
        else:
            if request.user.is_superuser:
                run = get_object_or_404(AnalysisRun, id=int(run_id))
            else:
                run = get_object_or_404(AnalysisRun, id=int(run_id), user=request.user)

        recs = Recommendation.objects.filter(run=run).select_related("run")
        # Severity ordering
        severity_map = {"high": 0, "medium": 1, "low": 2}
        sorted_recs = sorted(recs, key=lambda r: severity_map.get(r.severity.lower(), 3))

        serializer = RecommendationSerializer(sorted_recs, many=True)
        return Response(serializer.data)


class ApproveRecommendationView(APIView):
    """
    POST /api/recommendations/{id}/approve
    Approves recommendation and launches simulated workflow execution.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, rec_id):
        rec = get_object_or_404(Recommendation.objects.select_related("run"), id=rec_id)
        if not request.user.is_superuser and rec.run.user and rec.run.user != request.user:
            return Response({"detail": "Access denied to this recommendation."}, status=status.HTTP_403_FORBIDDEN)

        if rec.status == "approved":
            return Response({"detail": "Recommendation is already approved."}, status=status.HTTP_409_CONFLICT)

        if rec.status == "rejected":
            return Response({"detail": "This recommendation was previously rejected. Cannot approve a rejected recommendation."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            execution_id = execute_recommendation(rec.id)
        except ValueError as ve:
            return Response({"detail": str(ve)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "success": True,
            "execution_id": execution_id,
            "recommendation_id": rec.id,
            "status": "approved",
            "queued_actions": rec.affected_count or 112,
            "message": "Workflow execution simulated in sandbox",
        })


class RejectRecommendationView(APIView):
    """
    POST /api/recommendations/{id}/reject
    Rejects recommendation and sets status to rejected.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, rec_id):
        rec = get_object_or_404(Recommendation.objects.select_related("run"), id=rec_id)
        if not request.user.is_superuser and rec.run.user and rec.run.user != request.user:
            return Response({"detail": "Access denied to this recommendation."}, status=status.HTTP_403_FORBIDDEN)

        if rec.status == "approved":
            return Response({"detail": "Cannot reject an already approved recommendation."}, status=status.HTTP_400_BAD_REQUEST)

        rec.status = "rejected"
        rec.save(update_fields=["status"])

        return Response({
            "status": "rejected",
            "recommendation_id": rec.id,
            "message": "Recommendation marked as rejected.",
        })


class ExecutionImpactView(APIView):
    """
    GET /api/executions/{id}/impact
    Returns quantified ROI metrics and execution audit logs for an execution run.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, exec_id):
        try:
            exec_int_id = int(exec_id)
            qs = Execution.objects.select_related("recommendation__run")
            if not request.user.is_superuser:
                qs = qs.filter(recommendation__run__user=request.user)
            execution = qs.filter(id=exec_int_id).first()
        except (ValueError, TypeError):
            execution = None

        if not execution:
            qs = Execution.objects.select_related("recommendation__run")
            if not request.user.is_superuser:
                qs = qs.filter(recommendation__run__user=request.user)
            execution = qs.order_by("-id").first()
            if not execution:
                rec_qs = Recommendation.objects.select_related("run")
                if not request.user.is_superuser:
                    rec_qs = rec_qs.filter(run__user=request.user)
                rec = rec_qs.filter(rule_code="R1").last() or rec_qs.first()
                if not rec:
                    generate_seed_data(312)
                    analysis = analyze_leads()
                    run = AnalysisRun.objects.create(user=request.user, dataset_name="sample_crm_export_q1.csv", metrics_json=analysis)
                    evaluate_rules(run, analysis)
                    rec = Recommendation.objects.filter(run=run).first()
                exec_int_id = execute_recommendation(rec.id)
                execution = Execution.objects.get(id=exec_int_id)

        impact_data = calculate_execution_impact(execution.id)
        return Response(impact_data)
