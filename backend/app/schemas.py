from typing import Optional

from pydantic import BaseModel


# =========================
# AI ASSISTANT
# =========================

class AssistantRequest(BaseModel):
    question: str
    language: str
    location: Optional[str] = None

    temperature: Optional[float] = None
    humidity: Optional[float] = None
    precipitation: Optional[float] = None
    wind_speed: Optional[float] = None
    rain_probability: Optional[float] = None


# =========================
# BUYERS
# =========================

class BuyerCreate(BaseModel):
    name: str
    company: str
    phone: str
    city: str


# =========================
# MARKETPLACE OFFERS
# =========================

class OfferCreate(BaseModel):
    buyer_id: int
    crop: str
    price_per_quintal: float
    quantity: float
    location: str


# =========================
# TRANSPORTER
# =========================

class TransporterCreate(BaseModel):
    name: str
    phone: str
    vehicle: str
    capacity: float
    rate_per_km: float
    city: str


# =========================
# TRANSPORT BOOKING
# =========================

class TransportBookingCreate(BaseModel):
    transporter_id: int

    farmer_name: str
    phone: str

    crop: str
    quantity: float

    pickup: str
    destination: str

    buyer_id: int | None = None
    buyer_price: float | None = None

# =========================
# SOS / EMERGENCY
# =========================

class SOSCreate(BaseModel):
    farmer_id: int
    farmer_name: str
    phone: str
    emergency_type: str
    details: str = ""
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class SOSStatusUpdate(BaseModel):
    status: str


# =========================
# FARMER REGISTRATION
# =========================

class FarmerRegister(BaseModel):
    name: str
    phone: str
    village: Optional[str] = None
    password: str


# =========================
# FARMER LOGIN
# =========================

class FarmerLogin(BaseModel):
    phone: str
    password: str


# =========================
# FARMER PROFILE UPDATE
# =========================

class FarmerProfileUpdate(BaseModel):
    name: str
    village: Optional[str] = None


# =========================
# ADMIN REGISTRATION
# =========================

class AdminRegister(BaseModel):
    name: str
    username: str
    password: str


# =========================
# ADMIN LOGIN
# =========================

class AdminLogin(BaseModel):
    username: str
    password: str