import { useState, useEffect, useRef } from 'react';
import { ProductFormData } from '../../services/productService';

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
}

interface ProductFormProps {
    product?: Product | null;
    onSubmit: (data: ProductFormData) => Promise<void>;
    onCancel: () => void;
}

const categoryOptions = [
    { value: 'vi-dieu-khien', label: 'Vi điều khiển' },
    { value: 'cam-bien', label: 'Cảm biến' },
    { value: 'dong-co', label: 'Động cơ' },
    { value: 'module-truyen-thong', label: 'Module truyền thông' },
    { value: 'linh-kien-dien-tu', label: 'Linh kiện điện tử' },
    { value: 'khac', label: 'Khác' },
];

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
    const [formData, setFormData] = useState<ProductFormData>({
        productCode: '',
        name: '',
        description: '',
        category: 'linh-kien-dien-tu',
        price: 0,
        stock: 0,
        supplier: '',
        specifications: {},
        imageUrl: '',
        isActive: true,
    });

    const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>([
        { key: '', value: '' },
    ]);

    const [imagePreview, setImagePreview] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (product) {
            setFormData({
                productCode: product.productCode,
                name: product.name,
                description: product.description || '',
                category: product.category,
                price: product.price,
                stock: product.stock,
                supplier: product.supplier || '',
                specifications: product.specifications || {},
                imageUrl: product.imageUrl || '',
                isActive: product.isActive,
            });

            // Convert specifications object to array
            if (product.specifications) {
                const specsArray = Object.entries(product.specifications).map(([key, value]) => ({
                    key,
                    value,
                }));
                setSpecs(specsArray.length > 0 ? specsArray : [{ key: '', value: '' }]);
            }

            if (product.imageUrl) {
                setImagePreview(product.imageUrl);
            }
        }
    }, [product]);

    const handleInputChange = (field: keyof ProductFormData, value: string | number | boolean) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
        const newSpecs = [...specs];
        newSpecs[index][field] = value;
        setSpecs(newSpecs);
    };

    const addSpecRow = () => {
        setSpecs([...specs, { key: '', value: '' }]);
    };

    const removeSpecRow = (index: number) => {
        if (specs.length > 1) {
            setSpecs(specs.filter((_, i) => i !== index));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file ảnh!');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Kích thước ảnh không được vượt quá 2MB!');
            return;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setImagePreview(base64String);
            setFormData((prev) => ({
                ...prev,
                imageUrl: base64String,
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setImagePreview('');
        setFormData((prev) => ({
            ...prev,
            imageUrl: '',
        }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate
        if (!formData.productCode.trim()) {
            alert('Vui lòng nhập mã sản phẩm!');
            return;
        }
        if (!formData.name.trim()) {
            alert('Vui lòng nhập tên sản phẩm!');
            return;
        }
        if (formData.price < 0) {
            alert('Giá không được âm!');
            return;
        }
        if (formData.stock < 0) {
            alert('Số lượng tồn kho không được âm!');
            return;
        }

        // Convert specs array to object
        const specsObject: Record<string, string> = {};
        specs.forEach((spec) => {
            if (spec.key.trim() && spec.value.trim()) {
                specsObject[spec.key.trim()] = spec.value.trim();
            }
        });

        const submitData: ProductFormData = {
            ...formData,
            specifications: specsObject,
        };

        try {
            setLoading(true);
            await onSubmit(submitData);
        } catch (error) {
            console.error('Lỗi khi lưu sản phẩm:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Grid 2 cột cho thông tin chính */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cột trái */}
                    <div className="space-y-4">
                        {/* Mã sản phẩm */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mã sản phẩm (SKU) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.productCode}
                                onChange={(e) => handleInputChange('productCode', e.target.value.toUpperCase())}
                                disabled={!!product}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 font-mono"
                                placeholder="VD: ESP32-001"
                            />
                            {product && (
                                <p className="mt-1 text-xs text-gray-500">Mã sản phẩm không thể thay đổi</p>
                            )}
                        </div>

                        {/* Tên sản phẩm */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên sản phẩm <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="VD: Bo mạch ESP32 DevKit"
                            />
                        </div>

                        {/* Danh mục */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                Danh mục <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="category"
                                required
                                value={formData.category}
                                onChange={(e) => handleInputChange('category', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {categoryOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Giá */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giá bán (VNĐ) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="1000"
                                value={formData.price}
                                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                            />
                        </div>

                        {/* Tồn kho */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Số lượng tồn kho <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.stock}
                                onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Cảnh báo tồn kho thấp khi &lt; 10 sản phẩm
                            </p>
                        </div>

                        {/* Nhà cung cấp */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nhà cung cấp
                            </label>
                            <input
                                type="text"
                                value={formData.supplier}
                                onChange={(e) => handleInputChange('supplier', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="VD: Công ty TNHH ABC"
                            />
                        </div>
                    </div>

                    {/* Cột phải */}
                    <div className="space-y-4">
                        {/* Mô tả */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mô tả sản phẩm
                            </label>
                            <textarea
                                rows={4}
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập mô tả chi tiết về sản phẩm..."
                            />
                        </div>

                        {/* Upload ảnh */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ảnh sản phẩm
                            </label>
                            <div className="space-y-2">
                                {imagePreview ? (
                                    <div className="relative inline-block">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="h-40 w-40 object-cover rounded-lg border-2 border-gray-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            title="Xóa ảnh"
                                            aria-label="Xóa ảnh"
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        >
                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center w-full">
                                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <svg
                                                    className="w-10 h-10 mb-3 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                    />
                                                </svg>
                                                <p className="mb-2 text-sm text-gray-500">
                                                    <span className="font-semibold">Nhấp để tải ảnh lên</span>
                                                </p>
                                                <p className="text-xs text-gray-500">PNG, JPG (MAX. 2MB)</p>
                                            </div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Ảnh sẽ được chuyển thành Base64 để lưu trữ
                            </p>
                        </div>

                        {/* Trạng thái hoạt động */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                                Sản phẩm đang hoạt động
                            </label>
                        </div>
                    </div>
                </div>

                {/* Technical Specifications - Full width */}
                <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Thông số kỹ thuật (Technical Specs)
                        </label>
                        <button
                            type="button"
                            onClick={addSpecRow}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        >
                            <svg
                                className="h-5 w-5 mr-1"
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
                            Thêm thông số
                        </button>
                    </div>

                    <div className="space-y-2">
                        {specs.map((spec, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    value={spec.key}
                                    onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                                    placeholder="Tên thông số (VD: Voltage, Power, PinCount)"
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={spec.value}
                                        onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                                        placeholder="Giá trị (VD: 5V, 10W, 40 pins)"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {specs.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeSpecRow(index)}
                                            title="Xóa thông số"
                                            aria-label="Xóa thông số"
                                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                                        >
                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                        Nhập các thông số kỹ thuật như điện áp (Voltage), công suất (Power), số chân (PinCount), v.v.
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Đang lưu...
                            </>
                        ) : (
                            <>{product ? 'Cập nhật' : 'Tạo mới'}</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
