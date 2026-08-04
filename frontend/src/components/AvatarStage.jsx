import {
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  ZoomIn,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import HandModel3D from './HandModel3D';

const PREFERRED_ANIMATION = 'TEST_FINGER_FLEX';

function displayAnimationName(name) {
  if (!name) return 'Animation';

  return name
    .replaceAll('_', ' ')
    .replace(/\.(\d+)$/, ' $1');
}

export default function AvatarStage({
  label = 'Aperçu 3D',
  compact = false,
  autoplayKey = 0,
}) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [zoom, setZoom] = useState(1);

  const [animations, setAnimations] = useState([]);
  const [selectedAnimation, setSelectedAnimation] = useState(
    PREFERRED_ANIMATION,
  );
  const [duration, setDuration] = useState(2.3);

  const selectedLabel = useMemo(
    () => displayAnimationName(selectedAnimation),
    [selectedAnimation],
  );

  const handleAnimationsReady = useCallback(
    (animationNames) => {
      setAnimations(animationNames);

      setSelectedAnimation((current) => {
        if (animationNames.includes(current)) {
          return current;
        }

        if (animationNames.includes(PREFERRED_ANIMATION)) {
          return PREFERRED_ANIMATION;
        }

        return animationNames[0] || '';
      });
    },
    [],
  );

  const handleDurationChange = useCallback(
    (nextDuration) => {
      setDuration(
        Math.max(nextDuration || 0, 0.1),
      );
    },
    [],
  );

  useEffect(() => {
    if (autoplayKey <= 0) return;

    setProgress(0);
    setPlaying(true);
  }, [autoplayKey]);

  useEffect(() => {
    if (!playing) return undefined;

    const intervalMilliseconds = 33;

    const timer = window.setInterval(() => {
      setProgress((value) => {
        const increment = (
          intervalMilliseconds
          / (duration * 1000)
          * 100
          * speed
        );

        const next = value + increment;

        if (next >= 100) {
          setPlaying(false);
          return 100;
        }

        return next;
      });
    }, intervalMilliseconds);

    return () => window.clearInterval(timer);
  }, [duration, playing, speed]);

  const togglePlayback = () => {
    if (progress >= 100) {
      setProgress(0);
      setPlaying(true);
      return;
    }

    setPlaying((value) => !value);
  };

  const replay = () => {
    setProgress(0);
    setPlaying(true);
  };

  const changeAnimation = (event) => {
    setSelectedAnimation(event.target.value);
    setProgress(0);
    setPlaying(false);
  };

  return (
    <section
      className={`avatar-stage ${
        compact
          ? 'avatar-stage--compact'
          : ''
      }`}
    >
      <div className="avatar-stage__label">
        Mains 3D riggées / SignVerse
      </div>

      <div className="avatar-stage__badge">
        Rig · 34 os
      </div>

      <div className="corner corner--tl" />
      <div className="corner corner--tr" />

      <div className="avatar-stage__image">
        <HandModel3D
          playing={playing}
          progress={progress}
          speed={speed}
          zoom={zoom}
          compact={compact}
          animationName={selectedAnimation}
          onAnimationsReady={handleAnimationsReady}
          onDurationChange={handleDurationChange}
        />
      </div>

      <div className="avatar-stage__progress">
        <span>{label}</span>

        <div>
          <i
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <span>{Math.round(progress)}%</span>
      </div>

      {!compact && (
        <div className="avatar-stage__animation-row">
          <label htmlFor="signverse-animation">
            Animation du fichier GLB
          </label>

          <select
            id="signverse-animation"
            value={selectedAnimation}
            onChange={changeAnimation}
            disabled={!animations.length}
          >
            {!animations.length && (
              <option value="">
                Chargement…
              </option>
            )}

            {animations.map((animation) => (
              <option
                key={animation}
                value={animation}
              >
                {displayAnimationName(animation)}
              </option>
            ))}
          </select>
        </div>
      )}

      {!compact && (
        <div className="avatar-stage__controls">
          <div className="control-group">
            <button
              className="button button--dark"
              onClick={togglePlayback}
              disabled={!animations.length}
            >
              {playing
                ? <Pause size={16} />
                : <Play size={16} />}

              {playing
                ? 'Pause'
                : progress > 0 && progress < 100
                  ? 'Continuer'
                  : 'Lire'}
            </button>

            <button
              className="button button--outline"
              onClick={replay}
              disabled={!animations.length}
            >
              <RotateCcw size={16} />
              Rejouer
            </button>
          </div>

          <div className="control-group control-group--icons">
            <button
              onClick={() => setZoom(
                (value) => Math.max(
                  0.85,
                  value - 0.05,
                ),
              )}
              aria-label="Réduire"
            >
              <Minus size={16} />
            </button>

            <button
              onClick={() => setZoom(1)}
              aria-label="Réinitialiser le zoom"
            >
              <RotateCcw size={16} />
            </button>

            <button
              onClick={() => setZoom(
                (value) => Math.min(
                  1.18,
                  value + 0.05,
                ),
              )}
              aria-label="Agrandir"
            >
              <Plus size={16} />
            </button>

            <button
              onClick={() => setZoom(1.1)}
              aria-label="Zoom rapide"
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </div>
      )}

      {!compact && (
        <>
          <div className="avatar-stage__speed">
            <span>
              {selectedLabel}
              {' · '}
              {duration.toFixed(2)} s
            </span>

            <button
              onClick={() => setSpeed(
                speed === 1
                  ? 0.75
                  : speed === 0.75
                    ? 1.25
                    : 1,
              )}
            >
              {speed}×
            </button>
          </div>

          <p className="avatar-stage__limitation">
            Les articulations utilisent maintenant le squelette
            du fichier GLB. Les animations présentes sont des
            animations de test. Pour traduire précisément A à Z
            ou chaque mot, il faudra ajouter un clip nommé pour
            chaque signe dans Blender.
          </p>
        </>
      )}
    </section>
  );
}
