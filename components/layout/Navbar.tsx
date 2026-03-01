"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, X, Search, User, Heart, ChevronDown, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

const navLinks = [
    { label: "Shop", href: "/shop" },
    {
        label: "Collections",
        href: "#",
        children: [
            { label: "Lehengas", href: "/shop?category=lehengas" },
            { label: "Jewellery", href: "/shop?category=jewellery" },
            { label: "Bridal Sets", href: "/shop?category=bridal-sets" },
        ],
    },
    { label: "Rent", href: "/shop?type=rent" },
    { label: "Buy", href: "/shop?type=buy" },
];

export function Navbar() {
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    const { itemCount } = useCart();
    const pathname = usePathname();
    const isHome = pathname === "/";
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <>
            <motion.header
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className={cn(
                    "fixed top-0 left-0 right-0 z-[100] transition-all duration-300",
                    isScrolled || !isHome
                        ? "glass-dark border-b border-white/10 shadow-deep"
                        : "bg-transparent"
                )}
            >
                <div className="container-main">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <span className="font-display font-bold text-2xl lg:text-3xl text-gradient">
                                Radhaan
                            </span>
                        </Link>

                        {/* Desktop Nav Links */}
                        <nav className="hidden lg:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <div
                                    key={link.label}
                                    className="relative"
                                    onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    <Link
                                        href={link.href}
                                        className="flex items-center gap-1 text-sm font-medium text-white/80 hover:text-white transition-colors"
                                    >
                                        {link.label}
                                        {link.children && <ChevronDown className="w-3.5 h-3.5" />}
                                    </Link>

                                    {/* Dropdown */}
                                    <AnimatePresence>
                                        {link.children && activeDropdown === link.label && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 8 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute top-full left-0 mt-2 w-48 glass-dark rounded-xl border border-white/10 shadow-deep overflow-hidden"
                                            >
                                                {link.children.map((child) => (
                                                    <Link
                                                        key={child.label}
                                                        href={child.href}
                                                        className="block px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                                                    >
                                                        {child.label}
                                                    </Link>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </nav>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2 lg:gap-3">
                            <Link href="/shop" className="hidden lg:flex p-2 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                                <Search className="w-5 h-5" />
                            </Link>

                            {/* Cart */}
                            <Link href="/cart" className="relative p-2 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                                <ShoppingBag className="w-5 h-5" />
                                {itemCount > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                                    >
                                        {itemCount > 9 ? "9+" : itemCount}
                                    </motion.span>
                                )}
                            </Link>

                            {/* User Menu */}
                            {isAuthenticated ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-2 p-2 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-gold-500 flex items-center justify-center text-white text-xs font-bold">
                                            {user?.name[0].toUpperCase()}
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {userMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute right-0 top-full mt-2 w-52 glass-dark rounded-xl border border-white/10 shadow-deep overflow-hidden"
                                            >
                                                <div className="px-4 py-3 border-b border-white/10">
                                                    <p className="text-sm font-semibold text-white">{user?.name}</p>
                                                    <p className="text-xs text-white/50 truncate">{user?.email}</p>
                                                </div>
                                                {isAdmin && (
                                                    <Link href="/admin" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setUserMenuOpen(false)}>
                                                        <LayoutDashboard className="w-4 h-4" /> Admin Panel
                                                    </Link>
                                                )}
                                                <Link href="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setUserMenuOpen(false)}>
                                                    <User className="w-4 h-4" /> My Orders
                                                </Link>
                                                <Link href="/dashboard/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setUserMenuOpen(false)}>
                                                    <Settings className="w-4 h-4" /> Settings
                                                </Link>
                                                <button onClick={() => { logout(); setUserMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors border-t border-white/10">
                                                    <LogOut className="w-4 h-4" /> Logout
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <Link
                                    href="/auth/login"
                                    className="hidden lg:inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-glow-primary"
                                >
                                    <User className="w-4 h-4" /> Sign In
                                </Link>
                            )}

                            {/* Mobile menu toggle */}
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="lg:hidden p-2 text-white/70 hover:text-white transition-colors"
                            >
                                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed inset-0 z-[99] lg:hidden"
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                        <div className="absolute right-0 top-0 h-full w-80 max-w-[90vw] glass-dark border-l border-white/10 flex flex-col">
                            <div className="flex items-center justify-between p-5 border-b border-white/10">
                                <span className="font-display font-bold text-xl text-gradient">Radhaan</span>
                                <button onClick={() => setMobileOpen(false)} className="p-2 text-white/70 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <nav className="flex-1 overflow-y-auto p-5 space-y-1">
                                {navLinks.map((link) => (
                                    <div key={link.label}>
                                        <Link href={link.href} onClick={() => setMobileOpen(false)}
                                            className="block px-3 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/5 font-medium transition-colors">
                                            {link.label}
                                        </Link>
                                        {link.children?.map((child) => (
                                            <Link key={child.label} href={child.href} onClick={() => setMobileOpen(false)}
                                                className="block px-6 py-2 text-sm text-white/60 hover:text-white/80 transition-colors">
                                                {child.label}
                                            </Link>
                                        ))}
                                    </div>
                                ))}
                            </nav>
                            <div className="p-5 border-t border-white/10">
                                {isAuthenticated ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 px-3 py-2">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-gold-500 flex items-center justify-center text-white font-bold">
                                                {user?.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-white">{user?.name}</p>
                                                <p className="text-xs text-white/50">{user?.role}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => { logout(); setMobileOpen(false); }}
                                            className="w-full text-left px-3 py-2.5 rounded-lg text-red-400 hover:bg-white/5 text-sm transition-colors flex items-center gap-2">
                                            <LogOut className="w-4 h-4" /> Logout
                                        </button>
                                    </div>
                                ) : (
                                    <Link href="/auth/login" onClick={() => setMobileOpen(false)}
                                        className="block w-full text-center py-2.5 bg-primary-500 text-white rounded-lg font-medium text-sm hover:bg-primary-600 transition-colors">
                                        Sign In
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
