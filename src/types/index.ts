// Mock data types based on Database Schema
export interface User {
    _id: string;
    username: string;
    email: string;
    fullName: string;
    role: 'admin' | 'manager' | 'staff';
    avatar?: string;
    phone?: string;
    address?: string;
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
    totalProducts: number;
    revenueChange: number;
    ordersChange: number;
    customersChange: number;
}

export interface RevenueData {
    date: string;
    revenue: number;
}

export interface StatusChartData {
    status: string;
    count: number;
    revenue: number;
}

export interface TopProduct {
    productName: string;
    productCode: string;
    totalQuantity: number;
    totalRevenue: number;
    orderCount: number;
}
