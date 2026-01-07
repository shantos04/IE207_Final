import { Link } from 'react-router-dom';
import { ShoppingBag, Truck, Shield, Headphones, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { productService } from '../services/productService';

export default function HomePage() {
    const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await productService.getProducts({ limit: 8 });
                setFeaturedProducts(response.data.slice(0, 8));
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const features = [
        {
            icon: Truck,
            title: 'Miễn phí vận chuyển',
            description: 'Cho đơn hàng trên 500.000đ',
        },
        {
            icon: Shield,
            title: 'Thanh toán an toàn',
            description: 'Bảo mật tuyệt đối',
        },
        {
            icon: Headphones,
            title: 'Hỗ trợ 24/7',
            description: 'Luôn sẵn sàng hỗ trợ',
        },
        {
            icon: ShoppingBag,
            title: 'Đổi trả dễ dàng',
            description: 'Trong vòng 30 ngày',
        },
    ];

    return (
        <div>
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <div className="container mx-auto px-4 py-20">
                    <div className="max-w-2xl">
                        <h1 className="text-5xl font-bold mb-6">
                            Chào mừng đến với ShopHub
                        </h1>
                        <p className="text-xl mb-8 text-blue-100">
                            Khám phá hàng ngàn sản phẩm chất lượng với giá tốt nhất. Mua sắm dễ dàng, giao hàng nhanh chóng.
                        </p>
                        <Link
                            to="/shop"
                            className="inline-flex items-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition"
                        >
                            <span>Khám phá ngay</span>
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center text-center p-6 rounded-lg hover:bg-gray-50 transition"
                            >
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                    <feature.icon className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 text-sm">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Sản phẩm nổi bật
                        </h2>
                        <p className="text-gray-600">
                            Những sản phẩm được yêu thích nhất tại ShopHub
                        </p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredProducts.map((product) => (
                                <Link
                                    key={product.id}
                                    to={`/product/${product.id}`}
                                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition group"
                                >
                                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                                                <ShoppingBag className="w-16 h-16 text-blue-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xl font-bold text-blue-600">
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                }).format(product.price)}
                                            </span>
                                            {product.stock > 0 ? (
                                                <span className="text-sm text-green-600 font-medium">
                                                    Còn hàng
                                                </span>
                                            ) : (
                                                <span className="text-sm text-red-600 font-medium">
                                                    Hết hàng
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-12">
                        <Link
                            to="/shop"
                            className="inline-flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            <span>Xem tất cả sản phẩm</span>
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-blue-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        Đăng ký nhận tin khuyến mãi
                    </h2>
                    <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                        Nhận thông tin về các sản phẩm mới và ưu đãi đặc biệt qua email
                    </p>
                    <form className="max-w-md mx-auto flex gap-2">
                        <input
                            type="email"
                            placeholder="Nhập email của bạn"
                            className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                        />
                        <button
                            type="submit"
                            className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
                        >
                            Đăng ký
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
}
