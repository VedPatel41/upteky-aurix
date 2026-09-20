import io
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status

from api.models import Lead, AnalysisRun, Recommendation, Execution, ExecutionItem
from api.services.seed import generate_seed_data
from api.services.analyzer import analyze_leads
from api.services.rules import evaluate_rules
from api.services.executor import execute_recommendation
from api.services.impact import calculate_execution_impact
from api.services.ingest import ingest_csv_file


class AuthenticationTests(APITestCase):
    """
    Tests for Signup, Login, Refresh, Me, and Logout endpoints.
    """
    def setUp(self):
        self.user = User.objects.create_user(
            username="arjun",
            email="arjun@upteky.com",
            password="SecurePassword123!",
            first_name="Arjun",
            last_name="Nair"
        )

    def test_signup_success(self):
        url = "/api/auth/signup"
        data = {
            "name": "Kavita Rao",
            "email": "kavita.rao@upteky.com",
            "password": "StrongPassword123!",
            "confirm_password": "StrongPassword123!"
        }
        resp = self.client.post(url, data, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn("tokens", resp.data)
        self.assertIn("access", resp.data["tokens"])
        self.assertEqual(resp.data["user"]["email"], "kavita.rao@upteky.com")

    def test_signup_duplicate_rejected(self):
        url = "/api/auth/signup"
        data = {
            "name": "Arjun Duplicate",
            "email": "arjun@upteky.com",
            "password": "Password123!",
            "confirm_password": "Password123!"
        }
        resp = self.client.post(url, data, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_signup_password_mismatch(self):
        url = "/api/auth/signup"
        data = {
            "name": "Mismatch Test",
            "email": "mismatch@upteky.com",
            "password": "Password123!",
            "confirm_password": "DifferentPassword!"
        }
        resp = self.client.post(url, data, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        url = "/api/auth/login"
        data = {"email": "arjun@upteky.com", "password": "SecurePassword123!"}
        resp = self.client.post(url, data, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("tokens", resp.data)
        self.assertEqual(resp.data["user"]["email"], "arjun@upteky.com")

    def test_login_invalid_password(self):
        url = "/api/auth/login"
        data = {"email": "arjun@upteky.com", "password": "WrongPassword!"}
        resp = self.client.post(url, data, format="json")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_current_user_authenticated(self):
        self.client.force_authenticate(user=self.user)
        resp = self.client.get("/api/auth/me")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["user"]["username"], "arjun")

    def test_protected_endpoint_rejects_unauthenticated(self):
        resp = self.client.post("/api/seed")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


class SeedAndAnalyzerTests(APITestCase):
    """
    Tests for Seed data creation and Pandas descriptive analyzer.
    """
    def setUp(self):
        self.user = User.objects.create_user(username="seeduser", email="seed@aurix.local", password="password")
        self.client.force_authenticate(user=self.user)

    def test_seed_crm_dataset(self):
        resp = self.client.post("/api/seed")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertGreaterEqual(resp.data["rows"], 300)
        self.assertIn("run_id", resp.data)

        # Verify run exists and belongs to user
        run = AnalysisRun.objects.get(id=resp.data["run_id"])
        self.assertEqual(run.user, self.user)
        self.assertIn("total_leads", run.metrics_json)

    def test_analyzer_descriptive_metrics(self):
        generate_seed_data(312)
        analysis = analyze_leads()

        self.assertEqual(analysis["total_leads"], 312)
        self.assertGreater(analysis["qualified_leads"], 0)
        self.assertGreater(analysis["avg_response_time_num"], 4.0)
        self.assertEqual(len(analysis["funnel"]), 5)
        self.assertIn(analysis["weakest_stage_id"], ["qual_to_quote", "quote_to_won", "lead_to_contact", "contact_to_qual"])

    def test_analyzer_empty_dataset_safety(self):
        Lead.objects.all().delete()
        analysis = analyze_leads()
        self.assertEqual(analysis["total_leads"], 0)
        self.assertEqual(analysis["avg_response_time_num"], 0.0)
        self.assertEqual(analysis["qualified_leads"], 0)


class RuleEngineTests(APITestCase):
    """
    Tests verifying deterministic logic for Rules R1, R2, and R3.
    """
    def setUp(self):
        Lead.objects.all().delete()
        self.now = timezone.now()
        self.run = AnalysisRun.objects.create(dataset_name="test_run.csv")

    def test_r1_triggers_on_slow_response(self):
        # Create qualified lead with 18 hours response lag
        Lead.objects.create(
            company="Slow Co",
            stage="qualified",
            created_at=self.now - timedelta(hours=20),
            first_contact_at=self.now - timedelta(hours=2),
            last_activity_at=self.now - timedelta(hours=1),
            value_inr=100000.0,
        )
        evaluate_rules(self.run, {})
        r1 = Recommendation.objects.filter(run=self.run, rule_code="R1").first()
        self.assertIsNotNone(r1)
        self.assertGreater(r1.metric_before, 4.0)
        self.assertEqual(r1.metric_after_target, 2.0)

    def test_r1_does_not_trigger_when_fast(self):
        # Create qualified lead with 1.5 hour response lag
        Lead.objects.create(
            company="Fast Co",
            stage="qualified",
            created_at=self.now - timedelta(hours=5),
            first_contact_at=self.now - timedelta(hours=3, minutes=30),
            last_activity_at=self.now - timedelta(hours=1),
            value_inr=100000.0,
        )
        evaluate_rules(self.run, {})
        r1 = Recommendation.objects.filter(run=self.run, rule_code="R1").first()
        self.assertIsNone(r1)

    def test_r2_triggers_on_stale_qualified(self):
        # Create 10 qualified leads: 6 active, 4 stale (>48h inactive) -> 40% stale (>15%)
        for i in range(6):
            Lead.objects.create(
                company=f"Active {i}",
                stage="qualified",
                created_at=self.now - timedelta(days=5),
                first_contact_at=self.now - timedelta(days=4),
                last_activity_at=self.now - timedelta(hours=12),
                value_inr=100000.0,
            )
        for i in range(4):
            Lead.objects.create(
                company=f"Stale {i}",
                stage="qualified",
                created_at=self.now - timedelta(days=10),
                first_contact_at=self.now - timedelta(days=9),
                last_activity_at=self.now - timedelta(hours=72),
                value_inr=100000.0,
            )
        evaluate_rules(self.run, {})
        r2 = Recommendation.objects.filter(run=self.run, rule_code="R2").first()
        self.assertIsNotNone(r2)
        self.assertEqual(r2.affected_count, 4)

    def test_r3_triggers_on_weak_funnel(self):
        # 10 leads: 8 qualified, 2 won (Qualified -> Quoted onwards is 2/10 = 20.0% < 40%)
        for i in range(8):
            Lead.objects.create(company=f"Drop {i}", stage="qualified", created_at=self.now, first_contact_at=self.now, last_activity_at=self.now)
        for i in range(2):
            Lead.objects.create(company=f"Won {i}", stage="won", created_at=self.now, first_contact_at=self.now, last_activity_at=self.now)

        evaluate_rules(self.run, {})
        r3 = Recommendation.objects.filter(run=self.run, rule_code="R3").first()
        self.assertIsNotNone(r3)
        self.assertEqual(r3.metric_before, 20.0)


class CsvUploadTests(APITestCase):
    """
    Tests for CSV file upload and validation.
    """
    def setUp(self):
        self.user = User.objects.create_user(username="csvuser", email="csv@aurix.local", password="password")
        self.client.force_authenticate(user=self.user)

    def test_valid_csv_upload(self):
        csv_data = (
            "company,contact_name,source,value_inr,stage,created_at,first_contact_at,last_activity_at,owner\n"
            "Shah Forge,Rajesh S,Inbound,210000,qualified,2026-01-10 10:00:00,2026-01-11 08:30:00,2026-01-15 11:00:00,Vikram M\n"
            "Patel Valves,Vimal P,LinkedIn,180000,quoted,2026-01-11 09:00:00,2026-01-12 06:15:00,2026-01-16 12:00:00,Pooja H\n"
        )
        file_obj = io.BytesIO(csv_data.encode("utf-8"))
        file_obj.name = "test_crm.csv"

        resp = self.client.post("/api/upload", {"file": file_obj}, format="multipart")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["rows"], 2)

    def test_missing_required_column(self):
        csv_data = "bad_col,value_inr,stage\nfoo,100,qualified\n"
        file_obj = io.BytesIO(csv_data.encode("utf-8"))
        file_obj.name = "bad_crm.csv"

        resp = self.client.post("/api/upload", {"file": file_obj}, format="multipart")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Missing required column", resp.data["detail"])

    def test_empty_csv_upload(self):
        csv_data = "company,stage\n"
        file_obj = io.BytesIO(csv_data.encode("utf-8"))
        file_obj.name = "empty_crm.csv"

        resp = self.client.post("/api/upload", {"file": file_obj}, format="multipart")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


class RecommendationAndExecutionTests(APITestCase):
    """
    Tests for recommendation approval, rejection, state guards, and impact calculation.
    """
    def setUp(self):
        self.user = User.objects.create_user(username="recuser", email="rec@aurix.local", password="password")
        self.client.force_authenticate(user=self.user)
        self.run = AnalysisRun.objects.create(user=self.user, dataset_name="audit.csv", metrics_json={"dataset_duration_days": 90.0, "average_deal_value": 150000.0, "win_rate": 0.08})
        self.rec = Recommendation.objects.create(
            run=self.run,
            rule_code="R1",
            title="Slow first response",
            severity="high",
            affected_count=50,
            status="pending",
            metric_before=18.4,
            metric_after_target=2.0
        )

    def test_approve_pending_recommendation(self):
        resp = self.client.post(f"/api/recommendations/{self.rec.id}/approve")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["status"], "approved")
        self.assertIn("execution_id", resp.data)

        # Verify DB status
        self.rec.refresh_from_db()
        self.assertEqual(self.rec.status, "approved")

        # Verify Execution and Items
        execution = Execution.objects.get(id=resp.data["execution_id"])
        self.assertEqual(execution.items.count(), 5)

    def test_double_approve_rejected_with_conflict(self):
        self.client.post(f"/api/recommendations/{self.rec.id}/approve")
        # Second approval attempt should return 409 Conflict
        resp2 = self.client.post(f"/api/recommendations/{self.rec.id}/approve")
        self.assertEqual(resp2.status_code, status.HTTP_409_CONFLICT)

    def test_reject_pending_recommendation(self):
        resp = self.client.post(f"/api/recommendations/{self.rec.id}/reject")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["status"], "rejected")

        self.rec.refresh_from_db()
        self.assertEqual(self.rec.status, "rejected")

        # Approving a rejected recommendation should fail
        resp2 = self.client.post(f"/api/recommendations/{self.rec.id}/approve")
        self.assertEqual(resp2.status_code, status.HTTP_400_BAD_REQUEST)

    def test_impact_calculation(self):
        exec_id = execute_recommendation(self.rec.id)
        impact = calculate_execution_impact(exec_id)

        self.assertIn("hours_saved_per_month", impact)
        self.assertIn("revenue_opportunity_inr", impact)
        self.assertIn("recovered_leads", impact)
        self.assertIn("disclaimer", impact)
        self.assertEqual(impact["recovered_leads"], round(50 * 0.35))
        # Formula: (50 * 12 / 60) * (30 / 90) = 10 * 0.3333 = 3.3 hours
        self.assertEqual(impact["hours_saved_per_month"], 3.3)


class UserIsolationTests(APITestCase):
    """
    Tests enforcing that User A cannot view, modify, or approve User B's resources.
    """
    def setUp(self):
        self.user_a = User.objects.create_user(username="usera", email="a@aurix.local", password="password")
        self.user_b = User.objects.create_user(username="userb", email="b@aurix.local", password="password")

        self.run_a = AnalysisRun.objects.create(user=self.user_a, dataset_name="client_a.csv")
        self.rec_a = Recommendation.objects.create(run=self.run_a, rule_code="R1", title="Rec A", status="pending")

    def test_user_b_cannot_access_user_a_metrics(self):
        self.client.force_authenticate(user=self.user_b)
        resp = self.client.get(f"/api/runs/{self.run_a.id}/metrics")
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_b_cannot_approve_user_a_recommendation(self):
        self.client.force_authenticate(user=self.user_b)
        resp = self.client.post(f"/api/recommendations/{self.rec_a.id}/approve")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
