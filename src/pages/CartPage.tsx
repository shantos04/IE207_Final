import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Package, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
    const { items, updateQuantity, removeFromCart, clearCart, total, totalItems } = useCart();
    const navigate = useNavigate();

    const handleQuantityChange = (id: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        updateQuantity(id, newQuantity);
    };

    const handleRemoveItem = (id: string, name: string) => {
        removeFromCart(id);
        toast.success(`Đã xóa ${name} khỏi giỏ hàng`);
    };

    const discount = 0; // Có thể thêm logic tính discount
    const shipping = total > 500000 ? 0 : 30000; // Free ship nếu > 500k
    const finalTotal = total + shipping - discount;

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md mx-auto text-center">
                    <div className="bg-white rounded-2xl shadow-lg p-12">
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
                            Khám phá sản phẩm
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Tiếp tục mua sắm</span>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
                    <p className="text-gray-600 mt-2">
                        Bạn có <span className="font-semibold text-gray-900">{totalItems}</span> sản phẩm trong giỏ hàng
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT: Cart Items Table */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            {/* Table Header */}
                            <div className="hidden md:grid md:grid-cols-12 gap-4 p-6 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 text-sm">
                                <div className="col-span-6">Sản phẩm</div>
                                <div className="col-span-2 text-center">Đơn giá</div>
                                <div className="col-span-2 text-center">Số lượng</div>
                                <div className="col-span-2 text-right">Thành tiền</div>
                            </div>

                            {/* Cart Items */}
                            <div className="divide-y divide-gray-200">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:bg-gray-50 transition"
                                    >
                                        {/* Product Info - Col span 6 */}
                                        <div className="col-span-12 md:col-span-6">
                                            <div className="flex items-center space-x-4">
                                                {/* Product Image */}
                                                <Link
                                                    to={`/product/${item.id}`}
                                                    className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100"
                                                >
                                                    {item.image ? (
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="w-8 h-8 text-gray-400" />
                                                        </div>
                                                    )}
                                                </Link>

                                                {/* Product Name */}
                                                <div className="flex-1 min-w-0">
                                                    <Link
                                                        to={`/product/${item.id}`}
                                                        className="font-semibold text-gray-900 hover:text-blue-600 transition line-clamp-2"
                                                    >
                                                        {item.name}
                                                    </Link>
                                                    {/* Mobile Price */}
                                                    <div className="md:hidden text-sm text-gray-600 mt-1">
                                                        {new Intl.NumberFormat('vi-VN', {
                                                            style: 'currency',
                                                            currency: 'VND',
                                                        }).format(item.price)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Price - Col span 2 (Hidden on mobile) */}
                                        <div className="hidden md:block col-span-2 text-center">
                                            <span className="font-semibold text-gray-900">
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                }).format(item.price)}
                                            </span>
                                        </div>

                                        {/* Quantity Controls - Col span 2 */}
                                        <div className="col-span-12 md:col-span-2">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                    className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-50"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 1;
                                                        handleQuantityChange(item.id, val);
                                                    }}
                                                    className="w-16 text-center border border-gray-300 rounded-lg py-1 font-semibold"
                                                    min="1"
                                                />
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Subtotal & Remove - Col span 2 */}
                                        <div className="col-span-12 md:col-span-2">
                                            <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center space-y-0 md:space-y-2">
                                                <span className="font-bold text-lg text-red-600">
                                                    {new Intl.NumberFormat('vi-VN', {
                                                        style: 'currency',
                                                        currency: 'VND',
                                                    }).format(item.price * item.quantity)}
                                                </span>
                                                <button
                                                    onClick={() => handleRemoveItem(item.id, item.name)}
                                                    className="text-red-600 hover:text-red-700 transition flex items-center space-x-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span className="text-sm">Xóa</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Clear Cart Button */}
                            <div className="p-6 bg-gray-50 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        if (window.confirm('Bạn có chắc muốn xóa tất cả sản phẩm?')) {
                                            clearCart();
                                            toast.success('Đã xóa tất cả sản phẩm khỏi giỏ hàng');
                                        }
                                    }}
                                    className="text-red-600 hover:text-red-700 transition flex items-center space-x-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="text-sm font-medium">Xóa tất cả</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Cart Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">
                                Cộng giỏ hàng
                            </h2>

                            {/* Summary Items */}
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-700">
                                    <span>Tạm tính ({totalItems} sản phẩm)</span>
                                    <span className="font-semibold">
                                        {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                        }).format(total)}
                                    </span>
                                </div>

                                <div className="flex justify-between text-gray-700">
                                    <span>Phí vận chuyển</span>
                                    <span className="font-semibold">
                                        {shipping === 0 ? (
                                            <span className="text-green-600">Miễn phí</span>
                                        ) : (
                                            new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND',
                                            }).format(shipping)
                                        )}
                                    </span>
                                </div>

                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span className="flex items-center space-x-1">
                                            <Tag className="w-4 h-4" />
                                            <span>Giảm giá</span>
                                        </span>
                                        <span className="font-semibold">
                                            -{new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND',
                                            }).format(discount)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Total */}
                            <div className="pt-4 border-t border-gray-200 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                                    <span className="text-2xl font-bold text-red-600">
                                        {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                        }).format(finalTotal)}
                                    </span>
                                </div>
                            </div>

                            {/* Shipping Notice */}
                            {total < 500000 && (
                                <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-700">
                                        Mua thêm{' '}
                                        <span className="font-bold">
                                            {new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND',
                                            }).format(500000 - total)}
                                        </span>{' '}
                                        để được miễn phí vận chuyển!
                                    </p>
                                </div>
                            )}

                            {/* Checkout Button */}
                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition text-lg"
                            >
                                Tiến hành thanh toán
                            </button>

                            <Link
                                to="/shop"
                                className="block w-full py-3 mt-3 text-center border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 transition"
                            >
                                Tiếp tục mua sắm
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
