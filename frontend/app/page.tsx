"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import Link from "next/link";


export default function HomePage() {

  const router =
    useRouter();


  const [
    checkingLogin,
    setCheckingLogin,
  ] =
    useState(true);


  const [
    phone,
    setPhone,
  ] =
    useState("");


  const [
    name,
    setName,
  ] =
    useState("");


  const [
    village,
    setVillage,
  ] =
    useState("");


  // ==========================================
  // CHECK FARMER LOGIN
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

    const savedPhone =
      localStorage.getItem(
        "farmerPhone"
      );

    const savedName =
      localStorage.getItem(
        "farmerName"
      );

    const savedVillage =
      localStorage.getItem(
        "farmerVillage"
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


    if (savedPhone) {
      setPhone(
        savedPhone
      );
    }


    if (savedName) {
      setName(
        savedName
      );
    }


    if (savedVillage) {
      setVillage(
        savedVillage
      );
    }


    setCheckingLogin(
      false
    );

  }, [router]);


  // ==========================================
  // LOGOUT
  // ==========================================

  function handleLogout() {

    localStorage.removeItem(
      "farmerLoggedIn"
    );

    localStorage.removeItem(
      "farmerToken"
    );

    localStorage.removeItem(
      "farmerPhone"
    );

    localStorage.removeItem(
      "farmerName"
    );

    localStorage.removeItem(
      "farmerId"
    );

    localStorage.removeItem(
      "farmerVillage"
    );


    router.replace(
      "/login"
    );

  }


  // ==========================================
  // LOADING
  // ==========================================

  if (checkingLogin) {

    return (
      <main className="homeLoadingPage">

        <div className="homeLoadingCard">
          🌾
        </div>

        <p>
          Loading FarmerSaathi...
        </p>

      </main>
    );

  }


  return (

    <main className="farmerHomePage">


      {/* =====================================
          WELCOME HERO
      ===================================== */}

      <section className="homeHero">

        <div className="homeHeroInner">


          <div className="homeWelcomeArea">

            <div className="homePlatformBadge">
              🌾 Farmer Digital Platform
            </div>


            <p className="homeGreeting">
              Welcome back
            </p>


            <h1>
              {name
                ? `${name} 👋`
                : "Farmer 👋"}
            </h1>


            <p className="homeHeroDescription">
              Get farming guidance,
              weather updates, market
              prices, transport and
              emergency support in one
              place.
            </p>


            <div className="homeFarmerMeta">

              {village && (

                <span>
                  📍 {village}
                </span>

              )}


              {phone && (

                <span>
                  📱 {phone}
                </span>

              )}

            </div>

          </div>


          {/* AI PRIMARY ACTION */}

          <Link
            href="/assistant"
            className="homeAICard"
          >

            <div className="homeAICardTop">

              <div>

                <span className="homeAIOverline">
                  FARMERSAATHI AI
                </span>

                <h2>
                  Ask anything about
                  farming
                </h2>

                <p>
                  Speak or type your
                  question in English
                  or Hindi.
                </p>

              </div>


              <div className="homeAIMic">
                🎤
              </div>

            </div>


            <span className="homeAICTA">
              Ask FarmerSaathi →
            </span>

          </Link>

        </div>

      </section>


      {/* =====================================
          QUICK SERVICES
      ===================================== */}

      <section className="homeDashboardSection">

        <div className="homeSectionHeading">

          <div>

            <span>
              QUICK ACCESS
            </span>

            <h2>
              Farmer Services
            </h2>

          </div>


          <Link
            href="/profile"
            className="homeProfileShortcut"
          >
            👨‍🌾 My Profile
          </Link>

        </div>


        <div className="homeQuickGrid">


          <Link
            href="/weather"
            className="homeQuickCard"
          >

            <div className="homeQuickIcon">
              🌦️
            </div>

            <div>
              <h3>
                Weather
              </h3>

              <p>
                Check farming weather
                conditions.
              </p>
            </div>

            <span>
              →
            </span>

          </Link>


          <Link
            href="/marketplace"
            className="homeQuickCard"
          >

            <div className="homeQuickIcon">
              💰
            </div>

            <div>
              <h3>
                Marketplace
              </h3>

              <p>
                Compare crop buyer
                prices.
              </p>
            </div>

            <span>
              →
            </span>

          </Link>


          <Link
            href="/transport"
            className="homeQuickCard"
          >

            <div className="homeQuickIcon">
              🚚
            </div>

            <div>
              <h3>
                Transport
              </h3>

              <p>
                Book crop transport
                services.
              </p>
            </div>

            <span>
              →
            </span>

          </Link>


          <Link
            href="/transport-history"
            className="homeQuickCard"
          >

            <div className="homeQuickIcon">
              📦
            </div>

            <div>
              <h3>
                My Bookings
              </h3>

              <p>
                Track transport status.
              </p>
            </div>

            <span>
              →
            </span>

          </Link>

        </div>

      </section>


      {/* =====================================
          EMERGENCY
      ===================================== */}

      <section className="homeDashboardSection">

        <div className="homeEmergencyCard">

          <div className="homeEmergencyIcon">
            🚨
          </div>


          <div className="homeEmergencyContent">

            <span>
              EMERGENCY SUPPORT
            </span>

            <h2>
              Need urgent help?
            </h2>

            <p>
              Send your location and
              emergency details to
              FarmerSaathi.
            </p>

          </div>


          <div className="homeEmergencyActions">

            <Link
              href="/sos"
              className="homeSOSPrimary"
            >
              Send SOS
            </Link>


            <Link
              href="/my-sos"
              className="homeSOSSecondary"
            >
              Track SOS
            </Link>

          </div>

        </div>

      </section>


      {/* =====================================
          MORE SERVICES
      ===================================== */}

      <section className="homeDashboardSection">

        <div className="homeSectionHeading">

          <div>

            <span>
              MORE
            </span>

            <h2>
              Your FarmerSaathi
            </h2>

          </div>

        </div>


        <div className="homeSecondaryGrid">


          <Link
            href="/assistant"
            className="homeSecondaryCard"
          >

            <span className="homeSecondaryIcon">
              🤖
            </span>

            <div>
              <h3>
                AI Assistant
              </h3>

              <p>
                Voice and text farming
                guidance.
              </p>
            </div>

          </Link>


          <Link
            href="/my-sos"
            className="homeSecondaryCard"
          >

            <span className="homeSecondaryIcon">
              📋
            </span>

            <div>
              <h3>
                SOS History
              </h3>

              <p>
                View emergency request
                progress.
              </p>
            </div>

          </Link>


          <Link
            href="/profile"
            className="homeSecondaryCard"
          >

            <span className="homeSecondaryIcon">
              👨‍🌾
            </span>

            <div>
              <h3>
                My Profile
              </h3>

              <p>
                View your farmer account.
              </p>
            </div>

          </Link>


          <button
            type="button"
            className="homeSecondaryCard homeLogoutCard"
            onClick={
              handleLogout
            }
          >

            <span className="homeSecondaryIcon">
              🚪
            </span>

            <div>
              <h3>
                Logout
              </h3>

              <p>
                Sign out of FarmerSaathi.
              </p>
            </div>

          </button>

        </div>

      </section>


      {/* =====================================
          MISSION
      ===================================== */}

      <section className="homeMissionSection">

        <div className="homeMissionCard">

          <span>
            🌱 OUR MISSION
          </span>

          <h2>
            Technology that works
            for farmers
          </h2>

          <p>
            FarmerSaathi brings farming
            guidance, weather,
            marketplace opportunities,
            transport and emergency
            support into one simple
            digital platform.
          </p>

        </div>

      </section>


      {/* =====================================
          ADMIN ACCESS
      ===================================== */}

      <section className="homeAdminAccess">

        <span>
          Emergency staff?
        </span>

        <Link href="/admin-login">
          Admin Login →
        </Link>

      </section>

    </main>

  );

}