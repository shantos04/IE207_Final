import { api } from './api';

export interface OrderItem {
    product: string;
    productName: string;
    productCode: string;
    quantity: number;
    price: number;
    subtotal: number;
}

export interface Order {
    _id: string;
    orderCode: string;
    customer: {
        name: string;
        email: string;
        phone: string;
    };
    orderItems: OrderItem[];
    shippingAddress: {
        address: string;
        city: string;
        phone: string;
    };
    paymentMethod: string;
    totalAmount: number;
    totalPrice: number;
    status: 'Draft' | 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
    paymentStatus: 'unpaid' | 'paid' | 'refunded';
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface OrdersResponse {
    success: boolean;
    data: Order[];
    pagination: {
        total: number;
        page: number;
        pages: number;
    };
}

export interface OrderResponse {
    success: boolean;
    data: Order;
}

export const orderService = {
    // Lấy danh sách đơn hàng (admin)
    getOrders: async (params?: {
        page?: number;
        limit?: number;
        status?: string;
        paymentStatus?: string;
    }) => {
        const response = await api.get<OrdersResponse>('/orders', { params });
        return response.data;
    },

    // Lấy đơn hàng của tôi (user)
    getMyOrders: async () => {
        const response = await api.get<OrdersResponse>('/orders/myorders');
        return response.data;
    },

    // Lấy chi tiết đơn hàng
    getOrder: async (id: string) => {
        const response = await api.get<OrderResponse>(`/orders/${id}`);
        return response.data;
    },

    // Tạo đơn hàng mới
    createOrder: async (orderData: any) => {
        const response = await api.post<OrderResponse>('/orders', orderData);
        return response.data;
    },

    // Cập nhật trạng thái đơn hàng
    updateOrderStatus: async (id: string, status: Order['status']) => {
        const response = await api.put<OrderResponse>(`/orders/${id}/status`, { status });
        return response.data;
    },

    // Cập nhật trạng thái thanh toán
    updatePaymentStatus: async (id: string, paymentStatus: Order['paymentStatus']) => {
        const response = await api.put<OrderResponse>(`/orders/${id}/payment`, { paymentStatus });
        return response.data;
    },

    // Hủy đơn hàng
    cancelOrder: async (id: string) => {
        const response = await api.put<OrderResponse>(`/orders/${id}/cancel`);
        return response.data;
    },

    // Xác nhận đã nhận hàng
    confirmReceived: async (id: string) => {
        const response = await api.put<OrderResponse>(`/orders/${id}/received`);
        return response.data;
    },
};
