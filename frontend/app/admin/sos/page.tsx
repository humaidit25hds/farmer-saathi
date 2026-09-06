"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SOSRequest = {
  id: number;
  farmer_name: string;
  phone: string;
  emergency_type: string;
  details?: string;
  latitude?: number;
  longitude?: number;
  status: string;
  created_at?: string;
};

export default function AdminSOSPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<SOSRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      router.replace("/admin-login");
      return;
    }

    loadSOS();
  }, [router]);

  async function loadSOS() {
    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        "http://192.168.0.106:8000/api/sos",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail || "Unable to load SOS requests."
        );
        return;
      }

      setRequests(data);
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to connect to FarmerSaathi backend."
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(
    id: number,
    status: string
  ) {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `http://192.168.0.106:8000/api/sos/${id}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            status: status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.detail || "Unable to update status."
        );
        return;
      }

      await loadSOS();
    } catch (error) {
      console.error(error);

      alert(
        "Unable to connect to backend."
      );
    }
  }

  function openMap(
    latitude?: number,
    longitude?: number
  ) {
    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      alert("Location not available.");
      return;
    }

    window.open(
      `https://www.google.com/maps?q=${latitude},${longitude}`,
      "_blank"
    );
  }

  const activeRequests = requests.filter(
    (item) => item.status !== "Resolved"
  ).length;

  return (
    <main className="emergencyDashboard">

      <section className="emergencyDashboardHero">

        <div>
          <span className="emergencyDashboardBadge">
            🚨 ADMIN EMERGENCY CENTER
          </span>

          <h1>
            SOS Requests
          </h1>

          <p>
            Monitor farmer emergencies and update
            response status.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>

          <button
            onClick={() => router.push("/admin")}
            className="refreshSOSButton"
          >
            ← Dashboard
          </button>

          <button
            onClick={loadSOS}
            className="refreshSOSButton"
          >
            Refresh
          </button>

        </div>

      </section>


      <section className="emergencyStats">

        <div className="emergencyStatCard">
          <span>
            Total Requests
          </span>

          <strong>
            {requests.length}
          </strong>
        </div>


        <div className="emergencyStatCard danger">
          <span>
            Active Emergencies
          </span>

          <strong>
            {activeRequests}
          </strong>
        </div>

      </section>


      {loading && (
        <div className="dashboardLoading">
          Loading SOS requests...
        </div>
      )}


      {!loading && message && (
        <div className="dashboardError">
          {message}
        </div>
      )}


      {!loading &&
        !message &&
        requests.length === 0 && (
          <div className="noSOSRequests">

            <div>
              ✅
            </div>

            <h2>
              No SOS Requests
            </h2>

            <p>
              There are currently no emergency requests.
            </p>

          </div>
        )}


      {!loading &&
        !message &&
        requests.length > 0 && (
          <section className="sosRequestGrid">

            {requests.map((item) => (

              <article
                key={item.id}
                className="sosRequestCard"
              >

                <div className="sosCardHeader">

                  <div>
                    <span className="sosNumber">
                      SOS #{item.id}
                    </span>

                    <h2>
                      {item.emergency_type}
                    </h2>
                  </div>

                  <span
                    className={`sosStatus ${getStatusClass(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>

                </div>


                <div className="sosFarmerInfo">

                  <div>
                    <span>
                      Farmer
                    </span>

                    <strong>
                      {item.farmer_name}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Phone
                    </span>

                    <strong>
                      {item.phone}
                    </strong>
                  </div>

                </div>


                <div className="sosDetails">

                  <span>
                    Emergency Details
                  </span>

                  <p>
                    {item.details ||
                      "No additional details provided."}
                  </p>

                </div>


                <div className="sosLocation">

                  <span>
                    📍 Location
                  </span>

                  <p>
                    Latitude:{" "}
                    {item.latitude ?? "Not available"}
                  </p>

                  <p>
                    Longitude:{" "}
                    {item.longitude ?? "Not available"}
                  </p>

                </div>


                <div className="sosCardActions">

                  <button
                    onClick={() =>
                      openMap(
                        item.latitude,
                        item.longitude
                      )
                    }
                    className="openMapButton"
                  >
                    📍 Open Map
                  </button>


                  <a
                    href={`tel:${item.phone}`}
                    className="callFarmerButton"
                  >
                    📞 Call Farmer
                  </a>

                </div>


                <div className="sosWorkflow">

                  <span>
                    Update Emergency Status
                  </span>

                  <div className="sosWorkflowButtons">

                    <button
                      onClick={() =>
                        updateStatus(
                          item.id,
                          "Responding"
                        )
                      }
                      className="respondingButton"
                      disabled={
                        item.status === "Responding"
                      }
                    >
                      Responding
                    </button>


                    <button
                      onClick={() =>
                        updateStatus(
                          item.id,
                          "Help Dispatched"
                        )
                      }
                      className="dispatchButton"
                      disabled={
                        item.status ===
                        "Help Dispatched"
                      }
                    >
                      Help Dispatched
                    </button>


                    <button
                      onClick={() =>
                        updateStatus(
                          item.id,
                          "Resolved"
                        )
                      }
                      className="resolvedButton"
                      disabled={
                        item.status === "Resolved"
                      }
                    >
                      Resolved
                    </button>

                  </div>

                </div>


                {item.created_at && (
                  <div className="sosCreatedTime">
                    Created:{" "}
                    {new Date(
                      item.created_at
                    ).toLocaleString()}
                  </div>
                )}

              </article>

            ))}

          </section>
        )}

    </main>
  );
}


function getStatusClass(status: string) {
  const normalized =
    status
      .toLowerCase()
      .replaceAll(" ", "-");

  return `status-${normalized}`;
}