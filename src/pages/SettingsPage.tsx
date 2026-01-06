import { useState, useEffect } from 'react';
import { Building2, User, Lock, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import {
    getSettings,
    updateSettings,
    updateUserProfile,
    changePassword,
    SystemSettings,
} from '../services/settingService';

type TabType = 'system' | 'profile' | 'password';

export default function SettingsPage() {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [loading, setLoading] = useState(false);
    const [systemSettings, setSystemSettings] = useState<SystemSettings>({
        companyName: '',
        logoUrl: '',
        taxCode: '',
        address: '',
        phone: '',
        email: '',
        currency: 'VND',
    });

    const [profileData, setProfileData] = useState({
        fullName: user?.fullName || '',
        avatar: user?.avatar || '',
        phone: '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Load system settings
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const settings = await getSettings();
            setSystemSettings(settings);
        } catch (error: any) {
            console.error('Failed to load settings:', error);
        }
    };

    const handleUpdateSystemSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updated = await updateSettings(systemSettings);
            setSystemSettings(updated);
            toast.success('Cập nhật cấu hình thành công!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Cập nhật thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updated = await updateUserProfile(profileData);
            updateUser(updated);
            toast.success('Cập nhật thông tin thành công!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Cập nhật thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Mật khẩu mới và xác nhận không khớp!');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!');
            return;
        }

        setLoading(true);
        try {
            await changePassword(passwordData);
            toast.success('Đổi mật khẩu thành công!');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'profile' as TabType, label: 'Thông tin cá nhân', icon: User },
        { id: 'password' as TabType, label: 'Đổi mật khẩu', icon: Lock },
        ...(user?.role === 'admin' ? [{ id: 'system' as TabType, label: 'Cấu hình hệ thống', icon: Building2 }] : []),
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Cài đặt</h1>
                <p className="text-gray-500 mt-1">Quản lý thông tin cá nhân và cấu hình hệ thống</p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200">
                    <div className="flex space-x-1 p-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${activeTab === tab.id
                                        ? 'bg-primary-50 text-primary-600'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-2xl">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Họ và tên
                                </label>
                                <input
                                    type="text"
                                    value={profileData.fullName}
                                    onChange={(e) =>
                                        setProfileData({ ...profileData, fullName: e.target.value })
                                    }
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Nhập họ và tên"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Số điện thoại
                                </label>
                                <input
                                    type="tel"
                                    value={profileData.phone}
                                    onChange={(e) =>
                                        setProfileData({ ...profileData, phone: e.target.value })
                                    }
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="0901234567"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Avatar URL
                                </label>
                                <input
                                    type="url"
                                    value={profileData.avatar}
                                    onChange={(e) =>
                                        setProfileData({ ...profileData, avatar: e.target.value })
                                    }
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Đang lưu...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            <span>Lưu thay đổi</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Password Tab */}
                    {activeTab === 'password' && (
                        <form onSubmit={handleChangePassword} className="space-y-6 max-w-2xl">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mật khẩu hiện tại
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) =>
                                        setPasswordData({
                                            ...passwordData,
                                            currentPassword: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Nhập mật khẩu hiện tại"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mật khẩu mới
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) =>
                                        setPasswordData({
                                            ...passwordData,
                                            newPassword: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Xác nhận mật khẩu mới
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) =>
                                        setPasswordData({
                                            ...passwordData,
                                            confirmPassword: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Nhập lại mật khẩu mới"
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Đang xử lý...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-5 h-5" />
                                            <span>Đổi mật khẩu</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* System Settings Tab (Admin Only) */}
                    {activeTab === 'system' && user?.role === 'admin' && (
                        <form onSubmit={handleUpdateSystemSettings} className="space-y-6 max-w-2xl">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên công ty
                                </label>
                                <input
                                    type="text"
                                    value={systemSettings.companyName}
                                    onChange={(e) =>
                                        setSystemSettings({
                                            ...systemSettings,
                                            companyName: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Công ty TNHH ABC"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mã số thuế
                                </label>
                                <input
                                    type="text"
                                    value={systemSettings.taxCode}
                                    onChange={(e) =>
                                        setSystemSettings({
                                            ...systemSettings,
                                            taxCode: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="0123456789"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Địa chỉ
                                </label>
                                <textarea
                                    value={systemSettings.address}
                                    onChange={(e) =>
                                        setSystemSettings({
                                            ...systemSettings,
                                            address: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="123 Nguyễn Văn Linh, Q.7, TP.HCM"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Số điện thoại
                                    </label>
                                    <input
                                        type="tel"
                                        value={systemSettings.phone}
                                        onChange={(e) =>
                                            setSystemSettings({
                                                ...systemSettings,
                                                phone: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="0901234567"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={systemSettings.email}
                                        onChange={(e) =>
                                            setSystemSettings({
                                                ...systemSettings,
                                                email: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="contact@company.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                                    Đơn vị tiền tệ
                                </label>
                                <select
                                    id="currency"
                                    value={systemSettings.currency}
                                    onChange={(e) =>
                                        setSystemSettings({
                                            ...systemSettings,
                                            currency: e.target.value as 'VND' | 'USD' | 'EUR',
                                        })
                                    }
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="VND">VND - Việt Nam Đồng</option>
                                    <option value="USD">USD - US Dollar</option>
                                    <option value="EUR">EUR - Euro</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Logo URL
                                </label>
                                <input
                                    type="url"
                                    value={systemSettings.logoUrl}
                                    onChange={(e) =>
                                        setSystemSettings({
                                            ...systemSettings,
                                            logoUrl: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Đang lưu...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            <span>Lưu cấu hình</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
