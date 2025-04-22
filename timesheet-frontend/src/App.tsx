import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { Timesheets } from './pages/Timesheets'
import { TimesheetDetail } from './pages/TimesheetDetail'
import { TimeEntryForm } from './pages/TimeEntryForm'
import { TimeEntryDetail } from './pages/TimeEntryDetail'
import { PendingApprovals } from './pages/PendingApprovals'
import { Profile } from './pages/Profile'
import { ChangePassword } from './pages/ChangePassword'
import { Unauthorized } from './pages/Unauthorized'
import { Help } from './pages/Help'
import { Documentation } from './pages/Documentation'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'

function App() {
  const { token, fetchCurrentUser } = useAuthStore()

  // On app load, try to fetch user data if we have a token
  useEffect(() => {
    if (token) {
      fetchCurrentUser()
    }
  }, [token, fetchCurrentUser])

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/help" element={<Help />} />
        <Route path="/documentation" element={<Documentation />} />
        
        {/* Protected routes - any authenticated user */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/change-password" element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        } />
        <Route path="/timesheets" element={
          <ProtectedRoute>
            <Timesheets />
          </ProtectedRoute>
        } />
        <Route path="/timesheets/:id" element={
          <ProtectedRoute>
            <TimesheetDetail />
          </ProtectedRoute>
        } />
        <Route path="/time-entries/new" element={
          <ProtectedRoute>
            <TimeEntryForm />
          </ProtectedRoute>
        } />
        <Route path="/time-entries/edit/:id" element={
          <ProtectedRoute>
            <TimeEntryForm />
          </ProtectedRoute>
        } />
        <Route path="/time-entries/:id" element={
          <ProtectedRoute>
            <TimeEntryDetail />
          </ProtectedRoute>
        } />
        
        {/* Protected routes - manager/admin only */}
        <Route path="/pending-approvals" element={
          <ProtectedRoute requiredRole="manager">
            <PendingApprovals />
          </ProtectedRoute>
        } />
        
        {/* Default route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App