"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  const [adminName, setAdminName] =
    useState("Admin");

  const [adminRole, setAdminRole] =
    useState("Admin");

  useEffect(() => {
    const loggedIn =
      localStorage.getItem("adminLoggedIn");

    const token =
      localStorage.getItem("adminToken");

    if (
      loggedIn !== "true" ||
      !token
    ) {
      router.replace("/admin-login");
      return;
    }

    setAdminName(
      localStorage.getItem("adminName") ||
        "Admin"
    );

    setAdminRole(
      localStorage.getItem("adminRole") ||
        "Admin"
    );
  }, [router]);


  function logout() {
    localStorage.removeItem(
      "adminLoggedIn"
    );

    localStorage.removeItem(
      "adminToken"
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

    router.push("/admin-login");
  }


  return (
    <main className="adminPage">

      {/* ADMIN HEADER */}

      <section className="adminHeader">

        <div className="adminHeaderInner">

          <div className="adminBrand">

            <h1>
              🌾 FarmerSaathi Admin
            </h1>

            <p>
              Administration Dashboard
            </p>

          </div>


          <div className="adminAccount">

            <div className="adminAccountInfo">

              <strong>
                {adminName}
              </strong>

              <span>
                {adminRole}
              </span>

            </div>


            <button
              onClick={logout}
              className="adminLogoutButton"
            >
              Logout
            </button>

          </div>

        </div>

      </section>


      {/* DASHBOARD */}

      <section className="adminContent">

        <div className="adminTitle">

          <span>
            ADMINISTRATION
          </span>

          <h2>
            Dashboard
          </h2>

          <p>
            Manage FarmerSaathi services
            from one place.
          </p>

        </div>


        <div className="adminGrid">

          <AdminCard
            icon="👨‍🌾"
            title="Farmers"
            description={
              "View and manage registered farmers."
            }
            onClick={() =>
              router.push(
                "/admin/farmers"
              )
            }
          />


          <AdminCard
            icon="🛒"
            title="Buyers"
            description={
              "Manage registered bulk buyers."
            }
            onClick={() =>
              router.push(
                "/admin/buyers"
              )
            }
          />


          <AdminCard
            icon="🌾"
            title="Crop Offers"
            description={
              "Manage marketplace crop offers."
            }
            onClick={() =>
              router.push(
                "/admin/offers"
              )
            }
          />


          <AdminCard
            icon="🚚"
            title="Transporters"
            description={
              "Manage transport service providers."
            }
            onClick={() =>
              router.push(
                "/admin/transporters"
              )
            }
          />


          <AdminCard
            icon="📦"
            title="Transport Bookings"
            description={
              "View farmer transport bookings."
            }
            onClick={() =>
              router.push(
                "/admin/bookings"
              )
            }
          />


          <AdminCard
            icon="🚨"
            title="SOS Requests"
            description={
              "View and manage emergency requests."
            }
            sos
            onClick={() =>
              router.push(
                "/admin/sos"
              )
            }
          />

        </div>

      </section>

    </main>
  );
}


function AdminCard({
  icon,
  title,
  description,
  onClick,
  sos = false,
}: {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  sos?: boolean;
}) {

  return (
    <button
      onClick={onClick}
      className={
        sos
          ? "adminCard adminSOSCard"
          : "adminCard"
      }
    >

      <div className="adminCardIcon">
        {icon}
      </div>

      <h3>
        {title}
      </h3>

      <p>
        {description}
      </p>

      <span className="adminCardAction">
        Open →
      </span>

    </button>
  );
}