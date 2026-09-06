"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
} from "react";

import { useRouter } from "next/navigation";

const API_BASE_URL =
  "http://192.168.0.106:8000";

type ImageAnalysis = {
  crop: string;
  possible_problem: string;
  severity: string;
  confidence: string;
  what_i_can_see: string;
  immediate_action: string[];
  treatment_guidance: string;
  need_more_information: string[];
  warning: string;
};

type WeatherInfo = {
  temperature: number | null;
  humidity: number | null;
  precipitation: number | null;
  wind_speed: number | null;
  rain_probability: number | null;
  latitude: number | null;
  longitude: number | null;
};

type WeatherAlert = {
  type: "danger" | "warning" | "info";
  icon: string;
  title: string;
  message: string;
};

export default function AssistantPage() {
  const router = useRouter();

  const [
    checkingLogin,
    setCheckingLogin,
  ] = useState(true);

  const [
    question,
    setQuestion,
  ] = useState("");

  const [
    answer,
    setAnswer,
  ] = useState("");

  const [
    language,
    setLanguage,
  ] =
    useState<
      "English" | "Hindi"
    >("English");

  const [
    listening,
    setListening,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    selectedImage,
    setSelectedImage,
  ] =
    useState<File | null>(
      null
    );

  const [
    imagePreview,
    setImagePreview,
  ] = useState("");

  const [
    imageAnalysis,
    setImageAnalysis,
  ] =
    useState<ImageAnalysis | null>(
      null
    );

  const [
    imageLoading,
    setImageLoading,
  ] = useState(false);

  const [
    imageError,
    setImageError,
  ] = useState("");

  const [
    weather,
    setWeather,
  ] =
    useState<WeatherInfo>({
      temperature: null,
      humidity: null,
      precipitation: null,
      wind_speed: null,
      rain_probability: null,
      latitude: null,
      longitude: null,
    });

  const [
    weatherLoading,
    setWeatherLoading,
  ] = useState(false);

  const [
    weatherMessage,
    setWeatherMessage,
  ] = useState("");

  // =========================================================
  // LOGIN CHECK
  // =========================================================

  useEffect(() => {
    const loggedIn =
      localStorage.getItem(
        "farmerLoggedIn"
      );

    const farmerId =
      localStorage.getItem(
        "farmerId"
      );

    if (
      loggedIn !== "true" ||
      !farmerId
    ) {
      router.replace(
        "/login"
      );

      return;
    }

    setCheckingLogin(
      false
    );

    loadLiveWeather();
  }, [router]);

  // =========================================================
  // CLEAN MARKDOWN
  // =========================================================

  function cleanMarkdown(
    text: string
  ) {
    return text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/###/g, "")
      .replace(/##/g, "")
      .replace(/#/g, "")
      .replace(/_/g, "")
      .replace(/`/g, "")
      .replace(/---/g, "")
      .trim();
  }

  // =========================================================
  // DETECT CAPACITOR APP
  // =========================================================

  async function isNativeApp() {
    try {
      const {
        Capacitor,
      } = await import(
        "@capacitor/core"
      );

      return Capacitor.isNativePlatform();
    } catch {
      return false;
    }
  }

  // =========================================================
  // WEATHER
  // =========================================================

  function loadLiveWeather() {
    if (
      typeof navigator ===
        "undefined" ||
      !navigator.geolocation
    ) {
      setWeatherMessage(
        language === "Hindi"
          ? "इस डिवाइस में GPS उपलब्ध नहीं है।"
          : "GPS is not available on this device."
      );

      return;
    }

    setWeatherLoading(
      true
    );

    setWeatherMessage(
      ""
    );

    navigator.geolocation
      .getCurrentPosition(
        async (
          position
        ) => {
          try {
            const latitude =
              position.coords
                .latitude;

            const longitude =
              position.coords
                .longitude;

            const response =
              await fetch(
                `${API_BASE_URL}/api/weather?latitude=${latitude}&longitude=${longitude}`
              );

            if (
              !response.ok
            ) {
              throw new Error(
                "Weather request failed"
              );
            }

            const data =
              await response.json();

            const today =
              data.forecast?.[0];

            setWeather({
              latitude,
              longitude,

              temperature:
                data.current
                  ?.temperature ??
                null,

              humidity:
                data.current
                  ?.humidity ??
                null,

              precipitation:
                data.current
                  ?.precipitation ??
                null,

              wind_speed:
                data.current
                  ?.wind_speed ??
                null,

              rain_probability:
                today?.rain_probability ??
                null,
            });

            setWeatherMessage(
              language ===
                "Hindi"
                ? "लाइव मौसम जुड़ गया है"
                : "Live weather connected"
            );
          } catch {
            setWeatherMessage(
              language ===
                "Hindi"
                ? "मौसम की जानकारी नहीं मिल पाई।"
                : "Could not load live weather."
            );
          } finally {
            setWeatherLoading(
              false
            );
          }
        },

        () => {
          setWeatherMessage(
            language ===
              "Hindi"
              ? "मौसम आधारित सलाह के लिए लोकेशन की अनुमति दें।"
              : "Allow location access for weather-aware advice."
          );

          setWeatherLoading(
            false
          );
        },

        {
          enableHighAccuracy:
            true,
          timeout: 15000,
          maximumAge: 60000,
        }
      );
  }

  // =========================================================
  // WEATHER ALERTS
  // =========================================================

  function getWeatherAlerts():
    WeatherAlert[] {
    const alerts:
      WeatherAlert[] = [];

    if (
      weather.rain_probability !==
        null &&
      weather.rain_probability >=
        70
    ) {
      alerts.push({
        type: "danger",
        icon: "🌧️",

        title:
          language ===
          "Hindi"
            ? "बारिश की संभावना अधिक है"
            : "High Rain Probability",

        message:
          language ===
          "Hindi"
            ? `आज बारिश की संभावना ${weather.rain_probability}% है। सिंचाई करने से पहले मिट्टी की नमी जांचें।`
            : `Rain probability is ${weather.rain_probability}%. Check soil moisture before irrigation and avoid spraying if rain is expected.`,
      });
    }

    if (
      weather.wind_speed !==
        null &&
      weather.wind_speed >=
        20
    ) {
      alerts.push({
        type: "warning",
        icon: "💨",

        title:
          language ===
          "Hindi"
            ? "तेज हवा"
            : "High Wind",

        message:
          language ===
          "Hindi"
            ? `हवा की गति ${weather.wind_speed} km/h है। अभी स्प्रे करने से बचें।`
            : `Wind speed is ${weather.wind_speed} km/h. Avoid spraying because chemicals may drift away from the crop.`,
      });
    }

    if (
      weather.temperature !==
        null &&
      weather.temperature >=
        35
    ) {
      alerts.push({
        type: "warning",
        icon: "🔥",

        title:
          language ===
          "Hindi"
            ? "अधिक तापमान"
            : "High Temperature",

        message:
          language ===
          "Hindi"
            ? `तापमान ${weather.temperature}°C है। फसल में पानी की कमी के संकेत देखें।`
            : `Temperature is ${weather.temperature}°C. Check crops for water stress and avoid spraying during peak heat.`,
      });
    }

    if (
      weather.humidity !==
        null &&
      weather.humidity >=
        85
    ) {
      alerts.push({
        type: "info",
        icon: "🍄",

        title:
          language ===
          "Hindi"
            ? "फफूंद रोग का जोखिम"
            : "Possible Fungal Risk",

        message:
          language ===
          "Hindi"
            ? `नमी ${weather.humidity}% है। फसल में फफूंद रोग के संकेत देखें।`
            : `Humidity is ${weather.humidity}%. Check leaves for fungal disease symptoms.`,
      });
    }

    if (
      weather.precipitation !==
        null &&
      weather.precipitation >
        0
    ) {
      alerts.push({
        type: "danger",
        icon: "☔",

        title:
          language ===
          "Hindi"
            ? "अभी बारिश हो रही है"
            : "Rain Detected Now",

        message:
          language ===
          "Hindi"
            ? "अभी बारिश दर्ज हो रही है। सिंचाई और रासायनिक स्प्रे रोकना बेहतर हो सकता है।"
            : "Rain is currently detected. Consider delaying irrigation and chemical spraying.",
      });
    }

    return alerts;
  }

  // =========================================================
  // ASK AI
  // =========================================================

  async function askAI(
    text?: string
  ) {
    const finalQuestion =
      text || question;

    if (
      !finalQuestion.trim()
    ) {
      return;
    }

    setLoading(
      true
    );

    setAnswer(
      ""
    );

    try {
      const response =
        await fetch(
          `${API_BASE_URL}/api/assistant/ask`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                question:
                  finalQuestion,

                language,

                location:
                  weather.latitude !==
                    null &&
                  weather.longitude !==
                    null
                    ? `${weather.latitude.toFixed(
                        4
                      )}, ${weather.longitude.toFixed(
                        4
                      )}`
                    : null,

                temperature:
                  weather.temperature,

                humidity:
                  weather.humidity,

                precipitation:
                  weather.precipitation,

                wind_speed:
                  weather.wind_speed,

                rain_probability:
                  weather.rain_probability,
              }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          data.detail ||
            "AI request failed."
        );
      }

      setAnswer(
        data.answer
      );

      await speakAnswer(
        data.answer
      );
    } catch {
      setAnswer(
        language ===
        "Hindi"
          ? "FarmerSaathi backend से संपर्क नहीं हो पाया।"
          : "Could not connect to the FarmerSaathi backend."
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  // =========================================================
  // TEXT TO SPEECH
  // =========================================================

  async function speakAnswer(
    text: string
  ) {
    const cleanText =
      cleanMarkdown(
        text
      )
        .replace(
          /\n+/g,
          " "
        )
        .trim();

    if (!cleanText) {
      return;
    }

    const speechLanguage =
      language ===
      "Hindi"
        ? "hi-IN"
        : "en-IN";

    const native =
      await isNativeApp();

    if (native) {
      try {
        const {
          TextToSpeech,
        } = await import(
          "@capacitor-community/text-to-speech"
        );

        await TextToSpeech.stop();

        await TextToSpeech.speak({
          text:
            cleanText,

          lang:
            speechLanguage,

          rate:
            0.9,

          pitch:
            1,

          volume:
            1,

          queueStrategy:
            0,
        });

        return;
      } catch {
        // Fall back to browser TTS
      }
    }

    if (
      typeof window !==
        "undefined" &&
      "speechSynthesis" in
        window
    ) {
      window.speechSynthesis
        .cancel();

      const speech =
        new SpeechSynthesisUtterance(
          cleanText
        );

      speech.lang =
        speechLanguage;

      speech.rate =
        0.9;

      speech.pitch =
        1;

      speech.volume =
        1;

      window.speechSynthesis
        .speak(
          speech
        );
    }
  }

  // =========================================================
  // STOP SPEECH
  // =========================================================

  async function stopSpeaking() {
    const native =
      await isNativeApp();

    if (native) {
      try {
        const {
          TextToSpeech,
        } = await import(
          "@capacitor-community/text-to-speech"
        );

        await TextToSpeech.stop();
      } catch {
        // ignore
      }
    }

    if (
      typeof window !==
        "undefined" &&
      "speechSynthesis" in
        window
    ) {
      window.speechSynthesis
        .cancel();
    }
  }

  // =========================================================
  // NATIVE ANDROID MICROPHONE
  // =========================================================

  async function startNativeListening() {
    try {
      const {
        SpeechRecognition,
      } =
        await import(
          "@capgo/capacitor-speech-recognition"
        );

      setListening(
        true
      );

      const permission =
        await SpeechRecognition
          .requestPermissions();

      if (
        permission.speechRecognition !==
        "granted"
      ) {
        setListening(
          false
        );

        alert(
          language ===
          "Hindi"
            ? "कृपया FarmerSaathi के लिए माइक्रोफोन अनुमति दें।"
            : "Please allow microphone permission for FarmerSaathi."
        );

        return;
      }

      const availability =
        await SpeechRecognition
          .available();

      if (
        !availability.available
      ) {
        setListening(
          false
        );

        alert(
          language ===
          "Hindi"
            ? "इस फोन में वॉइस रिकग्निशन उपलब्ध नहीं है।"
            : "Speech recognition is not available on this phone."
        );

        return;
      }

      await SpeechRecognition
        .removeAllListeners();

      const listener =
        await SpeechRecognition
          .addListener(
            "partialResults",
            (
              event: any
            ) => {
              const spokenText =
                event.matches?.[0];

              if (
                spokenText
              ) {
                setQuestion(
                  spokenText
                );
              }
            }
          );

      try {
        const result =
          await SpeechRecognition
            .start({
              language:
                language ===
                "Hindi"
                  ? "hi-IN"
                  : "en-IN",

              maxResults:
                1,

              partialResults:
                false,

              popup:
                true,

              prompt:
                language ===
                "Hindi"
                  ? "FarmerSaathi से बोलें"
                  : "Speak to FarmerSaathi",
            });

        const spokenText =
          result.matches?.[0];

        if (
          spokenText
        ) {
          setQuestion(
            spokenText
          );

          await askAI(
            spokenText
          );
        }
      } finally {
        await listener.remove();

        setListening(
          false
        );
      }
    } catch (
      error
    ) {
      setListening(
        false
      );

      alert(
        language ===
        "Hindi"
          ? "वॉइस रिकग्निशन शुरू नहीं हो पाया। कृपया माइक्रोफोन अनुमति और Google Speech Services जांचें।"
          : "Could not start speech recognition. Please check microphone permission and Google Speech Services."
      );
    }
  }

  // =========================================================
  // BROWSER MICROPHONE
  // =========================================================

  function startBrowserListening() {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const SpeechRecognition =
      (window as any)
        .SpeechRecognition ||
      (window as any)
        .webkitSpeechRecognition;

    if (
      !SpeechRecognition
    ) {
      alert(
        language ===
        "Hindi"
          ? "यह ब्राउज़र वॉइस रिकग्निशन को सपोर्ट नहीं करता।"
          : "Speech recognition is not supported in this browser."
      );

      return;
    }

    try {
      const recognition =
        new SpeechRecognition();

      recognition.lang =
        language ===
        "Hindi"
          ? "hi-IN"
          : "en-IN";

      recognition.interimResults =
        false;

      recognition.continuous =
        false;

      recognition.maxAlternatives =
        1;

      recognition.onstart =
        () => {
          setListening(
            true
          );
        };

      recognition.onend =
        () => {
          setListening(
            false
          );
        };

      recognition.onerror =
        (
          event: any
        ) => {
          setListening(
            false
          );

          const errorType =
            event?.error ||
            "unknown";

          if (
            errorType ===
              "not-allowed" ||
            errorType ===
              "service-not-allowed"
          ) {
            alert(
              language ===
              "Hindi"
                ? "कृपया माइक्रोफोन अनुमति दें।"
                : "Please allow microphone permission."
            );
          } else if (
            errorType ===
            "no-speech"
          ) {
            alert(
              language ===
              "Hindi"
                ? "कोई आवाज़ नहीं मिली। फिर से प्रयास करें।"
                : "No speech was detected. Please try again."
            );
          } else if (
            errorType !==
            "aborted"
          ) {
            alert(
              language ===
              "Hindi"
                ? `वॉइस रिकग्निशन त्रुटि: ${errorType}`
                : `Speech recognition error: ${errorType}`
            );
          }
        };

      recognition.onresult =
        (
          event: any
        ) => {
          const spokenText =
            event.results?.[0]?.[0]
              ?.transcript;

          if (
            !spokenText
          ) {
            return;
          }

          setQuestion(
            spokenText
          );

          void askAI(
            spokenText
          );
        };

      recognition.start();
    } catch {
      setListening(
        false
      );

      alert(
        language ===
        "Hindi"
          ? "माइक्रोफोन शुरू नहीं हो पाया।"
          : "Could not start the microphone."
      );
    }
  }

  // =========================================================
  // MAIN MICROPHONE BUTTON
  // =========================================================

  async function startListening() {
    const native =
      await isNativeApp();

    if (
      native
    ) {
      await startNativeListening();
    } else {
      startBrowserListening();
    }
  }

  // =========================================================
  // IMAGE SPEECH
  // =========================================================

  async function speakImageAnalysis(
    analysis:
      ImageAnalysis
  ) {
    const text = `
      ${
        language ===
        "Hindi"
          ? "फसल"
          : "Crop"
      }: ${analysis.crop}.

      ${
        language ===
        "Hindi"
          ? "संभावित समस्या"
          : "Possible problem"
      }: ${analysis.possible_problem}.

      ${
        language ===
        "Hindi"
          ? "गंभीरता"
          : "Severity"
      }: ${analysis.severity}.

      ${
        language ===
        "Hindi"
          ? "विश्वास स्तर"
          : "Confidence"
      }: ${analysis.confidence}.

      ${
        language ===
        "Hindi"
          ? "फोटो में क्या दिख रहा है"
          : "What I can see"
      }: ${analysis.what_i_can_see}.

      ${
        language ===
        "Hindi"
          ? "अभी क्या करें"
          : "What to do now"
      }: ${analysis.immediate_action.join(
        ". "
      )}.

      ${
        language ===
        "Hindi"
          ? "उपचार सलाह"
          : "Treatment guidance"
      }: ${analysis.treatment_guidance}.

      ${
        language ===
        "Hindi"
          ? "महत्वपूर्ण चेतावनी"
          : "Important warning"
      }: ${analysis.warning}.
    `;

    await speakAnswer(
      text
    );
  }

  // =========================================================
  // LANGUAGE
  // =========================================================

  function changeLanguage(
    newLanguage:
      "English" | "Hindi"
  ) {
    setLanguage(
      newLanguage
    );

    setQuestion(
      ""
    );

    setAnswer(
      ""
    );

    setImageAnalysis(
      null
    );

    setImageError(
      ""
    );

    void stopSpeaking();
  }

  // =========================================================
  // EXAMPLES
  // =========================================================

  function useExample(
    englishText: string,
    hindiText: string
  ) {
    const text =
      language ===
      "Hindi"
        ? hindiText
        : englishText;

    setQuestion(
      text
    );

    void askAI(
      text
    );
  }

  // =========================================================
  // IMAGE SELECT
  // =========================================================

  function handleImageChange(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (
      !file
    ) {
      return;
    }

    const allowedTypes =
      [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setImageError(
        language ===
        "Hindi"
          ? "कृपया JPG, PNG या WEBP फोटो चुनें।"
          : "Please select a JPG, PNG or WEBP image."
      );

      return;
    }

    if (
      file.size >
      8 *
        1024 *
        1024
    ) {
      setImageError(
        language ===
        "Hindi"
          ? "फोटो 8 MB से छोटा होना चाहिए।"
          : "Image must be smaller than 8 MB."
      );

      return;
    }

    if (
      imagePreview
    ) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setSelectedImage(
      file
    );

    setImagePreview(
      URL.createObjectURL(
        file
      )
    );

    setImageAnalysis(
      null
    );

    setImageError(
      ""
    );
  }

  // =========================================================
  // REMOVE IMAGE
  // =========================================================

  function removeImage() {
    if (
      imagePreview
    ) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setSelectedImage(
      null
    );

    setImagePreview(
      ""
    );

    setImageAnalysis(
      null
    );

    setImageError(
      ""
    );

    void stopSpeaking();
  }

  // =========================================================
  // ANALYZE IMAGE
  // =========================================================

  async function analyzeImage() {
    if (
      !selectedImage
    ) {
      setImageError(
        language ===
        "Hindi"
          ? "पहले फसल की फोटो चुनें।"
          : "Please select a crop image first."
      );

      return;
    }

    setImageLoading(
      true
    );

    setImageAnalysis(
      null
    );

    setImageError(
      ""
    );

    try {
      const formData =
        new FormData();

      formData.append(
        "image",
        selectedImage
      );

      formData.append(
        "language",
        language
      );

      const response =
        await fetch(
          `${API_BASE_URL}/api/image/analyze`,
          {
            method:
              "POST",

            body:
              formData,
          }
        );

      const data =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          data.detail ||
            "Image analysis failed."
        );
      }

      setImageAnalysis(
        data.analysis
      );
    } catch {
      setImageError(
        language ===
        "Hindi"
          ? "फसल की फोटो का विश्लेषण नहीं हो पाया।"
          : "Could not analyze the crop image."
      );
    } finally {
      setImageLoading(
        false
      );
    }
  }

  const weatherAlerts =
    getWeatherAlerts();

  // =========================================================
  // LOGIN LOADING
  // =========================================================

  if (
    checkingLogin
  ) {
    return (
      <main className="assistantLoading">
        <div>
          🌾
        </div>

        <p>
          Checking FarmerSaathi login...
        </p>
      </main>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="assistantAppPage">

      <section className="assistantAppHero">

        <div className="assistantAppHeroInner">

          <div>

            <span className="assistantHeroTag">
              🤖 FARMERSAATHI AI
            </span>

            <h1>
              {language ===
              "Hindi"
                ? "खेती के बारे में कुछ भी पूछें"
                : "Ask FarmerSaathi"}
            </h1>

            <p>
              {language ===
              "Hindi"
                ? "आवाज़ से पूछें, सवाल लिखें या फसल की फोटो जांचें।"
                : "Speak, type or upload a crop photo to get farming guidance."}
            </p>

          </div>

          <div className="assistantLanguageToggle">

            <button
              type="button"
              className={
                language ===
                "English"
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeLanguage(
                  "English"
                )
              }
            >
              English
            </button>

            <button
              type="button"
              className={
                language ===
                "Hindi"
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeLanguage(
                  "Hindi"
                )
              }
            >
              हिन्दी
            </button>

          </div>

        </div>

      </section>

      <section className="assistantAppLayout">

        <div className="assistantMainColumn">

          <section className="assistantVoiceCard">

            <div className="assistantVoiceHeader">

              <div>

                <span>
                  VOICE ASSISTANT
                </span>

                <h2>
                  {language ===
                  "Hindi"
                    ? "अपना सवाल बोलें"
                    : "Talk to FarmerSaathi"}
                </h2>

              </div>

              <div className="assistantOnlineBadge">
                ● AI Ready
              </div>

            </div>

            <button
              type="button"
              className={
                listening
                  ? "assistantBigMic listening"
                  : "assistantBigMic"
              }
              onClick={() =>
                void startListening()
              }
            >
              <span>
                {listening
                  ? "🔴"
                  : "🎤"}
              </span>
            </button>

            <div className="assistantMicLabel">

              <strong>
                {listening
                  ? language ===
                    "Hindi"
                    ? "मैं सुन रहा हूँ..."
                    : "Listening..."
                  : language ===
                    "Hindi"
                  ? "बोलने के लिए माइक दबाएं"
                  : "Tap the microphone to speak"}
              </strong>

              <small>
                {language ===
                "Hindi"
                  ? "FarmerSaathi आपका सवाल सुनकर जवाब देगा"
                  : "FarmerSaathi will listen and answer automatically"}
              </small>

            </div>

            <div className="assistantQuestionBox">

              <textarea
                value={
                  question
                }
                onChange={(
                  event
                ) =>
                  setQuestion(
                    event.target
                      .value
                  )
                }
                placeholder={
                  language ===
                  "Hindi"
                    ? "उदाहरण: मेरी गेहूं की पत्तियां पीली क्यों हो रही हैं?"
                    : "Example: Why are my wheat leaves turning yellow?"
                }
              />

              <button
                type="button"
                onClick={() =>
                  void askAI()
                }
                disabled={
                  loading
                }
                className="assistantSendButton"
              >
                {loading
                  ? "..."
                  : "➤"}
              </button>

            </div>

            <button
              type="button"
              className="assistantAskFullButton"
              onClick={() =>
                void askAI()
              }
              disabled={
                loading
              }
            >
              {loading
                ? language ===
                  "Hindi"
                  ? "FarmerSaathi सोच रहा है..."
                  : "FarmerSaathi is thinking..."
                : language ===
                  "Hindi"
                ? "🌾 FarmerSaathi से पूछें"
                : "🌾 Ask FarmerSaathi"}
            </button>

            <div className="assistantPromptArea">

              <span>
                {language ===
                "Hindi"
                  ? "जल्दी पूछें"
                  : "Quick questions"}
              </span>

              <div className="assistantPromptChips">

                <button
                  type="button"
                  onClick={() =>
                    useExample(
                      "Should I irrigate my wheat today?",
                      "क्या मुझे आज गेहूं में सिंचाई करनी चाहिए?"
                    )
                  }
                >
                  💧{" "}
                  {language ===
                  "Hindi"
                    ? "आज सिंचाई?"
                    : "Irrigate today?"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    useExample(
                      "Is it safe to spray pesticide today?",
                      "क्या आज कीटनाशक का छिड़काव करना सही है?"
                    )
                  }
                >
                  🌦️{" "}
                  {language ===
                  "Hindi"
                    ? "आज स्प्रे?"
                    : "Spray today?"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    useExample(
                      "Why are my wheat leaves turning yellow?",
                      "मेरी गेहूं की पत्तियां पीली क्यों हो रही हैं?"
                    )
                  }
                >
                  🌾{" "}
                  {language ===
                  "Hindi"
                    ? "पीली पत्तियां"
                    : "Yellow leaves"}
                </button>

              </div>

            </div>

          </section>

          {answer && (

            <section className="assistantResponseCard">

              <div className="assistantResponseHeader">

                <div className="assistantResponseLogo">
                  🌱
                </div>

                <div>

                  <span>
                    FARMERSAATHI
                  </span>

                  <h2>
                    {language ===
                    "Hindi"
                      ? "AI का जवाब"
                      : "AI Answer"}
                  </h2>

                </div>

              </div>

              <p>
                {cleanMarkdown(
                  answer
                )}
              </p>

              <div className="assistantResponseActions">

                <button
                  type="button"
                  onClick={() =>
                    void speakAnswer(
                      answer
                    )
                  }
                >
                  🔊{" "}
                  {language ===
                  "Hindi"
                    ? "जवाब सुनें"
                    : "Listen"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void stopSpeaking()
                  }
                >
                  🔇{" "}
                  {language ===
                  "Hindi"
                    ? "आवाज़ बंद करें"
                    : "Stop"}
                </button>

              </div>

            </section>

          )}

          <section className="assistantCropCard">

            <div className="assistantCropHeader">

              <div className="assistantCropHeaderIcon">
                📷
              </div>

              <div>

                <span>
                  AI CROP CHECK
                </span>

                <h2>
                  {language ===
                  "Hindi"
                    ? "फसल की फोटो जांचें"
                    : "Analyze Crop Photo"}
                </h2>

                <p>
                  {language ===
                  "Hindi"
                    ? "पत्ती या फसल की साफ फोटो अपलोड करें।"
                    : "Upload a clear crop or leaf photo."}
                </p>

              </div>

            </div>

            {!imagePreview && (

              <label className="assistantCropUploader">

                <span className="assistantUploadIcon">
                  📸
                </span>

                <strong>
                  {language ===
                  "Hindi"
                    ? "फोटो लें या चुनें"
                    : "Take or Choose Photo"}
                </strong>

                <small>
                  JPG, PNG, WEBP • Max 8 MB
                </small>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  capture="environment"
                  onChange={
                    handleImageChange
                  }
                  hidden
                />

              </label>

            )}

            {imagePreview && (

              <div className="assistantCropPreview">

                <img
                  src={
                    imagePreview
                  }
                  alt="Selected crop"
                />

                <div className="assistantCropPreviewInfo">

                  <strong>
                    {selectedImage?.name}
                  </strong>

                  <span>
                    {selectedImage
                      ? (
                          selectedImage.size /
                          1024 /
                          1024
                        ).toFixed(
                          2
                        )
                      : "0"}{" "}
                    MB
                  </span>

                </div>

                <button
                  type="button"
                  onClick={
                    removeImage
                  }
                >
                  ✕
                </button>

              </div>

            )}

            {imageError && (

              <div className="assistantImageError">
                ⚠️ {imageError}
              </div>

            )}

            {selectedImage &&
              !imageAnalysis && (

                <button
                  type="button"
                  className="assistantAnalyzeButton"
                  onClick={
                    analyzeImage
                  }
                  disabled={
                    imageLoading
                  }
                >
                  {imageLoading
                    ? language ===
                      "Hindi"
                      ? "🔍 फोटो जांची जा रही है..."
                      : "🔍 Analyzing..."
                    : language ===
                      "Hindi"
                    ? "🔍 फसल जांचें"
                    : "🔍 Analyze Crop"}
                </button>

              )}

            {imageAnalysis && (

              <div className="assistantAnalysisResult">

                <div className="assistantAnalysisTitle">

                  <span>
                    🔬
                  </span>

                  <div>

                    <small>
                      AI CROP REPORT
                    </small>

                    <h2>
                      FarmerSaathi Crop Analysis
                    </h2>

                  </div>

                </div>

                <div className="assistantAnalysisGrid">

                  <div>
                    <small>
                      🌾 Crop
                    </small>

                    <strong>
                      {
                        imageAnalysis.crop
                      }
                    </strong>
                  </div>

                  <div>
                    <small>
                      🦠 Possible Problem
                    </small>

                    <strong>
                      {
                        imageAnalysis.possible_problem
                      }
                    </strong>
                  </div>

                  <div>
                    <small>
                      ⚠️ Severity
                    </small>

                    <strong>
                      {
                        imageAnalysis.severity
                      }
                    </strong>
                  </div>

                  <div>
                    <small>
                      🎯 Confidence
                    </small>

                    <strong>
                      {
                        imageAnalysis.confidence
                      }
                    </strong>
                  </div>

                </div>

                <div className="assistantAnalysisDetail">

                  <h3>
                    👁️ What I Can See
                  </h3>

                  <p>
                    {
                      imageAnalysis.what_i_can_see
                    }
                  </p>

                </div>

                <div className="assistantAnalysisDetail">

                  <h3>
                    🚑 Immediate Action
                  </h3>

                  <ol>

                    {imageAnalysis.immediate_action.map(
                      (
                        action,
                        index
                      ) => (

                        <li
                          key={
                            index
                          }
                        >
                          {action}
                        </li>

                      )
                    )}

                  </ol>

                </div>

                <div className="assistantAnalysisDetail">

                  <h3>
                    💊 Treatment Guidance
                  </h3>

                  <p>
                    {
                      imageAnalysis.treatment_guidance
                    }
                  </p>

                </div>

                <div className="assistantAnalysisDetail">

                  <h3>
                    ❓ Need More Information
                  </h3>

                  <ul>

                    {imageAnalysis.need_more_information.map(
                      (
                        item,
                        index
                      ) => (

                        <li
                          key={
                            index
                          }
                        >
                          {item}
                        </li>

                      )
                    )}

                  </ul>

                </div>

                <div className="assistantAnalysisWarning">

                  <strong>
                    ⚠️ Important
                  </strong>

                  <p>
                    {
                      imageAnalysis.warning
                    }
                  </p>

                </div>

                <div className="assistantAnalysisActions">

                  <button
                    type="button"
                    onClick={() =>
                      void speakImageAnalysis(
                        imageAnalysis
                      )
                    }
                  >
                    🔊 Listen
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void stopSpeaking()
                    }
                  >
                    🔇 Stop
                  </button>

                  <button
                    type="button"
                    onClick={
                      removeImage
                    }
                  >
                    📷 Another Photo
                  </button>

                </div>

              </div>

            )}

          </section>

        </div>

        <aside className="assistantSidebar">

          <section className="assistantWeatherCard">

            <div className="assistantWeatherHeading">

              <div>

                <span>
                  LIVE FARM WEATHER
                </span>

                <h2>
                  🌦️ Weather Context
                </h2>

              </div>

              <button
                type="button"
                onClick={
                  loadLiveWeather
                }
                aria-label="Refresh weather"
              >
                🔄
              </button>

            </div>

            <p className="assistantWeatherMessage">
              {weatherLoading
                ? language ===
                  "Hindi"
                  ? "मौसम लोड हो रहा है..."
                  : "Loading weather..."
                : weatherMessage}
            </p>

            {weather.temperature !==
              null && (

              <div className="assistantWeatherGrid">

                <div>
                  <span>
                    🌡️
                  </span>

                  <strong>
                    {
                      weather.temperature
                    }
                    °C
                  </strong>

                  <small>
                    Temperature
                  </small>
                </div>

                <div>
                  <span>
                    💧
                  </span>

                  <strong>
                    {
                      weather.humidity
                    }
                    %
                  </strong>

                  <small>
                    Humidity
                  </small>
                </div>

                <div>
                  <span>
                    🌧️
                  </span>

                  <strong>
                    {weather.rain_probability ??
                      "-"}
                    %
                  </strong>

                  <small>
                    Rain
                  </small>
                </div>

                <div>
                  <span>
                    💨
                  </span>

                  <strong>
                    {weather.wind_speed ??
                      "-"}
                  </strong>

                  <small>
                    km/h
                  </small>
                </div>

              </div>

            )}

          </section>

          {weatherAlerts.length >
            0 && (

            <section className="assistantAlertsCard">

              <div className="assistantAlertsHeader">

                <span>
                  ⚠️
                </span>

                <div>

                  <strong>
                    Smart Farming Alerts
                  </strong>

                  <small>
                    Based on current weather
                  </small>

                </div>

              </div>

              <div className="assistantAlertList">

                {weatherAlerts.map(
                  (
                    alert,
                    index
                  ) => (

                    <div
                      key={
                        index
                      }
                      className={`assistantAlert ${alert.type}`}
                    >

                      <span>
                        {
                          alert.icon
                        }
                      </span>

                      <div>

                        <strong>
                          {
                            alert.title
                          }
                        </strong>

                        <p>
                          {
                            alert.message
                          }
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            </section>

          )}

          <section className="assistantHelpCard">

            <span>
              💡
            </span>

            <h3>
              Better questions give better answers
            </h3>

            <p>
              Mention your crop,
              problem, crop age and
              what you can see in the
              field.
            </p>

          </section>

        </aside>

      </section>

    </main>
  );
}