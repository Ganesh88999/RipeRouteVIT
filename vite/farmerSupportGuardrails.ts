/** Lightweight guardrails for /api/farmer-support — no UI, no second chatbot. */

export const MAX_FARMER_SUPPORT_CHARS = 2000

const LANG_NAMES: Record<string, string> = {
  en: "English",
  ta: "Tamil",
  hi: "Hindi",
  te: "Telugu",
  kn: "Kannada",
  ml: "Malayalam",
  mr: "Marathi",
  bn: "Bengali",
  gu: "Gujarati",
  pa: "Punjabi",
  as: "Assamese",
  or: "Odia",
}

export function resolveLang(raw: unknown): { code: string; name: string } {
  const code = (typeof raw === "string" && raw.trim() ? raw : "en").toLowerCase()
  return { code, name: LANG_NAMES[code] || "English" }
}

export function validateFarmerSupportQuestion(
  raw: unknown,
  langCode = "en",
): { ok: true; question: string } | { ok: false; message: string } {
  if (typeof raw !== "string") {
    return { ok: false, message: emptyMessage(langCode) }
  }
  const question = raw.trim()
  if (!question) {
    return { ok: false, message: emptyMessage(langCode) }
  }
  if (question.length > MAX_FARMER_SUPPORT_CHARS) {
    return { ok: false, message: tooLongMessage(langCode) }
  }
  return { ok: true, question }
}

export function isGreeting(question: string): boolean {
  const q = question.trim().toLowerCase()
  return /^(hi|hello|hey|vanakkam|namaste|வணக்கம்|नमस्ते|नमस्कार|ഹലോ|హలో|ಹಲೋ)[\s!.]*$/i.test(q)
}

/** Clear off-topic asks (coding games, crypto, etc.) — not normal farm chat. */
export function isOffTopicFarmerQuestion(question: string): boolean {
  if (isGreeting(question)) return false
  const q = question.toLowerCase()

  const agriHint =
    /\b(crop|farm|farmer|soil|irrigat|weather|rain|harvest|yield|surplus|tomato|paddy|rice|wheat|market|buyer|demand|logistics|rescue|scheme|pm-?kisan|pesticide|disease|leaf|plant|seed|fertiliz|organic|riperoute|agriculture|கதிர்|பயிர்|விவசா|நீர்ப்பாச|சந்தை|திட்ட|फसल|किसान|सिंचाई|बाजार)\b/i.test(
      question,
    )
  if (agriHint) return false

  const offTopic = [
    /\b(write|build|create|code)\b.{0,40}\b(python|javascript|typescript|java|c\+\+|html|css|react|game|app)\b/i,
    /\b(video game|minecraft|fortnite)\b/i,
    /\b(bitcoin|cryptocurrency|\bnft\b|stock tip)\b/i,
    /\b(dating advice|girlfriend|boyfriend)\b/i,
    /\bwrite (me )?(a |an )?(poem|novel|essay|song lyrics)\b/i,
    /\b(homework for|solve this math)\b/i,
  ]
  return offTopic.some((re) => re.test(q))
}

export function offTopicRedirect(langCode: string): string {
  const map: Record<string, string> = {
    en: "I’m RipeRoute’s agricultural support assistant, so I can help with farming, crops, irrigation, markets, buyers, logistics, food rescue, government agricultural schemes, and RipeRoute features.",
    ta: "நான் RipeRoute விவசாய ஆதரவு உதவியாளர். பயிர், நீர்ப்பாசனம், சந்தை, வாங்குபவர்கள், போக்குவரத்து, உணவு மீட்பு, அரசு வேளாண் திட்டங்கள் மற்றும் RipeRoute அம்சங்கள் பற்றி உதவ முடியும்.",
    hi: "मैं RipeRoute का कृषि सहायता सहायक हूँ। खेती, फसल, सिंचाई, बाज़ार, खरीदार, लॉजिस्टिक्स, खाद्य बचाव, सरकारी कृषि योजनाएँ और RipeRoute सुविधाओं में मदद कर सकता हूँ।",
  }
  return map[langCode] || map.en
}

export function geminiUnavailableMessage(langCode: string): string {
  const map: Record<string, string> = {
    en: "I'm unable to reach the AI advisor right now. Please try again shortly. For urgent crop or chemical decisions, consult a qualified local agricultural expert.",
    ta: "இப்போது AI ஆலோசகரை அணுக முடியவில்லை. சிறிது நேரம் கழித்து மீண்டும் முயலவும். அவசர பயிர் அல்லது இரசாயன முடிவுகளுக்கு தகுதியான உள்ளூர் வேளாண் நிபுணரை அணுகவும்.",
    hi: "अभी AI सलाहकार से संपर्क नहीं हो पा रहा। कृपया थोड़ी देर बाद फिर कोशिश करें। अत्यावश्यक फसल या रासायनिक निर्णयों के लिए योग्य स्थानीय कृषि विशेषज्ञ से सलाह लें।",
  }
  return map[langCode] || map.en
}

export function chemicalSafetyFallback(langCode: string): string {
  const map: Record<string, string> = {
    en: "I can provide general agricultural guidance, but I can't safely confirm a chemical treatment or dosage from the information available. Please follow the approved product label and consult a qualified local agricultural expert.",
    ta: "பொதுவான வேளாண் வழிகாட்டுதலைத் தர முடியும், ஆனால் கிடைக்கும் தகவலில் இருந்து இரசாயன சிகிச்சை அல்லது அளவை பாதுகாப்பாக உறுதிப்படுத்த முடியாது. அங்கீகரிக்கப்பட்ட தயாரிப்பு அட்டையைப் பின்பற்றி, தகுதியான உள்ளூர் வேளாண் நிபுணரை அணுகவும்.",
    hi: "मैं सामान्य कृषि मार्गदर्शन दे सकता हूँ, लेकिन उपलब्ध जानकारी से रासायनिक उपचार या खुराक सुरक्षित रूप से पुष्टि नहीं कर सकता। स्वीकृत उत्पाद लेबल का पालन करें और योग्य स्थानीय कृषि विशेषज्ञ से सलाह लें।",
  }
  return map[langCode] || map.en
}

export function unverifiedDataFallback(langCode: string): string {
  const map: Record<string, string> = {
    en: "I don't currently have verified data for that. I won't invent weather, prices, buyer counts, or logistics status. You can check Irrigation & Weather, Buyer Requests, or Market tools in RipeRoute when live data is available.",
    ta: "அதற்கு தற்போது சரிபார்க்கப்பட்ட தரவு இல்லை. வானிலை, விலை, வாங்குபவர் எண்ணிக்கை அல்லது போக்குவரத்து நிலையை உருவாக்க மாட்டேன். நேரடி தரவு கிடைக்கும்போது RipeRoute-இல் நீர்ப்பாசனம் & வானிலை, வாங்குபவர் கோரிக்கைகள் அல்லது சந்தை கருவிகளைப் பாருங்கள்.",
    hi: "उसके लिए अभी सत्यापित डेटा नहीं है। मैं मौसम, कीमतें, खरीदार संख्या या लॉजिस्टिक्स स्थिति गढ़ नहीं सकता। लाइव डेटा उपलब्ध होने पर RipeRoute में सिंचाई व मौसम, खरीदार अनुरोध या बाज़ार टूल देखें।",
  }
  return map[langCode] || map.en
}

export type FarmerSupportContext = {
  crop?: string
  location?: string
  state?: string
  farmSizeAcres?: number | null
  growthStage?: string
  waterAvailability?: string
  /** Only pass fields that are actually known from the app. */
  verifiedNotes?: string[]
}

export function farmerSupportSystemInstruction(lang: { code: string; name: string }): string {
  return [
    "You are RipeRoute Farmer Support AI.",
    "Your job is to provide practical agricultural assistance using available verified RipeRoute data.",
    "",
    `Respond entirely in ${lang.name} (${lang.code}).`,
    "Do not switch to English unless English is the selected language.",
    "Keep numbers, units (°C, %, KG, ₹), crop names, and official scheme names accurate when translating.",
    "",
    "Rules:",
    "1. Do not invent real-time data (weather, rainfall, soil moisture, market prices, buyer demand, farmer availability, inventory, delivery ETA, logistics or order status).",
    "2. Do not invent farmer, buyer, market, logistics, weather, or inventory information.",
    "3. Clearly distinguish verified, estimated/modelled, and simulated/demo information when you mention data.",
    "4. Do not provide exact pesticide or chemical dosage instructions (no ml/L, g/L, ppm rates for pesticides).",
    "5. Do not recommend unsafe chemical combinations or mixing pesticides.",
    "6. Do not invent pesticide brands.",
    "7. Do not claim image-based or text-based disease diagnosis is certain.",
    "8. For uncertain or high-risk treatment decisions, encourage agronomist / local agricultural guidance.",
    "9. Do not invent government scheme eligibility, income limits, deadlines, subsidy amounts, documents, or application procedures.",
    "10. Use only verified scheme information provided in the prompt (if any). Otherwise give high-level public overview and say official verification is required.",
    '11. When discussing eligibility, include: "Preliminary information — official verification is required." (translated into the response language).',
    "12. Stay focused on agriculture and RipeRoute-related support (crops, irrigation, weather, soil, harvest, yield, surplus, markets, buyers, logistics, food rescue, schemes, farm planning).",
    "13. Be concise and practical.",
    "14. If required information is unavailable, say so instead of guessing. Prefer: I don't currently have verified data for that.",
    "15. Greetings may receive a short friendly reply that offers farm help.",
    "16. You may suggest low-risk actions: isolate affected plants, remove visibly damaged material where appropriate, improve airflow, avoid unnecessary leaf wetting, monitor progression.",
    "17. Never ask for Aadhaar, bank passwords, OTP, or other sensitive government IDs.",
    "",
    "Return JSON only: { answer: string, caution: string, dataType: \"verified\" | \"estimated\" | \"simulated\" | \"unavailable\" }",
  ].join("\n")
}

export function buildFarmerSupportPrompt(
  lang: { code: string; name: string },
  question: string,
  ctx: FarmerSupportContext,
): string {
  const lines = [
    farmerSupportSystemInstruction(lang),
    "",
    "Verified RipeRoute farm context (use only if relevant; do not invent missing fields):",
    ctx.crop ? `- Current crop: ${ctx.crop}` : "- Current crop: not set",
    ctx.location ? `- Location: ${ctx.location}` : "- Location: not set",
    ctx.state ? `- State: ${ctx.state}` : "",
    ctx.farmSizeAcres != null && Number.isFinite(ctx.farmSizeAcres)
      ? `- Farm size (acres): ${ctx.farmSizeAcres}`
      : "",
    ctx.growthStage ? `- Growth stage: ${ctx.growthStage}` : "",
    ctx.waterAvailability ? `- Water / irrigation availability: ${ctx.waterAvailability}` : "",
    ...(ctx.verifiedNotes || []).map((n) => `- ${n}`),
    "",
    "No live market price, buyer count, weather reading, or logistics ETA is attached to this request.",
    "If the farmer asks for those, say verified data is unavailable rather than inventing numbers.",
    "",
    `Farmer question: ${question}`,
  ]
  return lines.filter(Boolean).join("\n")
}

/**
 * Lightweight output checks. If unsafe patterns appear, replace with a safe message.
 * Does not expose internal guardrail logic to the user.
 */
export function sanitizeFarmerSupportAnswer(
  answer: string,
  langCode: string,
  opts?: { hasVerifiedMarketData?: boolean; hasVerifiedWeather?: boolean },
): string {
  const text = (answer || "").trim()
  if (!text) {
    return geminiUnavailableMessage(langCode)
  }

  if (looksLikeChemicalDosage(text) || looksLikeUnsafeMixing(text)) {
    return chemicalSafetyFallback(langCode)
  }

  if (!opts?.hasVerifiedMarketData && looksLikeInventedMarketClaim(text)) {
    return unverifiedDataFallback(langCode)
  }

  if (!opts?.hasVerifiedWeather && looksLikeInventedWeatherClaim(text)) {
    return unverifiedDataFallback(langCode)
  }

  if (looksLikeCertainDiseaseClaim(text)) {
    return softenDiseaseCertainty(text, langCode)
  }

  if (looksLikeInventedEligibility(text)) {
    const note =
      langCode === "ta"
        ? "\n\nமுன் அறிவிப்பு தகவல் — அதிகாரப்பூர்வ சரிபார்ப்பு தேவை."
        : langCode === "hi"
          ? "\n\nप्रारंभिक जानकारी — आधिकारिक सत्यापन आवश्यक है।"
          : "\n\nPreliminary information — official verification is required."
    if (!/official verification|அதிகாரப்பூர்வ|आधिकारिक सत्यापन/i.test(text)) {
      return `${text}${note}`
    }
  }

  return text
}

function looksLikeChemicalDosage(text: string): boolean {
  const chemical =
    /\b(pesticide|insecticide|fungicide|herbicide|weedicide|chemical spray|dosage|dose|ml\/l|ml per|g\/l|ppm)\b/i.test(
      text,
    )
  const rate =
    /\b\d+(\.\d+)?\s*(ml|ml\/l|ml\/liter|ml\/litre|g\/l|g\/liter|ppm|%)\b/i.test(text) ||
    /\b(apply|spray|mix)\b.{0,40}\b\d+(\.\d+)?\s*(ml|g|litre|liter|L)\b/i.test(text)
  return chemical && rate
}

function looksLikeUnsafeMixing(text: string): boolean {
  return (
    /\bmix\b.{0,50}\b(pesticide|insecticide|fungicide|herbicide|chemical)s?\b/i.test(text) ||
    /\b(pesticide|insecticide|fungicide)s?\b.{0,50}\btogether\b/i.test(text) ||
    /\bcombine\b.{0,40}\b(pesticide|insecticide|fungicide)s?\b/i.test(text)
  )
}

function looksLikeInventedMarketClaim(text: string): boolean {
  const present =
    /\b(today'?s|currently|right now|near you|in your area|local market)\b/i.test(text) ||
    /\b(current|live)\b.{0,20}\b(price|rate|demand)\b/i.test(text)
  const price = /(₹|rs\.?|inr)\s*\d+([.,]\d+)?\s*(\/|per)\s*(kg|kilogram)/i.test(text)
  const buyerCount = /\b\d+\s+(buyers?|farms?)\b.{0,30}\b(near|nearby|around)\b/i.test(text)
  const hedge = /\b(unavailable|don't have|do not have|no verified|not available|cannot confirm|don't currently|estimated|typical|example|illustrative)\b/i.test(
    text,
  )
  return ((present && price) || (present && buyerCount) || (buyerCount && price)) && !hedge
}

function looksLikeInventedWeatherClaim(text: string): boolean {
  const claim =
    /\b(currently|right now|today)\b.{0,30}\b(\d+(\.\d+)?\s*°\s*c|humidity\s*\d+%|rainfall\s*\d+)/i.test(
      text,
    ) || /\bsoil moisture (is|at)\s*\d+%/i.test(text)
  const hedge = /\b(unavailable|don't have|do not have|no verified|estimated|modelled|modeled)\b/i.test(text)
  return claim && !hedge
}

function looksLikeCertainDiseaseClaim(text: string): boolean {
  return /\b(you (definitely|certainly) have|confirmed diagnosis|is definitely|100%\s*(sure|certain)| conclusively)\b/i.test(
    text,
  )
}

function looksLikeInventedEligibility(text: string): boolean {
  return /\b(you are (fully )?eligible|you qualify|guaranteed subsidy|approved for pm-?kisan)\b/i.test(text)
}

function softenDiseaseCertainty(text: string, langCode: string): string {
  const prefix =
    langCode === "ta"
      ? "படம் அல்லது உரை மட்டும் நோயை உறுதியாகக் கண்டறியாது. "
      : langCode === "hi"
        ? "केवल छवि या पाठ से निदान निश्चित नहीं हो सकता। "
        : "An image or text description alone cannot confirm a diagnosis. "
  return `${prefix}${text.replace(/\b(definitely|certainly|conclusively|100%\s*(sure|certain))\b/gi, "possibly")}`
}

function emptyMessage(langCode: string): string {
  const map: Record<string, string> = {
    en: "Please enter a question so I can help.",
    ta: "உதவ நான் உங்கள் கேள்வியை உள்ளிடவும்.",
    hi: "कृपया मदद के लिए एक प्रश्न लिखें।",
  }
  return map[langCode] || map.en
}

function tooLongMessage(langCode: string): string {
  const map: Record<string, string> = {
    en: `Please keep your question under ${MAX_FARMER_SUPPORT_CHARS} characters.`,
    ta: `கேள்வியை ${MAX_FARMER_SUPPORT_CHARS} எழுத்துகளுக்குள் வைக்கவும்.`,
    hi: `कृपया अपना प्रश्न ${MAX_FARMER_SUPPORT_CHARS} अक्षरों से कम रखें।`,
  }
  return map[langCode] || map.en
}
