import { useState, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { User, Mail, Phone, MapPin, Camera, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        avatar: user?.avatar || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleAvatarClick = () => {
        if (isEditing && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file ảnh (JPG, PNG)');
            return;
        }

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Kích thước ảnh không được vượt quá 2MB');
            return;
        }

        // Show preview immediately (optimistic UI)
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData({ ...formData, avatar: reader.result as string });
        };
        reader.readAsDataURL(file);

        // Upload to server
        setUploading(true);
        const formDataToUpload = new FormData();
        formDataToUpload.append('avatar', file);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${API_URL}/users/profile/avatar`,
                formDataToUpload,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                const newAvatarUrl = response.data.data.avatar;
                setFormData({ ...formData, avatar: newAvatarUrl });
                updateUser({ ...user, avatar: newAvatarUrl });
                toast.success('Cập nhật ảnh đại diện thành công!');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể tải ảnh lên');
            // Revert to original avatar
            setFormData({ ...formData, avatar: user?.avatar || '' });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // TODO: Call API to update profile
            // const response = await userService.updateProfile(formData);

            // Update local user state
            updateUser(formData);
            setIsEditing(false);
            toast.success('Cập nhật thông tin thành công!');
        } catch (error) {
            toast.error('Có lỗi xảy ra, vui lòng thử lại!');
        }
    };

    const handleCancel = () => {
        setFormData({
            fullName: user?.fullName || '',
            email: user?.email || '',
            phone: user?.phone || '',
            address: user?.address || '',
            avatar: user?.avatar || '',
        });
        setIsEditing(false);
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Hồ sơ của tôi</h1>
                    <p className="text-gray-600 mt-1">
                        Quản lý thông tin cá nhân để bảo mật tài khoản
                    </p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                        Chỉnh sửa
                    </button>
                )}
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit}>
                {/* Hidden file input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left: Avatar */}
                    <div className="md:col-span-1">
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                                    {formData.avatar ? (
                                        <img
                                            src={formData.avatar}
                                            alt={formData.fullName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-16 h-16 text-blue-600" />
                                    )}
                                </div>
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={handleAvatarClick}
                                        disabled={uploading}
                                        className={`absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition shadow-lg ${uploading ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                        aria-label="Đổi ảnh đại diện"
                                    >
                                        {uploading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Camera className="w-5 h-5" />
                                        )}
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-4 text-center">
                                {uploading
                                    ? 'Đang tải lên...'
                                    : isEditing
                                        ? 'Nhấn vào biểu tượng để đổi ảnh'
                                        : 'Ảnh đại diện'}
                            </p>
                            {isEditing && (
                                <p className="text-xs text-gray-400 mt-1 text-center">
                                    JPG, PNG tối đa 2MB
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right: Form Fields */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Họ và tên <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                    placeholder="Nhập họ và tên"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                                    placeholder="email@example.com"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Email không thể thay đổi
                            </p>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số điện thoại
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Địa chỉ
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    rows={3}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                                    placeholder="Nhập địa chỉ của bạn"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {isEditing && (
                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                                >
                                    Lưu thay đổi
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition font-medium"
                                >
                                    Hủy
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
