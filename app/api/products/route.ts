import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { productQuerySchema } from "@/lib/validations/product";
import { successResponse, errorResponse, serverError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        // Strip out empty string parameters so Zod defaults/optionals work properly
        const queryObj = Object.fromEntries(
            Array.from(searchParams.entries()).filter(([_, v]) => v !== "")
        );

        const parsed = productQuerySchema.safeParse(queryObj);

        if (!parsed.success) {
            return errorResponse("Invalid query parameters", 422, parsed.error.flatten().fieldErrors);
        }

        const { page, limit, category, type, minPrice, maxPrice, size, search, sortBy, sortOrder } =
            parsed.data;
        const skip = (page - 1) * limit;

        // Build Prisma where clause
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = { isDeleted: false };

        if (category) {
            where.category = { slug: category };
        }

        if (type === "rent") {
            where.rentalEnabled = true;
        } else if (type === "buy") {
            where.purchaseEnabled = true;
        } else if (type === "both") {
            where.rentalEnabled = true;
            where.purchaseEnabled = true;
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            where.OR = [
                ...(where.OR ?? []),
                ...(minPrice !== undefined || maxPrice !== undefined
                    ? [
                        {
                            purchasePrice: {
                                ...(minPrice !== undefined ? { gte: minPrice } : {}),
                                ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
                            },
                        },
                        {
                            rentalPricePerDay: {
                                ...(minPrice !== undefined ? { gte: minPrice } : {}),
                                ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
                            },
                        },
                    ]
                    : []),
            ];
        }

        if (size) {
            where.sizeVariants = { some: { size: { equals: size, mode: "insensitive" } } };
        }

        if (search) {
            where.OR = [
                ...(where.OR ?? []),
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }

        const [total, products] = await Promise.all([
            db.product.count({ where }),
            db.product.findMany({
                where,
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    rentalPricePerDay: true,
                    purchasePrice: true,
                    deposit: true,
                    rentalEnabled: true,
                    purchaseEnabled: true,
                    averageRating: true,
                    totalReviews: true,
                    stock: true,
                    createdAt: true,
                    category: { select: { id: true, name: true, slug: true } },
                    images: {
                        where: { isPrimary: true },
                        take: 1,
                        select: { url: true },
                    },
                    sizeVariants: { select: { id: true, size: true, stock: true } },
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
