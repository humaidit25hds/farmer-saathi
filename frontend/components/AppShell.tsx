"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import TransportNotifications from "@/components/TransportNotifications";
import InstallPWAButton from "@/components/InstallPWAButton";


export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {

  const pathname =
    usePathname();

  const router =
    useRouter();


  const [
    farmerName,
    setFarmerName,
  ] =
    useState("");


  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] =
    useState(false);


  // ==========================================
  // LOAD FARMER NAME
  // ==========================================

  useEffect(() => {

    const name =
      localStorage.getItem(
        "farmerName"
      );

    if (name) {
      setFarmerName(name);
    }

  }, []);


  // ==========================================
  // CLOSE MOBILE MENU WHEN PAGE CHANGES
  // ==========================================

  useEffect(() => {

    setMobileMenuOpen(
      false
    );

  }, [pathname]);


  // ==========================================
  // ADMIN PAGES
  // ==========================================

  const isAdminPage =
    pathname.startsWith(
      "/admin"
    );


  // ==========================================
  // LOGIN / REGISTER PAGES
  // ==========================================

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register";


  // ==========================================
  // ACTIVE NAVIGATION
  // ==========================================

  function isActive(
    route: string
  ) {

    if (route === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(
      route
    );

  }


  // ==========================================
  // PROFILE
  // ==========================================

  function goToProfile() {

    router.push(
      "/profile"
    );

  }


  // ==========================================
  // ADMIN
  // DO NOT SHOW FARMER APP SHELL
  // ==========================================

  if (isAdminPage) {

    return (
      <>
        {children}
      </>
    );

  }


  // ==========================================
  // LOGIN / REGISTER
  // DO NOT SHOW FARMER NAVIGATION
  // ==========================================

  if (isAuthPage) {

    return (
      <>
        {children}
      </>
    );

  }


  return (

    <>

      {/* =====================================
          NOTIFICATION CENTER
      ===================================== */}

      <TransportNotifications />


      {/* =====================================
          INSTALL FARMERSAATHI PWA BUTTON
      ===================================== */}

      <InstallPWAButton />


      {/* =====================================
          MAIN APP HEADER
      ===================================== */}

      <header
        className="farmerAppHeader"
      >

        <div
          className="farmerAppHeaderInner"
        >


          {/* =================================
              LOGO
          ================================= */}

          <Link
            href="/"
            className="farmerAppLogo"
          >

            <span
              className="farmerAppLogoIcon"
            >
              🌾
            </span>

            <span>
              FarmerSaathi
            </span>

          </Link>


          {/* =================================
              DESKTOP NAVIGATION
          ================================= */}

          <nav
            className="farmerDesktopNav"
          >

            <Link
              href="/"
              className={
                isActive("/")
                  ? "farmerNavLink active"
                  : "farmerNavLink"
              }
            >
              Home
            </Link>


            <Link
              href="/assistant"
              className={
                isActive(
                  "/assistant"
                )
                  ? "farmerNavLink active"
                  : "farmerNavLink"
              }
            >
              AI Assistant
            </Link>


            <Link
              href="/weather"
              className={
                isActive(
                  "/weather"
                )
                  ? "farmerNavLink active"
                  : "farmerNavLink"
              }
            >
              Weather
            </Link>


            <Link
              href="/marketplace"
              className={
                isActive(
                  "/marketplace"
                )
                  ? "farmerNavLink active"
                  : "farmerNavLink"
              }
            >
              Marketplace
            </Link>


            <Link
              href="/transport"
              className={
                isActive(
                  "/transport"
                )
                  ? "farmerNavLink active"
                  : "farmerNavLink"
              }
            >
              Transport
            </Link>


            {/* SOS */}

            <Link
              href="/sos"
              className="farmerDesktopSOS"
            >
              🚨 SOS
            </Link>


            {/* PROFILE */}

            <button
              type="button"
              onClick={
                goToProfile
              }
              className="farmerProfileButton"
            >

              <span
                className="farmerProfileIcon"
              >
                👤
              </span>


              <span
                className="farmerProfileText"
              >

                <small>
                  Farmer
                </small>


                <strong>

                  {farmerName ||
                    "Profile"}

                </strong>

              </span>

            </button>

          </nav>


          {/* =================================
              MOBILE HEADER ACTIONS
          ================================= */}

          <div
            className="farmerMobileHeaderActions"
          >

            {/* PROFILE */}

            <button
              type="button"
              className="farmerMobileProfile"
              onClick={
                goToProfile
              }
              aria-label="Open profile"
            >
              👤
            </button>


            {/* MENU */}

            <button
              type="button"
              className="farmerMobileMenuButton"
              onClick={() =>
                setMobileMenuOpen(
                  !mobileMenuOpen
                )
              }
              aria-label="Open menu"
            >

              {mobileMenuOpen
                ? "✕"
                : "☰"}

            </button>

          </div>

        </div>


        {/* =================================
            MOBILE DROP DOWN MENU
        ================================= */}

        {mobileMenuOpen && (

          <div
            className="farmerMobileMenu"
          >

            <Link
              href="/weather"
            >
              🌤️ Weather
            </Link>


            <Link
              href="/transport-history"
            >
              📦 My Bookings
            </Link>


            <Link
              href="/my-sos"
            >
              🚨 My SOS
            </Link>


            <Link
              href="/profile"
            >
              👤 My Profile
            </Link>

          </div>

        )}

      </header>


      {/* =====================================
          PAGE CONTENT
      ===================================== */}

      <main
        className="farmerAppContent"
      >

        {children}

      </main>


      {/* =====================================
          MOBILE FLOATING SOS BUTTON
      ===================================== */}

      <Link
        href="/sos"
        className="farmerFloatingSOS"
        aria-label="Emergency SOS"
      >

        <span>
          🚨
        </span>

        <strong>
          SOS
        </strong>

      </Link>


      {/* =====================================
          MOBILE BOTTOM NAVIGATION
      ===================================== */}

      <nav
        className="farmerMobileBottomNav"
      >

        {/* HOME */}

        <Link
          href="/"
          className={
            isActive("/")
              ? "active"
              : ""
          }
        >

          <span>
            🏠
          </span>

          <small>
            Home
          </small>

        </Link>


        {/* AI */}

        <Link
          href="/assistant"
          className={
            isActive(
              "/assistant"
            )
              ? "active"
              : ""
          }
        >

          <span>
            🤖
          </span>

          <small>
            Assistant
          </small>

        </Link>


        {/* MARKET */}

        <Link
          href="/marketplace"
          className={
            isActive(
              "/marketplace"
            )
              ? "active"
              : ""
          }
        >

          <span>
            💰
          </span>

          <small>
            Market
          </small>

        </Link>


        {/* TRANSPORT */}

        <Link
          href="/transport"
          className={
            isActive(
              "/transport"
            )
              ? "active"
              : ""
          }
        >

          <span>
            🚚
          </span>

          <small>
            Transport
          </small>

        </Link>

      </nav>

    </>

  );

}