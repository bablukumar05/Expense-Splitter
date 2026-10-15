import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import FullPageLoader from "@/components/FullPageLoader";
import GuestRoute from "@/components/GuestRoute";
import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import ServerStatusBanner from "@/components/ServerStatusBanner";
import AppToaster from "@/components/ui/Toaster";
import AuthProvider from "@/features/auth/AuthProvider";
import { useAuth } from "@/features/auth/useAuth";

const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const JoinPage = lazy(() => import("@/pages/JoinPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const PersonalInsights = lazy(() => import("@/pages/PersonalInsights"));
const Account = lazy(() => import("@/pages/Account"));
const GroupLayout = lazy(() => import("@/pages/GroupLayout"));
const GroupExpenses = lazy(() => import("@/pages/GroupExpenses"));
const GroupBalances = lazy(() => import("@/pages/GroupBalances"));
const GroupInsights = lazy(() => import("@/pages/GroupInsights"));
const GroupRecurring = lazy(() => import("@/pages/GroupRecurring"));
const GroupMembers = lazy(() => import("@/pages/GroupMembers"));
const GroupActivity = lazy(() => import("@/pages/GroupActivity"));
const ExpenseFormPage = lazy(() => import("@/pages/ExpenseFormPage"));
const ExpenseDetailPage = lazy(() => import("@/pages/ExpenseDetailPage"));
const RecurringFormPage = lazy(() => import("@/pages/RecurringFormPage"));
const Landing = lazy(() => import("@/pages/Landing"));
const DesignPreview = import.meta.env.DEV ? lazy(() => import("@/pages/DesignPreview")) : null;

function RootRoute() {
  const { status } = useAuth();
  if (status === "loading") return <FullPageLoader label="Loading SplitMate…" />;
  if (status === "authenticated") return <Navigate to="/dashboard" replace />;
  return <Landing />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ServerStatusBanner />
        <Suspense fallback={<FullPageLoader />}>
          <Routes>
            <Route path="/" element={<RootRoute />} />
            <Route path="/landing" element={<Landing />} />

            <Route element={<GuestRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/join/:code" element={<JoinPage />} />
            {DesignPreview && <Route path="/design" element={<DesignPreview />} />}

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/insights" element={<PersonalInsights />} />

                <Route path="/groups/:groupId/expenses/new" element={<ExpenseFormPage />} />
                <Route path="/groups/:groupId/expenses/:expenseId/edit" element={<ExpenseFormPage />} />
                <Route path="/groups/:groupId/expenses/:expenseId" element={<ExpenseDetailPage />} />
                <Route path="/groups/:groupId/recurring/new" element={<RecurringFormPage />} />
                <Route path="/groups/:groupId/recurring/:recurringId/edit" element={<RecurringFormPage />} />

                <Route path="/groups/:groupId" element={<GroupLayout />}>
                  <Route index element={<Navigate to="expenses" replace />} />
                  <Route path="expenses" element={<GroupExpenses />} />
                  <Route path="balances" element={<GroupBalances />} />
                  <Route path="insights" element={<GroupInsights />} />
                  <Route path="recurring" element={<GroupRecurring />} />
                  <Route path="members" element={<GroupMembers />} />
                  <Route path="activity" element={<GroupActivity />} />
                </Route>

                <Route path="/account" element={<Account />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <AppToaster />
      </AuthProvider>
    </BrowserRouter>
  );
}
