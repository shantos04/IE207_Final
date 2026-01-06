import api from './api';

export interface SystemSettings {
    _id?: string;
    companyName: string;
    logoUrl: string;
    taxCode: string;
    address: string;
    phone: string;
    email: string;
    currency: 'VND' | 'USD' | 'EUR';
    createdAt?: string;
    updatedAt?: string;
}

export interface UpdateProfileData {
    fullName?: string;
    avatar?: string;
    phone?: string;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// Get system settings
export const getSettings = async (): Promise<SystemSettings> => {
    const { data } = await api.get('/settings');
    return data.data;
};

// Update system settings (Admin only)
export const updateSettings = async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
    const { data } = await api.put('/settings', settings);
    return data.data;
};

// Update user profile
export const updateUserProfile = async (profileData: UpdateProfileData) => {
    const { data } = await api.put('/settings/profile', profileData);
    return data.data;
};

// Change password
export const changePassword = async (passwordData: ChangePasswordData) => {
    const { data } = await api.put('/settings/change-password', passwordData);
    return data;
};

export default {
    getSettings,
    updateSettings,
    updateUserProfile,
    changePassword,
};
