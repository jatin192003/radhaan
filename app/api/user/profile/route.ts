import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { updateProfileSchema } from "@/lib/validations/auth";
import { successResponse, errorResponse, unauthorized, serverError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();

        const user = await db.user.findUnique({
            where: { id: authUser.sub },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                addressLine1: true,
                addressLine2: true,
                city: true,
                state: true,
                pincode: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) return unauthorized();
        return successResponse(user);
    } catch (e) {
        return serverError(e);
    }
}

export async function PUT(req: NextRequest) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();

        const body = await req.json();
        const parsed = updateProfileSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 422, parsed.error.flatten().fieldErrors);
        }

        const updated = await db.user.update({
            where: { id: authUser.sub },
            data: parsed.data,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                addressLine1: true,
                addressLine2: true,
                city: true,
                state: true,
                pincode: true,
            },
        });

        return successResponse(updated, "Profile updated successfully");
    } catch (e) {
        return serverError(e);
    }
}
