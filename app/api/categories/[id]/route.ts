import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { z } from "zod";
import {
    successResponse,
    errorResponse,
    unauthorized,
    forbidden,
    notFound,
    serverError,
} from "@/lib/api-response";

const updateCategorySchema = z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
});

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const category = await db.category.findUnique({
            where: { id },
            include: { _count: { select: { products: true } } },
        });
        if (!category) return notFound("Category");
        return successResponse(category);
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
        const category = await db.category.findUnique({ where: { id } });
        if (!category) return notFound("Category");

        const body = await req.json();
        const parsed = updateCategorySchema.safeParse(body);
        if (!parsed.success) {
            return errorResponse("Validation error", 422, parsed.error.flatten().fieldErrors);
        }

        const updated = await db.category.update({ where: { id }, data: parsed.data });
        return successResponse(updated, "Category updated");
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
        const category = await db.category.findUnique({
            where: { id },
            include: { _count: { select: { products: true } } },
        });
        if (!category) return notFound("Category");

        if (category._count.products > 0) {
            return errorResponse(
                `Cannot delete category — it has ${category._count.products} product(s). Reassign them first.`,
                409
            );
        }

        await db.category.delete({ where: { id } });
        return successResponse(null, "Category deleted");
    } catch (e) {
        return serverError(e);
    }
}
