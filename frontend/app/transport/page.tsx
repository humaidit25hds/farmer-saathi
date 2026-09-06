"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";


type Transporter = {
  id: number;
  name: string;
  phone: string;
  vehicle: string;
  capacity: number;
  rate_per_km: number;
  city: string;
};


function TransportPageContent() {
  const router = useRouter();

  const searchParams =
    useSearchParams();


  const [
    checkingLogin,
    setCheckingLogin,
  ] = useState(true);


  const [
    transporters,
    setTransporters,
  ] = useState<Transporter[]>([]);


  const [
    selectedTransporter,
    setSelectedTransporter,
  ] = useState<number>(0);


  const [
    farmerName,
    setFarmerName,
  ] = useState("");


  const [
    phone,
    setPhone,
  ] = useState("");


  const [
    crop,
    setCrop,
  ] = useState("");


  const [
    quantity,
    setQuantity,
  ] = useState(1);


  const [
    pickup,
    setPickup,
  ] = useState("");


  const [
    destination,
    setDestination,
  ] = useState("");


  const [
    buyerId,
    setBuyerId,
  ] = useState("");


  const [
    buyerName,
    setBuyerName,
  ] = useState("");


  const [
    buyerCompany,
    setBuyerCompany,
  ] = useState("");


  const [
    buyerPhone,
    setBuyerPhone,
  ] = useState("");


  const [
    buyerPrice,
    setBuyerPrice,
  ] = useState("");


  const [
    message,
    setMessage,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  // ==========================================
  // LOGIN CHECK
  // ==========================================

  useEffect(() => {
    const loggedIn =
      localStorage.getItem(
        "farmerLoggedIn"
      );

    const farmerId =
      localStorage.getItem(
        "farmerId"
      );


    if (
      loggedIn !== "true" ||
      !farmerId
    ) {
      router.replace(
        "/login"
      );

      return;
    }


    const savedName =
      localStorage.getItem(
        "farmerName"
      );

    const savedPhone =
      localStorage.getItem(
        "farmerPhone"
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


  // ==========================================
  // LOAD TRANSPORTERS
  // ==========================================

  async function loadTransporters() {
    try {
      const response =
        await fetch(
          "http://192.168.0.106:8000/api/transport/transporters",
          {
            cache: "no-store",
          }
        );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Could not load transport providers."
        );
      }


      if (!Array.isArray(data)) {
        throw new Error(
          "Invalid transporter response."
        );
      }


      setTransporters(
        data
      );


      if (data.length > 0) {
        setSelectedTransporter(
          data[0].id
        );
      }

    } catch (error) {
      console.warn(
        "Transport providers unavailable:",
        error
      );

      setMessage(
        "Could not load transport providers."
      );
    }
  }


  // ==========================================
  // LOAD MARKETPLACE BUYER DATA
  // ==========================================

  useEffect(() => {
    if (checkingLogin) {
      return;
    }


    loadTransporters();


    const cropFromUrl =
      searchParams.get(
        "crop"
      );

    const quantityFromUrl =
      searchParams.get(
        "quantity"
      );

    const destinationFromUrl =
      searchParams.get(
        "destination"
      );

    const buyerIdFromUrl =
      searchParams.get(
        "buyer_id"
      );

    const priceFromUrl =
      searchParams.get(
        "price"
      );

    const buyerNameFromUrl =
      searchParams.get(
        "buyer_name"
      );

    const companyFromUrl =
      searchParams.get(
        "company"
      );

    const buyerPhoneFromUrl =
      searchParams.get(
        "buyer_phone"
      );


    if (cropFromUrl) {
      setCrop(
        cropFromUrl
      );
    }


    if (quantityFromUrl) {
      const parsedQuantity =
        Number(
          quantityFromUrl
        );


      if (
        !Number.isNaN(
          parsedQuantity
        ) &&
        parsedQuantity > 0
      ) {
        setQuantity(
          parsedQuantity
        );
      }
    }


    if (destinationFromUrl) {
      setDestination(
        destinationFromUrl
      );
    }


    if (buyerIdFromUrl) {
      setBuyerId(
        buyerIdFromUrl
      );
    }


    if (priceFromUrl) {
      setBuyerPrice(
        priceFromUrl
      );
    }


    if (buyerNameFromUrl) {
      setBuyerName(
        buyerNameFromUrl
      );
    }


    if (companyFromUrl) {
      setBuyerCompany(
        companyFromUrl
      );
    }


    if (buyerPhoneFromUrl) {
      setBuyerPhone(
        buyerPhoneFromUrl
      );
    }

  }, [
    checkingLogin,
    searchParams,
  ]);


  // ==========================================
  // BOOK TRANSPORT
  // ==========================================

  async function bookTransport(
    event: React.FormEvent
  ) {
    event.preventDefault();


    if (!selectedTransporter) {
      setMessage(
        "Please select a transporter."
      );

      return;
    }


    if (!farmerName.trim()) {
      setMessage(
        "Please enter farmer name."
      );

      return;
    }


    if (!phone.trim()) {
      setMessage(
        "Please enter phone number."
      );

      return;
    }


    if (!crop.trim()) {
      setMessage(
        "Please enter crop name."
      );

      return;
    }


    if (quantity <= 0) {
      setMessage(
        "Quantity must be greater than 0."
      );

      return;
    }


    if (!pickup.trim()) {
      setMessage(
        "Please enter pickup location."
      );

      return;
    }


    if (!destination.trim()) {
      setMessage(
        "Please enter buyer destination."
      );

      return;
    }


    setLoading(
      true
    );

    setMessage(
      ""
    );


    try {
      const response =
        await fetch(
          "http://192.168.0.106:8000/api/transport/book",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              transporter_id:
                selectedTransporter,

              buyer_id:
                buyerId
                  ? Number(
                      buyerId
                    )
                  : null,

              buyer_price:
                buyerPrice
                  ? Number(
                      buyerPrice
                    )
                  : null,

              farmer_name:
                farmerName.trim(),

              phone:
                phone.trim(),

              crop:
                crop.trim(),

              quantity,

              pickup:
                pickup.trim(),

              destination:
                destination.trim(),
            }),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {
        setMessage(
          data.detail ||
            "Transport booking failed."
        );

        return;
      }


      setMessage(
        `Transport requested successfully. Booking ID: ${data.booking_id}`
      );


      setTimeout(() => {
        router.push(
          "/transport-history"
        );
      }, 1500);

    } catch (error) {
      console.warn(
        "Transport booking unavailable:",
        error
      );

      setMessage(
        "Could not connect to the backend."
      );

    } finally {
      setLoading(
        false
      );
    }
  }


  // ==========================================
  // LOADING
  // ==========================================

  if (checkingLogin) {
    return (
      <main className="transportAppLoading">

        <div>
          🚚
        </div>

        <p>
          Loading FarmerSaathi Transport...
        </p>

      </main>
    );
  }


  const selectedTransporterData =
    transporters.find(
      (item) =>
        item.id ===
        selectedTransporter
    );


  return (
    <main className="transportAppPage">

      {/* =====================================
          HERO
      ===================================== */}

      <section className="transportAppHero">

        <div className="transportAppHeroInner">

          <div>

            <span className="transportAppTag">
              🚚 FARMER TRANSPORT
            </span>

            <h1>
              Move your crop safely
            </h1>

            <p>
              Select a transporter,
              enter your route and send
              the crop to your chosen buyer.
            </p>

          </div>


          <button
            type="button"
            className="transportMyBookingsButton"
            onClick={() =>
              router.push(
                "/transport-history"
              )
            }
          >
            📦 My Bookings
          </button>

        </div>

      </section>


      <section className="transportAppContent">

        {/* =================================
            BUYER SUMMARY
        ================================= */}

        {buyerId ? (

          <section className="transportBuyerAppCard">

            <div className="transportBuyerAppTop">

              <div className="transportBuyerAppIdentity">

                <div className="transportBuyerAvatar">
                  👨‍💼
                </div>


                <div>

                  <span>
                    SELECTED MARKETPLACE BUYER
                  </span>

                  <h2>
                    {buyerName ||
                      `Buyer #${buyerId}`}
                  </h2>

                  {buyerCompany && (
                    <p>
                      🏢 {buyerCompany}
                    </p>
                  )}

                </div>

              </div>


              <button
                type="button"
                className="transportChangeBuyerButton"
                onClick={() =>
                  router.push(
                    "/marketplace"
                  )
                }
              >
                Change
              </button>

            </div>


            <div className="transportBuyerAppGrid">

              <div>
                <small>
                  🌾 Crop
                </small>

                <strong>
                  {crop ||
                    "Not selected"}
                </strong>
              </div>


              <div>
                <small>
                  💰 Buyer Price
                </small>

                <strong>
                  {buyerPrice
                    ? `₹${buyerPrice}/quintal`
                    : "Not available"}
                </strong>
              </div>


              <div>
                <small>
                  📦 Quantity
                </small>

                <strong>
                  {quantity} quintals
                </strong>
              </div>


              <div>
                <small>
                  📍 Destination
                </small>

                <strong>
                  {destination ||
                    "Not provided"}
                </strong>
              </div>

            </div>


            <div className="transportBuyerAppFooter">

              <span>
                Buyer ID #{buyerId}
              </span>


              {buyerPhone && (
                <a
                  href={`tel:${buyerPhone}`}
                >
                  📞 Call Buyer
                </a>
              )}

            </div>

          </section>

        ) : (

          <section className="transportNoBuyerCard">

            <div>
              💰
            </div>

            <div>

              <span>
                NO MARKETPLACE BUYER SELECTED
              </span>

              <h2>
                Need a buyer first?
              </h2>

              <p>
                You can still book
                transport manually, or
                choose a crop buyer from
                Marketplace.
              </p>

            </div>


            <button
              type="button"
              onClick={() =>
                router.push(
                  "/marketplace"
                )
              }
            >
              Find Buyer
            </button>

          </section>

        )}


        {/* =================================
            MAIN LAYOUT
        ================================= */}

        <section className="transportAppLayout">


          {/* ===============================
              TRANSPORTERS
          =============================== */}

          <div className="transportProviderSection">

            <div className="transportAppSectionHeading">

              <div>

                <span>
                  AVAILABLE VEHICLES
                </span>

                <h2>
                  Choose your transporter
                </h2>

              </div>


              <small>
                Tap a card to select
              </small>

            </div>


            {transporters.length ===
              0 &&
              !message && (

              <div className="transportProviderLoading">
                Loading transport providers...
              </div>

            )}


            <div className="transportAppProviderGrid">

              {transporters.map(
                (
                  transporter
                ) => {

                  const selected =
                    selectedTransporter ===
                    transporter.id;


                  return (

                    <button
                      type="button"

                      key={
                        transporter.id
                      }

                      className={
                        selected
                          ? "transportAppProviderCard selected"
                          : "transportAppProviderCard"
                      }

                      onClick={() =>
                        setSelectedTransporter(
                          transporter.id
                        )
                      }
                    >

                      <div className="transportProviderTop">

                        <div className="transportTruckIcon">
                          🚚
                        </div>


                        {selected && (
                          <span className="transportSelectedPill">
                            ✓ Selected
                          </span>
                        )}

                      </div>


                      <h3>
                        {transporter.name}
                      </h3>


                      <p className="transportVehicleLabel">
                        {transporter.vehicle}
                      </p>


                      <div className="transportProviderStats">

                        <div>
                          <small>
                            📦 Capacity
                          </small>

                          <strong>
                            {transporter.capacity} q
                          </strong>
                        </div>


                        <div>
                          <small>
                            💰 Rate
                          </small>

                          <strong>
                            ₹
                            {
                              transporter.rate_per_km
                            }
                            /km
                          </strong>
                        </div>

                      </div>


                      <div className="transportProviderMeta">

                        <span>
                          📍 {transporter.city}
                        </span>

                        <span>
                          📞 {transporter.phone}
                        </span>

                      </div>

                    </button>

                  );

                }
              )}

            </div>


            {selectedTransporterData && (

              <div className="transportSelectedSummary">

                <span>
                  SELECTED TRANSPORT
                </span>

                <strong>
                  {
                    selectedTransporterData.name
                  }
                </strong>

                <p>
                  🚚 {
                    selectedTransporterData.vehicle
                  } • ₹
                  {
                    selectedTransporterData.rate_per_km
                  }
                  /km
                </p>

              </div>

            )}

          </div>


          {/* ===============================
              BOOKING FORM
          =============================== */}

          <form
            className="transportAppForm"
            onSubmit={
              bookTransport
            }
          >

            <div className="transportAppFormHeading">

              <span>
                BOOK TRANSPORT
              </span>

              <h2>
                Trip details
              </h2>

              <p>
                Check the information
                before requesting the
                vehicle.
              </p>

            </div>


            <label>
              Farmer name
            </label>

            <div className="transportInputWrap">

              <span>
                👨‍🌾
              </span>

              <input
                required

                value={
                  farmerName
                }

                onChange={(
                  event
                ) =>
                  setFarmerName(
                    event.target
                      .value
                  )
                }

                placeholder="Farmer name"
              />

            </div>


            <label>
              Phone number
            </label>

            <div className="transportInputWrap">

              <span>
                📱
              </span>

              <input
                required

                value={
                  phone
                }

                onChange={(
                  event
                ) =>
                  setPhone(
                    event.target
                      .value
                  )
                }

                placeholder="Phone number"
              />

            </div>


            <div className="transportFormTwoColumn">

              <div>

                <label>
                  Crop
                </label>


                <div className="transportInputWrap">

                  <span>
                    🌾
                  </span>

                  <input
                    required

                    value={
                      crop
                    }

                    onChange={(
                      event
                    ) =>
                      setCrop(
                        event.target
                          .value
                      )
                    }

                    placeholder="Wheat"
                  />

                </div>

              </div>


              <div>

                <label>
                  Quantity
                </label>


                <div className="transportInputWrap">

                  <span>
                    📦
                  </span>

                  <input
                    required
                    min="1"
                    type="number"

                    value={
                      quantity
                    }

                    onChange={(
                      event
                    ) =>
                      setQuantity(
                        Number(
                          event.target
                            .value
                        )
                      )
                    }
                  />

                </div>

              </div>

            </div>


            <label>
              Pickup location
            </label>


            <div className="transportInputWrap">

              <span>
                📍
              </span>

              <input
                required

                value={
                  pickup
                }

                onChange={(
                  event
                ) =>
                  setPickup(
                    event.target
                      .value
                  )
                }

                placeholder="Farm or village"
              />

            </div>


            <div className="transportRouteConnector">
              <span />
              <strong>
                ↓
              </strong>
              <span />
            </div>


            <label>
              Buyer destination
            </label>


            <div className="transportInputWrap">

              <span>
                🏁
              </span>

              <input
                required

                value={
                  destination
                }

                onChange={(
                  event
                ) =>
                  setDestination(
                    event.target
                      .value
                  )
                }

                placeholder="Buyer city or address"
              />

            </div>


            {buyerName && (

              <div className="transportDeliverySummary">

                <span>
                  DELIVERING TO
                </span>

                <strong>
                  {buyerName}
                </strong>

                {buyerCompany && (
                  <small>
                    {buyerCompany}
                  </small>
                )}

              </div>

            )}


            <button
              type="submit"

              className="transportRequestButton"

              disabled={
                loading
              }
            >

              {loading
                ? "Requesting vehicle..."
                : "🚚 Request Transport"}

            </button>


            {message && (

              <div className="transportAppMessage">
                {message}
              </div>

            )}

          </form>

        </section>

      </section>

    </main>
  );
}


export default function TransportPage() {
  return (
    <Suspense
      fallback={
        <main className="transportAppLoading">

          <div>
            🚚
          </div>

          <p>
            Loading FarmerSaathi Transport...
          </p>

        </main>
      }
    >
      <TransportPageContent />
    </Suspense>
  );
}