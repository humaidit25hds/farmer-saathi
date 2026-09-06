"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";


type TransportBooking = {
  id: number;

  transporter_id: number;
  transporter_name: string;
  transporter_phone: string;
  transporter_rate?: number | null;

  vehicle: string;

  buyer_id?: number | null;
  buyer_name?: string | null;
  buyer_company?: string | null;
  buyer_phone?: string | null;
  buyer_city?: string | null;
  buyer_verified?: boolean;
  buyer_price?: number | null;

  farmer_name: string;
  phone: string;

  crop: string;
  quantity: number;

  pickup: string;
  destination: string;

  status: string;
};


export default function TransportHistoryPage() {
  const router = useRouter();

  const [bookings, setBookings] =
    useState<TransportBooking[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");


  // ==========================================
  // LOAD FARMER BOOKINGS
  // ==========================================

  useEffect(() => {
    const loggedIn =
      localStorage.getItem(
        "farmerLoggedIn"
      );

    if (loggedIn !== "true") {
      router.replace(
        "/login"
      );

      return;
    }


    const savedPhone =
      localStorage.getItem(
        "farmerPhone"
      ) ||
      localStorage.getItem(
        "phone"
      ) ||
      "";


    if (!savedPhone) {
      setLoading(false);

      setMessage(
        "Farmer phone number was not found. Please login again."
      );

      return;
    }


    setPhone(
      savedPhone
    );


    loadBookings(
      savedPhone
    );


    const interval =
      setInterval(() => {

        loadBookings(
          savedPhone,
          false
        );

      }, 5000);


    return () => {
      clearInterval(
        interval
      );
    };

  }, [router]);


  // ==========================================
  // FETCH BOOKINGS
  // ==========================================

  async function loadBookings(
    farmerPhone: string,
    showLoading = true
  ) {
    try {

      if (showLoading) {
        setLoading(
          true
        );
      }


      setMessage(
        ""
      );


      const response =
        await fetch(
          `http://192.168.0.106:8000/api/transport/bookings/farmer/${encodeURIComponent(
            farmerPhone
          )}`,
          {
            cache: "no-store",
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        setMessage(
          data.detail ||
            "Unable to load transport bookings."
        );

        return;
      }


      if (!Array.isArray(data)) {

        setMessage(
          "Invalid booking response."
        );

        return;
      }


      setBookings(
        data
      );

    } catch (error) {

      console.warn(
        "Transport history temporarily unavailable.",
        error
      );


      if (showLoading) {
        setMessage(
          "Unable to connect to FarmerSaathi backend."
        );
      }

    } finally {

      if (showLoading) {
        setLoading(
          false
        );
      }

    }
  }


  // ==========================================
  // FILTER BOOKINGS
  // ==========================================

  const filteredBookings =
    useMemo(() => {

      if (
        statusFilter ===
        "All"
      ) {
        return bookings;
      }


      return bookings.filter(
        (booking) =>
          booking.status ===
          statusFilter
      );

    }, [
      bookings,
      statusFilter,
    ]);


  // ==========================================
  // STATS
  // ==========================================

  const activeBookings =
    bookings.filter(
      (booking) =>
        booking.status !==
          "Completed" &&
        booking.status !==
          "Cancelled"
    ).length;


  const completedBookings =
    bookings.filter(
      (booking) =>
        booking.status ===
        "Completed"
    ).length;


  function refreshBookings() {
    if (phone) {
      loadBookings(
        phone
      );
    }
  }


  return (
    <main className="farmerTransportHistoryPage">

      {/* =====================================
          HERO
      ===================================== */}

      <section className="transportHistoryHero">

        <div>

          <span className="transportHistoryBadge">
            🚚 MY TRANSPORT
          </span>


          <h1>
            Transport Booking History
          </h1>


          <p>
            Track your transport requests,
            selected buyers and latest
            delivery status.
          </p>

        </div>


        <div className="transportHistoryActions">

          <button
            type="button"
            onClick={() =>
              router.push(
                "/transport"
              )
            }
            className="transportHistoryBackButton"
          >
            ← Transport
          </button>


          <button
            type="button"
            onClick={
              refreshBookings
            }
            className="transportHistoryRefreshButton"
          >
            Refresh
          </button>

        </div>

      </section>


      {/* =====================================
          STATS
      ===================================== */}

      <section className="transportHistoryStats">

        <div className="transportHistoryStatCard">

          <span>
            Total Bookings
          </span>

          <strong>
            {bookings.length}
          </strong>

        </div>


        <div className="transportHistoryStatCard">

          <span>
            Active
          </span>

          <strong>
            {activeBookings}
          </strong>

        </div>


        <div className="transportHistoryStatCard">

          <span>
            Completed
          </span>

          <strong>
            {completedBookings}
          </strong>

        </div>

      </section>


      {/* =====================================
          FILTERS
      ===================================== */}

      <section className="transportHistoryFilter">

        {[
          "All",
          "Requested",
          "Confirmed",
          "In Transit",
          "Completed",
          "Cancelled",
        ].map((status) => (

          <button
            type="button"
            key={status}
            className={
              statusFilter === status
                ? "transportFilterButton active"
                : "transportFilterButton"
            }
            onClick={() =>
              setStatusFilter(
                status
              )
            }
          >
            {status}
          </button>

        ))}

      </section>


      {/* =====================================
          LOADING / ERROR
      ===================================== */}

      {loading && (
        <div className="transportHistoryMessage">
          Loading your transport bookings...
        </div>
      )}


      {!loading &&
        message && (

          <div className="transportHistoryError">
            {message}
          </div>

        )}


      {/* =====================================
          EMPTY
      ===================================== */}

      {!loading &&
        !message &&
        bookings.length === 0 && (

          <div className="transportHistoryEmpty">

            <div>
              🚚
            </div>

            <h2>
              No Transport Bookings
            </h2>

            <p>
              You have not made any
              transport bookings yet.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/transport"
                )
              }
            >
              Book Transport
            </button>

          </div>

        )}


      {!loading &&
        !message &&
        bookings.length > 0 &&
        filteredBookings.length === 0 && (

          <div className="transportHistoryEmpty">

            <div>
              🔍
            </div>

            <h2>
              No {statusFilter} Bookings
            </h2>

            <p>
              No bookings match this
              status.
            </p>

          </div>

        )}


      {/* =====================================
          BOOKING CARDS
      ===================================== */}

      {!loading &&
        !message &&
        filteredBookings.length > 0 && (

          <section className="transportHistoryGrid">

            {filteredBookings.map(
              (booking) => (

                <article
                  key={booking.id}
                  className="transportHistoryCard"
                >

                  {/* HEADER */}

                  <div className="transportHistoryCardHeader">

                    <div>

                      <span className="transportBookingNumber">
                        Booking #{booking.id}
                      </span>

                      <h2>
                        {booking.crop}
                      </h2>

                    </div>


                    <span
                      className={`farmerBookingStatus ${getStatusClass(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>

                  </div>


                  {/* STATUS TRACKER */}

                  <div className="transportStatusTracker">

                    <StatusStep
                      label="Requested"
                      icon="📝"
                      active={isStepActive(
                        booking.status,
                        "Requested"
                      )}
                    />


                    <div
                      className={
                        isStepActive(
                          booking.status,
                          "Confirmed"
                        )
                          ? "transportStepLine active"
                          : "transportStepLine"
                      }
                    />


                    <StatusStep
                      label="Confirmed"
                      icon="✅"
                      active={isStepActive(
                        booking.status,
                        "Confirmed"
                      )}
                    />


                    <div
                      className={
                        isStepActive(
                          booking.status,
                          "In Transit"
                        )
                          ? "transportStepLine active"
                          : "transportStepLine"
                      }
                    />


                    <StatusStep
                      label="In Transit"
                      icon="🚚"
                      active={isStepActive(
                        booking.status,
                        "In Transit"
                      )}
                    />


                    <div
                      className={
                        isStepActive(
                          booking.status,
                          "Completed"
                        )
                          ? "transportStepLine active"
                          : "transportStepLine"
                      }
                    />


                    <StatusStep
                      label="Completed"
                      icon="🏁"
                      active={isStepActive(
                        booking.status,
                        "Completed"
                      )}
                    />

                  </div>


                  {/* CANCELLED */}

                  {booking.status ===
                    "Cancelled" && (

                    <div className="transportCancelledNotice">
                      ❌ This transport booking
                      has been cancelled.
                    </div>

                  )}


                  {/* BASIC DETAILS */}

                  <div className="transportHistoryDetails">

                    <div>

                      <span>
                        Farmer
                      </span>

                      <strong>
                        {booking.farmer_name}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Quantity
                      </span>

                      <strong>
                        {booking.quantity} quintals
                      </strong>

                    </div>


                    <div>

                      <span>
                        Transporter
                      </span>

                      <strong>
                        {booking.transporter_name}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Vehicle
                      </span>

                      <strong>
                        {booking.vehicle ||
                          "Not provided"}
                      </strong>

                    </div>

                  </div>


                  {/* =====================================
                      MARKETPLACE BUYER
                  ===================================== */}

                  {booking.buyer_id ? (

                    <div className="transportHistoryBuyer">

                      <div className="transportHistoryBuyerHeader">

                        <div>

                          <span>
                            🧑‍💼 MARKETPLACE BUYER
                          </span>

                          <h3>
                            {booking.buyer_name ||
                              `Buyer #${booking.buyer_id}`}
                          </h3>

                        </div>


                        {booking.buyer_verified ? (

                          <span className="transportBuyerVerified">
                            ✓ Verified
                          </span>

                        ) : (

                          <span className="transportBuyerPending">
                            Not Verified
                          </span>

                        )}

                      </div>


                      <div className="transportHistoryBuyerGrid">

                        <div>

                          <small>
                            Company
                          </small>

                          <strong>
                            {booking.buyer_company ||
                              "Not provided"}
                          </strong>

                        </div>


                        <div>

                          <small>
                            Buyer Price
                          </small>

                          <strong>

                            {booking.buyer_price !==
                            null &&
                            booking.buyer_price !==
                            undefined
                              ? `₹${booking.buyer_price}/quintal`
                              : "Not available"}

                          </strong>

                        </div>


                        <div>

                          <small>
                            Buyer ID
                          </small>

                          <strong>
                            #{booking.buyer_id}
                          </strong>

                        </div>


                        <div>

                          <small>
                            Buyer City
                          </small>

                          <strong>
                            {booking.buyer_city ||
                              booking.destination ||
                              "Not provided"}
                          </strong>

                        </div>

                      </div>


                      {booking.buyer_phone && (

                        <a
                          href={`tel:${booking.buyer_phone}`}
                          className="transportCallBuyerButton"
                        >
                          📞 Call Buyer
                        </a>

                      )}

                    </div>

                  ) : (

                    <div className="transportNoBuyerLinked">

                      <span>
                        ℹ️ No marketplace buyer linked
                      </span>

                      <p>
                        This booking was created
                        without selecting a buyer
                        from the FarmerSaathi
                        marketplace.
                      </p>

                    </div>

                  )}


                  {/* ROUTE */}

                  <div className="transportHistoryRoute">

                    <div>

                      <span>
                        📍 Pickup
                      </span>

                      <strong>
                        {booking.pickup}
                      </strong>

                    </div>


                    <div className="transportRouteArrow">
                      ↓
                    </div>


                    <div>

                      <span>
                        🏁 Destination
                      </span>

                      <strong>
                        {booking.destination}
                      </strong>

                    </div>

                  </div>


                  {/* TRANSPORTER CALL */}

                  {booking.transporter_phone && (

                    <a
                      href={`tel:${booking.transporter_phone}`}
                      className="transportCallButton"
                    >
                      📞 Call Transporter
                    </a>

                  )}

                </article>

              )
            )}

          </section>

        )}

    </main>
  );
}


// ==========================================
// STATUS STEP
// ==========================================

function StatusStep({
  label,
  icon,
  active,
}: {
  label: string;
  icon: string;
  active: boolean;
}) {
  return (

    <div
      className={
        active
          ? "transportStatusStep active"
          : "transportStatusStep"
      }
    >

      <div className="transportStatusCircle">
        {icon}
      </div>

      <span>
        {label}
      </span>

    </div>

  );
}


// ==========================================
// STATUS ORDER
// ==========================================

function isStepActive(
  currentStatus: string,
  step: string
) {
  const order = [
    "Requested",
    "Confirmed",
    "In Transit",
    "Completed",
  ];


  if (
    currentStatus ===
    "Cancelled"
  ) {
    return (
      step ===
      "Requested"
    );
  }


  const currentIndex =
    order.indexOf(
      currentStatus
    );


  const stepIndex =
    order.indexOf(
      step
    );


  return (
    currentIndex >= 0 &&
    stepIndex <= currentIndex
  );
}


// ==========================================
// STATUS CLASS
// ==========================================

function getStatusClass(
  status: string
) {
  return (
    "farmer-booking-" +
    status
      .toLowerCase()
      .replaceAll(
        " ",
        "-"
      )
  );
}