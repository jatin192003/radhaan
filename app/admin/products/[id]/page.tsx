"use client";

import { useEffect } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { adminApi } from "@/lib/api-client";
import { ProductForm } from "@/components/admin/ProductForm";
import { Skeleton } from "@/components/ui/Skeleton";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { isAdmin, isLoading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !isAdmin) router.replace("/");
    }, [authLoading, isAdmin, router]);

    const { data, isLoading } = useQuery({
        queryKey: ["admin-product", id],
        queryFn: () => adminApi.getProduct(id).then((r) => r.data),
        enabled: isAdmin && !!id,
    });

    if (authLoading || !isAdmin) return null;

    return (
        <div className="pt-20 min-h-screen bg-[var(--surface-bg)]">
            <div className="bg-hero-gradient text-white py-10">
                <div className="container-main">
                    <Link href="/admin/products" className="inline-flex items-center gap-1 text-white/60 hover:text-white text-sm mb-3 transition-colors">
                        <ChevronLeft className="w-4 h-4" /> Back to Products
                    </Link>
                    <h1 className="font-display text-2xl lg:text-3xl font-bold">
                        {isLoading ? "Loading..." : `Edit: ${data?.title}`}
                    </h1>
                    <p className="text-white/50 text-sm mt-1">Update product details and manage images</p>
                </div>
            </div>

            <div className="container-main py-8">
                {isLoading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-32 rounded-2xl" />
                        ))}
                    </div>
                ) : data ? (
                    <ProductForm
                        mode="edit"
                        productId={id}
                        initialData={{
                            title: data.title,
                            description: data.description,
                            categoryId: data.category?.id ?? "",
                            rentalPricePerDay: data.rentalPricePerDay,
                            purchasePrice: data.purchasePrice,
                            deposit: data.deposit ?? 0,
                            stock: data.stock ?? 0,
                            rentalEnabled: data.rentalEnabled,
                            purchaseEnabled: data.purchaseEnabled,
                            sizeVariants: data.sizeVariants ?? [],
                            images: data.images ?? [],
                        }}
                    />
                ) : (
                    <div className="card p-16 text-center text-[var(--text-muted)]">Product not found.</div>
                )}
            </div>
        </div>
    );
}
