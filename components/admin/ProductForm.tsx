"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, X, Upload, Star, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, categoriesApi } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import toast from "react-hot-toast";

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "Free Size", "One Size"];

interface SizeVariant { size: string; stock: number; }
interface ProductImage { id: string; url: string; isPrimary: boolean; }

interface ProductFormProps {
    mode: "new" | "edit";
    productId?: string;
    initialData?: {
        title: string;
        description: string;
        categoryId: string;
        rentalPricePerDay: number | null;
        purchasePrice: number | null;
        deposit: number;
        stock: number;
        rentalEnabled: boolean;
        purchaseEnabled: boolean;
        sizeVariants: SizeVariant[];
        images: ProductImage[];
    };
}

export function ProductForm({ mode, productId, initialData }: ProductFormProps) {
    const router = useRouter();
    const qc = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        title: initialData?.title ?? "",
        description: initialData?.description ?? "",
        categoryId: initialData?.categoryId ?? "",
        rentalPricePerDay: initialData?.rentalPricePerDay?.toString() ?? "",
        purchasePrice: initialData?.purchasePrice?.toString() ?? "",
        deposit: initialData?.deposit?.toString() ?? "0",
        stock: initialData?.stock?.toString() ?? "0",
        rentalEnabled: initialData?.rentalEnabled ?? false,
        purchaseEnabled: initialData?.purchaseEnabled ?? true,
    });

    const [sizeVariants, setSizeVariants] = useState<SizeVariant[]>(
        initialData?.sizeVariants ?? []
    );
    const [images, setImages] = useState<ProductImage[]>(initialData?.images ?? []);
    const [isUploading, setIsUploading] = useState(false);

    // Load categories
    const { data: categoriesData } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoriesApi.list().then((r) => r.data),
    });
    const categories = categoriesData ?? [];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const toggleSizeVariant = (size: string) => {
        setSizeVariants((prev) => {
            const exists = prev.find((s) => s.size === size);
            if (exists) return prev.filter((s) => s.size !== size);
            return [...prev, { size, stock: 1 }];
        });
    };

    const updateSizeStock = (size: string, stock: number) => {
        setSizeVariants((prev) =>
            prev.map((s) => (s.size === size ? { ...s, stock } : s))
        );
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length || !productId) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            files.forEach((f) => formData.append("images", f));
            formData.append("setPrimary", images.length === 0 ? "true" : "false");
            const res = await adminApi.uploadImages(productId, formData);
            setImages((prev) => [...prev, ...res.data]);
            toast.success(`${files.length} image(s) uploaded!`);
            qc.invalidateQueries({ queryKey: ["admin-products"] });
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Upload failed");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDeleteImage = async (imageId: string) => {
        if (!productId) return;
        try {
            await adminApi.deleteImage(productId, imageId);
            setImages((prev) => prev.filter((img) => img.id !== imageId));
            toast.success("Image deleted");
        } catch {
            toast.error("Failed to delete image");
        }
    };

    const buildPayload = () => ({
        title: form.title.trim(),
        description: form.description.trim(),
        categoryId: form.categoryId,
        rentalEnabled: form.rentalEnabled,
        purchaseEnabled: form.purchaseEnabled,
        rentalPricePerDay: form.rentalEnabled && form.rentalPricePerDay
            ? parseFloat(form.rentalPricePerDay)
            : null,
        purchasePrice: form.purchaseEnabled && form.purchasePrice
            ? parseFloat(form.purchasePrice)
            : null,
        deposit: parseFloat(form.deposit) || 0,
        stock: parseInt(form.stock) || 0,
        sizeVariants: sizeVariants.length > 0 ? sizeVariants : [],
    });

    const createMutation = useMutation({
        mutationFn: () => adminApi.createProduct(buildPayload()),
        onSuccess: (res) => {
            toast.success("Product created! You can now upload images.");
            qc.invalidateQueries({ queryKey: ["admin-products"] });
            const productId = res?.data?.id;
            if (productId) router.push(`/admin/products/${productId}`);
            else router.push("/admin/products");
        },
        onError: (err: unknown) => {
            const error = err as Error & { details?: Record<string, string[]> };
            if (error.details) {
                const msgs = Object.entries(error.details).map(([k, v]) => `${k}: ${v.join(", ")}`).join("\n");
                toast.error(`Validation failed:\n${msgs}`, { duration: 8000 });
            } else {
                toast.error(error?.message ?? "Failed to create product");
            }
        },
    });

    const updateMutation = useMutation({
        mutationFn: () => adminApi.updateProduct(productId!, buildPayload()),
        onSuccess: () => {
            toast.success("Product updated!");
            qc.invalidateQueries({ queryKey: ["admin-products"] });
        },
        onError: (e: Error) => toast.error(e.message),
    });

    const totalSizeStock = sizeVariants.reduce((s, v) => s + v.stock, 0);
    const overallStock = parseInt(form.stock) || 0;
    const stockMismatch = sizeVariants.length > 0 && totalSizeStock !== overallStock;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.categoryId) return toast.error("Please select a category");
        if (!form.rentalEnabled && !form.purchaseEnabled) return toast.error("Enable at least one: Rental or Purchase");
        // Auto-fix overall stock to match size variant total
        if (sizeVariants.length > 0 && stockMismatch) {
            setForm((p) => ({ ...p, stock: totalSizeStock.toString() }));
        }
        if (mode === "new") createMutation.mutate();
        else updateMutation.mutate();
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left — Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Details */}
                    <div className="card p-6 space-y-4">
                        <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2 pb-2 border-b border-[var(--surface-border)]">
                            Product Details
                        </h3>

                        <div>
                            <label className="text-sm font-medium text-[var(--text-secondary)] mb-1 block">Title *</label>
                            <input name="title" value={form.title} onChange={handleChange} required
                                placeholder="e.g. Sabyasachi Heritage Lehenga" className="input-base" />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-[var(--text-secondary)] mb-1 block">Description *</label>
                            <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
                                placeholder="Describe the product in detail — fabric, work, occasion..." className="input-base resize-none" />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-[var(--text-secondary)] mb-1 block">Category *</label>
                            <select name="categoryId" value={form.categoryId} onChange={handleChange} required className="input-base">
                                <option value="">Select a category</option>
                                {categories.map((c: { id: string; name: string }) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Availability Toggles + Pricing */}
                    <div className="card p-6 space-y-5">
                        <h3 className="font-semibold text-[var(--text-primary)] pb-2 border-b border-[var(--surface-border)]">
                            Pricing & Availability
                        </h3>

                        {/* Toggle: Rental */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-[var(--text-primary)]">Rental Available</p>
                                <p className="text-xs text-[var(--text-muted)]">Allow customers to rent this item</p>
                            </div>
                            <button type="button" onClick={() => setForm((p) => ({ ...p, rentalEnabled: !p.rentalEnabled }))}>
                                {form.rentalEnabled
                                    ? <ToggleRight className="w-8 h-8 text-primary-500" />
                                    : <ToggleLeft className="w-8 h-8 text-neutral-400" />}
                            </button>
                        </div>
                        {form.rentalEnabled && (
                            <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-primary-200 dark:border-primary-800">
                                <div>
                                    <label className="text-xs font-medium text-[var(--text-muted)] mb-1 block">Rental Price/Day (₹) *</label>
                                    <input name="rentalPricePerDay" type="number" min="0" value={form.rentalPricePerDay}
                                        onChange={handleChange} placeholder="2500" className="input-base" required={form.rentalEnabled} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-[var(--text-muted)] mb-1 block">Security Deposit (₹)</label>
                                    <input name="deposit" type="number" min="0" value={form.deposit}
                                        onChange={handleChange} placeholder="5000" className="input-base" />
                                </div>
                            </div>
                        )}

                        {/* Toggle: Purchase */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-[var(--text-primary)]">Purchase Available</p>
                                <p className="text-xs text-[var(--text-muted)]">Allow customers to buy this item</p>
                            </div>
                            <button type="button" onClick={() => setForm((p) => ({ ...p, purchaseEnabled: !p.purchaseEnabled }))}>
                                {form.purchaseEnabled
                                    ? <ToggleRight className="w-8 h-8 text-primary-500" />
                                    : <ToggleLeft className="w-8 h-8 text-neutral-400" />}
                            </button>
                        </div>
                        {form.purchaseEnabled && (
                            <div className="pl-4 border-l-2 border-primary-200 dark:border-primary-800">
                                <label className="text-xs font-medium text-[var(--text-muted)] mb-1 block">Purchase Price (₹) *</label>
                                <input name="purchasePrice" type="number" min="0" value={form.purchasePrice}
                                    onChange={handleChange} placeholder="45000" className="input-base max-w-xs" required={form.purchaseEnabled} />
                            </div>
                        )}

                        {/* Overall stock */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-sm font-medium text-[var(--text-secondary)]">Overall Stock</label>
                                {sizeVariants.length > 0 && (
                                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full",
                                        stockMismatch
                                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    )}>
                                        {stockMismatch ? `⚠ Size total: ${totalSizeStock}` : `✓ Matches sizes (${totalSizeStock})`}
                                    </span>
                                )}
                            </div>
                            <input name="stock" type="number" min="0" value={form.stock}
                                onChange={handleChange} placeholder="5" className={cn("input-base max-w-xs", stockMismatch && "border-amber-400 dark:border-amber-600")} />
                            {stockMismatch && (
                                <button type="button" onClick={() => setForm((p) => ({ ...p, stock: totalSizeStock.toString() }))}
                                    className="text-xs text-primary-500 hover:text-primary-600 font-medium mt-1 transition-colors">
                                    → Sync to {totalSizeStock} (sum of sizes)
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Size Variants */}
                    <div className="card p-6">
                        <h3 className="font-semibold text-[var(--text-primary)] pb-2 mb-4 border-b border-[var(--surface-border)]">
                            Size Variants
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {SIZE_OPTIONS.map((size) => {
                                const selected = sizeVariants.find((s) => s.size === size);
                                return (
                                    <button key={size} type="button" onClick={() => toggleSizeVariant(size)}
                                        className={cn("px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors",
                                            selected ? "bg-primary-500 text-white border-primary-500" : "border-[var(--surface-border)] text-[var(--text-secondary)] hover:border-primary-400"
                                        )}>
                                        {size}
                                    </button>
                                );
                            })}
                        </div>
                        {sizeVariants.length > 0 && (
                            <div className="space-y-2">
                                {sizeVariants.map((sv) => (
                                    <div key={sv.size} className="flex items-center gap-3">
                                        <span className="text-sm font-semibold text-[var(--text-primary)] w-20">{sv.size}</span>
                                        <input type="number" min="0" value={sv.stock}
                                            onChange={(e) => updateSizeStock(sv.size, parseInt(e.target.value) || 0)}
                                            className="input-base w-24 text-sm" placeholder="Stock" />
                                        <span className="text-xs text-[var(--text-muted)]">units</span>
                                    </div>
                                ))}
                                <div className="pt-2 border-t border-[var(--surface-border)]">
                                    <span className="text-xs text-[var(--text-muted)]">Total across all sizes: </span>
                                    <span className="text-xs font-semibold text-[var(--text-primary)]">{totalSizeStock} units</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right — Images */}
                <div className="space-y-6">
                    <div className="card p-6">
                        <h3 className="font-semibold text-[var(--text-primary)] pb-2 mb-4 border-b border-[var(--surface-border)]">
                            Product Images
                        </h3>

                        {mode === "new" && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-4">
                                <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                                    💡 Save the product first, then upload images from the edit page.
                                </p>
                            </div>
                        )}

                        {mode === "edit" && (
                            <>
                                {/* Image grid */}
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    {images.map((img) => (
                                        <div key={img.id} className="relative group rounded-xl overflow-hidden" style={{ aspectRatio: "3/4" }}>
                                            <Image src={img.url} alt="Product" fill className="object-cover" />
                                            {img.isPrimary && (
                                                <span className="absolute top-1 left-1 badge bg-gold-500 text-white text-[10px]">
                                                    <Star className="w-2.5 h-2.5 mr-0.5 fill-current" /> Primary
                                                </span>
                                            )}
                                            <button type="button" onClick={() => handleDeleteImage(img.id)}
                                                className="absolute top-1 right-1 p-1 rounded-lg bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Upload slot */}
                                    <button type="button" onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className={cn("rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors",
                                            "border-[var(--surface-border)] hover:border-primary-400 text-[var(--text-muted)] hover:text-primary-500",
                                            isUploading && "opacity-50 cursor-not-allowed"
                                        )} style={{ aspectRatio: images.length ? "3/4" : "auto", minHeight: "100px" }}>
                                        <Upload className="w-5 h-5" />
                                        <span className="text-xs font-medium">{isUploading ? "Uploading..." : "Add Images"}</span>
                                    </button>
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                                <p className="text-xs text-[var(--text-muted)]">Accepts JPG, PNG, WebP. First image becomes primary.</p>
                            </>
                        )}
                    </div>

                    {/* Save button */}
                    <Button type="submit" fullWidth size="lg" isLoading={isLoading} icon={<Plus className="w-4 h-4" />}>
                        {mode === "new" ? "Create Product" : "Save Changes"}
                    </Button>

                    {mode === "edit" && (
                        <button type="button" onClick={() => router.push("/admin/products")}
                            className="w-full text-center text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                            ← Back to Products
                        </button>
                    )}
                </div>
            </div>
        </motion.form>
    );
}
