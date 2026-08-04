import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Home,
  Languages,
  Menu,
  MoveRight,
  Workflow,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const navigationItems = [
  { label: 'Vue d’ensemble', to: '/app', icon: Home },
  { label: 'Traduire', to: '/app/traduire', icon: Languages },
  { label: 'Lexique LSF', to: '/app/lexique', icon: BookOpen },
  { label: 'S’entraîner', to: '/app/entrainement', icon: GraduationCap },
];

export default function Landing() {
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    const closeOnOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('keydown', closeOnEscape);
    document.addEventListener('pointerdown', closeOnOutsideClick);

    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('pointerdown', closeOnOutsideClick);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="landing landing--image-background">
      <header className="landing__header">
        <Logo compact />

        <div ref={menuRef} className="landing-menu">
          <button
            className="landing-menu__trigger"
            type="button"
            aria-label={menuOpen ? 'Fermer le menu de navigation' : 'Ouvrir le menu de navigation'}
            aria-expanded={menuOpen}
            aria-controls="landing-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span>Explorer</span>
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>

          <div
            id="landing-navigation"
            className={`landing-menu__panel ${menuOpen ? 'is-open' : ''}`}
            aria-hidden={!menuOpen}
          >
            <div className="landing-menu__head">
              <div>
                <span>Navigation</span>
                <strong>Découvrir SignVerse</strong>
              </div>
              <button type="button" onClick={closeMenu} aria-label="Fermer le menu">
                <X size={20} />
              </button>
            </div>

            <nav aria-label="Navigation principale">
              {navigationItems.map(({ label, to, icon: Icon }, index) => (
                <Link key={to} to={to} onClick={closeMenu}>
                  <span className="landing-menu__number">0{index + 1}</span>
                  <Icon size={20} />
                  <strong>{label}</strong>
                  <ArrowRight size={18} />
                </Link>
              ))}

              <a href="#protocole" onClick={closeMenu}>
                <span className="landing-menu__number">05</span>
                <Workflow size={20} />
                <strong>Le protocole</strong>
                <ArrowRight size={18} />
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="hero hero--image-background">
        <div className="hero__rings" aria-hidden="true" />
        <div className="hero__image-layer" aria-hidden="true">
          <img src="/assets/dna-hq.png" alt="" />
        </div>
        <div className="hero__image-glow" aria-hidden="true" />

        <section className="hero__copy">
          <div className="hero__badge">
            <span>Langage / lien / liberté</span>
            <i />
          </div>
          <p className="eyebrow">Pourquoi SignVerse</p>
          <h1>La traduction<br />qui se voit.</h1>
          <div className="hero__meta">
            <div>
              <span>Texte</span>
              <span>Voix</span>
              <span>Signes</span>
            </div>
            <p>Une expérience de communication conçue pour rendre chaque échange plus immédiat et plus inclusif.</p>
          </div>
          <Link className="button button--hero" to="/app/traduire">
            Essayer la traduction <ArrowRight size={19} />
          </Link>
        </section>

        <aside className="hero__note">
          <p>Interprète numérique</p>
          <span>Un avatar expressif avec les mains toujours visibles : le message reste au centre de l’échange.</span>
          <Link className="button button--dark" to="/app/lexique">
            Voir le lexique <MoveRight size={19} />
          </Link>
        </aside>

        <div className="hero__live">
          <span>Geste 12</span>
          <i />
          <p><b />Traduction en cours : « Bonjour, comment allez-vous ? »</p>
        </div>
      </main>

      <section id="protocole" className="protocol">
        <div className="protocol__intro">
          <p>Le protocole SignVerse</p>
          <span>Une traduction assistée, guidée par un vocabulaire de signes et présentée par un interprète visuel, pour transformer une phrase en compréhension partagée.</span>
        </div>
        <div className="protocol__steps">
          <article><b>01</b><h2>Expression</h2><p>Votre phrase est comprise et découpée en unités de sens.</p></article>
          <article><b>02</b><h2>Gloss LSF</h2><p>Le moteur prépare une séquence de signes claire et contextualisée.</p></article>
          <article><b>03</b><h2>Mouvement</h2><p>L’interprète virtuel guide la conversation, geste après geste.</p></article>
        </div>
      </section>
    </div>
  );
}
