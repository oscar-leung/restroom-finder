import { useEffect, useRef, useState } from "react";
import { trackEvent } from "../utils/analytics";
import { useI18n } from "../i18n";

/**
 * VoiceButton — uses the Web Speech API for "find a bathroom" voice
 * commands. Hold to talk; releases on stop.
 *
 * Recognized commands (loose match):
 *   - "find/where (the nearest|closest|a) bathroom/restroom/toilet" → trigger GO on hero
 *   - "next/another (one|bathroom)"                                   → onNext
 *   - "show map" / "open map"                                         → onOpenMap
 *   - "add a bathroom"                                                → onAddBathroom
 *   - "random one" / "surprise me"                                    → onRoulette
 *
 * Browsers without SpeechRecognition (Firefox, some mobile Safari) get
 * the button rendered as disabled with a tooltip — no error.
 *
 * Props are callbacks; pass null for any command you don't want enabled.
 */
const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export default function VoiceButton({
  onGo,
  onNext,
  onOpenMap,
  onAddBathroom,
  onRoulette,
}) {
  const [listening, setListening] = useState(false);
  const { t } = useI18n();
  const [transcript, setTranscript] = useState("");
  const recRef = useRef(null);

  const supported = !!SpeechRecognition;

  // App passes fresh arrow-function callbacks every render; keeping the
  // latest set in a ref (updated in an effect) lets the recognizer be
  // created ONCE instead of torn down per render.
  const handlersRef = useRef({});
  useEffect(() => {
    handlersRef.current = { onGo, onNext, onOpenMap, onAddBathroom, onRoulette };
  }, [onGo, onNext, onOpenMap, onAddBathroom, onRoulette]);

  useEffect(() => {
    if (!supported) return;
    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = true;

    const handleCommand = (text) => {
      trackEvent("voice_command", { transcript: text });
      const h = handlersRef.current;
      if (/(find|where|nearest|closest|nearby).*?(bathroom|restroom|toilet|loo)/.test(text)) {
        h.onGo?.();
      } else if (/(next|another|skip)/.test(text)) {
        h.onNext?.();
      } else if (/(show|open).*map/.test(text)) {
        h.onOpenMap?.();
      } else if (/add.*(bathroom|restroom|toilet)/.test(text)) {
        h.onAddBathroom?.();
      } else if (/(random|surprise|something new)/.test(text)) {
        h.onRoulette?.();
      }
    };

    rec.onresult = (e) => {
      const last = e.results[e.results.length - 1];
      const text = (last[0]?.transcript || "").toLowerCase().trim();
      setTranscript(text);
      if (last.isFinal) handleCommand(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);

    recRef.current = rec;
    return () => {
      try { rec.abort(); } catch { /* already stopped */ }
    };
  }, [supported]);

  const toggle = () => {
    if (!supported) return;
    if (listening) {
      try { recRef.current.stop(); } catch {}
      setListening(false);
    } else {
      try {
        recRef.current.start();
        setListening(true);
        setTranscript("");
      } catch {
        setListening(false);
      }
    }
  };

  if (!supported) {
    return (
      <button className="voice-btn voice-btn-unsupported" disabled title="Voice not supported in this browser">
        🎙️ <span className="voice-label">{t("voice.label")}</span>
      </button>
    );
  }

  return (
    <button
      className={`voice-btn ${listening ? "voice-btn-listening" : ""}`}
      onClick={toggle}
      title='Try: "find a bathroom" / "next one" / "show map" / "add a bathroom"'
      aria-pressed={listening}
    >
      <span className="voice-icon" aria-hidden="true">{listening ? "🔴" : "🎙️"}</span>
      <span className="voice-label">{listening ? t("voice.listening") : t("voice.label")}</span>
      {transcript && listening && <span className="voice-transcript">"{transcript}"</span>}
    </button>
  );
}
