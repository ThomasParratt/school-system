import { useState } from "react";
import type { User } from "../types.ts";
import { AuthContext } from "./useAuth.ts";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            return null;
        }

        try {
            return JSON.parse(storedUser) as User;
        } catch (error) {
            console.error("Failed to restore stored user", error);
            localStorage.removeItem("user");
            return null;
        }
    });

    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem("token");
    });

    const loginUser = (user: User, token: string) => {
        setUser(user);
        setToken(token);

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
    };

    const logout = () => {
        setUser(null);
        setToken(null);

        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loginUser,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}