import secrets

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.models import (
    Farmer,
    FarmerSession
)

from app.schemas import (
    FarmerRegister,
    FarmerLogin,
    FarmerProfileUpdate
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


# ==========================================
# BEARER TOKEN SECURITY
# ==========================================

security = HTTPBearer(
    auto_error=False
)


# ==========================================
# GET CURRENT LOGGED-IN FARMER
# ==========================================

def get_current_farmer(
    credentials:
        HTTPAuthorizationCredentials =
        Depends(security),

    db: Session =
        Depends(get_db)
):
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Farmer authentication required"
        )

    token = credentials.credentials

    session = (
        db.query(FarmerSession)
        .filter(
            FarmerSession.token == token
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired farmer session"
        )

    farmer = (
        db.query(Farmer)
        .filter(
            Farmer.id ==
            session.farmer_id
        )
        .first()
    )

    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Farmer account not found"
        )

    return farmer


# ==========================================
# REGISTER FARMER
# ==========================================

@router.post("/register")
def register_farmer(
    data: FarmerRegister,
    db: Session = Depends(get_db)
):
    name = data.name.strip()
    phone = data.phone.strip()
    password = data.password

    village = (
        data.village.strip()
        if data.village
        else None
    )

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Farmer name is required"
        )

    if not phone:
        raise HTTPException(
            status_code=400,
            detail="Mobile number is required"
        )

    if not password:
        raise HTTPException(
            status_code=400,
            detail="Password is required"
        )

    existing_farmer = (
        db.query(Farmer)
        .filter(
            Farmer.phone == phone
        )
        .first()
    )

    if existing_farmer:
        raise HTTPException(
            status_code=400,
            detail=(
                "Mobile number already registered"
            )
        )

    farmer = Farmer(
        name=name,
        phone=phone,
        village=village,
        password=password
    )

    db.add(farmer)
    db.commit()
    db.refresh(farmer)

    return {
        "message":
            "Farmer registered successfully",

        "farmer_id":
            farmer.id,

        "name":
            farmer.name,

        "phone":
            farmer.phone,

        "village":
            farmer.village
    }


# ==========================================
# LOGIN FARMER
# ==========================================

@router.post("/login")
def login_farmer(
    data: FarmerLogin,
    db: Session = Depends(get_db)
):
    phone = data.phone.strip()

    farmer = (
        db.query(Farmer)
        .filter(
            Farmer.phone == phone
        )
        .first()
    )

    if (
        not farmer or
        farmer.password != data.password
    ):
        raise HTTPException(
            status_code=401,
            detail=(
                "Invalid phone number or password"
            )
        )

    # --------------------------------------
    # REMOVE OLD FARMER SESSIONS
    # --------------------------------------

    (
        db.query(FarmerSession)
        .filter(
            FarmerSession.farmer_id ==
            farmer.id
        )
        .delete(
            synchronize_session=False
        )
    )

    # --------------------------------------
    # CREATE NEW SECURE SESSION TOKEN
    # --------------------------------------

    token = secrets.token_urlsafe(48)

    farmer_session = FarmerSession(
        farmer_id=farmer.id,
        token=token
    )

    db.add(farmer_session)

    db.commit()

    return {
        "message":
            "Login successful",

        "token":
            token,

        "token_type":
            "bearer",

        "farmer_id":
            farmer.id,

        "name":
            farmer.name,

        "phone":
            farmer.phone,

        "village":
            farmer.village
    }


# ==========================================
# GET CURRENT FARMER
# ==========================================

@router.get("/me")
def get_me(
    farmer: Farmer =
        Depends(get_current_farmer)
):
    return {
        "farmer_id":
            farmer.id,

        "name":
            farmer.name,

        "phone":
            farmer.phone,

        "village":
            farmer.village
    }


# ==========================================
# GET FARMER PROFILE
# SECURE VERSION
# ==========================================

@router.get("/profile/{farmer_id}")
def get_farmer_profile(
    farmer_id: int,

    farmer: Farmer =
        Depends(get_current_farmer)
):
    if farmer.id != farmer_id:
        raise HTTPException(
            status_code=403,
            detail=(
                "You cannot access "
                "another farmer's profile"
            )
        )

    return {
        "farmer_id":
            farmer.id,

        "name":
            farmer.name,

        "phone":
            farmer.phone,

        "village":
            farmer.village
    }


# ==========================================
# UPDATE FARMER PROFILE
# SECURE VERSION
# ==========================================

@router.put("/profile/{farmer_id}")
def update_farmer_profile(
    farmer_id: int,

    data: FarmerProfileUpdate,

    farmer: Farmer =
        Depends(get_current_farmer),

    db: Session =
        Depends(get_db)
):
    if farmer.id != farmer_id:
        raise HTTPException(
            status_code=403,
            detail=(
                "You cannot update "
                "another farmer's profile"
            )
        )

    name = data.name.strip()

    if not name:
        raise HTTPException(
            status_code=400,
            detail=(
                "Farmer name cannot be empty"
            )
        )

    farmer.name = name

    if data.village:
        farmer.village = (
            data.village.strip()
        )
    else:
        farmer.village = None

    db.commit()

    db.refresh(farmer)

    return {
        "message":
            "Profile updated successfully",

        "farmer_id":
            farmer.id,

        "name":
            farmer.name,

        "phone":
            farmer.phone,

        "village":
            farmer.village
    }


# ==========================================
# FARMER LOGOUT
# ==========================================

@router.post("/logout")
def logout_farmer(
    credentials:
        HTTPAuthorizationCredentials =
        Depends(security),

    db: Session =
        Depends(get_db)
):
    if not credentials:
        raise HTTPException(
            status_code=401,
            detail="Farmer authentication required"
        )

    token = credentials.credentials

    farmer_session = (
        db.query(FarmerSession)
        .filter(
            FarmerSession.token == token
        )
        .first()
    )

    if not farmer_session:
        raise HTTPException(
            status_code=401,
            detail="Invalid farmer session"
        )

    db.delete(farmer_session)

    db.commit()

    return {
        "message":
            "Farmer logged out successfully"
    }