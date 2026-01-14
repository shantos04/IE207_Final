import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User as UserIcon, Chrome } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import api from '../services/api';

// Validation schemas
const loginSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

const signUpSchema = z.object({
    fullName: z
        .string()
        .min(3, 'Tên phải có ít nhất 3 ký tự')
        .refine((val) => {
            // Check for @ symbol (email indicator)
            if (val.includes('@')) {
                return false;
            }
            return true;
        }, {
            message: 'Vui lòng nhập tên thật, không nhập Email vào đây',
        })
        .refine((val) => {
            // Check for domain patterns (.com, .vn, .net, etc.)
            if (/\.(com|vn|net|org|edu|gov|io|co)/i.test(val)) {
                return false;
            }
            return true;
        }, {
            message: 'Vui lòng nhập tên thật, không nhập Email vào đây',
        })
        .refine((val) => {
            // Only allow letters (including Vietnamese) and spaces
            // Regex supports all Vietnamese characters
            const namePattern = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s]+$/;
            return namePattern.test(val);
        }, {
            message: 'Tên không được chứa số hoặc ký tự đặc biệt',
        })
        .transform((val) => {
            // Auto-capitalize first letter of each word
            return val
                .trim()
                .split(' ')
                .filter(word => word.length > 0)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
        }),
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(6, 'Mật khẩu xác nhận phải có ít nhất 6 ký tự'),
    agreeToTerms: z.boolean().refine((val) => val === true, {
        message: 'Bạn phải đồng ý với điều khoản',
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

export default function AuthPage() {
    const [isSignUp, setIsSignUp] = useState(false);
    const { login, signUp } = useAuth();
    const navigate = useNavigate();

    // Login form
    const {
        register: registerLogin,
        handleSubmit: handleLoginSubmit,
        formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: 'admin@craftui.com',
            password: '123456',
        },
    });

    // Sign up form
    const {
        register: registerSignUp,
        handleSubmit: handleSignUpSubmit,
        formState: { errors: signUpErrors, isSubmitting: isSignUpSubmitting },
    } = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
        mode: 'onBlur', // ✅ Validate on blur for real-time feedback
    });

    /**
     * Xử lý đăng nhập
     * - Gọi API thông qua AuthContext
     * - Tự động lưu user + token vào localStorage (xử lý trong authService)
     * - Phân luồng chuyển hướng dựa trên role
     */
    const onLoginSubmit = async (data: LoginFormData) => {
        try {
            // 1. Gọi API login (đã tự động lưu localStorage trong authService.login)
            const user = await login(data);

            // 2. Hiển thị thông báo thành công
            toast.success(`Chào mừng ${user.fullName}!`);

            // 3. PHÂN LUỒNG CHUYỂN HƯỚNG dựa trên role
            if (user.role === 'admin' || user.role === 'manager' || user.role === 'staff') {
                // Admin/Manager/Staff -> Trang quản trị
                navigate('/admin/dashboard');
            } else {
                // Customer -> Trang chủ
                navigate('/');
            }
        } catch (error: any) {
            toast.error(error.message || 'Đăng nhập thất bại');
        }
    };

    /**
     * Xử lý đăng ký tài khoản mới
     * - Gọi API thông qua AuthContext
     * - Tự động lưu user + token vào localStorage (xử lý trong authService)
     * - Phân luồng chuyển hướng dựa trên role
     */
    const onSignUpSubmit = async (data: SignUpFormData) => {
        try {
            // 1. Gọi API đăng ký (đã tự động lưu localStorage trong authService.signUp)
            const user = await signUp({
                fullName: data.fullName,
                email: data.email,
                password: data.password,
            });

            // 2. Hiển thị thông báo thành công
            toast.success(`Chào mừng ${user.fullName}!`);

            // 3. PHÂN LUỒNG CHUYỂN HƯỚNG dựa trên role
            if (user.role === 'admin' || user.role === 'manager' || user.role === 'staff') {
                // Admin/Manager/Staff -> Trang quản trị
                navigate('/admin/dashboard');
            } else {
                // Customer -> Trang chủ
                navigate('/');
            }
        } catch (error: any) {
            toast.error(error.message || 'Đăng ký thất bại');
        }
    };

    /**
     * Xử lý đăng nhập bằng Google OAuth
     * - Gửi token tới backend để xác thực
     * - Lưu user + token vào localStorage
     * - Cập nhật AuthContext để UI cập nhật ngay lập tức
     * - Phân luồng chuyển hướng dựa trên role
     */
    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            console.log('✅ Google Response:', credentialResponse);

            if (!credentialResponse.credential) {
                toast.error('Không nhận được token từ Google');
                return;
            }

            const { credential } = credentialResponse;
            console.log('🔑 Sending token to backend...');

            // 1. Gọi API backend để xác thực Google token
            const response = await api.post('/users/google-login', { idToken: credential });
            console.log('✅ Backend response:', response.data);
            const { data } = response.data;

            // 2. Lưu user + token vào localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('accessToken', data.token);
            console.log('✅ Saved to localStorage');

            // 3. FORCE RELOAD PAGE để AuthContext lazy initialization đọc lại localStorage
            // Đây là cách đơn giản và đảm bảo nhất để sync state
            toast.success(`Chào mừng ${data.user.fullName}! Đang chuyển hướng...`);

            // 4. PHÂN LUỒNG CHUYỂN HƯỚNG dựa trên role
            setTimeout(() => {
                if (data.user.role === 'admin' || data.user.role === 'manager' || data.user.role === 'staff') {
                    console.log('🔄 Redirecting to admin dashboard...');
                    window.location.href = '/admin/dashboard';
                } else {
                    console.log('🔄 Redirecting to home (customer)...');
                    window.location.href = '/';
                }
            }, 300);

        } catch (error: any) {
            console.error('❌ Google Login Error:', error);
            toast.error(error.response?.data?.message || 'Đăng nhập Google thất bại');
        }
    };

    const handleGoogleError = () => {
        toast.error('Đăng nhập Google thất bại');
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="flex items-center justify-center mb-8">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden">
                            <img src="/logo.jpg" alt="ELECSTRIKE Logo" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Chào mừng đến với ELECSTRIKE.
                        </h1>
                        <p className="text-gray-500">
                            {isSignUp ? 'Đăng ký để bắt đầu.' : 'Đăng nhập để tiếp tục.'}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            Nhập thông tin của bạn để tiếp tục
                        </p>
                    </div>

                    {/* Login Form */}
                    {!isSignUp ? (
                        <form onSubmit={handleLoginSubmit(onLoginSubmit)} noValidate className="space-y-5">
                            {/* Email Input */}
                            <div>
                                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="login-email"
                                        type="email"
                                        autoComplete="email"
                                        {...registerLogin('email')}
                                        className={`w-full pl-11 pr-4 py-3.5 border ${loginErrors.email ? 'border-red-500' : 'border-gray-300'
                                            } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                                        placeholder="support@craftui.com"
                                    />
                                </div>
                                {loginErrors.email && (
                                    <p className="mt-1.5 text-sm text-red-500">{loginErrors.email.message}</p>
                                )}
                            </div>

                            {/* Password Input */}
                            <div>
                                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Mật khẩu
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="login-password"
                                        type="password"
                                        autoComplete="current-password"
                                        {...registerLogin('password')}
                                        className={`w-full pl-11 pr-4 py-3.5 border ${loginErrors.password ? 'border-red-500' : 'border-gray-300'
                                            } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                                        placeholder="Nhập mật khẩu..."
                                    />
                                </div>
                                {loginErrors.password && (
                                    <p className="mt-1.5 text-sm text-red-500">{loginErrors.password.message}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoginSubmitting}
                                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                            >
                                {isLoginSubmitting ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang đăng nhập...
                                    </span>
                                ) : (
                                    'Đăng nhập'
                                )}
                            </button>
                        </form>
                    ) : (
                        /* Sign Up Form */
                        <form onSubmit={handleSignUpSubmit(onSignUpSubmit)} noValidate className="space-y-5">
                            {/* Full Name Input */}
                            <div>
                                <label htmlFor="signup-fullname" className="block text-sm font-medium text-gray-700 mb-2">
                                    Họ và tên
                                </label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="signup-fullname"
                                        type="text"
                                        autoComplete="name"
                                        {...registerSignUp('fullName')}
                                        className={`w-full pl-11 pr-4 py-3.5 border ${signUpErrors.fullName ? 'border-red-500' : 'border-gray-300'
                                            } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                                        placeholder="Nguyễn Văn A"
                                    />
                                </div>
                                {signUpErrors.fullName ? (
                                    <p className="mt-1.5 text-sm text-red-500 flex items-start gap-1">
                                        <span className="mt-0.5">⚠️</span>
                                        <span>{signUpErrors.fullName.message}</span>
                                    </p>
                                ) : (
                                    <p className="mt-1.5 text-xs text-gray-500">
                                        Chỉ nhập chữ cái, không nhập số hoặc email
                                    </p>
                                )}
                            </div>

                            {/* Email Input */}
                            <div>
                                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="signup-email"
                                        type="email"
                                        autoComplete="email"
                                        {...registerSignUp('email')}
                                        className={`w-full pl-11 pr-4 py-3.5 border ${signUpErrors.email ? 'border-red-500' : 'border-gray-300'
                                            } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                                        placeholder="example@email.com"
                                    />
                                </div>
                                {signUpErrors.email && (
                                    <p className="mt-1.5 text-sm text-red-500">{signUpErrors.email.message}</p>
                                )}
                            </div>

                            {/* Password Input */}
                            <div>
                                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Mật khẩu
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="signup-password"
                                        type="password"
                                        autoComplete="new-password"
                                        {...registerSignUp('password')}
                                        className={`w-full pl-11 pr-4 py-3.5 border ${signUpErrors.password ? 'border-red-500' : 'border-gray-300'
                                            } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                                        placeholder="Nhập mật khẩu..."
                                    />
                                </div>
                                {signUpErrors.password && (
                                    <p className="mt-1.5 text-sm text-red-500">{signUpErrors.password.message}</p>
                                )}
                            </div>

                            {/* Confirm Password Input - NEW FIELD */}
                            <div>
                                <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Xác nhận mật khẩu
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="signup-confirm-password"
                                        type="password"
                                        autoComplete="new-password"
                                        {...registerSignUp('confirmPassword')}
                                        className={`w-full pl-11 pr-4 py-3.5 border ${signUpErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                            } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                                        placeholder="Nhập lại mật khẩu..."
                                    />
                                </div>
                                {signUpErrors.confirmPassword && (
                                    <p className="mt-1.5 text-sm text-red-500">{signUpErrors.confirmPassword.message}</p>
                                )}
                            </div>

                            {/* Terms Checkbox */}
                            <div>
                                <div className="flex items-start">
                                    <input
                                        id="signup-terms"
                                        type="checkbox"
                                        {...registerSignUp('agreeToTerms')}
                                        className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                    <label htmlFor="signup-terms" className="ml-2 text-sm text-gray-600">
                                        Tôi đồng ý với điều khoản & điều kiện
                                    </label>
                                </div>
                                {signUpErrors.agreeToTerms && (
                                    <p className="mt-1.5 text-sm text-red-500">{signUpErrors.agreeToTerms.message}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSignUpSubmitting}
                                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                            >
                                {isSignUpSubmitting ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang đăng ký...
                                    </span>
                                ) : (
                                    'Đăng ký'
                                )}
                            </button>
                        </form>
                    )}

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Hoặc đăng nhập với</span>
                        </div>
                    </div>

                    {/* Google Login Button */}
                    <div className="w-full">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme="outline"
                            size="large"
                            text="continue_with"
                            locale="vi"
                        />
                    </div>

                    {/* Old Social Login Buttons - Hidden */}
                    <div className="grid grid-cols-3 gap-3 hidden">
                        <button
                            type="button"
                            aria-label="Đăng nhập bằng Twitter"
                            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="#1DA1F2"
                                    d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
                                />
                            </svg>
                        </button>
                        <button
                            type="button"
                            aria-label="Đăng nhập bằng Google"
                            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            <Chrome className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                            type="button"
                            aria-label="Đăng nhập bằng Facebook"
                            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="#1877F2"
                                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Toggle Sign Up/Sign In */}
                    <div className="mt-6 text-center">
                        {!isSignUp ? (
                            <p className="text-sm text-gray-600">
                                Chưa có tài khoản?{' '}
                                <button
                                    type="button"
                                    onClick={() => setIsSignUp(true)}
                                    className="text-primary-600 font-semibold hover:underline"
                                >
                                    Đăng ký
                                </button>
                            </p>
                        ) : (
                            <p className="text-sm text-gray-600">
                                Đã có tài khoản?{' '}
                                <button
                                    type="button"
                                    onClick={() => setIsSignUp(false)}
                                    className="text-primary-600 font-semibold hover:underline"
                                >
                                    Đăng nhập
                                </button>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Side - Galaxy Background */}
            <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="text-center text-white">
                        <div className="mb-8">
                            <div className="w-64 h-64 mx-auto rounded-full overflow-hidden bg-white flex items-center justify-center">
                                <img src="/logo.jpg" alt="ELECSTRIKE Logo" className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <h2 className="text-4xl font-bold mb-4">
                            Quản lý Linh Kiện Điện Tử
                        </h2>
                        <p className="text-xl text-white/80">
                            Hệ thống ERP hiện đại và dễ sử dụng
                        </p>
                    </div>
                </div>

                {/* Decorative circles */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full"></div>

                {/* Stars effect */}
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            </div>
        </div>
    );
}
