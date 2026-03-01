import { z } from "zod";

export const createReviewSchema = z.object({
    rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
    comment: z.string().min(3).max(1000).optional(),
});

export const blockDatesSchema = z.object({
    dates: z.array(z.string().datetime()),
    reason: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
    status: z.enum([
        "PENDING",
        "CONFIRMED",
        "DISPATCHED",
        "DELIVERED",
        "RETURNED",
        "CANCELLED",
    ]),
    depositStatus: z.enum(["HELD", "REFUNDED", "FORFEITED"]).optional(),
    damageNotes: z.string().optional(),
});

export const adminOrderQuerySchema = z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    type: z.enum(["RENT", "PURCHASE", "MIXED"]).optional(),
    status: z
        .enum(["PENDING", "CONFIRMED", "DISPATCHED", "DELIVERED", "RETURNED", "CANCELLED"])
        .optional(),
    paymentStatus: z.enum(["PENDING", "PAID", "REFUNDED", "PARTIALLY_REFUNDED"]).optional(),
    userId: z.string().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type BlockDatesInput = z.infer<typeof blockDatesSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type AdminOrderQueryInput = z.infer<typeof adminOrderQuerySchema>;
