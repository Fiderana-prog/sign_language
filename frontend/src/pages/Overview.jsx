import { ArrowRight, BookOpen, Camera, GraduationCap, Languages, Mic, Type } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import AvatarStage from '../components/AvatarStage';

export default function Overview() {
  return (
    <AppShell>
      <div className="page-head">
        <div><p className="eyebrow">Vue d’ensemble / 01</p><h1>Communiquer,<br /><span>autrement.</span></h1></div>
        <p>Une interface unique pour traduire, explorer le lexique LSF et progresser par la pratique.</p>
      </div>
      <div className="overview-grid">
        <section className="overview-feature">
          <div><span className="section-kicker">Aujourd’hui</span><h2>Commencez par une phrase simple.</h2><p>Testez le parcours de démonstration avec le texte, la voix ou la caméra.</p></div>
          <Link className="button button--dark" to="/app/traduire">Ouvrir le traducteur <ArrowRight size={16} /></Link>
          <AvatarStage compact />
        </section>
        <section className="overview-actions">
          <Link to="/app/traduire"><Languages /><div><h3>Traduire</h3><p>Texte, voix et caméra.</p></div><ArrowRight /></Link>
          <Link to="/app/lexique"><BookOpen /><div><h3>Lexique LSF</h3><p>20 signes documentés.</p></div><ArrowRight /></Link>
          <Link to="/app/entrainement"><GraduationCap /><div><h3>S’entraîner</h3><p>Quiz visuel interactif.</p></div><ArrowRight /></Link>
        </section>
      </div>
      <section className="capabilities">
        <article><Type /><h3>Texte</h3><p>Saisissez une phrase puis générez une séquence de démonstration.</p></article>
        <article><Mic /><h3>Voix</h3><p>Utilisez la reconnaissance vocale disponible dans votre navigateur.</p></article>
        <article><Camera /><h3>Caméra</h3><p>Prévisualisez votre webcam et simulez quatre signes contrôlés.</p></article>
      </section>
    </AppShell>
  );
}
