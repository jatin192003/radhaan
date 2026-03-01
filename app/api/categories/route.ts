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

const categorySchema = z.object({
    name: z.string().min(2),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
    description: z.string().optional(),
});

// GET /api/categories — Public
export async function GET() {
    try {
        const categories = await db.category.findMany({
            orderBy: { name: "asc" },
            include: { _count: { select: { products: true } } },
        });
        return successResponse(categories);
    } catch (e) {
        return serverError(e);
    }
}

// POST /api/categories — Admin only
export async function POST(req: NextRequest) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();
        if (authUser.role !== "ADMIN") return forbidden();

        const body = await req.json();
        const parsed = categorySchema.safeParse(body);
        if (!parsed.success) {
            return errorResponse("Validation error", 422, parsed.error.flatten().fieldErrors);
        }

        const existing = await db.category.findUnique({ where: { slug: parsed.data.slug } });
        if (existing) return errorResponse("A category with this slug already exists", 409);

        const category = await db.category.create({ data: parsed.data });
        return successResponse(category, "Category created", 201);
    } catch (e) {
        return serverError(e);
    }
}
