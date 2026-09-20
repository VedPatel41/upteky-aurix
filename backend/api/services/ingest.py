import io
import pandas as pd
from datetime import datetime
from django.utils import timezone
from api.models import Lead


def ingest_csv_file(file_obj):
    """
    Ingests and validates uploaded CRM CSV file into Lead database records.
    Supports flexible column aliases from common CRM exports (HubSpot, Salesforce, Zoho, Excel).
    """
    try:
        content = file_obj.read()
        if isinstance(content, bytes):
            # Decode with fallback
            try:
                text_stream = io.StringIO(content.decode("utf-8"))
            except UnicodeDecodeError:
                text_stream = io.StringIO(content.decode("latin-1"))
        else:
            text_stream = io.StringIO(content)

        df = pd.read_csv(text_stream)
    except Exception as e:
        raise ValueError(f"Unable to parse CSV file: {str(e)}")

    if df.empty:
        raise ValueError("The uploaded CSV file contains no data rows.")

    # Lowercase column names for mapping
    col_map = {str(c).strip().lower(): c for c in df.columns}

    # Column resolver
    def find_col(aliases):
        for a in aliases:
            if a in col_map:
                return col_map[a]
        return None

    company_col = find_col(["company", "company_name", "account", "organization", "lead_name"])
    stage_col = find_col(["stage", "pipeline_stage", "status", "lead_status", "deal_stage"])
    value_col = find_col(["value_inr", "value", "deal_value", "amount", "revenue"])
    created_col = find_col(["created_at", "created_date", "created", "date_created", "lead_date"])
    first_contact_col = find_col(["first_contact_at", "contacted_at", "first_touch", "first_contact"])
    last_act_col = find_col(["last_activity_at", "last_activity", "last_updated", "updated_at"])
    contact_col = find_col(["contact_name", "contact", "name", "full_name"])
    owner_col = find_col(["owner", "sales_rep", "assigned_to", "rep"])
    source_col = find_col(["source", "lead_source", "channel"])

    if not company_col:
        raise ValueError("Missing required column for Company Name ('company' or 'company_name').")

    now = timezone.now()
    valid_stages = ["new", "contacted", "qualified", "quoted", "won", "lost"]

    Lead.objects.all().delete()
    leads_to_create = []

    for _, row in df.iterrows():
        comp = str(row[company_col]).strip()
        if not comp or comp.lower() == "nan":
            continue

        raw_stage = str(row[stage_col]).strip().lower() if stage_col and pd.notnull(row[stage_col]) else "contacted"
        stage = raw_stage if raw_stage in valid_stages else "contacted"

        try:
            val = float(row[value_col]) if value_col and pd.notnull(row[value_col]) else 120000.0
        except (ValueError, TypeError):
            val = 120000.0

        # Helper to parse dates
        def parse_date(col):
            if not col or pd.isnull(row[col]):
                return None
            val = str(row[col]).strip()
            try:
                dt = pd.to_datetime(val)
                if pd.isnull(dt):
                    return None
                if dt.tzinfo is None:
                    return timezone.make_aware(dt)
                return dt
            except Exception:
                return None

        created_dt = parse_date(created_col) or now
        first_contact_dt = parse_date(first_contact_col)
        last_act_dt = parse_date(last_act_col) or created_dt

        lead = Lead(
            company=comp,
            contact_name=str(row[contact_col]).strip() if contact_col and pd.notnull(row[contact_col]) else "Contact",
            source=str(row[source_col]).strip() if source_col and pd.notnull(row[source_col]) else "CSV Ingest",
            value_inr=val,
            stage=stage,
            created_at=created_dt,
            first_contact_at=first_contact_dt,
            last_activity_at=last_act_dt,
            owner=str(row[owner_col]).strip() if owner_col and pd.notnull(row[owner_col]) else "Unassigned",
        )
        leads_to_create.append(lead)

    if not leads_to_create:
        raise ValueError("No valid lead rows could be extracted from the uploaded CSV.")

    Lead.objects.bulk_create(leads_to_create)
    return len(leads_to_create)
