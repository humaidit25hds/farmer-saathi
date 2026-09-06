from fastapi import APIRouter, HTTPException

import requests


router = APIRouter(
    prefix="/api/weather",
    tags=["Weather"]
)


@router.get("")
def get_weather(
    latitude: float,
    longitude: float
):

    try:

        url = (
            "https://api.open-meteo.com/v1/forecast"
        )

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

            "forecast_days": 5
        }


        response = requests.get(
            url,
            params=params,
            timeout=15
        )


        if response.status_code != 200:

            raise HTTPException(
                status_code=500,
                detail="Weather service returned an error."
            )


        data = response.json()


        current = data.get(
            "current",
            {}
        )


        daily = data.get(
            "daily",
            {}
        )


        forecast = []


        dates = daily.get(
            "time",
            []
        )


        for index in range(
            len(dates)
        ):

            forecast.append({
                "date":
                    dates[index],

                "max_temperature":
                    daily.get(
                        "temperature_2m_max",
                        []
                    )[index],

                "min_temperature":
                    daily.get(
                        "temperature_2m_min",
                        []
                    )[index],

                "rain":
                    daily.get(
                        "precipitation_sum",
                        []
                    )[index],

                "rain_probability":
                    daily.get(
                        "precipitation_probability_max",
                        []
                    )[index],

                "weather_code":
                    daily.get(
                        "weather_code",
                        []
                    )[index]
            })


        return {

            "latitude":
                latitude,

            "longitude":
                longitude,

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
                    )
            },

            "forecast":
                forecast
        }


    except requests.RequestException as error:

        print(
            "Weather API error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Could not connect to weather service."
        )