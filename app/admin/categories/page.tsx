"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Tag } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { adminApi, categoriesApi } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ANIMATION_VARIANTS } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminCategoriesPage() {
    const { isAdmin, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const qc = useQueryClient();
    const [form, setForm] = useState({ name: "", slug: "", description: "" });

    useEffect(() => {
        if (!authLoading && !isAdmin) router.replace("/");
    }, [authLoading, isAdmin, router]);

    const { data, isLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoriesApi.list().then((r) => r.data),
        enabled: isAdmin,
    });

    const createMutation = useMutation({
        mutationFn: () => adminApi.createCategory(form),
        onSuccess: () => {
            toast.success("Category created!");
            setForm({ name: "", slug: "", description: "" });
            qc.invalidateQueries({ queryKey: ["categories"] });
        },
        onError: (e: Error) => toast.error(e.message),
    });

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        setForm((prev) => ({ ...prev, name, slug }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.slug) return toast.error("Name and slug are required");
        createMutation.mutate();
    };

    if (!isAdmin) return null;
    const categories = data ?? [];

    return (
        <div className="pt-20 min-h-screen bg-[var(--surface-bg)]">
            <div className="bg-hero-gradient text-white py-10">
                <div className="container-main">
                    <h1 className="font-display text-2xl lg:text-3xl font-bold mb-1">Categories</h1>
                    <p className="text-white/50 text-sm">Manage product categories</p>
                </div>
            </div>

            <div className="container-main py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Category Form */}
                    <div className="lg:col-span-1">
                        <div className="card p-6">
                            <h3 className="font-semibold text-[var(--text-primary)] mb-4 pb-2 border-b border-[var(--surface-border)]">
                                Add New Category
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-[var(--text-secondary)] mb-1 block">Name *</label>
                                    <input
                                        value={form.name} onChange={handleNameChange} required
                                        placeholder="e.g. Bridal Lehengas" className="input-base" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[var(--text-secondary)] mb-1 block">Slug *</label>
                                    <input
                                        value={form.slug}
                                        onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                                        required placeholder="bridal-lehengas" className="input-base font-mono text-sm" />
                                    <p className="text-xs text-[var(--text-muted)] mt-1">Auto-generated from name, used in URLs</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[var(--text-secondary)] mb-1 block">Description</label>
                                    <input
                                        value={form.description}
                                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                                        placeholder="Optional description" className="input-base" />
                                </div>
                                <Button type="submit" fullWidth isLoading={createMutation.isPending} icon={<Plus className="w-4 h-4" />}>
                                    Create Category
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Categories List */}
                    <div className="lg:col-span-2">
                        {isLoading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
                            </div>
                        ) : categories.length ? (
                            <motion.div variants={ANIMATION_VARIANTS.stagger} initial="hidden" animate="visible" className="space-y-3">
                                {categories.map((cat: { id: string; name: string; slug: string; description?: string; _count: { products: number } }) => (
                                    <motion.div key={cat.id} variants={ANIMATION_VARIANTS.fadeInUp}
                                        className="card p-4 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-gold-500 flex items-center justify-center">
                                            <Tag className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-[var(--text-primary)]">{cat.name}</p>
                                            <p className="text-xs text-[var(--text-muted)]">
                                                /{cat.slug} · {cat._count?.products ?? 0} products
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <div className="card p-16 text-center">
                                <Tag className="w-12 h-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-600" />
                                <p className="font-semibold text-[var(--text-primary)]">No categories yet</p>
                                <p className="text-sm text-[var(--text-muted)]">Add your first category using the form.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
