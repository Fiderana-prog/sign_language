import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Logo({ compact = false, dark = false }) {
  return (
    <Link
      className={`brand ${compact ? 'brand--compact' : ''} ${dark ? 'brand--dark' : ''}`}
      to="/"
      aria-label="Retour à la page d’accueil SignVerse"
    >
      <span className="brand__mark">
        <Sparkles size={compact ? 17 : 20} strokeWidth={2.2} />
      </span>
      <span>
        {!compact && <small>Interface LSF</small>}
        <strong>SignVerse</strong>
      </span>
    </Link>
  );
}
