"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search, PackageX, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { adminApi } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { cn, formatPrice, ANIMATION_VARIANTS } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminProductsPage() {
    const { isAdmin, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const qc = useQueryClient();
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (!authLoading && !isAdmin) router.replace("/");
    }, [authLoading, isAdmin, router]);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    const { data, isLoading } = useQuery({
        queryKey: ["admin-products", page, debouncedSearch],
        queryFn: () => adminApi.listProducts({ page, limit: 12, ...(debouncedSearch ? { search: debouncedSearch } : {}) }).then((r) => r.data),
        enabled: isAdmin,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminApi.deleteProduct(id),
        onSuccess: () => {
            toast.success("Product deleted");
            qc.invalidateQueries({ queryKey: ["admin-products"] });
        },
        onError: () => toast.error("Failed to delete product"),
    });

    const handleDelete = (id: string, title: string) => {
        if (confirm(`Delete "${title}"? This action cannot be undone.`)) {
            deleteMutation.mutate(id);
        }
    };

    if (authLoading) return (
        <div className="pt-20 min-h-screen flex items-center justify-center bg-[var(--surface-bg)]">
            <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-[var(--text-muted)]">Loading admin panel...</p>
            </div>
        </div>
    );
    if (!isAdmin) return null;

    const products = data?.products ?? [];

    return (
        <div className="pt-20 min-h-screen bg-[var(--surface-bg)]">
            {/* Header */}
            <div className="bg-hero-gradient text-white py-10">
                <div className="container-main flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="font-display text-2xl lg:text-3xl font-bold">Products</h1>
                        <p className="text-white/50 text-sm mt-0.5">{data?.pagination?.total ?? 0} total products</p>
                    </div>
                    <Link href="/admin/products/new" className="inline-flex items-center gap-2 h-10 px-4 text-sm rounded-lg font-semibold bg-primary-500 hover:bg-primary-600 text-white transition-all duration-200">
                        <Plus className="w-4 h-4" /> Add Product
                    </Link>
                </div>
            </div>

            <div className="container-main py-8">
                {/* Search */}
                <div className="relative mb-6 max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="input-base pl-10" />
                </div>

                {isLoading ? (
                    <ProductGridSkeleton count={12} />
                ) : products.length ? (
                    <>
                        <motion.div variants={ANIMATION_VARIANTS.stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {products.map((p: {
                                id: string; title: string; purchasePrice?: number; rentalPricePerDay?: number;
                                rentalEnabled: boolean; purchaseEnabled: boolean; isDeleted: boolean;
                                category: { name: string }; images: { url: string }[];
                                _count?: { orderItems: number; rentalBookings: number };
                            }) => (
                                <motion.div key={p.id} variants={ANIMATION_VARIANTS.fadeInUp} className="card overflow-hidden group">
                                    {/* Image */}
                                    <div className="relative bg-neutral-100 dark:bg-neutral-800" style={{ aspectRatio: "3/4" }}>
                                        {p.images?.[0]?.url ? (
                                            <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-neutral-300 dark:text-neutral-600">
                                                <ImageIcon className="w-12 h-12" />
                                            </div>
                                        )}
                                        {/* Action overlay */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Link href={`/admin/products/${p.id}`}
                                                className="p-2 rounded-lg bg-white/90 text-neutral-800 hover:bg-white transition-colors shadow-md">
                                                <Pencil className="w-4 h-4" />
                                            </Link>
                                            <button onClick={() => handleDelete(p.id, p.title)}
                                                className="p-2 rounded-lg bg-red-500/90 text-white hover:bg-red-500 transition-colors shadow-md">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    {/* Info */}
                                    <div className="p-3.5 space-y-1">
                                        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide font-medium">{p.category.name}</p>
                                        <h3 className="font-semibold text-sm text-[var(--text-primary)] line-clamp-2 leading-snug">{p.title}</h3>
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {p.rentalEnabled && p.rentalPricePerDay && (
                                                <span className="text-xs font-bold text-gold-600 dark:text-gold-400">{formatPrice(p.rentalPricePerDay)}/day</span>
                                            )}
                                            {p.purchaseEnabled && p.purchasePrice && (
                                                <span className="text-xs font-bold text-primary-500">{formatPrice(p.purchasePrice)}</span>
                                            )}
                                        </div>
                                        {p._count && (
                                            <p className="text-xs text-[var(--text-muted)]">{p._count.orderItems} orders · {p._count.rentalBookings} rentals</p>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Pagination */}
                        {data?.pagination?.totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map(p => (
                                    <button key={p} onClick={() => setPage(p)} className={cn("w-9 h-9 rounded-lg text-sm font-medium transition-colors", page === p ? "bg-primary-500 text-white" : "border border-[var(--surface-border)] text-[var(--text-secondary)] hover:border-primary-500")}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="card p-16 text-center">
                        <PackageX className="w-12 h-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-600" />
                        <h3 className="font-semibold text-lg text-[var(--text-primary)] mb-1">No products found</h3>
                        <p className="text-sm text-[var(--text-muted)] mb-5">Add your first product to get started.</p>
                        <Link href="/admin/products/new" className="inline-flex items-center gap-2 h-10 px-4 text-sm rounded-lg font-semibold bg-primary-500 hover:bg-primary-600 text-white transition-all duration-200">
                            <Plus className="w-4 h-4" /> Add First Product
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
