"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api-client";
import { ANIMATION_VARIANTS } from "@/lib/utils";

const defaultCategories = [
    { name: "Lehengas", slug: "lehengas", _count: { products: 0 }, emoji: "👗" },
    { name: "Jewellery", slug: "jewellery", _count: { products: 0 }, emoji: "💎" },
    { name: "Bridal Sets", slug: "bridal-sets", _count: { products: 0 }, emoji: "👑" },
    { name: "Party Wear", slug: "party-wear", _count: { products: 0 }, emoji: "✨" },
];

export function CategoriesSection() {
    const { data } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoriesApi.list().then((r) => r.data),
    });

    const categories = data?.length ? data : defaultCategories;

    return (
        <section className="py-20 bg-[var(--surface-bg)]">
            <div className="container-main">
                <motion.div
                    variants={ANIMATION_VARIANTS.fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <p className="text-sm font-semibold text-primary-500 uppercase tracking-widest mb-3">Browse By Category</p>
                    <h2 className="font-display text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">
                        Find Your Perfect Look
                    </h2>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {categories.slice(0, 4).map((cat: { name: string; slug: string; _count: { products: number }; emoji?: string }, i: number) => (
                        <motion.div
                            key={cat.slug}
                            variants={ANIMATION_VARIANTS.scaleIn}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Link href={`/shop?category=${cat.slug}`}>
                                <div className="card p-6 text-center group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
                                    <div className="text-4xl mb-3">{cat.emoji ?? "✨"}</div>
                                    <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-primary-500 transition-colors">{cat.name}</h3>
                                    {cat._count.products > 0 && (
                                        <p className="text-xs text-[var(--text-muted)] mt-1">{cat._count.products} items</p>
                                    )}
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
