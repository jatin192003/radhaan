import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { adminOrderQuerySchema } from "@/lib/validations/order";
import {
    successResponse,
    errorResponse,
    unauthorized,
    forbidden,
    serverError,
} from "@/lib/api-response";

export async function GET(req: NextRequest) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();
        if (authUser.role !== "ADMIN") return forbidden();

        const { searchParams } = new URL(req.url);
        const parsed = adminOrderQuerySchema.safeParse(Object.fromEntries(searchParams));

        if (!parsed.success) {
            return errorResponse("Invalid query parameters", 422, parsed.error.flatten().fieldErrors);
        }

        const { page, limit, type, status, paymentStatus, userId } = parsed.data;
        const skip = (page - 1) * limit;

        const where = {
            ...(type ? { orderType: type } : {}),
            ...(status ? { status } : {}),
            ...(paymentStatus ? { paymentStatus } : {}),
            ...(userId ? { userId } : {}),
        };

        const [total, orders] = await Promise.all([
            db.order.count({ where }),
            db.order.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                include: {
                    user: { select: { id: true, name: true, email: true, phone: true } },
                    items: {
                        include: {
                            product: { select: { id: true, title: true } },
                            sizeVariant: { select: { size: true } },
                        },
                    },
                    _count: { select: { rentalBookings: true } },
                },
            }),
        ]);

        return successResponse({
            orders,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (e) {
        return serverError(e);
    }
}
