"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Transporter = {
  id: number;
  name: string;
  phone: string;
  vehicle: string;
  capacity: number;
  rate_per_km: number;
  city: string;
};

export default function AdminTransportersPage() {
  const router = useRouter();

  const [transporters, setTransporters] =
    useState<Transporter[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    const token =
      localStorage.getItem("adminToken");

    if (!token) {
      router.replace("/admin-login");
      return;
    }

    loadTransporters();
  }, [router]);

  async function loadTransporters() {
    try {
      setLoading(true);
      setMessage("");

      const token =
        localStorage.getItem("adminToken");

      const response = await fetch(
        "http://192.168.0.106:8000/api/admin/transporters",
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
            "Unable to load transporters."
        );
        return;
      }

      setTransporters(data);
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to connect to FarmerSaathi backend."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredTransporters =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return transporters;
      }

      return transporters.filter(
        (transporter) => {
          return (
            transporter.name
              .toLowerCase()
              .includes(value) ||
            transporter.phone
              .toLowerCase()
              .includes(value) ||
            transporter.vehicle
              .toLowerCase()
              .includes(value) ||
            transporter.city
              .toLowerCase()
              .includes(value)
          );
        }
      );
    }, [transporters, search]);

  const averageRate =
    transporters.length > 0
      ? (
          transporters.reduce(
            (sum, item) =>
              sum + item.rate_per_km,
            0
          ) / transporters.length
        ).toFixed(2)
      : "0.00";

  return (
    <main className="adminTransportersPage">

      <section className="adminTransportersHero">

        <div>
          <span className="adminTransportersBadge">
            🚚 TRANSPORT MANAGEMENT
          </span>

          <h1>
            Transporters
          </h1>

          <p>
            View transport providers available
            on FarmerSaathi.
          </p>
        </div>

        <div className="adminTransportersHeroActions">

          <button
            onClick={() =>
              router.push("/admin")
            }
            className="adminBackButton"
          >
            ← Dashboard
          </button>

          <button
            onClick={loadTransporters}
            className="adminRefreshButton"
          >
            Refresh
          </button>

        </div>

      </section>


      <section className="adminTransporterStats">

        <div className="adminTransporterStatCard">

          <span>
            Total Transporters
          </span>

          <strong>
            {transporters.length}
          </strong>

        </div>

        <div className="adminTransporterStatCard">

          <span>
            Average Rate / KM
          </span>

          <strong>
            ₹{averageRate}
          </strong>

        </div>

      </section>


      <section className="adminTransporterSearch">

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search by name, phone, vehicle or city..."
        />

      </section>


      {loading && (
        <div className="adminTransportersMessage">
          Loading transporters...
        </div>
      )}


      {!loading && message && (
        <div className="adminTransportersError">
          {message}
        </div>
      )}


      {!loading &&
        !message &&
        transporters.length === 0 && (
          <div className="adminNoTransporters">

            <div>
              🚚
            </div>

            <h2>
              No Transporters Found
            </h2>

            <p>
              Transport providers will appear here.
            </p>

          </div>
        )}


      {!loading &&
        !message &&
        transporters.length > 0 &&
        filteredTransporters.length === 0 && (
          <div className="adminNoTransporters">

            <div>
              🔍
            </div>

            <h2>
              No Matching Transporters
            </h2>

            <p>
              Try a different name, phone,
              vehicle or city.
            </p>

          </div>
        )}


      {!loading &&
        !message &&
        filteredTransporters.length > 0 && (
          <section className="adminTransportersGrid">

            {filteredTransporters.map(
              (transporter) => (

                <article
                  key={transporter.id}
                  className="adminTransporterCard"
                >

                  <div className="adminTransporterCardTop">

                    <div className="adminTransporterIcon">
                      🚚
                    </div>

                    <span className="adminTransporterId">
                      Transporter #{transporter.id}
                    </span>

                  </div>


                  <h2>
                    {transporter.name}
                  </h2>

                  <p className="adminTransporterVehicle">
                    {transporter.vehicle}
                  </p>


                  <div className="adminTransporterDetails">

                    <div>
                      <span>
                        Phone
                      </span>

                      <strong>
                        {transporter.phone}
                      </strong>
                    </div>


                    <div>
                      <span>
                        City
                      </span>

                      <strong>
                        {transporter.city}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Capacity
                      </span>

                      <strong>
                        {transporter.capacity}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Rate / KM
                      </span>

                      <strong>
                        ₹{transporter.rate_per_km}
                      </strong>
                    </div>

                  </div>


                  <a
                    href={`tel:${transporter.phone}`}
                    className="adminCallTransporterButton"
                  >
                    📞 Call Transporter
                  </a>

                </article>

              )
            )}

          </section>
        )}

    </main>
  );
}