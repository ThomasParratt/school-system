import { useContext, createContext } from "react";
import type { User } from "../types.ts";

export type AuthContextType = {
    user: User | null;
    token: string | null;
    loginUser: (user: User, token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return context;
}