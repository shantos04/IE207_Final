import { DashboardStats, RevenueData, Order } from '../types';

// Mock data cho Dashboard
export const mockDashboardStats: DashboardStats = {
    totalRevenue: 1870000,
    totalOrders: 2890,
    totalCustomers: 15420,
    conversionRate: 15.1,
    revenueChange: 12.5,
    ordersChange: 8.3,
    customersChange: 5.7,
};

export const mockRevenueData: RevenueData[] = [
    { month: 'T1', revenue: 1200000 },
    { month: 'T2', revenue: 1450000 },
    { month: 'T3', revenue: 1800000 },
    { month: 'T4', revenue: 1600000 },
    { month: 'T5', revenue: 2100000 },
    { month: 'T6', revenue: 1950000 },
    { month: 'T7', revenue: 2300000 },
    { month: 'T8', revenue: 2150000 },
    { month: 'T9', revenue: 2400000 },
    { month: 'T10', revenue: 2200000 },
    { month: 'T11', revenue: 2600000 },
    { month: 'T12', revenue: 2800000 },
];

export const mockRecentOrders: Order[] = [
    {
        _id: '1',
        orderCode: 'ORD-2024-001',
        customer: {
            name: 'Nguyễn Văn A',
            email: 'nguyenvana@example.com',
            phone: '0901234567',
        },
        items: [
            {
                product: 'p1',
                productName: 'Arduino Uno R3',
                quantity: 2,
                price: 250000,
            },
        ],
        totalAmount: 500000,
        status: 'Delivered',
        paymentStatus: 'paid',
        shippingAddress: 'Hà Nội',
        createdAt: '2024-01-05T10:00:00Z',
        updatedAt: '2024-01-05T10:00:00Z',
    },
    {
        _id: '2',
        orderCode: 'ORD-2024-002',
        customer: {
            name: 'Trần Thị B',
            email: 'tranthib@example.com',
            phone: '0912345678',
        },
        items: [
            {
                product: 'p2',
                productName: 'Raspberry Pi 4',
                quantity: 1,
                price: 1200000,
            },
        ],
        totalAmount: 1200000,
        status: 'Confirmed',
        paymentStatus: 'paid',
        shippingAddress: 'TP. Hồ Chí Minh',
        createdAt: '2024-01-04T14:30:00Z',
        updatedAt: '2024-01-04T14:30:00Z',
    },
    {
        _id: '3',
        orderCode: 'ORD-2024-003',
        customer: {
            name: 'Lê Văn C',
            email: 'levanc@example.com',
            phone: '0923456789',
        },
        items: [
            {
                product: 'p3',
                productName: 'Cảm biến DHT22',
                quantity: 5,
                price: 80000,
            },
        ],
        totalAmount: 400000,
        status: 'Shipped',
        paymentStatus: 'paid',
        shippingAddress: 'Đà Nẵng',
        createdAt: '2024-01-03T09:15:00Z',
        updatedAt: '2024-01-03T09:15:00Z',
    },
    {
        _id: '4',
        orderCode: 'ORD-2024-004',
        customer: {
            name: 'Phạm Thị D',
            email: 'phamthid@example.com',
            phone: '0934567890',
        },
        items: [
            {
                product: 'p4',
                productName: 'ESP32 DevKit',
                quantity: 3,
                price: 150000,
            },
        ],
        totalAmount: 450000,
        status: 'Pending',
        paymentStatus: 'unpaid',
        shippingAddress: 'Cần Thơ',
        createdAt: '2024-01-02T16:45:00Z',
        updatedAt: '2024-01-02T16:45:00Z',
    },
    {
        _id: '5',
        orderCode: 'ORD-2024-005',
        customer: {
            name: 'Hoàng Văn E',
            email: 'hoangvane@example.com',
            phone: '0945678901',
        },
        items: [
            {
                product: 'p5',
                productName: 'Module Relay 4 kênh',
                quantity: 2,
                price: 120000,
            },
        ],
        totalAmount: 240000,
        status: 'Delivered',
        paymentStatus: 'paid',
        shippingAddress: 'Hải Phòng',
        createdAt: '2024-01-01T11:20:00Z',
        updatedAt: '2024-01-01T11:20:00Z',
    },
];
