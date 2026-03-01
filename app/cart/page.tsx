"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ShoppingBag, ArrowRight, CalendarDays, Tag, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ordersApi } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { cn, formatPrice, calculateRentalDays } from "@/lib/utils";
import Link from "next/link";
import toast from "react-hot-toast";

export default function CartPage() {
    const { cart, removeItem, isLoading } = useCart();
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const handleCheckout = async () => {
        if (!isAuthenticated) { router.push("/auth/login"); return; }
        setIsCheckingOut(true);
        try {
            const res = await ordersApi.create();
            toast.success("Order placed successfully!");
            router.push(`/dashboard/orders/${res.data.id}`);
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Checkout failed");
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (!cart.items.length) {
        return (
            <div className="pt-20 min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }}>
                    <div className="w-24 h-24 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-12 h-12 text-neutral-300 dark:text-neutral-600" />
                    </div>
                    <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Your Cart is Empty</h1>
                    <p className="text-[var(--text-muted)] mt-2 mb-6">Discover our stunning collection of bridal wear.</p>
                    <Link href="/shop" className="inline-flex items-center gap-2 h-12 px-6 text-base rounded-xl font-semibold bg-primary-500 hover:bg-primary-600 text-white transition-all duration-200">
                        Explore Collection <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="pt-20 min-h-screen bg-[var(--surface-bg)]">
            <div className="container-main py-8">
                <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="font-display text-2xl lg:text-3xl font-bold text-[var(--text-primary)] mb-8">
                    Shopping Cart <span className="text-primary-500">({cart.items.length} item{cart.items.length !== 1 ? "s" : ""})</span>
                </motion.h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        <AnimatePresence>
                            {cart.items.map((item) => {
                                const imgUrl = item.product.images?.[0]?.url;
                                const rentalDays = item.rentalStart && item.rentalEnd
                                    ? calculateRentalDays(item.rentalStart, item.rentalEnd) : 0;
                                const lineTotal = item.type === "RENTAL"
                                    ? (item.product.rentalPricePerDay ?? 0) * rentalDays * item.quantity
                                    : (item.product.purchasePrice ?? 0) * item.quantity;

                                return (
                                    <motion.div key={item.id} layout exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                                        className="card p-4 flex gap-4">
                                        {/* Image */}
                                        <div className="relative w-20 h-24 sm:w-24 sm:h-28 flex-shrink-0 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                                            {imgUrl ? (
                                                <Image src={imgUrl} alt={item.product.title} fill className="object-cover" sizes="96px" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
                                                    <Tag className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <Link href={`/shop/${item.product.id}`} className="font-semibold text-[var(--text-primary)] hover:text-primary-500 transition-colors line-clamp-2 text-sm lg:text-base leading-snug">
                                                    {item.product.title}
                                                </Link>
                                                <button onClick={() => removeItem(item.id)} disabled={isLoading}
                                                    className="flex-shrink-0 p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                <span className={cn("badge text-xs", item.type === "RENTAL" ? "bg-gold-100 text-gold-700 dark:bg-gold-900/30 dark:text-gold-400" : "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400")}>
                                                    {item.type === "RENTAL" ? <><CalendarDays className="w-3 h-3" /> Rental</> : <><Tag className="w-3 h-3" /> Purchase</>}
                                                </span>
                                                {item.sizeVariant && <span className="text-xs text-[var(--text-muted)]">Size: {item.sizeVariant.size}</span>}
                                            </div>
                                            {item.type === "RENTAL" && item.rentalStart && item.rentalEnd && (
                                                <p className="text-xs text-[var(--text-muted)] mt-1">
                                                    {new Date(item.rentalStart).toLocaleDateString("en-IN")} → {new Date(item.rentalEnd).toLocaleDateString("en-IN")}
                                                    <span className="ml-1 font-semibold text-gold-600 dark:text-gold-400">({rentalDays} days)</span>
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs text-[var(--text-muted)]">Qty: {item.quantity}</span>
                                                <span className="font-bold text-[var(--text-primary)]">{formatPrice(lineTotal)}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-1">
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="card p-6 sticky top-24 space-y-4">
                            <h2 className="font-semibold text-lg text-[var(--text-primary)]">Order Summary</h2>
                            <div className="space-y-2.5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--text-secondary)]">Subtotal</span>
                                    <span className="font-semibold text-[var(--text-primary)]">{formatPrice(cart.subtotal)}</span>
                                </div>
                                {cart.totalDeposit > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[var(--text-secondary)]">Security Deposit</span>
                                        <span className="font-semibold text-[var(--text-primary)]">{formatPrice(cart.totalDeposit)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                                    <span>Delivery</span>
                                    <span className="font-semibold">FREE</span>
                                </div>
                            </div>
                            <hr className="border-[var(--surface-border)]" />
                            <div className="flex justify-between font-bold">
                                <span>Total Payable</span>
                                <span className="text-primary-500 text-lg">{formatPrice(cart.totalPayable)}</span>
                            </div>
                            {cart.totalDeposit > 0 && (
                                <p className="text-xs text-[var(--text-muted)] bg-gold-50 dark:bg-gold-900/10 p-2.5 rounded-lg border border-gold-200 dark:border-gold-800">
                                    💡 Deposit of {formatPrice(cart.totalDeposit)} will be refunded after items are returned in good condition.
                                </p>
                            )}
                            <Button fullWidth size="lg" isLoading={isCheckingOut} onClick={handleCheckout} icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
                                Place Order
                            </Button>
                            <p className="text-xs text-center text-[var(--text-muted)]">Payment gateway integration coming soon</p>
                            <div className="text-center">
                                <Link href="/shop" className="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors">Continue Shopping</Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
