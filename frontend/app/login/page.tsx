"use client";

import { useState } from "react";
import Link from "next/link";

const API_BASE_URL =
  "http://192.168.0.106:8000";

export default function LoginPage() {
  const [phone, setPhone] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    const cleanPhone =
      phone.trim();

    if (
      !cleanPhone ||
      !password
    ) {
      setError(
        "Please enter mobile number and password."
      );
      return;
    }

    if (
      !/^\d{10}$/.test(
        cleanPhone
      )
    ) {
      setError(
        "Mobile number must be exactly 10 digits."
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await fetch(
          `${API_BASE_URL}/api/auth/login`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                phone:
                  cleanPhone,

                password,
              }),
          }
        );

      const data =
        await response.json();

      console.log(
        "Login response:",
        data
      );

      if (!response.ok) {
        setError(
          data.detail ||
            "Invalid mobile number or password."
        );
        return;
      }

      if (
        !data.token ||
        !data.farmer_id
      ) {
        console.error(
          "Incomplete login response:",
          data
        );

        setError(
          "Login succeeded but farmer session information was incomplete."
        );

        return;
      }

      // Clear old session
      localStorage.removeItem(
        "farmerToken"
      );

      localStorage.removeItem(
        "farmerLoggedIn"
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

      // Save new farmer session
      localStorage.setItem(
        "farmerToken",
        String(data.token)
      );

      localStorage.setItem(
        "farmerLoggedIn",
        "true"
      );

      localStorage.setItem(
        "farmerPhone",
        String(
          data.phone || cleanPhone
        )
      );

      localStorage.setItem(
        "farmerName",
        String(
          data.name || "Farmer"
        )
      );

      localStorage.setItem(
        "farmerId",
        String(
          data.farmer_id
        )
      );

      if (data.village) {
        localStorage.setItem(
          "farmerVillage",
          String(data.village)
        );
      }

      /*
       * Use a full navigation so the Home page
       * immediately reads the new localStorage session.
       *
       * Works in:
       * - normal browser
       * - PWA
       * - Capacitor Android APK
       */
      window.location.replace(
        "/"
      );
    } catch (err) {
      console.error(
        "Farmer login error:",
        err
      );

      setError(
        "Cannot connect to FarmerSaathi backend."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>

        <div style={styles.logo}>
          🌾
        </div>

        <h1 style={styles.title}>
          FarmerSaathi
        </h1>

        <h2 style={styles.subtitle}>
          Farmer Login
        </h2>

        <p style={styles.description}>
          Login with your registered
          farmer account
        </p>

        <form
          onSubmit={
            handleLogin
          }
        >

          <label style={styles.label}>
            Mobile Number
          </label>

          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={phone}
            onChange={(e) => {
              const numbersOnly =
                e.target.value.replace(
                  /\D/g,
                  ""
                );

              setPhone(
                numbersOnly
              );

              setError("");
            }}
            placeholder="Enter registered mobile number"
            maxLength={10}
            style={styles.input}
            disabled={loading}
          />

          <label style={styles.label}>
            Password
          </label>

          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(
                e.target.value
              );

              setError("");
            }}
            placeholder="Enter password"
            style={styles.input}
            disabled={loading}
          />

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,

              opacity:
                loading
                  ? 0.7
                  : 1,

              cursor:
                loading
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        <p style={styles.registerText}>
          Don't have an account?{" "}

          <Link
            href="/register"
            style={
              styles.registerLink
            }
          >
            Create Account
          </Link>
        </p>

        <div style={styles.infoBox}>

          <strong
            style={
              styles.infoTitle
            }
          >
            🔐 Secure Farmer Login
          </strong>

          <p style={styles.infoText}>
            FarmerSaathi creates a
            secure session when you
            log in. This session is
            used to protect your
            profile and emergency
            requests.
          </p>

        </div>

      </div>
    </main>
  );
}

const styles: {
  [key: string]:
    React.CSSProperties;
} = {
  page: {
    minHeight:
      "calc(100vh - 80px)",
    display: "flex",
    justifyContent:
      "center",
    alignItems: "center",
    padding: "40px 20px",
    background:
      "linear-gradient(135deg, #eef9ef 0%, #f8fcf5 100%)",
  },

  card: {
    width: "100%",
    maxWidth: "430px",
    backgroundColor:
      "#ffffff",
    padding: "40px",
    borderRadius: "20px",
    boxShadow:
      "0 10px 40px rgba(0,0,0,0.12)",
  },

  logo: {
    textAlign: "center",
    fontSize: "55px",
  },

  title: {
    textAlign: "center",
    color: "#166534",
    fontSize: "32px",
    margin: "5px 0",
  },

  subtitle: {
    textAlign: "center",
    fontSize: "20px",
    color: "#333333",
    marginBottom: "5px",
  },

  description: {
    textAlign: "center",
    color: "#777777",
    marginBottom: "30px",
  },

  label: {
    display: "block",
    fontWeight: "600",
    marginBottom: "8px",
    color: "#333333",
  },

  input: {
    width: "100%",
    padding: "13px 14px",
    marginBottom: "20px",
    borderRadius: "9px",
    border:
      "1px solid #cccccc",
    fontSize: "16px",
    boxSizing:
      "border-box",
    outline: "none",
  },

  button: {
    width: "100%",
    padding: "14px",
    backgroundColor:
      "#16803c",
    color: "#ffffff",
    border: "none",
    borderRadius: "9px",
    fontSize: "17px",
    fontWeight: "700",
  },

  error: {
    backgroundColor:
      "#fee2e2",
    color: "#b91c1c",
    padding: "11px",
    borderRadius: "8px",
    marginBottom: "15px",
    textAlign: "center",
  },

  registerText: {
    textAlign: "center",
    marginTop: "25px",
    color: "#666666",
  },

  registerLink: {
    color: "#16803c",
    fontWeight: "700",
    textDecoration: "none",
  },

  infoBox: {
    marginTop: "25px",
    padding: "15px",
    borderRadius: "10px",
    backgroundColor:
      "#f0fdf4",
    textAlign: "center",
  },

  infoTitle: {
    color: "#166534",
  },

  infoText: {
    color: "#667068",
    fontSize: "13px",
    lineHeight: "1.5",
    marginBottom: "0",
  },
};