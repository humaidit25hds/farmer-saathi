"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import Link from "next/link";


type SOSRequest = {
  id: number;

  farmer_id: number | null;

  farmer_name: string;

  phone: string;

  emergency_type: string;

  details: string;

  latitude: number | null;

  longitude: number | null;

  status: string;

  created_at: string;
};


export default function MySOSPage() {
  const router =
    useRouter();


  const [
    checkingLogin,
    setCheckingLogin,
  ] = useState(true);


  const [
    farmerId,
    setFarmerId,
  ] = useState("");


  const [
    farmerName,
    setFarmerName,
  ] = useState("");


  const [
    farmerPhone,
    setFarmerPhone,
  ] = useState("");


  const [
    requests,
    setRequests,
  ] = useState<SOSRequest[]>(
    []
  );


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  // ==========================================
  // CHECK FARMER LOGIN
  // ==========================================

  useEffect(() => {
    const loggedIn =
      localStorage.getItem(
        "farmerLoggedIn"
      );

    const token =
      localStorage.getItem(
        "farmerToken"
      );

    const savedFarmerId =
      localStorage.getItem(
        "farmerId"
      );

    const savedName =
      localStorage.getItem(
        "farmerName"
      );

    const savedPhone =
      localStorage.getItem(
        "farmerPhone"
      );


    if (
      loggedIn !== "true" ||
      !token ||
      !savedPhone
    ) {
      router.replace(
        "/login"
      );

      return;
    }


    setFarmerId(
      savedFarmerId || ""
    );


    setFarmerName(
      savedName || "Farmer"
    );


    setFarmerPhone(
      savedPhone
    );


    setCheckingLogin(
      false
    );

  }, [router]);


  // ==========================================
  // LOAD SOS + AUTO REFRESH
  // ==========================================

  useEffect(() => {
    if (
      checkingLogin ||
      !farmerPhone
    ) {
      return;
    }


    loadFarmerSOS();


    const interval =
      setInterval(() => {
        loadFarmerSOS(
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
    farmerPhone,
  ]);


  // ==========================================
  // LOAD FARMER SOS
  // ==========================================

  async function loadFarmerSOS(
    showLoading = true
  ) {
    if (!farmerPhone) {
      return;
    }


    const token =
      localStorage.getItem(
        "farmerToken"
      );


    if (!token) {
      router.replace(
        "/login"
      );

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
          `http://192.168.0.106:8000/api/sos/farmer/${encodeURIComponent(
            farmerPhone
          )}`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            cache: "no-store",
          }
        );


      const data =
        await response.json();


      // ======================================
      // SESSION EXPIRED
      // ======================================

      if (
        response.status ===
        401
      ) {
        localStorage.removeItem(
          "farmerToken"
        );

        localStorage.removeItem(
          "farmerLoggedIn"
        );


        alert(
          "Your farmer session has expired. Please login again."
        );


        router.replace(
          "/login"
        );

        return;
      }


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
        "SOS history temporarily unavailable:",
        error
      );


      if (showLoading) {
        setError(
          "Could not load your SOS requests."
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
  // STATS
  // ==========================================

  const activeCount =
    requests.filter(
      (request) =>
        request.status !==
        "Resolved"
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
  // LOGIN SCREEN
  // ==========================================

  if (checkingLogin) {
    return (
      <main className="mySOSAppLoading">

        <div>
          🆘
        </div>

        <p>
          Checking FarmerSaathi login...
        </p>

      </main>
    );
  }


  return (
    <main className="mySOSAppPage">

      {/* =====================================
          HERO
      ===================================== */}

      <section className="mySOSAppHero">

        <div className="mySOSAppHeroInner">

          <div>

            <span className="mySOSAppTag">
              🆘 MY EMERGENCY REQUESTS
            </span>


            <h1>
              Track My SOS
            </h1>


            <p>
              Hello {farmerName}. Check
              whether your emergency request
              has been received, is being
              handled, or has been resolved.
            </p>

          </div>


          <div className="mySOSHeroActions">

            <button
              type="button"

              onClick={() =>
                loadFarmerSOS()
              }

              className="mySOSRefreshButton"
            >
              🔄 Refresh
            </button>


            <Link
              href="/sos"
              className="mySOSNewButton"
            >
              🆘 Send New SOS
            </Link>

          </div>

        </div>

      </section>


      <section className="mySOSAppContent">

        {/* =================================
            FARMER INFO
        ================================= */}

        <section className="mySOSFarmerCard">

          <div className="mySOSFarmerAvatar">
            👨‍🌾
          </div>


          <div className="mySOSFarmerIdentity">

            <span>
              FARMER ACCOUNT
            </span>

            <strong>
              {farmerName}
            </strong>

            <small>
              📱 {farmerPhone}
            </small>

          </div>


          {farmerId && (

            <div className="mySOSFarmerId">

              <small>
                ACCOUNT ID
              </small>

              <strong>
                #{farmerId}
              </strong>

            </div>

          )}

        </section>


        {/* =================================
            STATS
        ================================= */}

        <section className="mySOSStats">

          <div>

            <span>
              🆘 TOTAL
            </span>

            <strong>
              {requests.length}
            </strong>

            <small>
              requests
            </small>

          </div>


          <div className="mySOSActiveStat">

            <span>
              🚨 ACTIVE
            </span>

            <strong>
              {activeCount}
            </strong>

            <small>
              being handled
            </small>

          </div>


          <div className="mySOSDispatchStat">

            <span>
              🚑 HELP SENT
            </span>

            <strong>
              {dispatchedCount}
            </strong>

            <small>
              dispatched
            </small>

          </div>


          <div className="mySOSResolvedStat">

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
            INFO NOTICE
        ================================= */}

        {activeCount > 0 && (

          <section className="mySOSActiveNotice">

            <div>
              🚨
            </div>


            <div>

              <span>
                ACTIVE SOS
              </span>

              <strong>
                Your emergency request is still active.
              </strong>

              <p>
                Keep your phone available so the
                response team can contact you.
              </p>

            </div>

          </section>

        )}


        {/* =================================
            SECTION HEADING
        ================================= */}

        <section className="mySOSSectionHeading">

          <div>

            <span>
              SOS HISTORY
            </span>

            <h2>
              Your emergency requests
            </h2>

          </div>


          <small>
            Status refreshes every 5 seconds
          </small>

        </section>


        {/* =================================
            LOADING
        ================================= */}

        {loading && (

          <div className="mySOSLoadingCard">

            <div>
              🆘
            </div>

            <p>
              Loading your SOS requests...
            </p>

          </div>

        )}


        {/* =================================
            ERROR
        ================================= */}

        {!loading &&
          error && (

          <div className="mySOSErrorCard">

            <strong>
              ⚠️ {error}
            </strong>


            <button
              type="button"

              onClick={() =>
                loadFarmerSOS()
              }
            >
              Try Again
            </button>

          </div>

        )}


        {/* =================================
            EMPTY
        ================================= */}

        {!loading &&
          !error &&
          requests.length ===
            0 && (

          <div className="mySOSEmptyCard">

            <div>
              ✅
            </div>

            <h2>
              No SOS requests
            </h2>

            <p>
              You have not sent any emergency
              requests yet.
            </p>


            <Link
              href="/sos"
            >
              🆘 Send SOS
            </Link>

          </div>

        )}


        {/* =================================
            SOS LIST
        ================================= */}

        {!loading &&
          !error &&
          requests.length >
            0 && (

          <section className="mySOSRequestList">

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
                        ? "mySOSRequestCard resolved"
                        : "mySOSRequestCard"
                    }
                  >

                    {/* CARD HEADER */}

                    <div className="mySOSCardHeader">

                      <div className="mySOSCardIdentity">

                        <div className="mySOSCardIcon">
                          🆘
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

                          <small>
                            {formatSOSDate(
                              request.created_at
                            )}
                          </small>

                        </div>

                      </div>


                      <span
                        className={`mySOSStatusPill ${getSOSStatusClass(
                          request.status
                        )}`}
                      >
                        {getSOSStatusIcon(
                          request.status
                        )}{" "}
                        {request.status}
                      </span>

                    </div>


                    {/* STATUS MESSAGE */}

                    <section className="mySOSStatusMessage">

                      <span>
                        STATUS UPDATE
                      </span>

                      <strong>
                        {getSOSStatusTitle(
                          request.status
                        )}
                      </strong>

                      <p>
                        {getSOSStatusMessage(
                          request.status
                        )}
                      </p>

                    </section>


                    {/* PROGRESS */}

                    <section className="mySOSProgress">

                      <MySOSStep
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
                            ? "mySOSProgressLine active"
                            : "mySOSProgressLine"
                        }
                      />


                      <MySOSStep
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
                            ? "mySOSProgressLine active"
                            : "mySOSProgressLine"
                        }
                      />


                      <MySOSStep
                        label="Help Sent"
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
                            ? "mySOSProgressLine active"
                            : "mySOSProgressLine"
                        }
                      />


                      <MySOSStep
                        label="Resolved"
                        icon="✅"
                        active={isSOSStepActive(
                          request.status,
                          "Resolved"
                        )}
                      />

                    </section>


                    {/* DETAILS */}

                    <section className="mySOSDetailsCard">

                      <span>
                        EMERGENCY DETAILS
                      </span>

                      <p>
                        {request.details ||
                          "No additional emergency details were provided."}
                      </p>

                    </section>


                    {/* LOCATION */}

                    <section className="mySOSLocationCard">

                      <div className="mySOSLocationHeading">

                        <div>

                          <span>
                            📍 SOS LOCATION
                          </span>

                          <strong>
                            GPS coordinates
                          </strong>

                        </div>


                        <span
                          className={
                            hasLocation
                              ? "mySOSGPSAvailable"
                              : "mySOSGPSUnavailable"
                          }
                        >
                          {hasLocation
                            ? "● Available"
                            : "● Not available"}
                        </span>

                      </div>


                      {hasLocation ? (

                        <div className="mySOSLocationData">

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

                        <p className="mySOSNoGPS">
                          GPS location was not
                          included with this request.
                        </p>

                      )}


                      <button
                        type="button"

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
                        📍 Open SOS Location
                      </button>

                    </section>


                    {/* FOOTER */}

                    <div className="mySOSCardFooter">

                      <span>
                        Need another emergency request?
                      </span>


                      <Link
                        href="/sos"
                      >
                        🆘 Send SOS
                      </Link>

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
// STATUS STEP
// ==========================================

function MySOSStep({
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
          ? "mySOSProgressStep active"
          : "mySOSProgressStep"
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
    "my-sos-status-" +
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
      return "🔴";

    case "Responding":
      return "🟡";

    case "Help Dispatched":
      return "🚑";

    case "Resolved":
      return "✅";

    default:
      return "ℹ️";
  }
}


// ==========================================
// STATUS TITLE
// ==========================================

function getSOSStatusTitle(
  status: string
) {
  switch (status) {
    case "Received":
      return "SOS received";

    case "Responding":
      return "Emergency team responding";

    case "Help Dispatched":
      return "Help has been dispatched";

    case "Resolved":
      return "Emergency marked resolved";

    default:
      return "SOS is being processed";
  }
}


// ==========================================
// STATUS MESSAGE
// ==========================================

function getSOSStatusMessage(
  status: string
) {
  switch (status) {
    case "Received":
      return (
        "Your SOS has reached the FarmerSaathi emergency dashboard."
      );

    case "Responding":
      return (
        "Your SOS is being reviewed and the response team is handling your request."
      );

    case "Help Dispatched":
      return (
        "The dashboard shows that help has been dispatched for this request."
      );

    case "Resolved":
      return (
        "This SOS request has been marked as resolved."
      );

    default:
      return (
        "Your SOS request is being processed."
      );
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