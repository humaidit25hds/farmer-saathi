"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";


type SOSRequest = {
  id: number;

  farmer_name: string;

  phone: string;

  emergency_type: string;

  details: string;

  latitude: number | null;

  longitude: number | null;

  status: string;

  created_at: string;
};


export default function EmergencyDashboardPage() {
  const router =
    useRouter();


  const [
    checkingLogin,
    setCheckingLogin,
  ] =
    useState(true);


  const [
    adminName,
    setAdminName,
  ] =
    useState("");


  const [
    adminRole,
    setAdminRole,
  ] =
    useState("");


  const [
    adminToken,
    setAdminToken,
  ] =
    useState("");


  const [
    requests,
    setRequests,
  ] =
    useState<SOSRequest[]>(
      []
    );


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    updatingId,
    setUpdatingId,
  ] =
    useState<number | null>(
      null
    );


  // ==========================================
  // ADMIN LOGIN CHECK
  // ==========================================

  useEffect(() => {
    const loggedIn =
      localStorage.getItem(
        "adminLoggedIn"
      );

    const adminId =
      localStorage.getItem(
        "adminId"
      );

    const token =
      localStorage.getItem(
        "adminToken"
      );


    if (
      loggedIn !== "true" ||
      !adminId ||
      !token
    ) {
      clearAdminStorage();

      router.replace(
        "/admin-login"
      );

      return;
    }


    setAdminToken(
      token
    );


    setAdminName(
      localStorage.getItem(
        "adminName"
      ) ||
        "Admin"
    );


    setAdminRole(
      localStorage.getItem(
        "adminRole"
      ) ||
        "Emergency Admin"
    );


    setCheckingLogin(
      false
    );

  }, [router]);


  // ==========================================
  // AUTO REFRESH
  // ==========================================

  useEffect(() => {
    if (
      checkingLogin ||
      !adminToken
    ) {
      return;
    }


    loadSOSRequests();


    const interval =
      setInterval(() => {
        loadSOSRequests(
          false
        );
      }, 5000);


    return () => {
      clearInterval(
        interval
      );
    };

  }, [
    checkingLogin,
    adminToken,
  ]);


  // ==========================================
  // CLEAR ADMIN STORAGE
  // ==========================================

  function clearAdminStorage() {
    localStorage.removeItem(
      "adminLoggedIn"
    );

    localStorage.removeItem(
      "adminId"
    );

    localStorage.removeItem(
      "adminName"
    );

    localStorage.removeItem(
      "adminUsername"
    );

    localStorage.removeItem(
      "adminRole"
    );

    localStorage.removeItem(
      "adminToken"
    );
  }


  function handleUnauthorized() {
    clearAdminStorage();

    router.replace(
      "/admin-login"
    );
  }


  // ==========================================
  // LOAD SOS REQUESTS
  // ==========================================

  async function loadSOSRequests(
    showLoading = true
  ) {
    const token =
      localStorage.getItem(
        "adminToken"
      );


    if (!token) {
      handleUnauthorized();

      return;
    }


    if (showLoading) {
      setLoading(
        true
      );
    }


    setError(
      ""
    );


    try {
      const response =
        await fetch(
          "http://192.168.0.106:8000/api/sos",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            cache: "no-store",
          }
        );


      if (
        response.status ===
        401
      ) {
        handleUnauthorized();

        return;
      }


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Could not load SOS requests."
        );
      }


      if (!Array.isArray(data)) {
        throw new Error(
          "Invalid SOS response."
        );
      }


      setRequests(
        data
      );

    } catch (error) {
      console.warn(
        "SOS dashboard unavailable:",
        error
      );


      if (showLoading) {
        setError(
          "Could not connect to FarmerSaathi backend."
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
  // UPDATE STATUS
  // ==========================================

  async function updateStatus(
    sosId: number,
    newStatus: string
  ) {
    const token =
      localStorage.getItem(
        "adminToken"
      );


    if (!token) {
      handleUnauthorized();

      return;
    }


    setUpdatingId(
      sosId
    );


    try {
      const response =
        await fetch(
          `http://192.168.0.106:8000/api/sos/${sosId}/status`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({
                status:
                  newStatus,
              }),
          }
        );


      if (
        response.status ===
        401
      ) {
        handleUnauthorized();

        return;
      }


      const data =
        await response.json();


      if (!response.ok) {
        alert(
          data.detail ||
            "Could not update SOS status."
        );

        return;
      }


      setRequests(
        (
          oldRequests
        ) =>
          oldRequests.map(
            (
              request
            ) =>
              request.id ===
              sosId
                ? {
                    ...request,

                    status:
                      newStatus,
                  }
                : request
          )
      );

    } catch (error) {
      console.warn(
        "SOS status update unavailable:",
        error
      );


      alert(
        "Could not connect to FarmerSaathi backend."
      );

    } finally {
      setUpdatingId(
        null
      );
    }
  }


  // ==========================================
  // OPEN GPS LOCATION
  // ==========================================

  function openLocation(
    latitude: number | null,
    longitude: number | null
  ) {
    if (
      latitude === null ||
      longitude === null
    ) {
      alert(
        "GPS location is not available for this SOS request."
      );

      return;
    }


    window.open(
      `https://www.google.com/maps?q=${latitude},${longitude}`,
      "_blank",
      "noopener,noreferrer"
    );
  }


  // ==========================================
  // ADMIN LOGOUT
  // ==========================================

  async function adminLogout() {
    const token =
      localStorage.getItem(
        "adminToken"
      );


    if (token) {
      try {
        await fetch(
          "http://192.168.0.106:8000/api/admin/logout",
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      } catch {
        // Local logout will still continue
      }
    }


    clearAdminStorage();


    router.replace(
      "/admin-login"
    );
  }


  // ==========================================
  // STATS
  // ==========================================

  const activeEmergencies =
    requests.filter(
      (request) =>
        request.status !==
        "Resolved"
    ).length;


  const respondingCount =
    requests.filter(
      (request) =>
        request.status ===
        "Responding"
    ).length;


  const dispatchedCount =
    requests.filter(
      (request) =>
        request.status ===
        "Help Dispatched"
    ).length;


  const resolvedCount =
    requests.filter(
      (request) =>
        request.status ===
        "Resolved"
    ).length;


  // ==========================================
  // LOGIN LOADING
  // ==========================================

  if (checkingLogin) {
    return (
      <main className="emergencyAdminLoading">

        <div>
          🚨
        </div>

        <p>
          Checking Admin login...
        </p>

      </main>
    );
  }


  return (
    <main className="emergencyAdminPage">

      {/* =====================================
          HERO
      ===================================== */}

      <section className="emergencyAdminHero">

        <div className="emergencyAdminHeroInner">

          <div>

            <span className="emergencyAdminTag">
              🚨 EMERGENCY CONTROL CENTER
            </span>


            <h1>
              Farmer SOS Dashboard
            </h1>


            <p>
              Monitor emergency requests,
              contact farmers, open GPS
              locations and update response
              status.
            </p>


            <div className="emergencyAdminIdentity">

              <span>
                👤 {adminName}
              </span>

              <span>
                🛡️ {adminRole}
              </span>

            </div>

          </div>


          <div className="emergencyAdminHeroActions">

            <button
              type="button"

              className="emergencyAdminRefresh"

              onClick={() =>
                loadSOSRequests()
              }
            >
              🔄 Refresh
            </button>


            <button
              type="button"

              className="emergencyAdminLogout"

              onClick={
                adminLogout
              }
            >
              🚪 Logout
            </button>

          </div>

        </div>

      </section>


      <section className="emergencyAdminContent">

        {/* =================================
            EMERGENCY NOTICE
        ================================= */}

        {activeEmergencies > 0 && (

          <section className="emergencyAdminAlert">

            <div className="emergencyAdminAlertIcon">
              🚨
            </div>


            <div>

              <span>
                ACTIVE EMERGENCY ALERT
              </span>

              <strong>
                {activeEmergencies} active{" "}
                {activeEmergencies === 1
                  ? "request"
                  : "requests"}{" "}
                require attention
              </strong>

              <p>
                Review location and contact
                information before changing
                the response status.
              </p>

            </div>

          </section>

        )}


        {/* =================================
            STATS
        ================================= */}

        <section className="emergencyAdminStats">

          <div>

            <span>
              📋 TOTAL SOS
            </span>

            <strong>
              {requests.length}
            </strong>

            <small>
              received
            </small>

          </div>


          <div className="emergencyStatDanger">

            <span>
              🚨 ACTIVE
            </span>

            <strong>
              {activeEmergencies}
            </strong>

            <small>
              emergencies
            </small>

          </div>


          <div className="emergencyStatResponding">

            <span>
              🟡 RESPONDING
            </span>

            <strong>
              {respondingCount}
            </strong>

            <small>
              being handled
            </small>

          </div>


          <div className="emergencyStatDispatched">

            <span>
              🚑 DISPATCHED
            </span>

            <strong>
              {dispatchedCount}
            </strong>

            <small>
              help sent
            </small>

          </div>


          <div className="emergencyStatResolved">

            <span>
              ✅ RESOLVED
            </span>

            <strong>
              {resolvedCount}
            </strong>

            <small>
              completed
            </small>

          </div>

        </section>


        {/* =================================
            SECTION HEADING
        ================================= */}

        <section className="emergencyAdminSectionHeading">

          <div>

            <span>
              LIVE SOS REQUESTS
            </span>

            <h2>
              Emergency requests
            </h2>

          </div>


          <small>
            Automatically refreshes every 5 seconds
          </small>

        </section>


        {/* =================================
            LOADING
        ================================= */}

        {loading && (

          <div className="emergencyAdminLoadingCard">

            <div>
              🚨
            </div>

            <p>
              Loading emergency requests...
            </p>

          </div>

        )}


        {/* =================================
            ERROR
        ================================= */}

        {!loading &&
          error && (

          <div className="emergencyAdminError">
            ⚠️ {error}
          </div>

        )}


        {/* =================================
            EMPTY
        ================================= */}

        {!loading &&
          !error &&
          requests.length ===
            0 && (

          <div className="emergencyAdminEmpty">

            <div>
              ✅
            </div>

            <h2>
              No emergency requests
            </h2>

            <p>
              There are currently no
              FarmerSaathi SOS alerts.
            </p>

          </div>

        )}


        {/* =================================
            SOS CARDS
        ================================= */}

        {!loading &&
          !error &&
          requests.length >
            0 && (

          <section className="emergencyAdminSOSList">

            {requests.map(
              (
                request
              ) => {

                const hasLocation =
                  request.latitude !==
                    null &&
                  request.longitude !==
                    null;


                return (

                  <article
                    key={
                      request.id
                    }

                    className={
                      request.status ===
                      "Resolved"
                        ? "emergencyAdminSOSCard resolved"
                        : "emergencyAdminSOSCard"
                    }
                  >

                    {/* CARD HEADER */}

                    <div className="emergencySOSCardHeader">

                      <div className="emergencySOSHeaderLeft">

                        <div className="emergencySOSIcon">
                          🚨
                        </div>


                        <div>

                          <span>
                            SOS #{request.id}
                          </span>

                          <h2>
                            {
                              request.emergency_type
                            }
                          </h2>

                        </div>

                      </div>


                      <span
                        className={`emergencySOSStatus ${getSOSStatusClass(
                          request.status
                        )}`}
                      >
                        {getSOSStatusIcon(
                          request.status
                        )}{" "}
                        {request.status}
                      </span>

                    </div>


                    {/* FARMER INFO */}

                    <div className="emergencySOSFarmer">

                      <div>

                        <small>
                          👨‍🌾 FARMER
                        </small>

                        <strong>
                          {
                            request.farmer_name
                          }
                        </strong>

                      </div>


                      <div>

                        <small>
                          📞 PHONE
                        </small>

                        <strong>
                          {request.phone}
                        </strong>

                      </div>


                      <a
                        href={`tel:${request.phone}`}
                      >
                        📞 Call Farmer
                      </a>

                    </div>


                    {/* EMERGENCY DETAILS */}

                    <section className="emergencySOSDetails">

                      <span>
                        EMERGENCY DETAILS
                      </span>

                      <p>
                        {request.details ||
                          "No additional emergency details were provided."}
                      </p>

                    </section>


                    {/* GPS */}

                    <section className="emergencySOSLocation">

                      <div className="emergencySOSLocationHeader">

                        <div>

                          <span>
                            📍 GPS LOCATION
                          </span>

                          <h3>
                            Farmer location
                          </h3>

                        </div>


                        <span
                          className={
                            hasLocation
                              ? "emergencyGPSAvailable"
                              : "emergencyGPSUnavailable"
                          }
                        >
                          {hasLocation
                            ? "● GPS Available"
                            : "● No GPS"}
                        </span>

                      </div>


                      {hasLocation ? (

                        <div className="emergencyGPSData">

                          <div>

                            <small>
                              Latitude
                            </small>

                            <strong>
                              {
                                request.latitude
                              }
                            </strong>

                          </div>


                          <div>

                            <small>
                              Longitude
                            </small>

                            <strong>
                              {
                                request.longitude
                              }
                            </strong>

                          </div>

                        </div>

                      ) : (

                        <p className="emergencyNoGPSMessage">
                          GPS coordinates were not
                          included with this SOS.
                        </p>

                      )}


                      <button
                        type="button"

                        className="emergencyOpenMapButton"

                        disabled={
                          !hasLocation
                        }

                        onClick={() =>
                          openLocation(
                            request.latitude,
                            request.longitude
                          )
                        }
                      >
                        📍 Open in Google Maps
                      </button>

                    </section>


                    {/* WORKFLOW */}

                    <section className="emergencySOSWorkflow">

                      <div className="emergencySOSWorkflowHeading">

                        <div>

                          <span>
                            RESPONSE WORKFLOW
                          </span>

                          <h3>
                            Update emergency status
                          </h3>

                        </div>


                        {updatingId ===
                          request.id && (

                          <small>
                            Updating...
                          </small>

                        )}

                      </div>


                      <div className="emergencySOSProgress">

                        <EmergencyStep
                          label="Received"
                          icon="🚨"
                          active={isSOSStepActive(
                            request.status,
                            "Received"
                          )}
                        />


                        <div
                          className={
                            isSOSStepActive(
                              request.status,
                              "Responding"
                            )
                              ? "emergencySOSProgressLine active"
                              : "emergencySOSProgressLine"
                          }
                        />


                        <EmergencyStep
                          label="Responding"
                          icon="🟡"
                          active={isSOSStepActive(
                            request.status,
                            "Responding"
                          )}
                        />


                        <div
                          className={
                            isSOSStepActive(
                              request.status,
                              "Help Dispatched"
                            )
                              ? "emergencySOSProgressLine active"
                              : "emergencySOSProgressLine"
                          }
                        />


                        <EmergencyStep
                          label="Dispatched"
                          icon="🚑"
                          active={isSOSStepActive(
                            request.status,
                            "Help Dispatched"
                          )}
                        />


                        <div
                          className={
                            isSOSStepActive(
                              request.status,
                              "Resolved"
                            )
                              ? "emergencySOSProgressLine active"
                              : "emergencySOSProgressLine"
                          }
                        />


                        <EmergencyStep
                          label="Resolved"
                          icon="✅"
                          active={isSOSStepActive(
                            request.status,
                            "Resolved"
                          )}
                        />

                      </div>


                      <div className="emergencySOSWorkflowButtons">

                        <button
                          type="button"

                          className="emergencyRespondButton"

                          disabled={
                            updatingId ===
                              request.id ||
                            request.status ===
                              "Responding" ||
                            request.status ===
                              "Help Dispatched" ||
                            request.status ===
                              "Resolved"
                          }

                          onClick={() =>
                            updateStatus(
                              request.id,
                              "Responding"
                            )
                          }
                        >
                          🟡 Responding
                        </button>


                        <button
                          type="button"

                          className="emergencyDispatchButton"

                          disabled={
                            updatingId ===
                              request.id ||
                            request.status ===
                              "Help Dispatched" ||
                            request.status ===
                              "Resolved"
                          }

                          onClick={() =>
                            updateStatus(
                              request.id,
                              "Help Dispatched"
                            )
                          }
                        >
                          🚑 Help Dispatched
                        </button>


                        <button
                          type="button"

                          className="emergencyResolvedButton"

                          disabled={
                            updatingId ===
                              request.id ||
                            request.status ===
                              "Resolved"
                          }

                          onClick={() =>
                            updateStatus(
                              request.id,
                              "Resolved"
                            )
                          }
                        >
                          ✅ Resolved
                        </button>

                      </div>

                    </section>


                    {/* FOOTER */}

                    <div className="emergencySOSFooter">

                      <span>
                        🕒 Received
                      </span>

                      <strong>
                        {formatSOSDate(
                          request.created_at
                        )}
                      </strong>

                    </div>

                  </article>

                );

              }
            )}

          </section>

        )}

      </section>

    </main>
  );
}


// ==========================================
// EMERGENCY STEP
// ==========================================

function EmergencyStep({
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
          ? "emergencySOSStep active"
          : "emergencySOSStep"
      }
    >

      <div>
        {icon}
      </div>

      <span>
        {label}
      </span>

    </div>
  );
}


// ==========================================
// STEP ORDER
// ==========================================

function isSOSStepActive(
  currentStatus: string,
  step: string
) {
  const order = [
    "Received",
    "Responding",
    "Help Dispatched",
    "Resolved",
  ];


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

function getSOSStatusClass(
  status: string
) {
  return (
    "sos-status-" +
    status
      .toLowerCase()
      .replaceAll(
        " ",
        "-"
      )
  );
}


// ==========================================
// STATUS ICON
// ==========================================

function getSOSStatusIcon(
  status: string
) {
  switch (status) {
    case "Received":
      return "🚨";

    case "Responding":
      return "🟡";

    case "Help Dispatched":
      return "🚑";

    case "Resolved":
      return "✅";

    default:
      return "🚨";
  }
}


// ==========================================
// DATE FORMAT
// ==========================================

function formatSOSDate(
  dateValue: string
) {
  if (!dateValue) {
    return "Time unavailable";
  }


  const date =
    new Date(
      dateValue
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return dateValue;
  }


  return date.toLocaleString();
}