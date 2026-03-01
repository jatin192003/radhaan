"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
    Star, ChevronLeft, ChevronRight, CalendarDays, ShoppingBag,
    Shield, Truck, RotateCcw, Tag, Share2, Heart
} from "lucide-react";
import { productsApi } from "@/lib/api-client";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn, formatPrice, calculateRentalDays } from "@/lib/utils";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ProductDetailPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const { addItem } = useCart();
    const { isAuthenticated } = useAuth();

    const [activeImg, setActiveImg] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
    const [orderType, setOrderType] = useState<"PURCHASE" | "RENTAL">("PURCHASE");
    const [rentalStart, setRentalStart] = useState("");
    const [rentalEnd, setRentalEnd] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");

    const { data, isLoading } = useQuery({
        queryKey: ["product", id],
        queryFn: () => productsApi.get(id).then((r) => r.data),
    });
    const product = data;

    const rentalDays = rentalStart && rentalEnd ? calculateRentalDays(rentalStart, rentalEnd) : 0;
    const rentalCost = rentalDays * (product?.rentalPricePerDay ?? 0);

    const handleAddToCart = async () => {
        if (!isAuthenticated) { toast.error("Please sign in first"); router.push("/auth/login"); return; }
        if (!selectedSize && product?.sizeVariants?.length > 0) { toast.error("Please select a size"); return; }
        if (orderType === "RENTAL" && (!rentalStart || !rentalEnd)) { toast.error("Please select rental dates"); return; }

        setIsAdding(true);
        try {
            await addItem({
                type: orderType,
                productId: id,
                sizeVariantId: selectedSizeId || undefined,
                quantity: 1,
                ...(orderType === "RENTAL" ? {
                    rentalStart: new Date(rentalStart).toISOString(),
                    rentalEnd: new Date(rentalEnd).toISOString(),
                } : {}),
            });
        } finally {
            setIsAdding(false);
        }
    };

    if (isLoading) {
        return (
            <div className="pt-20 container-main py-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <Skeleton className="w-full rounded-2xl" style={{ aspectRatio: "3/4" }} />
                    <div className="space-y-4">
                        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className={`h-8 w-${i % 2 === 0 ? "full" : "3/4"}`} />)}
                    </div>
                </div>
            </div>
        );
    }

    if (!product) return <div className="pt-36 text-center text-[var(--text-muted)]">Product not found.</div>;

    return (
        <div className="pt-20 min-h-screen bg-[var(--surface-bg)]">
            <div className="container-main py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-6">
                    <Link href="/" className="hover:text-primary-500 transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/shop" className="hover:text-primary-500 transition-colors">Shop</Link>
                    <span>/</span>
                    <Link href={`/shop?category=${product.category.slug}`} className="hover:text-primary-500 transition-colors">{product.category.name}</Link>
                    <span>/</span>
                    <span className="text-[var(--text-primary)] truncate max-w-40">{product.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
                    {/* Image Gallery */}
                    <div className="space-y-3">
                        <motion.div
                            key={activeImg}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="relative rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800"
                            style={{ aspectRatio: "3/4" }}
                        >
                            {product.images[activeImg]?.url ? (
                                <Image src={product.images[activeImg].url} alt={product.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-neutral-300 dark:text-neutral-600">
                                    <Tag className="w-20 h-20" />
                                </div>
                            )}
                            {product.images.length > 1 && (
                                <>
                                    <button onClick={() => setActiveImg(p => Math.max(0, p - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-black/60 flex items-center justify-center shadow-md hover:bg-white transition-colors">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => setActiveImg(p => Math.min(product.images.length - 1, p + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-black/60 flex items-center justify-center shadow-md hover:bg-white transition-colors">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </motion.div>
                        {product.images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                                {product.images.map((img: { url: string }, i: number) => (
                                    <button key={i} onClick={() => setActiveImg(i)} className={cn("flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all", i === activeImg ? "border-primary-500 scale-105" : "border-transparent opacity-60 hover:opacity-100")}>
                                        <Image src={img.url} alt="" width={64} height={80} className="object-cover w-full h-full" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <p className="text-sm text-primary-500 font-semibold uppercase tracking-wider mb-1">{product.category.name}</p>
                            <h1 className="font-display text-2xl lg:text-3xl font-bold text-[var(--text-primary)] mb-3">{product.title}</h1>
                            {product.averageRating > 0 && (
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="flex">{[1, 2, 3, 4, 5].map(s => <Star key={s} className={cn("w-4 h-4", s <= Math.round(product.averageRating) ? "fill-gold-400 text-gold-400" : "text-neutral-300")} />)}</div>
                                    <span className="text-sm text-[var(--text-muted)]">{product.averageRating.toFixed(1)} ({product.totalReviews} reviews)</span>
                                </div>
                            )}

                            {/* Pricing */}
                            <div className="flex flex-wrap gap-4">
                                {product.purchaseEnabled && product.purchasePrice && (
                                    <div className="card px-4 py-3">
                                        <p className="text-xs text-[var(--text-muted)] mb-0.5 flex items-center gap-1"><Tag className="w-3 h-3" /> Purchase Price</p>
                                        <p className="text-xl font-bold text-primary-500">{formatPrice(product.purchasePrice)}</p>
                                    </div>
                                )}
                                {product.rentalEnabled && product.rentalPricePerDay && (
                                    <div className="card px-4 py-3">
                                        <p className="text-xs text-[var(--text-muted)] mb-0.5 flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Rental Price</p>
                                        <p className="text-xl font-bold text-gold-600 dark:text-gold-400">{formatPrice(product.rentalPricePerDay)}<span className="text-sm font-normal text-[var(--text-muted)]">/day</span></p>
                                        {product.deposit > 0 && <p className="text-xs text-[var(--text-muted)] mt-0.5">+ {formatPrice(product.deposit)} deposit</p>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Size Selection */}
                        {product.sizeVariants?.length > 0 && (
                            <div>
                                <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">Size <span className="text-[var(--text-muted)] font-normal">({selectedSize || "Select"})</span></p>
                                <div className="flex flex-wrap gap-2">
                                    {product.sizeVariants.map((sv: { id: string; size: string; stock: number }) => (
                                        <button key={sv.id} disabled={sv.stock === 0} onClick={() => { setSelectedSize(sv.size); setSelectedSizeId(sv.id); }}
                                            className={cn("px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all",
                                                sv.stock === 0 ? "opacity-40 cursor-not-allowed border-[var(--surface-border)] text-[var(--text-muted)] line-through" :
                                                    selectedSize === sv.size ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400" :
                                                        "border-[var(--surface-border)] text-[var(--text-secondary)] hover:border-primary-400")}>
                                            {sv.size}
                                            {sv.stock === 0 && <span className="block text-[10px] font-normal">Out</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Order Type Toggle */}
                        {product.rentalEnabled && product.purchaseEnabled && (
                            <div>
                                <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">How would you like it?</p>
                                <div className="flex rounded-xl overflow-hidden border border-[var(--surface-border)]">
                                    {product.purchaseEnabled && (
                                        <button onClick={() => setOrderType("PURCHASE")} className={cn("flex-1 py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5", orderType === "PURCHASE" ? "bg-primary-500 text-white" : "text-[var(--text-secondary)] hover:bg-neutral-50 dark:hover:bg-neutral-800")}>
                                            <Tag className="w-4 h-4" /> Buy
                                        </button>
                                    )}
                                    {product.rentalEnabled && (
                                        <button onClick={() => setOrderType("RENTAL")} className={cn("flex-1 py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5", orderType === "RENTAL" ? "bg-gold-500 text-white" : "text-[var(--text-secondary)] hover:bg-neutral-50 dark:hover:bg-neutral-800")}>
                                            <CalendarDays className="w-4 h-4" /> Rent
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Rental Date Picker */}
                        <AnimatePresence>
                            {orderType === "RENTAL" && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <div className="grid grid-cols-2 gap-3 p-4 card bg-gold-50/50 dark:bg-gold-900/10 border border-gold-200 dark:border-gold-800">
                                        <div>
                                            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Pick-up Date</label>
                                            <input type="date" value={rentalStart} min={new Date().toISOString().split("T")[0]} onChange={e => setRentalStart(e.target.value)} className="input-base text-sm" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Return Date</label>
                                            <input type="date" value={rentalEnd} min={rentalStart || new Date().toISOString().split("T")[0]} onChange={e => setRentalEnd(e.target.value)} className="input-base text-sm" />
                                        </div>
                                        {rentalDays > 0 && (
                                            <div className="col-span-2 p-3 bg-gold-100 dark:bg-gold-900/20 rounded-lg text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-[var(--text-secondary)]">{rentalDays} days × {formatPrice(product.rentalPricePerDay)}</span>
                                                    <span className="font-bold text-gold-700 dark:text-gold-400">{formatPrice(rentalCost)}</span>
                                                </div>
                                                {product.deposit > 0 && (
                                                    <div className="flex justify-between mt-1 text-[var(--text-muted)]">
                                                        <span>Security deposit</span>
                                                        <span>{formatPrice(product.deposit)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between mt-1.5 font-bold border-t border-gold-200 dark:border-gold-700 pt-1.5">
                                                    <span>Total Payable</span>
                                                    <span className="text-gold-700 dark:text-gold-400">{formatPrice(rentalCost + (product.deposit ?? 0))}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* CTA Buttons */}
                        <div className="flex gap-3">
                            <Button onClick={handleAddToCart} isLoading={isAdding} fullWidth size="lg"
                                variant={orderType === "RENTAL" ? "gold" : "primary"}
                                icon={orderType === "RENTAL" ? <CalendarDays className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}>
                                {orderType === "RENTAL" ? "Reserve Now" : "Add to Cart"}
                            </Button>
                            <button className="p-3 rounded-xl border border-[var(--surface-border)] text-[var(--text-muted)] hover:text-primary-500 hover:border-primary-300 transition-colors">
                                <Heart className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Trust Strips */}
                        <div className="flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
                            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-green-500" /> Secure Checkout</span>
                            <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-blue-500" /> Free Delivery</span>
                            <span className="flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5 text-gold-500" /> Easy Returns</span>
                        </div>

                        {/* Tabs */}
                        <div className="border-t border-[var(--surface-border)] pt-5">
                            <div className="flex gap-1 mb-4">
                                {(["description", "reviews"] as const).map(tab => (
                                    <button key={tab} onClick={() => setActiveTab(tab)}
                                        className={cn("px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors",
                                            activeTab === tab ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]")}>
                                        {tab} {tab === "reviews" && product.totalReviews > 0 && `(${product.totalReviews})`}
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {activeTab === "description" ? (
                                    <motion.div key="desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{product.description}</p>
                                    </motion.div>
                                ) : (
                                    <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        {product.reviews?.length ? (
                                            <div className="space-y-4 max-h-72 overflow-y-auto pr-1 scrollbar-hide">
                                                {product.reviews.map((r: { id: string; user: { name: string }; rating: number; comment?: string; createdAt: string }) => (
                                                    <div key={r.id} className="card p-3.5 space-y-1.5">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-semibold text-[var(--text-primary)]">{r.user.name}</p>
                                                            <div className="flex">{[1, 2, 3, 4, 5].map(s => <Star key={s} className={cn("w-3.5 h-3.5", s <= r.rating ? "fill-gold-400 text-gold-400" : "text-neutral-300")} />)}</div>
                                                        </div>
                                                        {r.comment && <p className="text-sm text-[var(--text-secondary)]">{r.comment}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-[var(--text-muted)]">No reviews yet. Be the first!</p>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
