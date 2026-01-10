import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Wifi, Zap, Activity, PenTool, Layers, ChevronRight } from 'lucide-react';

const categories = [
    { id: 1, name: 'Vi điều khiển', icon: <Cpu />, count: '120 sản phẩm', slug: '/shop?category=vi-dieu-khien' },
    { id: 2, name: 'Cảm biến', icon: <Activity />, count: '85 sản phẩm', slug: '/shop?category=cam-bien' },
    { id: 3, name: 'Module IoT', icon: <Wifi />, count: '45 sản phẩm', slug: '/shop?category=module-truyen-thong' },
    { id: 4, name: 'Động cơ', icon: <Zap />, count: '60 sản phẩm', slug: '/shop?category=dong-co' },
    { id: 5, name: 'Linh kiện điện tử', icon: <PenTool />, count: '150 sản phẩm', slug: '/shop?category=linh-kien-dien-tu' },
    { id: 6, name: 'Linh kiện khác', icon: <Layers />, count: '200+ sản phẩm', slug: '/shop?category=khac' },
];

const CategorySection = () => {
    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Danh mục nổi bật</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Khám phá các linh kiện điện tử phổ biến nhất để bắt đầu dự án sáng tạo của bạn
                    </p>
                </div>

                {/* Grid Section */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            to={cat.slug}
                            className="group block bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1"
                        >
                            {/* Icon Wrapper */}
                            <div className="w-14 h-14 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                {React.cloneElement(cat.icon as React.ReactElement, { size: 28 })}
                            </div>

                            {/* Content */}
                            <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                                {cat.name}
                            </h3>
                            <span className="text-xs text-gray-400 block mb-3">{cat.count}</span>

                            {/* Small Arrow indicator */}
                            <div className="inline-flex items-center text-xs font-medium text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                                Xem ngay <ChevronRight size={14} className="ml-1" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategorySection;
