from fastapi import APIRouter, HTTPException
import requests


router = APIRouter(
    prefix="/api/weather",
    tags=["Weather"],
)


@router.get("")
def get_weather(
    latitude: float,
    longitude: float,
):
    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "precipitation,"
            "weather_code,"
            "wind_speed_10m"
        ),
        "daily": (
            "temperature_2m_max,"
            "temperature_2m_min,"
            "precipitation_sum,"
            "precipitation_probability_max,"
            "weather_code"
        ),
        "timezone": "auto",
        "forecast_days": 5,
    }

    headers = {
        "User-Agent": "FarmerSaathi/1.0",
        "Accept": "application/json",
    }

    try:
        response = requests.get(
            url,
            params=params,
            headers=headers,
            timeout=30,
        )

        print("Weather API URL:", response.url)
        print("Weather API status:", response.status_code)
        print("Weather API response:", response.text[:1000])

        if response.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail=f"Weather service error: {response.text[:300]}",
            )

        data = response.json()

        if "error" in data and data.get("error") is True:
            raise HTTPException(
                status_code=502,
                detail=f"Weather service error: {data.get('reason', 'Unknown error')}",
            )

        current = data.get("current") or {}
        daily = data.get("daily") or {}

        dates = daily.get("time") or []
        max_temperatures = daily.get("temperature_2m_max") or []
        min_temperatures = daily.get("temperature_2m_min") or []
        rain_values = daily.get("precipitation_sum") or []
        rain_probabilities = (
            daily.get("precipitation_probability_max") or []
        )
        weather_codes = daily.get("weather_code") or []

        forecast = []

        for index, date in enumerate(dates):
            forecast.append(
                {
                    "date": date,
                    "max_temperature": (
                        max_temperatures[index]
                        if index < len(max_temperatures)
                        else None
                    ),
                    "min_temperature": (
                        min_temperatures[index]
                        if index < len(min_temperatures)
                        else None
                    ),
                    "rain": (
                        rain_values[index]
                        if index < len(rain_values)
                        else None
                    ),
                    "rain_probability": (
                        rain_probabilities[index]
                        if index < len(rain_probabilities)
                        else None
                    ),
                    "weather_code": (
                        weather_codes[index]
                        if index < len(weather_codes)
                        else None
                    ),
                }
            )

        return {
            "latitude": latitude,
            "longitude": longitude,
            "current": {
                "temperature": current.get("temperature_2m"),
                "humidity": current.get("relative_humidity_2m"),
                "precipitation": current.get("precipitation"),
                "wind_speed": current.get("wind_speed_10m"),
                "weather_code": current.get("weather_code"),
            },
            "forecast": forecast,
        }

    except HTTPException:
        raise

    except requests.Timeout:
        raise HTTPException(
            status_code=504,
            detail="Weather service timed out.",
        )

    except requests.RequestException as error:
        print("Weather API connection error:", repr(error))

        raise HTTPException(
            status_code=502,
            detail=f"Could not connect to weather service: {str(error)}",
        )

    except ValueError as error:
        print("Weather JSON error:", repr(error))

        raise HTTPException(
            status_code=502,
            detail="Weather service returned invalid data.",
        )

    except Exception as error:
        print("Unexpected weather error:", repr(error))

        raise HTTPException(
            status_code=500,
            detail=f"Unexpected weather error: {str(error)}",
        )