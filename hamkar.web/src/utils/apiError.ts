import axios from "axios";

type ApiErrorData = {
  message?: string;
  nextStep?: "verify";
};

export function getApiErrorData(
  error: unknown,
): ApiErrorData | null {
  if (!axios.isAxiosError(error)) {
    return null;
  }

  return error.response?.data ?? null;
}