import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { DestinationProvider } from '@/contexts/DestinationContext';
import HomePage from '@/pages/HomePage';
import SearchResultsPage from '@/pages/SearchResultsPage';
import RecommendationsPage from '@/pages/RecommendationsPage';
import DestinationDetailPage from '@/pages/DestinationDetailPage';
import MapPage from '@/pages/MapPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ProfilePage from '@/pages/ProfilePage';
import { Toaster } from '@/components/ui/toaster';
import PlaceDetailPage from '@/pages/PlaceDetailPage';

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
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/places/:id" element={<PlaceDetailPage />} />
              </Routes>
              <Toaster />
            </div>
          </DestinationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
