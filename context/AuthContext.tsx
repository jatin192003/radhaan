"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    ReactNode,
} from "react";
import { authApi } from "@/lib/api-client";
import toast from "react-hot-toast";

interface User {
    id: string;
    name: string;
    email: string;
    role: "USER" | "ADMIN";
    phone?: string;
    addressLine1?: string;
    city?: string;
    state?: string;
    pincode?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const res = await authApi.me();
            setUser(res.data);
        } catch {
            setUser(null);
        }
    }, []);

    useEffect(() => {
        refreshUser().finally(() => setIsLoading(false));
    }, [refreshUser]);

    const login = async (email: string, password: string) => {
        const res = await authApi.login({ email, password });
        setUser(res.data);
        toast.success(`Welcome back, ${res.data.name}!`);
    };

    const register = async (data: {
        name: string;
        email: string;
        password: string;
        phone?: string;
    }) => {
        const res = await authApi.register(data);
        setUser(res.data);
        toast.success(`Welcome to Radhaan, ${res.data.name}! 🎉`);
    };

    const logout = async () => {
        await authApi.logout();
        setUser(null);
        toast.success("Logged out successfully");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                isAdmin: user?.role === "ADMIN",
                login,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}
