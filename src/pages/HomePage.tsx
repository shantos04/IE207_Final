import { Link } from 'react-router-dom';
import { ShoppingCart, Truck, Shield, Headphones, ArrowRight, Cpu, Gauge, Wifi, Zap, Package, CircuitBoard, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';

export default function HomePage() {
    const [newProducts, setNewProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchNewProducts = async () => {
            try {
                // Fetch newest products
                const response = await productService.getProducts({ limit: 8 });
                setNewProducts(response.data.slice(0, 8));
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchNewProducts();
    }, []);

    const categories = [
        {
            icon: Cpu,
            name: 'Vi điều khiển',
            slug: 'vi-dieu-khien',
            color: 'from-blue-500 to-blue-600',
            count: '150+',
        },
        {
            icon: Gauge,
            name: 'Cảm biến',
            slug: 'cam-bien',
            color: 'from-green-500 to-green-600',
            count: '200+',
        },
        {
            icon: Wifi,
            name: 'Module truyền thông',
            slug: 'module-truyen-thong',
            color: 'from-purple-500 to-purple-600',
            count: '80+',
        },
        {
            icon: Zap,
            name: 'Linh kiện điện tử',
            slug: 'linh-kien-dien-tu',
            color: 'from-orange-500 to-orange-600',
            count: '300+',
        },
        {
            icon: Package,
            name: 'Module nguồn',
            slug: 'module-nguon',
            color: 'from-red-500 to-red-600',
            count: '50+',
        },
        {
            icon: CircuitBoard,
            name: 'Bo mạch phát triển',
            slug: 'bo-mach',
            color: 'from-indigo-500 to-indigo-600',
            count: '100+',
        },
    ];

    const benefits = [
        {
            icon: Truck,
            title: 'Giao hàng nhanh',
            description: 'Giao hàng trong 24h với TP.HCM, 2-3 ngày toàn quốc',
        },
        {
            icon: Shield,
            title: 'Bảo hành 1 đổi 1',
            description: 'Đổi mới ngay nếu sản phẩm lỗi trong 30 ngày đầu',
        },
        {
            icon: Headphones,
            title: 'Hỗ trợ kỹ thuật 24/7',
            description: 'Đội ngũ kỹ sư sẵn sàng tư vấn mọi lúc mọi nơi',
        },
    ];

    const handleAddToCart = (product: any) => {
        if (product.stock > 0) {
            addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image_url,
            }, 1);
            toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
        } else {
            toast.error('Sản phẩm đã hết hàng!');
        }
    };

    return (
        <div>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 py-20 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div>
                            <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                                🎉 Giảm giá đến 30% cho sản phẩm mới
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                                Linh kiện điện tử
                                <span className="block text-yellow-300">chính hãng</span>
                            </h1>
                            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                                Giải pháp IoT toàn diện - Arduino, ESP32, Raspberry Pi, cảm biến và hàng trăm linh kiện chất lượng cao
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    to="/shop"
                                    className="inline-flex items-center space-x-2 bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-bold hover:bg-yellow-300 transition shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    <span>Mua ngay</span>
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    to="/about"
                                    className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition border border-white/30"
                                >
                                    <span>Tìm hiểu thêm</span>
                                </Link>
                            </div>
                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/20">
                                <div>
                                    <div className="text-3xl font-bold text-yellow-300">1000+</div>
                                    <div className="text-blue-200 text-sm">Sản phẩm</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-yellow-300">5000+</div>
                                    <div className="text-blue-200 text-sm">Khách hàng</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-yellow-300">99%</div>
                                    <div className="text-blue-200 text-sm">Hài lòng</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Image */}
                        <div className="hidden lg:block">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl blur-2xl opacity-30"></div>
                                <img
                                    src="https://images.unsplash.com/photo-1553406830-ef2513450d76?w=800&auto=format&fit=crop"
                                    alt="Electronics Components"
                                    className="relative rounded-3xl shadow-2xl w-full h-auto"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Categories */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Danh mục nổi bật
                        </h2>
                        <p className="text-gray-600">
                            Khám phá các danh mục linh kiện điện tử phổ biến
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {categories.map((category, index) => (
                            <Link
                                key={index}
                                to={`/shop?category=${category.slug}`}
                                className="group"
                            >
                                <div className="bg-gradient-to-br ${category.color} rounded-2xl p-6 text-center text-white transform transition hover:scale-105 hover:shadow-xl">
                                    <div className="flex justify-center mb-4">
                                        <category.icon className="w-12 h-12" />
                                    </div>
                                    <h3 className="font-semibold mb-2">{category.name}</h3>
                                    <p className="text-sm opacity-90">{category.count}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* New Arrivals */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Sản phẩm mới nhất
                        </h2>
                        <p className="text-gray-600">
                            Những sản phẩm mới cập nhật gần đây
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
                            {newProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition group"
                                >
                                    <Link to={`/product/${product.id}`} className="block">
                                        <div className="relative h-48 bg-gray-200 overflow-hidden">
                                            {product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                                                    <Package className="w-16 h-16 text-blue-300" />
                                                </div>
                                            )}
                                            {product.stock === 0 && (
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                    <span className="text-white font-bold">Hết hàng</span>
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                    <div className="p-4">
                                        <Link to={`/product/${product.id}`}>
                                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition min-h-[3rem]">
                                                {product.name}
                                            </h3>
                                        </Link>

                                        {/* Rating */}
                                        <div className="flex items-center mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < 4
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : 'text-gray-300'
                                                        }`}
                                                />
                                            ))}
                                            <span className="text-sm text-gray-500 ml-2">(4.0)</span>
                                        </div>

                                        {/* Price */}
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xl font-bold text-red-600">
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                }).format(product.price)}
                                            </span>
                                            {product.stock > 0 && (
                                                <span className="text-xs text-green-600 font-medium">
                                                    Còn {product.stock}
                                                </span>
                                            )}
                                        </div>

                                        {/* Add to Cart Button */}
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            disabled={product.stock === 0}
                                            className={`w-full py-2 rounded-lg font-medium transition flex items-center justify-center space-x-2 ${product.stock > 0
                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                            <span>{product.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}</span>
                                        </button>
                                    </div>
                                </div>
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

            {/* Benefits Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50 hover:shadow-lg transition"
                            >
                                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                                    <benefit.icon className="w-10 h-10 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {benefit.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {benefit.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
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
                            className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-lg font-bold hover:bg-yellow-300 transition"
                        >
                            Đăng ký
                        </button>
                    </form>
                </div>
            </section>
        </div >
    );
}
