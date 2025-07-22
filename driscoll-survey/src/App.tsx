import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { SurveyLanding } from '@/components/survey/SurveyLanding'
import SurveyForm from '@/components/survey/SurveyForm'
import { ThankYou } from '@/components/survey/ThankYou'
import { AdminLogin } from '@/components/admin/AdminLogin'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-natural-white font-system">
          <Routes>
            {/* Customer Survey Routes */}
            <Route path="/" element={<SurveyLanding />} />
            <Route path="/survey" element={<SurveyForm />} />
            <Route path="/thank-you" element={<ThankYou />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#FBF6EA',
                color: '#626656',
                border: '1px solid #4A773C',
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'system-ui'
              },
              success: {
                iconTheme: {
                  primary: '#4A773C',
                  secondary: '#FBF6EA',
                },
              },
              error: {
                iconTheme: {
                  primary: '#DA291C',
                  secondary: '#FBF6EA',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App