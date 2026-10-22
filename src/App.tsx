import { lazy, Suspense, useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PageLoader } from "@/components/layout/PageLoader";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { setAuthExpiredHandler } from "@/api/client";

const Index = lazy(() => import("./pages/Index"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const ListProperty = lazy(() => import("./pages/ListProperty"));
const ListPropertyInfo = lazy(() => import("./pages/ListPropertyInfo"));
const ListingVerification = lazy(() => import("./pages/ListingVerification"));
const ListingDetail = lazy(() => import("./pages/ListingDetail"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Auth = lazy(() => import("./pages/Auth"));
const OAuthCallback = lazy(() => import("./pages/OAuthCallback"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Contact = lazy(() => import("./pages/Contact"));
const MyListings = lazy(() => import("./pages/MyListings"));
const MyProfile = lazy(() => import("./pages/MyProfile"));
const EditListing = lazy(() => import("./pages/EditListing"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Bookings = lazy(() => import("./pages/Bookings"));
const BookingDetail = lazy(() => import("./pages/BookingDetail"));
const ListingBookings = lazy(() => import("./pages/ListingBookings"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const withSuspense = (Component: React.LazyExoticComponent<() => JSX.Element | null>) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

function AuthExpiredListener() {
  const navigate = useNavigate();
  useEffect(() => {
    setAuthExpiredHandler(() => navigate("/auth", { replace: true }));
  }, [navigate]);
  return null;
}

const protectedElement = (
  Component: React.LazyExoticComponent<() => JSX.Element | null>,
  opts: { requireLandlord?: boolean; authRedirectTo?: string } = {},
) => (
  <ProtectedRoute
    requireLandlord={opts.requireLandlord}
    authRedirectTo={opts.authRedirectTo}
  >
    {withSuspense(Component)}
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Sonner />
          <BrowserRouter>
            <AuthExpiredListener />
            <Routes>
              <Route path="/" element={withSuspense(Index)} />
              <Route path="/search" element={withSuspense(SearchResults)} />
              <Route path="/list-property-info" element={withSuspense(ListPropertyInfo)} />
              <Route path="/list-property" element={protectedElement(ListProperty, { requireLandlord: true, authRedirectTo: "/list-property-info" })} />
              <Route path="/listings/:id" element={withSuspense(ListingDetail)} />
              <Route path="/listings/:listingId/verification" element={protectedElement(ListingVerification, { requireLandlord: true })} />
              <Route path="/how-it-works" element={withSuspense(HowItWorks)} />
              <Route path="/auth" element={withSuspense(Auth)} />
              <Route path="/auth/callback" element={withSuspense(OAuthCallback)} />
              <Route path="/forgot-password" element={withSuspense(ForgotPassword)} />
              <Route path="/reset-password" element={withSuspense(ResetPassword)} />
              <Route path="/verify-email" element={withSuspense(VerifyEmail)} />
              <Route path="/privacy-policy" element={withSuspense(PrivacyPolicy)} />
              <Route path="/terms-of-service" element={withSuspense(TermsOfService)} />
              <Route path="/contact" element={withSuspense(Contact)} />
              <Route path="/my-listings" element={protectedElement(MyListings, { requireLandlord: true })} />
              <Route path="/listings/:id/edit" element={protectedElement(EditListing, { requireLandlord: true })} />
              <Route path="/profile" element={protectedElement(MyProfile)} />
              <Route path="/my-favorites" element={protectedElement(Favorites)} />
              <Route path="/bookings" element={protectedElement(Bookings)} />
              <Route path="/bookings/:id" element={protectedElement(BookingDetail)} />
              <Route path="/listings/:id/bookings" element={protectedElement(ListingBookings, { requireLandlord: true })} />
              <Route path="*" element={withSuspense(NotFound)} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
