"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [village, setVillage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    // Check required fields
    if (
      !name.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill all required fields.");
      return;
    }

    // Check phone number
    if (!/^\d{10}$/.test(phone.trim())) {
      setError("Mobile number must be exactly 10 digits.");
      return;
    }

    // Check password length
    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    // Check both passwords
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://192.168.0.106:8000/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
            village: village.trim() || null,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
            "Registration failed. Please try again."
        );

        return;
      }

      alert(
        "Account created successfully! Please login."
      );

      router.push("/login");

    } catch (err) {
      console.error(
        "Registration error:",
        err
      );

      setError(
        "Cannot connect to FarmerSaathi backend. Make sure the backend is running."
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>

      <div style={styles.card}>

        {/* Logo */}

        <div style={styles.logo}>
          🌾
        </div>

        <h1 style={styles.title}>
          Create Farmer Account
        </h1>

        <p style={styles.subtitle}>
          Join FarmerSaathi and access smart farming services
        </p>


        {/* Registration Form */}

        <form onSubmit={handleRegister}>

          {/* Farmer Name */}

          <label style={styles.label}>
            Farmer Name *
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="Enter your name"
            style={styles.input}
            disabled={loading}
          />


          {/* Mobile Number */}

          <label style={styles.label}>
            Mobile Number *
          </label>

          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              const numbersOnly =
                e.target.value.replace(/\D/g, "");

              setPhone(numbersOnly);
              setError("");
            }}
            placeholder="Enter 10 digit mobile number"
            maxLength={10}
            style={styles.input}
            disabled={loading}
          />


          {/* Village */}

          <label style={styles.label}>
            Village
          </label>

          <input
            type="text"
            value={village}
            onChange={(e) => {
              setVillage(e.target.value);
              setError("");
            }}
            placeholder="Enter village name"
            style={styles.input}
            disabled={loading}
          />


          {/* Password */}

          <label style={styles.label}>
            Password *
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder="Create password"
            style={styles.input}
            disabled={loading}
          />


          {/* Confirm Password */}

          <label style={styles.label}>
            Confirm Password *
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(
                e.target.value
              );

              setError("");
            }}
            placeholder="Enter password again"
            style={styles.input}
            disabled={loading}
          />


          {/* Error */}

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}


          {/* Create Account Button */}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,

              opacity:
                loading ? 0.6 : 1,

              cursor:
                loading
                  ? "not-allowed"
                  : "pointer",
            }}
          >

            {loading
              ? "Creating Account..."
              : "Create Account"}

          </button>

        </form>


        {/* Login Link */}

        <p style={styles.loginText}>

          Already have an account?{" "}

          <Link
            href="/login"
            style={styles.loginLink}
          >
            Login
          </Link>

        </p>


        <div style={styles.bottomBox}>

          <p style={styles.bottomTitle}>
            🌱 FarmerSaathi
          </p>

          <p style={styles.bottomText}>
            AI farming guidance, weather,
            buyers, transport and emergency
            assistance in one platform.
          </p>

        </div>

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

    padding: "50px 20px",

    background:
      "linear-gradient(135deg, #edf8ed 0%, #f8fcf5 100%)",
  },


  card: {
    width: "100%",

    maxWidth: "480px",

    backgroundColor: "#ffffff",

    padding: "40px",

    borderRadius: "20px",

    boxShadow:
      "0 10px 40px rgba(0,0,0,0.12)",
  },


  logo: {
    textAlign: "center",

    fontSize: "55px",

    marginBottom: "5px",
  },


  title: {
    textAlign: "center",

    color: "#166534",

    fontSize: "30px",

    marginTop: "5px",

    marginBottom: "8px",
  },


  subtitle: {
    textAlign: "center",

    color: "#6b7280",

    lineHeight: "1.5",

    marginBottom: "30px",
  },


  label: {
    display: "block",

    fontWeight: "600",

    color: "#26352b",

    marginBottom: "8px",
  },


  input: {
    width: "100%",

    padding: "13px 14px",

    marginBottom: "20px",

    border: "1px solid #cbd5cb",

    borderRadius: "9px",

    fontSize: "16px",

    outline: "none",

    boxSizing: "border-box",

    backgroundColor: "#ffffff",

    color: "#222222",
  },


  button: {
    width: "100%",

    padding: "14px",

    backgroundColor: "#16803c",

    color: "#ffffff",

    border: "none",

    borderRadius: "9px",

    fontSize: "17px",

    fontWeight: "700",
  },


  error: {
    backgroundColor: "#fee2e2",

    color: "#b91c1c",

    padding: "12px",

    borderRadius: "8px",

    marginBottom: "18px",

    textAlign: "center",

    fontSize: "14px",
  },


  loginText: {
    textAlign: "center",

    color: "#666666",

    marginTop: "25px",
  },


  loginLink: {
    color: "#16803c",

    fontWeight: "700",

    textDecoration: "none",
  },


  bottomBox: {
    marginTop: "25px",

    padding: "15px",

    borderRadius: "10px",

    backgroundColor: "#f0fdf4",

    textAlign: "center",
  },


  bottomTitle: {
    color: "#166534",

    fontWeight: "700",

    margin: "0 0 5px",
  },


  bottomText: {
    color: "#667068",

    fontSize: "13px",

    lineHeight: "1.5",

    margin: "0",
  },
};