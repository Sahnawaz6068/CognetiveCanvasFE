/**
 * tldrawCommandExecutor.js
 *
 * Dispatches structured voice commands to the tldraw editor.
 * Handles both circuit-specific actions and generic canvas actions.
 *
 * Import and call: executeCanvasCommand(editor, command)
 */

import { createShapeId } from "tldraw";

// ── Layout constants for generic canvas shapes ────────────────────────────────
const GAP = 160;
const BOX_W = 160;
const BOX_H = 60;
const START_X = 200;
const START_Y = 200;

// ── CIRCUIT_DEFS mirror (kept in sync with CircuitLab.jsx) ───────────────────
// We import CIRCUIT_DEFS at runtime from the parent module via the editor context.
// To avoid circular imports, we duplicate the minimal shape-creation logic here
// and rely on the caller to pass CIRCUIT_DEFS if available, or fall back to defaults.

const COMPONENT_DEFAULTS = {
  battery:       { prefix: "BT",  val: "9V",       w: 160, h: 60  },
  voltagesource: { prefix: "VS",  val: "120VAC",   w: 140, h: 60  },
  currentsource: { prefix: "IS",  val: "1A",       w: 140, h: 60  },
  vcc:           { prefix: "VCC", val: "+5V",      w: 60,  h: 50  },
  ground:        { prefix: "GND", val: "GND",      w: 60,  h: 50  },
  resistor:      { prefix: "R",   val: "1kΩ",      w: 140, h: 55  },
  varresistor:   { prefix: "RV",  val: "10kΩ",     w: 140, h: 55  },
  potentiometer: { prefix: "P",   val: "10kΩ",     w: 140, h: 55  },
  capacitor:     { prefix: "C",   val: "100µF",    w: 120, h: 65  },
  inductor:      { prefix: "L",   val: "10mH",     w: 140, h: 55  },
  transformer:   { prefix: "T",   val: "1:1",      w: 200, h: 70  },
  fuse:          { prefix: "F",   val: "1A",       w: 140, h: 55  },
  crystal:       { prefix: "Y",   val: "16MHz",    w: 140, h: 70  },
  led:           { prefix: "D",   val: "2V fwd",   w: 150, h: 65  },
  diode:         { prefix: "D",   val: "1N4007",   w: 140, h: 55  },
  zener:         { prefix: "ZD",  val: "5.1V",     w: 140, h: 55  },
  scr:           { prefix: "SCR", val: "C106",     w: 140, h: 55  },
  npn:           { prefix: "Q",   val: "2N2222",   w: 80,  h: 80  },
  pnp:           { prefix: "Q",   val: "2N3906",   w: 80,  h: 80  },
  nmos:          { prefix: "M",   val: "IRF540",   w: 80,  h: 80  },
  pmos:          { prefix: "M",   val: "BS250",    w: 80,  h: 80  },
  opamp:         { prefix: "U",   val: "LM741",    w: 160, h: 75  },
  ic555:         { prefix: "U",   val: "NE555",    w: 100, h: 80  },
  ic741:         { prefix: "U",   val: "LM741",    w: 100, h: 75  },
  relaycoil:     { prefix: "K",   val: "5V coil",  w: 150, h: 60  },
  arduino:       { prefix: "MCU", val: "Uno",      w: 120, h: 80  },
  andgate:       { prefix: "G",   val: "7408",     w: 120, h: 70  },
  orgate:        { prefix: "G",   val: "7432",     w: 120, h: 70  },
  notgate:       { prefix: "G",   val: "7404",     w: 100, h: 60  },
  xorgate:       { prefix: "G",   val: "7486",     w: 120, h: 70  },
  mux:           { prefix: "MX",  val: "4:1 MUX",  w: 100, h: 80  },
  flipflop:      { prefix: "FF",  val: "7474",     w: 100, h: 80  },
  photoresistor: { prefix: "LDR", val: "10kΩ",     w: 150, h: 65  },
  thermistor:    { prefix: "RT",  val: "10kΩ NTC", w: 150, h: 60  },
  switch:        { prefix: "SW",  val: "SPST",     w: 120, h: 55  },
  voltmeter:     { prefix: "VM",  val: "DC",       w: 130, h: 70  },
  ammeter:       { prefix: "AM",  val: "DC",       w: 130, h: 70  },
  lamp:          { prefix: "LP",  val: "60W",      w: 120, h: 60  },
  speaker:       { prefix: "LS",  val: "8Ω",       w: 110, h: 65  },
  motor:         { prefix: "M",   val: "12V DC",   w: 120, h: 70  },
  microphone:    { prefix: "MIC", val: "Dynamic",  w: 120, h: 65  },
};

// Shared prefix counters across calls in a session
const _counters = {};

function nextLabel(type) {
  const def = COMPONENT_DEFAULTS[type];
  if (!def) return type.toUpperCase();
  const prefix = def.prefix;
  _counters[prefix] = (_counters[prefix] || 0) + 1;
  return `${prefix}${_counters[prefix]}`;
}

function getViewportCenter(editor) {
  try {
    return editor.getViewportPageBounds().center;
  } catch {
    return { x: 400, y: 300 };
  }
}

// ── Circuit shape creation helpers ───────────────────────────────────────────

function placeElectricalShape(editor, { type, label, value, x, y }) {
  const def = COMPONENT_DEFAULTS[type];
  if (!def) {
    console.warn(`Unknown component type: "${type}"`);
    return;
  }
  const id = createShapeId();
  const resolvedLabel = label || nextLabel(type);
  const resolvedValue = value || def.val;

  editor.createShape({
    id,
    type: "electrical",
    x: x - def.w / 2,
    y: y - def.h / 2,
    props: {
      componentType: type,
      label: resolvedLabel,
      value: resolvedValue,
      w: def.w,
      h: def.h,
    },
  });
}

// ── AI Circuit Generator (reuse AiCircuitGenerator logic inline) ──────────────

const GEMINI_API_KEY = "AIzaSyAQRlavivse_ViC3NFtAcZgfLNWyRErbH0";

async function generateAndPlaceCircuit(editor, description) {
  const availableKeys = Object.keys(COMPONENT_DEFAULTS).join(", ");
  const systemPrompt = `You are an expert electronics engineer. Given a circuit description, output ONLY a JSON object (no markdown, no explanation) describing the circuit components and their approximate positions on a 1200x800 canvas.

Available component keys: [${availableKeys}]

Return this exact JSON structure:
{
  "title": "Circuit name",
  "components": [
    { "type": "resistor", "label": "R1", "value": "10kΩ", "x": 200, "y": 300 }
  ]
}

Rules:
- Use only keys from the available list
- Space components logically (sources left, output right, ground bottom)
- Use realistic component values
- Include 4-12 components
- X range: 100-1100, Y range: 100-700`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\nCircuit: "${description}"` }] }],
        generationConfig: { response_mime_type: "application/json", temperature: 0.3 },
      }),
    }
  );

  if (!response.ok) throw new Error(`Gemini API error ${response.status}`);
  const data = await response.json();
  let raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  raw = raw.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(raw);

  // Clear canvas first
  const existing = editor.getCurrentPageShapes();
  if (existing.length > 0) {
    editor.selectAll();
    editor.deleteShapes(editor.getSelectedShapeIds());
  }

  for (const comp of parsed.components || []) {
    const def = COMPONENT_DEFAULTS[comp.type];
    if (!def) continue;
    placeElectricalShape(editor, {
      type: comp.type,
      label: comp.label,
      value: comp.value,
      x: comp.x,
      y: comp.y,
    });
    await new Promise((r) => setTimeout(r, 50));
  }

  editor.zoomToFit();
}

// ── Main dispatcher ───────────────────────────────────────────────────────────

export async function executeCanvasCommand(editor, command) {
  const { module, action, payload = {} } = command;

  // ── Circuit-specific actions ──────────────────────────────────────────────
  if (module === "circuit") {
    switch (action) {
      case "add_component": {
        const center = getViewportCenter(editor);
        placeElectricalShape(editor, {
          type: payload.type,
          label: payload.label,
          value: payload.value,
          x: payload.x || center.x,
          y: payload.y || center.y,
        });
        break;
      }

      case "add_components": {
        const center = getViewportCenter(editor);
        const comps = payload.components || [];
        comps.forEach((comp, i) => {
          placeElectricalShape(editor, {
            type: comp.type,
            label: comp.label,
            value: comp.value,
            x: comp.x || center.x + i * 200 - (comps.length - 1) * 100,
            y: comp.y || center.y,
          });
        });
        break;
      }

      case "generate_circuit": {
        try {
          await generateAndPlaceCircuit(editor, payload.description || "simple LED circuit");
        } catch (err) {
          console.error("generate_circuit error:", err);
        }
        break;
      }

      case "clear_canvas": {
        const shapes = editor.getCurrentPageShapes();
        if (shapes.length > 0) {
          editor.selectAll();
          editor.deleteShapes(editor.getSelectedShapeIds());
        }
        break;
      }

      case "zoom_fit": {
        editor.zoomToFit();
        break;
      }

      case "unknown":
      default:
        console.warn("Unknown circuit action:", action, payload);
        break;
    }
    return;
  }

  // ── Generic canvas actions (flowchart, mindmap, etc.) ─────────────────────
  switch (action) {
    case "draw_flowchart":
      drawFlowchart(editor, payload);
      break;
    case "draw_mindmap":
      drawMindMap(editor, payload);
      break;
    case "draw_shapes":
      drawShapes(editor, payload);
      break;
    case "draw_sequence":
      drawSequence(editor, payload);
      break;
    default:
      console.warn("Unknown canvas action:", action);
  }
}

// ── Generic canvas shape renderers ───────────────────────────────────────────

function drawFlowchart(editor, { steps = [] }) {
  const shapes = [];
  const ids = steps.map(() => createShapeId());

  steps.forEach((step, i) => {
    const isFirst = i === 0;
    const isLast = i === steps.length - 1;
    const x = START_X;
    const y = START_Y + i * (BOX_H + GAP);

    shapes.push({
      id: ids[i],
      type: "geo",
      x,
      y,
      props: {
        geo: isFirst || isLast ? "ellipse" : "rectangle",
        w: BOX_W,
        h: BOX_H,
        text: step,
        align: "middle",
        verticalAlign: "middle",
        size: "s",
        fill: "solid",
        color: isFirst ? "green" : isLast ? "red" : "blue",
      },
    });

    if (i < steps.length - 1) {
      shapes.push({
        id: createShapeId(),
        type: "arrow",
        x: x + BOX_W / 2,
        y: y + BOX_H,
        props: {
          start: { x: 0, y: 0 },
          end: { x: 0, y: GAP },
          color: "grey",
          size: "s",
        },
      });
    }
  });

  editor.createShapes(shapes);
  editor.zoomToFit();
}

function drawMindMap(editor, { center = "Topic", branches = [] }) {
  const shapes = [];
  const cx = 600, cy = 400, radius = 220;

  shapes.push({
    id: createShapeId(),
    type: "geo",
    x: cx - BOX_W / 2,
    y: cy - BOX_H / 2,
    props: {
      geo: "ellipse", w: BOX_W, h: BOX_H,
      text: center, align: "middle", verticalAlign: "middle",
      fill: "solid", color: "violet", size: "m",
    },
  });

  branches.forEach((branch, i) => {
    const angle = (2 * Math.PI * i) / branches.length - Math.PI / 2;
    const bx = cx + radius * Math.cos(angle) - BOX_W / 2;
    const by = cy + radius * Math.sin(angle) - BOX_H / 2;

    shapes.push({
      id: createShapeId(),
      type: "geo",
      x: bx, y: by,
      props: {
        geo: "rectangle", w: BOX_W, h: BOX_H,
        text: branch, align: "middle", verticalAlign: "middle",
        fill: "solid", color: "light-blue", size: "s",
      },
    });

    shapes.push({
      id: createShapeId(),
      type: "arrow",
      x: cx, y: cy,
      props: {
        start: { x: 0, y: 0 },
        end: { x: bx + BOX_W / 2 - cx, y: by + BOX_H / 2 - cy },
        color: "grey", size: "s",
        arrowheadEnd: "arrow", arrowheadStart: "none",
      },
    });
  });

  editor.createShapes(shapes);
  editor.zoomToFit();
}

function drawShapes(editor, { shapes: shapeList = [] }) {
  const shapes = shapeList.map((s, i) => ({
    id: createShapeId(),
    type: "geo",
    x: START_X + i * (BOX_W + 40),
    y: START_Y,
    props: {
      geo: s.type === "ellipse" ? "ellipse" : "rectangle",
      w: BOX_W, h: BOX_H,
      text: s.label || "",
      align: "middle", verticalAlign: "middle",
      fill: "solid", color: "blue", size: "s",
    },
  }));

  editor.createShapes(shapes);
  editor.zoomToFit();
}

function drawSequence(editor, { actors = [], steps = [] }) {
  const shapes = [];
  const actorX = actors.map((_, i) => START_X + i * 300);

  actors.forEach((actor, i) => {
    shapes.push({
      id: createShapeId(),
      type: "geo",
      x: actorX[i] - BOX_W / 2,
      y: START_Y,
      props: {
        geo: "rectangle", w: BOX_W, h: BOX_H,
        text: actor, align: "middle", verticalAlign: "middle",
        fill: "solid", color: "orange", size: "s",
      },
    });
  });

  steps.forEach((step, i) => {
    const fromIdx = actors.indexOf(step.from);
    const toIdx = actors.indexOf(step.to);
    if (fromIdx === -1 || toIdx === -1) return;

    const y = START_Y + BOX_H + 60 + i * 80;
    shapes.push({
      id: createShapeId(),
      type: "arrow",
      x: actorX[fromIdx],
      y,
      props: {
        start: { x: 0, y: 0 },
        end: { x: actorX[toIdx] - actorX[fromIdx], y: 0 },
        text: step.label || "",
        color: "black", size: "s",
        arrowheadEnd: "arrow",
      },
    });
  });

  editor.createShapes(shapes);
  editor.zoomToFit();
}