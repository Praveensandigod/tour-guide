
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { DestinationProvider } from '@/contexts/DestinationContext';
import HomePage from '@/pages/HomePage';
import SearchResultsPage from '@/pages/SearchResultsPage';
import RecommendationsPage from '@/pages/RecommendationsPage';
import DestinationDetailPage from '@/pages/DestinationDetailPage';
import MapPage from '@/pages/MapPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ProfilePage from '@/pages/ProfilePage';
import SavedPage from '@/pages/SavedPage';
import { Toaster } from '@/components/ui/toaster';
import PlaceDetailPage from '@/pages/PlaceDetailPage';
import BottomNav from '@/components/navigation/BottomNav';

function App() {
  return (
    <Router>
      <QueryClientProvider client={new QueryClient()}>
        <AuthProvider>
          <DestinationProvider>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/recommendations" element={<RecommendationsPage />} />
                <Route path="/destinations/:id" element={<DestinationDetailPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<RegisterPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/saved" element={<SavedPage />} />
                <Route path="/places/:id" element={<PlaceDetailPage />} />
              </Routes>
              <BottomNav />
              <Toaster />
            </div>
          </DestinationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
