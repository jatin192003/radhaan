import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { updateOrderStatusSchema } from "@/lib/validations/order";
import {
    successResponse,
    errorResponse,
    unauthorized,
    forbidden,
    notFound,
    serverError,
} from "@/lib/api-response";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();
        if (authUser.role !== "ADMIN") return forbidden();

        const { id } = await params;

        const order = await db.order.findUnique({ where: { id } });
        if (!order) return notFound("Order");

        const body = await req.json();
        const parsed = updateOrderStatusSchema.safeParse(body);
        if (!parsed.success) {
            return errorResponse("Validation error", 422, parsed.error.flatten().fieldErrors);
        }

        const { status, depositStatus, damageNotes } = parsed.data;

        const updated = await db.$transaction(async (tx) => {
            const updatedOrder = await tx.order.update({
                where: { id },
                data: {
                    status,
                    ...(depositStatus ? { depositStatus } : {}),
                },
            });

            // If marking as RETURNED, update all rental bookings for this order
            if (status === "RETURNED") {
                await tx.rentalBooking.updateMany({
                    where: { orderId: id, returnStatus: "PENDING" },
                    data: {
                        returnStatus: damageNotes ? "DAMAGED" : "RETURNED",
                        damageNotes: damageNotes ?? null,
                    },
                });
            }

            return updatedOrder;
        });

        return successResponse(updated, `Order status updated to ${status}`);
    } catch (e) {
        return serverError(e);
    }
}
