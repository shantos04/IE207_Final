import api from './api';

export interface ProductFormData {
    productCode: string;
    name: string;
    description?: string;
    category: string;
    price: number;
    stock: number;
    supplier?: string;
    specifications?: Record<string, string>;
    imageUrl?: string;
    isActive?: boolean;
}

export interface ProductFilters {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
}

export const productService = {
    // Lấy gợi ý sản phẩm cho autocomplete
    getSuggestions: async (query: string) => {
        const response = await api.get(`/products/suggestions?query=${encodeURIComponent(query)}`);
        return response.data;
    },

    // Lấy danh sách sản phẩm với phân trang và lọc
    getProducts: async (filters?: ProductFilters) => {
        const params = new URLSearchParams();

        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.category) params.append('category', filters.category);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.search) params.append('search', filters.search);

        const response = await api.get(`/products?${params.toString()}`);
        return response.data;
    },

    // Lấy chi tiết một sản phẩm
    getProduct: async (id: string) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    // Tạo sản phẩm mới
    createProduct: async (data: ProductFormData) => {
        const response = await api.post('/products', data);
        return response.data;
    },

    // Cập nhật sản phẩm
    updateProduct: async (id: string, data: ProductFormData) => {
        const response = await api.put(`/products/${id}`, data);
        return response.data;
    },

    // Xóa sản phẩm
    deleteProduct: async (id: string) => {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },
};
