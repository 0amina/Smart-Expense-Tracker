import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AuthLayout           from './layouts/AuthLayout'
import DashboardLayout      from './layouts/DashboardLayout'
import ProtectedRoute       from './components/ProtectedRoute'
import PublicRoute          from './components/PublicRoute'
import LoginPage            from './pages/auth/LoginPage'
import RegisterPage         from './pages/auth/RegisterPage'
import OverviewPage         from './pages/dashboard/OverviewPage'
import ExpensesPage         from './pages/dashboard/ExpensesPage'
import ExpenseFormPage      from './pages/dashboard/ExpenseFormPage'
import ProfilePage          from './pages/dashboard/ProfilePage'
import NotificationsPage    from './pages/dashboard/NotificationsPage'
import NotFoundPage         from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index                             element={<OverviewPage />} />
            <Route path="expenses"                   element={<ExpensesPage />} />
            <Route path="add"                        element={<ExpenseFormPage />} />
            <Route path="expenses/:id/edit"          element={<ExpenseFormPage />} />
            <Route path="notifications"              element={<NotificationsPage />} />
            <Route path="profile"                    element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}