

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BookOpenIcon,
  CircleUserRoundIcon,
  GraduationCapIcon,
  HomeIcon,
  LanguagesIcon,
  SparklesIcon } from
'lucide-react';

const NAV = [
{ to: '/', label: 'Vue d’ensemble', icon: HomeIcon, end: true },
{ to: '/studio', label: 'Traduire', icon: LanguagesIcon, end: false },
{ to: '/dictionnaire', label: 'Lexique LSF', icon: BookOpenIcon, end: false },
{ to: '/apprendre', label: 'S’entraîner', icon: GraduationCapIcon, end: false }];


export function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-[68px] shrink-0 flex-col border-r border-zinc-200 bg-white px-3 py-5 md:w-60 md:px-5">
      <div className="mb-10 flex items-center gap-3">
        <div className="sv-mark flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white">
          <SparklesIcon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="hidden md:block">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-600">Interface LSF</p>
          <p className="text-lg font-extrabold tracking-[-0.06em] text-zinc-950">SignVerse</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5" aria-label="Navigation principale">
        <p className="mb-2 hidden px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 md:block">Navigation</p>
        {NAV.map(({ to, label, icon: Icon, end }) =>
        <NavLink
          key={to}
          to={to}
          end={end}
          title={label}
          className={({ isActive }) =>
          [
          'group flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-semibold transition-all',
          isActive ?
          'bg-zinc-950 text-white shadow-[0_8px_20px_rgba(24,24,27,0.12)]' :
          'text-zinc-500 hover:bg-violet-50 hover:text-violet-700'].
          join(' ')
          }>
          
            <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            <span className="hidden md:block">{label}</span>
          </NavLink>
        )}
      </nav>

      <div className="hidden border-t border-zinc-200 pt-4 md:block">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-700">
            <CircleUserRoundIcon className="h-4 w-4" />
          </div>
          <div className="text-xs leading-tight">
            <p className="font-bold text-zinc-900">Mode prototype</p>
            <p className="text-zinc-400">LSF · Français</p>
          </div>
        </div>
      </div>
    </aside>);

}