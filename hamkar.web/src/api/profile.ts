import { api } from "./client";

export type Profile = {
    firstName: string;
    lastName: string;
    shopName: string;
    address: string;
};

export type UpdateProfileRequest = Profile;

export type UpdateProfileResponse = {
    token: string;
};

export async function getProfile() {
    const response =
        await api.get<Profile>("/api/profile");

    return response.data;
}

export async function updateProfile(
    data: UpdateProfileRequest,
) {
    const response =
        await api.put<UpdateProfileResponse>(
            "/api/profile",
            data,
        );

    return response.data;
}