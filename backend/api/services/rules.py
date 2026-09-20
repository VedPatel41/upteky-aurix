from datetime import timedelta
from django.utils import timezone
from api.models import Lead, Recommendation


def evaluate_rules(run, analysis_results):
    """
    Evaluates the 3 deterministic bottleneck rules based strictly on dataset calculations:
    - R1: Slow first response (mean lag > 4h for contacted/qualified leads)
    - R2: Stale qualified pipeline (stale qualified leads > 15% of qualified)
    - R3: Funnel drop-off (weakest consecutive stage conversion < 40%)
    """
    leads = list(Lead.objects.all())
    recommendations = []
    now = timezone.now()

    if not leads:
        return Recommendation.objects.none()

    # -------------------------------------------------------------
    # Rule 1 (R1) — Slow First Response
    # -------------------------------------------------------------
    # Calculate: lag_hours = mean(first_contact_at - created_at) for qualified / contacted leads
    relevant_stages = ["contacted", "qualified", "quoted", "won"]
    contacted_leads = [l for l in leads if l.stage in relevant_stages and l.first_contact_at and l.created_at]

    if contacted_leads:
        delayed_leads = [
            l for l in contacted_leads
            if (l.first_contact_at - l.created_at).total_seconds() > (4.0 * 3600.0)
        ]
        delayed_count = len(delayed_leads)

        if delayed_leads:
            avg_lag = sum(
                (l.first_contact_at - l.created_at).total_seconds() / 3600.0 for l in delayed_leads
            ) / delayed_count
        else:
            avg_lag = sum(
                (l.first_contact_at - l.created_at).total_seconds() / 3600.0 for l in contacted_leads
            ) / len(contacted_leads)

        avg_lag = round(avg_lag, 1)

        if avg_lag > 4.0:
            severity = "high" if avg_lag > 12.0 else "medium"
            rec_r1 = Recommendation(
                run=run,
                rule_code="R1",
                title=f"Qualified leads ka first response {avg_lag}h lag raha hai",
                detail=f"{delayed_count} leads me first contact 4 ghante ke baad hua.",
                severity=severity,
                affected_count=delayed_count if delayed_count > 0 else 1,
                status="pending",
                metric_before=avg_lag,
                metric_after_target=2.0,
                metric_unit="hours",
                proposed_action="Auto follow-up trigger after 2 hours",
            )
            recommendations.append(rec_r1)

    # -------------------------------------------------------------
    # Rule 2 (R2) — Stale Qualified Pipeline
    # -------------------------------------------------------------
    # Find leads: stage == qualified AND now - last_activity_at > 48h
    strictly_qualified = [l for l in leads if l.stage == "qualified"]
    stale_qualified = [
        l for l in strictly_qualified
        if l.last_activity_at and (now - l.last_activity_at) > timedelta(hours=48)
    ]
    stale_count = len(stale_qualified)
    total_qualified = len(strictly_qualified)

    if total_qualified > 0:
        stale_ratio = stale_count / total_qualified
        if stale_ratio > 0.15:
            # Average inactivity in days
            avg_days_stale = round(
                sum((now - l.last_activity_at).total_seconds() / 86400.0 for l in stale_qualified) / stale_count,
                1
            ) if stale_count else 3.0

            rec_r2 = Recommendation(
                run=run,
                rule_code="R2",
                title=f"Stale pipeline: {stale_count} qualified leads inactive for >48h",
                detail=f"{stale_count} qualified leads par quotation send hone ke baad 48 ghante se koi activity nahi hui.",
                severity="medium" if stale_ratio <= 0.4 else "high",
                affected_count=stale_count,
                status="pending",
                metric_before=avg_days_stale,
                metric_after_target=1.0,
                metric_unit="days",
                proposed_action="Auto re-engagement sequence on day 3",
            )
            recommendations.append(rec_r2)

    # -------------------------------------------------------------
    # Rule 3 (R3) — Funnel Drop-off
    # -------------------------------------------------------------
    # Consecutive stage conversions:
    # new -> contacted -> qualified -> quoted -> won
    cnt_new_onwards = len(leads)
    cnt_contacted_onwards = len([l for l in leads if l.stage in ["contacted", "qualified", "quoted", "won"]])
    cnt_qualified_onwards = len([l for l in leads if l.stage in ["qualified", "quoted", "won"]])
    cnt_quoted_onwards = len([l for l in leads if l.stage in ["quoted", "won"]])
    cnt_won_onwards = len([l for l in leads if l.stage == "won"])

    transitions = [
        (
            "New → Contacted",
            cnt_contacted_onwards / cnt_new_onwards if cnt_new_onwards else 1.0,
            cnt_new_onwards - cnt_contacted_onwards
        ),
        (
            "Contacted → Qualified",
            cnt_qualified_onwards / cnt_contacted_onwards if cnt_contacted_onwards else 1.0,
            cnt_contacted_onwards - cnt_qualified_onwards
        ),
        (
            "Qualified → Quoted",
            cnt_quoted_onwards / cnt_qualified_onwards if cnt_qualified_onwards else 1.0,
            cnt_qualified_onwards - cnt_quoted_onwards
        ),
        (
            "Quoted → Won",
            cnt_won_onwards / cnt_quoted_onwards if cnt_quoted_onwards else 1.0,
            cnt_quoted_onwards - cnt_won_onwards
        ),
    ]

    # Find weakest conversion
    sorted_transitions = sorted(transitions, key=lambda t: t[1])
    weakest_name, weakest_rate, dropped_count = sorted_transitions[0]

    if weakest_rate < 0.40:
        conv_percent = round(weakest_rate * 100.0, 1)
        rec_r3 = Recommendation(
            run=run,
            rule_code="R3",
            title=f"{weakest_name} conversion drop-off at {conv_percent}%",
            detail=f"{dropped_count} leads dropped out at {weakest_name} stage (industry benchmark is >40%).",
            severity="medium" if weakest_rate > 0.20 else "high",
            affected_count=dropped_count if dropped_count > 0 else 1,
            status="pending",
            metric_before=conv_percent,
            metric_after_target=50.0,
            metric_unit="%",
            proposed_action=f"Auto quotation reminder + owner alert at {weakest_name} stage",
        )
        recommendations.append(rec_r3)

    # Sort severity: HIGH > MEDIUM > LOW
    severity_order = {"high": 0, "medium": 1, "low": 2}
    recommendations.sort(key=lambda r: severity_order.get(r.severity, 3))

    Recommendation.objects.bulk_create(recommendations)
    return Recommendation.objects.filter(run=run).order_by("id")
