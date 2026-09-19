"""ECHO Dataset Ingestion Service.

Parses and validates the actual ECHO synthetic dataset (ECHO_Synthetic_Dataset_550_Listings.xlsx),
joining Core_Data and Enrichment_Data sheets and performing idempotent ingestion
into the ECHO PostgreSQL / SQLite persistence layers via the repository layer.
"""

import os
import time
from typing import Any, Dict, List, Optional
import pandas as pd
from sqlalchemy.orm import Session

from backend.app.database.connection import SessionLocal
from backend.app.services.repository import echo_repository


DEFAULT_DATASET_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "data",
    "ECHO_Synthetic_Dataset_550_Listings.xlsx",
)


class DatasetIngestionService:
    """Service handling multi-sheet workbook ingestion, schema validation, and persistence."""

    def __init__(self, repository=None):
        self.repo = repository or echo_repository

    def inspect_dataset(self, file_path: Optional[str] = None) -> Dict[str, Any]:
        """Inspect dataset metadata, sheets, and summary statistics without ingesting."""
        path = file_path or DEFAULT_DATASET_PATH
        if not os.path.exists(path):
            raise FileNotFoundError(f"ECHO dataset file not found at: {path}")

        xls = pd.ExcelFile(path)
        sheet_summaries = {}

        for sheet in xls.sheet_names:
            df = pd.read_excel(xls, sheet_name=sheet)
            sheet_summaries[sheet] = {
                "rows": len(df),
                "columns": len(df.columns),
                "column_names": list(df.columns),
                "missing_values": int(df.isnull().sum().sum()),
            }

        return {
            "file_path": path,
            "sheets": xls.sheet_names,
            "summaries": sheet_summaries,
        }

    def ingest_dataset(
        self,
        file_path: Optional[str] = None,
        limit: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Perform idempotent ingestion of the 550 synthetic listing records."""
        start_time = time.time()
        path = file_path or DEFAULT_DATASET_PATH
        if not os.path.exists(path):
            raise FileNotFoundError(f"ECHO dataset file not found at: {path}")

        xls = pd.ExcelFile(path)
        core_df = pd.read_excel(xls, sheet_name="Core_Data")
        enrich_df = pd.read_excel(xls, sheet_name="Enrichment_Data")

        # Merge on Listing_ID
        merged = pd.merge(core_df, enrich_df, on="Listing_ID", how="inner", suffixes=("", "_enrich"))

        if limit:
            merged = merged.head(limit)

        total_rows = len(merged)
        inserted_properties = 0
        inserted_sources = 0
        inserted_documents = 0
        inserted_evidence = 0
        inserted_signals = 0
        inserted_analyses = 0
        inserted_risks = 0
        inserted_investigations = 0
        errors: List[str] = []

        db: Session = SessionLocal()
        try:
            for idx, row in merged.iterrows():
                try:
                    listing_id = str(row["Listing_ID"]).strip()
                    company = str(row["Company"]).strip()
                    sector = str(row["Sector"]).strip()
                    region = str(row["Region"]).strip()
                    doc_type = str(row["Document_Type"]).strip()
                    reporting_year = int(row["Reporting_Year"])
                    topic = str(row["Topic"]).strip()
                    signal_type = str(row["Signal_Type"]).strip()
                    fin_relevance = str(row["Financial_Relevance"]).strip()
                    status = str(row["Status"]).strip()
                    page_count = int(row["Document_Page_Count"])
                    change_magnitude = str(row["Disclosure_Change_Magnitude"]).strip()
                    prev_quant = str(row["Previous_Quantitative"]).strip()
                    curr_quant = str(row["Current_Quantitative"]).strip()
                    contradiction = str(row["Contradiction_Type"]).strip()
                    source_tier = str(row["Source_Tier"]).strip()
                    evidence_count = int(row["Evidence_Count"])
                    confidence = float(row["Confidence"])
                    exposure_prob = str(row["Exposure_Probability"]).strip()
                    exposure_usd_m = float(row["Exposure_Value_USD_M"])

                    exposure_channel = str(row.get("Exposure_Channel", "")).strip()
                    prev_disc_present = str(row.get("Previous_Disclosure_Present", "")).strip()
                    curr_disc_present = str(row.get("Current_Disclosure_Present", "")).strip()
                    evd_available = str(row.get("Evidence_Available", "")).strip()
                    evd_strength = str(row.get("Evidence_Strength", "")).strip()
                    pot_exposure_usd_m = float(row.get("Potential_Exposure_Value_USD_M", exposure_usd_m))
                    ref_metric_usd_m = float(row.get("Reference_Metric_USD_M", 100.0))
                    materiality = str(row.get("Materiality_Result", "Unknown")).strip()
                    temporal = str(row.get("Temporal_Association", "")).strip()
                    priority = str(row.get("Investigation_Priority", "Medium")).strip()

                    # Preserve the complete 31-field source record (Core_Data + Enrichment_Data)
                    raw_attrs = {
                        # Core_Data (20 fields)
                        "Listing_ID": listing_id,
                        "Company": company,
                        "Sector": sector,
                        "Region": region,
                        "Document_Type": doc_type,
                        "Reporting_Year": reporting_year,
                        "Topic": topic,
                        "Signal_Type": signal_type,
                        "Financial_Relevance": fin_relevance,
                        "Status": status,
                        "Document_Page_Count": page_count,
                        "Disclosure_Change_Magnitude": change_magnitude,
                        "Previous_Quantitative": prev_quant,
                        "Current_Quantitative": curr_quant,
                        "Contradiction_Type": contradiction,
                        "Source_Tier": source_tier,
                        "Evidence_Count": evidence_count,
                        "Confidence": confidence,
                        "Exposure_Probability": exposure_prob,
                        "Exposure_Value_USD_M": exposure_usd_m,
                        # Enrichment_Data (11 fields, including join key)
                        "Enrichment_Listing_ID": str(row.get("Listing_ID_enrich", listing_id)).strip(),
                        "Exposure_Channel": exposure_channel,
                        "Previous_Disclosure_Present": prev_disc_present,
                        "Current_Disclosure_Present": curr_disc_present,
                        "Evidence_Available": evd_available,
                        "Evidence_Strength": evd_strength,
                        "Potential_Exposure_Value_USD_M": pot_exposure_usd_m,
                        "Reference_Metric_USD_M": ref_metric_usd_m,
                        "Materiality_Result": materiality,
                        "Temporal_Association": None if pd.isna(row.get("Temporal_Association")) or temporal == "nan" else temporal,
                        "Investigation_Priority": priority,
                    }

                    # 1. Upsert Canonical Investigated Entity (Corporate Disclosure Entity)
                    # Semantically valid mapping: do NOT misuse or fabricate real-estate fields
                    prop_data = {
                        "property_id": listing_id,
                        "canonical_name": company,
                        "entity_type": "CORPORATE",
                        "company": company,
                        "sector": sector,
                        "region": region,
                        # Physical real-estate fields are strictly NULL for corporate disclosure entities
                        "property_type": None,
                        "developer": None,
                        "city": None,
                        "locality": None,
                        "price": None,
                        "price_per_sqft": None,
                        "area": None,
                        "bedrooms": None,
                        "confidence": confidence,
                        "attributes": raw_attrs,
                    }
                    self.repo.upsert_property(prop_data, session=db)
                    inserted_properties += 1


                    # 2. Upsert Source
                    src_id = f"SRC-{listing_id}"
                    src_data = {
                        "source_id": src_id,
                        "source_name": f"{company} {doc_type} ({reporting_year})",
                        "source_type": doc_type,
                        "source_url": f"https://disclosures.echo.internal/{listing_id.lower()}/{reporting_year}/{doc_type.lower().replace(' ', '_')}",
                        "content_type": "application/pdf",
                        "raw_reference": f"Tier: {source_tier}, Pages: {page_count}",
                        "collection_status": "SUCCESS",
                        "metadata": {
                            "source_tier": source_tier,
                            "page_count": page_count,
                            "reporting_year": reporting_year,
                        },
                    }
                    self.repo.upsert_source(src_data, session=db)
                    inserted_sources += 1

                    # 3. Upsert Document
                    doc_id = f"DOC-{listing_id}"
                    doc_data = {
                        "document_id": doc_id,
                        "source_id": src_id,
                        "format": "PDF",
                        "title": f"{company} {reporting_year} Disclosure: {topic}",
                        "text_content": (
                            f"Disclosed section for {company} regarding {topic}. "
                            f"Signal observed: {signal_type}. Magnitude: {change_magnitude}. "
                            f"Previous quantitative disclosure: {prev_quant}. "
                            f"Current quantitative disclosure: {curr_quant}."
                        ),
                        "metadata": {"topic": topic, "pages": page_count},
                    }
                    self.repo.upsert_document(doc_data, session=db)
                    inserted_documents += 1

                    # 4. Upsert Evidence
                    evd_id = f"EVD-{listing_id}"
                    evd_data = {
                        "evidence_id": evd_id,
                        "source_id": src_id,
                        "document_id": doc_id,
                        "field_name": topic,
                        "extracted_value": {
                            "change_magnitude": change_magnitude,
                            "contradiction": contradiction,
                            "evidence_strength": evd_strength,
                            "evidence_available": evd_available,
                            "temporal_association": temporal,
                        },
                        "context_snippet": (
                            f"{company} disclosed topic '{topic}' in {reporting_year}. "
                            f"Contradiction type: {contradiction}."
                        ),
                        "confidence": confidence,
                        "metadata": {
                            "evidence_count": evidence_count,
                            "source_tier": source_tier,
                        },
                    }
                    self.repo.upsert_evidence(evd_data, session=db)
                    inserted_evidence += 1

                    # 5. Upsert Signal
                    severity = "HIGH" if fin_relevance == "High" else ("MEDIUM" if fin_relevance == "Medium" else "LOW")
                    importance = 8.5 if fin_relevance == "High" else (5.5 if fin_relevance == "Medium" else 3.0)
                    sig_id = f"SIG-{listing_id}"
                    sig_data = {
                        "signal_id": sig_id,
                        "signal_type": signal_type,
                        "entity_id": listing_id,
                        "severity": severity,
                        "importance": importance,
                        "description": f"Signal detected for {company}: {signal_type} in {topic} with {change_magnitude.lower()} magnitude of change.",
                        "source_reference": src_id,
                        "evidence_reference": evd_id,
                        "confidence": confidence,
                        "status": status,
                        "metadata": {
                            "topic": topic,
                            "contradiction_type": contradiction,
                            "change_magnitude": change_magnitude,
                        },
                    }
                    self.repo.upsert_signal(sig_data, session=db)
                    inserted_signals += 1

                    # 6. Upsert Analysis (ERA)
                    ana_id = f"ANA-{listing_id}"
                    exposure_pct = round((pot_exposure_usd_m / ref_metric_usd_m) * 100, 2) if ref_metric_usd_m > 0 else 0.0
                    ana_data = {
                        "analysis_id": ana_id,
                        "entity_id": listing_id,
                        "status": "COMPLETED",
                        "confidence": confidence,
                        "metrics": {
                            "financial_relevance": fin_relevance,
                            "exposure_channel": exposure_channel,
                            "potential_exposure_value_usd_m": pot_exposure_usd_m,
                            "reference_metric_usd_m": ref_metric_usd_m,
                            "materiality_result": materiality,
                            "exposure_percentage_of_ref": exposure_pct,
                        },
                    }
                    self.repo.upsert_analysis(ana_data, session=db)
                    inserted_analyses += 1

                    # 7. Upsert Risk Assessment (RSA)
                    risk_id = f"RSA-{listing_id}"
                    risk_data = {
                        "assessment_id": risk_id,
                        "entity_id": listing_id,
                        "overall_rating": exposure_prob,
                        "overall_confidence": confidence,
                        "status": "COMPLETED",
                        "factors_payload": [
                            {
                                "factor": topic,
                                "probability": exposure_prob,
                                "exposure_value_usd_m": exposure_usd_m,
                                "channel": exposure_channel,
                                "materiality": materiality,
                            }
                        ],
                        "primary_concerns": [
                            f"{signal_type} on {topic} with potential exposure of ${exposure_usd_m}M."
                        ],
                    }
                    self.repo.upsert_risk_assessment(risk_data, session=db)
                    inserted_risks += 1

                    # 8. Upsert Investigation Record
                    inv_id = f"INV-{listing_id}"
                    inv_data = {
                        "investigation_id": inv_id,
                        "entity_id": listing_id,
                        "topic": topic,
                        "status": status,
                        "priority": priority,
                        "materiality": materiality,
                        "exposure_value_usd_m": exposure_usd_m,
                        "findings_summary": (
                            f"Investigation on {company} [{sector}] regarding {topic}. "
                            f"Signal: {signal_type} ({contradiction}). "
                            f"Materiality: {materiality}. Priority: {priority}."
                        ),
                        "metadata": {
                            "reporting_year": reporting_year,
                            "region": region,
                            "document_type": doc_type,
                        },
                    }
                    self.repo.upsert_investigation(inv_data, session=db)
                    inserted_investigations += 1

                except Exception as row_exc:
                    errors.append(f"Row {idx} ({row.get('Listing_ID')}): {str(row_exc)}")

            db.commit()
        except Exception as batch_exc:
            db.rollback()
            errors.append(f"Fatal batch error: {str(batch_exc)}")
        finally:
            db.close()

        duration_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "status": "SUCCESS" if not errors else "PARTIAL_SUCCESS",
            "total_rows_processed": total_rows,
            "inserted_properties": inserted_properties,
            "inserted_sources": inserted_sources,
            "inserted_documents": inserted_documents,
            "inserted_evidence": inserted_evidence,
            "inserted_signals": inserted_signals,
            "inserted_analyses": inserted_analyses,
            "inserted_risks": inserted_risks,
            "inserted_investigations": inserted_investigations,
            "errors": errors,
            "duration_ms": duration_ms,
        }


dataset_service = DatasetIngestionService()
