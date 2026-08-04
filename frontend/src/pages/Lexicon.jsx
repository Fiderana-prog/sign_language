import { ArrowUpRight, Play, Search, Volume2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import AvatarStage from '../components/AvatarStage';
import { CATEGORIES, SIGNS } from '../data/signs';

export default function Lexicon() {
  const [category, setCategory] = useState('Tous');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(SIGNS[0]);
  const [playKey, setPlayKey] = useState(0);

  const filtered = useMemo(() => SIGNS.filter((sign) => {
    const categoryMatch = category === 'Tous' || sign.category === category;
    const queryMatch = sign.word.toLowerCase().includes(query.toLowerCase());
    return categoryMatch && queryMatch;
  }), [category, query]);

  const listen = () => {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(selected.word);
    utterance.lang = 'fr-FR';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <AppShell>
      <div className="page-head page-head--lexicon">
        <div><p className="eyebrow">Bibliothèque / 04</p><h1>Lexique <span>ASL</span></h1><p>Les 20 classes ASL reconnues par le modèle sont reliées aux animations WORD_* du fichier GLB.</p></div>
        <strong>{SIGNS.length} signes disponibles</strong>
      </div>

      <div className="lexicon-search"><Search size={20} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Chercher un signe…" /></div>
      <div className="category-tabs">{CATEGORIES.map((item) => <button key={item} className={category === item ? 'is-active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>

      <div className="lexicon-layout">
        <div className="sign-grid">
          {filtered.map((sign) => (
            <button key={sign.id} className={`sign-card ${selected.id === sign.id ? 'is-selected' : ''}`} onClick={() => setSelected(sign)}>
              <span>{String(sign.id).padStart(2, '0')}</span><ArrowUpRight size={15} />
              <h2>{sign.word}</h2><p>{sign.category} · {sign.level}</p>
            </button>
          ))}
          {filtered.length === 0 && <div className="empty-state">Aucun signe ne correspond à votre recherche.</div>}
        </div>

        <aside className="selected-sign">
          <AvatarStage compact autoplayKey={playKey} animationName={selected.animation} label={`Geste ${String(selected.id).padStart(2, '0')}`} />
          <div className="selected-sign__body">
            <div><span className="section-kicker">Signe sélectionné</span><b>{selected.level}</b></div>
            <h2>{selected.word}</h2>
            <p>{selected.description}</p>
            <blockquote>« {selected.word.toLowerCase()} »</blockquote>
            <div className="control-group"><button className="button button--dark" onClick={() => setPlayKey((n) => n + 1)}><Play size={15} />Rejouer</button><button className="button button--outline" onClick={listen}><Volume2 size={15} />Écouter</button></div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
