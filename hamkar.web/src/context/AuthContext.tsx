import {
    createContext,
    useCallback,
    useContext,
    useState,
    type ReactNode,
} from "react";

import {
    login as loginApi,
    register as registerApi,
    setPassword as setPasswordApi,
    verify as verifyApi,
    type AuthStep,
} from "../api/auth";

import {
    getProfileCompleted,
} from "../utils/jwt";

import {
    getProfile as getProfileApi,
    updateProfile as updateProfileApi,
    type Profile,
    type UpdateProfileRequest,
} from "../api/profile";

import {
    getApiErrorData,
} from "../utils/apiError";

type RegistrationState = {
    mobileNumber: string;
    userId?: string;
    registrationToken?: string;
};

type LoginResult =
    | "success"
    | "verify";

type AuthContextValue = {
    registration: RegistrationState | null;

    isAuthenticated: boolean;
    isProfileCompleted: boolean;

    startRegistration: (
        data: RegistrationState
    ) => void;

    register: (
        mobileNumber: string
    ) => Promise<AuthStep>;

    verify: (
        token: string
    ) => Promise<
        "set-password" | "login"
    >;

    setPassword: (
        password: string
    ) => Promise<void>;

    login: (
        username: string,
        password: string
    ) => Promise<LoginResult>;

    updateProfile: (
        data: UpdateProfileRequest
    ) => Promise<void>;

    getProfile: () => Promise<Profile>;

    clearRegistration: () => void;
};

const AuthContext =
    createContext<AuthContextValue | null>(
        null
    );

export function AuthProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [
        registration,
        setRegistration,
    ] = useState<RegistrationState | null>(
        null
    );

    const [token, setToken] = useState(
        () => localStorage.getItem("token")
    );

    const isAuthenticated = !!token;

    const isProfileCompleted =
        getProfileCompleted(token);

    async function register(
        mobileNumber: string
    ) {
        const result =
            await registerApi(
                mobileNumber
            );

        setRegistration({
            mobileNumber,
            userId: result.userId,
            registrationToken:
                result.registrationToken,
        });

        return result.nextStep;
    }

    async function verify(
        code: string
    ) {
        if (!registration) {
            throw new Error(
                "Registration session not found"
            );
        }

        const result =
            await verifyApi(
                registration.mobileNumber,
                code
            );

        if (
            result.nextStep ===
            "set-password"
        ) {
            setRegistration({
                ...registration,
                userId: result.userId,
                registrationToken:
                    result.registrationToken,
            });
        }

        return result.nextStep;
    }

    async function setPassword(
        password: string
    ) {
        if (
            !registration?.userId ||
            !registration.registrationToken
        ) {
            throw new Error(
                "Registration session not found"
            );
        }

        const result =
            await setPasswordApi(
                registration.userId,
                registration.registrationToken,
                password
            );

        localStorage.setItem(
            "token",
            result.token
        );

        setToken(result.token);
    }

    async function login(
        username: string,
        password: string
    ) {
        try {
            const result =
                await loginApi(
                    username,
                    password
                );
                
            localStorage.setItem(
                "token",
                result.token
            );

            setToken(result.token);

            return "success";
        } catch (error) {
            const data =
                getApiErrorData(error);

            if (
                data?.nextStep ===
                "verify"
            ) {
                setRegistration({
                    mobileNumber: username,
                });

                return "verify";
            }

            throw error;
        }
    }

    const getProfile =
        useCallback(async () => {
            return await getProfileApi();
        }, []);

    async function updateProfile(
        data: UpdateProfileRequest
    ) {
        const result =
            await updateProfileApi(data);

        localStorage.setItem(
            "token",
            result.token
        );

        setToken(result.token);
    }

    function startRegistration(
        data: RegistrationState
    ) {
        setRegistration(data);
    }

    function clearRegistration() {
        setRegistration(null);
    }

    return (
        <AuthContext.Provider
            value={{
                registration,
                isAuthenticated,
                isProfileCompleted,
                startRegistration,
                register,
                verify,
                setPassword,
                login,
                updateProfile,
                getProfile,
                clearRegistration,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context =
        useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}