import { api } from "./client";

export type AuthStep = "verify" | "set-password" | "login";

export type RegisterResponse = {
  nextStep: AuthStep;
  userId?: string;
  registrationToken?: string;
};

export type VerifyResponse = {
  nextStep: "set-password" | "login";
  userId?: string;
  registrationToken?: string;
};

export type LoginResponse = {
  token: string;
};

export type LoginErrorResponse = {
  message?: string;
  nextStep?: "verify";
};

export type SetPasswordResponse = {
  token: string;
};

export async function register(mobileNumber: string) {
  const response = await api.post<RegisterResponse>(
    "/api/auth/register",
    { mobileNumber },
  );

  return response.data;
}

export async function verify(mobileNumber: string, token: string) {
  const response = await api.post<VerifyResponse>(
    "/api/auth/verify",
    {
      mobileNumber,
      token,
    },
  );

  return response.data;
}

export async function setPassword(
  userId: string,
  registrationToken: string,
  password: string,
) {
  const response = await api.post<SetPasswordResponse>(
    "/api/auth/set-password",
    {
      userId,
      registrationToken,
      password,
    },
  );

  return response.data;
}

export async function login(
  username: string,
  password: string
) {
  const response = await api.post<LoginResponse>(
    "/api/auth/login",
    {
      username,
      password,
    }
  );

  return response.data;
}