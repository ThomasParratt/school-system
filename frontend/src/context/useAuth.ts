import { useContext, createContext } from "react";
import type { AuthUser } from "../types.ts";

export type AuthContextType = {
    user: AuthUser | null;
    token: string | null;
    loginUser: (user: AuthUser, token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    /** True after the API rejected the token and signed the user out. */
    sessionExpired: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return context;
}