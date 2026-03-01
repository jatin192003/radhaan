"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from "react";
import { cartApi } from "@/lib/api-client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

interface CartItem {
    id: string;
    type: "RENTAL" | "PURCHASE";
    quantity: number;
    rentalStart?: string;
    rentalEnd?: string;
    product: {
        id: string;
        title: string;
        rentalPricePerDay?: number;
        purchasePrice?: number;
        deposit?: number;
        images: { url: string }[];
    };
    sizeVariant?: { id: string; size: string };
}

interface Cart {
    id?: string;
    items: CartItem[];
    subtotal: number;
    totalDeposit: number;
    totalPayable: number;
}

interface CartContextType {
    cart: Cart;
    itemCount: number;
    isLoading: boolean;
    addItem: (data: Record<string, unknown>) => Promise<void>;
    updateItem: (itemId: string, data: Record<string, unknown>) => Promise<void>;
    removeItem: (itemId: string) => Promise<void>;
    refreshCart: () => Promise<void>;
    clearCart: () => void;
}

const emptyCart: Cart = { items: [], subtotal: 0, totalDeposit: 0, totalPayable: 0 };

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<Cart>(emptyCart);
    const [isLoading, setIsLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    const refreshCart = useCallback(async () => {
        if (!isAuthenticated) { setCart(emptyCart); return; }
        try {
            const res = await cartApi.get();
            setCart(res.data);
        } catch {
            setCart(emptyCart);
        }
    }, [isAuthenticated]);

    useEffect(() => { refreshCart(); }, [refreshCart]);

    const addItem = async (data: Record<string, unknown>) => {
        setIsLoading(true);
        try {
            await cartApi.addItem(data);
            await refreshCart();
            toast.success("Added to cart!");
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to add item");
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const updateItem = async (itemId: string, data: Record<string, unknown>) => {
        setIsLoading(true);
        try {
            await cartApi.updateItem(itemId, data);
            await refreshCart();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to update item");
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const removeItem = async (itemId: string) => {
        setIsLoading(true);
        try {
            await cartApi.removeItem(itemId);
            setCart((prev) => ({
                ...prev,
                items: prev.items.filter((i) => i.id !== itemId),
            }));
            await refreshCart();
            toast.success("Item removed");
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to remove item");
        } finally {
            setIsLoading(false);
        }
    };

    const clearCart = () => setCart(emptyCart);

    return (
        <CartContext.Provider
            value={{
                cart,
                itemCount: cart.items.reduce((sum, i) => sum + i.quantity, 0),
                isLoading,
                addItem,
                updateItem,
                removeItem,
                refreshCart,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within CartProvider");
    return context;
}
