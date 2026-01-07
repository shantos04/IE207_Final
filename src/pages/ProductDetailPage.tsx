import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import {
    ShoppingCart,
    Package,
    Minus,
    Plus,
    ArrowLeft,
    Star,
    Truck,
    Shield,
    RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState<any>(null);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');

    useEffect(() => {
        if (id) {
            fetchProduct();
            window.scrollTo(0, 0);
        }
    }, [id]);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const response = await productService.getProduct(id!);
            setProduct(response.data);

            // Fetch related products (same category)
            if (response.data.category) {
                fetchRelatedProducts(response.data.category, response.data._id);
            }
        } catch (error) {
            console.error('Failed to fetch product:', error);
            toast.error('Không thể tải sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedProducts = async (category: string, currentId: string) => {
        try {
            const response = await productService.getProducts({ limit: 100 });
            const related = response.data
                .filter((p: any) =>
                    p._id !== currentId &&
                    p.category?.toLowerCase().includes(category.toLowerCase())
                )
                .slice(0, 4);
            setRelatedProducts(related);
        } catch (error) {
            console.error('Failed to fetch related products:', error);
        }
    };

    const handleAddToCart = () => {
        if (product && product.stock > 0) {
            addToCart(
                {
                    id: product._id,
                    name: product.name,
                    price: product.price,
                    image: product.image_url,
                },
                quantity
            );
            toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
        }
    };

    const handleBuyNow = () => {
        handleAddToCart();
        navigate('/cart');
    };

    const decreaseQuantity = () => {
        setQuantity((prev) => Math.max(1, prev - 1));
    };

    const increaseQuantity = () => {
        if (product && quantity < product.stock) {
            setQuantity((prev) => prev + 1);
        }
    };

    // Mock images array (in real app, product would have multiple images)
    const images = product?.image_url
        ? [product.image_url]
        : [null];

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 w-32 bg-gray-200 rounded mb-8"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div>
                            <div className="h-96 bg-gray-200 rounded-xl mb-4"></div>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="h-10 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
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
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Không tìm thấy sản phẩm
                </h2>
                <button
                    onClick={() => navigate('/shop')}
                    className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Quay lại cửa hàng
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Quay lại</span>
                </button>

                {/* Main Product Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* LEFT: Image Gallery */}
                    <div>
                        {/* Main Image */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-lg mb-4">
                            {images[selectedImage] ? (
                                <img
                                    src={images[selectedImage]}
                                    alt={product.name}
                                    className="w-full h-[500px] object-cover"
                                />
                            ) : (
                                <div className="w-full h-[500px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                                    <Package className="w-32 h-32 text-blue-300" />
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Slider */}
                        <div className="flex gap-3">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition ${selectedImage === idx
                                        ? 'border-blue-600'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {img ? (
                                        <img
                                            src={img}
                                            alt={`${product.name} ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                            <Package className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Product Info */}
                    <div className="bg-white rounded-xl p-8 shadow-lg">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            {product.name}
                        </h1>

                        {/* Rating */}
                        <div className="flex items-center mb-6">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${i < 4
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : 'text-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="ml-2 text-gray-600">(4.0)</span>
                            <span className="ml-4 text-gray-400">|</span>
                            <span className="ml-4 text-gray-600">Đã bán: 152</span>
                        </div>

                        {/* Price */}
                        <div className="mb-6">
                            <span className="text-5xl font-bold text-red-600">
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                }).format(product.price)}
                            </span>
                        </div>

                        {/* Short Description */}
                        <div className="mb-6 pb-6 border-b border-gray-200">
                            <p className="text-gray-600 leading-relaxed">
                                {product.description || 'Sản phẩm chính hãng, chất lượng cao.'}
                            </p>
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

                        {/* Quantity Selector */}
                        {product.stock > 0 && (
                            <div className="mb-8">
                                <label className="block text-sm font-semibold text-gray-900 mb-3">
                                    Số lượng
                                </label>
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={decreaseQuantity}
                                        className="w-12 h-12 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 transition disabled:opacity-50"
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="w-5 h-5" />
                                    </button>
                                    <span className="text-2xl font-bold w-16 text-center">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={increaseQuantity}
                                        className="w-12 h-12 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 transition disabled:opacity-50"
                                        disabled={quantity >= product.stock}
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4 mb-8">
                            {product.stock > 0 ? (
                                <>
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-1 py-4 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center justify-center space-x-2"
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        <span>Thêm vào giỏ</span>
                                    </button>
                                    <button
                                        onClick={handleBuyNow}
                                        className="flex-1 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
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

                        {/* Benefits */}
                        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                            <div className="text-center">
                                <Truck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                <p className="text-xs text-gray-600">Giao hàng nhanh</p>
                            </div>
                            <div className="text-center">
                                <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                <p className="text-xs text-gray-600">Bảo hành 1 đổi 1</p>
                            </div>
                            <div className="text-center">
                                <RefreshCw className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                <p className="text-xs text-gray-600">Đổi trả 7 ngày</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
                    {/* Tab Headers */}
                    <div className="flex border-b border-gray-200 mb-8">
                        <button
                            onClick={() => setActiveTab('description')}
                            className={`px-6 py-3 font-semibold transition border-b-2 ${activeTab === 'description'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Mô tả chi tiết
                        </button>
                        <button
                            onClick={() => setActiveTab('specs')}
                            className={`px-6 py-3 font-semibold transition border-b-2 ${activeTab === 'specs'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Thông số kỹ thuật
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`px-6 py-3 font-semibold transition border-b-2 ${activeTab === 'reviews'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Đánh giá & Bình luận
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="prose max-w-none">
                        {activeTab === 'description' && (
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    Mô tả chi tiết sản phẩm
                                </h3>
                                <div className="text-gray-700 leading-relaxed space-y-4">
                                    <p>
                                        {product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
                                    </p>
                                    <p>
                                        Sản phẩm được nhập khẩu chính hãng, đảm bảo chất lượng cao nhất.
                                        Phù hợp cho các dự án DIY, IoT, và phát triển phần cứng.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'specs' && (
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    Thông số kỹ thuật
                                </h3>
                                <table className="w-full border-collapse">
                                    <tbody>
                                        {product.specifications && Object.keys(product.specifications).length > 0 ? (
                                            Object.entries(product.specifications).map(([key, value]: [string, any]) => (
                                                <tr key={key} className="border-b border-gray-200">
                                                    <td className="py-3 px-4 bg-gray-50 font-semibold text-gray-700 w-1/3">
                                                        {key}
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-600">
                                                        {value}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <>
                                                <tr className="border-b border-gray-200">
                                                    <td className="py-3 px-4 bg-gray-50 font-semibold text-gray-700 w-1/3">
                                                        Mã sản phẩm
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-600">
                                                        {product.productCode || product.sku || 'N/A'}
                                                    </td>
                                                </tr>
                                                <tr className="border-b border-gray-200">
                                                    <td className="py-3 px-4 bg-gray-50 font-semibold text-gray-700">
                                                        Danh mục
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-600">
                                                        {product.category || 'N/A'}
                                                    </td>
                                                </tr>
                                                <tr className="border-b border-gray-200">
                                                    <td className="py-3 px-4 bg-gray-50 font-semibold text-gray-700">
                                                        Nhà cung cấp
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-600">
                                                        {product.supplier || 'N/A'}
                                                    </td>
                                                </tr>
                                                <tr className="border-b border-gray-200">
                                                    <td className="py-3 px-4 bg-gray-50 font-semibold text-gray-700">
                                                        Trạng thái
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-600">
                                                        {product.isActive ? 'Đang kinh doanh' : 'Ngưng kinh doanh'}
                                                    </td>
                                                </tr>
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    Đánh giá & Bình luận
                                </h3>
                                <div className="text-center py-12 bg-gray-50 rounded-lg">
                                    <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-2">Chưa có đánh giá nào</p>
                                    <p className="text-sm text-gray-500">
                                        Hãy là người đầu tiên đánh giá sản phẩm này
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">
                            Sản phẩm liên quan
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((relatedProduct) => (
                                <Link
                                    key={relatedProduct._id}
                                    to={`/product/${relatedProduct._id}`}
                                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition group"
                                >
                                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                                        {relatedProduct.image_url ? (
                                            <img
                                                src={relatedProduct.image_url}
                                                alt={relatedProduct.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                                                <Package className="w-16 h-16 text-blue-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition min-h-[3rem]">
                                            {relatedProduct.name}
                                        </h3>
                                        <div className="flex items-center mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < 4
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : 'text-gray-300'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xl font-bold text-red-600">
                                            {new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND',
                                            }).format(relatedProduct.price)}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
