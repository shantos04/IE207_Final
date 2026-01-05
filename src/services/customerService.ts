import { api } from './api';

export interface Customer {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    loyaltyPoints: number;
    status: 'active' | 'inactive';
    totalOrders?: number;
    totalSpent?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CustomersResponse {
    success: boolean;
    data: Customer[];
    pagination: {
        total: number;
        page: number;
        pages: number;
    };
}

export interface CustomerResponse {
    success: boolean;
    data: Customer;
    message?: string;
}

export const customerService = {
    // Lấy danh sách khách hàng
    getCustomers: async (params?: {
        page?: number;
        limit?: number;
        keyword?: string;
        status?: string;
    }) => {
        const response = await api.get<CustomersResponse>('/customers', { params });
        return response.data;
    },

    // Lấy chi tiết khách hàng
    getCustomer: async (id: string) => {
        const response = await api.get<CustomerResponse>(`/customers/${id}`);
        return response.data;
    },

    // Tạo khách hàng mới
    createCustomer: async (customerData: Partial<Customer>) => {
        const response = await api.post<CustomerResponse>('/customers', customerData);
        return response.data;
    },

    // Cập nhật khách hàng
    updateCustomer: async (id: string, customerData: Partial<Customer>) => {
        const response = await api.put<CustomerResponse>(`/customers/${id}`, customerData);
        return response.data;
    },

    // Xóa khách hàng
    deleteCustomer: async (id: string) => {
        const response = await api.delete<CustomerResponse>(`/customers/${id}`);
        return response.data;
    },

    // Cập nhật điểm thưởng
    updateLoyaltyPoints: async (id: string, points: number, action: 'add' | 'subtract') => {
        const response = await api.put<CustomerResponse>(`/customers/${id}/loyalty`, {
            points,
            action,
        });
        return response.data;
    },
};
