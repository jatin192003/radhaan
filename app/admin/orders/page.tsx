"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Check, Clock, Truck, Package, RotateCcw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { adminApi } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn, formatDate, formatPrice, getOrderStatusColor, getOrderTypeLabel } from "@/lib/utils";
import Link from "next/link";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["", "PENDING", "CONFIRMED", "DISPATCHED", "DELIVERED", "RETURNED", "CANCELLED"];
const STATUS_ICONS: Record<string, React.ReactNode> = {
    PENDING: <Clock className="w-3 h-3" />,
    CONFIRMED: <Check className="w-3 h-3" />,
    DISPATCHED: <Truck className="w-3 h-3" />,
    DELIVERED: <Package className="w-3 h-3" />,
    RETURNED: <RotateCcw className="w-3 h-3" />,
    CANCELLED: <X className="w-3 h-3" />,
};

export default function AdminOrdersPage() {
    const { isAdmin, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !isAdmin) router.replace("/");
    }, [authLoading, isAdmin, router]);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["admin-orders", page, statusFilter, typeFilter],
        queryFn: () => adminApi.listOrders({ page, limit: 20, ...(statusFilter ? { status: statusFilter } : {}), ...(typeFilter ? { type: typeFilter } : {}) }).then((r) => r.data),
        enabled: isAdmin,
    });

    const handleStatusUpdate = async (orderId: string, status: string) => {
        setUpdatingId(orderId);
        try {
            await adminApi.updateOrderStatus(orderId, { status });
            toast.success(`Order status updated to ${status}`);
            refetch();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to update status");
        } finally {
            setUpdatingId(null);
        }
    };

    if (authLoading) return (
        <div className="pt-20 min-h-screen flex items-center justify-center bg-[var(--surface-bg)]">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
    );
    if (!isAdmin) return null;
    const orders = data?.orders ?? [];

    return (
        <div className="pt-20 min-h-screen bg-[var(--surface-bg)]">
            <div className="bg-hero-gradient text-white py-10">
                <div className="container-main">
                    <h1 className="font-display text-2xl lg:text-3xl font-bold mb-1">Orders</h1>
                    <p className="text-white/50 text-sm">{data?.pagination?.total ?? 0} total orders</p>
                </div>
            </div>

            <div className="container-main py-8">
                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input-base w-auto">
                        <option value="">All Statuses</option>
                        {STATUS_OPTIONS.slice(1).map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                    </select>
                    <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} className="input-base w-auto">
                        <option value="">All Types</option>
                        <option value="RENT">Rental</option>
                        <option value="PURCHASE">Purchase</option>
                        <option value="MIXED">Mixed</option>
                    </select>
                    {(statusFilter || typeFilter) && (
                        <button onClick={() => { setStatusFilter(""); setTypeFilter(""); setPage(1); }}
                            className="flex items-center gap-1.5 text-sm text-primary-500 hover:text-primary-600 font-medium px-3 py-2 rounded-lg border border-primary-200 dark:border-primary-800 transition-colors">
                            <X className="w-3.5 h-3.5" /> Clear
                        </button>
                    )}
                </div>

                {/* Orders Table */}
                {isLoading ? (
                    <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
                ) : orders.length ? (
                    <>
                        <div className="card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-[var(--surface-border)] bg-neutral-50 dark:bg-neutral-900/50">
                                            {["Order ID", "Customer", "Type", "Items", "Total", "Date", "Status", "Action"].map(h => (
                                                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--surface-border)]">
                                        {orders.map((order: {
                                            id: string; orderType: string; status: string; totalAmount: number;
                                            createdAt: string; user: { name: string; email: string };
                                            items: Array<{ id: string; product: { title: string } }>;
                                        }) => (
                                            <tr key={order.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <Link href={`/orders/${order.id}`} className="font-mono text-xs text-primary-500 hover:text-primary-600 transition-colors">
                                                        #{order.id.slice(-8).toUpperCase()}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-[var(--text-primary)] text-xs">{order.user.name}</p>
                                                    <p className="text-[var(--text-muted)] text-xs">{order.user.email}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={cn("badge text-xs", order.orderType === "RENT" ? "bg-gold-100 text-gold-700 dark:bg-gold-900/30 dark:text-gold-400" : "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400")}>
                                                        {getOrderTypeLabel(order.orderType)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</td>
                                                <td className="px-4 py-3 font-semibold text-[var(--text-primary)] text-xs">{formatPrice(order.totalAmount)}</td>
                                                <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{formatDate(order.createdAt)}</td>
                                                <td className="px-4 py-3">
                                                    <span className={cn("badge text-xs", getOrderStatusColor(order.status))}>
                                                        {STATUS_ICONS[order.status]} {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={order.status}
                                                        disabled={updatingId === order.id}
                                                        onChange={e => handleStatusUpdate(order.id, e.target.value)}
                                                        className="text-xs border border-[var(--surface-border)] rounded-lg px-2 py-1 bg-[var(--surface-card)] text-[var(--text-secondary)] cursor-pointer hover:border-primary-400 transition-colors disabled:opacity-50"
                                                    >
                                                        {STATUS_OPTIONS.slice(1).map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {data?.pagination?.totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-6">
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
                        <Package className="w-12 h-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-600" />
                        <p className="font-semibold text-[var(--text-primary)]">No orders found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
