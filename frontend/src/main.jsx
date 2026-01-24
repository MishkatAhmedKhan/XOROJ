import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
<<<<<<< HEAD
import { createBrowserRouter, RouterProvider } from "react-router-dom"
=======
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
>>>>>>> fd616c53 (fixed routing issue)

import './index.css'

import HomePage from './pages/HomePage.jsx'
import ErrorPage from './pages/ErrorPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
<<<<<<< HEAD
=======
import CreateProblemPage from './pages/CreateProblemPage.jsx'

// NEW
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'

// ProtectedRoute
function Protected({ element }) {
  const token = localStorage.getItem('xoroj.jwt')
  return token ? element : <Navigate to="/login" replace />
}
>>>>>>> fd616c53 (fixed routing issue)

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <ErrorPage />
  },
  {
    path: "/profile/:username",
    element: <ProfilePage />
  },
  {
    path: "/problems",
    element: <div>Problems Page - To be implemented</div>
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
