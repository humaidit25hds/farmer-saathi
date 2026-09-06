from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from ..database import get_db

from ..models import (
    Buyer,
    Transporter,
    TransportBooking
)

from ..schemas import (
    TransportBookingCreate,
    TransporterCreate
)


router = APIRouter(
    prefix="/api/transport",
    tags=["Transport"]
)


# ==========================================
# GET ALL TRANSPORTERS
# ==========================================

@router.get("/transporters")
def get_transporters(
    db: Session = Depends(get_db)
):

    transporters = (
        db.query(Transporter)
        .order_by(
            Transporter.id.asc()
        )
        .all()
    )

    return transporters


# ==========================================
# CREATE NEW TRANSPORTER
# ==========================================

@router.post("/transporters")
def create_transporter(
    data: TransporterCreate,
    db: Session = Depends(get_db)
):

    transporter = Transporter(
        name=data.name.strip(),
        phone=data.phone.strip(),
        vehicle=data.vehicle.strip(),
        capacity=data.capacity,
        rate_per_km=data.rate_per_km,
        city=data.city.strip()
    )

    db.add(transporter)

    db.commit()

    db.refresh(transporter)

    return transporter


# ==========================================
# BOOK TRANSPORT
# ==========================================

@router.post("/book")
def book_transport(
    data: TransportBookingCreate,
    db: Session = Depends(get_db)
):

    # --------------------------------------
    # CHECK TRANSPORTER
    # --------------------------------------

    transporter = (
        db.query(Transporter)
        .filter(
            Transporter.id ==
            data.transporter_id
        )
        .first()
    )

    if not transporter:
        raise HTTPException(
            status_code=404,
            detail="Transporter not found"
        )


    # --------------------------------------
    # VALIDATE QUANTITY
    # --------------------------------------

    if data.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail=(
                "Quantity must be greater "
                "than zero"
            )
        )


    if data.quantity > transporter.capacity:
        raise HTTPException(
            status_code=400,
            detail=(
                f"This transporter can carry "
                f"only {transporter.capacity} "
                f"quintals."
            )
        )


    # --------------------------------------
    # CHECK BUYER
    # --------------------------------------

    buyer = None

    if data.buyer_id is not None:

        buyer = (
            db.query(Buyer)
            .filter(
                Buyer.id ==
                data.buyer_id
            )
            .first()
        )

        if not buyer:
            raise HTTPException(
                status_code=404,
                detail="Buyer not found"
            )


    # --------------------------------------
    # CREATE BOOKING
    # --------------------------------------

    booking = TransportBooking(
        transporter_id=
            data.transporter_id,

        buyer_id=
            data.buyer_id,

        buyer_price=
            data.buyer_price,

        farmer_name=
            data.farmer_name.strip(),

        phone=
            data.phone.strip(),

        crop=
            data.crop.strip(),

        quantity=
            data.quantity,

        pickup=
            data.pickup.strip(),

        destination=
            data.destination.strip(),

        status="Requested"
    )


    db.add(booking)

    db.commit()

    db.refresh(booking)


    return {
        "message":
            "Transport requested successfully",

        "booking_id":
            booking.id,

        "status":
            booking.status,

        "buyer_id":
            booking.buyer_id,

        "buyer_name":
            buyer.name
            if buyer
            else None,

        "buyer_company":
            buyer.company
            if buyer
            else None,

        "buyer_price":
            booking.buyer_price,

        "transporter_name":
            transporter.name
    }


# ==========================================
# GET FARMER TRANSPORT BOOKING HISTORY
# ==========================================

@router.get("/bookings/farmer/{phone}")
def get_farmer_transport_bookings(
    phone: str,
    db: Session = Depends(get_db)
):

    bookings = (
        db.query(TransportBooking)
        .filter(
            TransportBooking.phone ==
            phone.strip()
        )
        .order_by(
            TransportBooking.id.desc()
        )
        .all()
    )


    result = []


    for booking in bookings:

        # ----------------------------------
        # TRANSPORTER
        # ----------------------------------

        transporter = (
            db.query(Transporter)
            .filter(
                Transporter.id ==
                booking.transporter_id
            )
            .first()
        )


        # ----------------------------------
        # BUYER
        # ----------------------------------

        buyer = None

        if booking.buyer_id is not None:

            buyer = (
                db.query(Buyer)
                .filter(
                    Buyer.id ==
                    booking.buyer_id
                )
                .first()
            )


        # ----------------------------------
        # RESPONSE
        # ----------------------------------

        result.append({

            "id":
                booking.id,

            # TRANSPORTER
            "transporter_id":
                booking.transporter_id,

            "transporter_name":
                (
                    transporter.name
                    if transporter
                    else
                    "Unknown Transporter"
                ),

            "transporter_phone":
                (
                    transporter.phone
                    if transporter
                    else ""
                ),

            "vehicle":
                (
                    transporter.vehicle
                    if transporter
                    else ""
                ),

            "transporter_rate":
                (
                    transporter.rate_per_km
                    if transporter
                    else None
                ),


            # BUYER
            "buyer_id":
                booking.buyer_id,

            "buyer_name":
                (
                    buyer.name
                    if buyer
                    else None
                ),

            "buyer_company":
                (
                    buyer.company
                    if buyer
                    else None
                ),

            "buyer_phone":
                (
                    buyer.phone
                    if buyer
                    else None
                ),

            "buyer_city":
                (
                    buyer.city
                    if buyer
                    else None
                ),

            "buyer_verified":
                (
                    buyer.verified
                    if buyer
                    else False
                ),

            "buyer_price":
                booking.buyer_price,


            # FARMER
            "farmer_name":
                booking.farmer_name,

            "phone":
                booking.phone,


            # CROP / TRIP
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