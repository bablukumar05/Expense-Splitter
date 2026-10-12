import { Activity, Receipt, Scale } from "lucide-react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import GuestRoute from "@/components/GuestRoute";
import ProtectedRoute from "@/components/ProtectedRoute";
import ServerStatusBanner from "@/components/ServerStatusBanner";
import AppLayout from "@/components/layout/AppLayout";
import AppToaster from "@/components/ui/Toaster";
import AuthProvider from "@/features/auth/AuthProvider";
import Account from "@/pages/Account";
import ComingSoon from "@/pages/ComingSoon";
import Dashboard from "@/pages/Dashboard";
import ForgotPassword from "@/pages/ForgotPassword";
import GroupLayout from "@/pages/GroupLayout";
import GroupMembers from "@/pages/GroupMembers";
import JoinPage from "@/pages/JoinPage";
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
          <Route path="/landing" element={<Landing />} />

          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/join/:code" element={<JoinPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />

              <Route path="/groups/:groupId" element={<GroupLayout />}>
                <Route index element={<Navigate to="members" replace />} />
                <Route path="expenses" element={<ComingSoon icon={Receipt} title="Expenses" />} />
                <Route path="balances" element={<ComingSoon icon={Scale} title="Balances" />} />
                <Route path="members" element={<GroupMembers />} />
                <Route path="activity" element={<ComingSoon icon={Activity} title="Activity" />} />
              </Route>

              <Route path="/account" element={<Account />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        <AppToaster />
      </AuthProvider>
    </BrowserRouter>
  );
}
