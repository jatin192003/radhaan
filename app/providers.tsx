"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,   // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

export function Providers({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <CartProvider>
                    {children}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3500,
                            style: {
                                background: "var(--surface-card)",
                                color: "var(--text-primary)",
                                border: "1px solid var(--surface-border)",
                                borderRadius: "0.75rem",
                                boxShadow: "var(--shadow-card-hover)",
                                fontFamily: "var(--font-inter)",
                                fontSize: "0.9rem",
                            },
                            success: {
                                iconTheme: { primary: "#f83b62", secondary: "#fff" },
                            },
                            error: {
                                iconTheme: { primary: "#ef4444", secondary: "#fff" },
                            },
                        }}
                    />
                </CartProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}
