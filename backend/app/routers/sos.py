from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from ..database import get_db

from ..models import (
    SOSRequest,
    Farmer
)

from ..schemas import (
    SOSCreate,
    SOSStatusUpdate
)

from .admin import get_current_admin
from .auth import get_current_farmer


router = APIRouter(
    prefix="/api/sos",
    tags=["SOS"]
)


# ==========================================
# GET ALL SOS REQUESTS
# ADMIN ONLY
# ==========================================

@router.get("")
def get_sos_requests(
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    sos_requests = (
        db.query(SOSRequest)
        .order_by(
            SOSRequest.id.desc()
        )
        .all()
    )

    return sos_requests


# ==========================================
# CREATE NEW SOS REQUEST
# LOGGED-IN FARMER ONLY
# ==========================================

@router.post("")
def create_sos(
    data: SOSCreate,

    farmer: Farmer =
        Depends(get_current_farmer),

    db: Session =
        Depends(get_db)
):
    emergency_type = (
        data.emergency_type.strip()
    )

    if not emergency_type:
        raise HTTPException(
            status_code=400,
            detail="Emergency type is required"
        )

    details = (
        data.details.strip()
        if data.details
        else ""
    )

    # IMPORTANT:
    # We do NOT trust farmer_id,
    # farmer_name or phone sent
    # from the browser.
    #
    # We use the authenticated
    # farmer account instead.

    sos = SOSRequest(
        farmer_id=farmer.id,

        farmer_name=farmer.name,

        phone=farmer.phone,

        emergency_type=
            emergency_type,

        details=
            details,

        latitude=
            data.latitude,

        longitude=
            data.longitude
    )

    db.add(sos)

    db.commit()

    db.refresh(sos)

    return {
        "sos_id":
            sos.id,

        "farmer_id":
            sos.farmer_id,

        "status":
            sos.status,

        "message": (
            "SOS location has been recorded. "
            "This development version does not "
            "automatically dispatch medical services."
        )
    }


# ==========================================
# GET LOGGED-IN FARMER'S SOS REQUESTS
# SECURE FARMER ID VERSION
# ==========================================

@router.get(
    "/farmer-id/{farmer_id}"
)
def get_farmer_sos_by_id(
    farmer_id: int,

    farmer: Farmer =
        Depends(get_current_farmer),

    db: Session =
        Depends(get_db)
):
    # Farmer can only access
    # their own SOS records.

    if farmer.id != farmer_id:
        raise HTTPException(
            status_code=403,
            detail=(
                "You cannot access "
                "another farmer's SOS requests"
            )
        )

    sos_requests = (
        db.query(SOSRequest)
        .filter(
            SOSRequest.farmer_id
            == farmer.id
        )
        .order_by(
            SOSRequest.id.desc()
        )
        .all()
    )

    return sos_requests


# ==========================================
# GET ONE SOS REQUEST
# LOGGED-IN FARMER ONLY
# ==========================================

@router.get(
    "/farmer-id/{farmer_id}/{sos_id}"
)
def get_one_farmer_sos_by_id(
    farmer_id: int,
    sos_id: int,

    farmer: Farmer =
        Depends(get_current_farmer),

    db: Session =
        Depends(get_db)
):
    if farmer.id != farmer_id:
        raise HTTPException(
            status_code=403,
            detail=(
                "You cannot access "
                "another farmer's SOS request"
            )
        )

    sos = (
        db.query(SOSRequest)
        .filter(
            SOSRequest.id == sos_id,

            SOSRequest.farmer_id
            == farmer.id
        )
        .first()
    )

    if not sos:
        raise HTTPException(
            status_code=404,
            detail="SOS request not found"
        )

    return sos


# ==========================================
# OLD PHONE-BASED FARMER SOS ROUTE
# NOW PROTECTED
# ==========================================

@router.get(
    "/farmer/{phone}"
)
def get_farmer_sos_requests(
    phone: str,

    farmer: Farmer =
        Depends(get_current_farmer),

    db: Session =
        Depends(get_db)
):
    clean_phone = (
        phone.strip()
    )

    # The logged-in farmer
    # can only use their own phone.

    if (
        farmer.phone.strip()
        != clean_phone
    ):
        raise HTTPException(
            status_code=403,
            detail=(
                "You cannot access "
                "another farmer's SOS requests"
            )
        )

    sos_requests = (
        db.query(SOSRequest)
        .filter(
            SOSRequest.farmer_id
            == farmer.id
        )
        .order_by(
            SOSRequest.id.desc()
        )
        .all()
    )

    return sos_requests


# ==========================================
# OLD PHONE-BASED SINGLE SOS ROUTE
# NOW PROTECTED
# ==========================================

@router.get(
    "/farmer/{phone}/{sos_id}"
)
def get_farmer_sos_request(
    phone: str,
    sos_id: int,

    farmer: Farmer =
        Depends(get_current_farmer),

    db: Session =
        Depends(get_db)
):
    clean_phone = (
        phone.strip()
    )

    if (
        farmer.phone.strip()
        != clean_phone
    ):
        raise HTTPException(
            status_code=403,
            detail=(
                "You cannot access "
                "another farmer's SOS request"
            )
        )

    sos = (
        db.query(SOSRequest)
        .filter(
            SOSRequest.id == sos_id,

            SOSRequest.farmer_id
            == farmer.id
        )
        .first()
    )

    if not sos:
        raise HTTPException(
            status_code=404,
            detail="SOS request not found"
        )

    return sos


# ==========================================
# UPDATE SOS STATUS
# ADMIN ONLY
# ==========================================

@router.patch(
    "/{sos_id}/status"
)
def update_sos_status(
    sos_id: int,

    data: SOSStatusUpdate,

    db: Session =
        Depends(get_db),

    admin=
        Depends(get_current_admin)
):
    allowed_statuses = [
        "Received",
        "Responding",
        "Help Dispatched",
        "Resolved"
    ]

    new_status = (
        data.status.strip()
    )

    if (
        new_status
        not in allowed_statuses
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid SOS status"
        )

    sos = (
        db.query(SOSRequest)
        .filter(
            SOSRequest.id == sos_id
        )
        .first()
    )

    if not sos:
        raise HTTPException(
            status_code=404,
            detail="SOS request not found"
        )

    sos.status = (
        new_status
    )

    db.commit()

    db.refresh(sos)

    return {
        "message":
            "SOS status updated successfully",

        "sos_id":
            sos.id,

        "farmer_id":
            sos.farmer_id,

        "status":
            sos.status
    }