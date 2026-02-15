import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { GalleryPage } from "./pages/GalleryPage";
import { AdminLogin } from "./pages/AdminLogin";
import { AdminDashboard } from "./pages/AdminDashboard";
import { GalleryEditor } from "./pages/GalleryEditor";
import { MarkersOverview } from "./pages/MarkersOverview";
import { WebsiteEditor } from "./pages/WebsiteEditor";
import { Impressum } from "./pages/Impressum";
import { Datenschutz } from "./pages/Datenschutz";

// Protected Route wrapper
function ProtectedRoute({
  children,
  isLoggedIn,
}: {
  children: React.ReactNode;
  isLoggedIn: boolean;
}) {
  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Check login state on mount
  useEffect(() => {
    const loggedIn = localStorage.getItem("admin_logged_in") === "true";
    setIsAdminLoggedIn(loggedIn);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/g/:slug" element={<GalleryPage />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/datenschutz" element={<Datenschutz />} />
        <Route path="/g/:slug" element={<GalleryPage />} />

        {/* Admin routes */}
        <Route
          path="/admin/login"
          element={
            isAdminLoggedIn ? (
              <Navigate to="/admin" replace />
            ) : (
              <AdminLogin onLogin={() => setIsAdminLoggedIn(true)} />
            )
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute isLoggedIn={isAdminLoggedIn}>
              <AdminDashboard onLogout={() => setIsAdminLoggedIn(false)} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/gallery/:id"
          element={
            <ProtectedRoute isLoggedIn={isAdminLoggedIn}>
              <GalleryEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/gallery/:id/markers"
          element={
            <ProtectedRoute isLoggedIn={isAdminLoggedIn}>
              <MarkersOverview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/website/:section"
          element={
            <ProtectedRoute isLoggedIn={isAdminLoggedIn}>
              <WebsiteEditor />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
