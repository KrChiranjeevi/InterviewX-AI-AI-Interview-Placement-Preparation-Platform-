import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import ProtectedRoute from './routes/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy loaded pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const InterviewSetup = lazy(() => import('./pages/InterviewSetup'));
const LiveInterview = lazy(() => import('./pages/LiveInterview'));
const ResumeAnalyzer = lazy(() => import('./pages/ResumeAnalyzer'));
const Landing = lazy(() => import('./pages/Landing'));
const CompanyList = lazy(() => import('./pages/CompanyList'));
const CompanyDetail = lazy(() => import('./pages/CompanyDetail'));
const CodingHub = lazy(() => import('./pages/CodingHub'));
const CodingProblemList = lazy(() => import('./pages/CodingProblemList'));
const CodingEditor = lazy(() => import('./pages/CodingEditor'));
const CodingInterview = lazy(() => import('./pages/CodingInterview'));
const AssessmentRoom = lazy(() => import('./pages/AssessmentRoom'));
const AssessmentReport = lazy(() => import('./pages/AssessmentReport'));
const ReportsDashboard = lazy(() => import('./pages/ReportsDashboard'));
const ReportDetail = lazy(() => import('./pages/ReportDetail'));
const RoadmapPage = lazy(() => import('./pages/RoadmapPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const CompanyCodingQuestionsPage = lazy(() => import('./pages/CompanyCodingQuestionsPage'));
const CompanyExamHub = lazy(() => import('./pages/CompanyExamHub'));
const CompanyExamEngine = lazy(() => import('./pages/CompanyExamEngine'));

// Loading Fallback
const LoadingFallback = () => (
  <div className="flex h-screen bg-slate-950 items-center justify-center">
    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
  </div>
);

function App() {
  useEffect(() => {
    const applyTheme = () => {
      try {
        const localTheme = localStorage.getItem('theme');
        if (localTheme) {
          if (localTheme === 'light') {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
          } else {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
          }
        } else {
          const userInfo = localStorage.getItem('userInfo');
          if (userInfo) {
            const user = JSON.parse(userInfo);
            const themeMode = user?.settings?.appearance?.themeMode || user?.theme || 'dark';
            let activeTheme = themeMode;
            if (themeMode === 'system') {
              activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            if (activeTheme === 'light') {
              document.documentElement.classList.add('light');
              document.documentElement.classList.remove('dark');
            } else {
              document.documentElement.classList.add('dark');
              document.documentElement.classList.remove('light');
            }
          } else {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
          }
        }
      } catch (err) {
        console.error('Error applying theme:', err);
      }
    };

    applyTheme();

    window.addEventListener('storage', applyTheme);
    window.addEventListener('theme-changed', applyTheme);
    return () => {
      window.removeEventListener('storage', applyTheme);
      window.removeEventListener('theme-changed', applyTheme);
    };
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-slate-950">
          <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }} />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/interview/setup" 
            element={
              <ProtectedRoute>
                <InterviewSetup />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/interview/live/:id" 
            element={
              <ProtectedRoute>
                <LiveInterview />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/assessment/:category" 
            element={
              <ProtectedRoute>
                <AssessmentRoom />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/assessment/report/:id" 
            element={
              <ProtectedRoute>
                <AssessmentReport />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/resume" 
            element={
              <ProtectedRoute>
                <ResumeAnalyzer />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/companies" 
            element={
              <ProtectedRoute>
                <CompanyList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/companies/:companyName" 
            element={
              <ProtectedRoute>
                <CompanyDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/coding" 
            element={
              <ProtectedRoute>
                <CodingHub />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/coding/dsa" 
            element={
              <ProtectedRoute>
                <CodingInterview />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/coding/list/:category" 
            element={
              <ProtectedRoute>
                <CodingProblemList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/coding/problem/:id" 
            element={
              <ProtectedRoute>
                <CodingEditor />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/coding/company/:companyName" 
            element={
              <ProtectedRoute>
                <CompanyCodingQuestionsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/exam/:company" 
            element={
              <ProtectedRoute>
                <CompanyExamHub />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/exam/:company/:track" 
            element={
              <ProtectedRoute>
                <CompanyExamEngine />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <ReportsDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/report/:id" 
            element={
              <ProtectedRoute>
                <ReportDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/roadmap" 
            element={
              <ProtectedRoute>
                <RoadmapPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/community" 
            element={
              <ProtectedRoute>
                <CommunityPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
            <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
