from fastapi import (
    APIRouter,
    Depends,
    Header,
    HTTPException
)
from sqlalchemy.orm import Session;

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)

from pydantic import BaseModel
from sqlalchemy.orm import Session

import secrets

from ..database import get_db

from ..models import (
    Admin,
    AdminSession
)


router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"]
)


# ==========================================
# SWAGGER / BEARER AUTHENTICATION
# ==========================================

admin_security = HTTPBearer(
    auto_error=False
)


# ==========================================
# REQUEST SCHEMAS
# ==========================================

class AdminLogin(BaseModel):
    username: str
    password: str


class BookingStatusUpdate(BaseModel):
    status: str


# ==========================================
# GET CURRENT ADMIN
# PROTECTED ADMIN AUTHENTICATION
# ==========================================

def get_current_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(
        admin_security
    ),
    db: Session = Depends(get_db)
):
    if not credentials:
        raise HTTPException(
            status_code=401,
            detail="Admin authentication required"
        )

    token = credentials.credentials.strip()

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Invalid admin token"
        )

    session = (
        db.query(AdminSession)
        .filter(
            AdminSession.token == token
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired admin session"
        )

    admin = (
        db.query(Admin)
        .filter(
            Admin.id == session.admin_id
        )
        .first()
    )

    if not admin:
        raise HTTPException(
            status_code=401,
            detail="Admin account not found"
        )

    return admin


# ==========================================
# CREATE DEFAULT ADMIN
# DEVELOPMENT ONLY
# ==========================================

@router.post("/create-default")
def create_default_admin(
    db: Session = Depends(get_db)
):
    existing_admin = (
        db.query(Admin)
        .filter(
            Admin.username == "admin"
        )
        .first()
    )

    if existing_admin:
        return {
            "success": True,
            "message": "Default admin already exists",
            "username": existing_admin.username
        }

    admin = Admin(
        name="FarmerSaathi Admin",
        username="admin",
        password="admin123",
        role="Emergency Admin"
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)

    return {
        "success": True,
        "message": "Default admin created successfully",
        "username": "admin",
        "password": "admin123"
    }


# ==========================================
# ADMIN LOGIN
# ==========================================

@router.post("/login")
def admin_login(
    data: AdminLogin,
    db: Session = Depends(get_db)
):
    username = data.username.strip()

    admin = (
        db.query(Admin)
        .filter(
            Admin.username == username
        )
        .first()
    )

    if not admin:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    if admin.password != data.password:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    # Delete old sessions for this admin
    (
        db.query(AdminSession)
        .filter(
            AdminSession.admin_id == admin.id
        )
        .delete()
    )

    token = secrets.token_urlsafe(32)

    session = AdminSession(
        admin_id=admin.id,
        token=token
    )

    db.add(session)
    db.commit()

    return {
        "success": True,
        "message": "Admin login successful",
        "token": token,
        "admin": {
            "id": admin.id,
            "name": admin.name,
            "username": admin.username,
            "role": admin.role
        }
    }


# ==========================================
# ADMIN PROFILE
# ==========================================

@router.get("/me")
def admin_profile(
    admin: Admin = Depends(
        get_current_admin
    )
):
    return {
        "id": admin.id,
        "name": admin.name,
        "username": admin.username,
        "role": admin.role
    }


# ==========================================
# ADMIN LOGOUT
# ==========================================

@router.post("/logout")
def admin_logout(
    authorization: str | None = Header(
        default=None
    ),
    db: Session = Depends(get_db)
):
    if not authorization:
        return {
            "success": True,
            "message": "Already logged out"
        }

    token = authorization.strip()

    if token.lower().startswith(
        "bearer "
    ):
        token = token[7:].strip()

    session = (
        db.query(AdminSession)
        .filter(
            AdminSession.token == token
        )
        .first()
    )

    if session:
        db.delete(session)
        db.commit()

    return {
        "success": True,
        "message": "Admin logged out successfully"
    }


# ==========================================
# GET ALL REGISTERED FARMERS
# ADMIN ONLY
# ==========================================

@router.get("/farmers")
def get_all_farmers(
    db: Session = Depends(get_db),
    admin: Admin = Depends(
        get_current_admin
    )
):
    from ..models import Farmer

    farmers = (
        db.query(Farmer)
        .order_by(
            Farmer.id.desc()
        )
        .all()
    )

    return [
        {
            "id": farmer.id,
            "name": farmer.name,
            "phone": farmer.phone,
            "village": farmer.village
        }
        for farmer in farmers
    ]


# ==========================================
# GET ALL BUYERS
# ADMIN ONLY
# ==========================================

@router.get("/buyers")
def get_all_buyers(
    db: Session = Depends(get_db),
    admin: Admin = Depends(
        get_current_admin
    )
):
    from ..models import Buyer

    buyers = (
        db.query(Buyer)
        .order_by(
            Buyer.id.desc()
        )
        .all()
    )

    return [
        {
            "id": buyer.id,
            "name": buyer.name,
            "company": buyer.company,
            "phone": buyer.phone,
            "city": buyer.city,
            "verified": buyer.verified
        }
        for buyer in buyers
    ]


# ==========================================
# GET ALL CROP OFFERS
# ADMIN ONLY
# ==========================================

@router.get("/offers")
def get_all_offers(
    db: Session = Depends(get_db),
    admin: Admin = Depends(
        get_current_admin
    )
):
    from ..models import (
        CropOffer,
        Buyer
    )

    offers = (
        db.query(CropOffer)
        .order_by(
            CropOffer.id.desc()
        )
        .all()
    )

    result = []

    for offer in offers:

        buyer = (
            db.query(Buyer)
            .filter(
                Buyer.id == offer.buyer_id
            )
            .first()
        )

        result.append({
            "id": offer.id,
            "buyer_id": offer.buyer_id,

            "buyer_name":
                buyer.name
                if buyer
                else "Unknown Buyer",

            "company":
                buyer.company
                if buyer
                else "",

            "crop": offer.crop,

            "price_per_quintal":
                offer.price_per_quintal,

            "quantity":
                offer.quantity,

            "location":
                offer.location,

            "created_at":
                offer.created_at
        })

    return result


# ==========================================
# GET ALL TRANSPORTERS
# ADMIN ONLY
# ==========================================

@router.get("/transporters")
def get_all_transporters(
    db: Session = Depends(get_db),
    admin: Admin = Depends(
        get_current_admin
    )
):
    from ..models import Transporter

    transporters = (
        db.query(Transporter)
        .order_by(
            Transporter.id.desc()
        )
        .all()
    )

    return [
        {
            "id": transporter.id,

            "name":
                transporter.name,

            "phone":
                transporter.phone,

            "vehicle":
                transporter.vehicle,

            "capacity":
                transporter.capacity,

            "rate_per_km":
                transporter.rate_per_km,

            "city":
                transporter.city
        }
        for transporter in transporters
    ]


# ==========================================
# GET ALL TRANSPORT BOOKINGS
# ADMIN ONLY
# ==========================================

@router.get("/bookings")
def get_all_transport_bookings(
    db: Session = Depends(get_db),
    admin: Admin = Depends(
        get_current_admin
    )
):
    from ..models import (
        TransportBooking,
        Transporter
    )

    bookings = (
        db.query(TransportBooking)
        .order_by(
            TransportBooking.id.desc()
        )
        .all()
    )

    result = []

    for booking in bookings:

        transporter = (
            db.query(Transporter)
            .filter(
                Transporter.id
                == booking.transporter_id
            )
            .first()
        )

        result.append({
            "id":
                booking.id,

            "transporter_id":
                booking.transporter_id,

            "transporter_name":
                transporter.name
                if transporter
                else "Unknown Transporter",

            "farmer_name":
                booking.farmer_name,

            "phone":
                booking.phone,

            "crop":
                booking.crop,

            "quantity":
                booking.quantity,

            "pickup":
                booking.pickup,

            "destination":
                booking.destination,

            "status":
                booking.status
        })

    return result


# ==========================================
# UPDATE TRANSPORT BOOKING STATUS
# ADMIN ONLY
# ==========================================

@router.patch(
    "/bookings/{booking_id}/status"
)
def update_booking_status(
    booking_id: int,
    data: BookingStatusUpdate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(
        get_current_admin
    )
):
    from ..models import TransportBooking

    allowed_statuses = [
        "Requested",
        "Confirmed",
        "In Transit",
        "Completed",
        "Cancelled"
    ]

    new_status = data.status.strip()

    if new_status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid booking status"
        )

    booking = (
        db.query(TransportBooking)
        .filter(
            TransportBooking.id
            == booking_id
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Transport booking not found"
        )

    booking.status = new_status

    db.commit()
    db.refresh(booking)

    return {
        "success": True,

        "message":
            "Booking status updated successfully",

        "booking_id":
            booking.id,

        "status":
            booking.status
    }

# ==========================================
# ADMIN CROP OFFER SCHEMAS
# ==========================================

class AdminOfferCreate(BaseModel):
    buyer_id: int
    crop: str
    price_per_quintal: float
    quantity: float
    location: str


class AdminOfferUpdate(BaseModel):
    buyer_id: int
    crop: str
    price_per_quintal: float
    quantity: float
    location: str


# ==========================================
# CREATE CROP OFFER
# ADMIN ONLY
# ==========================================

@router.post("/offers")
def create_crop_offer(
    data: AdminOfferCreate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin)
):
    from ..models import (
        Buyer,
        CropOffer
    )

    buyer = (
        db.query(Buyer)
        .filter(
            Buyer.id == data.buyer_id
        )
        .first()
    )

    if not buyer:
        raise HTTPException(
            status_code=404,
            detail="Buyer not found"
        )

    crop = data.crop.strip()
    location = data.location.strip()

    if not crop:
        raise HTTPException(
            status_code=400,
            detail="Crop name is required"
        )

    if not location:
        raise HTTPException(
            status_code=400,
            detail="Location is required"
        )

    if data.price_per_quintal <= 0:
        raise HTTPException(
            status_code=400,
            detail="Price must be greater than zero"
        )

    if data.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero"
        )

    offer = CropOffer(
        buyer_id=data.buyer_id,
        crop=crop,
        price_per_quintal=data.price_per_quintal,
        quantity=data.quantity,
        location=location
    )

    db.add(offer)
    db.commit()
    db.refresh(offer)

    return {
        "message": "Crop offer created successfully",
        "offer": {
            "id": offer.id,
            "buyer_id": offer.buyer_id,
            "buyer_name": buyer.name,
            "company": buyer.company,
            "crop": offer.crop,
            "price_per_quintal":
                offer.price_per_quintal,
            "quantity": offer.quantity,
            "location": offer.location,
            "created_at": offer.created_at
        }
    }


# ==========================================
# UPDATE CROP OFFER
# ADMIN ONLY
# ==========================================

@router.patch("/offers/{offer_id}")
def update_crop_offer(
    offer_id: int,
    data: AdminOfferUpdate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin)
):
    from ..models import (
        Buyer,
        CropOffer
    )

    offer = (
        db.query(CropOffer)
        .filter(
            CropOffer.id == offer_id
        )
        .first()
    )

    if not offer:
        raise HTTPException(
            status_code=404,
            detail="Crop offer not found"
        )

    buyer = (
        db.query(Buyer)
        .filter(
            Buyer.id == data.buyer_id
        )
        .first()
    )

    if not buyer:
        raise HTTPException(
            status_code=404,
            detail="Buyer not found"
        )

    crop = data.crop.strip()
    location = data.location.strip()

    if not crop:
        raise HTTPException(
            status_code=400,
            detail="Crop name is required"
        )

    if not location:
        raise HTTPException(
            status_code=400,
            detail="Location is required"
        )

    if data.price_per_quintal <= 0:
        raise HTTPException(
            status_code=400,
            detail="Price must be greater than zero"
        )

    if data.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero"
        )

    offer.buyer_id = data.buyer_id
    offer.crop = crop
    offer.price_per_quintal = (
        data.price_per_quintal
    )
    offer.quantity = data.quantity
    offer.location = location

    db.commit()
    db.refresh(offer)

    return {
        "message": "Crop offer updated successfully",
        "offer": {
            "id": offer.id,
            "buyer_id": offer.buyer_id,
            "buyer_name": buyer.name,
            "company": buyer.company,
            "crop": offer.crop,
            "price_per_quintal":
                offer.price_per_quintal,
            "quantity": offer.quantity,
            "location": offer.location,
            "created_at": offer.created_at
        }
    }


# ==========================================
# DELETE CROP OFFER
# ADMIN ONLY
# ==========================================

@router.delete("/offers/{offer_id}")
def delete_crop_offer(
    offer_id: int,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin)
):
    from ..models import CropOffer

    offer = (
        db.query(CropOffer)
        .filter(
            CropOffer.id == offer_id
        )
        .first()
    )

    if not offer:
        raise HTTPException(
            status_code=404,
            detail="Crop offer not found"
        )

    db.delete(offer)
    db.commit()

    return {
        "message":
            "Crop offer deleted successfully"
    }

# ==========================================
# BUYER VERIFICATION SCHEMA
# ==========================================

class BuyerVerificationUpdate(BaseModel):
    verified: bool


# ==========================================
# VERIFY / UNVERIFY BUYER
# ADMIN ONLY
# ==========================================

@router.patch("/buyers/{buyer_id}/verification")
def update_buyer_verification(
    buyer_id: int,
    data: BuyerVerificationUpdate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin)
):
    from ..models import Buyer

    buyer = (
        db.query(Buyer)
        .filter(
            Buyer.id == buyer_id
        )
        .first()
    )

    if not buyer:
        raise HTTPException(
            status_code=404,
            detail="Buyer not found"
        )

    buyer.verified = data.verified

    db.commit()
    db.refresh(buyer)

    return {
        "message": (
            "Buyer verified successfully"
            if buyer.verified
            else "Buyer verification removed"
        ),
        "buyer": {
            "id": buyer.id,
            "name": buyer.name,
            "company": buyer.company,
            "phone": buyer.phone,
            "city": buyer.city,
            "verified": buyer.verified
        }
    }