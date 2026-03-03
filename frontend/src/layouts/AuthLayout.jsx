// src/layouts/AuthLayout.jsx
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Let the page (Login/Register) render here */}
      <Outlet />
    </div>
  );
}
