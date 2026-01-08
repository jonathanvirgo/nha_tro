"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

interface User {
    id: string;
    email: string;
    fullName: string | null;
    phone: string | null;
    role: string;
    avatarUrl: string | null;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (data: { email: string; password: string; fullName: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const token = api.getToken();
            if (!token) {
                setUser(null);
                setIsLoading(false);
                return;
            }

            const response = await api.getMe();
            if (response.success && response.data) {
                setUser(response.data as unknown as User);
            } else {
                api.setToken(null);
                setUser(null);
            }
        } catch {
            api.setToken(null);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const login = async (email: string, password: string) => {
        const response = await api.login(email, password);
        if (response.success && response.data) {
            api.setToken(response.data.accessToken);
            // Set cookie for middleware
            document.cookie = `auth-token=${response.data.accessToken}; path=/; max-age=86400; SameSite=Lax`;
            await refreshUser();
            return { success: true };
        }
        return {
            success: false,
            error: response.error?.message || "Đăng nhập thất bại"
        };
    };

    const register = async (data: { email: string; password: string; fullName: string; phone?: string }) => {
        const response = await api.register(data);
        if (response.success) {
            return { success: true };
        }
        return {
            success: false,
            error: response.error?.message || "Đăng ký thất bại"
        };
    };

    const logout = async () => {
        await api.logout();
        document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
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
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
