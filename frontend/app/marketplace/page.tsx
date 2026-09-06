"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";


type MarketplaceOffer = {
  id?: number;

  buyer_id: number;

  buyer_name?: string;

  company?: string;

  buyer_phone?: string;

  buyer_city?: string;

  verified?: boolean;

  crop: string;

  price_per_quintal: number;

  quantity: number;

  location: string;
};


export default function MarketplacePage() {

  const router =
    useRouter();


  const [
    checkingLogin,
    setCheckingLogin,
  ] =
    useState(true);


  const [
    crop,
    setCrop,
  ] =
    useState("");


  const [
    searchedCrop,
    setSearchedCrop,
  ] =
    useState("");


  const [
    offers,
    setOffers,
  ] =
    useState<MarketplaceOffer[]>(
      []
    );


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  const [
    message,
    setMessage,
  ] =
    useState("");


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


    setCheckingLogin(
      false
    );

  }, [router]);


  // ==========================================
  // SORT OFFERS
  // ==========================================

  const sortedOffers =
    useMemo(() => {

      return [...offers].sort(
        (a, b) =>
          Number(
            b.price_per_quintal
          ) -
          Number(
            a.price_per_quintal
          )
      );

    }, [offers]);


  const bestOffer =
    sortedOffers.length > 0
      ? sortedOffers[0]
      : null;


  const lowestOffer =
    sortedOffers.length > 0
      ? sortedOffers[
          sortedOffers.length - 1
        ]
      : null;


  const priceDifference =
    bestOffer &&
    lowestOffer
      ? Number(
          bestOffer.price_per_quintal
        ) -
        Number(
          lowestOffer.price_per_quintal
        )
      : 0;


  // ==========================================
  // SEARCH
  // ==========================================

  async function searchOffers() {

    const cleanCrop =
      crop.trim();


    if (!cleanCrop) {

      setMessage(
        "Please enter a crop name."
      );

      return;
    }


    setLoading(
      true
    );

    setMessage(
      ""
    );

    setOffers(
      []
    );

    setSearchedCrop(
      cleanCrop
    );


    try {

      const response =
        await fetch(
          `http://192.168.0.106:8000/api/marketplace/offers?crop=${encodeURIComponent(
            cleanCrop
          )}`,
          {
            cache: "no-store",
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
            "Could not load buyer offers."
        );

      }


      if (!Array.isArray(data)) {

        throw new Error(
          "Invalid marketplace response."
        );

      }


      setOffers(
        data
      );


      if (
        data.length === 0
      ) {

        setMessage(
          `No buyer offers found for ${cleanCrop}.`
        );

      }

    } catch (error) {

      console.warn(
        "Marketplace unavailable:",
        error
      );


      setMessage(
        "Could not connect to the FarmerSaathi backend."
      );


      setOffers(
        []
      );

    } finally {

      setLoading(
        false
      );

    }

  }


  // ==========================================
  // CHOOSE BUYER
  // ==========================================

  function chooseBuyer(
    offer: MarketplaceOffer
  ) {

    const params =
      new URLSearchParams({
        crop:
          String(
            offer.crop ?? ""
          ),

        quantity:
          String(
            offer.quantity ?? ""
          ),

        destination:
          String(
            offer.location ?? ""
          ),

        buyer_id:
          String(
            offer.buyer_id ?? ""
          ),

        price:
          String(
            offer.price_per_quintal ?? ""
          ),

        buyer_name:
          String(
            offer.buyer_name ?? ""
          ),

        company:
          String(
            offer.company ?? ""
          ),

        buyer_phone:
          String(
            offer.buyer_phone ?? ""
          ),
      });


    router.push(
      `/transport?${params.toString()}`
    );

  }


  // ==========================================
  // LOADING
  // ==========================================

  if (
    checkingLogin
  ) {

    return (

      <main className="marketAppLoading">

        <div>
          🌾
        </div>

        <p>
          Loading FarmerSaathi Marketplace...
        </p>

      </main>

    );

  }


  return (

    <main className="marketAppPage">


      {/* =====================================
          HERO
      ===================================== */}

      <section className="marketAppHero">

        <div className="marketAppHeroInner">

          <div>

            <span className="marketAppTag">
              💰 FARMER MARKETPLACE
            </span>


            <h1>
              Find the best crop price
            </h1>


            <p>
              Compare available buyer
              offers and choose the best
              selling opportunity.
            </p>

          </div>


          <div className="marketHeroIcon">
            🌾
          </div>

        </div>

      </section>


      {/* =====================================
          SEARCH
      ===================================== */}

      <section className="marketAppContent">

        <div className="marketSearchPanel">

          <div className="marketSearchHeading">

            <div>

              <span>
                SEARCH MARKET
              </span>

              <h2>
                What crop are you selling?
              </h2>

            </div>

          </div>


          <div className="marketSearchInputRow">

            <div className="marketInputWrap">

              <span>
                🌾
              </span>


              <input
                value={
                  crop
                }

                onChange={(
                  event
                ) =>
                  setCrop(
                    event.target.value
                  )
                }

                onKeyDown={(
                  event
                ) => {

                  if (
                    event.key ===
                    "Enter"
                  ) {

                    searchOffers();

                  }

                }}

                placeholder="e.g. Wheat, Rice, Onion"
              />

            </div>


            <button
              type="button"

              className="marketAppSearchButton"

              onClick={
                searchOffers
              }

              disabled={
                loading
              }
            >

              {loading
                ? "Searching..."
                : "Find Best Price"}

            </button>

          </div>


          <div className="marketPopularCrops">

            <span>
              Popular:
            </span>


            <button
              type="button"

              onClick={() => {
                setCrop(
                  "Wheat"
                );
              }}
            >
              Wheat
            </button>


            <button
              type="button"

              onClick={() => {
                setCrop(
                  "Rice"
                );
              }}
            >
              Rice
            </button>


            <button
              type="button"

              onClick={() => {
                setCrop(
                  "Onion"
                );
              }}
            >
              Onion
            </button>

          </div>


          {message && (

            <div className="marketAppMessage">
              {message}
            </div>

          )}

        </div>


        {/* =================================
            STATS
        ================================= */}

        {bestOffer && (

          <div className="marketStatsGrid">

            <div className="marketStatCard marketBestStat">

              <span>
                🏆 BEST PRICE
              </span>

              <strong>
                ₹
                {
                  bestOffer.price_per_quintal
                }
              </strong>

              <small>
                per quintal
              </small>

            </div>


            <div className="marketStatCard">

              <span>
                👥 BUYERS
              </span>

              <strong>
                {
                  sortedOffers.length
                }
              </strong>

              <small>
                offers available
              </small>

            </div>


            <div className="marketStatCard">

              <span>
                📈 PRICE GAP
              </span>

              <strong>
                ₹
                {
                  priceDifference
                }
              </strong>

              <small>
                best vs lowest
              </small>

            </div>

          </div>

        )}


        {/* =================================
            OFFERS
        ================================= */}

        {sortedOffers.length > 0 && (

          <section className="marketOffersSection">

            <div className="marketOffersHeading">

              <div>

                <span>
                  AVAILABLE BUYERS
                </span>

                <h2>
                  Best offers for{" "}
                  {searchedCrop}
                </h2>

              </div>


              <div className="marketOfferCount">

                {sortedOffers.length}{" "}

                {sortedOffers.length === 1
                  ? "offer"
                  : "offers"}

              </div>

            </div>


            <div className="marketOfferList">

              {sortedOffers.map(
                (
                  offer,
                  index
                ) => {

                  const isBest =
                    index === 0;


                  const differenceFromBest =
                    bestOffer
                      ? Number(
                          bestOffer.price_per_quintal
                        ) -
                        Number(
                          offer.price_per_quintal
                        )
                      : 0;


                  return (

                    <article
                      key={
                        offer.id ??
                        `${offer.buyer_id}-${index}`
                      }

                      className={
                        isBest
                          ? "marketBuyerCard marketBestBuyerCard"
                          : "marketBuyerCard"
                      }
                    >


                      {/* CARD HEADER */}

                      <div className="marketBuyerCardTop">

                        <div>

                          <div className="marketBuyerCropRow">

                            <span className="marketBuyerCropIcon">
                              🌾
                            </span>


                            <div>

                              <small>
                                CROP OFFER
                              </small>

                              <h3>
                                {offer.crop}
                              </h3>

                            </div>

                          </div>

                        </div>


                        {isBest && (

                          <span className="marketBestBadge">
                            🏆 Best Price
                          </span>

                        )}

                      </div>


                      {/* PRICE */}

                      <div className="marketPriceArea">

                        <div>

                          <span>
                            Buyer Price
                          </span>

                          <strong>
                            ₹
                            {
                              offer.price_per_quintal
                            }
                          </strong>

                          <small>
                            per quintal
                          </small>

                        </div>


                        {!isBest && (

                          <div className="marketPriceBehind">

                            ₹
                            {
                              differenceFromBest
                            }{" "}
                            below best

                          </div>

                        )}

                      </div>


                      {/* BUYER */}

                      <div className="marketBuyerIdentity">

                        <div className="marketBuyerAvatar">
                          👨‍💼
                        </div>


                        <div className="marketBuyerIdentityText">

                          <div className="marketBuyerNameRow">

                            <h3>

                              {offer.buyer_name ||
                                `Buyer #${offer.buyer_id}`}

                            </h3>


                            {offer.verified ? (

                              <span className="marketVerifiedPill">
                                ✓ Verified
                              </span>

                            ) : (

                              <span className="marketPendingPill">
                                Not Verified
                              </span>

                            )}

                          </div>


                          {offer.company && (

                            <p>
                              🏢 {offer.company}
                            </p>

                          )}

                        </div>

                      </div>


                      {/* DETAILS */}

                      <div className="marketBuyerDetailsGrid">

                        <div>

                          <small>
                            📦 Quantity
                          </small>

                          <strong>
                            {offer.quantity} quintals
                          </strong>

                        </div>


                        <div>

                          <small>
                            📍 Offer Location
                          </small>

                          <strong>
                            {offer.location}
                          </strong>

                        </div>


                        {offer.buyer_city && (

                          <div>

                            <small>
                              🏙️ Buyer City
                            </small>

                            <strong>
                              {offer.buyer_city}
                            </strong>

                          </div>

                        )}


                        <div>

                          <small>
                            🆔 Buyer ID
                          </small>

                          <strong>
                            #{offer.buyer_id}
                          </strong>

                        </div>

                      </div>


                      {/* ACTIONS */}

                      <div className="marketBuyerActions">

                        {offer.buyer_phone && (

                          <a
                            href={`tel:${offer.buyer_phone}`}
                            className="marketCallBuyerButton"
                          >
                            📞 Call
                          </a>

                        )}


                        <button
                          type="button"

                          className={
                            isBest
                              ? "marketChooseBuyerButton best"
                              : "marketChooseBuyerButton"
                          }

                          onClick={() =>
                            chooseBuyer(
                              offer
                            )
                          }
                        >

                          {isBest
                            ? "🏆 Choose Best Buyer"
                            : "Choose Buyer"}

                        </button>

                      </div>

                    </article>

                  );

                }
              )}

            </div>

          </section>

        )}


        {/* =================================
            EMPTY STATE
        ================================= */}

        {!loading &&
          !bestOffer &&
          !message && (

            <section className="marketEmptyState">

              <div>
                🌾
              </div>

              <h2>
                Search your crop
              </h2>

              <p>
                Enter a crop name to compare
                available buyer prices.
              </p>

            </section>

          )}


        {/* =================================
            HOW IT WORKS
        ================================= */}

        <section className="marketHowItWorks">

          <div className="marketSectionMiniHeading">

            <span>
              SIMPLE PROCESS
            </span>

            <h2>
              Sell smarter with FarmerSaathi
            </h2>

          </div>


          <div className="marketStepsGrid">

            <div>

              <span>
                1
              </span>

              <div>
                <strong>
                  Search Crop
                </strong>

                <p>
                  Enter the crop you want
                  to sell.
                </p>
              </div>

            </div>


            <div>

              <span>
                2
              </span>

              <div>
                <strong>
                  Compare Buyers
                </strong>

                <p>
                  Check prices and verified
                  buyer information.
                </p>
              </div>

            </div>


            <div>

              <span>
                3
              </span>

              <div>
                <strong>
                  Choose Buyer
                </strong>

                <p>
                  Select the offer that
                  works best for you.
                </p>
              </div>

            </div>


            <div>

              <span>
                4
              </span>

              <div>
                <strong>
                  Arrange Transport
                </strong>

                <p>
                  FarmerSaathi carries the
                  buyer details to transport.
                </p>
              </div>

            </div>

          </div>

        </section>

      </section>

    </main>

  );

}