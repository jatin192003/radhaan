import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { addCartItemSchema } from "@/lib/validations/cart";
import {
    successResponse,
    errorResponse,
    unauthorized,
    notFound,
    serverError,
} from "@/lib/api-response";

// GET /api/cart
export async function GET(req: NextRequest) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();

        const cart = await db.cart.findUnique({
            where: { userId: authUser.sub },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                title: true,
                                rentalPricePerDay: true,
                                purchasePrice: true,
                                deposit: true,
                                rentalEnabled: true,
                                purchaseEnabled: true,
                                stock: true,
                                images: { where: { isPrimary: true }, take: 1, select: { url: true } },
                            },
                        },
                        sizeVariant: { select: { id: true, size: true, stock: true } },
                    },
                },
            },
        });

        if (!cart) {
            return successResponse({ items: [], subtotal: 0, totalDeposit: 0, totalPayable: 0 });
        }

        // Calculate totals
        let subtotal = 0;
        let totalDeposit = 0;

        for (const item of cart.items) {
            if (item.type === "RENTAL" && item.rentalStart && item.rentalEnd) {
                const days = Math.ceil(
                    (new Date(item.rentalEnd).getTime() - new Date(item.rentalStart).getTime()) /
                    (1000 * 60 * 60 * 24)
                );
                subtotal += (item.product.rentalPricePerDay || 0) * days * item.quantity;
                totalDeposit += (item.product.deposit || 0) * item.quantity;
            } else {
                subtotal += (item.product.purchasePrice || 0) * item.quantity;
            }
        }

        return successResponse({
            id: cart.id,
            items: cart.items,
            subtotal,
            totalDeposit,
            totalPayable: subtotal + totalDeposit,
        });
    } catch (e) {
        return serverError(e);
    }
}

// POST /api/cart
export async function POST(req: NextRequest) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();

        const body = await req.json();
        const parsed = addCartItemSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 422, parsed.error.flatten().fieldErrors);
        }

        const data = parsed.data;

        // Validate product exists
        const product = await db.product.findFirst({
            where: { id: data.productId, isDeleted: false },
        });
        if (!product) return notFound("Product");

        // Type-specific validations
        if (data.type === "RENTAL") {
            if (!product.rentalEnabled) {
                return errorResponse("This product is not available for rental", 400);
            }
            const start = new Date(data.rentalStart);
            const end = new Date(data.rentalEnd);
            if (start >= end) return errorResponse("rentalStart must be before rentalEnd", 400);
            if (start < new Date()) return errorResponse("Rental start date cannot be in the past", 400);
        } else {
            if (!product.purchaseEnabled) {
                return errorResponse("This product is not available for purchase", 400);
            }
        }

        // Get or create cart
        const cart = await db.cart.upsert({
            where: { userId: authUser.sub },
            create: { userId: authUser.sub },
            update: {},
        });

        const cartItem = await db.cartItem.create({
            data: {
                cartId: cart.id,
                productId: data.productId,
                sizeVariantId: data.sizeVariantId ?? null,
                type: data.type,
                quantity: data.quantity ?? 1,
                rentalStart: data.type === "RENTAL" ? new Date(data.rentalStart) : null,
                rentalEnd: data.type === "RENTAL" ? new Date(data.rentalEnd) : null,
            },
            include: {
                product: { select: { id: true, title: true } },
                sizeVariant: { select: { size: true } },
            },
        });

        return successResponse(cartItem, "Item added to cart", 201);
    } catch (e) {
        return serverError(e);
    }
}
