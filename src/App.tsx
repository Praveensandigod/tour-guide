
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DestinationProvider } from "@/contexts/DestinationContext";

// Layouts
import AppLayout from "./components/layout/AppLayout";

// Pages
import HomePage from "./pages/HomePage";
import RecommendationsPage from "./pages/RecommendationsPage";
import MapPage from "./pages/MapPage";
import SavedPage from "./pages/SavedPage";
import ProfilePage from "./pages/ProfilePage";
import SearchResultsPage from "./pages/SearchResultsPage";
import DestinationDetailPage from "./pages/DestinationDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";
import VerificationSuccessPage from "./pages/VerificationSuccessPage";
import AccountDeletedPage from "./pages/AccountDeletedPage";

// Initialize the query client
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DestinationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<HomePage />} />
                <Route path="recommendations" element={<RecommendationsPage />} />
                <Route path="map" element={<MapPage />} />
                <Route path="saved" element={<SavedPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="search" element={<SearchResultsPage />} />
                <Route path="destinations/:id" element={<DestinationDetailPage />} />
              </Route>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verification-success" element={<VerificationSuccessPage />} />
              <Route path="/account-deleted" element={<AccountDeletedPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DestinationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
