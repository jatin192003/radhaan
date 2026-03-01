"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart3, Package, ShoppingBag, CalendarDays, DollarSign, TrendingUp, LayoutDashboard, ArrowRight, Tag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn, formatPrice, ANIMATION_VARIANTS } from "@/lib/utils";

const adminNav = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "Categories", href: "/admin/categories", icon: Tag },
    { label: "Analytics", href: "/admin", icon: BarChart3 },
];

function StatCard({ label, value, icon: Icon, color, trend }: {
    label: string; value: string | number; icon: React.ElementType; color: string; trend?: string;
}) {
    return (
        <motion.div variants={ANIMATION_VARIANTS.scaleIn} className={cn("card p-5 relative overflow-hidden")}>
            <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-8 translate-x-8", color)} />
            <div className="flex items-start justify-between mb-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", color)}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && <span className="text-xs text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">{trend}</span>}
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">{value}</div>
            <div className="text-sm text-[var(--text-muted)] mt-0.5">{label}</div>
        </motion.div>
    );
}

interface AdminDashboardContentProps {
    isAdmin: boolean;
    authLoading?: boolean;
}

export function AdminDashboardContent({ isAdmin }: AdminDashboardContentProps) {
    const { data, isLoading } = useQuery({
        queryKey: ["admin-analytics"],
        queryFn: () => adminApi.getAnalytics().then((r) => r.data),
        enabled: isAdmin,
    });

    const analytics = data;

    return (
        <div className="pt-20 min-h-screen bg-[var(--surface-bg)]">
            {/* Header */}
            <div className="bg-hero-gradient text-white py-10">
                <div className="container-main">
                    <h1 className="font-display text-2xl lg:text-3xl font-bold mb-1">Admin Dashboard</h1>
                    <p className="text-white/50 text-sm">Manage your Radhaan store</p>
                </div>
            </div>

            <div className="container-main py-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Sidebar */}
                    <aside className="lg:col-span-1">
                        <nav className="card p-3 space-y-1">
                            {adminNav.map(({ label, href, icon: Icon }) => (
                                <Link key={label} href={href}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group">
                                    <Icon className="w-4 h-4 text-[var(--text-muted)] group-hover:text-primary-500 transition-colors" />
                                    {label}
                                </Link>
                            ))}
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Stat Cards */}
                        {isLoading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
                            </div>
                        ) : (
                            <motion.div variants={ANIMATION_VARIANTS.stagger} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard label="Total Revenue" value={formatPrice(analytics?.revenue?.total ?? 0)} icon={DollarSign} color="bg-primary-500" />
                                <StatCard label="Total Orders" value={analytics?.orders?.total ?? 0} icon={ShoppingBag} color="bg-gold-500" />
                                <StatCard label="Active Rentals" value={analytics?.orders?.activeRentals ?? 0} icon={CalendarDays} color="bg-blue-500" />
                                <StatCard label="Pending Returns" value={analytics?.orders?.pendingReturns ?? 0} icon={TrendingUp} color="bg-purple-500" />
                            </motion.div>
                        )}

                        {/* Revenue Split */}
                        {analytics && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="card p-5">
                                    <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                        <CalendarDays className="w-4 h-4 text-gold-500" /> Top Rented Products
                                    </h3>
                                    <div className="space-y-3">
                                        {analytics.topRented?.length ? analytics.topRented.slice(0, 5).map((p: { product: { id: string; title: string }; rentalCount: number }, i: number) => (
                                            <div key={p.product.id} className="flex items-center gap-3">
                                                <span className="w-6 h-6 rounded-full bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                                                <Link href={`/admin/products/${p.product.id}`} className="flex-1 text-sm text-[var(--text-secondary)] hover:text-primary-500 truncate transition-colors">{p.product.title}</Link>
                                                <span className="text-xs font-semibold text-gold-600 dark:text-gold-400 whitespace-nowrap">{p.rentalCount} rentals</span>
                                            </div>
                                        )) : <p className="text-sm text-[var(--text-muted)]">No rental data yet.</p>}
                                    </div>
                                </div>

                                <div className="card p-5">
                                    <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                        <ShoppingBag className="w-4 h-4 text-primary-500" /> Revenue Breakdown
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-[var(--text-muted)]">Rental Revenue</span>
                                                <span className="font-semibold text-gold-600 dark:text-gold-400">{formatPrice(analytics.revenue?.rental ?? 0)}</span>
                                            </div>
                                            <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-gold-500 rounded-full" style={{ width: `${analytics.revenue?.total ? Math.round((analytics.revenue.rental / analytics.revenue.total) * 100) : 0}%` }} />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-[var(--text-muted)]">Purchase Revenue</span>
                                                <span className="font-semibold text-primary-600 dark:text-primary-400">{formatPrice(analytics.revenue?.purchase ?? 0)}</span>
                                            </div>
                                            <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary-500 rounded-full" style={{ width: `${analytics.revenue?.total ? Math.round((analytics.revenue.purchase / analytics.revenue.total) * 100) : 0}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Links */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { label: "Manage Products", href: "/admin/products", icon: Package, desc: "Add, edit, delete products and upload images" },
                                { label: "View All Orders", href: "/admin/orders", icon: ShoppingBag, desc: "Update order statuses and manage returns" },
                            ].map(card => (
                                <Link key={card.label} href={card.href} className="card p-5 group hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
                                    <card.icon className="w-8 h-8 text-primary-500 mb-3 group-hover:scale-110 transition-transform" />
                                    <h4 className="font-semibold text-[var(--text-primary)] mb-1">{card.label}</h4>
                                    <p className="text-xs text-[var(--text-muted)]">{card.desc}</p>
                                    <div className="flex items-center gap-1 mt-3 text-xs text-primary-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                        Go to {card.label.split(" ")[1]} <ArrowRight className="w-3 h-3" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
