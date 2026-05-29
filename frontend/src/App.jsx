import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";

import { AuthProvider } from "./context/AuthContext";

import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import ProtectedRoute from "./Components/ProtectedRoute";

/* -----------------------------
   Lazy-loaded pages
------------------------------ */
const Home           = lazy(() => import("./pages/Home"));
const Login          = lazy(() => import("./pages/Login"));
const Register       = lazy(() => import("./pages/Register"));
const AuthCallback   = lazy(() => import("./pages/AuthCallback"));
const Courses        = lazy(() => import("./pages/Courses"));
const CourseDetail   = lazy(() => import("./pages/CourseDetail"));
const Dashboard      = lazy(() => import("./pages/Dashboard"));
const Explore        = lazy(() => import("./pages/Explore"));
const NotFound       = lazy(() => import("./pages/NotFound"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Analytics      = lazy(() => import("./pages/Analytics"));
const Notifications  = lazy(() => import("./pages/Notifications"));

/* -----------------------------
   Scroll To Top
------------------------------ */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

/* -----------------------------
   Loading Screen
------------------------------ */
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-grid">
      <div className="brutal-card px-8 py-6 flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
        <div className="font-mono uppercase tracking-[0.3em] text-sm">
          Loading...
        </div>
      </div>
    </div>
  );
}

/* -----------------------------
   Layout Shell
------------------------------ */
function Shell() {
  const location = useLocation();

  // Hide navbar/footer on auth callback
  const hideLayout = location.pathname === "/auth/callback";

  return (
    <>
      {!hideLayout && <Navbar />}

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/"         element={<Home />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* OAuth */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Courses */}
          <Route path="/courses"     element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />

          {/* Explore */}
          <Route path="/explore" element={<Explore />} />

          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      {!hideLayout && <Footer />}
    </>
  );
}

/* -----------------------------
   Main App
------------------------------ */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Shell />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;