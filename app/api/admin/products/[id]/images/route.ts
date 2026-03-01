import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import {
    successResponse,
    errorResponse,
    unauthorized,
    forbidden,
    notFound,
    serverError,
} from "@/lib/api-response";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST /api/admin/products/[id]/images — Upload product images
export async function POST(
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

        const formData = await req.formData();
        const files = formData.getAll("images") as File[];
        const setPrimary = formData.get("setPrimary") === "true";

        if (!files.length) {
            return errorResponse("No images provided", 400);
        }

        const uploadedImages = await Promise.all(
            files.map(async (file, index) => {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: `radhaan/products/${id}`,
                            resource_type: "image",
                            transformation: [{ width: 1200, height: 1600, crop: "limit", quality: "auto" }],
                        },
                        (error, result) => {
                            if (error || !result) reject(error);
                            else resolve({ url: result.secure_url, publicId: result.public_id });
                        }
                    );
                    stream.end(buffer);
                });
            })
        );

        // If setPrimary, clear existing primary first
        if (setPrimary) {
            await db.productImage.updateMany({
                where: { productId: id },
                data: { isPrimary: false },
            });
        }

        const images = await Promise.all(
            uploadedImages.map((img, index) =>
                db.productImage.create({
                    data: {
                        productId: id,
                        url: img.url,
                        publicId: img.publicId,
                        isPrimary: setPrimary && index === 0,
                    },
                })
            )
        );

        return successResponse(images, `${images.length} image(s) uploaded`, 201);
    } catch (e) {
        return serverError(e);
    }
}

// DELETE /api/admin/products/[id]/images — Delete a product image
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();
        if (authUser.role !== "ADMIN") return forbidden();

        const { id: productId } = await params;
        const { imageId } = await req.json() as { imageId: string };

        const image = await db.productImage.findFirst({
            where: { id: imageId, productId },
        });
        if (!image) return notFound("Image");

        // Delete from Cloudinary
        if (image.publicId) {
            await cloudinary.uploader.destroy(image.publicId);
        }

        await db.productImage.delete({ where: { id: imageId } });

        return successResponse(null, "Image deleted");
    } catch (e) {
        return serverError(e);
    }
}
