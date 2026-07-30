
import { useCallback, useEffect, useRef, useState } from 'react';

// Minimal typings for the Web Speech API (not in standard lib DOM types).
interface SpeechRecognitionResultLike {
  0: {transcript: string;};
  isFinal: boolean;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {length: number;[i: number]: SpeechRecognitionResultLike;};
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: {error: string;}) => void) | null;
}

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export interface UseSpeechRecognition {
  supported: boolean;
  listening: boolean;
  transcript: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useSpeechRecognition(lang = 'fr-FR'): UseSpeechRecognition {
  const [supported] = useState(() => !!getRecognitionCtor());
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let text = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      setTranscript(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = (ev) => {
      setError(ev.error);
      setListening(false);
    };
    recRef.current = rec;
    return () => {
      try {
        rec.stop();
      } catch {

        /* noop */}
    };
  }, [lang]);

  const start = useCallback(() => {
    setError(null);
    setTranscript('');
    try {
      recRef.current?.start();
      setListening(true);
    } catch {
      setError('start-failed');
    }
  }, []);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {

      /* noop */}
    setListening(false);
  }, []);

  const reset = useCallback(() => setTranscript(''), []);

  return { supported, listening, transcript, error, start, stop, reset };
}

export function speak(text: string, lang = 'fr-FR'): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  window.speechSynthesis.speak(u);
}

export function speechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && !!window.speechSynthesis;
}