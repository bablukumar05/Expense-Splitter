import { BrowserRouter, Route, Routes } from "react-router-dom";
import GuestRoute from "@/components/GuestRoute";
import ProtectedRoute from "@/components/ProtectedRoute";
import ServerStatusBanner from "@/components/ServerStatusBanner";
import AppLayout from "@/components/layout/AppLayout";
import AppToaster from "@/components/ui/Toaster";
import AuthProvider from "@/features/auth/AuthProvider";
import Account from "@/pages/Account";
import Dashboard from "@/pages/Dashboard";
import DesignPreview from "@/pages/DesignPreview";
import ForgotPassword from "@/pages/ForgotPassword";
import GroupPlaceholder from "@/pages/GroupPlaceholder";
import JoinPlaceholder from "@/pages/JoinPlaceholder";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Register from "@/pages/Register";
import ResetPassword from "@/pages/ResetPassword";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ServerStatusBanner />
        <Routes>
          {/* Landing page */}
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
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/groups/:groupId" element={<GroupPlaceholder />} />
              <Route path="/account" element={<Account />} />
            </Route>
            <Route path="/join/:code" element={<JoinPlaceholder />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        <AppToaster />
      </AuthProvider>
    </BrowserRouter>
  );
}
