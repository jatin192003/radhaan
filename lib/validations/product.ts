import { z } from "zod";

export const createProductSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    categoryId: z.string().min(1, "Category is required"),
    rentalPricePerDay: z.number().positive().optional().nullable(),
    purchasePrice: z.number().positive().optional().nullable(),
    deposit: z.number().min(0).optional().default(0),
    stock: z.number().int().min(0).optional().default(0),
    rentalEnabled: z.boolean().optional().default(false),
    purchaseEnabled: z.boolean().optional().default(true),
    sizeVariants: z
        .array(
            z.object({
                size: z.string().min(1),
                stock: z.number().int().min(0),
            })
        )
        .optional()
        .default([]),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(12),
    category: z.string().optional(),
    type: z.enum(["rent", "buy", "both"]).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    size: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.enum(["createdAt", "purchasePrice", "rentalPricePerDay", "averageRating"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
