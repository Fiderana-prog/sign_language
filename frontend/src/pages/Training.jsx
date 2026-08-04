import { Check, RotateCcw, X } from 'lucide-react';
import { useState } from 'react';
import AppShell from '../components/AppShell';
import AvatarStage from '../components/AvatarStage';
import { QUIZ } from '../data/signs';

export default function Training() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [done, setDone] = useState(false);
  const current = QUIZ[index];

  const choose = (value) => {
    if (answer) return;
    setAnswer(value);
    if (value === current.sign) setScore((s) => s + 1);
    window.setTimeout(() => {
      if (index === QUIZ.length - 1) setDone(true);
      else {
        setIndex((i) => i + 1);
        setAnswer(null);
      }
    }, 850);
  };

  const reset = () => {
    setIndex(0); setScore(0); setAnswer(null); setDone(false);
  };

  return (
    <AppShell>
      <div className="page-head page-head--training">
        <div><p className="eyebrow">Apprentissage / 05</p><h1>Lire le <span>geste.</span></h1></div>
        <p className="score-label">SCORE / {String(score).padStart(2, '0')}</p>
      </div>
      <div className="quiz-progress"><i style={{ width: `${done ? 100 : ((index + 1) / QUIZ.length) * 100}%` }} /><span>{String(Math.min(index + 1, QUIZ.length)).padStart(2, '0')} / {String(QUIZ.length).padStart(2, '0')}</span></div>

      {!done ? (
        <section className="quiz-card">
          <div className="quiz-card__visual"><span>Observer la séquence</span><AvatarStage compact animationName={current.animation} autoplayKey={index + 1} label={`Geste ${String(index + 1).padStart(2, '0')}`} /></div>
          <div className="quiz-card__questions">
            <span className="section-kicker">Question {String(index + 1).padStart(2, '0')}</span>
            <h2>Quel signe voyez-vous ?</h2>
            <div className="quiz-answers">
              {current.answers.map((item, itemIndex) => {
                const isRight = answer && item === current.sign;
                const isWrong = answer === item && item !== current.sign;
                return <button key={item} className={`${isRight ? 'is-right' : ''} ${isWrong ? 'is-wrong' : ''}`} onClick={() => choose(item)}><span>{String(itemIndex + 1).padStart(2, '0')}</span><b>{item}</b>{isRight && <Check />}{isWrong && <X />}</button>;
              })}
            </div>
          </div>
        </section>
      ) : (
        <section className="quiz-result">
          <div className="result-ring"><strong>{score}</strong><span>/ {QUIZ.length}</span></div>
          <p className="eyebrow">Session terminée</p>
          <h2>{score >= 4 ? 'Excellent travail !' : score >= 3 ? 'Bonne progression.' : 'Continuez à pratiquer.'}</h2>
          <p>Vous avez reconnu {score} signe{score > 1 ? 's' : ''} sur {QUIZ.length}.</p>
          <button className="button button--dark" onClick={reset}><RotateCcw size={16} />Recommencer</button>
        </section>
      )}
    </AppShell>
  );
}
