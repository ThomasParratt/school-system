import { useEffect, useState } from "react";
import { setSessionExpiredHandler } from "../services/http.ts";
import type { AuthUser } from "../types.ts";
import { AuthContext } from "./useAuth.ts";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(() => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            return null;
        }

        try {
            return JSON.parse(storedUser) as AuthUser;
        } catch (error) {
            console.error("Failed to restore stored user", error);
            localStorage.removeItem("user");
            return null;
        }
    });

    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem("token");
    });

    // Set when the API rejected the token, so the login screen can say why it is showing.
    const [sessionExpired, setSessionExpired] = useState(false);

    const loginUser = (user: AuthUser, token: string) => {
        setSessionExpired(false);
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

    useEffect(() => {
        setSessionExpiredHandler(() => {
            setUser(null);
            setToken(null);
            setSessionExpired(true);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
        });
        return () => setSessionExpiredHandler(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loginUser,
                logout,
                isAuthenticated: !!user,
                sessionExpired,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}