import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { successResponse, unauthorized, serverError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();

        const { searchParams } = new URL(req.url);
        const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
        const skip = (page - 1) * limit;

        const [total, orders] = await Promise.all([
            db.order.count({ where: { userId: authUser.sub } }),
            db.order.findMany({
                where: { userId: authUser.sub },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
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
