"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Package, User, Settings, ChevronRight, CalendarDays, Tag, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { userApi } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn, formatDate, formatPrice, getOrderStatusColor, getOrderTypeLabel, ANIMATION_VARIANTS } from "@/lib/utils";

const NAV = [
    { label: "My Orders", href: "/dashboard", icon: Package },
    { label: "Profile", href: "/dashboard/profile", icon: User },
    { label: "Settings", href: "/dashboard/profile", icon: Settings },
];

export default function DashboardPage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) router.replace("/auth/login");
    }, [authLoading, isAuthenticated, router]);

    const { data, isLoading } = useQuery({
        queryKey: ["user-orders"],
        queryFn: () => userApi.getOrders(1).then((r) => r.data),
        enabled: isAuthenticated,
    });

    if (authLoading) {
        return <div className="pt-36 container-main py-8"><Skeleton className="h-64 w-full rounded-2xl" /></div>;
    }

    const orders = data?.orders ?? [];

    return (
        <div className="pt-20 min-h-screen bg-[var(--surface-bg)]">
            {/* Header */}
            <div className="bg-hero-gradient text-white py-12">
                <div className="container-main flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-gold-500 flex items-center justify-center text-white text-2xl font-bold font-display shadow-glow-primary">
                        {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <h1 className="font-display text-2xl font-bold">Hello, {user?.name?.split(" ")[0]}!</h1>
                        <p className="text-white/50 text-sm mt-0.5">{user?.email}</p>
                    </div>
                </div>
            </div>

            <div className="container-main py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <aside className="lg:col-span-1">
                        <nav className="card p-3 space-y-1">
                            {NAV.map(({ label, href, icon: Icon }) => (
                                <Link key={label} href={href}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group">
                                    <Icon className="w-4 h-4 text-[var(--text-muted)] group-hover:text-primary-500 transition-colors" />
                                    {label}
                                    <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                                </Link>
                            ))}
                        </nav>
                    </aside>

                    {/* Orders */}
                    <div className="lg:col-span-3 space-y-4">
                        <h2 className="font-semibold text-lg text-[var(--text-primary)]">
                            My Orders <span className="text-[var(--text-muted)] font-normal text-base">({data?.pagination?.total ?? 0})</span>
                        </h2>

                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-2xl" />)
                        ) : orders.length ? (
                            <motion.div variants={ANIMATION_VARIANTS.stagger} initial="hidden" animate="visible" className="space-y-4">
                                {orders.map((order: {
                                    id: string; orderType: string; status: string; totalAmount: number; depositAmount: number;
                                    createdAt: string; items: Array<{ id: string; product: { id: string; title: string; images: { url: string }[] }; sizeVariant?: { size: string }; type: string; quantity: number }>;
                                }) => (
                                    <motion.div key={order.id} variants={ANIMATION_VARIANTS.fadeInUp}>
                                        <Link href={`/dashboard/orders/${order.id}`} className="block card p-5 hover:shadow-card-hover transition-shadow group">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-xs text-[var(--text-muted)]">Order #{order.id.slice(-8).toUpperCase()}</div>
                                                    <span className={cn("badge text-xs", getOrderStatusColor(order.status))}>{order.status}</span>
                                                    <span className={cn("badge text-xs", order.orderType === "RENT" ? "bg-gold-100 text-gold-700 dark:bg-gold-900/30 dark:text-gold-400" : "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400")}>
                                                        {order.orderType === "RENT" ? <CalendarDays className="w-3 h-3" /> : <Tag className="w-3 h-3" />} {getOrderTypeLabel(order.orderType)}
                                                    </span>
                                                </div>
                                                <ExternalLink className="w-4 h-4 text-[var(--text-muted)] group-hover:text-primary-500 opacity-0 group-hover:opacity-100 transition-all" />
                                            </div>
                                            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                                                {order.items.slice(0, 4).map((item) => (
                                                    <div key={item.id} className="flex-shrink-0 flex items-start gap-2.5">
                                                        <div className="w-14 h-16 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                                                            {item.product.images?.[0]?.url ? (
                                                                <Image src={item.product.images[0].url} alt={item.product.title} width={56} height={64} className="object-cover w-full h-full" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-neutral-400"><Tag className="w-6 h-6" /></div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 hidden sm:block">
                                                            <p className="text-xs font-semibold text-[var(--text-primary)] line-clamp-2 max-w-28">{item.product.title}</p>
                                                            {item.sizeVariant && <p className="text-xs text-[var(--text-muted)]">Size: {item.sizeVariant.size}</p>}
                                                            <p className="text-xs text-[var(--text-muted)]">×{item.quantity}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {order.items.length > 4 && (
                                                    <div className="flex-shrink-0 w-14 h-16 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs text-[var(--text-muted)] font-semibold">
                                                        +{order.items.length - 4}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--surface-border)]">
                                                <span className="text-xs text-[var(--text-muted)]">{formatDate(order.createdAt)}</span>
                                                <span className="font-bold text-[var(--text-primary)]">{formatPrice(order.totalAmount)}</span>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <div className="card p-12 text-center">
                                <Package className="w-12 h-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-600" />
                                <p className="font-semibold text-[var(--text-primary)] mb-1">No orders yet</p>
                                <p className="text-sm text-[var(--text-muted)] mb-4">Your orders will appear here after checkout.</p>
                                <Link href="/shop" className="text-sm text-primary-500 hover:text-primary-600 font-semibold transition-colors">Shop Now →</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
