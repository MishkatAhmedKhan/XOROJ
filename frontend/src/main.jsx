import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'

import './index.css'

// Layouts
import AppLayout from './layouts/AppLayout.jsx'
import AuthLayout from './layouts/AuthLayout.jsx'

// Pages
import HomePage from './pages/HomePage.jsx'
import ErrorPage from './pages/ErrorPage.jsx'
import CreateProblemPage from './pages/CreateProblemPage.jsx'
import ProblemSet from './pages/ProblemSet.jsx'
import ProblemPage from './pages/ProblemPage.jsx'

// Author Pages
import AuthorPage from './pages/AuthorPage.jsx'
import AuthorMyProblems from './pages/AuthorMyProblems.jsx'
import AuthorMyContests from './pages/AuthorMyContests.jsx'

// Contest Pages
import ContestListPage from './pages/ContestListPage.jsx'
import ContestViewPage from './pages/ContestViewPage.jsx'
import ContestProblemPage from './pages/ContestProblemPage.jsx'
import ContestMySubmissionsPage from './pages/ContestMySubmissionsPage.jsx'
import ContestAllSubmissionsPage from './pages/ContestAllSubmissionsPage.jsx'
import ContestStandingsPage from "./pages/ContestStandingsPage.jsx"

// Author Problem Editor with Tabs
import ProblemEditor from "./pages/ProblemEditor.jsx"
import GeneralInfo from "./pages/problem-editor/GeneralInfo.jsx"
import Statement from "./pages/problem-editor/Statement.jsx"
import Validator from "./pages/problem-editor/Validator.jsx"
import Checker from "./pages/problem-editor/Checker.jsx"
import Generator from "./pages/problem-editor/Generator.jsx"
import Tests from "./pages/problem-editor/Tests.jsx"
import SolutionFiles from "./pages/problem-editor/SolutionFiles.jsx"
import Invocations from "./pages/problem-editor/Invocations.jsx"
import ManageAccess from "./pages/problem-editor/ManageAccess.jsx"

// Author Contest Editor with Tabs
import ContestEditor from "./pages/ContestEditor.jsx"
import ContestGeneral from "./pages/contest-editor/ContestGeneral.jsx"
import ContestProblems from "./pages/contest-editor/ContestProblems.jsx"
import ContestParticipants from "./pages/contest-editor/ContestParticipants.jsx"

// Profile Editor Tabs
import ProfilePage from './pages/ProfilePage.jsx'
import EditProfile from './pages/profile-editor/EditProfile.jsx'
import Submissions from './pages/profile-editor/SubmissionHistory.jsx'
import ContestHistory from './pages/profile-editor/ContestHistory.jsx'

// IDE Page
import IDE from "./components/IDE.jsx"

// Auth Pages
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'

// Protected layout wrapper
function ProtectedLayout() {
  const token = localStorage.getItem('xoroj.jwt')
  return token ? <AppLayout /> : <Navigate to="/login" replace />
}

const router = createBrowserRouter([
  // Public (no header/footer)
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
    ],
  },

  // Protected (with header/footer)
  {
    path: '/',
    element: <ProtectedLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },

      // Author
      { path: 'author', element: <AuthorPage /> },
      { path: 'author/problems', element: <AuthorMyProblems /> },
      { path: 'author/contests', element: <AuthorMyContests /> },

      // Author Problem Editor
      {
        path: 'author/problems/:problemId/edit',
        element: <ProblemEditor />,
        children: [
          { index: true, element: <Navigate to="general" replace /> },
          { path: 'general', element: <GeneralInfo /> },
          { path: 'statement', element: <Statement /> },
          { path: 'generator', element: <Generator /> },
          { path: 'checker', element: <Checker /> },
          { path: 'tests', element: <Tests /> },
          { path: 'solutions', element: <SolutionFiles /> },
        ],
      },

      // Author Contest Editor
      {
        path: 'author/contests/:contestId/edit',
        element: <ContestEditor />,
        children: [
          { index: true, element: <Navigate to="general" replace /> },
          { path: 'general', element: <ContestGeneral /> },
          { path: 'problems', element: <ContestProblems /> },
          { path: 'participants', element: <ContestParticipants /> },
        ],
      },

      // Profile
      {
        path: 'profile/:username',
        element: <ProfilePage />,
        children: [
          // { index: true, element: <Navigate to="edit" replace /> },
          { path: 'edit', element: <EditProfile /> },
          { path: 'submissions', element: <Submissions /> },
          { path: 'contest-history', element: <ContestHistory /> },
        ],
      },

      // Problems
      { path: 'problems', element: <ProblemSet /> },
      { path: 'problems/:pid', element: <ProblemPage /> },
      { path: 'create-problem', element: <CreateProblemPage /> },

      // Contests
      { path: 'contests', element: <ContestListPage /> },
      { path: 'contests/:id/view', element: <ContestViewPage /> },
      { path: 'contests/:id/problems/:pid', element: <ContestProblemPage /> },
      { path: 'contests/:id/my', element: <ContestMySubmissionsPage /> },
      { path: 'contests/:id/submissions/:pageNumber', element: <ContestAllSubmissionsPage /> },
      { path: 'contests/:id/standings', element: <ContestStandingsPage /> },

      // IDE
      { path: 'IDE/code', element: <IDE /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
)
