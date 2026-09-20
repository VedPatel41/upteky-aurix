from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from api.models import AnalysisRun, Recommendation, Execution
from api.serializers import RecommendationSerializer, AnalysisRunSerializer
from api.services.seed import generate_seed_data
from api.services.analyzer import analyze_leads
from api.services.rules import evaluate_rules
from api.services.executor import execute_recommendation
from api.services.impact import calculate_execution_impact
from api.services.ingest import ingest_csv_file


class HealthCheckView(APIView):
    """
    GET /api/health
    Basic development health check.
    """
    def get(self, request):
        return Response({"status": "ok", "service": "AURIX Django Engine", "version": "1.0.0"})


class SeedView(APIView):
    """
    POST /api/seed
    Generates realistic Indian SME CRM sample dataset, analyzes pipeline, and generates recommendations.
    """
    def post(self, request):
        try:
            row_count = generate_seed_data(target_count=312)
            analysis = analyze_leads()

            run = AnalysisRun.objects.create(
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
    Returns descriptive metrics and funnel stages for a given analysis run.
    """
    def get(self, request, run_id):
        # Allow special run_id alias like 'run-312-crm' or latest
        if str(run_id).startswith("run-") or not str(run_id).isdigit():
            run = AnalysisRun.objects.order_by("-id").first()
            if not run:
                # Auto-seed if database is fresh
                generate_seed_data(312)
                analysis = analyze_leads()
                run = AnalysisRun.objects.create(dataset_name="sample_crm_export_q1.csv", metrics_json=analysis)
                evaluate_rules(run, analysis)
        else:
            run = get_object_or_404(AnalysisRun, id=int(run_id))

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
    def get(self, request, run_id):
        if str(run_id).startswith("run-") or not str(run_id).isdigit():
            run = AnalysisRun.objects.order_by("-id").first()
            if not run:
                generate_seed_data(312)
                analysis = analyze_leads()
                run = AnalysisRun.objects.create(dataset_name="sample_crm_export_q1.csv", metrics_json=analysis)
                evaluate_rules(run, analysis)
        else:
            run = get_object_or_404(AnalysisRun, id=int(run_id))

        recs = Recommendation.objects.filter(run=run)
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
    def post(self, request, rec_id):
        rec = get_object_or_404(Recommendation, id=rec_id)
        if rec.status == "rejected":
            return Response({"detail": "This recommendation was previously rejected. Please reconsider it first."}, status=status.HTTP_400_BAD_REQUEST)

        execution_id = execute_recommendation(rec.id)

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
    def post(self, request, rec_id):
        rec = get_object_or_404(Recommendation, id=rec_id)
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
    def get(self, request, exec_id):
        try:
            exec_int_id = int(exec_id)
            execution = Execution.objects.filter(id=exec_int_id).first()
        except (ValueError, TypeError):
            execution = None

        if not execution:
            execution = Execution.objects.order_by("-id").first()
            if not execution:
                # Return default calculated impact based on latest recommendation
                rec = Recommendation.objects.filter(rule_code="R1").last() or Recommendation.objects.first()
                if not rec:
                    generate_seed_data(312)
                    analysis = analyze_leads()
                    run = AnalysisRun.objects.create(dataset_name="sample_crm_export_q1.csv", metrics_json=analysis)
                    evaluate_rules(run, analysis)
                    rec = Recommendation.objects.filter(run=run).first()
                exec_int_id = execute_recommendation(rec.id)
                execution = Execution.objects.get(id=exec_int_id)

        impact_data = calculate_execution_impact(execution.id)
        return Response(impact_data)
