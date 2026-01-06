import { api } from './api';

export interface Invoice {
    _id: string;
    invoiceNumber: string;
    order: {
        _id: string;
        orderCode: string;
        totalPrice: number;
        status: string;
    };
    user: {
        _id: string;
        fullName: string;
        email: string;
    };
    issueDate: string;
    dueDate: string;
    totalAmount: number;
    status: 'Unpaid' | 'Paid' | 'Overdue' | 'Cancelled';
    paymentMethod: string;
    notes?: string;
    paidAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface InvoicesResponse {
    success: boolean;
    data: Invoice[];
    pagination: {
        total: number;
        page: number;
        pages: number;
    };
}

export interface InvoiceResponse {
    success: boolean;
    data: Invoice;
    message?: string;
}

export const invoiceService = {
    // Lấy danh sách hóa đơn
    getInvoices: async (params?: {
        page?: number;
        limit?: number;
        status?: string;
    }) => {
        const response = await api.get<InvoicesResponse>('/invoices', { params });
        return response.data;
    },

    // Lấy chi tiết hóa đơn
    getInvoiceDetail: async (id: string) => {
        const response = await api.get<InvoiceResponse>(`/invoices/${id}`);
        return response.data;
    },

    // Tạo hóa đơn từ order
    createInvoice: async (invoiceData: {
        orderId: string;
        dueDate?: string;
        paymentMethod?: string;
        notes?: string;
    }) => {
        const response = await api.post<InvoiceResponse>('/invoices', invoiceData);
        return response.data;
    },

    // Đánh dấu đã thanh toán
    markAsPaid: async (id: string, paymentMethod?: string) => {
        const response = await api.put<InvoiceResponse>(`/invoices/${id}/paid`, {
            paymentMethod,
        });
        return response.data;
    },

    // Cập nhật trạng thái
    updateStatus: async (id: string, status: Invoice['status']) => {
        const response = await api.put<InvoiceResponse>(`/invoices/${id}/status`, { status });
        return response.data;
    },

    // Hủy hóa đơn
    cancelInvoice: async (id: string) => {
        const response = await api.put<InvoiceResponse>(`/invoices/${id}/cancel`);
        return response.data;
    },
};
