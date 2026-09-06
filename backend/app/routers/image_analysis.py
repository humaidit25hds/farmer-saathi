import os
import json

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    HTTPException
)

from dotenv import load_dotenv
from google import genai
from google.genai import types


load_dotenv()


router = APIRouter(
    prefix="/api/image",
    tags=["Crop Image Analysis"]
)


@router.post("/analyze")
async def analyze_crop_image(
    image: UploadFile = File(...),
    language: str = Form("English")
):

    api_key = os.getenv(
        "GEMINI_API_KEY",
        ""
    ).strip()

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="Gemini API key is not configured."
        )


    allowed_types = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ]

    if image.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Please upload JPG, PNG or WEBP image."
        )


    image_bytes = await image.read()


    if len(image_bytes) > 8 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Image is too large. Maximum size is 8 MB."
        )


    model_name = os.getenv(
        "GEMINI_MODEL",
        "gemini-3.6-flash"
    )


    prompt = f"""
You are FarmerSaathi AI.

Analyze the uploaded crop or plant image.

Answer all text fields in {language}.

IMPORTANT:
Do not claim a definite diagnosis from one image.
Use words like possible, likely, unclear when appropriate.

Return ONLY valid JSON.

Do not return markdown.
Do not return ```json.
Do not add any text before or after the JSON.

Use exactly this JSON structure:

{{
  "crop": "crop name if visible or Unknown",
  "possible_problem": "possible disease, pest, nutrient problem, stress, or Healthy",
  "severity": "Low, Medium, High, or Unknown",
  "confidence": "Low, Medium, or High",
  "what_i_can_see": "simple description of visible symptoms",
  "immediate_action": [
    "action 1",
    "action 2",
    "action 3"
  ],
  "treatment_guidance": "safe treatment guidance",
  "need_more_information": [
    "question 1",
    "question 2",
    "question 3"
  ],
  "warning": "important safety or uncertainty warning"
}}

Rules:

1. Keep language simple for farmers.

2. If crop type is not clear:
   use "Unknown" or equivalent in {language}.

3. Severity:
   Low = small/local symptoms.
   Medium = visible spreading or moderate damage.
   High = extensive damage or severe symptoms.
   Unknown = cannot judge reliably.

4. Confidence must describe confidence in the image-based assessment.

5. Never invent pesticide or fungicide dosage.

6. For pesticide, fungicide, herbicide, or chemical treatment:
   tell the farmer to follow the approved product label
   and local agricultural guidance.

7. If the image is blurry or unclear:
   lower confidence and explain that another clear photo is needed.

8. Do not claim certainty about a disease.

9. Ask for crop age, location, and symptom history when useful.

10. If the plant appears healthy, say so.

Return JSON only.
"""


    try:

        client = genai.Client(
            api_key=api_key
        )


        response = client.models.generate_content(
            model=model_name,
            contents=[
                prompt,
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type=image.content_type
                )
            ]
        )


        if not response.text:
            raise HTTPException(
                status_code=500,
                detail="Gemini did not return an analysis."
            )


        raw_text = response.text.strip()


        # Gemini may occasionally wrap JSON in markdown.
        raw_text = (
            raw_text
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )


        try:
            result = json.loads(
                raw_text
            )

        except json.JSONDecodeError:

            print(
                "Invalid Gemini JSON:",
                raw_text
            )

            raise HTTPException(
                status_code=500,
                detail="AI returned an invalid structured response."
            )


        return {
            "analysis": result,
            "language": language,
            "filename": image.filename
        }


    except HTTPException:
        raise


    except Exception as error:

        print(
            "Crop image analysis error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Could not analyze the crop image."
        )