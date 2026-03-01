import { z } from "zod";

// Mirror of the current createProductSchema
const createProductSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    categoryId: z.string().min(1, "Category is required"),
    rentalPricePerDay: z.number().positive().optional().nullable(),
    purchasePrice: z.number().positive().optional().nullable(),
    deposit: z.number().min(0).optional().default(0),
    stock: z.number().int().min(0).optional().default(0),
    rentalEnabled: z.boolean().optional().default(false),
    purchaseEnabled: z.boolean().optional().default(true),
    sizeVariants: z
        .array(z.object({ size: z.string().min(1), stock: z.number().int().min(0) }))
        .optional()
        .default([]),
});

// Simulate what ProductForm buildPayload() sends when rental is enabled, purchase disabled
const testPayload1 = {
    title: "Test Lehenga Product",
    description: "This is a detailed description of the lehenga product for testing",
    categoryId: "cly123456789", // sample CUID2-like id
    rentalEnabled: true,
    purchaseEnabled: false,
    rentalPricePerDay: 2500,
    purchasePrice: null,
    deposit: 5000,
    stock: 3,
    sizeVariants: [],
};

// Simulate what buildPayload() sends when BOTH are enabled
const testPayload2 = {
    title: "Test Purchase Product",
    description: "This is a detailed description of the purchase product for testing",
    categoryId: "cly123456789",
    rentalEnabled: false,
    purchaseEnabled: true,
    rentalPricePerDay: null,
    purchasePrice: 45000,
    deposit: 0,
    stock: 5,
    sizeVariants: [{ size: "M", stock: 3 }, { size: "L", stock: 2 }],
};

console.log("=== Test 1: Rental only ===");
const r1 = createProductSchema.safeParse(testPayload1);
if (r1.success) {
    console.log("✅ Payload 1 PASSES validation");
    console.log("Parsed:", JSON.stringify(r1.data, null, 2));
} else {
    console.log("❌ Payload 1 FAILS validation");
    console.log("Errors:", JSON.stringify(r1.error.flatten().fieldErrors, null, 2));
}

console.log("\n=== Test 2: Purchase only ===");
const r2 = createProductSchema.safeParse(testPayload2);
if (r2.success) {
    console.log("✅ Payload 2 PASSES validation");
} else {
    console.log("❌ Payload 2 FAILS validation");
    console.log("Errors:", JSON.stringify(r2.error.flatten().fieldErrors, null, 2));
}
