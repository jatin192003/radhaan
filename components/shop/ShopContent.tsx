"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { productsApi, categoriesApi } from "@/lib/api-client";
import { ProductCard } from "@/components/ui/ProductCard";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
    { label: "Newest", value: "createdAt:desc" },
    { label: "Price: Low to High", value: "purchasePrice:asc" },
    { label: "Price: High to Low", value: "purchasePrice:desc" },
    { label: "Top Rated", value: "averageRating:desc" },
];

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

export function ShopContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [filterOpen, setFilterOpen] = useState(false);
    const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
    const [debouncedSearch, setDebouncedSearch] = useState(searchInput);

    const page = parseInt(searchParams.get("page") || "1");
    const category = searchParams.get("category") || "";
    const type = searchParams.get("type") || "";
    const size = searchParams.get("size") || "";
    const sort = searchParams.get("sort") || "createdAt:desc";
    const [sortBy, sortOrder] = sort.split(":");

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchInput), 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    const updateParam = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set(key, value); else params.delete(key);
        params.set("page", "1");
        router.push(`/shop?${params.toString()}`);
    };

    const { data, isLoading } = useQuery({
        queryKey: ["products", page, category, type, size, sortBy, sortOrder, debouncedSearch],
        queryFn: () => productsApi.list({
            page, category, type, size, sortBy, sortOrder,
            search: debouncedSearch || undefined, limit: 12,
        }).then((r) => r.data),
    });

    const { data: categoriesData } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoriesApi.list().then((r) => r.data),
    });

    const categories = categoriesData ?? [];
    const activeFiltersCount = [category, type, size].filter(Boolean).length;

    return (
        <div className="pt-20 min-h-screen bg-[var(--surface-bg)]">
            {/* Header */}
            <div className="bg-hero-gradient text-white py-14">
                <div className="container-main">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <h1 className="font-display text-3xl lg:text-5xl font-bold mb-2">
                            {category ? categories.find((c: { slug: string }) => c.slug === category)?.name || "Collection" : "All Products"}
                        </h1>
                        <p className="text-white/50">{data?.pagination?.total ?? "..."} items available</p>
                    </motion.div>
                </div>
            </div>

            <div className="container-main py-8">
                {/* Search + Sort bar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="Search lehengas, jewellery..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="input-base pl-10"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilterOpen(!filterOpen)}
                            className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors",
                                activeFiltersCount > 0
                                    ? "bg-primary-500 text-white border-primary-500"
                                    : "border-[var(--surface-border)] text-[var(--text-secondary)] hover:border-primary-500"
                            )}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                        </button>
                        <select
                            value={sort}
                            onChange={(e) => updateParam("sort", e.target.value)}
                            className="input-base w-auto pr-8 cursor-pointer"
                        >
                            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                </div>

                {/* Filter Panel */}
                <AnimatePresence>
                    {filterOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden mb-6"
                        >
                            <div className="card p-5 grid grid-cols-2 md:grid-cols-4 gap-5">
                                {/* Category */}
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Category</p>
                                    <div className="space-y-1.5">
                                        {[{ name: "All", slug: "" }, ...categories].map((c: { name: string; slug: string }) => (
                                            <button key={c.slug} onClick={() => updateParam("category", c.slug)}
                                                className={cn("w-full text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors",
                                                    category === c.slug ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 font-semibold" : "text-[var(--text-secondary)] hover:bg-neutral-100 dark:hover:bg-neutral-800")}>
                                                {c.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Type */}
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Type</p>
                                    <div className="space-y-1.5">
                                        {[["", "All"], ["rent", "Rent Only"], ["buy", "Buy Only"], ["both", "Rent & Buy"]].map(([val, label]) => (
                                            <button key={val} onClick={() => updateParam("type", val)}
                                                className={cn("w-full text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors",
                                                    type === val ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 font-semibold" : "text-[var(--text-secondary)] hover:bg-neutral-100 dark:hover:bg-neutral-800")}>
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Size */}
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Size</p>
                                    <div className="flex flex-wrap gap-2">
                                        {SIZE_OPTIONS.map((s) => (
                                            <button key={s} onClick={() => updateParam("size", size === s ? "" : s)}
                                                className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors",
                                                    size === s ? "bg-primary-500 text-white border-primary-500" : "border-[var(--surface-border)] text-[var(--text-secondary)] hover:border-primary-500")}>
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Clear */}
                                <div className="flex items-end">
                                    <button onClick={() => { router.push("/shop"); setSearchInput(""); }}
                                        className="flex items-center gap-1.5 text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors">
                                        <X className="w-4 h-4" /> Clear All
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Active filter pills */}
                {activeFiltersCount > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                        {category && <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">{categories.find((c: { slug: string }) => c.slug === category)?.name} <button onClick={() => updateParam("category", "")}><X className="w-3 h-3" /></button></span>}
                        {type && <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">{type} <button onClick={() => updateParam("type", "")}><X className="w-3 h-3" /></button></span>}
                        {size && <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">Size: {size} <button onClick={() => updateParam("size", "")}><X className="w-3 h-3" /></button></span>}
                    </div>
                )}

                {/* Products Grid */}
                {isLoading ? (
                    <ProductGridSkeleton count={12} />
                ) : data?.products?.length ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                            {data.products.map((p: Parameters<typeof ProductCard>[0]["product"], i: number) => (
                                <ProductCard key={p.id} product={p} index={i} />
                            ))}
                        </div>
                        {data.pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-10">
                                {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((p) => (
                                    <button key={p} onClick={() => updateParam("page", String(p))}
                                        className={cn("w-9 h-9 rounded-lg text-sm font-medium transition-colors",
                                            page === p ? "bg-primary-500 text-white" : "border border-[var(--surface-border)] text-[var(--text-secondary)] hover:border-primary-500")}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20">
                        <Search className="w-12 h-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-600" />
                        <h3 className="font-semibold text-lg text-[var(--text-primary)] mb-1">No products found</h3>
                        <p className="text-[var(--text-muted)] text-sm mb-4">Try adjusting your filters or search term.</p>
                        <Button variant="outline" onClick={() => { router.push("/shop"); setSearchInput(""); }}>Clear Filters</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
