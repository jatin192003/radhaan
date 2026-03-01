import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { successResponse, unauthorized, serverError } from "@/lib/api-response";

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
                role: true,
                phone: true,
                addressLine1: true,
                addressLine2: true,
                city: true,
                state: true,
                pincode: true,
                createdAt: true,
            },
        });

        if (!user) return unauthorized();

        return successResponse(user);
    } catch (e) {
        return serverError(e);
    }
}
