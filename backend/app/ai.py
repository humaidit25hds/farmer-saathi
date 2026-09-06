import os

from dotenv import load_dotenv
from google import genai


load_dotenv()


# -------------------------------------------------
# OFFLINE FALLBACK
# -------------------------------------------------

def offline_answer(
    question: str,
    language: str = "English"
):

    text = question.lower()

    hindi = (
        language.lower() == "hindi"
    )


    if (
        "yellow" in text
        or "पीली" in text
        or "पीला" in text
    ):

        if hindi:

            return (
                "फसल की पत्तियां पीली होने के कई कारण हो सकते हैं, "
                "जैसे नाइट्रोजन की कमी, ज्यादा पानी, खराब जल निकासी, "
                "कीट या बीमारी। कृपया फसल की उम्र, खेत में पानी की स्थिति "
                "और आपने कौन सी खाद दी है, यह बताइए।"
            )

        return (
            "Yellow leaves may be caused by nitrogen deficiency, "
            "too much water, poor drainage, pests or disease. "
            "Please tell me the crop age, watering condition "
            "and what fertilizer you have already used."
        )


    if (
        "fertilizer" in text
        or "खाद" in text
        or "उर्वरक" in text
    ):

        if hindi:

            return (
                "उर्वरक की सही मात्रा फसल, मिट्टी की जांच, "
                "खेत के आकार और फसल की अवस्था पर निर्भर करती है। "
                "कृपया फसल का नाम, फसल की उम्र और खेत का आकार बताइए।"
            )

        return (
            "Fertilizer quantity depends on the crop, soil test, "
            "land size and crop stage. Please tell me the crop name, "
            "crop age and land size."
        )


    if (
        "irrigation" in text
        or "water" in text
        or "सिंचाई" in text
        or "पानी" in text
    ):

        if hindi:

            return (
                "सिंचाई की जरूरत फसल, मिट्टी, मौसम और फसल की अवस्था "
                "पर निर्भर करती है। कृपया फसल का नाम और उसकी उम्र बताइए।"
            )

        return (
            "Irrigation frequency depends on crop type, soil, "
            "weather and crop stage. Tell me the crop name and crop age."
        )


    if (
        "snake" in text
        or "सांप" in text
    ):

        if hindi:

            return (
                "सांप का काटना मेडिकल इमरजेंसी हो सकता है। "
                "व्यक्ति को शांत और स्थिर रखें और तुरंत पेशेवर "
                "चिकित्सा सहायता लें। घाव को काटें या जहर चूसने "
                "की कोशिश न करें।"
            )

        return (
            "Snake bite can be a medical emergency. "
            "Keep the person still and seek professional emergency "
            "medical care immediately. Do not cut or suck the bite."
        )


    if hindi:

        return (
            "मैं फसल, मिट्टी, सिंचाई, खाद, कीट, बीमारी, "
            "कटाई, भंडारण, बाजार और परिवहन से जुड़े सवालों में "
            "मदद कर सकता हूँ। कृपया अपनी समस्या के बारे में "
            "थोड़ा और विवरण दें।"
        )


    return (
        "I can help with crop cultivation, soil, irrigation, "
        "fertilizer, pests, diseases, harvesting, storage, "
        "market selling and transport. "
        "Please give me more details about your farming problem."
    )


# -------------------------------------------------
# GEMINI FARMERSAATHI AI
# -------------------------------------------------

def ask_farmer_ai(
    question: str,
    language: str,
    location: str | None = None,
    weather_context: str | None = None
):

    api_key = os.getenv(
        "GEMINI_API_KEY",
        ""
    ).strip()


    if not api_key:

        return offline_answer(
            question,
            language
        )


    model_name = os.getenv(
        "GEMINI_MODEL",
        "gemini-3.6-flash"
    )


    try:

        client = genai.Client(
            api_key=api_key
        )


        prompt = f"""
You are FarmerSaathi AI, an agricultural assistant mainly for Indian farmers.

The farmer may speak Hindi or English.

Answer language:
{language}

Farmer location:
{location or "Not provided"}

Current weather context:
{weather_context or "Not provided"}

Farmer question:
{question}


RULES:

- Use very simple language.
- Give practical farming advice.
- Keep the answer easy for a farmer to understand.
- Ask for missing information when needed.

- If live weather context is provided, use it when answering questions
  about irrigation, spraying, harvesting, drying crops, disease risk,
  field work, or crop protection.

- Never invent weather information.

- If rain probability is high, warn the farmer before recommending
  irrigation or pesticide/fertilizer spraying.

- If current precipitation is happening, avoid recommending spraying
  unless there is a clear reason.

- If wind speed is high, warn that pesticide or fertilizer spraying
  may drift away from the target crop.

- If temperature is very high, advise avoiding spraying during the
  hottest part of the day when appropriate.

- Always remind the farmer that local field conditions and soil moisture
  may be different from weather data.

You can help with:

- crop cultivation
- seeds
- soil
- irrigation
- fertilizer
- nutrient deficiency
- pests
- crop diseases
- weeds
- harvesting
- storage
- agricultural machinery
- crop transportation
- selling crops

IMPORTANT SAFETY RULES:

- Do not invent current mandi prices.
- Do not invent current weather.
- Do not claim a crop disease diagnosis with certainty
  when there is not enough information.
- For pesticides, fungicides or herbicides,
  tell the farmer to follow the approved product label
  and local agricultural guidance.
- Do not invent chemical doses.
- Treat snake bite and serious injuries as medical emergencies.
- Never claim that an ambulance has been dispatched
  unless a real emergency service confirms it.

WHEN LIVE WEATHER IS AVAILABLE:

Use it only if it is relevant to the farmer's question.

Examples:

1. Irrigation:
   Consider rain probability, current rainfall, temperature,
   humidity and soil moisture information given by the farmer.

2. Spraying:
   Consider rain, wind speed and temperature.
   Warn about spray drift when wind is high.
   Warn about wash-off when rain is likely.

3. Harvesting:
   Consider rain probability and precipitation.

4. Disease risk:
   High humidity and wet conditions may increase the risk
   of some fungal diseases, but do not claim a diagnosis
   only from weather information.

5. Heat:
   High temperatures may increase crop water stress.

Do not tell the farmer to skip irrigation only because rain is forecast.
Advise checking actual soil moisture and local field conditions.

When useful, answer like this:

Possible cause:
...

Weather consideration:
...

What to do:
1. ...
2. ...
3. ...

Need more information:
...

Keep most answers concise.

Answer now in {language}.
"""


        response = client.models.generate_content(
            model=model_name,
            contents=prompt
        )


        if not response.text:

            return offline_answer(
                question,
                language
            )


        return response.text


    except Exception as error:

        print(
            "Gemini FarmerSaathi error:",
            error
        )

        return offline_answer(
            question,
            language
        )