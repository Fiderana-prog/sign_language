import { Navigate, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing';
import Overview from './pages/Overview';
import Translate from './pages/Translate';
import Lexicon from './pages/Lexicon';
import Training from './pages/Training';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/app" element={<Overview />} />
      <Route path="/app/traduire" element={<Translate />} />
      <Route path="/app/lexique" element={<Lexicon />} />
      <Route path="/app/entrainement" element={<Training />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
