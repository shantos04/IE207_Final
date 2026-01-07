import { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChangePasswordPage() {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords({
            ...showPasswords,
            [field]: !showPasswords[field],
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate
        if (formData.newPassword.length < 6) {
            toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }

        if (formData.currentPassword === formData.newPassword) {
            toast.error('Mật khẩu mới phải khác mật khẩu hiện tại');
            return;
        }

        try {
            // TODO: Call API to change password
            // await userService.changePassword({
            //     currentPassword: formData.currentPassword,
            //     newPassword: formData.newPassword,
            // });

            toast.success('Đổi mật khẩu thành công!');
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error) {
            toast.error('Mật khẩu hiện tại không đúng');
        }
    };

    const passwordStrength = (password: string) => {
        if (password.length === 0) return { strength: 0, text: '', color: '' };
        if (password.length < 6) return { strength: 25, text: 'Yếu', color: 'bg-red-500' };
        if (password.length < 8) return { strength: 50, text: 'Trung bình', color: 'bg-yellow-500' };
        if (!/[A-Z]/.test(password) || !/[0-9]/.test(password))
            return { strength: 75, text: 'Khá', color: 'bg-blue-500' };
        return { strength: 100, text: 'Mạnh', color: 'bg-green-500' };
    };

    const strength = passwordStrength(formData.newPassword);

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Đổi mật khẩu</h1>
                <p className="text-gray-600 mt-1">
                    Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-w-2xl">
                <div className="space-y-6">
                    {/* Current Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mật khẩu hiện tại <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPasswords.current ? 'text' : 'password'}
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nhập mật khẩu hiện tại"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('current')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.current ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mật khẩu mới <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPasswords.new ? 'text' : 'password'}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('new')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.new ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>

                        {/* Password Strength Indicator */}
                        {formData.newPassword.length > 0 && (
                            <div className="mt-2">
                                <div className="flex items-center space-x-2 mb-2">
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all ${strength.color}`}
                                            style={{ width: strength.strength + '%' }}
                                        />
                                    </div>
                                    <span className={`text-sm font-medium ${strength.color.replace('bg-', 'text-')}`}>
                                        {strength.text}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Mật khẩu tốt nên có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nhập lại mật khẩu mới"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('confirm')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.confirm ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        {formData.confirmPassword.length > 0 && (
                            <div className="flex items-center space-x-1 mt-2">
                                {formData.newPassword === formData.confirmPassword ? (
                                    <>
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span className="text-sm text-green-600">Mật khẩu khớp</span>
                                    </>
                                ) : (
                                    <span className="text-sm text-red-600">Mật khẩu không khớp</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Security Tips */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Lưu ý bảo mật</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Không sử dụng mật khẩu quá đơn giản</li>
                            <li>• Không dùng chung mật khẩu với các tài khoản khác</li>
                            <li>• Nên thay đổi mật khẩu định kỳ</li>
                            <li>• Không chia sẻ mật khẩu cho bất kỳ ai</li>
                        </ul>
                    </div>

                    {/* Submit Button */}
                    <div className="flex space-x-4 pt-4">
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            Đổi mật khẩu
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                setFormData({
                                    currentPassword: '',
                                    newPassword: '',
                                    confirmPassword: '',
                                })
                            }
                            className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition font-medium"
                        >
                            Làm mới
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
