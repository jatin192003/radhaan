"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const InputField = ({ icon: Icon, ...props }: { icon: React.ElementType } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        <input {...props} className={cn("input-base pl-10", props.className)} />
    </div>
);

export default function LoginPage() {
    const { login, register } = useAuth();
    const router = useRouter();
    const [mode, setMode] = useState<"login" | "register">("login");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (mode === "login") {
                await login(form.email, form.password);
            } else {
                await register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
            }
            router.push("/");
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--surface-bg)] px-4 py-20">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(248,59,98,0.05)_0%,_transparent_70%)] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <span className="font-display font-bold text-4xl text-gradient">Radhaan</span>
                    </Link>
                    <p className="text-[var(--text-muted)] mt-2 text-sm">Premium Bridal Fashion</p>
                </div>

                {/* Card */}
                <div className="card p-8">
                    {/* Tab Toggle */}
                    <div className="flex rounded-xl bg-neutral-100 dark:bg-neutral-800 p-1 mb-7">
                        {(["login", "register"] as const).map((m) => (
                            <button key={m} onClick={() => setMode(m)} className={cn("flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-200",
                                mode === m ? "bg-white dark:bg-neutral-700 text-[var(--text-primary)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]")}>
                                {m === "login" ? "Sign In" : "Create Account"}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === "register" && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.2 }}>
                                <InputField icon={User} type="text" placeholder="Full Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                            </motion.div>
                        )}
                        <InputField icon={Mail} type="email" placeholder="Email Address" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder={mode === "register" ? "Password (min. 8 chars, 1 uppercase, 1 number)" : "Password"}
                                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required
                                className="input-base pl-10 pr-10" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {mode === "register" && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.2 }}>
                                <InputField icon={Phone} type="tel" placeholder="Phone Number (optional)" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                            </motion.div>
                        )}
                        {mode === "login" && (
                            <div className="text-right">
                                <Link href="/auth/forgot-password" className="text-xs text-primary-500 hover:text-primary-600 transition-colors">Forgot Password?</Link>
                            </div>
                        )}
                        <Button type="submit" fullWidth size="lg" isLoading={isLoading} icon={mode === "register" ? <Sparkles className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />} iconPosition="right">
                            {mode === "login" ? "Sign In" : "Create Account"}
                        </Button>
                    </form>
                </div>

                <p className="text-center text-sm text-[var(--text-muted)] mt-5">
                    {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-primary-500 hover:text-primary-600 font-semibold transition-colors">
                        {mode === "login" ? "Sign up" : "Sign in"}
                    </button>
                </p>
            </motion.div>
        </div>
    );
}
