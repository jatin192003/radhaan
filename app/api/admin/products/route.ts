import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { createProductSchema } from "@/lib/validations/product";
import {
    successResponse,
    errorResponse,
    unauthorized,
    forbidden,
    serverError,
} from "@/lib/api-response";

export async function POST(req: NextRequest) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();
        if (authUser.role !== "ADMIN") return forbidden();

        const body = await req.json();
        const parsed = createProductSchema.safeParse(body);

        if (!parsed.success) {
            console.error("[Admin Products POST] Validation errors:", JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
            console.error("[Admin Products POST] Request body:", JSON.stringify(body, null, 2));
            return errorResponse("Validation error", 422, parsed.error.flatten().fieldErrors);
        }

        const { sizeVariants, ...productData } = parsed.data;

        const product = await db.product.create({
            data: {
                ...productData,
                sizeVariants: sizeVariants?.length
                    ? { create: sizeVariants }
                    : undefined,
            },
            include: {
                sizeVariants: true,
                category: { select: { id: true, name: true, slug: true } },
            },
        });

        return successResponse(product, "Product created successfully", 201);
    } catch (e) {
        return serverError(e);
    }
}

export async function GET(req: NextRequest) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();
        if (authUser.role !== "ADMIN") return forbidden();

        const { searchParams } = new URL(req.url);
        const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
        const skip = (page - 1) * limit;
        const search = searchParams.get("search") || undefined;

        const where = {
            isDeleted: false,
            ...(search
                ? { title: { contains: search, mode: "insensitive" as const } }
                : {}),
        };

        const [total, products] = await Promise.all([
            db.product.count({ where }),
            db.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    category: { select: { id: true, name: true } },
                    images: { where: { isPrimary: true }, take: 1, select: { url: true } },
                    sizeVariants: true,
                    _count: { select: { rentalBookings: true, orderItems: true } },
                },
            }),
        ]);

        return successResponse({
            products,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (e) {
        return serverError(e);
    }
}
