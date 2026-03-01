import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { createReviewSchema } from "@/lib/validations/order";
import {
    successResponse,
    errorResponse,
    unauthorized,
    notFound,
    serverError,
} from "@/lib/api-response";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const product = await db.product.findFirst({ where: { id, isDeleted: false } });
        if (!product) return notFound("Product");

        const reviews = await db.review.findMany({
            where: { productId: id },
            orderBy: { createdAt: "desc" },
            include: { user: { select: { id: true, name: true } } },
        });

        return successResponse(reviews);
    } catch (e) {
        return serverError(e);
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();

        const { id } = await params;

        const product = await db.product.findFirst({ where: { id, isDeleted: false } });
        if (!product) return notFound("Product");

        const body = await req.json();
        const parsed = createReviewSchema.safeParse(body);
        if (!parsed.success) {
            return errorResponse("Validation error", 422, parsed.error.flatten().fieldErrors);
        }

        // Check if user already reviewed this product
        const existing = await db.review.findUnique({
            where: { productId_userId: { productId: id, userId: authUser.sub } },
        });
        if (existing) {
            return errorResponse("You have already reviewed this product", 409);
        }

        const review = await db.review.create({
            data: { productId: id, userId: authUser.sub, ...parsed.data },
            include: { user: { select: { id: true, name: true } } },
        });

        // Update product average rating
        const agg = await db.review.aggregate({
            where: { productId: id },
            _avg: { rating: true },
            _count: { rating: true },
        });

        await db.product.update({
            where: { id },
            data: {
                averageRating: agg._avg.rating ?? 0,
                totalReviews: agg._count.rating,
            },
        });

        return successResponse(review, "Review submitted successfully", 201);
    } catch (e) {
        return serverError(e);
    }
}
