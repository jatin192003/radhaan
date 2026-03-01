"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Star, Tag, CalendarDays } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useState } from "react";

interface Product {
    id: string;
    title: string;
    rentalPricePerDay?: number;
    purchasePrice?: number;
    deposit?: number;
    rentalEnabled: boolean;
    purchaseEnabled: boolean;
    averageRating?: number;
    totalReviews?: number;
    category: { name: string; slug: string };
    images: { url: string }[];
    sizeVariants?: { size: string; stock: number }[];
}

interface ProductCardProps {
    product: Product;
    className?: string;
    index?: number;
}

export function ProductCard({ product, className, index = 0 }: ProductCardProps) {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);
    const imageUrl = product.images?.[0]?.url;

    const hasRent = product.rentalEnabled && product.rentalPricePerDay;
    const hasBuy = product.purchaseEnabled && product.purchasePrice;

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: index * 0.08, ease: [0.4, 0, 0.2, 1] }}
            className={cn("group relative", className)}
        >
            <Link href={`/shop/${product.id}`} className="block">
                <div className="card overflow-hidden hover:-translate-y-1 transition-transform duration-300">
                    {/* Image Container */}
                    <div className="relative overflow-hidden bg-neutral-100 dark:bg-neutral-800" style={{ aspectRatio: "3/4" }}>
                        {!imgLoaded && (
                            <div className="absolute inset-0 skeleton" />
                        )}
                        {imageUrl ? (
                            <Image
                                src={imageUrl}
                                alt={product.title}
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                className={cn(
                                    "object-cover transition-transform duration-700 group-hover:scale-105",
                                    imgLoaded ? "opacity-100" : "opacity-0"
                                )}
                                onLoad={() => setImgLoaded(true)}
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-neutral-400 dark:text-neutral-600">
                                <Tag className="w-12 h-12" />
                            </div>
                        )}

                        {/* Overlay badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                            {hasRent && (
                                <span className="badge bg-gold-500/90 text-white backdrop-blur-sm">
                                    <CalendarDays className="w-3 h-3" /> Rent
                                </span>
                            )}
                            {hasBuy && (
                                <span className="badge bg-primary-500/90 text-white backdrop-blur-sm">
                                    <Tag className="w-3 h-3" /> Buy
                                </span>
                            )}
                        </div>

                        {/* Wishlist button */}
                        <button
                            onClick={(e) => { e.preventDefault(); setIsWishlisted(!isWishlisted); }}
                            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-md"
                        >
                            <Heart className={cn("w-4 h-4 transition-colors", isWishlisted ? "fill-primary-500 text-primary-500" : "text-neutral-600 dark:text-neutral-300")} />
                        </button>

                        {/* Quick view overlay */}
                        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-end pb-3 justify-center">
                            <span className="text-white text-xs font-semibold tracking-wide">Quick View</span>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="p-3.5">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1 font-medium uppercase tracking-wide">
                            {product.category.name}
                        </p>
                        <h3 className="font-semibold text-neutral-900 dark:text-white text-sm leading-snug line-clamp-2 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {product.title}
                        </h3>

                        {/* Rating */}
                        {(product.averageRating ?? 0) > 0 && (
                            <div className="flex items-center gap-1 mb-2">
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star
                                            key={s}
                                            className={cn("w-3 h-3", s <= Math.round(product.averageRating ?? 0) ? "fill-gold-400 text-gold-400" : "text-neutral-300 dark:text-neutral-600")}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs text-neutral-400 dark:text-neutral-500">({product.totalReviews})</span>
                            </div>
                        )}

                        {/* Pricing */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                            {hasRent && (
                                <span className="price-tag-rent text-sm">
                                    {formatPrice(product.rentalPricePerDay!)}<span className="font-normal text-xs text-neutral-500 dark:text-neutral-400">/day</span>
                                </span>
                            )}
                            {hasBuy && (
                                <span className={cn("text-sm", hasBuy ? "price-tag" : "price-tag")}>
                                    {formatPrice(product.purchasePrice!)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
