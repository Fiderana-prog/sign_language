import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Download,
  Film,
  Image as ImageIcon,
  LoaderCircle,
  Mic,
  Play,
  Plus,
  RefreshCw,
  Server,
  Square,
  Trash2,
  Type,
  Undo2,
  Upload,
  Video,
  Volume2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AppShell from '../components/AppShell';
import AvatarStage from '../components/AvatarStage';
import { API_BASE_URL, checkAslApi, predictAslFile } from '../services/aslApi';

const DEMO_TOKENS = ['merci'];
const QUICK = ['merci', 'manger', 'maison'];


const TOKEN_TO_ASL_KEY = {
  bébé: 'baby',
  baby: 'baby',
  manger: 'eat',
  eat: 'eat',
  père: 'father',
  papa: 'father',
  father: 'father',
  terminer: 'finish',
  fini: 'finish',
  finish: 'finish',
  bien: 'good',
  bon: 'good',
  good: 'good',
  heureux: 'happy',
  happy: 'happy',
  entendre: 'hear',
  hear: 'hear',
  maison: 'house',
  house: 'house',
  important: 'important',
  aimer: 'love',
  amour: 'love',
  love: 'love',
  centre: 'mall',
  commercial: 'mall',
  mall: 'mall',
  moi: 'me',
  me: 'me',
  mosquée: 'mosque',
  mosque: 'mosque',
  mère: 'mother',
  maman: 'mother',
  mother: 'mother',
  normal: 'normal',
  triste: 'sad',
  sad: 'sad',
  arrêter: 'stop',
  stop: 'stop',
  merci: 'thanks',
  thanks: 'thanks',
  penser: 'thinking',
  pense: 'thinking',
  thinking: 'thinking',
  inquiétude: 'worry',
  inquiet: 'worry',
  inquiète: 'worry',
  worry: 'worry',
};

function normalizeToken(token) {
  return token
    .toLowerCase()
    .replace(/[.,!?;:()"'’]/g, '')
    .trim();
}

function tokenToAnimation(token) {
  const normalized = normalizeToken(token);
  const key = TOKEN_TO_ASL_KEY[normalized] || normalized;
  return `WORD_${key.toUpperCase()}`;
}

const ENGLISH_TO_FRENCH = {
  baby: 'bébé',
  eat: 'manger',
  father: 'père',
  finish: 'terminer',
  good: 'bien',
  happy: 'heureux',
  hear: 'entendre',
  house: 'maison',
  important: 'important',
  love: 'aimer',
  mall: 'centre commercial',
  me: 'moi',
  mosque: 'mosquée',
  mother: 'mère',
  normal: 'normal',
  sad: 'triste',
  stop: 'arrêter',
  thanks: 'merci',
  thinking: 'penser',
  worry: "s'inquiéter",
};

const PHRASE_RULES = new Map([
  ['me|mother|love', "J'aime ma mère."],
  ['me|father|love', "J'aime mon père."],
  ['me|happy', 'Je suis heureux.'],
  ['me|sad', 'Je suis triste.'],
  ['me|worry', 'Je suis inquiet.'],
  ['me|thinking', 'Je réfléchis.'],
  ['baby|eat', 'Le bébé mange.'],
  ['baby|eat|finish', 'Le bébé a fini de manger.'],
  ['father|house', 'Mon père est à la maison.'],
  ['mother|house', 'Ma mère est à la maison.'],
  ['mall|good', 'Le centre commercial est bien.'],
  ['mosque|important', 'La mosquée est importante.'],
  ['thanks', 'Merci.'],
  ['stop', 'Arrêtez.'],
  ['finish', "C'est terminé."],
]);

function naturalize(words) {
  if (!words.length) return 'Ajoutez des mots reconnus pour construire une phrase.';

  const fullKey = words.join('|');
  if (PHRASE_RULES.has(fullKey)) return PHRASE_RULES.get(fullKey);

  for (let length = Math.min(words.length, 5); length >= 1; length -= 1) {
    const endingKey = words.slice(-length).join('|');
    if (PHRASE_RULES.has(endingKey)) return PHRASE_RULES.get(endingKey);
  }

  const sentence = words.map((word) => ENGLISH_TO_FRENCH[word] || word).join(' ');
  return `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`;
}

function acceptedMimeType() {
  if (typeof MediaRecorder === 'undefined') return '';

  const candidates = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
  ];

  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || '';
}

export default function Translate() {
  const [mode, setMode] = useState('camera');
  const [text, setText] = useState('');
  const [tokens, setTokens] = useState(DEMO_TOKENS);
  const [autoplay, setAutoplay] = useState(0);
  const [listening, setListening] = useState(false);

  const [recognitionModel, setRecognitionModel] = useState('words');
  const [recognitionSource, setRecognitionSource] = useState('camera');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [threshold, setThreshold] = useState(0.7);
  const [loading, setLoading] = useState(false);
  const [recognitionError, setRecognitionError] = useState('');
  const [validFrames, setValidFrames] = useState(null);
  const [detectedWords, setDetectedWords] = useState([]);
  const [detectedLetters, setDetectedLetters] = useState([]);
  const [apiStatus, setApiStatus] = useState('checking');
  const [apiInfo, setApiInfo] = useState(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [cameraError, setCameraError] = useState('');
  const [motionScore, setMotionScore] = useState(0);
  const [motionDetected, setMotionDetected] = useState(false);
  const [motionMessage, setMotionMessage] = useState(
    'Placez vos deux mains dans le cadre.',
  );

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const progressTimerRef = useRef(null);
  const motionTimerRef = useRef(null);
  const motionCanvasRef = useRef(null);
  const previousMotionFrameRef = useRef(null);
  const recordingMotionSamplesRef = useRef([]);

  const bestPrediction = predictions[0] || null;
  const accepted = Boolean(bestPrediction && bestPrediction.confidence >= threshold);
  const naturalSentence = useMemo(
    () => naturalize(detectedWords),
    [detectedWords],
  );
  const spelledText = useMemo(
    () => detectedLetters.join('').toUpperCase(),
    [detectedLetters],
  );
  const activeModelInfo = apiInfo?.models?.[recognitionModel] || null;

  const stopCamera = () => {
    if (recordingTimerRef.current) window.clearTimeout(recordingTimerRef.current);
    if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
    if (motionTimerRef.current) window.clearInterval(motionTimerRef.current);
    recordingTimerRef.current = null;
    progressTimerRef.current = null;
    motionTimerRef.current = null;
    previousMotionFrameRef.current = null;
    recordingMotionSamplesRef.current = [];

    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    recorderRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOn(false);
    setRecording(false);
    setRecordingProgress(0);
    setMotionScore(0);
    setMotionDetected(false);
    setMotionMessage(
      'Placez vos deux mains dans le cadre.',
    );
  };

  useEffect(() => {
    const controller = new AbortController();

    checkAslApi(controller.signal)
      .then((info) => {
        setApiStatus('online');
        setApiInfo(info);
      })
      .catch(() => {
        if (!controller.signal.aborted) setApiStatus('offline');
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('');
      return undefined;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  useEffect(() => () => {
    stopCamera();
    recognitionRef.current?.stop?.();
  }, []);

  useEffect(() => {
    if (cameraOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraOn]);

  const translate = (source = text) => {
    const clean = source.trim().toLowerCase();
    if (!clean) return;
    setTokens(clean.split(/\s+/).slice(0, 6));
    setAutoplay((value) => value + 1);
  };

  const speak = (source = text || tokens.join(' ')) => {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(source.trim());
    utterance.lang = 'fr-FR';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const toggleVoice = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!Recognition) {
      setText('La reconnaissance vocale n’est pas disponible dans ce navigateur.');
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new Recognition();
    recognition.lang = 'fr-FR';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const phrase = Array.from(event.results).map((result) => result[0].transcript).join(' ');
      setText(phrase);
      if (event.results[event.results.length - 1].isFinal) translate(phrase);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const chooseRecognitionModel = (modelType) => {
    setRecognitionModel(modelType);
    setRecognitionSource(
      modelType === 'alphabet'
        ? 'image'
        : 'video',
    );
    setSelectedFile(null);
    setPredictions([]);
    setRecognitionError('');
    setValidFrames(null);
    stopCamera();
  };

  const chooseRecognitionSource = (source) => {
    setRecognitionSource(source);
    setSelectedFile(null);
    setPredictions([]);
    setRecognitionError('');
    setValidFrames(null);

    if (source !== 'camera') stopCamera();
  };

  const handleFile = (file) => {
    if (!file) return;

    const imageExpected = (
      recognitionModel === 'alphabet'
      || recognitionSource === 'image'
    );
    const expectedPrefix = imageExpected
      ? 'image/'
      : 'video/';

    if (!file.type.startsWith(expectedPrefix)) {
      setRecognitionError(
        imageExpected
          ? 'Choisissez un fichier image valide.'
          : 'Choisissez un fichier vidéo valide.',
      );
      return;
    }

    setSelectedFile(file);
    setPredictions([]);
    setValidFrames(null);
    setRecognitionError('');
  };


  const sampleCameraMotion = () => {
    const video = videoRef.current;

    if (
      !video
      || video.readyState < 2
      || video.videoWidth <= 0
      || video.videoHeight <= 0
    ) {
      return;
    }

    const width = 64;
    const height = 48;

    let canvas = motionCanvasRef.current;

    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      motionCanvasRef.current = canvas;
    }

    const context = canvas.getContext(
      '2d',
      {
        alpha: false,
        willReadFrequently: true,
      },
    );

    context.drawImage(
      video,
      0,
      0,
      width,
      height,
    );

    const pixels = context.getImageData(
      0,
      0,
      width,
      height,
    ).data;

    const grayscale = new Uint8Array(
      width * height,
    );

    for (
      let sourceIndex = 0, targetIndex = 0;
      sourceIndex < pixels.length;
      sourceIndex += 4, targetIndex += 1
    ) {
      grayscale[targetIndex] = Math.round(
        pixels[sourceIndex] * 0.299
        + pixels[sourceIndex + 1] * 0.587
        + pixels[sourceIndex + 2] * 0.114,
      );
    }

    const previous = previousMotionFrameRef.current;
    previousMotionFrameRef.current = grayscale;

    if (!previous) return;

    let changedPixels = 0;
    let totalDifference = 0;

    for (
      let index = 0;
      index < grayscale.length;
      index += 1
    ) {
      const difference = Math.abs(
        grayscale[index] - previous[index],
      );

      totalDifference += difference;

      if (difference >= 18) {
        changedPixels += 1;
      }
    }

    const changedRatio = (
      changedPixels / grayscale.length
    );

    const averageDifference = (
      totalDifference / grayscale.length
    );

    const combinedScore = Math.min(
      100,
      Math.round(
        changedRatio * 650
        + averageDifference * 1.8,
      ),
    );

    const hasMovement = (
      changedRatio >= 0.006
      || averageDifference >= 2.1
    );

    setMotionScore(combinedScore);
    setMotionDetected(hasMovement);

    if (hasMovement) {
      setMotionMessage(
        recording
          ? 'Mouvement détecté, continuez le signe.'
          : 'Mouvement détecté. Vous pouvez enregistrer.',
      );
    } else {
      setMotionMessage(
        recording
          ? 'Bougez davantage les mains et les doigts.'
          : 'Faites un mouvement devant la caméra.',
      );
    }

    if (recording) {
      recordingMotionSamplesRef.current.push({
        changedRatio,
        averageDifference,
      });
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
      setCameraError('');
      setMotionMessage(
        'Initialisation de la détection du mouvement…',
      );

      if (motionTimerRef.current) {
        window.clearInterval(
          motionTimerRef.current,
        );
      }

      motionTimerRef.current = window.setInterval(
        sampleCameraMotion,
        125,
      );
    } catch {
      setCameraError('Accès caméra refusé ou indisponible. Utilisez HTTPS ou localhost.');
    }
  };

  useEffect(() => {
    if (
      mode !== 'camera'
      || recognitionSource !== 'camera'
      || cameraOn
      || streamRef.current
    ) {
      return;
    }

    startCamera();
  }, [
    mode,
    recognitionSource,
  ]);


  const captureAlphabetPhoto = () => {
    const video = videoRef.current;

    if (!video || !cameraOn) {
      setCameraError('Activez d’abord la caméra.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const context = canvas.getContext('2d');
    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError(
            'Impossible de capturer la photo.',
          );
          return;
        }

        const file = new File(
          [blob],
          'alphabet-camera.jpg',
          { type: 'image/jpeg' },
        );

        setSelectedFile(file);
        setPredictions([]);
        setValidFrames(null);
        setCameraError('');
      },
      'image/jpeg',
      0.92,
    );
  };

  const recordCamera = async () => {
    if (!streamRef.current) {
      await startCamera();
      return;
    }

    if (typeof MediaRecorder === 'undefined') {
      setCameraError('L’enregistrement vidéo n’est pas disponible dans ce navigateur.');
      return;
    }

    chunksRef.current = [];
    recordingMotionSamplesRef.current = [];
    previousMotionFrameRef.current = null;
    setMotionMessage(
      'Commencez maintenant votre signe ASL.',
    );

    const mimeType = acceptedMimeType();
    const recorder = new MediaRecorder(streamRef.current, mimeType ? { mimeType } : undefined);
    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    recorder.onstop = () => {
      const type = (
        recorder.mimeType
        || mimeType
        || 'video/webm'
      );

      const extension = (
        type.includes('mp4')
          ? 'mp4'
          : 'webm'
      );

      const blob = new Blob(
        chunksRef.current,
        { type },
      );

      const file = new File(
        [blob],
        `signe-camera.${extension}`,
        { type },
      );

      const samples = (
        recordingMotionSamplesRef.current
      );

      const averageRatio = samples.length
        ? samples.reduce(
            (sum, sample) => (
              sum + sample.changedRatio
            ),
            0,
          ) / samples.length
        : 0;

      const peakRatio = samples.length
        ? Math.max(
            ...samples.map(
              (sample) => sample.changedRatio,
            ),
          )
        : 0;

      const activeSamples = samples.filter(
        (sample) => (
          sample.changedRatio >= 0.006
          || sample.averageDifference >= 2.1
        ),
      ).length;

      const activeRatio = samples.length
        ? activeSamples / samples.length
        : 0;

      const movementIsValid = (
        samples.length >= 10
        && (
          averageRatio >= 0.0025
          || peakRatio >= 0.012
        )
        && activeRatio >= 0.12
      );

      setRecording(false);
      setRecordingProgress(100);

      if (!movementIsValid) {
        setSelectedFile(null);
        setPredictions([]);
        setValidFrames(null);

        setCameraError(
          'Mouvement insuffisant. Recommencez en bougeant '
          + 'clairement les deux mains et les doigts.',
        );

        setMotionMessage(
          'Aucun geste complet détecté.',
        );

        return;
      }

      setSelectedFile(file);
      setPredictions([]);
      setValidFrames(null);
      setCameraError('');

      setMotionMessage(
        'Geste détecté. Analyse automatique en cours…',
      );

      if (apiStatus === 'online') {
        window.setTimeout(
          () => analyzeFile(
            file,
            'words',
          ),
          0,
        );
      } else {
        setRecognitionError(
          'Le geste est détecté, mais le backend '
          + 'FastAPI est hors ligne.',
        );
      }
    };

    recorder.start(150);
    setRecording(true);
    setRecordingProgress(0);
    setCameraError('');

    const startedAt = Date.now();
    progressTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setRecordingProgress(Math.min(100, (elapsed / 4000) * 100));
    }, 80);

    recordingTimerRef.current = window.setTimeout(() => {
      if (recorder.state === 'recording') recorder.stop();
      if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }, 4000);
  };

  const analyzeFile = async (
    file,
    modelType = recognitionModel,
  ) => {
    if (!file) return;

    setLoading(true);
    setRecognitionError('');

    try {
      const result = await predictAslFile(
        file,
        modelType,
      );

      setPredictions(
        result.predictions || [],
      );

      setValidFrames(
        result.valid_frames ?? null,
      );
    } catch (error) {
      setPredictions([]);

      setRecognitionError(
        error.message
        || 'Impossible d’analyser ce fichier.',
      );
    } finally {
      setLoading(false);
    }
  };

  const analyze = async () => {
    await analyzeFile(
      selectedFile,
      recognitionModel,
    );
  };

  const addPrediction = () => {
    if (!accepted || !bestPrediction) return;

    if (recognitionModel === 'alphabet') {
      setDetectedLetters((current) => [
        ...current,
        bestPrediction.word,
      ]);
      return;
    }

    setDetectedWords((current) => {
      if (
        current[current.length - 1]
        === bestPrediction.word
      ) {
        return current;
      }

      return [...current, bestPrediction.word];
    });
  };

  const downloadSentence = () => {
    const content = recognitionModel === 'alphabet'
      ? spelledText
      : naturalSentence;

    const blob = new Blob(
      [content],
      { type: 'text/plain;charset=utf-8' },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'traduction-signverse.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <div className="page-head page-head--translate">
        <div>
          <p className="eyebrow">Traduction / 02</p>
          <h1>Faire signe,<br /><span>sans friction.</span></h1>
        </div>
        <p>Traduisez du texte avec un visualiseur 3D. La caméra enregistre un court extrait puis l’envoie au modèle IA pour reconnaître l’un des 20 mots ASL. L’alphabet utilise une photo statique.</p>
      </div>

      <div className="mode-tabs">
        <button
          className={mode === 'camera' ? 'is-active' : ''}
          onClick={() => setMode('camera')}
        >
          <Camera size={16} />
          Caméra
        </button>

        <button
          className={mode === 'text' ? 'is-active' : ''}
          onClick={() => {
            stopCamera();
            setMode('text');
          }}
        >
          <Type size={16} />
          Texte
        </button>

        <button
          className={mode === 'voice' ? 'is-active' : ''}
          onClick={() => {
            stopCamera();
            setMode('voice');
          }}
        >
          <Mic size={16} />
          Voix
        </button>
      </div>

      {mode !== 'camera' && (
        <div className="translate-grid">
          <AvatarStage
            label="Modèle 3D initial"
          />
          <div className="translate-panel">
            {mode === 'text' && (
              <section className="input-card">
                <span className="section-kicker">Phrase source</span>
                <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Écrivez votre phrase…" />
                <div className="input-card__bottom">
                  <button className="button button--dark" onClick={() => translate()}><Play size={15} />Traduire</button>
                  <div className="chips">{QUICK.map((word) => <button key={word} onClick={() => { setText(word); translate(word); }}>{word}</button>)}</div>
                </div>
              </section>
            )}

            {mode === 'voice' && (
              <section className="input-card voice-card">
                <span className="section-kicker">Entrée voix</span>
                <div className={`voice-orb ${listening ? 'is-listening' : ''}`}><Mic size={34} /></div>
                <h2>{listening ? 'Je vous écoute…' : 'Dictez votre phrase'}</h2>
                <p>{text || 'Appuyez sur le bouton puis parlez clairement.'}</p>
                <button className={`button ${listening ? 'button--danger' : 'button--dark'}`} onClick={toggleVoice}>
                  {listening ? <Square size={15} /> : <Mic size={15} />}{listening ? 'Arrêter' : 'Commencer'}
                </button>
              </section>
            )}

            <section className="sequence-card">
              <span className="section-kicker">Séquence de signes</span>
              <p>Le modèle 3D initial est présenté comme démonstrateur visuel. Il n’exécute plus automatiquement une animation pour chaque mot traduit.</p>
              <div className="sequence-tokens">{tokens.map((token, index) => <span key={`${token}-${index}`}>{token}</span>)}</div>
            </section>

            <section className="voice-output">
              <Volume2 size={22} />
              <span className="section-kicker">Sortie voix</span>
              <p>Lire la phrase pour l’interlocuteur entendant.</p>
              <button className="button button--outline-light" onClick={() => speak()}><Volume2 size={15} />Prononcer</button>
            </section>
          </div>
        </div>
      )}

      {mode === 'camera' && (
        <>
          <div className="recognition-statusbar">
            <div className={`api-pill api-pill--${apiStatus}`}>
              <Server size={15} />
              <span>
                {apiStatus === 'online' && 'API du modèle connectée'}
                {apiStatus === 'checking' && 'Connexion au modèle…'}
                {apiStatus === 'offline' && 'API du modèle hors ligne'}
              </span>
            </div>
            <span className="model-note">
              {recognitionModel === 'words'
                ? `Mots ASL · ${activeModelInfo?.class_count || 20} classes · 30 frames · 224 × 224`
                : `Alphabet ASL · ${activeModelInfo?.class_count || 36} classes · image 224 × 224`}
            </span>
          </div>

          <div className="recognition-grid">
            <section className="recognition-card recognition-card--source">
              <div className="recognition-card__head">
                <div>
                  <span className="section-kicker">01 / Entrée</span>
                  <h2>
                    {recognitionModel === 'words'
                      ? 'Présentez un mot signé'
                      : 'Présentez une lettre ou un chiffre'}
                  </h2>
                </div>
                <b>
                  {recognitionModel === 'words'
                    ? '20 mots'
                    : '36 signes'}
                </b>
              </div>

              <div className="recognition-model-tabs">
                <button
                  className={recognitionModel === 'words' ? 'is-active' : ''}
                  onClick={() => chooseRecognitionModel('words')}
                >
                  <Film size={17} />
                  Mots ASL
                </button>
                <button
                  className={recognitionModel === 'alphabet' ? 'is-active' : ''}
                  onClick={() => chooseRecognitionModel('alphabet')}
                >
                  <Type size={17} />
                  Alphabet ASL
                </button>
              </div>

              <div className="recognition-source-tabs">
                <button
                  className={recognitionSource === 'camera' ? 'is-active' : ''}
                  onClick={() => chooseRecognitionSource('camera')}
                >
                  <Video size={16} />
                  Caméra
                </button>

                {recognitionModel === 'words' && (
                  <button
                    className={recognitionSource === 'video' ? 'is-active' : ''}
                    onClick={() => chooseRecognitionSource('video')}
                  >
                    <Film size={16} />
                    Vidéo
                  </button>
                )}

                <button
                  className={recognitionSource === 'image' ? 'is-active' : ''}
                  onClick={() => chooseRecognitionSource('image')}
                >
                  <ImageIcon size={16} />
                  Image
                </button>
              </div>

              {recognitionSource !== 'camera' && (
                <>
                  <label className="recognition-dropzone">
                    <input
                      type="file"
                      accept={
                        recognitionModel === 'alphabet'
                          || recognitionSource === 'image'
                          ? 'image/*'
                          : 'video/*'
                      }
                      onChange={(event) => handleFile(event.target.files?.[0])}
                    />
                    <span><Upload size={24} /></span>
                    <strong>
                      {recognitionModel === 'alphabet'
                        ? 'Importer une image de la main'
                        : recognitionSource === 'image'
                          ? 'Importer une image'
                          : 'Importer une vidéo du signe'}
                    </strong>
                    <small>Glissez le fichier ici ou cliquez pour parcourir</small>
                  </label>

                  {recognitionModel === 'words' && recognitionSource === 'image' && (
                    <div className="recognition-warning">
                      <AlertTriangle size={16} />
                      Le mode image est expérimental : le mouvement complet n’est pas visible.
                    </div>
                  )}

                  {recognitionModel === 'alphabet' && (
                    <div className="recognition-tip">
                      <CheckCircle2 size={16} />
                      Cadrez clairement une seule main sur un fond simple.
                    </div>
                  )}
                </>
              )}

              {recognitionSource === 'camera' && (
                <div className="live-capture">
                  <div className="live-capture__preview">
                    {cameraOn ? <video ref={videoRef} autoPlay muted playsInline /> : <Camera size={46} />}
                    {recording && <span className="recording-badge">● ENREGISTREMENT</span>}
                  </div>

                  {recording && (
                    <div className="recording-progress">
                      <i
                        style={{
                          width: `${recordingProgress}%`,
                        }}
                      />
                    </div>
                  )}

                  {cameraOn && (
                    <div
                      className={`motion-detector ${
                        motionDetected
                          ? 'is-active'
                          : ''
                      }`}
                    >
                      <div className="motion-detector__head">
                        <span>
                          Détection du mouvement
                        </span>

                        <strong>
                          {motionScore} %
                        </strong>
                      </div>

                      <div className="motion-detector__bar">
                        <i
                          style={{
                            width: `${motionScore}%`,
                          }}
                        />
                      </div>

                      <p>
                        {motionMessage}
                      </p>
                    </div>
                  )}

                  {cameraError && (
                    <span className="error-text">
                      {cameraError}
                    </span>
                  )}

                  <div className="live-capture__actions">
                    <button
                      className="button button--outline"
                      onClick={cameraOn ? stopCamera : startCamera}
                    >
                      <Camera size={15} />
                      {cameraOn ? 'Fermer la caméra' : 'Activer la caméra'}
                    </button>

                    {recognitionModel === 'words' ? (
                      <button
                        className="button button--dark"
                        disabled={!cameraOn || recording}
                        onClick={recordCamera}
                      >
                        {recording
                          ? <LoaderCircle className="spin" size={15} />
                          : <Video size={15} />}
                        {recording
                          ? 'Enregistrement…'
                          : 'Enregistrer 4 secondes'}
                      </button>
                    ) : (
                      <button
                        className="button button--dark"
                        disabled={!cameraOn}
                        onClick={captureAlphabetPhoto}
                      >
                        <Camera size={15} />
                        Capturer la photo
                      </button>
                    )}
                  </div>
                </div>
              )}

              {selectedFile && previewUrl && (
                <div className="recognition-preview">
                  {selectedFile.type.startsWith('video/')
                    ? <video src={previewUrl} controls preload="metadata" />
                    : <img src={previewUrl} alt="Aperçu du signe importé" />}
                  <div><strong>{selectedFile.name}</strong><span>{(selectedFile.size / 1024 / 1024).toFixed(2)} Mo</span></div>
                </div>
              )}

              <div className="confidence-control">
                <div><span>Confiance minimale</span><strong>{Math.round(threshold * 100)} %</strong></div>
                <input type="range" min="0" max="1" step="0.05" value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} />
              </div>

              {recognitionError && <div className="recognition-error"><AlertTriangle size={16} />{recognitionError}</div>}

              <button className="button button--dark recognition-analyze" disabled={!selectedFile || loading || apiStatus !== 'online'} onClick={analyze}>
                {loading ? <LoaderCircle className="spin" size={16} /> : <RefreshCw size={16} />}
                {loading
                  ? 'Analyse en cours…'
                  : recognitionModel === 'words'
                    ? 'Analyser le signe'
                    : 'Reconnaître le caractère'}
              </button>

              {apiStatus === 'offline' && <p className="api-help">Démarrez le backend FastAPI sur <code>{API_BASE_URL}</code>.</p>}
            </section>

            <section className="recognition-card recognition-card--result">
              <div className="recognition-card__head">
                <div><span className="section-kicker">02 / Résultat</span><h2>Prédiction</h2></div>
                {validFrames !== null && (
                  <b>
                    {recognitionModel === 'words'
                      ? `${validFrames} frames`
                      : '1 image'}
                  </b>
                )}
              </div>

              {!bestPrediction && (
                <div className="recognition-empty"><span>◎</span><strong>Aucun résultat</strong><p>La caméra vérifie d’abord qu’un mouvement réel est présent. Après 4 secondes d’enregistrement, le geste est envoyé automatiquement au modèle IA.</p></div>
              )}

              {bestPrediction && (
                <>
                  <div className={`best-prediction ${accepted ? 'is-accepted' : 'is-rejected'}`}>
                    {accepted ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                    <span>
                      {accepted
                        ? recognitionModel === 'words'
                          ? 'Signe reconnu'
                          : 'Caractère reconnu'
                        : 'Prédiction incertaine'}
                    </span>
                    <h3>
                      {accepted
                        ? recognitionModel === 'alphabet'
                          ? bestPrediction.word.toUpperCase()
                          : bestPrediction.word
                        : 'Non accepté'}
                    </h3>
                    <p>{accepted ? bestPrediction.translation : 'La confiance est inférieure au seuil choisi.'}</p>
                    <strong>{(bestPrediction.confidence * 100).toFixed(2)} %</strong>
                  </div>

                  <div className="top-predictions">
                    <span className="section-kicker">Top 3</span>
                    {predictions.map((prediction, index) => (
                      <article key={prediction.word}>
                        <div><b>0{index + 1}</b><span><strong>{prediction.word}</strong><small>{prediction.translation}</small></span><em>{(prediction.confidence * 100).toFixed(1)} %</em></div>
                        <i><span style={{ width: `${prediction.confidence * 100}%` }} /></i>
                      </article>
                    ))}
                  </div>

                  <button
                    className="button button--outline recognition-add"
                    disabled={!accepted}
                    onClick={addPrediction}
                  >
                    <Plus size={16} />
                    {recognitionModel === 'words'
                      ? 'Ajouter à la phrase'
                      : 'Ajouter au texte'}
                  </button>
                </>
              )}
            </section>
          </div>

          {recognitionModel === 'words' ? (
            <section className="naturalization-card">
              <div className="naturalization-card__head">
                <div>
                  <span className="section-kicker">03 / Naturalisation</span>
                  <h2>Phrase française</h2>
                </div>
                <div className="naturalization-actions">
                  <button
                    disabled={!detectedWords.length}
                    onClick={() => setDetectedWords(
                      (words) => words.slice(0, -1),
                    )}
                  >
                    <Undo2 size={15} />
                    Retirer
                  </button>
                  <button
                    disabled={!detectedWords.length}
                    onClick={() => setDetectedWords([])}
                  >
                    <Trash2 size={15} />
                    Effacer
                  </button>
                </div>
              </div>

              <div className="recognized-sequence">
                {detectedWords.length
                  ? detectedWords.map((word, index) => (
                    <span key={`${word}-${index}`}>{word}</span>
                  ))
                  : <p>Aucun mot ajouté pour le moment.</p>}
              </div>

              <div className="natural-sentence">
                <p>{naturalSentence}</p>
                <div>
                  <button onClick={() => speak(naturalSentence)}>
                    <Volume2 size={16} />
                    Prononcer
                  </button>
                  <button onClick={downloadSentence}>
                    <Download size={16} />
                    Télécharger
                  </button>
                </div>
              </div>

              <p className="naturalization-disclaimer">
                Naturalisation contrôlée avec les 20 classes du modèle.
                Les concepts absents ne sont pas inventés.
              </p>
            </section>
          ) : (
            <section className="naturalization-card alphabet-output-card">
              <div className="naturalization-card__head">
                <div>
                  <span className="section-kicker">03 / Épellation</span>
                  <h2>Texte construit</h2>
                </div>
                <div className="naturalization-actions">
                  <button
                    disabled={!detectedLetters.length}
                    onClick={() => setDetectedLetters(
                      (letters) => letters.slice(0, -1),
                    )}
                  >
                    <Undo2 size={15} />
                    Retirer
                  </button>
                  <button
                    disabled={!detectedLetters.length}
                    onClick={() => setDetectedLetters([])}
                  >
                    <Trash2 size={15} />
                    Effacer
                  </button>
                </div>
              </div>

              <div className="recognized-sequence alphabet-sequence">
                {detectedLetters.length
                  ? detectedLetters.map((letter, index) => (
                    <span key={`${letter}-${index}`}>
                      {letter.toUpperCase()}
                    </span>
                  ))
                  : <p>Aucun caractère ajouté pour le moment.</p>}
              </div>

              <div className="natural-sentence alphabet-sentence">
                <p>{spelledText || 'Votre texte épelé apparaîtra ici.'}</p>
                <div>
                  <button
                    disabled={!spelledText}
                    onClick={() => speak(spelledText)}
                  >
                    <Volume2 size={16} />
                    Prononcer
                  </button>
                  <button
                    disabled={!spelledText}
                    onClick={downloadSentence}
                  >
                    <Download size={16} />
                    Télécharger
                  </button>
                </div>
              </div>

              <p className="naturalization-disclaimer">
                Le modèle Alphabet reconnaît les chiffres 0 à 9 et
                les lettres A à Z à partir d’une image statique.
              </p>
            </section>
          )}
        </>
      )}
    </AppShell>
  );
}
