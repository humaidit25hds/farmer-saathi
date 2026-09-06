"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();

  const [farmerId, setFarmerId] = useState("");
  const [phone, setPhone] = useState("");

  const [name, setName] = useState("");
  const [village, setVillage] = useState("");

  const [editName, setEditName] = useState("");
  const [editVillage, setEditVillage] = useState("");

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");


  useEffect(() => {
    const loggedIn =
      localStorage.getItem("farmerLoggedIn");

    const savedFarmerId =
      localStorage.getItem("farmerId");

    if (
      loggedIn !== "true" ||
      !savedFarmerId
    ) {
      router.replace("/login");
      return;
    }

    setFarmerId(savedFarmerId);

    loadProfile(savedFarmerId);
  }, [router]);


  async function loadProfile(id: string) {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://192.168.0.106:8000/api/auth/profile/${id}`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
          "Could not load farmer profile."
        );
        return;
      }

      setName(data.name || "");
      setPhone(data.phone || "");
      setVillage(data.village || "");

      setEditName(data.name || "");
      setEditVillage(data.village || "");

      localStorage.setItem(
        "farmerName",
        data.name || ""
      );

      localStorage.setItem(
        "farmerPhone",
        data.phone || ""
      );

      if (data.village) {
        localStorage.setItem(
          "farmerVillage",
          data.village
        );
      } else {
        localStorage.removeItem(
          "farmerVillage"
        );
      }

    } catch (err) {
      console.error(err);

      setError(
        "Cannot connect to FarmerSaathi backend."
      );

    } finally {
      setLoading(false);
    }
  }


  function startEditing() {
    setEditName(name);
    setEditVillage(village);

    setMessage("");
    setError("");

    setEditing(true);
  }


  function cancelEditing() {
    setEditName(name);
    setEditVillage(village);

    setMessage("");
    setError("");

    setEditing(false);
  }


  async function saveProfile() {
    if (!editName.trim()) {
      setError("Farmer name cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `http://192.168.0.106:8000/api/auth/profile/${farmerId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: editName.trim(),
            village: editVillage.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
          "Could not update profile."
        );
        return;
      }

      setName(data.name || "");
      setVillage(data.village || "");

      localStorage.setItem(
        "farmerName",
        data.name || ""
      );

      if (data.village) {
        localStorage.setItem(
          "farmerVillage",
          data.village
        );
      } else {
        localStorage.removeItem(
          "farmerVillage"
        );
      }

      setEditing(false);

      setMessage(
        "Profile updated successfully!"
      );

    } catch (err) {
      console.error(err);

      setError(
        "Cannot connect to FarmerSaathi backend."
      );

    } finally {
      setSaving(false);
    }
  }


  function handleLogout() {
    localStorage.removeItem(
      "farmerLoggedIn"
    );

    localStorage.removeItem(
      "farmerName"
    );

    localStorage.removeItem(
      "farmerPhone"
    );

    localStorage.removeItem(
      "farmerVillage"
    );

    localStorage.removeItem(
      "farmerId"
    );

    router.replace("/login");
  }


  if (loading) {
    return (
      <main style={styles.loadingPage}>
        <p>Loading farmer profile...</p>
      </main>
    );
  }


  return (
    <main style={styles.page}>

      <div style={styles.card}>

        <div style={styles.avatar}>
          👨‍🌾
        </div>

        <h1 style={styles.title}>
          Farmer Profile
        </h1>

        <p style={styles.subtitle}>
          Manage your FarmerSaathi account
        </p>


        {message && (
          <div style={styles.success}>
            ✅ {message}
          </div>
        )}


        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}


        {!editing ? (
          <>
            <div style={styles.profileSection}>

              <div style={styles.row}>
                <span style={styles.label}>
                  👤 Farmer Name
                </span>

                <span style={styles.value}>
                  {name || "Farmer"}
                </span>
              </div>


              <div style={styles.row}>
                <span style={styles.label}>
                  📱 Mobile Number
                </span>

                <span style={styles.value}>
                  {phone || "Not available"}
                </span>
              </div>


              <div style={styles.row}>
                <span style={styles.label}>
                  📍 Village
                </span>

                <span style={styles.value}>
                  {village || "Not provided"}
                </span>
              </div>


              <div style={styles.row}>
                <span style={styles.label}>
                  🆔 Farmer ID
                </span>

                <span style={styles.value}>
                  {farmerId}
                </span>
              </div>

            </div>


            <button
              onClick={startEditing}
              style={styles.editButton}
            >
              ✏️ Edit Profile
            </button>
          </>
        ) : (
          <div style={styles.editSection}>

            <h3 style={styles.editTitle}>
              Edit Profile
            </h3>


            <label style={styles.inputLabel}>
              Farmer Name
            </label>

            <input
              type="text"
              value={editName}
              onChange={(e) =>
                setEditName(e.target.value)
              }
              placeholder="Enter farmer name"
              style={styles.input}
              disabled={saving}
            />


            <label style={styles.inputLabel}>
              Village
            </label>

            <input
              type="text"
              value={editVillage}
              onChange={(e) =>
                setEditVillage(e.target.value)
              }
              placeholder="Enter village"
              style={styles.input}
              disabled={saving}
            />


            <label style={styles.inputLabel}>
              Mobile Number
            </label>

            <input
              type="text"
              value={phone}
              style={{
                ...styles.input,
                backgroundColor: "#eeeeee",
              }}
              disabled
            />

            <p style={styles.phoneNote}>
              Mobile number cannot be changed here.
            </p>


            <div style={styles.editButtons}>

              <button
                onClick={saveProfile}
                disabled={saving}
                style={styles.saveButton}
              >
                {saving
                  ? "Saving..."
                  : "💾 Save Changes"}
              </button>


              <button
                onClick={cancelEditing}
                disabled={saving}
                style={styles.cancelButton}
              >
                Cancel
              </button>

            </div>

          </div>
        )}


        <Link
          href="/"
          style={styles.homeButton}
        >
          ← Back to Home
        </Link>


        <button
          onClick={handleLogout}
          style={styles.logoutButton}
        >
          Logout
        </button>

      </div>

    </main>
  );
}


const styles: {
  [key: string]: React.CSSProperties;
} = {

  page: {
    minHeight: "calc(100vh - 80px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 20px",

    background:
      "linear-gradient(135deg, #eef9ef 0%, #f8fcf5 100%)",
  },


  loadingPage: {
    minHeight: "80vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "18px",
  },


  card: {
    width: "100%",
    maxWidth: "520px",

    backgroundColor: "#ffffff",

    padding: "40px",

    borderRadius: "20px",

    boxShadow:
      "0 10px 40px rgba(0,0,0,0.12)",
  },


  avatar: {
    textAlign: "center",
    fontSize: "65px",
    marginBottom: "10px",
  },


  title: {
    textAlign: "center",
    color: "#166534",
    fontSize: "30px",
    margin: "0 0 5px",
  },


  subtitle: {
    textAlign: "center",
    color: "#777777",
    marginBottom: "30px",
  },


  profileSection: {
    backgroundColor: "#f8fbf6",
    borderRadius: "14px",
    padding: "10px 20px",
    marginBottom: "20px",
  },


  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",

    padding: "17px 0",

    borderBottom:
      "1px solid #e3e8e3",
  },


  label: {
    fontWeight: "700",
    color: "#37463c",
  },


  value: {
    color: "#166534",
    fontWeight: "600",
    textAlign: "right",
  },


  editSection: {
    backgroundColor: "#f8fbf6",
    padding: "22px",
    borderRadius: "14px",
    marginBottom: "20px",
  },


  editTitle: {
    color: "#166534",
    marginTop: "0",
  },


  inputLabel: {
    display: "block",
    fontWeight: "700",
    color: "#37463c",
    marginBottom: "7px",
  },


  input: {
    width: "100%",
    padding: "12px",

    border:
      "1px solid #cccccc",

    borderRadius: "8px",

    fontSize: "15px",

    boxSizing: "border-box",

    marginBottom: "17px",
  },


  phoneNote: {
    fontSize: "12px",
    color: "#777777",
    marginTop: "-10px",
    marginBottom: "20px",
  },


  editButtons: {
    display: "flex",
    gap: "10px",
  },


  editButton: {
    width: "100%",
    padding: "13px",

    backgroundColor: "#16803c",

    color: "#ffffff",

    border: "none",

    borderRadius: "9px",

    fontWeight: "700",

    cursor: "pointer",

    marginBottom: "12px",
  },


  saveButton: {
    flex: 1,

    padding: "12px",

    backgroundColor: "#16803c",

    color: "#ffffff",

    border: "none",

    borderRadius: "8px",

    fontWeight: "700",

    cursor: "pointer",
  },


  cancelButton: {
    flex: 1,

    padding: "12px",

    backgroundColor: "#eeeeee",

    color: "#333333",

    border: "none",

    borderRadius: "8px",

    fontWeight: "700",

    cursor: "pointer",
  },


  homeButton: {
    display: "block",

    width: "100%",

    boxSizing: "border-box",

    textAlign: "center",

    padding: "13px",

    backgroundColor: "#173d24",

    color: "#ffffff",

    textDecoration: "none",

    borderRadius: "9px",

    fontWeight: "700",

    marginBottom: "12px",
  },


  logoutButton: {
    width: "100%",

    padding: "13px",

    backgroundColor: "#ffffff",

    color: "#b91c1c",

    border:
      "1px solid #fecaca",

    borderRadius: "9px",

    fontWeight: "700",

    cursor: "pointer",
  },


  success: {
    backgroundColor: "#dcfce7",
    color: "#166534",

    padding: "12px",

    borderRadius: "8px",

    textAlign: "center",

    marginBottom: "20px",
  },


  error: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",

    padding: "12px",

    borderRadius: "8px",

    textAlign: "center",

    marginBottom: "20px",
  },
};