import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { updateCartItemSchema } from "@/lib/validations/cart";
import {
    successResponse,
    errorResponse,
    unauthorized,
    notFound,
    serverError,
} from "@/lib/api-response";

// Ensure the cart item belongs to the requesting user
async function getOwnedCartItem(cartItemId: string, userId: string) {
    return db.cartItem.findFirst({
        where: {
            id: cartItemId,
            cart: { userId },
        },
    });
}

// PUT /api/cart/[itemId]
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ itemId: string }> }
) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();

        const { itemId } = await params;
        const item = await getOwnedCartItem(itemId, authUser.sub);
        if (!item) return notFound("Cart item");

        const body = await req.json();
        const parsed = updateCartItemSchema.safeParse(body);
        if (!parsed.success) {
            return errorResponse("Validation error", 422, parsed.error.flatten().fieldErrors);
        }

        const { quantity, rentalStart, rentalEnd } = parsed.data;

        if (rentalStart && rentalEnd) {
            const start = new Date(rentalStart);
            const end = new Date(rentalEnd);
            if (start >= end) return errorResponse("rentalStart must be before rentalEnd", 400);
        }

        const updated = await db.cartItem.update({
            where: { id: itemId },
            data: {
                ...(quantity !== undefined ? { quantity } : {}),
                ...(rentalStart ? { rentalStart: new Date(rentalStart) } : {}),
                ...(rentalEnd ? { rentalEnd: new Date(rentalEnd) } : {}),
            },
        });

        return successResponse(updated, "Cart item updated");
    } catch (e) {
        return serverError(e);
    }
}

// DELETE /api/cart/[itemId]
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ itemId: string }> }
) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();

        const { itemId } = await params;
        const item = await getOwnedCartItem(itemId, authUser.sub);
        if (!item) return notFound("Cart item");

        await db.cartItem.delete({ where: { id: itemId } });

        return successResponse(null, "Item removed from cart");
    } catch (e) {
        return serverError(e);
    }
}
