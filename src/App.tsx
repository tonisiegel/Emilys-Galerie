import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { GalleryPage } from './pages/GalleryPage';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { GalleryEditor } from './pages/GalleryEditor';
import { MarkersOverview } from './pages/MarkersOverview';

// Protected Route wrapper
function ProtectedRoute({ children, isLoggedIn }: { children: React.ReactNode; isLoggedIn: boolean }) {
  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Check login state on mount
  useEffect(() => {
    const loggedIn = localStorage.getItem('admin_logged_in') === 'true';
    setIsAdminLoggedIn(loggedIn);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/g/:slug" element={<GalleryPage />} />

        {/* Admin routes */}
        <Route 
          path="/admin/login" 
          element={
            isAdminLoggedIn 
              ? <Navigate to="/admin" replace /> 
              : <AdminLogin onLogin={() => setIsAdminLoggedIn(true)} />
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

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
