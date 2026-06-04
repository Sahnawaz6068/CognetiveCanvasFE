/**
 * voiceToCommand.js
 * Converts a voice transcript into a structured circuit command.
 * Tries multiple Gemini models in order — falls back on 503/overload.
 */

const GEMINI_API_KEY = "AIzaSyAQRlavivse_ViC3NFtAcZgfLNWyRErbH0";

// Tried in order; first one that responds wins
const MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-2.5-flash",
];

const COMPONENT_KEYS = [
  "battery","voltagesource","currentsource","vcc","ground",
  "resistor","varresistor","potentiometer","capacitor","inductor",
  "transformer","fuse","crystal","led","diode","zener","scr",
  "npn","pnp","nmos","pmos","opamp","ic555","ic741","relaycoil",
  "arduino","andgate","orgate","notgate","xorgate","mux","flipflop",
  "photoresistor","thermistor","switch","voltmeter","ammeter",
  "lamp","speaker","motor","microphone",
].join(", ");

const SYSTEM = `You are a circuit drawing assistant. Convert the voice command to JSON.
Component keys: [${COMPONENT_KEYS}]
Return ONLY raw JSON, no markdown, no explanation.

Actions:
{"module":"circuit","action":"add_component","payload":{"type":"resistor","label":"R1","value":"1kΩ","x":400,"y":300}}
{"module":"circuit","action":"add_components","payload":{"components":[{"type":"battery","label":"BT1","value":"9V","x":200,"y":300},{"type":"led","label":"D1","value":"2V","x":500,"y":300}]}}
{"module":"circuit","action":"generate_circuit","payload":{"description":"555 timer LED flasher"}}
{"module":"circuit","action":"clear_canvas","payload":{}}
{"module":"circuit","action":"zoom_fit","payload":{}}
{"module":"circuit","action":"unknown","payload":{"transcript":"..."}}

Rules:
- "add X" / "place X" / "put X" → add_component
- "add X and Y" / "two Xs" → add_components  
- "draw/create/build [name] circuit" → generate_circuit
- "clear" / "delete all" / "reset" → clear_canvas
- "zoom fit" / "fit screen" → zoom_fit
- Default values: resistor=1kΩ, capacitor=100µF, battery=9V, led=2V fwd
- Spread components: x 150-900, y around 300`;

async function callGemini(model, transcript) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${SYSTEM}\n\nVoice command: "${transcript}"` }] }],
      generationConfig: { response_mime_type: "application/json", temperature: 0.1 },
    }),
  });

  if (res.status === 503 || res.status === 429) {
    throw new Error(`OVERLOADED:${res.status}`);
  }
  if (!res.ok) {
    throw new Error(`API_ERROR:${res.status}`);
  }

  const data = await res.json();
  const raw = (data?.candidates?.[0]?.content?.parts?.[0]?.text || "")
    .replace(/```json|```/g, "")
    .trim();
  return JSON.parse(raw);
}

export async function interpretVoiceCommand(transcript) {
  let lastError = null;

  for (const model of MODELS) {
    try {
      const result = await callGemini(model, transcript);
      return result;
    } catch (err) {
      lastError = err;
      const isRetryable = err.message.startsWith("OVERLOADED");
      console.warn(`[voiceToCommand] model ${model} failed: ${err.message}`);
      if (!isRetryable) break; // hard error, no point retrying other models
    }
  }

  // All models failed — return unknown so the UI shows a graceful message
  console.error("[voiceToCommand] all models failed:", lastError?.message);
  return {
    module: "circuit",
    action: "unknown",
    payload: { transcript, error: lastError?.message },
  };
}