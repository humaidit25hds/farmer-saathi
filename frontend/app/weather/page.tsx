"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ForecastDay = {
  date: string;
  max_temperature: number;
  min_temperature: number;
  rain: number;
  rain_probability: number;
  weather_code: number;
};

type WeatherData = {
  latitude: number;
  longitude: number;

  current: {
    temperature: number;
    humidity: number;
    precipitation: number;
    wind_speed: number;
    weather_code: number;
  };

  forecast: ForecastDay[];
};

export default function WeatherPage() {
  const router = useRouter();

  const [checkingLogin, setCheckingLogin] =
    useState(true);

  const [weather, setWeather] =
    useState<WeatherData | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loggedIn =
      localStorage.getItem("farmerLoggedIn");

    const farmerId =
      localStorage.getItem("farmerId");

    if (
      loggedIn !== "true" ||
      !farmerId
    ) {
      router.replace("/login");
      return;
    }

    setCheckingLogin(false);
  }, [router]);

  function getWeather() {
    if (!navigator.geolocation) {
      setError(
        "Location is not supported by this browser."
      );
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;

          const response = await fetch(
            `http://192.168.0.106:8000/api/weather?latitude=${latitude}&longitude=${longitude}`
          );

          if (!response.ok) {
            throw new Error(
              "Weather request failed"
            );
          }

          const data =
            await response.json();

          setWeather(data);
        } catch {
          setError(
            "Could not load weather information."
          );
        } finally {
          setLoading(false);
        }
      },

      () => {
        setError(
          "Location permission was denied. Please allow location access."
        );

        setLoading(false);
      }
    );
  }

  function weatherIcon(code: number) {
    if (code === 0) {
      return "☀️";
    }

    if ([1, 2, 3].includes(code)) {
      return "⛅";
    }

    if ([45, 48].includes(code)) {
      return "🌫️";
    }

    if (
      [
        51,
        53,
        55,
        61,
        63,
        65,
        80,
        81,
        82,
      ].includes(code)
    ) {
      return "🌧️";
    }

    if (
      [95, 96, 99].includes(code)
    ) {
      return "⛈️";
    }

    return "🌤️";
  }

  function farmingAdvice() {
    if (!weather) {
      return "";
    }

    const today =
      weather.forecast?.[0];

    if (
      today &&
      today.rain_probability >= 70
    ) {
      return "High chance of rain. Irrigation may not be necessary. Avoid spraying chemicals if rain is expected.";
    }

    if (
      weather.current.wind_speed >= 20
    ) {
      return "Wind speed is high. Avoid pesticide or fertilizer spraying until wind becomes calmer.";
    }

    if (
      weather.current.temperature >= 35
    ) {
      return "Temperature is high. Check soil moisture and avoid spraying during the hottest part of the day.";
    }

    return "Weather conditions appear moderate. Continue checking crop moisture and local field conditions before irrigation or spraying.";
  }

  if (checkingLogin) {
    return (
      <main
        style={{
          minHeight: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "18px",
        }}
      >
        <p>
          Checking FarmerSaathi login...
        </p>
      </main>
    );
  }

  return (
    <main className="weatherPage">
      <section className="weatherHero">
        <span className="weatherBadge">
          🌦️ FARM WEATHER
        </span>

        <h1>
          Weather for Your Farm
        </h1>

        <p>
          Get local weather and simple farming
          guidance using your current location.
        </p>

        <button
          type="button"
          className="getWeatherButton"
          onClick={getWeather}
          disabled={loading}
        >
          {loading
            ? "📍 Getting Weather..."
            : "📍 Use My Current Location"}
        </button>
      </section>

      {error && (
        <div className="weatherError">
          ⚠️ {error}
        </div>
      )}

      {weather && (
        <section className="weatherContent">
          <div className="currentWeatherCard">
            <div className="currentWeatherIcon">
              {weatherIcon(
                weather.current.weather_code
              )}
            </div>

            <div>
              <span>
                Current Temperature
              </span>

              <h2>
                {weather.current.temperature}
                °C
              </h2>
            </div>
          </div>

          <div className="weatherStats">
            <div className="weatherStatCard">
              <span>
                💧 Humidity
              </span>

              <strong>
                {weather.current.humidity}
                %
              </strong>
            </div>

            <div className="weatherStatCard">
              <span>
                🌧️ Rain Now
              </span>

              <strong>
                {
                  weather.current
                    .precipitation
                }{" "}
                mm
              </strong>
            </div>

            <div className="weatherStatCard">
              <span>
                💨 Wind
              </span>

              <strong>
                {
                  weather.current
                    .wind_speed
                }{" "}
                km/h
              </strong>
            </div>
          </div>

          <div className="farmWeatherAdvice">
            <div>
              🌱
            </div>

            <div>
              <h2>
                FarmerSaathi Advice
              </h2>

              <p>
                {farmingAdvice()}
              </p>
            </div>
          </div>

          <div className="forecastSection">
            <h2>
              📅 5-Day Farm Forecast
            </h2>

            <div className="forecastGrid">
              {weather.forecast.map(
                (day) => (
                  <div
                    className="forecastCard"
                    key={day.date}
                  >
                    <strong>
                      {new Date(
                        `${day.date}T00:00:00`
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          weekday: "short",
                        }
                      )}
                    </strong>

                    <span className="forecastIcon">
                      {weatherIcon(
                        day.weather_code
                      )}
                    </span>

                    <p>
                      {
                        day.max_temperature
                      }
                      ° /{" "}
                      {
                        day.min_temperature
                      }
                      °
                    </p>

                    <span>
                      🌧️{" "}
                      {
                        day.rain_probability
                      }
                      %
                    </span>

                    <small>
                      {day.rain} mm rain
                    </small>
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}