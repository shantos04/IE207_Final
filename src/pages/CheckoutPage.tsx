import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/orderService';
import {
    MapPin,
    Phone,
    User,
    CreditCard,
    Wallet,
    Package,
    X,
    CheckCircle,
    ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Zod Schema for form validation
const checkoutSchema = z.object({
    fullName: z
        .string()
        .min(2, 'Vui lòng nhập họ tên đầy đủ')
        .nonempty('Vui lòng nhập họ tên đầy đủ'),
    phone: z
        .string()
        .regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ (VD: 0912345678)')
        .nonempty('Vui lòng nhập số điện thoại'),
    address: z
        .string()
        .min(5, 'Vui lòng nhập địa chỉ nhận hàng')
        .nonempty('Vui lòng nhập địa chỉ nhận hàng'),
    city: z
        .string()
        .min(2, 'Vui lòng nhập tỉnh/thành phố')
        .nonempty('Vui lòng nhập tỉnh/thành phố'),
    district: z.string().optional(),
    ward: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface ShippingAddress {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    district?: string;
    ward?: string;
}

export default function CheckoutPage() {
    const { items, total, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    // React Hook Form setup
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
    } = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            fullName: user?.fullName || '',
            phone: user?.phone || '',
            address: '',
            city: '',
            district: '',
            ward: '',
        },
    });

    // State
    const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(-1); // -1 = new address
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Banking'>('COD');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showBankingModal, setShowBankingModal] = useState(false);
    const [orderTotal, setOrderTotal] = useState(0);

    // Calculate shipping fee and total
    const shippingFee = total > 500000 ? 0 : 30000;
    const finalTotal = total + shippingFee;

    useEffect(() => {
        if (items.length === 0) {
            navigate('/cart');
        }
    }, [items, navigate]);

    useEffect(() => {
        setOrderTotal(finalTotal);
    }, [finalTotal]);

    // Load saved addresses
    const savedAddresses = user?.addresses || [];

    const handleSelectSavedAddress = (index: number) => {
        setSelectedAddressIndex(index);
        if (index >= 0 && savedAddresses[index]) {
            const addr = savedAddresses[index];
            // Update form values
            setValue('fullName', addr.fullName);
            setValue('phone', addr.phone);
            setValue('address', addr.address);
            setValue('city', addr.city);
            setValue('district', addr.district || '');
            setValue('ward', addr.ward || '');
        } else {
            // New address - reset to user defaults
            reset({
                fullName: user?.fullName || '',
                phone: user?.phone || '',
                address: '',
                city: '',
                district: '',
                ward: '',
            });
        }
    };

    const createOrderData = (formData: CheckoutFormData) => {
        return {
            customer: {
                name: formData.fullName,
                email: user?.email || '',
                phone: formData.phone,
            },
            orderItems: items.map((item) => ({
                product: item.id,
                quantity: item.quantity,
                price: item.price,
            })),
            shippingAddress: {
                address: formData.address,
                city: formData.city,
                district: formData.district,
                ward: formData.ward,
                phone: formData.phone,
            },
            paymentMethod: paymentMethod,
            totalAmount: finalTotal,
            notes: '',
        };
    };

    const onSubmit = async (formData: CheckoutFormData) => {
        // If Banking payment, show modal first
        if (paymentMethod === 'Banking') {
            setShowBankingModal(true);
            return;
        }

        // COD payment - create order directly
        await processOrder(formData);
    };

    const processOrder = async (formData: CheckoutFormData) => {
        setIsSubmitting(true);
        try {
            const orderData = createOrderData(formData);
            const response = await orderService.createOrder(orderData);

            if (response.success) {
                toast.success('Đặt hàng thành công!');
                clearCart();
                navigate('/account/orders');
            } else {
                toast.error('Đặt hàng thất bại. Vui lòng thử lại!');
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Có lỗi xảy ra!');
        } finally {
            setIsSubmitting(false);
            setShowBankingModal(false);
        }
    };

    const handleBankingConfirm = async () => {
        // Get current form values and validate
        handleSubmit(async (formData) => {
            await processOrder(formData);
        })();
    };

    if (items.length === 0) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/cart')}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Quay lại giỏ hàng</span>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
                    <p className="text-gray-600 mt-1">Vui lòng điền đầy đủ thông tin để hoàn tất đơn hàng</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN - Shipping & Payment Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipping Address */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center space-x-2 mb-6">
                                <MapPin className="w-6 h-6 text-blue-600" />
                                <h2 className="text-xl font-bold text-gray-900">Địa chỉ giao hàng</h2>
                            </div>

                            {/* Saved Addresses */}
                            {savedAddresses.length > 0 && (
                                <div className="mb-6 space-y-3">
                                    <p className="text-sm font-medium text-gray-700 mb-3">
                                        Chọn địa chỉ có sẵn:
                                    </p>
                                    {savedAddresses.map((addr: any, index: number) => (
                                        <label
                                            key={index}
                                            className={`
                                                flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition
                                                ${selectedAddressIndex === index
                                                    ? 'border-blue-600 bg-blue-50'
                                                    : 'border-gray-200 hover:border-blue-300'
                                                }
                                            `}
                                        >
                                            <input
                                                type="radio"
                                                name="address"
                                                checked={selectedAddressIndex === index}
                                                onChange={() => handleSelectSavedAddress(index)}
                                                className="mt-1"
                                            />
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">
                                                    {addr.fullName} - {addr.phone}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {addr.address}, {addr.ward && `${addr.ward}, `}
                                                    {addr.district && `${addr.district}, `}
                                                    {addr.city}
                                                </p>
                                            </div>
                                        </label>
                                    ))}

                                    {/* New Address Option */}
                                    <label
                                        className={`
                                            flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition
                                            ${selectedAddressIndex === -1
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300'
                                            }
                                        `}
                                    >
                                        <input
                                            type="radio"
                                            name="address"
                                            checked={selectedAddressIndex === -1}
                                            onChange={() => handleSelectSavedAddress(-1)}
                                            className="mt-1"
                                        />
                                        <span className="font-medium text-blue-600">
                                            Sử dụng địa chỉ mới
                                        </span>
                                    </label>
                                </div>
                            )}

                            {/* New Address Form */}
                            {(selectedAddressIndex === -1 || savedAddresses.length === 0) && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Họ và tên <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    {...register('fullName')}
                                                    className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.fullName
                                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                                        }`}
                                                    placeholder="Nguyễn Văn A"
                                                />
                                            </div>
                                            {errors.fullName && (
                                                <p className="text-red-500 text-xs mt-1 animate-pulse">
                                                    {errors.fullName.message}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Số điện thoại <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    {...register('phone')}
                                                    className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.phone
                                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                                        }`}
                                                    placeholder="VD: 0909123456"
                                                />
                                            </div>
                                            {errors.phone && (
                                                <p className="text-red-500 text-xs mt-1 animate-pulse">
                                                    {errors.phone.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Địa chỉ <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            {...register('address')}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.address
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                                }`}
                                            placeholder="Số nhà, tên đường"
                                        />
                                        {errors.address && (
                                            <p className="text-red-500 text-xs mt-1 animate-pulse">
                                                {errors.address.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phường/Xã
                                            </label>
                                            <input
                                                type="text"
                                                {...register('ward')}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-200 transition-colors"
                                                placeholder="Phường 1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Quận/Huyện
                                            </label>
                                            <input
                                                type="text"
                                                {...register('district')}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-200 transition-colors"
                                                placeholder="Quận 1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tỉnh/Thành phố <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                {...register('city')}
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.city
                                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                                    }`}
                                                placeholder="TP. Hồ Chí Minh"
                                            />
                                            {errors.city && (
                                                <p className="text-red-500 text-xs mt-1 animate-pulse">
                                                    {errors.city.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center space-x-2 mb-6">
                                <CreditCard className="w-6 h-6 text-blue-600" />
                                <h2 className="text-xl font-bold text-gray-900">
                                    Phương thức thanh toán
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {/* COD */}
                                <label
                                    className={`
                                        flex items-start space-x-4 p-4 border-2 rounded-lg cursor-pointer transition
                                        ${paymentMethod === 'COD'
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-gray-200 hover:border-blue-300'
                                        }
                                    `}
                                >
                                    <input
                                        type="radio"
                                        name="payment"
                                        checked={paymentMethod === 'COD'}
                                        onChange={() => setPaymentMethod('COD')}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <Wallet className="w-5 h-5 text-green-600" />
                                            <span className="font-semibold text-gray-900">
                                                Thanh toán khi nhận hàng (COD)
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Thanh toán bằng tiền mặt khi nhận hàng
                                        </p>
                                    </div>
                                </label>

                                {/* Banking */}
                                <label
                                    className={`
                                        flex items-start space-x-4 p-4 border-2 rounded-lg cursor-pointer transition
                                        ${paymentMethod === 'Banking'
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-gray-200 hover:border-blue-300'
                                        }
                                    `}
                                >
                                    <input
                                        type="radio"
                                        name="payment"
                                        checked={paymentMethod === 'Banking'}
                                        onChange={() => setPaymentMethod('Banking')}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <CreditCard className="w-5 h-5 text-blue-600" />
                                            <span className="font-semibold text-gray-900">
                                                Chuyển khoản ngân hàng
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Quét mã QR để thanh toán
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Đơn hàng của bạn</h2>

                            {/* Products */}
                            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center space-x-3 pb-4 border-b border-gray-100 last:border-0"
                                    >
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">
                                                {item.name}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {item.quantity} x{' '}
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                }).format(item.price)}
                                            </p>
                                        </div>
                                        <p className="font-semibold text-gray-900">
                                            {new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND',
                                            }).format(item.price * item.quantity)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Summary */}
                            <div className="space-y-3 mb-6 pt-4 border-t border-gray-200">
                                <div className="flex justify-between text-gray-700">
                                    <span>Tạm tính</span>
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
                                        {shippingFee === 0 ? (
                                            <span className="text-green-600">Miễn phí</span>
                                        ) : (
                                            new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND',
                                            }).format(shippingFee)
                                        )}
                                    </span>
                                </div>
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

                            {/* Place Order Button */}
                            <button
                                onClick={handleSubmit(onSubmit)}
                                disabled={isSubmitting}
                                className="w-full py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Đang xử lý...' : 'ĐẶT HÀNG'}
                            </button>

                            {/* Security Note */}
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-600 text-center">
                                    🔒 Thông tin của bạn được bảo mật
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Banking Modal */}
            {showBankingModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
                        <button
                            onClick={() => setShowBankingModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            aria-label="Đóng"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CreditCard className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Chuyển khoản ngân hàng
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Vui lòng quét mã QR bên dưới để thanh toán
                            </p>

                            {/* QR Code */}
                            <div className="bg-gray-50 p-6 rounded-xl mb-6">
                                <img
                                    src={`https://img.vietqr.io/image/MB-0123456789-compact.png?amount=${orderTotal}&addInfo=DH${Date.now()}`}
                                    alt="QR Code"
                                    className="w-full max-w-xs mx-auto"
                                />
                            </div>

                            {/* Bank Info */}
                            <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Ngân hàng:</span>
                                        <span className="font-semibold">MB Bank</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Số tài khoản:</span>
                                        <span className="font-semibold">0123456789</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Chủ tài khoản:</span>
                                        <span className="font-semibold">NGUYEN VAN A</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Số tiền:</span>
                                        <span className="font-bold text-red-600">
                                            {new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND',
                                            }).format(orderTotal)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Nội dung:</span>
                                        <span className="font-semibold">DH{Date.now()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Confirm Button */}
                            <button
                                onClick={handleBankingConfirm}
                                disabled={isSubmitting}
                                className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center space-x-2"
                            >
                                <CheckCircle className="w-5 h-5" />
                                <span>{isSubmitting ? 'Đang xử lý...' : 'Tôi đã chuyển tiền'}</span>
                            </button>

                            <p className="text-xs text-gray-500 mt-4">
                                Đơn hàng sẽ được xác nhận sau khi chúng tôi nhận được thanh toán
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
