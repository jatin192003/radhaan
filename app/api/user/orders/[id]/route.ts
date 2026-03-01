import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { successResponse, unauthorized, notFound, serverError } from "@/lib/api-response";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();

        const { id } = await params;

        const order = await db.order.findFirst({
            where: { id, userId: authUser.sub },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                title: true,
                                images: { where: { isPrimary: true }, take: 1, select: { url: true } },
                            },
                        },
                        sizeVariant: { select: { size: true } },
                    },
                },
                rentalBookings: {
                    include: {
                        product: { select: { id: true, title: true } },
                        sizeVariant: { select: { size: true } },
                    },
                },
            },
        });

        if (!order) return notFound("Order");

        return successResponse(order);
    } catch (e) {
        return serverError(e);
    }
}
