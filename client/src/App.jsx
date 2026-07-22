import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TravelProvider } from "./context/TravelContext";
import Header from "./components/Header";
import Notification from "./components/Notification";
import HomePage from "./pages/HomePage";
import CreateGroupPage from "./pages/CreateGroupPage";
import GroupDashboard from "./pages/GroupDashboard";
import ItineraryPage from "./pages/ItineraryPage";
import DiscoverPage from "./pages/DiscoverPage";

export default function App() {
  return (
    <BrowserRouter>
      <TravelProvider>
        <div className="min-h-screen bg-slate-50">
          <Header />
          <Notification />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/create" element={<CreateGroupPage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/groups/:id" element={<GroupDashboard />} />
              <Route path="/groups/:id/itinerary" element={<ItineraryPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </TravelProvider>
    </BrowserRouter>
  );
}
