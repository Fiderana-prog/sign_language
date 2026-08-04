import { BookOpen, GraduationCap, Home, Languages, Menu, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import Logo from './Logo';

const links = [
  { to: '/app', label: 'Vue d’ensemble', icon: Home, end: true },
  { to: '/app/traduire', label: 'Traduire', icon: Languages },
  { to: '/app/lexique', label: 'Lexique LSF', icon: BookOpen },
  { to: '/app/entrainement', label: 'S’entraîner', icon: GraduationCap },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="mobile-menu" onClick={() => setOpen(true)} aria-label="Ouvrir la navigation">
        <Menu size={22} />
      </button>
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        <button className="sidebar__close" onClick={() => setOpen(false)} aria-label="Fermer la navigation"><X /></button>
        <Logo />
        <p className="sidebar__label">Navigation</p>
        <nav className="sidebar__nav">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `sidebar__link ${isActive ? 'is-active' : ''}`}
            >
              <Icon size={19} strokeWidth={1.9} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__footer">
          <div className="prototype-icon">◎</div>
          <div><strong>Mode prototype</strong><span>ASL · Français</span></div>
        </div>
      </aside>
      {open && <button className="sidebar-backdrop" onClick={() => setOpen(false)} aria-label="Fermer" />}
    </>
  );
}
