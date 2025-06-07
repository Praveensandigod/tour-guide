
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
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import VerificationSuccessPage from '@/pages/VerificationSuccessPage';
import ProfilePage from '@/pages/ProfilePage';
import SavedPage from '@/pages/SavedPage';
import { Toaster } from '@/components/ui/toaster';
import PlaceDetailPage from '@/pages/PlaceDetailPage';
import BottomNav from '@/components/navigation/BottomNav';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Create QueryClient instance outside component to prevent recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <DestinationProvider>
            <div className="min-h-screen bg-background">
              <Routes>
                {/* Public routes - accessible without authentication */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/verification-success" element={<VerificationSuccessPage />} />
                
                {/* Protected routes - require authentication */}
                <Route path="/search" element={
                  <ProtectedRoute>
                    <SearchResultsPage />
                  </ProtectedRoute>
                } />
                <Route path="/recommendations" element={
                  <ProtectedRoute>
                    <RecommendationsPage />
                  </ProtectedRoute>
                } />
                <Route path="/destinations/:id" element={
                  <ProtectedRoute>
                    <DestinationDetailPage />
                  </ProtectedRoute>
                } />
                <Route path="/map" element={
                  <ProtectedRoute>
                    <MapPage />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="/saved" element={
                  <ProtectedRoute>
                    <SavedPage />
                  </ProtectedRoute>
                } />
                <Route path="/places/:id" element={
                  <ProtectedRoute>
                    <PlaceDetailPage />
                  </ProtectedRoute>
                } />
              </Routes>
              <BottomNav />
              <Toaster />
            </div>
          </DestinationProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
