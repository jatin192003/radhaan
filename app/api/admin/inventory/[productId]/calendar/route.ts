import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { unauthorized, forbidden, notFound, successResponse, serverError } from "@/lib/api-response";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();
        if (authUser.role !== "ADMIN") return forbidden();

        const { productId } = await params;

        const product = await db.product.findFirst({ where: { id: productId, isDeleted: false } });
        if (!product) return notFound("Product");

        const [rentalBookings, blockedDates] = await Promise.all([
            db.rentalBooking.findMany({
                where: { productId },
                select: {
                    id: true,
                    startDate: true,
                    endDate: true,
                    returnStatus: true,
                    sizeVariant: { select: { size: true } },
                    order: {
                        select: {
                            id: true,
                            status: true,
                            user: { select: { name: true, email: true, phone: true } },
                        },
                    },
                },
            }),
            db.blockedDate.findMany({
                where: { productId },
                select: { id: true, date: true, reason: true },
            }),
        ]);

        return successResponse({ rentalBookings, blockedDates });
    } catch (e) {
        return serverError(e);
    }
}
