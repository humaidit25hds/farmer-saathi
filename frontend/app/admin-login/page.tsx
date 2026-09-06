"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");

    if (!username.trim() || !password.trim()) {
      setMessage("Please enter username and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://192.168.0.106:8000/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail || "Invalid username or password."
        );
        return;
      }

      // Save admin login information
      localStorage.setItem(
        "adminToken",
        data.token
      );

      localStorage.setItem(
        "adminLoggedIn",
        "true"
      );

      localStorage.setItem(
        "adminName",
        data.admin?.name || "Admin"
      );

      localStorage.setItem(
        "adminUsername",
        data.admin?.username || username
      );

      localStorage.setItem(
        "adminRole",
        data.admin?.role || "Admin"
      );

      setMessage("Login successful.");

      router.push("/admin");
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to connect to FarmerSaathi backend."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-green-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        <div className="text-center mb-8">
          <div className="text-5xl mb-3">
            🌾
          </div>

          <h1 className="text-3xl font-bold text-green-700">
            FarmerSaathi
          </h1>

          <p className="text-gray-600 mt-2">
            Admin Login
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              placeholder="Enter admin username"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {message && (
            <div
              className={`text-sm text-center p-3 rounded-lg ${
                message === "Login successful."
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading
              ? "Logging in..."
              : "Login as Admin"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() =>
              router.push("/login")
            }
            className="text-green-700 hover:underline text-sm"
          >
            ← Farmer Login
          </button>
        </div>

        <div className="mt-8 border-t pt-5 text-center">
          <p className="text-xs text-gray-500">
            FarmerSaathi Administration
          </p>
        </div>

      </div>
    </main>
  );
}