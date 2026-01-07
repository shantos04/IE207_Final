import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function CartPage() {
    const { items, updateQuantity, removeFromCart, total } = useCart();
    const navigate = useNavigate();

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-md mx-auto text-center">
                    <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Giỏ hàng trống
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các sản phẩm của chúng tôi!
                    </p>
                    <Link
                        to="/shop"
                        className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                        Tiếp tục mua sắm
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Tiếp tục mua sắm</span>
                </button>
                <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
                <p className="text-gray-600 mt-2">
                    Bạn có {items.length} sản phẩm trong giỏ hàng
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-lg shadow-sm p-6 flex items-center space-x-6"
                        >
                            {/* Image */}
                            <Link
                                to={`/product/${item.id}`}
                                className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden"
                            >
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover hover:scale-110 transition duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                                        <ShoppingBag className="w-10 h-10 text-blue-300" />
                                    </div>
                                )}
                            </Link>

                            {/* Info */}
                            <div className="flex-1">
                                <Link
                                    to={`/product/${item.id}`}
                                    className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition"
                                >
                                    {item.name}
                                </Link>
                                <p className="text-xl font-bold text-blue-600 mt-1">
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                    }).format(item.price)}
                                </p>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="text-lg font-semibold w-8 text-center">
                                    {item.quantity}
                                </span>
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Subtotal */}
                            <div className="text-right min-w-[120px]">
                                <p className="text-sm text-gray-600 mb-1">Tổng</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                    }).format(item.price * item.quantity)}
                                </p>
                            </div>

                            {/* Remove Button */}
                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Xóa khỏi giỏ hàng"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">
                            Tóm tắt đơn hàng
                        </h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Tạm tính:</span>
                                <span className="font-medium">
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                    }).format(total)}
                                </span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Phí vận chuyển:</span>
                                <span className="font-medium text-green-600">Miễn phí</span>
                            </div>
                            <div className="border-t border-gray-200 pt-3 mt-3">
                                <div className="flex justify-between text-lg font-bold text-gray-900">
                                    <span>Tổng cộng:</span>
                                    <span className="text-blue-600">
                                        {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                        }).format(total)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition mb-3"
                        >
                            Thanh toán
                        </button>

                        <Link
                            to="/shop"
                            className="block text-center py-3 text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Tiếp tục mua sắm
                        </Link>

                        {/* Shipping Info */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                ✓ Miễn phí vận chuyển cho đơn hàng trên 500.000đ
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                                ✓ Đổi trả trong vòng 30 ngày
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                                ✓ Thanh toán an toàn và bảo mật
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
