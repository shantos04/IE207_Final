import { useState } from 'react';
import ProductList from '../components/products/ProductList';
import ProductForm from '../components/products/ProductForm';
import { productService, ProductFormData } from '../services/productService';

interface Product {
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

export default function ProductsPage() {
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleAddNew = () => {
        setEditingProduct(null);
        setShowForm(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingProduct(null);
    };

    const handleSubmit = async (data: ProductFormData) => {
        try {
            if (editingProduct) {
                await productService.updateProduct(editingProduct._id, data);
                alert('Cập nhật sản phẩm thành công!');
            } else {
                await productService.createProduct(data);
                alert('Tạo sản phẩm mới thành công!');
            }
            setShowForm(false);
            setEditingProduct(null);
            setRefreshKey(prev => prev + 1); // Trigger refresh
        } catch (error: any) {
            console.error('Lỗi khi lưu sản phẩm:', error);
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi lưu sản phẩm';
            alert(errorMessage);
            throw error; // Re-throw để form biết có lỗi
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý Sản phẩm</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Quản lý danh sách linh kiện điện tử và thiết bị IoT
                    </p>
                </div>
                {!showForm && (
                    <button
                        onClick={handleAddNew}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <svg
                            className="h-5 w-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                        </svg>
                        Thêm sản phẩm mới
                    </button>
                )}
            </div>

            {/* Content */}
            {showForm ? (
                <ProductForm
                    product={editingProduct}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            ) : (
                <ProductList key={refreshKey} onEdit={handleEdit} />
            )}
        </div>
    );
}
