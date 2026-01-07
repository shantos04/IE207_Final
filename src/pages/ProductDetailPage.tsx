import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, ShoppingBag, Minus, Plus, ArrowLeft, Check } from 'lucide-react';

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);

    useEffect(() => {
        if (id) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await productService.getProduct(id!);
            setProduct(response.data);
        } catch (error) {
            console.error('Failed to fetch product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (product) {
            addToCart(
                {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image_url,
                },
                quantity
            );
            setAddedToCart(true);
            setTimeout(() => setAddedToCart(false), 2000);
        }
    };

    const decreaseQuantity = () => {
        setQuantity((prev) => Math.max(1, prev - 1));
    };

    const increaseQuantity = () => {
        if (product && quantity < product.stock) {
            setQuantity((prev) => prev + 1);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 w-32 bg-gray-200 rounded mb-8"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="h-96 bg-gray-200 rounded-lg"></div>
                        <div className="space-y-4">
                            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-24 bg-gray-200 rounded"></div>
                            <div className="h-12 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Không tìm thấy sản phẩm
                </h2>
                <button
                    onClick={() => navigate('/shop')}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Quay lại cửa hàng
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="w-5 h-5" />
                <span>Quay lại</span>
            </button>

            {/* Product Detail */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Image */}
                <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-auto object-cover"
                        />
                    ) : (
                        <div className="w-full aspect-square flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                            <ShoppingBag className="w-32 h-32 text-blue-300" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="bg-white rounded-lg p-8 shadow-sm">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        {product.name}
                    </h1>

                    {/* Price */}
                    <div className="mb-6">
                        <span className="text-4xl font-bold text-blue-600">
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                            }).format(product.price)}
                        </span>
                    </div>

                    {/* Stock Status */}
                    <div className="mb-6">
                        {product.stock > 0 ? (
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-green-600 font-medium">
                                    Còn {product.stock} sản phẩm
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span className="text-red-600 font-medium">Hết hàng</span>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">
                            Mô tả sản phẩm
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            {product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
                        </p>
                    </div>

                    {/* Quantity Selector */}
                    {product.stock > 0 && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số lượng
                            </label>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={decreaseQuantity}
                                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition"
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="text-xl font-semibold w-12 text-center">
                                    {quantity}
                                </span>
                                <button
                                    onClick={increaseQuantity}
                                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition"
                                    disabled={quantity >= product.stock}
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Add to Cart Button */}
                    <div className="space-y-3">
                        {product.stock > 0 ? (
                            <>
                                <button
                                    onClick={handleAddToCart}
                                    className={`w-full py-4 rounded-lg font-semibold transition flex items-center justify-center space-x-2 ${addedToCart
                                            ? 'bg-green-600 text-white'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    {addedToCart ? (
                                        <>
                                            <Check className="w-5 h-5" />
                                            <span>Đã thêm vào giỏ hàng!</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-5 h-5" />
                                            <span>Thêm vào giỏ hàng</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        handleAddToCart();
                                        navigate('/cart');
                                    }}
                                    className="w-full py-4 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition"
                                >
                                    Mua ngay
                                </button>
                            </>
                        ) : (
                            <button
                                disabled
                                className="w-full py-4 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
                            >
                                Hết hàng
                            </button>
                        )}
                    </div>

                    {/* Additional Info */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">SKU:</span>
                                <span className="font-medium text-gray-900">{product.sku}</span>
                            </div>
                            {product.category && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Danh mục:</span>
                                    <span className="font-medium text-gray-900">{product.category}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
