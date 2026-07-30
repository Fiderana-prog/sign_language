
import React, { useMemo, useState } from 'react';
import { ArrowUpRightIcon, PlayIcon, SearchIcon, Volume2Icon } from 'lucide-react';
import { SigningAvatar } from '../components/SigningAvatar';
import { CATEGORIES, SIGNS, type Sign, type SignCategory } from '../data/signs';
import { speak, speechSynthesisSupported } from '../hooks/useSpeech';

export function Dictionary() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SignCategory | 'Tous'>('Tous');
  const [selected, setSelected] = useState<Sign>(SIGNS[0]);
  const [playing, setPlaying] = useState(true);

  const filtered = useMemo(() => SIGNS.filter((sign) => {
    const q = query.toLowerCase().trim();
    return (category === 'Tous' || sign.category === category) && (!q || sign.label.toLowerCase().includes(q) || sign.definition.toLowerCase().includes(q));
  }), [query, category]);

  const select = (sign: Sign) => {setSelected(sign);setPlaying(false);setTimeout(() => setPlaying(true), 30);};

  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 py-10 lg:px-12">
      <header className="grid gap-6 border-b border-zinc-200 pb-8 md:grid-cols-[1fr_auto] md:items-end">
        <div><p className="sv-kicker">Bibliothèque / 04</p><h1 className="mt-4 text-4xl font-extrabold tracking-[-0.07em] text-zinc-950 md:text-6xl">Lexique <span className="text-violet-600">LSF</span></h1><p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-500">Chaque signe est documenté pour apprendre, répéter et communiquer avec plus d’assurance.</p></div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">{filtered.length} signes disponibles</p>
      </header>

      <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_350px]">
        <div>
          <div className="relative border-b border-zinc-300 pb-3"><SearchIcon className="absolute left-0 top-0 h-5 w-5 text-violet-600" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Chercher un signe…" className="w-full bg-transparent pl-8 text-lg font-medium text-zinc-950 outline-none placeholder:text-zinc-400" aria-label="Rechercher un signe" /></div>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3">{(['Tous', ...CATEGORIES] as const).map((item) => <button key={item} onClick={() => setCategory(item)} className={`border-b pb-1 text-xs font-bold uppercase tracking-[0.13em] transition-colors ${category === item ? 'border-violet-600 text-violet-700' : 'border-transparent text-zinc-400 hover:text-zinc-900'}`}>{item}</button>)}</div>
          <div className="mt-9 grid border-l border-t border-zinc-200 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((sign, index) => <button key={sign.word} onClick={() => select(sign)} className={`min-h-48 border-b border-r border-zinc-200 p-5 text-left transition-colors ${selected.word === sign.word ? 'bg-violet-50' : 'bg-white hover:bg-zinc-50'}`}><div className="flex justify-between"><span className="font-mono text-[10px] text-violet-600">{String(index + 1).padStart(2, '0')}</span><ArrowUpRightIcon className="h-4 w-4 text-zinc-400" /></div><h2 className="mt-10 text-xl font-bold tracking-[-0.045em] text-zinc-950">{sign.label}</h2><p className="mt-2 text-xs font-medium text-zinc-400">{sign.category} · {sign.difficulty}</p></button>)}{!filtered.length && <p className="col-span-full border-b border-r border-zinc-200 p-10 text-sm text-zinc-500">Aucun signe ne correspond à cette recherche.</p>}</div>
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start"><div className="overflow-hidden border border-zinc-200 bg-white"><div className="aspect-square border-b border-zinc-200 bg-[#f5efff]"><SigningAvatar poses={selected.poses} playing={playing} speed={1} rotation={0} zoom={1.06} onEnd={() => setPlaying(false)} /></div><div className="p-5"><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-violet-600">Signe sélectionné</p><h2 className="mt-2 text-3xl font-extrabold tracking-[-0.06em] text-zinc-950">{selected.label}</h2></div><span className="border border-zinc-200 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">{selected.difficulty}</span></div><p className="mt-4 text-sm leading-relaxed text-zinc-500">{selected.definition}</p><p className="mt-4 border-l-2 border-violet-500 pl-3 text-sm italic leading-relaxed text-zinc-600">« {selected.example} »</p><div className="mt-5 flex gap-2"><button onClick={() => select(selected)} className="sv-primary-button !rounded-none !px-3 !py-2 !text-xs"><PlayIcon className="h-3.5 w-3.5" /> Rejouer</button><button onClick={() => speechSynthesisSupported() && speak(selected.label)} className="inline-flex items-center gap-2 border border-zinc-300 px-3 py-2 text-xs font-bold text-zinc-700 hover:border-violet-500 hover:text-violet-700"><Volume2Icon className="h-3.5 w-3.5" /> Écouter</button></div></div></div></aside>
      </div>
    </div>);

}