"use client";

import { motion } from "framer-motion";
import { Shield, Truck, RotateCcw, Star } from "lucide-react";
import { ANIMATION_VARIANTS } from "@/lib/utils";

export function TrustSection() {
    const badges = [
        { icon: <Shield className="w-5 h-5" />, text: "Secure Payments" },
        { icon: <Truck className="w-5 h-5" />, text: "Free Delivery" },
        { icon: <RotateCcw className="w-5 h-5" />, text: "Easy Returns" },
        { icon: <Star className="w-5 h-5 fill-current" />, text: "4.9★ Rated" },
    ];

    return (
        <section className="py-10 border-y border-[var(--surface-border)]">
            <div className="container-main">
                <div className="flex flex-wrap justify-center gap-8 lg:gap-16">
                    {badges.map((b) => (
                        <motion.div
                            key={b.text}
                            variants={ANIMATION_VARIANTS.fadeIn}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="flex items-center gap-2.5 text-[var(--text-secondary)]"
                        >
                            <span className="text-primary-500">{b.icon}</span>
                            <span className="font-semibold text-sm">{b.text}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
