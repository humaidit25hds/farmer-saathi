from fastapi import APIRouter

from ..ai import ask_farmer_ai
from ..schemas import AssistantRequest


router = APIRouter(
    prefix="/api/assistant",
    tags=["AI Assistant"]
)


@router.post("/ask")
def ask_question(
    data: AssistantRequest
):

    weather_context = None

    if (
        data.temperature is not None
        or data.humidity is not None
        or data.precipitation is not None
        or data.wind_speed is not None
        or data.rain_probability is not None
    ):

        weather_context = f"""
Live weather information:

Temperature:
{data.temperature if data.temperature is not None else "Not available"} °C

Humidity:
{data.humidity if data.humidity is not None else "Not available"} %

Current precipitation:
{data.precipitation if data.precipitation is not None else "Not available"} mm

Wind speed:
{data.wind_speed if data.wind_speed is not None else "Not available"} km/h

Today's rain probability:
{data.rain_probability if data.rain_probability is not None else "Not available"} %
"""


    answer = ask_farmer_ai(
        question=data.question,
        language=data.language,
        location=data.location,
        weather_context=weather_context
    )


    return {
        "answer": answer
    }