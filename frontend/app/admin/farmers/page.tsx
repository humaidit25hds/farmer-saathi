"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Farmer = {
  id: number;
  name: string;
  phone: string;
  village?: string | null;
};

export default function AdminFarmersPage() {
  const router = useRouter();

  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      router.replace("/admin-login");
      return;
    }

    loadFarmers();
  }, [router]);

  async function loadFarmers() {
    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        "http://192.168.0.106:8000/api/admin/farmers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail || "Unable to load farmers."
        );
        return;
      }

      setFarmers(data);
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to connect to FarmerSaathi backend."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredFarmers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return farmers;
    }

    return farmers.filter((farmer) => {
      return (
        farmer.name.toLowerCase().includes(value) ||
        farmer.phone.toLowerCase().includes(value) ||
        (farmer.village || "")
          .toLowerCase()
          .includes(value)
      );
    });
  }, [farmers, search]);

  return (
    <main className="adminFarmersPage">

      <section className="adminFarmersHero">

        <div>
          <span className="adminFarmersBadge">
            👨‍🌾 FARMER MANAGEMENT
          </span>

          <h1>
            Registered Farmers
          </h1>

          <p>
            View all farmers registered with FarmerSaathi.
          </p>
        </div>

        <div className="adminFarmersHeroActions">

          <button
            onClick={() => router.push("/admin")}
            className="adminBackButton"
          >
            ← Dashboard
          </button>

          <button
            onClick={loadFarmers}
            className="adminRefreshButton"
          >
            Refresh
          </button>

        </div>

      </section>


      <section className="adminFarmerStats">

        <div className="adminFarmerStatCard">

          <span>
            Total Registered Farmers
          </span>

          <strong>
            {farmers.length}
          </strong>

        </div>


        <div className="adminFarmerStatCard">

          <span>
            Search Results
          </span>

          <strong>
            {filteredFarmers.length}
          </strong>

        </div>

      </section>


      <section className="adminFarmerSearch">

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search by farmer name, phone or village..."
        />

      </section>


      {loading && (
        <div className="adminFarmersMessage">
          Loading registered farmers...
        </div>
      )}


      {!loading && message && (
        <div className="adminFarmersError">
          {message}
        </div>
      )}


      {!loading &&
        !message &&
        farmers.length === 0 && (
          <div className="adminNoFarmers">

            <div>
              👨‍🌾
            </div>

            <h2>
              No Farmers Registered
            </h2>

            <p>
              Farmer accounts will appear here after registration.
            </p>

          </div>
        )}


      {!loading &&
        !message &&
        farmers.length > 0 &&
        filteredFarmers.length === 0 && (
          <div className="adminNoFarmers">

            <div>
              🔍
            </div>

            <h2>
              No Matching Farmers
            </h2>

            <p>
              Try a different name, phone number or village.
            </p>

          </div>
        )}


      {!loading &&
        !message &&
        filteredFarmers.length > 0 && (
          <section className="adminFarmersGrid">

            {filteredFarmers.map(
              (farmer) => (

                <article
                  key={farmer.id}
                  className="adminFarmerCard"
                >

                  <div className="adminFarmerCardTop">

                    <div className="adminFarmerAvatar">
                      👨‍🌾
                    </div>

                    <span className="adminFarmerId">
                      Farmer #{farmer.id}
                    </span>

                  </div>


                  <h2>
                    {farmer.name}
                  </h2>


                  <div className="adminFarmerDetails">

                    <div>
                      <span>
                        Phone
                      </span>

                      <strong>
                        {farmer.phone}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Village
                      </span>

                      <strong>
                        {farmer.village ||
                          "Not provided"}
                      </strong>
                    </div>

                  </div>


                  <a
                    href={`tel:${farmer.phone}`}
                    className="adminCallFarmerButton"
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