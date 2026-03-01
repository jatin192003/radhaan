import Link from "next/link";
import { Instagram, Facebook, Youtube, Heart, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
    Shop: [
        { label: "Lehengas", href: "/shop?category=lehengas" },
        { label: "Jewellery", href: "/shop?category=jewellery" },
        { label: "Bridal Sets", href: "/shop?category=bridal-sets" },
        { label: "Rent", href: "/shop?type=rent" },
        { label: "Buy", href: "/shop?type=buy" },
    ],
    Account: [
        { label: "My Orders", href: "/dashboard" },
        { label: "Profile", href: "/dashboard/profile" },
        { label: "Cart", href: "/cart" },
    ],
    Info: [
        { label: "About Us", href: "/#about" },
        { label: "How Renting Works", href: "/#how-it-works" },
        { label: "FAQs", href: "/#faqs" },
        { label: "Contact Us", href: "/#contact" },
    ],
};

export function Footer() {
    return (
        <footer className="relative bg-neutral-950 border-t border-white/5 text-white/70 overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="container-main relative z-10">
                {/* Top section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-14">
                    {/* Brand */}
                    <div className="lg:col-span-2 space-y-5">
                        <Link href="/" className="inline-block">
                            <span className="font-display font-bold text-3xl text-gradient">Radhaan</span>
                        </Link>
                        <p className="text-sm leading-relaxed text-white/50 max-w-xs">
                            Premium bridal wear rental & purchase platform. Wear your dream lehenga without the dream price tag.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                                <Youtube className="w-4 h-4" />
                            </a>
                        </div>
                        <div className="space-y-2 text-sm text-white/40">
                            <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> hello@radhaan.in</p>
                            <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> +91 98765 43210</p>
                            <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Jaipur, Rajasthan</p>
                        </div>
                    </div>

                    {/* Links sections */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category} className="space-y-4">
                            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">{category}</h4>
                            <ul className="space-y-2">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-white/50 hover:text-white transition-colors hover:translate-x-0.5 inline-block"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Gold divider */}
                <hr className="divider-gold" />

                {/* Bottom */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-6 text-xs text-white/30">
                    <p>© 2026 Radhaan. All rights reserved.</p>
                    <p className="flex items-center gap-1.5">
                        Made with <Heart className="w-3 h-3 text-primary-400 fill-primary-400" /> in India
                    </p>
                    <div className="flex gap-4">
                        <Link href="#" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white/60 transition-colors">Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
