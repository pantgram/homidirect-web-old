import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PageLoader } from "@/components/layout/PageLoader";

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

const queryClient = new QueryClient();

const withSuspense = (Component: React.LazyExoticComponent<() => JSX.Element | null>) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={withSuspense(Index)} />
              <Route path="/search" element={withSuspense(SearchResults)} />
              <Route path="/list-property-info" element={withSuspense(ListPropertyInfo)} />
              <Route path="/list-property" element={withSuspense(ListProperty)} />
              <Route path="/listings/:id" element={withSuspense(ListingDetail)} />
              <Route path="/listings/:listingId/verification" element={withSuspense(ListingVerification)} />
              <Route path="/how-it-works" element={withSuspense(HowItWorks)} />
              <Route path="/auth" element={withSuspense(Auth)} />
              <Route path="/auth/callback" element={withSuspense(OAuthCallback)} />
              <Route path="/forgot-password" element={withSuspense(ForgotPassword)} />
              <Route path="/reset-password" element={withSuspense(ResetPassword)} />
              <Route path="/privacy-policy" element={withSuspense(PrivacyPolicy)} />
              <Route path="/terms-of-service" element={withSuspense(TermsOfService)} />
              <Route path="/contact" element={withSuspense(Contact)} />
              <Route path="/my-listings" element={withSuspense(MyListings)} />
              <Route path="/listings/:id/edit" element={withSuspense(EditListing)} />
              <Route path="/profile" element={withSuspense(MyProfile)} />
              <Route path="/my-favorites" element={withSuspense(Favorites)} />
              <Route path="/bookings" element={withSuspense(Bookings)} />
              <Route path="/bookings/:id" element={withSuspense(BookingDetail)} />
              <Route path="/listings/:id/bookings" element={withSuspense(ListingBookings)} />
              <Route path="*" element={withSuspense(NotFound)} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
