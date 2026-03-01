"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { CalendarDays, ShoppingBag, Sparkles, Star } from "lucide-react";

export function HeroSection() {
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 500], [0, 150]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    return (
        <section className="relative min-h-screen flex items-center overflow-hidden bg-hero-gradient">
            {/* Background parallax layer */}
            <motion.div style={{ y }} className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(248,59,98,0.15)_0%,_transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(221,142,14,0.1)_0%,_transparent_60%)]" />
                <div className="absolute inset-0 dot-pattern opacity-30" />
            </motion.div>

            {/* Floating decorative elements */}
            <div className="absolute top-1/4 right-[10%] w-72 h-72 rounded-full bg-primary-600/10 blur-3xl animate-float pointer-events-none" />
            <div className="absolute bottom-1/4 left-[5%] w-56 h-56 rounded-full bg-gold-500/10 blur-3xl animate-float pointer-events-none" style={{ animationDelay: "2s" }} />

            <motion.div style={{ opacity }} className="container-main relative z-10 pt-24 pb-16 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                {/* Left text */}
                <div className="flex-1 text-center lg:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
                    >
                        <Sparkles className="w-4 h-4 text-gold-400" />
                        <span className="text-sm text-white/70 font-medium">Premium Bridal Fashion</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] mb-6"
                    >
                        Your Dream{" "}
                        <span className="text-gradient">Bridal Look</span>,{" "}
                        Made Affordable
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg lg:text-xl text-white/60 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
                    >
                        Rent or purchase stunning Lehengas and Jewellery for your wedding, reception, or festive occasion. Premium quality, guaranteed delivery.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
                    >
                        <Link href="/shop" className="inline-flex items-center gap-2 h-14 px-8 text-lg rounded-xl font-semibold bg-primary-500 hover:bg-primary-600 text-white shadow-sm hover:shadow-glow-primary transition-all duration-200">
                            <ShoppingBag className="w-5 h-5" /> Shop Now
                        </Link>
                        <Link href="/shop?type=rent" className="inline-flex items-center gap-2 h-14 px-8 text-lg rounded-xl font-semibold border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-200">
                            <CalendarDays className="w-5 h-5" /> Rent Outfits
                        </Link>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="flex flex-wrap justify-center lg:justify-start gap-8 mt-12"
                    >
                        {[
                            { value: "500+", label: "Outfits" },
                            { value: "1000+", label: "Happy Brides" },
                            { value: "4.9★", label: "Rating" },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="text-2xl font-bold text-white">{stat.value}</div>
                                <div className="text-xs text-white/40 uppercase tracking-widest mt-0.5">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Right — hero image mosaic */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                    className="flex-1 w-full max-w-sm lg:max-w-lg"
                >
                    <div className="relative">
                        <div className="relative rounded-3xl overflow-hidden shadow-deep" style={{ aspectRatio: "4/5" }}>
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-900/50 to-neutral-900/50" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center p-8">
                                    <div className="font-display text-6xl font-bold text-white/20 mb-2">र</div>
                                    <div className="text-white/40 text-sm">Product images will appear here</div>
                                </div>
                            </div>
                        </div>
                        {/* Floating card */}
                        <motion.div
                            animate={{ y: [-4, 4, -4] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -bottom-6 -left-6 glass-dark rounded-2xl p-4 shadow-deep border border-white/10"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center">
                                    <Star className="w-5 h-5 text-white fill-white" />
                                </div>
                                <div>
                                    <div className="text-white text-sm font-semibold">4.9/5 Rating</div>
                                    <div className="text-white/50 text-xs">1000+ reviews</div>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            animate={{ y: [4, -4, 4] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -top-4 -right-4 glass-dark rounded-2xl p-3 shadow-deep border border-white/10"
                        >
                            <div className="flex items-center gap-2">
                                <CalendarDays className="w-4 h-4 text-gold-400" />
                                <span className="text-white text-xs font-semibold">Free Delivery</span>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <span className="text-white/30 text-xs tracking-widest">SCROLL</span>
                <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-0.5 h-8 bg-gradient-to-b from-white/30 to-transparent rounded-full"
                />
            </motion.div>
        </section>
    );
}
