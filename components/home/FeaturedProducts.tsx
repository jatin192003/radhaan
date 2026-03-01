"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api-client";
import { ProductCard } from "@/components/ui/ProductCard";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { ANIMATION_VARIANTS } from "@/lib/utils";

export function FeaturedProducts() {
    const { data, isLoading } = useQuery({
        queryKey: ["featured-products"],
        queryFn: () => productsApi.list({ limit: 8, sortBy: "averageRating", sortOrder: "desc" }).then((r) => r.data),
    });

    return (
        <section className="py-20 bg-neutral-50 dark:bg-neutral-900/30">
            <div className="container-main">
                <motion.div
                    variants={ANIMATION_VARIANTS.fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4"
                >
                    <div>
                        <p className="text-sm font-semibold text-primary-500 uppercase tracking-widest mb-2">Top Picks</p>
                        <h2 className="font-display text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">Featured Collection</h2>
                    </div>
                    <Link href="/shop" className="flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold text-sm transition-colors group">
                        View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>

                {isLoading ? (
                    <ProductGridSkeleton count={8} />
                ) : data?.products?.length ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                        {data.products.map((p: Parameters<typeof ProductCard>[0]["product"], i: number) => (
                            <ProductCard key={p.id} product={p} index={i} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-[var(--text-muted)]">
                        <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>Products will appear here once added by admin.</p>
                        <p className="text-sm mt-1">Start by adding categories and products in the Admin panel.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
