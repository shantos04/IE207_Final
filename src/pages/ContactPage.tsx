import React, { useState } from 'react';
import { MapPin, Phone, Mail, Send, Clock, CheckCircle } from 'lucide-react';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitSuccess(true);
            setFormData({ name: '', email: '', phone: '', message: '' });

            // Reset success message after 3 seconds
            setTimeout(() => setSubmitSuccess(false), 3000);
        }, 1500);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Liên hệ với chúng tôi</h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Đội ngũ hỗ trợ của ShopHub luôn sẵn sàng giải đáp mọi thắc mắc kỹ thuật và tư vấn sản phẩm
                    </p>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">

                    {/* Left Column - Contact Info */}
                    <div className="p-8 md:p-10 bg-gradient-to-br from-blue-600 to-blue-700 text-white flex flex-col justify-between">
                        <div>
                            <h2 className="text-3xl font-bold mb-4">Thông tin liên hệ</h2>
                            <p className="text-blue-100 mb-8 leading-relaxed">
                                Bạn có câu hỏi về sản phẩm hoặc cần hỗ trợ kỹ thuật? Đừng ngần ngại liên hệ với đội ngũ kỹ sư giàu kinh nghiệm của chúng tôi.
                            </p>

                            <div className="space-y-6">
                                <ContactItem
                                    icon={<Phone className="w-6 h-6" />}
                                    title="Hotline"
                                    content="0123 456 789"
                                    subtitle="Hỗ trợ 24/7"
                                />
                                <ContactItem
                                    icon={<Mail className="w-6 h-6" />}
                                    title="Email"
                                    content="support@shophub.com"
                                    subtitle="Phản hồi trong 24h"
                                />
                                <ContactItem
                                    icon={<MapPin className="w-6 h-6" />}
                                    title="Địa chỉ"
                                    content="123 Nguyễn Văn Linh, Q7, TP.HCM"
                                    subtitle="Mở cửa: 8:00 - 21:00"
                                />
                                <ContactItem
                                    icon={<Clock className="w-6 h-6" />}
                                    title="Giờ làm việc"
                                    content="Thứ 2 - Chủ Nhật"
                                    subtitle="8:00 - 21:00 (Không nghỉ lễ)"
                                />
                            </div>
                        </div>

                        {/* Google Map Embed */}
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold mb-3">Vị trí của chúng tôi</h3>
                            <div className="rounded-xl overflow-hidden border-2 border-blue-500/30 h-56 bg-blue-700/30">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.954164089854!2d106.69977761533423!3d10.733778162765906!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752fbc01e1b5ed%3A0xc83bb77d6e4c9e8!2zMTIzIE5ndXnhu4VuIFbEg24gTGluaCwgVMSDbiBQaMO6LCBRdeG6rW4gNywgVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5oLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1234567890123!5m2!1svi!2s"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="ShopHub Location Map"
                                ></iframe>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Contact Form */}
                    <div className="p-8 md:p-10">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Gửi tin nhắn cho chúng tôi</h2>
                        <p className="text-gray-600 mb-6">
                            Điền thông tin bên dưới và chúng tôi sẽ phản hồi sớm nhất có thể
                        </p>

                        {/* Success Message */}
                        {submitSuccess && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-fade-in">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="text-green-800 font-medium">Tin nhắn đã được gửi thành công!</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Họ và tên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Nguyễn Văn A"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="example@email.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                    Số điện thoại <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    pattern="[0-9]{10}"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="0912345678"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nội dung <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={5}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                    placeholder="Bạn cần hỗ trợ gì? Mô tả chi tiết sẽ giúp chúng tôi phản hồi nhanh hơn..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Đang gửi...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        <span>Gửi tin nhắn</span>
                                    </>
                                )}
                            </button>

                            <p className="text-sm text-gray-500 text-center">
                                Bằng việc gửi tin nhắn, bạn đồng ý với{' '}
                                <a href="#" className="text-blue-600 hover:underline">Chính sách bảo mật</a> của chúng tôi
                            </p>
                        </form>
                    </div>
                </div>

                {/* Additional Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    <InfoCard
                        title="Phản hồi nhanh"
                        description="Đội ngũ hỗ trợ phản hồi trong vòng 24 giờ làm việc"
                        icon="⚡"
                    />
                    <InfoCard
                        title="Tư vấn miễn phí"
                        description="Tư vấn kỹ thuật và chọn linh kiện phù hợp dự án"
                        icon="💡"
                    />
                    <InfoCard
                        title="Hỗ trợ sau bán"
                        description="Bảo hành, đổi trả và hỗ trợ kỹ thuật trọn đời"
                        icon="🛡️"
                    />
                </div>
            </div>
        </div>
    );
};

// Contact Item Component
const ContactItem = ({
    icon,
    title,
    content,
    subtitle
}: {
    icon: React.ReactNode;
    title: string;
    content: string;
    subtitle?: string;
}) => (
    <div className="flex items-start gap-4">
        <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg flex-shrink-0">
            {icon}
        </div>
        <div>
            <h3 className="font-semibold text-white mb-1">{title}</h3>
            <p className="text-blue-100">{content}</p>
            {subtitle && <p className="text-blue-200 text-sm mt-1">{subtitle}</p>}
        </div>
    </div>
);

// Info Card Component
const InfoCard = ({
    title,
    description,
    icon
}: {
    title: string;
    description: string;
    icon: string;
}) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
    </div>
);

export default ContactPage;
