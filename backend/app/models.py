from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    Integer,
    String,
    Text
)

from .database import Base


# ==============================
# BUYER
# ==============================

class Buyer(Base):
    __tablename__ = "buyers"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        nullable=False
    )

    company = Column(
        String(150),
        nullable=False
    )

    phone = Column(
        String(20),
        nullable=False
    )

    city = Column(
        String(100),
        nullable=False
    )

    verified = Column(
        Boolean,
        default=False
    )


# ==============================
# CROP OFFER
# ==============================

class CropOffer(Base):
    __tablename__ = "crop_offers"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    buyer_id = Column(
        Integer,
        nullable=False
    )

    crop = Column(
        String(100),
        nullable=False
    )

    price_per_quintal = Column(
        Float,
        nullable=False
    )

    quantity = Column(
        Float,
        nullable=False
    )

    location = Column(
        String(150),
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ==============================
# TRANSPORTER
# ==============================

class Transporter(Base):
    __tablename__ = "transporters"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(120),
        nullable=False
    )

    phone = Column(
        String(20),
        nullable=False
    )

    vehicle = Column(
        String(100),
        nullable=False
    )

    capacity = Column(
        Float,
        nullable=False
    )

    rate_per_km = Column(
        Float,
        nullable=False
    )

    city = Column(
        String(100),
        nullable=False
    )


# ==============================
# TRANSPORT BOOKING
# ==============================

class TransportBooking(Base):
    __tablename__ = "transport_bookings"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    transporter_id = Column(
        Integer,
        nullable=False
    )

    # Marketplace buyer selected by farmer
    buyer_id = Column(
        Integer,
        nullable=True
    )

    # Price agreed/selected from marketplace
    buyer_price = Column(
        Float,
        nullable=True
    )

    farmer_name = Column(
        String(100),
        nullable=False
    )

    phone = Column(
        String(20),
        nullable=False
    )

    crop = Column(
        String(100),
        nullable=False
    )

    quantity = Column(
        Float,
        nullable=False
    )

    pickup = Column(
        String(255),
        nullable=False
    )

    destination = Column(
        String(255),
        nullable=False
    )

    status = Column(
        String(50),
        default="Requested"
    )


# ==============================
# SOS REQUEST
# ==============================

class SOSRequest(Base):
    __tablename__ = "sos_requests"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    farmer_id = Column(
        Integer,
        nullable=True,
        index=True
    )

    farmer_name = Column(
        String(100),
        nullable=False
    )

    phone = Column(
        String(20),
        nullable=False
    )

    emergency_type = Column(
        String(100),
        nullable=False
    )

    details = Column(
        Text
    )

    latitude = Column(
        Float
    )

    longitude = Column(
        Float
    )

    status = Column(
        String(50),
        default="Received"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ==============================
# FARMER
# ==============================

class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        nullable=False
    )

    phone = Column(
        String(20),
        unique=True,
        index=True,
        nullable=False
    )

    village = Column(
        String(150),
        nullable=True
    )

    password = Column(
        String(255),
        nullable=False
    )


# ==============================
# ADMIN / EMERGENCY STAFF
# ==============================

class Admin(Base):
    __tablename__ = "admins"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        nullable=False
    )

    username = Column(
        String(100),
        unique=True,
        index=True,
        nullable=False
    )

    password = Column(
        String(255),
        nullable=False
    )

    role = Column(
        String(50),
        default="Emergency Admin"
    )


# ==============================
# ADMIN SESSION
# ==============================

class AdminSession(Base):
    __tablename__ = "admin_sessions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    admin_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    token = Column(
        String(255),
        unique=True,
        index=True,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ==============================
# FARMER SESSION
# ==============================

class FarmerSession(Base):
    __tablename__ = "farmer_sessions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    farmer_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    token = Column(
        String(255),
        unique=True,
        index=True,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )