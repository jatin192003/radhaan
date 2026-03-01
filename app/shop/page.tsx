import { Suspense } from "react";
import { ShopContent } from "@/components/shop/ShopContent";

export default function ShopPage() {
    return (
        <Suspense>
            <ShopContent />
        </Suspense>
    );
}
