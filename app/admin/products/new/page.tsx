"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
    const { isAdmin, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAdmin) router.replace("/");
    }, [isLoading, isAdmin, router]);

    if (isLoading || !isAdmin) return null;

    return (
        <div className="pt-20 min-h-screen bg-[var(--surface-bg)]">
            <div className="bg-hero-gradient text-white py-10">
                <div className="container-main">
                    <Link href="/admin/products" className="inline-flex items-center gap-1 text-white/60 hover:text-white text-sm mb-3 transition-colors">
                        <ChevronLeft className="w-4 h-4" /> Back to Products
                    </Link>
                    <h1 className="font-display text-2xl lg:text-3xl font-bold">Add New Product</h1>
                    <p className="text-white/50 text-sm mt-1">Fill in the details below to list a new product</p>
                </div>
            </div>
            <div className="container-main py-8">
                <ProductForm mode="new" />
            </div>
        </div>
    );
}
