import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import World from './pages/World';
import MapPage from './pages/Map';
import League from './pages/League';
import Agenda from './pages/Agenda';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import Messages from './pages/Messages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<World />} />
          <Route path="map" element={<MapPage />} />
          <Route path="league" element={<League />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:id" element={<Profile />} />
          <Route path="messages" element={<Messages />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
