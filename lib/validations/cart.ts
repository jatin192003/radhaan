import { z } from "zod";

export const addCartItemSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("PURCHASE"),
        productId: z.string().cuid("Invalid product ID"),
        sizeVariantId: z.string().cuid("Invalid size variant ID").optional(),
        quantity: z.number().int().min(1).optional().default(1),
    }),
    z.object({
        type: z.literal("RENTAL"),
        productId: z.string().cuid("Invalid product ID"),
        sizeVariantId: z.string().cuid("Invalid size variant ID").optional(),
        quantity: z.number().int().min(1).optional().default(1),
        rentalStart: z.string().datetime({ message: "Invalid rental start date" }),
        rentalEnd: z.string().datetime({ message: "Invalid rental end date" }),
    }),
]);

export const updateCartItemSchema = z.object({
    quantity: z.number().int().min(1).optional(),
    rentalStart: z.string().datetime().optional(),
    rentalEnd: z.string().datetime().optional(),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
