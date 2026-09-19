"""ECHO Property Schemas."""

from datetime import date, datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from backend.app.schemas.evidence import EvidenceRecord, ProvenanceRecord
from backend.app.utils.timestamps import utc_now


class PropertyIdentity(BaseModel):
    """Identity attributes of real-estate asset."""
    property_name: Optional[str] = None
    project_name: Optional[str] = None
    property_type: Optional[str] = None  # e.g., Apartment, Villa, Plot, Commercial
    developer: Optional[str] = None
    builder: Optional[str] = None


class PropertyLocation(BaseModel):
    """Geographic and address coordinates."""
    address: Optional[str] = None
    locality: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: str = "India"
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class PropertyFinancials(BaseModel):
    """Financial parameters and pricing."""
    price: Optional[float] = None
    minimum_price: Optional[float] = None
    maximum_price: Optional[float] = None
    currency: str = "INR"
    price_per_sqft: Optional[float] = None
    maintenance: Optional[float] = None
    deposit: Optional[float] = None
    rental_price: Optional[float] = None


class PropertySpecs(BaseModel):
    """Architectural and structural specifications."""
    area: Optional[float] = None  # in sqft
    built_up_area: Optional[float] = None
    carpet_area: Optional[float] = None
    bedrooms: Optional[float] = None
    bathrooms: Optional[int] = None
    balconies: Optional[int] = None
    floor: Optional[int] = None
    total_floors: Optional[int] = None
    facing: Optional[str] = None  # North, East, etc.
    parking: Optional[int] = None


class PropertyProject(BaseModel):
    """Project-level status and metadata."""
    project_status: Optional[str] = None  # Under Construction, Ready to Move, Launched
    launch_date: Optional[date] = None
    possession_date: Optional[date] = None
    construction_status: Optional[str] = None
    amenities: List[str] = Field(default_factory=list)


class PropertyRegulatory(BaseModel):
    """Legal and regulatory filings."""
    rera_number: Optional[str] = None
    registration_status: Optional[str] = None


class PropertyListing(BaseModel):
    """Portal-specific listing metadata."""
    listing_id: Optional[str] = None
    listing_date: Optional[datetime] = None
    listing_status: Optional[str] = None
    source_url: Optional[str] = None


class PropertyCandidate(BaseModel):
    """Raw un-deduplicated candidate extracted from a document."""
    candidate_id: str = Field(..., description="Unique extraction candidate ID")
    source_id: str = Field(..., description="Source ID of origin")
    document_id: Optional[str] = Field(default=None)
    identity: PropertyIdentity = Field(default_factory=PropertyIdentity)
    location: PropertyLocation = Field(default_factory=PropertyLocation)
    financials: PropertyFinancials = Field(default_factory=PropertyFinancials)
    specs: PropertySpecs = Field(default_factory=PropertySpecs)
    project: PropertyProject = Field(default_factory=PropertyProject)
    regulatory: PropertyRegulatory = Field(default_factory=PropertyRegulatory)
    listing: PropertyListing = Field(default_factory=PropertyListing)
    description: Optional[str] = None
    features: List[str] = Field(default_factory=list)
    confidence: Optional[float] = None
    evidence: List[EvidenceRecord] = Field(default_factory=list)
    provenance: Optional[ProvenanceRecord] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class PropertyRecord(BaseModel):
    """Canonical resolved entity representing a verified real estate asset."""
    property_id: str = Field(..., description="Canonical entity ID")
    canonical_name: str
    identity: PropertyIdentity = Field(default_factory=PropertyIdentity)
    location: PropertyLocation = Field(default_factory=PropertyLocation)
    financials: PropertyFinancials = Field(default_factory=PropertyFinancials)
    specs: PropertySpecs = Field(default_factory=PropertySpecs)
    project: PropertyProject = Field(default_factory=PropertyProject)
    regulatory: PropertyRegulatory = Field(default_factory=PropertyRegulatory)
    listings: List[PropertyListing] = Field(default_factory=list)
    matched_candidate_ids: List[str] = Field(default_factory=list)
    version: int = Field(default=1)
    confidence: Optional[float] = None
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
    metadata: Dict[str, Any] = Field(default_factory=dict)
