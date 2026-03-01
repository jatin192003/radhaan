"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ChevronRight } from "lucide-react";
import { ANIMATION_VARIANTS } from "@/lib/utils";

export function CTABanner() {
    return (
        <section className="py-20">
            <div className="container-main">
                <motion.div
                    variants={ANIMATION_VARIANTS.scaleIn}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="relative rounded-3xl overflow-hidden bg-hero-gradient text-white p-10 lg:p-16 text-center"
                >
                    <div className="absolute inset-0 dot-pattern opacity-20" />
                    <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary-500/10 blur-3xl" />
                    <div className="relative z-10">
                        <h2 className="font-display text-3xl lg:text-5xl font-bold mb-4">
                            Your Big Day Deserves the{" "}
                            <span className="text-gradient-gold">Best Look</span>
                        </h2>
                        <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
                            Join over 1,000 brides who trusted Radhaan for their special occasions.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link href="/shop" className="inline-flex items-center gap-2 h-14 px-8 text-lg rounded-xl font-semibold bg-gold-500 hover:bg-gold-600 text-white shadow-sm hover:shadow-glow-gold transition-all duration-200">
                                <Sparkles className="w-5 h-5" /> Explore Collection
                            </Link>
                            <Link href="/shop?type=rent" className="inline-flex items-center gap-2 h-14 px-8 text-lg rounded-xl font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all duration-200">
                                How Renting Works <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
