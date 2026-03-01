import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import {
    successResponse,
    errorResponse,
    unauthorized,
    serverError,
} from "@/lib/api-response";

// POST /api/orders  — Create order from cart
export async function POST(req: NextRequest) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();

        // Get user's cart with all items
        const cart = await db.cart.findUnique({
            where: { userId: authUser.sub },
            include: {
                items: {
                    include: {
                        product: true,
                        sizeVariant: true,
                    },
                },
            },
        });

        if (!cart || cart.items.length === 0) {
            return errorResponse("Your cart is empty", 400);
        }

        // Parse optional notes from body
        let notes: string | undefined;
        try {
            const body = await req.json();
            notes = body.notes;
        } catch { }

        // ─── Validate all items & detect conflicts ───
        let totalAmount = 0;
        let depositAmount = 0;
        let hasRental = false;
        let hasPurchase = false;

        for (const item of cart.items) {
            const { product, sizeVariant, type, quantity, rentalStart, rentalEnd } = item;

            // Stock check for purchase items
            if (type === "PURCHASE") {
                hasPurchase = true;
                if (!product.purchaseEnabled) {
                    return errorResponse(
                        `Product "${product.title}" is no longer available for purchase`,
                        400
                    );
                }
                const availableStock = sizeVariant ? sizeVariant.stock : product.stock;
                if (availableStock < quantity) {
                    return errorResponse(`Insufficient stock for "${product.title}"`, 400);
                }
                totalAmount += (product.purchasePrice || 0) * quantity;
            }

            // Rental — check overlap conflicts
            if (type === "RENTAL") {
                hasRental = true;
                if (!product.rentalEnabled || !rentalStart || !rentalEnd) {
                    return errorResponse(
                        `Product "${product.title}" is not available for rental`,
                        400
                    );
                }

                const conflicting = await db.rentalBooking.findFirst({
                    where: {
                        productId: product.id,
                        ...(sizeVariant ? { sizeVariantId: sizeVariant.id } : {}),
                        AND: [{ startDate: { lt: rentalEnd } }, { endDate: { gt: rentalStart } }],
                    },
                });

                if (conflicting) {
                    return errorResponse(
                        `"${product.title}" is already booked for the selected dates`,
                        409
                    );
                }

                const rentalDays = Math.ceil(
                    (rentalEnd.getTime() - rentalStart.getTime()) / (1000 * 60 * 60 * 24)
                );
                totalAmount += (product.rentalPricePerDay || 0) * rentalDays * quantity;
                depositAmount += (product.deposit || 0) * quantity;
            }
        }

        const orderType =
            hasRental && hasPurchase ? "MIXED" : hasRental ? "RENT" : "PURCHASE";

        // ─── Create order in a transaction ───
        const order = await db.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    userId: authUser.sub,
                    orderType,
                    totalAmount: totalAmount + depositAmount,
                    depositAmount,
                    notes,
                    paymentStatus: "PENDING",
                    status: "PENDING",
                },
            });

            // Create order items and rental bookings
            for (const item of cart.items) {
                const { product, sizeVariant, type, quantity, rentalStart, rentalEnd } = item;

                const rentalDays =
                    rentalStart && rentalEnd
                        ? Math.ceil(
                            (rentalEnd.getTime() - rentalStart.getTime()) / (1000 * 60 * 60 * 24)
                        )
                        : null;

                await tx.orderItem.create({
                    data: {
                        orderId: newOrder.id,
                        productId: product.id,
                        sizeVariantId: sizeVariant?.id ?? null,
                        type,
                        quantity,
                        priceAtOrder:
                            type === "RENTAL"
                                ? (product.rentalPricePerDay || 0) * (rentalDays || 1)
                                : product.purchasePrice || 0,
                        rentalStart: rentalStart ?? null,
                        rentalEnd: rentalEnd ?? null,
                        rentalDays,
                    },
                });

                if (type === "RENTAL" && rentalStart && rentalEnd) {
                    await tx.rentalBooking.create({
                        data: {
                            productId: product.id,
                            sizeVariantId: sizeVariant?.id ?? null,
                            orderId: newOrder.id,
                            startDate: rentalStart,
                            endDate: rentalEnd,
                            returnStatus: "PENDING",
                        },
                    });
                }

                // Decrement stock for purchased items
                if (type === "PURCHASE") {
                    if (sizeVariant) {
                        await tx.sizeVariant.update({
                            where: { id: sizeVariant.id },
                            data: { stock: { decrement: quantity } },
                        });
                    } else {
                        await tx.product.update({
                            where: { id: product.id },
                            data: { stock: { decrement: quantity } },
                        });
                    }
                }
            }

            // Clear cart
            await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

            return newOrder;
        });

        const fullOrder = await db.order.findUnique({
            where: { id: order.id },
            include: {
                items: {
                    include: {
                        product: { select: { id: true, title: true } },
                        sizeVariant: { select: { size: true } },
                    },
                },
            },
        });

        return successResponse(fullOrder, "Order placed successfully", 201);
    } catch (e) {
        return serverError(e);
    }
}
