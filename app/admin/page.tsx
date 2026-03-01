"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AdminDashboardContent } from "@/components/admin/AdminDashboardContent";

export default function AdminDashboard() {
    const { isAdmin, isLoading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !isAdmin) router.replace("/");
    }, [authLoading, isAdmin, router]);

    if (authLoading || !isAdmin) return null;

    return <AdminDashboardContent isAdmin={isAdmin} />;
}
