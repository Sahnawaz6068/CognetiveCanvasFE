/**
 * useVoiceCommand.js
 * React hook wrapping the Web Speech API for voice recognition.
 *
 * Usage:
 *   const { isListening, isSupported, startListening, stopListening } =
 *     useVoiceCommand({ onResult, onError });
 */

import { useState, useRef, useCallback, useEffect } from "react";

export function useVoiceCommand({ onResult, onError }) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    if (!isSupported) return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      setIsListening(false);
      if (transcript) onResult?.(transcript);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      const msg =
        event.error === "not-allowed"
          ? "Microphone access denied. Please allow mic access."
          : event.error === "no-speech"
          ? "No speech detected. Try again."
          : `Speech error: ${event.error}`;
      onError?.(msg);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try { recognition.abort(); } catch {}
    };
  }, [isSupported]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      onError?.("Speech recognition not supported in this browser.");
      return;
    }
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      onError?.("Could not start microphone: " + err.message);
    }
  }, [isSupported, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsListening(false);
  }, []);

  return { isListening, isSupported, startListening, stopListening };
}