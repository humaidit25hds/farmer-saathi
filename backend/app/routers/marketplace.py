from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from ..database import get_db

from ..models import (
    Buyer,
    CropOffer
)

from ..schemas import (
    BuyerCreate,
    OfferCreate
)


router = APIRouter(
    prefix="/api/marketplace",
    tags=["Marketplace"]
)


# ==========================================
# CREATE BUYER
# ==========================================

@router.post("/buyers")
def create_buyer(
    data: BuyerCreate,
    db: Session = Depends(get_db)
):

    buyer = Buyer(
        name=data.name,
        company=data.company,
        phone=data.phone,
        city=data.city,
        verified=False
    )

    db.add(buyer)
    db.commit()
    db.refresh(buyer)

    return buyer


# ==========================================
# GET ALL BUYERS
# ==========================================

@router.get("/buyers")
def get_buyers(
    db: Session = Depends(get_db)
):

    buyers = (
        db.query(Buyer)
        .order_by(Buyer.id.desc())
        .all()
    )

    return buyers


# ==========================================
# CREATE CROP OFFER
# ==========================================

@router.post("/offers")
def create_offer(
    data: OfferCreate,
    db: Session = Depends(get_db)
):

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

    offer = CropOffer(
        buyer_id=data.buyer_id,
        crop=data.crop,
        price_per_quintal=
            data.price_per_quintal,
        quantity=data.quantity,
        location=data.location
    )

    db.add(offer)
    db.commit()
    db.refresh(offer)

    return {
        "id": offer.id,
        "buyer_id": offer.buyer_id,
        "buyer_name": buyer.name,
        "company": buyer.company,
        "buyer_phone": buyer.phone,
        "buyer_city": buyer.city,
        "verified": buyer.verified,
        "crop": offer.crop,
        "price_per_quintal":
            offer.price_per_quintal,
        "quantity": offer.quantity,
        "location": offer.location,
        "created_at": offer.created_at
    }


# ==========================================
# GET CROP OFFERS WITH BUYER DETAILS
# ==========================================

@router.get("/offers")
def get_offers(
    crop: str = "",
    db: Session = Depends(get_db)
):

    query = (
        db.query(
            CropOffer,
            Buyer
        )
        .join(
            Buyer,
            Buyer.id ==
                CropOffer.buyer_id
        )
    )

    if crop.strip():

        query = query.filter(
            CropOffer.crop.ilike(
                f"%{crop.strip()}%"
            )
        )

    results = (
        query
        .order_by(
            CropOffer
            .price_per_quintal
            .desc()
        )
        .all()
    )

    offers = []

    for offer, buyer in results:

        offers.append({
            "id":
                offer.id,

            "buyer_id":
                offer.buyer_id,

            "buyer_name":
                buyer.name,

            "company":
                buyer.company,

            "buyer_phone":
                buyer.phone,

            "buyer_city":
                buyer.city,

            "verified":
                buyer.verified,

            "crop":
                offer.crop,

            "price_per_quintal":
                offer.price_per_quintal,

            "quantity":
                offer.quantity,

            "location":
                offer.location,

            "created_at":
                offer.created_at
        })

    return offers