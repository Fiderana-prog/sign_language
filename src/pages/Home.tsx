import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownRightIcon, ArrowUpRightIcon, CircleIcon, MenuIcon } from 'lucide-react';
import { SigningAvatar } from '../components/SigningAvatar';
import { glossToPoses, textToGloss } from '../data/signs';

const TRANSLATION_STEPS = [
{ number: '01', title: 'Expression', copy: 'Votre phrase est comprise et découpée en unités de sens.' },
{ number: '02', title: 'Gloss LSF', copy: 'Le moteur prépare une séquence de signes claire et contextualisée.' },
{ number: '03', title: 'Mouvement', copy: 'L’interprète virtuel guide la conversation, geste après geste.' }];


export function Home() {
  const demoPoses = glossToPoses(textToGloss('bonjour comment allez-vous'));

  return (
    <div className="sv-landing min-h-screen bg-[#fcfcfb] text-zinc-950">
      <header className="relative z-20 mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 md:px-10">
        <Link to="/" className="flex items-center gap-2" aria-label="SignVerse, accueil">
          <span className="text-sm font-extrabold tracking-[-0.08em]">SIGNVERSE</span>
          <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-violet-600" />
        </Link>
        <button className="group inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-700" aria-label="Ouvrir le menu">
          <span className="hidden sm:inline">Explorer</span><MenuIcon className="h-4 w-4 transition-transform group-hover:rotate-90" />
        </button>
      </header>

      <main>
        <section className="relative mx-auto min-h-[680px] max-w-[1600px] overflow-hidden px-6 pb-14 pt-8 md:px-10 lg:min-h-[720px]">
          <div className="absolute left-[52%] top-[47%] h-[min(68vw,670px)] w-[min(68vw,670px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-200" />
          <div className="absolute left-[52%] top-[47%] h-[min(52vw,510px)] w-[min(52vw,510px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-100" />
          <span className="absolute left-[20%] top-[21%] h-16 w-16 rounded-full bg-violet-600 md:h-24 md:w-24" />
          <span className="absolute left-[16%] top-[18%] font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-violet-700">Langage / lien / liberté</span>

          <div className="relative z-10 grid min-h-[590px] items-center gap-10 lg:grid-cols-[.72fr_1.26fr_.72fr]">
            <div className="order-2 max-w-xs self-center lg:order-1 lg:pt-32">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-400">Pourquoi SignVerse</p>
              <h1 className="mt-4 text-[clamp(2.2rem,3.5vw,3.6rem)] font-extrabold leading-[.9] tracking-[-0.075em] text-zinc-950">La traduction qui se voit.</h1>
              <div className="mt-8 flex gap-4 text-[10px] font-medium leading-relaxed text-zinc-500">
                <div className="flex flex-col gap-2 font-mono uppercase tracking-wider text-zinc-400"><span>Texte</span><span>Voix</span><span>Signes</span></div>
                <p className="max-w-[190px]">Une expérience de communication conçue pour rendre chaque échange plus immédiat et plus inclusif.</p>
              </div>
              <Link to="/studio" className="mt-8 inline-flex items-center gap-2 rounded-full border border-zinc-900 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors hover:bg-zinc-950 hover:text-white">Essayer la traduction <ArrowUpRightIcon className="h-3.5 w-3.5" /></Link>
            </div>

            <div className="order-1 relative mx-auto h-[420px] w-full max-w-[590px] sm:h-[530px] lg:order-2 lg:h-[620px]">
              <div className="absolute inset-0"><SigningAvatar poses={demoPoses} playing speed={0.8} rotation={0} zoom={1.06} /></div>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-white/90 px-4 py-2 text-[10px] font-semibold text-zinc-600 shadow-sm ring-1 ring-zinc-200 backdrop-blur"><CircleIcon className="h-2 w-2 fill-violet-600 text-violet-600" /> Traduction en cours : « Bonjour, comment allez-vous ? »</div>
            </div>

            <div className="order-3 self-center lg:pt-36">
              <div className="ml-auto max-w-[200px] border-l border-zinc-300 pl-4">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700">Interprète numérique</p>
                <p className="mt-3 text-xs leading-relaxed text-zinc-500">Un avatar expressif avec les mains toujours visibles : le message reste au centre de l’échange.</p>
              </div>
              <Link to="/dictionnaire" className="ml-auto mt-10 flex w-fit items-center gap-2 rounded-full bg-zinc-950 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-violet-700">Voir le lexique <ArrowDownRightIcon className="h-3.5 w-3.5" /></Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1600px] px-3 pb-3 md:px-6">
          <div className="overflow-hidden rounded-[1.35rem] border border-zinc-200 bg-white">
            <div className="grid border-b border-zinc-200 px-6 py-5 md:grid-cols-[.55fr_1.5fr] md:px-8">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700">Le protocole SignVerse</p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500 md:mt-0">Une traduction assistée, guidée par un vocabulaire de signes et présentée par un interprète visuel, pour transformer une phrase en compréhension partagée.</p>
            </div>
            <div className="grid md:grid-cols-3">{TRANSLATION_STEPS.map((step) => <article key={step.number} className="min-h-44 border-b border-zinc-200 px-6 py-6 last:border-b-0 md:border-b-0 md:border-r md:px-8 md:last:border-r-0"><p className="font-mono text-3xl tracking-[-.08em] text-zinc-950">{step.number}</p><h2 className="mt-5 text-base font-extrabold tracking-[-.045em] text-zinc-950">{step.title}</h2><p className="mt-2 max-w-xs text-xs leading-relaxed text-zinc-500">{step.copy}</p></article>)}</div>
          </div>
        </section>
      </main>
    </div>);

}