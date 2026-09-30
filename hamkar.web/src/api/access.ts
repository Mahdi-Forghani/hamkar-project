import { api } from "./client";

export type AccessGrant = {
  phoneNumber: string;
  shopName: string;
  userId: string;
};

export async function getMyGrants() {
  const response = await api.get<AccessGrant[]>("/api/access");

  return response.data;
}

export async function grantAccess(phoneNumber: string) {
  await api.post("/api/access", {
    phoneNumber,
  });
}

export async function revokeAccess(userId: string) {
  await api.delete(`/api/access/${userId}`);
}