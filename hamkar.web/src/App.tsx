import { Navigate, Route, Routes } from "react-router-dom";

import Guard from "./context/Guard";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyPage from "./pages/VerifyPage";
import SetPasswordPage from "./pages/SetPasswordPage";
import ProfilePage from "./pages/ProfilePage.tsx";

import SearchOffersPage from "./pages/HomePage";
import MyOffersPage from "./pages/MyOffersPage";
import AccessPage from "./pages/AccessPage";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      {/* Registration flow */}
      <Route
        path="/verify"
        element={
          <Guard type="registration">
            <VerifyPage />
          </Guard>
        }
      />

      <Route
        path="/set-password"
        element={
          <Guard type="registration">
            <SetPasswordPage />
          </Guard>
        }
      />

      {/* Authenticated + profile completed */}
      <Route
        path="/"
        element={
          <Guard>
            <SearchOffersPage />
          </Guard>
        }
      />

      <Route
        path="/offers"
        element={
          <Guard>
            <MyOffersPage />
          </Guard>
        }
      />

      <Route
        path="/access"
        element={
          <Guard>
            <AccessPage />
          </Guard>
        }
      />

      {/* Authenticated, profile may be incomplete */}
      <Route
        path="/profile"
        element={
          <Guard type="profile">
            <ProfilePage />
          </Guard>
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}