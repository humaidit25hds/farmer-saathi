"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";


type Buyer = {
  id: number;
  name: string;
  company: string;
  phone: string;
  city: string;
  verified: boolean;
};


export default function AdminBuyersPage() {
  const router = useRouter();

  const [buyers, setBuyers] =
    useState<Buyer[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [updatingId, setUpdatingId] =
    useState<number | null>(null);


  useEffect(() => {
    const token =
      localStorage.getItem(
        "adminToken"
      );

    if (!token) {
      router.replace(
        "/admin-login"
      );
      return;
    }

    loadBuyers();

  }, [router]);


  async function loadBuyers() {
    try {
      setLoading(true);
      setMessage("");

      const token =
        localStorage.getItem(
          "adminToken"
        );

      const response =
        await fetch(
          "http://192.168.0.106:8000/api/admin/buyers",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        if (
          response.status === 401
        ) {
          localStorage.removeItem(
            "adminToken"
          );

          localStorage.removeItem(
            "adminLoggedIn"
          );

          alert(
            "Admin session expired. Please login again."
          );

          router.replace(
            "/admin-login"
          );

          return;
        }


        setMessage(
          data.detail ||
            "Unable to load buyers."
        );

        return;
      }


      setBuyers(data);

    } catch (error) {

      console.error(error);

      setMessage(
        "Unable to connect to FarmerSaathi backend."
      );

    } finally {

      setLoading(false);

    }
  }


  async function updateVerification(
    buyer: Buyer
  ) {
    try {
      setUpdatingId(
        buyer.id
      );

      setMessage("");


      const token =
        localStorage.getItem(
          "adminToken"
        );


      const response =
        await fetch(
          `http://192.168.0.106:8000/api/admin/buyers/${buyer.id}/verification`,
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
                verified:
                  !buyer.verified,
              }),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        if (
          response.status === 401
        ) {
          localStorage.removeItem(
            "adminToken"
          );

          localStorage.removeItem(
            "adminLoggedIn"
          );

          alert(
            "Admin session expired. Please login again."
          );

          router.replace(
            "/admin-login"
          );

          return;
        }


        setMessage(
          data.detail ||
            "Unable to update buyer verification."
        );

        return;
      }


      setBuyers(
        (current) =>
          current.map(
            (item) =>
              item.id === buyer.id
                ? {
                    ...item,
                    verified:
                      !buyer.verified,
                  }
                : item
          )
      );

    } catch (error) {

      console.error(error);

      setMessage(
        "Unable to connect to FarmerSaathi backend."
      );

    } finally {

      setUpdatingId(
        null
      );

    }
  }


  const filteredBuyers =
    useMemo(() => {

      const value =
        search
          .trim()
          .toLowerCase();


      if (!value) {
        return buyers;
      }


      return buyers.filter(
        (buyer) => {

          return (
            buyer.name
              .toLowerCase()
              .includes(value) ||

            (
              buyer.company ||
              ""
            )
              .toLowerCase()
              .includes(value) ||

            (
              buyer.city ||
              ""
            )
              .toLowerCase()
              .includes(value) ||

            (
              buyer.phone ||
              ""
            )
              .toLowerCase()
              .includes(value)
          );

        }
      );

    }, [
      buyers,
      search,
    ]);


  const verifiedCount =
    buyers.filter(
      (buyer) =>
        buyer.verified
    ).length;


  const unverifiedCount =
    buyers.length -
    verifiedCount;


  return (
    <main className="adminBuyersPage">

      {/* ==========================================
          HERO
      ========================================== */}

      <section className="adminBuyersHero">

        <div>

          <span className="adminBuyersBadge">
            🧑‍💼 MARKETPLACE MANAGEMENT
          </span>

          <h1>
            Buyer Management
          </h1>

          <p>
            View marketplace buyers and
            control buyer verification.
          </p>

        </div>


        <div className="adminBuyersHeroActions">

          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin"
              )
            }
            className="adminBackButton"
          >
            ← Dashboard
          </button>


          <button
            type="button"
            onClick={
              loadBuyers
            }
            className="adminRefreshButton"
          >
            Refresh
          </button>

        </div>

      </section>


      {/* ==========================================
          STATS
      ========================================== */}

      <section className="adminBuyerStats">

        <div className="adminBuyerStatCard">

          <span>
            Total Buyers
          </span>

          <strong>
            {
              buyers.length
            }
          </strong>

        </div>


        <div className="adminBuyerStatCard verified">

          <span>
            Verified
          </span>

          <strong>
            {
              verifiedCount
            }
          </strong>

        </div>


        <div className="adminBuyerStatCard pending">

          <span>
            Not Verified
          </span>

          <strong>
            {
              unverifiedCount
            }
          </strong>

        </div>

      </section>


      {/* ==========================================
          SEARCH
      ========================================== */}

      <section className="adminBuyerSearch">

        <input
          type="text"
          value={
            search
          }
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Search by buyer, company, city or phone..."
        />

      </section>


      {/* ==========================================
          MESSAGE
      ========================================== */}

      {message && (

        <div className="adminBuyersError">
          {message}
        </div>

      )}


      {/* ==========================================
          LOADING
      ========================================== */}

      {loading && (

        <div className="adminBuyersMessage">
          Loading buyers...
        </div>

      )}


      {/* ==========================================
          EMPTY
      ========================================== */}

      {!loading &&
        !message &&
        buyers.length === 0 && (

          <div className="adminNoBuyers">

            <div>
              🧑‍💼
            </div>

            <h2>
              No Buyers Found
            </h2>

            <p>
              Marketplace buyers will
              appear here.
            </p>

          </div>

        )}


      {/* ==========================================
          BUYER CARDS
      ========================================== */}

      {!loading &&
        filteredBuyers.length > 0 && (

          <section className="adminBuyersGrid">

            {filteredBuyers.map(
              (buyer) => (

                <article
                  key={
                    buyer.id
                  }
                  className={
                    buyer.verified
                      ? "adminBuyerCard verified"
                      : "adminBuyerCard"
                  }
                >

                  <div className="adminBuyerCardTop">

                    <div className="adminBuyerAvatar">
                      🧑‍💼
                    </div>


                    <div>

                      <span className="adminBuyerId">
                        Buyer #{buyer.id}
                      </span>


                      {buyer.verified ? (

                        <span className="adminVerifiedBadge">
                          ✓ Verified
                        </span>

                      ) : (

                        <span className="adminPendingBadge">
                          Not Verified
                        </span>

                      )}

                    </div>

                  </div>


                  <h2>
                    {
                      buyer.name
                    }
                  </h2>


                  <div className="adminBuyerDetails">

                    <div>

                      <span>
                        Company
                      </span>

                      <strong>
                        {
                          buyer.company ||
                          "Not provided"
                        }
                      </strong>

                    </div>


                    <div>

                      <span>
                        Phone
                      </span>

                      <strong>
                        {
                          buyer.phone ||
                          "Not provided"
                        }
                      </strong>

                    </div>


                    <div>

                      <span>
                        City
                      </span>

                      <strong>
                        {
                          buyer.city ||
                          "Not provided"
                        }
                      </strong>

                    </div>


                    <div>

                      <span>
                        Verification
                      </span>

                      <strong>
                        {buyer.verified
                          ? "Approved"
                          : "Pending"}
                      </strong>

                    </div>

                  </div>


                  <div className="adminBuyerVerificationAction">

                    <button
                      type="button"
                      disabled={
                        updatingId ===
                        buyer.id
                      }
                      className={
                        buyer.verified
                          ? "adminRemoveVerificationButton"
                          : "adminVerifyBuyerButton"
                      }
                      onClick={() =>
                        updateVerification(
                          buyer
                        )
                      }
                    >

                      {updatingId ===
                      buyer.id
                        ? "Updating..."
                        : buyer.verified
                        ? "Remove Verification"
                        : "✓ Verify Buyer"}

                    </button>

                  </div>

                </article>

              )
            )}

          </section>

        )}


      {!loading &&
        buyers.length > 0 &&
        filteredBuyers.length === 0 && (

          <div className="adminNoBuyers">

            <div>
              🔍
            </div>

            <h2>
              No Matching Buyers
            </h2>

            <p>
              Try another search.
            </p>

          </div>

        )}

    </main>
  );
}