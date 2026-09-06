"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";


type CropOffer = {
  id: number;
  buyer_id: number;
  buyer_name: string;
  company: string;
  crop: string;
  price_per_quintal: number;
  quantity: number;
  location: string;
  created_at?: string;
};


type Buyer = {
  id: number;
  name: string;
  company: string;
  phone?: string;
  city?: string;
  verified?: boolean;
};


type OfferForm = {
  buyer_id: string;
  crop: string;
  price_per_quintal: string;
  quantity: string;
  location: string;
};


const emptyForm: OfferForm = {
  buyer_id: "",
  crop: "",
  price_per_quintal: "",
  quantity: "",
  location: "",
};


export default function AdminOffersPage() {
  const router = useRouter();

  const [offers, setOffers] =
    useState<CropOffer[]>([]);

  const [buyers, setBuyers] =
    useState<Buyer[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingOffer, setEditingOffer] =
    useState<CropOffer | null>(null);

  const [form, setForm] =
    useState<OfferForm>(emptyForm);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
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

    loadPageData();
  }, [router]);


  async function loadPageData() {
    await Promise.all([
      loadOffers(),
      loadBuyers(),
    ]);
  }


  async function loadOffers() {
    try {
      setLoading(true);
      setMessage("");

      const token =
        localStorage.getItem(
          "adminToken"
        );

      const response =
        await fetch(
          "http://192.168.0.106:8000/api/admin/offers",
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
        if (response.status === 401) {
          handleExpiredSession();
          return;
        }

        setMessage(
          data.detail ||
            "Unable to load crop offers."
        );

        return;
      }

      setOffers(data);
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to connect to FarmerSaathi backend."
      );
    } finally {
      setLoading(false);
    }
  }


  async function loadBuyers() {
    try {
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
        if (response.status === 401) {
          handleExpiredSession();
          return;
        }

        console.error(
          data.detail ||
            "Unable to load buyers."
        );

        return;
      }

      setBuyers(data);
    } catch (error) {
      console.error(
        "Buyer loading error:",
        error
      );
    }
  }


  function handleExpiredSession() {
    localStorage.removeItem(
      "adminToken"
    );

    localStorage.removeItem(
      "adminLoggedIn"
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

    alert(
      "Your admin session has expired. Please login again."
    );

    router.replace(
      "/admin-login"
    );
  }


  function openAddForm() {
    setEditingOffer(null);

    setForm(
      emptyForm
    );

    setSuccessMessage("");

    setMessage("");

    setShowForm(true);
  }


  function openEditForm(
    offer: CropOffer
  ) {
    setEditingOffer(
      offer
    );

    setForm({
      buyer_id:
        String(
          offer.buyer_id
        ),

      crop:
        offer.crop,

      price_per_quintal:
        String(
          offer.price_per_quintal
        ),

      quantity:
        String(
          offer.quantity
        ),

      location:
        offer.location,
    });

    setSuccessMessage("");

    setMessage("");

    setShowForm(true);
  }


  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);

    setEditingOffer(null);

    setForm(
      emptyForm
    );
  }


  function updateForm(
    field: keyof OfferForm,
    value: string
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  }


  async function submitOffer(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setMessage("");
    setSuccessMessage("");


    if (!form.buyer_id) {
      setMessage(
        "Please select a buyer."
      );

      return;
    }


    if (!form.crop.trim()) {
      setMessage(
        "Please enter the crop name."
      );

      return;
    }


    const price =
      Number(
        form.price_per_quintal
      );

    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      setMessage(
        "Please enter a valid price."
      );

      return;
    }


    const quantity =
      Number(
        form.quantity
      );

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      setMessage(
        "Please enter a valid quantity."
      );

      return;
    }


    if (!form.location.trim()) {
      setMessage(
        "Please enter the location."
      );

      return;
    }


    try {
      setSaving(true);

      const token =
        localStorage.getItem(
          "adminToken"
        );


      const requestBody = {
        buyer_id:
          Number(
            form.buyer_id
          ),

        crop:
          form.crop.trim(),

        price_per_quintal:
          price,

        quantity:
          quantity,

        location:
          form.location.trim(),
      };


      const isEditing =
        editingOffer !== null;


      const url =
        isEditing
          ? `http://192.168.0.106:8000/api/admin/offers/${editingOffer.id}`
          : "http://192.168.0.106:8000/api/admin/offers";


      const response =
        await fetch(
          url,
          {
            method:
              isEditing
                ? "PATCH"
                : "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify(
                requestBody
              ),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {
        if (
          response.status === 401
        ) {
          handleExpiredSession();

          return;
        }

        setMessage(
          data.detail ||
            "Unable to save crop offer."
        );

        return;
      }


      setSuccessMessage(
        isEditing
          ? "Crop offer updated successfully."
          : "Crop offer added successfully."
      );


      setShowForm(false);

      setEditingOffer(null);

      setForm(
        emptyForm
      );


      await loadOffers();

    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to connect to FarmerSaathi backend."
      );

    } finally {
      setSaving(false);
    }
  }


  async function deleteOffer(
    offer: CropOffer
  ) {
    const confirmed =
      window.confirm(
        `Delete Offer #${offer.id} for ${offer.crop}?`
      );

    if (!confirmed) {
      return;
    }


    try {
      setDeletingId(
        offer.id
      );

      setMessage("");

      setSuccessMessage("");


      const token =
        localStorage.getItem(
          "adminToken"
        );


      const response =
        await fetch(
          `http://192.168.0.106:8000/api/admin/offers/${offer.id}`,
          {
            method:
              "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      const data =
        await response.json();


      if (!response.ok) {
        if (
          response.status === 401
        ) {
          handleExpiredSession();

          return;
        }

        setMessage(
          data.detail ||
            "Unable to delete crop offer."
        );

        return;
      }


      setSuccessMessage(
        "Crop offer deleted successfully."
      );


      setOffers(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              offer.id
          )
      );

    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to connect to FarmerSaathi backend."
      );

    } finally {
      setDeletingId(
        null
      );
    }
  }


  const filteredOffers =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return offers;
      }


      return offers.filter(
        (offer) => {
          return (
            offer.crop
              .toLowerCase()
              .includes(value) ||

            offer.buyer_name
              .toLowerCase()
              .includes(value) ||

            (
              offer.company ||
              ""
            )
              .toLowerCase()
              .includes(value) ||

            offer.location
              .toLowerCase()
              .includes(value)
          );
        }
      );

    }, [
      offers,
      search,
    ]);


  const highestPrice =
    offers.length > 0
      ? Math.max(
          ...offers.map(
            (offer) =>
              offer.price_per_quintal
          )
        )
      : 0;


  const uniqueCrops =
    new Set(
      offers.map(
        (offer) =>
          offer.crop
            .trim()
            .toLowerCase()
      )
    ).size;


  return (
    <main className="adminOffersPage">

      {/* ==========================================
          HERO
      ========================================== */}

      <section className="adminOffersHero">

        <div>

          <span className="adminOffersBadge">
            🌾 MARKETPLACE MANAGEMENT
          </span>

          <h1>
            Crop Offers
          </h1>

          <p>
            Add, edit and manage marketplace
            offers available to farmers.
          </p>

        </div>


        <div className="adminOffersHeroActions">

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
              loadPageData
            }
            className="adminRefreshButton"
          >
            Refresh
          </button>


          <button
            type="button"
            onClick={
              openAddForm
            }
            className="adminAddOfferButton"
          >
            + Add Offer
          </button>

        </div>

      </section>


      {/* ==========================================
          MESSAGES
      ========================================== */}

      {successMessage && (
        <div className="adminOfferSuccess">
          ✅ {successMessage}
        </div>
      )}


      {!showForm &&
        message && (
          <div className="adminOffersError">
            {message}
          </div>
        )}


      {/* ==========================================
          STATS
      ========================================== */}

      <section className="adminOfferStats">

        <div className="adminOfferStatCard">

          <span>
            Total Offers
          </span>

          <strong>
            {offers.length}
          </strong>

        </div>


        <div className="adminOfferStatCard">

          <span>
            Highest Price
          </span>

          <strong>
            ₹{highestPrice}
          </strong>

        </div>


        <div className="adminOfferStatCard">

          <span>
            Crops Listed
          </span>

          <strong>
            {uniqueCrops}
          </strong>

        </div>


        <div className="adminOfferStatCard">

          <span>
            Buyers
          </span>

          <strong>
            {buyers.length}
          </strong>

        </div>

      </section>


      {/* ==========================================
          SEARCH
      ========================================== */}

      <section className="adminOfferSearch">

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          placeholder="Search by crop, buyer, company or location..."
        />

      </section>


      {/* ==========================================
          LOADING
      ========================================== */}

      {loading && (
        <div className="adminOffersMessage">
          Loading crop offers...
        </div>
      )}


      {/* ==========================================
          EMPTY STATE
      ========================================== */}

      {!loading &&
        !message &&
        offers.length === 0 && (

          <div className="adminNoOffers">

            <div>
              🌾
            </div>

            <h2>
              No Crop Offers
            </h2>

            <p>
              Click Add Offer to create
              the first marketplace offer.
            </p>

            <button
              type="button"
              className="adminAddOfferButton"
              onClick={
                openAddForm
              }
            >
              + Add Offer
            </button>

          </div>
        )}


      {/* ==========================================
          NO SEARCH RESULTS
      ========================================== */}

      {!loading &&
        offers.length > 0 &&
        filteredOffers.length === 0 && (

          <div className="adminNoOffers">

            <div>
              🔍
            </div>

            <h2>
              No Matching Offers
            </h2>

            <p>
              Try another search.
            </p>

          </div>
        )}


      {/* ==========================================
          OFFER CARDS
      ========================================== */}

      {!loading &&
        filteredOffers.length > 0 && (

          <section className="adminOffersGrid">

            {filteredOffers.map(
              (offer) => (

                <article
                  key={offer.id}
                  className="adminOfferCard"
                >

                  <div className="adminOfferCardTop">

                    <div className="adminOfferIcon">
                      🌾
                    </div>

                    <span className="adminOfferId">
                      Offer #{offer.id}
                    </span>

                  </div>


                  <h2>
                    {offer.crop}
                  </h2>


                  <div className="adminOfferPrice">
                    ₹
                    {offer.price_per_quintal}
                  </div>

                  <p className="adminOfferPriceLabel">
                    per quintal
                  </p>


                  <div className="adminOfferDetails">

                    <div>
                      <span>
                        Buyer
                      </span>

                      <strong>
                        {offer.buyer_name}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Company
                      </span>

                      <strong>
                        {offer.company ||
                          "Not provided"}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Quantity
                      </span>

                      <strong>
                        {offer.quantity}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Location
                      </span>

                      <strong>
                        {offer.location}
                      </strong>
                    </div>

                  </div>


                  {offer.created_at && (

                    <div className="adminOfferDate">

                      Created:{" "}

                      {new Date(
                        offer.created_at
                      ).toLocaleString()}

                    </div>
                  )}


                  <div className="adminOfferActions">

                    <button
                      type="button"
                      className="adminOfferEditButton"
                      onClick={() =>
                        openEditForm(
                          offer
                        )
                      }
                    >
                      ✏️ Edit
                    </button>


                    <button
                      type="button"
                      className="adminOfferDeleteButton"
                      disabled={
                        deletingId ===
                        offer.id
                      }
                      onClick={() =>
                        deleteOffer(
                          offer
                        )
                      }
                    >
                      {deletingId ===
                      offer.id
                        ? "Deleting..."
                        : "🗑️ Delete"}
                    </button>

                  </div>

                </article>

              )
            )}

          </section>
        )}


      {/* ==========================================
          ADD / EDIT MODAL
      ========================================== */}

      {showForm && (

        <div className="adminOfferModalOverlay">

          <div className="adminOfferModal">

            <div className="adminOfferModalHeader">

              <div>

                <span>
                  🌾 MARKETPLACE
                </span>

                <h2>
                  {editingOffer
                    ? `Edit Offer #${editingOffer.id}`
                    : "Add Crop Offer"}
                </h2>

              </div>


              <button
                type="button"
                onClick={
                  closeForm
                }
                className="adminOfferModalClose"
              >
                ×
              </button>

            </div>


            {message && (
              <div className="adminOffersError">
                {message}
              </div>
            )}


            <form
              onSubmit={
                submitOffer
              }
              className="adminOfferForm"
            >

              <label>

                Buyer

                <select
                  value={
                    form.buyer_id
                  }
                  onChange={(e) =>
                    updateForm(
                      "buyer_id",
                      e.target.value
                    )
                  }
                  required
                >

                  <option value="">
                    Select buyer
                  </option>

                  {buyers.map(
                    (buyer) => (

                      <option
                        key={buyer.id}
                        value={buyer.id}
                      >
                        {buyer.name}
                        {buyer.company
                          ? ` - ${buyer.company}`
                          : ""}
                      </option>

                    )
                  )}

                </select>

              </label>


              <label>

                Crop Name

                <input
                  type="text"
                  value={
                    form.crop
                  }
                  onChange={(e) =>
                    updateForm(
                      "crop",
                      e.target.value
                    )
                  }
                  placeholder="Example: Wheat"
                  required
                />

              </label>


              <div className="adminOfferFormRow">

                <label>

                  Price per Quintal

                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={
                      form.price_per_quintal
                    }
                    onChange={(e) =>
                      updateForm(
                        "price_per_quintal",
                        e.target.value
                      )
                    }
                    placeholder="Example: 2500"
                    required
                  />

                </label>


                <label>

                  Quantity

                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={
                      form.quantity
                    }
                    onChange={(e) =>
                      updateForm(
                        "quantity",
                        e.target.value
                      )
                    }
                    placeholder="Example: 100"
                    required
                  />

                </label>

              </div>


              <label>

                Location

                <input
                  type="text"
                  value={
                    form.location
                  }
                  onChange={(e) =>
                    updateForm(
                      "location",
                      e.target.value
                    )
                  }
                  placeholder="Example: Mumbai"
                  required
                />

              </label>


              <div className="adminOfferFormActions">

                <button
                  type="button"
                  className="adminOfferCancelButton"
                  onClick={
                    closeForm
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="adminOfferSaveButton"
                  disabled={
                    saving
                  }
                >

                  {saving
                    ? "Saving..."
                    : editingOffer
                    ? "Save Changes"
                    : "Add Offer"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </main>
  );
}