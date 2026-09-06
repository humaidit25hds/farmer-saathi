"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

const API_BASE_URL =
  "http://192.168.0.106:8000";

export default function SOSPage() {
  const router =
    useRouter();

  const [
    checkingLogin,
    setCheckingLogin,
  ] =
    useState(true);

  const [
    farmerId,
    setFarmerId,
  ] =
    useState("");

  const [
    farmerToken,
    setFarmerToken,
  ] =
    useState("");

  const [
    farmerName,
    setFarmerName,
  ] =
    useState("");

  const [
    phone,
    setPhone,
  ] =
    useState("");

  const [
    emergencyType,
    setEmergencyType,
  ] =
    useState(
      "Snake bite"
    );

  const [
    details,
    setDetails,
  ] =
    useState("");

  const [
    status,
    setStatus,
  ] =
    useState("");

  const [
    sending,
    setSending,
  ] =
    useState(false);

  const [
    lastSOSId,
    setLastSOSId,
  ] =
    useState<number | null>(
      null
    );

  // =========================================================
  // LOGIN CHECK
  // =========================================================

  useEffect(() => {
    const loggedIn =
      localStorage.getItem(
        "farmerLoggedIn"
      );

    const savedFarmerId =
      localStorage.getItem(
        "farmerId"
      );

    const savedToken =
      localStorage.getItem(
        "farmerToken"
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
      !savedFarmerId ||
      !savedToken
    ) {
      localStorage.removeItem(
        "farmerLoggedIn"
      );

      localStorage.removeItem(
        "farmerToken"
      );

      router.replace(
        "/login"
      );

      return;
    }

    setFarmerId(
      savedFarmerId
    );

    setFarmerToken(
      savedToken
    );

    if (savedName) {
      setFarmerName(
        savedName
      );
    }

    if (savedPhone) {
      setPhone(
        savedPhone
      );
    }

    setCheckingLogin(
      false
    );
  }, [router]);

  // =========================================================
  // SEND SOS
  // =========================================================

  async function submitSOS() {
    if (
      !farmerToken
    ) {
      setStatus(
        "Farmer authentication required. Please login again."
      );

      return;
    }

    if (
      !farmerId
    ) {
      setStatus(
        "Farmer account information is missing. Please login again."
      );

      return;
    }

    if (
      !farmerName.trim()
    ) {
      setStatus(
        "Please enter farmer name."
      );

      return;
    }

    if (
      !phone.trim()
    ) {
      setStatus(
        "Please enter phone number."
      );

      return;
    }

    setSending(
      true
    );

    setLastSOSId(
      null
    );

    setStatus(
      "Getting your GPS location..."
    );

    async function sendRequest(
      latitude:
        number | null,
      longitude:
        number | null
    ) {
      try {
        const response =
          await fetch(
            `${API_BASE_URL}/api/sos`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${farmerToken}`,
              },

              body:
                JSON.stringify({
                  farmer_id:
                    Number(
                      farmerId
                    ),

                  farmer_name:
                    farmerName.trim(),

                  phone:
                    phone.trim(),

                  emergency_type:
                    emergencyType,

                  details:
                    details.trim(),

                  latitude,

                  longitude,
                }),
            }
          );

        let data:
          any = {};

        try {
          data =
            await response.json();
        } catch {
          // Ignore invalid JSON response
        }

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

          setStatus(
            "Your farmer session has expired. Please login again."
          );

          setTimeout(
            () => {
              router.replace(
                "/login"
              );
            },
            1200
          );

          return;
        }

        if (
          !response.ok
        ) {
          throw new Error(
            data.detail ||
              "SOS request failed."
          );
        }

        const sosId =
          data.sos_id ??
          data.id ??
          null;

        if (sosId) {
          setLastSOSId(
            Number(
              sosId
            )
          );
        }

        setStatus(
          data.message
            ? `${data.message}${
                sosId
                  ? ` SOS ID: ${sosId}`
                  : ""
              }`
            : sosId
            ? `SOS sent successfully. SOS ID: ${sosId}`
            : "SOS sent successfully."
        );

        setDetails(
          ""
        );
      } catch (
        error
      ) {
        if (
          error instanceof
          Error
        ) {
          setStatus(
            error.message
          );
        } else {
          setStatus(
            "Could not connect to the SOS backend."
          );
        }
      } finally {
        setSending(
          false
        );
      }
    }

    // =========================================================
    // GPS
    // =========================================================

    if (
      typeof navigator ===
        "undefined" ||
      !navigator.geolocation
    ) {
      await sendRequest(
        null,
        null
      );

      return;
    }

    navigator.geolocation
      .getCurrentPosition(
        (
          position
        ) => {
          void sendRequest(
            position.coords
              .latitude,

            position.coords
              .longitude
          );
        },

        () => {
          setStatus(
            "Location permission was not available. Sending SOS without GPS."
          );

          void sendRequest(
            null,
            null
          );
        },

        {
          enableHighAccuracy:
            true,

          timeout:
            15000,

          maximumAge:
            0,
        }
      );
  }

  // =========================================================
  // EMERGENCY ADVICE
  // =========================================================

  function emergencyAdvice() {
    if (
      emergencyType ===
      "Snake bite"
    ) {
      return (
        <>
          <strong>
            Snake bite:
          </strong>

          <p>
            Keep the person as still as
            possible and seek emergency
            medical care immediately.
            Remove rings or tight items
            near the bite. Do not cut
            the wound, suck the venom,
            apply ice or use a tight
            tourniquet.
          </p>
        </>
      );
    }

    if (
      emergencyType ===
      "Pesticide exposure"
    ) {
      return (
        <>
          <strong>
            Pesticide exposure:
          </strong>

          <p>
            Move away from the chemical
            source, avoid further
            exposure and seek urgent
            professional medical help.
            If pesticide is on the skin,
            remove contaminated clothing
            and rinse exposed skin with
            clean water.
          </p>
        </>
      );
    }

    if (
      emergencyType ===
      "Heat illness"
    ) {
      return (
        <>
          <strong>
            Heat illness:
          </strong>

          <p>
            Move the person to a cool
            shaded place, loosen excess
            clothing and start cooling.
            Severe confusion, collapse
            or unconsciousness requires
            urgent emergency medical
            care.
          </p>
        </>
      );
    }

    if (
      emergencyType ===
      "Serious injury"
    ) {
      return (
        <>
          <strong>
            Serious injury:
          </strong>

          <p>
            Get professional emergency
            medical help. Avoid
            unnecessary movement if
            there may be a head, neck,
            back or major limb injury.
          </p>
        </>
      );
    }

    return (
      <>
        <strong>
          Emergency:
        </strong>

        <p>
          Seek professional emergency
          medical care immediately for
          serious or life-threatening
          symptoms.
        </p>
      </>
    );
  }

  // =========================================================
  // LOGIN LOADING
  // =========================================================

  if (
    checkingLogin
  ) {
    return (
      <main
        style={{
          minHeight:
            "80vh",

          display:
            "flex",

          justifyContent:
            "center",

          alignItems:
            "center",

          fontSize:
            "18px",
        }}
      >
        <p>
          Checking FarmerSaathi login...
        </p>
      </main>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="sosPage">

      <section className="sosHero">

        <div className="sosBadge">
          🆘 FIELD EMERGENCY
        </div>

        <h1>
          Emergency help for farmers
        </h1>

        <p>
          Send your emergency details
          and GPS location to
          FarmerSaathi.
        </p>

        <div
          style={{
            marginTop:
              "18px",
          }}
        >
          <button
            type="button"
            onClick={() =>
              router.push(
                "/my-sos"
              )
            }
            style={{
              border:
                "none",

              borderRadius:
                "8px",

              padding:
                "11px 18px",

              background:
                "#166534",

              color:
                "white",

              fontWeight:
                700,

              cursor:
                "pointer",
            }}
          >
            📋 Track My SOS
          </button>
        </div>

      </section>

      <section className="sosLayout">

        <div className="sosFormCard">

          <div className="sosWarning">

            <strong>
              ⚠️ Important
            </strong>

            <p>
              This development version
              records your SOS request
              and location but does not
              automatically dispatch an
              ambulance or medical team.
              For a real emergency,
              contact local emergency
              medical services
              immediately.
            </p>

          </div>

          <label>
            Farmer name
          </label>

          <input
            value={
              farmerName
            }
            readOnly
            placeholder="Farmer name"
          />

          <label>
            Phone number
          </label>

          <input
            value={
              phone
            }
            readOnly
            placeholder="Phone number"
          />

          <label>
            Emergency type
          </label>

          <select
            value={
              emergencyType
            }
            onChange={(
              event
            ) =>
              setEmergencyType(
                event.target
                  .value
              )
            }
          >
            <option>
              Snake bite
            </option>

            <option>
              Serious injury
            </option>

            <option>
              Pesticide exposure
            </option>

            <option>
              Heat illness
            </option>

            <option>
              Other emergency
            </option>
          </select>

          <label>
            Emergency details
          </label>

          <textarea
            value={
              details
            }
            onChange={(
              event
            ) =>
              setDetails(
                event.target
                  .value
              )
            }
            placeholder="Describe what happened..."
          />

          <button
            type="button"
            className="sendSOSButton"
            onClick={() =>
              void submitSOS()
            }
            disabled={
              sending
            }
          >
            {sending
              ? "Sending SOS..."
              : "🆘 SEND SOS + GPS LOCATION"}
          </button>

          {status && (
            <div className="sosStatus">
              {status}
            </div>
          )}

          {lastSOSId && (
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/my-sos"
                )
              }
              style={{
                width:
                  "100%",

                marginTop:
                  "12px",

                border:
                  "none",

                borderRadius:
                  "8px",

                padding:
                  "12px",

                background:
                  "#166534",

                color:
                  "white",

                fontWeight:
                  700,

                cursor:
                  "pointer",
              }}
            >
              📋 Track Emergency Status
            </button>
          )}

        </div>

        <div className="sosHelpCard">

          <div className="sosHelpIcon">
            🚑
          </div>

          <h2>
            What to do right now
          </h2>

          <div className="emergencyAdvice">
            {emergencyAdvice()}
          </div>

          <div className="locationInfo">

            <div>
              📍
            </div>

            <div>

              <strong>
                GPS location
              </strong>

              <p>
                When you press the SOS
                button, your browser or
                Android phone will ask
                for location permission.
              </p>

            </div>

          </div>

          <div className="privacyInfo">

            <div>
              🔒
            </div>

            <div>

              <strong>
                Account linked SOS
              </strong>

              <p>
                Your SOS request is
                linked to your
                logged-in FarmerSaathi
                farmer account.
              </p>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}