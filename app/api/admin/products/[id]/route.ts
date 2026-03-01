import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { updateProductSchema } from "@/lib/validations/product";
import {
    successResponse,
    errorResponse,
    unauthorized,
    forbidden,
    notFound,
    serverError,
} from "@/lib/api-response";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();
        if (authUser.role !== "ADMIN") return forbidden();

        const { id } = await params;
        const product = await db.product.findFirst({
            where: { id, isDeleted: false },
            include: {
                category: true,
                images: true,
                sizeVariants: true,
                _count: { select: { rentalBookings: true, orderItems: true, reviews: true } },
            },
        });
        if (!product) return notFound("Product");
        return successResponse(product);
    } catch (e) {
        return serverError(e);
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();
        if (authUser.role !== "ADMIN") return forbidden();

        const { id } = await params;
        const product = await db.product.findFirst({ where: { id, isDeleted: false } });
        if (!product) return notFound("Product");

        const body = await req.json();
        const parsed = updateProductSchema.safeParse(body);
        if (!parsed.success) {
            return errorResponse("Validation error", 422, parsed.error.flatten().fieldErrors);
        }

        const { sizeVariants, ...productData } = parsed.data;

        // Upsert size variants if provided
        const updated = await db.$transaction(async (tx) => {
            const updatedProduct = await tx.product.update({
                where: { id },
                data: productData,
                include: { sizeVariants: true, images: true, category: { select: { id: true, name: true } } },
            });

            if (sizeVariants) {
                for (const sv of sizeVariants) {
                    await tx.sizeVariant.upsert({
                        where: { productId_size: { productId: id, size: sv.size } },
                        create: { productId: id, size: sv.size, stock: sv.stock },
                        update: { stock: sv.stock },
                    });
                }
            }

            return updatedProduct;
        });

        return successResponse(updated, "Product updated successfully");
    } catch (e) {
        return serverError(e);
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();
        if (authUser.role !== "ADMIN") return forbidden();

        const { id } = await params;
        const product = await db.product.findFirst({ where: { id, isDeleted: false } });
        if (!product) return notFound("Product");

        // Soft delete
        await db.product.update({ where: { id }, data: { isDeleted: true } });

        return successResponse(null, "Product deleted successfully");
    } catch (e) {
        return serverError(e);
    }
}
