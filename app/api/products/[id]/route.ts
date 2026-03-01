import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, notFound, serverError } from "@/lib/api-response";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const product = await db.product.findFirst({
            where: { id, isDeleted: false },
            include: {
                category: { select: { id: true, name: true, slug: true } },
                images: { select: { id: true, url: true, isPrimary: true } },
                sizeVariants: { select: { id: true, size: true, stock: true } },
                reviews: {
                    orderBy: { createdAt: "desc" },
                    take: 10,
                    include: {
                        user: { select: { id: true, name: true } },
                    },
                },
            },
        });

        if (!product) return notFound("Product");

        return successResponse(product);
    } catch (e) {
        return serverError(e);
    }
}
