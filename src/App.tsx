import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { LandingPage } from './pages/LandingPage';
import { onAuthChange } from './lib/authService';

// Alle anderen Seiten werden erst beim Aufrufen geladen — hält den
// initialen JS-Bundle für die Landing Page schlank.
const GalleryPage = lazy(() =>
  import('./pages/GalleryPage').then((m) => ({ default: m.GalleryPage }))
);
const AdminLogin = lazy(() =>
  import('./pages/AdminLogin').then((m) => ({ default: m.AdminLogin }))
);
const AdminDashboard = lazy(() =>
  import('./pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const GalleryEditor = lazy(() =>
  import('./pages/GalleryEditor').then((m) => ({ default: m.GalleryEditor }))
);
const MarkersOverview = lazy(() =>
  import('./pages/MarkersOverview').then((m) => ({ default: m.MarkersOverview }))
);
const WebsiteEditor = lazy(() =>
  import('./pages/WebsiteEditor').then((m) => ({ default: m.WebsiteEditor }))
);
const AdminSettings = lazy(() =>
  import('./pages/AdminSettings').then((m) => ({ default: m.AdminSettings }))
);
const Impressum = lazy(() =>
  import('./pages/Impressum').then((m) => ({ default: m.Impressum }))
);
const Datenschutz = lazy(() =>
  import('./pages/Datenschutz').then((m) => ({ default: m.Datenschutz }))
);

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50">
      <Loader2 className="w-8 h-8 text-sage-500 animate-spin" />
    </div>
  );
}

// Protected Route wrapper
function ProtectedRoute({
  children,
  isLoggedIn,
  authChecked,
}: {
  children: React.ReactNode;
  isLoggedIn: boolean;
  authChecked: boolean;
}) {
  // Solange Firebase noch nicht weiß, ob ein User da ist, warten wir.
  // Sonst würden wir bei einem Reload kurz auf /admin/login springen
  // und dann zurück — und das gespeicherte File-Upload würde scheitern.
  if (!authChecked) {
    return <PageLoader />;
  }
  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Auf Firebase-Auth-State hören (übersteht Reloads via IndexedDB-Persistenz)
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setIsAdminLoggedIn(!!user);
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/g/:slug" element={<GalleryPage />} />

          {/* Admin routes */}
          <Route
            path="/admin/login"
            element={
              !authChecked ? (
                <PageLoader />
              ) : isAdminLoggedIn ? (
                <Navigate to="/admin" replace />
              ) : (
                <AdminLogin />
              )
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute isLoggedIn={isAdminLoggedIn} authChecked={authChecked}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/gallery/:id"
            element={
              <ProtectedRoute isLoggedIn={isAdminLoggedIn} authChecked={authChecked}>
                <GalleryEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/gallery/:id/markers"
            element={
              <ProtectedRoute isLoggedIn={isAdminLoggedIn} authChecked={authChecked}>
                <MarkersOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/website/:section"
            element={
              <ProtectedRoute isLoggedIn={isAdminLoggedIn} authChecked={authChecked}>
                <WebsiteEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute isLoggedIn={isAdminLoggedIn} authChecked={authChecked}>
                <AdminSettings />
              </ProtectedRoute>
            }
          />

          {/* Legal pages */}
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/datenschutz" element={<Datenschutz />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
