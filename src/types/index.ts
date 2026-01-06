// Mock data types based on Database Schema
export interface User {
    _id: string;
    username: string;
    email: string;
    fullName: string;
    role: 'admin' | 'manager' | 'staff';
    avatar?: string;
    phone?: string;
}

export interface Product {
    _id: string;
    productCode: string;
    name: string;
    description?: string;
    category: string;
    price: number;
    stock: number;
    status: 'in-stock' | 'low-stock' | 'out-of-stock';
    supplier?: string;
    specifications?: Record<string, string>;
    imageUrl?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Order {
    _id: string;
    orderCode: string;
    customer: {
        name: string;
        email: string;
        phone: string;
    };
    items: Array<{
        product: string;
        productName: string;
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentStatus: 'unpaid' | 'paid' | 'refunded';
    shippingAddress: string;
    createdAt: string;
    updatedAt: string;
}

export interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    conversionRate: number;
    revenueChange: number;
    ordersChange: number;
    customersChange: number;
}

export interface RevenueData {
    month: string;
    revenue: number;
}
