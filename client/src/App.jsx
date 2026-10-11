import { BrowserRouter, Route, Routes } from "react-router-dom";
import GuestRoute from "@/components/GuestRoute";
import ProtectedRoute from "@/components/ProtectedRoute";
import ServerStatusBanner from "@/components/ServerStatusBanner";
import AppToaster from "@/components/ui/Toaster";
import AuthProvider from "@/features/auth/AuthProvider";
import { useAuth } from "@/features/auth/useAuth";
import Dashboard from "@/pages/Dashboard";
import DesignPreview from "@/pages/DesignPreview";
import ForgotPassword from "@/pages/ForgotPassword";
import JoinPlaceholder from "@/pages/JoinPlaceholder";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Register from "@/pages/Register";
import ResetPassword from "@/pages/ResetPassword";

function HomeRoute() {
  const { status } = useAuth();
  if (status === "authenticated") {
    return <Dashboard />;
  }
  return <Landing />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ServerStatusBanner />
        <Routes>
          {/* Public Home & Landing */}
          <Route path="/" element={<HomeRoute />} />
          <Route path="/landing" element={<Landing />} />

          {/* Sirf logged-out users */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Sab ke liye khule */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {import.meta.env.DEV && <Route path="/design" element={<DesignPreview />} />}

          {/* Login zaroori */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/join/:code" element={<JoinPlaceholder />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        <AppToaster />
      </AuthProvider>
    </BrowserRouter>
  );
}
