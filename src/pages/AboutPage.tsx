import React from 'react';
import { Award, Users, Box, Heart, Shield, Headphones, BookOpen, CheckCircle } from 'lucide-react';

const AboutPage = () => {
    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        ShopHub - Đối tác tin cậy của cộng đồng Maker Việt Nam
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                        Cung cấp linh kiện điện tử, IoT và giải pháp công nghệ chất lượng cao
                    </p>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                        <StatItem
                            icon={<Award className="w-6 h-6" />}
                            number="5+"
                            label="Năm kinh nghiệm"
                        />
                        <StatItem
                            icon={<Users className="w-6 h-6" />}
                            number="10.000+"
                            label="Khách hàng tin dùng"
                        />
                        <StatItem
                            icon={<Box className="w-6 h-6" />}
                            number="2.000+"
                            label="Sản phẩm đa dạng"
                        />
                        <StatItem
                            icon={<Heart className="w-6 h-6" />}
                            number="99%"
                            label="Đánh giá hài lòng"
                        />
                    </div>
                </div>
            </section>

            {/* Brand Story Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        {/* Image */}
                        <div className="order-2 md:order-1">
                            <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl p-8 h-full flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Box className="w-16 h-16 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800">ShopHub</h3>
                                    <p className="text-blue-600 font-semibold mt-2">Đồng hành cùng công nghệ</p>
                                </div>
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="order-1 md:order-2">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                                Câu chuyện của chúng tôi
                            </h2>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    ShopHub được thành lập từ <strong className="text-gray-800">niềm đam mê công nghệ</strong> và
                                    mong muốn tạo ra một cầu nối giúp sinh viên, kỹ sư và những người yêu công nghệ tại Việt Nam
                                    có thể dễ dàng tiếp cận các linh kiện điện tử chất lượng cao với giá cả hợp lý.
                                </p>
                                <p>
                                    Chúng tôi hiểu rằng <strong className="text-gray-800">sự sáng tạo</strong> không nên bị giới hạn
                                    bởi nguồn lực. Vì vậy, ShopHub cam kết mang đến không chỉ sản phẩm mà còn là
                                    <strong className="text-gray-800"> kiến thức, hỗ trợ kỹ thuật</strong> và một cộng đồng
                                    năng động để mọi ý tưởng đều có thể trở thành hiện thực.
                                </p>
                                <p>
                                    Từ những ngày đầu khởi nghiệp nhỏ bé, ShopHub đã phát triển thành một trong những
                                    <strong className="text-gray-800"> nền tảng uy tín hàng đầu</strong> trong lĩnh vực phân phối
                                    linh kiện điện tử và IoT, phục vụ hàng chục nghìn khách hàng trên toàn quốc.
                                </p>
                            </div>
                            <div className="mt-8 flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-semibold">Hàng chính hãng 100%</span>
                                </div>
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-semibold">Giao hàng toàn quốc</span>
                                </div>
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-semibold">Đổi trả dễ dàng</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                            Giá trị cốt lõi
                        </h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Những nguyên tắc định hình cách chúng tôi hoạt động và phục vụ khách hàng
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Value Card 1: Quality */}
                        <ValueCard
                            icon={<Shield className="w-8 h-8" />}
                            title="Chất lượng đảm bảo"
                            description="Cam kết 100% hàng chính hãng, có nguồn gốc xuất xứ rõ ràng. Mỗi sản phẩm đều được kiểm tra kỹ lưỡng trước khi giao đến tay khách hàng."
                            color="blue"
                        />

                        {/* Value Card 2: Support */}
                        <ValueCard
                            icon={<Headphones className="w-8 h-8" />}
                            title="Hỗ trợ tận tâm"
                            description="Đội ngũ kỹ thuật viên giàu kinh nghiệm sẵn sàng tư vấn 24/7. Chúng tôi không chỉ bán hàng mà còn đồng hành cùng dự án của bạn."
                            color="green"
                        />

                        {/* Value Card 3: Community */}
                        <ValueCard
                            icon={<BookOpen className="w-8 h-8" />}
                            title="Cộng đồng & Tri thức"
                            description="Xây dựng cộng đồng maker mạnh mẽ thông qua việc chia sẻ kiến thức, mã nguồn mở và các workshop định kỳ miễn phí."
                            color="purple"
                        />
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                        Sẵn sàng bắt đầu dự án của bạn?
                    </h2>
                    <p className="text-gray-600 text-lg mb-8">
                        Hãy để ShopHub trở thành đối tác đáng tin cậy trong hành trình sáng tạo công nghệ của bạn
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/shop"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Khám phá sản phẩm
                        </a>
                        <a
                            href="/contact"
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Liên hệ tư vấn
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

// Stat Item Component
const StatItem = ({ icon, number, label }: { icon: React.ReactNode; number: string; label: string }) => (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            {icon}
        </div>
        <div className="text-3xl font-bold text-gray-800 mb-2">{number}</div>
        <div className="text-gray-600 text-sm">{label}</div>
    </div>
);

// Value Card Component
const ValueCard = ({
    icon,
    title,
    description,
    color
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: 'blue' | 'green' | 'purple';
}) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600'
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className={`w-16 h-16 ${colorClasses[color]} rounded-xl flex items-center justify-center mb-6`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
    );
};

export default AboutPage;
