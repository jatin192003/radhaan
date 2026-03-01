import axios from "axios";

const api = axios.create({
    baseURL: "/api",
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

// Response interceptor — unwrap the `data` envelope
api.interceptors.response.use(
    (res) => res,
    (error) => {
        const message =
            error.response?.data?.error || error.message || "Something went wrong";
        const details = error.response?.data?.details;
        const enrichedError = new Error(message) as Error & { response?: unknown; details?: unknown };
        enrichedError.response = error.response;
        enrichedError.details = details;
        return Promise.reject(enrichedError);
    }
);

// ─── Auth ─────────────────────────────────────────────────────────
export const authApi = {
    register: (data: { name: string; email: string; password: string; phone?: string }) =>
        api.post("/auth/register", data).then((r) => r.data),
    login: (data: { email: string; password: string }) =>
        api.post("/auth/login", data).then((r) => r.data),
    logout: () => api.post("/auth/logout").then((r) => r.data),
    me: () => api.get("/auth/me").then((r) => r.data),
    forgotPassword: (email: string) =>
        api.post("/auth/forgot-password", { email }).then((r) => r.data),
};

// ─── User ──────────────────────────────────────────────────────────
export const userApi = {
    getProfile: () => api.get("/user/profile").then((r) => r.data),
    updateProfile: (data: Record<string, string>) =>
        api.put("/user/profile", data).then((r) => r.data),
    getOrders: (page = 1) =>
        api.get(`/user/orders?page=${page}`).then((r) => r.data),
    getOrder: (id: string) => api.get(`/user/orders/${id}`).then((r) => r.data),
};

// ─── Products ──────────────────────────────────────────────────────
export const productsApi = {
    list: (params: Record<string, string | number | undefined>) =>
        api.get("/products", { params }).then((r) => r.data),
    get: (id: string) => api.get(`/products/${id}`).then((r) => r.data),
    getAvailability: (id: string, params?: Record<string, string>) =>
        api.get(`/products/${id}/availability`, { params }).then((r) => r.data),
    getReviews: (id: string) =>
        api.get(`/products/${id}/reviews`).then((r) => r.data),
    addReview: (id: string, data: { rating: number; comment?: string }) =>
        api.post(`/products/${id}/reviews`, data).then((r) => r.data),
};

// ─── Categories ────────────────────────────────────────────────────
export const categoriesApi = {
    list: () => api.get("/categories").then((r) => r.data),
};

// ─── Cart ──────────────────────────────────────────────────────────
export const cartApi = {
    get: () => api.get("/cart").then((r) => r.data),
    addItem: (data: Record<string, unknown>) =>
        api.post("/cart", data).then((r) => r.data),
    updateItem: (itemId: string, data: Record<string, unknown>) =>
        api.put(`/cart/${itemId}`, data).then((r) => r.data),
    removeItem: (itemId: string) =>
        api.delete(`/cart/${itemId}`).then((r) => r.data),
};

// ─── Orders ────────────────────────────────────────────────────────
export const ordersApi = {
    create: (notes?: string) => api.post("/orders", { notes }).then((r) => r.data),
    get: (id: string) => api.get(`/orders/${id}`).then((r) => r.data),
};

// ─── Admin ─────────────────────────────────────────────────────────
export const adminApi = {
    // Products
    listProducts: (params?: Record<string, string | number>) =>
        api.get("/admin/products", { params }).then((r) => r.data),
    createProduct: (data: Record<string, unknown>) =>
        api.post("/admin/products", data).then((r) => r.data),
    getProduct: (id: string) => api.get(`/admin/products/${id}`).then((r) => r.data),
    updateProduct: (id: string, data: Record<string, unknown>) =>
        api.put(`/admin/products/${id}`, data).then((r) => r.data),
    deleteProduct: (id: string) => api.delete(`/admin/products/${id}`).then((r) => r.data),
    uploadImages: (id: string, formData: FormData) =>
        api.post(`/admin/products/${id}/images`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }).then((r) => r.data),
    deleteImage: (productId: string, imageId: string) =>
        api.delete(`/admin/products/${productId}/images`, { data: { imageId } }).then((r) => r.data),

    // Orders
    listOrders: (params?: Record<string, string | number>) =>
        api.get("/admin/orders", { params }).then((r) => r.data),
    updateOrderStatus: (id: string, data: Record<string, string>) =>
        api.put(`/admin/orders/${id}/status`, data).then((r) => r.data),

    // Inventory
    getCalendar: (productId: string) =>
        api.get(`/admin/inventory/${productId}/calendar`).then((r) => r.data),
    blockDates: (productId: string, data: { dates: string[]; reason?: string }) =>
        api.post(`/admin/inventory/${productId}/block-dates`, data).then((r) => r.data),
    unblockDates: (productId: string, dates: string[]) =>
        api.delete(`/admin/inventory/${productId}/block-dates`, { data: { dates } }).then((r) => r.data),

    // Analytics
    getAnalytics: () => api.get("/admin/analytics").then((r) => r.data),

    // Categories
    createCategory: (data: { name: string; slug: string; description?: string }) =>
        api.post("/categories", data).then((r) => r.data),
};

export default api;
