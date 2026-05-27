import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import World from './pages/World';
import MapPage from './pages/Map';
import League from './pages/League';
import Agenda from './pages/Agenda';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import Messages from './pages/Messages';
import Financeiro from './pages/Financeiro';
import Notificacoes from './pages/Notificacoes';
import Seguranca from './pages/Seguranca';
import Configuracoes from './pages/Configuracoes';
import Aparencia from './pages/Aparencia';
import Ajuda from './pages/Ajuda';
import CityPage from './pages/CityPage';
import StatePage from './pages/StatePage';
import BarberSeoPage from './pages/BarberSeoPage';
import ServiceCityPage from './pages/ServiceCityPage';
import NeighborhoodPage from './pages/NeighborhoodPage';
import LeadPage from './pages/LeadPage';
import LeadListPage from './pages/LeadListPage';
import ClaimForm from './pages/ClaimForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/app" element={<Layout />}>
          <Route index element={<World />} />
          <Route path="map" element={<MapPage />} />
          <Route path="league" element={<League />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:id" element={<Profile />} />
          <Route path="messages" element={<Messages />} />
          <Route path="financeiro" element={<Financeiro />} />
          <Route path="notificacoes" element={<Notificacoes />} />
          <Route path="seguranca" element={<Seguranca />} />
          <Route path="configuracoes" element={<Configuracoes />} />
          <Route path="aparencia" element={<Aparencia />} />
          <Route path="ajuda" element={<Ajuda />} />
        </Route>
        {/* SEO / Public Routes */}
        <Route path="/barbearias/:stateSlug" element={<StatePage />} />
        <Route path="/barbearias/:stateSlug/:citySlug" element={<CityPage />} />
        <Route path="/barbearias/:stateSlug/:citySlug/:neighborhoodSlug" element={<NeighborhoodPage />} />
        <Route path="/barbeiro/:slug" element={<BarberSeoPage />} />
        <Route path="/servicos/:service/:stateSlug/:citySlug" element={<ServiceCityPage />} />
        <Route path="/perfil" element={<LeadListPage />} />
        <Route path="/perfil/:slug" element={<LeadPage />} />
        <Route path="/perfil/:slug/reivindicar" element={<ClaimForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
