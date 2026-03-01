"use client";

import { motion } from "framer-motion";
import { ShoppingBag, CalendarDays, Truck, RotateCcw } from "lucide-react";
import { ANIMATION_VARIANTS } from "@/lib/utils";

const steps = [
    { icon: <ShoppingBag className="w-6 h-6" />, title: "Browse & Select", desc: "Explore hundreds of premium lehengas and jewellery sets." },
    { icon: <CalendarDays className="w-6 h-6" />, title: "Choose Dates", desc: "Pick your rental period with our real-time availability calendar." },
    { icon: <Truck className="w-6 h-6" />, title: "We Deliver", desc: "Guaranteed delivery before your event date — across India." },
    { icon: <RotateCcw className="w-6 h-6" />, title: "Return", desc: "Easy pickup & return. Deposit refunded within 48 hours." },
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-20 bg-[var(--surface-bg)]">
            <div className="container-main">
                <motion.div variants={ANIMATION_VARIANTS.fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
                    <p className="text-sm font-semibold text-gold-500 uppercase tracking-widest mb-3">Simple Process</p>
                    <h2 className="font-display text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">How Renting Works</h2>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {steps.map((s, i) => (
                        <motion.div
                            key={s.title}
                            variants={ANIMATION_VARIANTS.fadeInUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.12 }}
                            className="relative text-center"
                        >
                            <div className="flex flex-col items-center">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-glow-primary mb-4">
                                    {s.icon}
                                </div>
                                {i < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-7 left-[calc(50%+32px)] right-[calc(-50%+32px)] h-0.5 bg-gradient-to-r from-primary-500/50 to-transparent" />
                                )}
                                <span className="text-4xl font-bold text-primary-500/10 dark:text-primary-500/20 font-display absolute -top-2 left-1/2 -translate-x-1/2">{i + 1}</span>
                                <h3 className="font-semibold text-[var(--text-primary)] mb-2">{s.title}</h3>
                                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{s.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
