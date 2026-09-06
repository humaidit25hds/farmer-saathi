"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Booking = {
  id: number;
  transporter_id: number;
  transporter_name: string;
  farmer_name: string;
  phone: string;
  crop: string;
  quantity: number;
  pickup: string;
  destination: string;
  status: string;
};

export default function AdminBookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [updatingId, setUpdatingId] =
    useState<number | null>(null);

  useEffect(() => {
    const token =
      localStorage.getItem("adminToken");

    if (!token) {
      router.replace("/admin-login");
      return;
    }

    loadBookings();
  }, [router]);

  async function loadBookings() {
    try {
      setLoading(true);
      setMessage("");

      const token =
        localStorage.getItem("adminToken");

      const response = await fetch(
        "http://192.168.0.106:8000/api/admin/bookings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail ||
            "Unable to load transport bookings."
        );
        return;
      }

      setBookings(data);
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to connect to FarmerSaathi backend."
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateBookingStatus(
    bookingId: number,
    status: string
  ) {
    try {
      setUpdatingId(bookingId);

      const token =
        localStorage.getItem("adminToken");

      const response = await fetch(
        `http://192.168.0.106:8000/api/admin/bookings/${bookingId}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            status: status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.detail ||
            "Unable to update booking status."
        );
        return;
      }

      setBookings((current) =>
        current.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status: status,
              }
            : booking
        )
      );
    } catch (error) {
      console.error(error);

      alert(
        "Unable to connect to FarmerSaathi backend."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredBookings =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return bookings;
      }

      return bookings.filter(
        (booking) => {
          return (
            booking.farmer_name
              .toLowerCase()
              .includes(value) ||
            booking.phone
              .toLowerCase()
              .includes(value) ||
            booking.crop
              .toLowerCase()
              .includes(value) ||
            booking.transporter_name
              .toLowerCase()
              .includes(value) ||
            booking.pickup
              .toLowerCase()
              .includes(value) ||
            booking.destination
              .toLowerCase()
              .includes(value) ||
            booking.status
              .toLowerCase()
              .includes(value)
          );
        }
      );
    }, [bookings, search]);

  const activeBookings =
    bookings.filter(
      (booking) =>
        booking.status !== "Completed" &&
        booking.status !== "Cancelled"
    ).length;

  const completedBookings =
    bookings.filter(
      (booking) =>
        booking.status === "Completed"
    ).length;

  return (
    <main className="adminBookingsPage">

      <section className="adminBookingsHero">

        <div>
          <span className="adminBookingsBadge">
            📦 TRANSPORT BOOKINGS
          </span>

          <h1>
            Transport Bookings
          </h1>

          <p>
            View farmer transport requests and
            manage booking status.
          </p>
        </div>

        <div className="adminBookingsHeroActions">

          <button
            onClick={() =>
              router.push("/admin")
            }
            className="adminBackButton"
          >
            ← Dashboard
          </button>

          <button
            onClick={loadBookings}
            className="adminRefreshButton"
          >
            Refresh
          </button>

        </div>

      </section>


      <section className="adminBookingStats">

        <div className="adminBookingStatCard">

          <span>
            Total Bookings
          </span>

          <strong>
            {bookings.length}
          </strong>

        </div>


        <div className="adminBookingStatCard">

          <span>
            Active Bookings
          </span>

          <strong>
            {activeBookings}
          </strong>

        </div>


        <div className="adminBookingStatCard">

          <span>
            Completed
          </span>

          <strong>
            {completedBookings}
          </strong>

        </div>

      </section>


      <section className="adminBookingSearch">

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search farmer, phone, crop, transporter, route or status..."
        />

      </section>


      {loading && (
        <div className="adminBookingsMessage">
          Loading transport bookings...
        </div>
      )}


      {!loading && message && (
        <div className="adminBookingsError">
          {message}
        </div>
      )}


      {!loading &&
        !message &&
        bookings.length === 0 && (
          <div className="adminNoBookings">

            <div>
              📦
            </div>

            <h2>
              No Transport Bookings
            </h2>

            <p>
              Farmer transport bookings will
              appear here.
            </p>

          </div>
        )}


      {!loading &&
        !message &&
        bookings.length > 0 &&
        filteredBookings.length === 0 && (
          <div className="adminNoBookings">

            <div>
              🔍
            </div>

            <h2>
              No Matching Bookings
            </h2>

            <p>
              Try another farmer, crop,
              transporter or status.
            </p>

          </div>
        )}


      {!loading &&
        !message &&
        filteredBookings.length > 0 && (
          <section className="adminBookingsGrid">

            {filteredBookings.map(
              (booking) => (

                <article
                  key={booking.id}
                  className="adminBookingCard"
                >

                  <div className="adminBookingCardTop">

                    <div className="adminBookingIcon">
                      📦
                    </div>

                    <div className="adminBookingTopInfo">

                      <span className="adminBookingId">
                        Booking #{booking.id}
                      </span>

                      <span
                        className={`adminBookingStatus ${getBookingStatusClass(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>

                    </div>

                  </div>


                  <h2>
                    {booking.crop}
                  </h2>

                  <p className="adminBookingTransporter">
                    🚚 {booking.transporter_name}
                  </p>


                  <div className="adminBookingDetails">

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
                        Phone
                      </span>

                      <strong>
                        {booking.phone}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Quantity
                      </span>

                      <strong>
                        {booking.quantity}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Transporter ID
                      </span>

                      <strong>
                        #{booking.transporter_id}
                      </strong>
                    </div>

                  </div>


                  <div className="adminBookingRoute">

                    <div>

                      <span>
                        📍 Pickup
                      </span>

                      <strong>
                        {booking.pickup}
                      </strong>

                    </div>


                    <div className="adminBookingArrow">
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


                  <div className="adminBookingWorkflow">

                    <span>
                      Update Booking Status
                    </span>

                    <div className="adminBookingWorkflowButtons">

                      <button
                        type="button"
                        disabled={
                          updatingId === booking.id ||
                          booking.status === "Confirmed"
                        }
                        onClick={() =>
                          updateBookingStatus(
                            booking.id,
                            "Confirmed"
                          )
                        }
                        className="bookingConfirmButton"
                      >
                        Confirmed
                      </button>


                      <button
                        type="button"
                        disabled={
                          updatingId === booking.id ||
                          booking.status === "In Transit"
                        }
                        onClick={() =>
                          updateBookingStatus(
                            booking.id,
                            "In Transit"
                          )
                        }
                        className="bookingTransitButton"
                      >
                        In Transit
                      </button>


                      <button
                        type="button"
                        disabled={
                          updatingId === booking.id ||
                          booking.status === "Completed"
                        }
                        onClick={() =>
                          updateBookingStatus(
                            booking.id,
                            "Completed"
                          )
                        }
                        className="bookingCompleteButton"
                      >
                        Completed
                      </button>


                      <button
                        type="button"
                        disabled={
                          updatingId === booking.id ||
                          booking.status === "Cancelled"
                        }
                        onClick={() =>
                          updateBookingStatus(
                            booking.id,
                            "Cancelled"
                          )
                        }
                        className="bookingCancelButton"
                      >
                        Cancel
                      </button>

                    </div>

                  </div>


                  <a
                    href={`tel:${booking.phone}`}
                    className="adminCallBookingFarmer"
                  >
                    📞 Call Farmer
                  </a>

                </article>

              )
            )}

          </section>
        )}

    </main>
  );
}


function getBookingStatusClass(
  status: string
) {
  return (
    "booking-" +
    status
      .toLowerCase()
      .replaceAll(" ", "-")
  );
}