from fastapi import APIRouter, HTTPException
import requests
import time


router = APIRouter(
    prefix="/api/weather",
    tags=["Weather"],
)


# =========================================================
# SIMPLE WEATHER CACHE
# =========================================================

# Cache lifetime = 15 minutes
CACHE_TTL_SECONDS = 15 * 60

# Example structure:
# {
#   "19.09,72.90": {
#       "timestamp": 1234567890,
#       "data": {...}
#   }
# }
weather_cache = {}


def get_cache_key(
    latitude: float,
    longitude: float,
):
    """
    Round coordinates so nearby requests use the same cache entry.
    2 decimal places is roughly around 1 km precision.
    """
    return f"{latitude:.2f},{longitude:.2f}"


def get_cached_weather(
    latitude: float,
    longitude: float,
):
    key = get_cache_key(
        latitude,
        longitude,
    )

    cached = weather_cache.get(key)

    if not cached:
        return None

    age = time.time() - cached["timestamp"]

    if age > CACHE_TTL_SECONDS:
        weather_cache.pop(
            key,
            None,
        )
        return None

    print(
        "Returning cached weather:",
        key,
    )

    return cached["data"]


def save_weather_cache(
    latitude: float,
    longitude: float,
    data: dict,
):
    key = get_cache_key(
        latitude,
        longitude,
    )

    weather_cache[key] = {
        "timestamp": time.time(),
        "data": data,
    }


# =========================================================
# WEATHER ENDPOINT
# =========================================================

@router.get("")
def get_weather(
    latitude: float,
    longitude: float,
):

    # -----------------------------------------------------
    # CHECK CACHE FIRST
    # -----------------------------------------------------

    cached_weather = get_cached_weather(
        latitude,
        longitude,
    )

    if cached_weather:
        return cached_weather


    # -----------------------------------------------------
    # OPEN-METEO API
    # -----------------------------------------------------

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


        print(
            "Weather API URL:",
            response.url,
        )

        print(
            "Weather API status:",
            response.status_code,
        )


        # -------------------------------------------------
        # HANDLE OPEN-METEO ERROR
        # -------------------------------------------------

        if response.status_code != 200:

            error_text = response.text[:500]

            print(
                "Weather API error:",
                error_text,
            )

            # Friendly message for quota problem
            if (
                "request limit exceeded"
                in error_text.lower()
            ):
                raise HTTPException(
                    status_code=429,
                    detail=(
                        "Weather service daily request "
                        "limit has been reached. "
                        "Please try again later."
                    ),
                )

            raise HTTPException(
                status_code=502,
                detail=(
                    f"Weather service error: "
                    f"{error_text}"
                ),
            )


        # -------------------------------------------------
        # READ JSON
        # -------------------------------------------------

        data = response.json()


        if (
            data.get("error") is True
        ):

            reason = data.get(
                "reason",
                "Unknown weather service error",
            )

            if (
                "request limit exceeded"
                in reason.lower()
            ):
                raise HTTPException(
                    status_code=429,
                    detail=(
                        "Weather service daily request "
                        "limit has been reached. "
                        "Please try again later."
                    ),
                )

            raise HTTPException(
                status_code=502,
                detail=f"Weather service error: {reason}",
            )


        # -------------------------------------------------
        # CURRENT WEATHER
        # -------------------------------------------------

        current = (
            data.get("current")
            or {}
        )


        # -------------------------------------------------
        # DAILY FORECAST
        # -------------------------------------------------

        daily = (
            data.get("daily")
            or {}
        )


        dates = (
            daily.get("time")
            or []
        )

        max_temperatures = (
            daily.get(
                "temperature_2m_max"
            )
            or []
        )

        min_temperatures = (
            daily.get(
                "temperature_2m_min"
            )
            or []
        )

        rain_values = (
            daily.get(
                "precipitation_sum"
            )
            or []
        )

        rain_probabilities = (
            daily.get(
                "precipitation_probability_max"
            )
            or []
        )

        weather_codes = (
            daily.get(
                "weather_code"
            )
            or []
        )


        forecast = []


        for index, date in enumerate(
            dates
        ):

            forecast.append(
                {
                    "date": date,

                    "max_temperature": (
                        max_temperatures[index]
                        if index
                        < len(max_temperatures)
                        else None
                    ),

                    "min_temperature": (
                        min_temperatures[index]
                        if index
                        < len(min_temperatures)
                        else None
                    ),

                    "rain": (
                        rain_values[index]
                        if index
                        < len(rain_values)
                        else None
                    ),

                    "rain_probability": (
                        rain_probabilities[index]
                        if index
                        < len(rain_probabilities)
                        else None
                    ),

                    "weather_code": (
                        weather_codes[index]
                        if index
                        < len(weather_codes)
                        else None
                    ),
                }
            )


        # -------------------------------------------------
        # FINAL RESPONSE
        # -------------------------------------------------

        result = {
            "latitude": latitude,

            "longitude": longitude,

            "current": {

                "temperature":
                    current.get(
                        "temperature_2m"
                    ),

                "humidity":
                    current.get(
                        "relative_humidity_2m"
                    ),

                "precipitation":
                    current.get(
                        "precipitation"
                    ),

                "wind_speed":
                    current.get(
                        "wind_speed_10m"
                    ),

                "weather_code":
                    current.get(
                        "weather_code"
                    ),
            },

            "forecast": forecast,

            "cached": False,
        }


        # -------------------------------------------------
        # SAVE TO CACHE
        # -------------------------------------------------

        save_weather_cache(
            latitude,
            longitude,
            result,
        )


        return result


    except HTTPException:
        raise


    except requests.Timeout:

        raise HTTPException(
            status_code=504,
            detail="Weather service timed out.",
        )


    except requests.RequestException as error:

        print(
            "Weather API connection error:",
            repr(error),
        )

        raise HTTPException(
            status_code=502,
            detail=(
                "Could not connect to "
                "weather service."
            ),
        )


    except ValueError as error:

        print(
            "Weather JSON error:",
            repr(error),
        )

        raise HTTPException(
            status_code=502,
            detail=(
                "Weather service returned "
                "invalid data."
            ),
        )


    except Exception as error:

        print(
            "Unexpected weather error:",
            repr(error),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"Unexpected weather error: "
                f"{str(error)}"
            ),
        )