import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Battle from './pages/Battle';
import MapPage from './pages/Map';
import League from './pages/League';
import Agenda from './pages/Agenda';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Battle />} />
          <Route path="map" element={<MapPage />} />
          <Route path="league" element={<League />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:id" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
