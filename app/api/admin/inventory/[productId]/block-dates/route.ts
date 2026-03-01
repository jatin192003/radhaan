import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { blockDatesSchema } from "@/lib/validations/order";
import {
    successResponse,
    errorResponse,
    unauthorized,
    forbidden,
    notFound,
    serverError,
} from "@/lib/api-response";

export async function POST(
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

        const body = await req.json();
        const parsed = blockDatesSchema.safeParse(body);
        if (!parsed.success) {
            return errorResponse("Validation error", 422, parsed.error.flatten().fieldErrors);
        }

        const { dates, reason } = parsed.data;

        // Upsert each date (idempotent — blocking the same date twice is fine)
        const results = await Promise.all(
            dates.map((dateStr) => {
                const date = new Date(dateStr);
                return db.blockedDate.upsert({
                    where: { productId_date: { productId, date } },
                    create: { productId, date, reason },
                    update: { reason },
                });
            })
        );

        return successResponse(results, `${results.length} date(s) blocked successfully`, 201);
    } catch (e) {
        return serverError(e);
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();
        if (authUser.role !== "ADMIN") return forbidden();

        const { productId } = await params;
        const body = await req.json();
        const { dates } = body as { dates: string[] };

        if (!dates || !Array.isArray(dates)) {
            return errorResponse("dates array is required", 400);
        }

        const result = await db.blockedDate.deleteMany({
            where: {
                productId,
                date: { in: dates.map((d) => new Date(d)) },
            },
        });

        return successResponse({ deletedCount: result.count }, `${result.count} date(s) unblocked`);
    } catch (e) {
        return serverError(e);
    }
}
