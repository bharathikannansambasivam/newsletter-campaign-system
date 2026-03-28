import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import CreateCampaign from "./pages/CreateCampaign";
import CampaignStats from "./pages/CampaignStats";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Subscribe from "./pages/Subscribe";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-campaign" element={<CreateCampaign />} />
        <Route path="/campaign/:id/stats" element={<CampaignStats />} />
        <Route path="/subscribe/:company" element={<Subscribe />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
