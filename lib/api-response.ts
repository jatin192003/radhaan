import { NextResponse } from "next/server";

export type ApiSuccessResponse<T = unknown> = {
    success: true;
    data: T;
    message?: string;
};

export type ApiErrorResponse = {
    success: false;
    error: string;
    details?: unknown;
};

export function successResponse<T>(data: T, message?: string, status = 200): NextResponse {
    return NextResponse.json({ success: true, data, message } satisfies ApiSuccessResponse<T>, {
        status,
    });
}

export function errorResponse(
    error: string,
    status = 400,
    details?: unknown
): NextResponse {
    return NextResponse.json({ success: false, error, details } satisfies ApiErrorResponse, {
        status,
    });
}

export const unauthorized = () => errorResponse("Unauthorized", 401);
export const forbidden = () => errorResponse("Forbidden — insufficient permissions", 403);
export const notFound = (resource = "Resource") =>
    errorResponse(`${resource} not found`, 404);
export const serverError = (e?: unknown) => {
    console.error("[SERVER ERROR]", e);
    return errorResponse("Internal server error", 500);
};
