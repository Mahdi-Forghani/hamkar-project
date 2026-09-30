import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "./AuthContext";

type GuardProps = {
  children: React.ReactNode;
  type?: "auth" | "registration" | "profile";
};

export default function Guard({
  children,
  type = "auth",
}: GuardProps) {
  const location = useLocation();

  const {
    registration,
    isAuthenticated,
    isProfileCompleted,
  } = useAuth();

  const redirectUrl =
    new URLSearchParams(location.search).get(
      "redirect",
    ) ||
    `${location.pathname}${location.search}${location.hash}`;

  if (type === "registration") {
    if (!registration) {
      return (
        <Navigate
          to={`/register?redirect=${encodeURIComponent(
            redirectUrl,
          )}`}
          replace
        />
      );
    }

    return children;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(
          redirectUrl,
        )}`}
        replace
      />
    );
  }

  // Profile page is accessible for both
  // completed and incomplete profiles.
  if (type === "profile") {
    return children;
  }

  if (!isProfileCompleted) {
    return (
      <Navigate
        to={`/profile?redirect=${encodeURIComponent(
          redirectUrl,
        )}`}
        replace
      />
    );
  }

  return children;
}