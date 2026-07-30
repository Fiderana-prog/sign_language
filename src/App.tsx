
import React from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { Studio } from './pages/Studio';
import { Dictionary } from './pages/Dictionary';
import { Learn } from './pages/Learn';

function AppRoutes() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div className="sv-app flex min-h-screen w-full bg-white text-zinc-950">
      {!isLanding && <Sidebar />}
      <main className="min-w-0 flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/dictionnaire" element={<Dictionary />} />
          <Route path="/apprendre" element={<Learn />} />
        </Routes>
      </main>
    </div>);

}

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>);

}