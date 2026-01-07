import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productService } from '../services/productService';
import { ShoppingCart, Star, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';

interface Filters {
    categories: string[];
    minPrice: number;
    maxPrice: number;
    minRating: number;
}

export default function ShopPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<any[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 12;
    const { addToCart } = useCart();

    // Filter states
    const [filters, setFilters] = useState<Filters>({
        categories: [],
        minPrice: 0,
        maxPrice: 10000000,
        minRating: 0,
    });

    // Available categories based on HomePage categories
    const availableCategories = [
        { id: 'vi-dieu-khien', name: 'Vi điều khiển' },
        { id: 'cam-bien', name: 'Cảm biến' },
        { id: 'module-truyen-thong', name: 'Module truyền thông' },
        { id: 'linh-kien-dien-tu', name: 'Linh kiện điện tử' },
        { id: 'module-nguon', name: 'Module nguồn' },
        { id: 'bo-mach', name: 'Bo mạch phát triển' },
    ];

    // Fetch products on mount
    useEffect(() => {
        fetchProducts();
    }, []);

    // Apply filters and sorting when products or filters change
    useEffect(() => {
        applyFiltersAndSort();
    }, [products, filters, sortBy]);

    // Check URL params for category filter
    useEffect(() => {
        const category = searchParams.get('category');
        if (category && !filters.categories.includes(category)) {
            setFilters(prev => ({
                ...prev,
                categories: [category],
            }));
        }
    }, [searchParams]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await productService.getProducts({ limit: 100 });
            setProducts(response.data || []);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            toast.error('Không thể tải sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const applyFiltersAndSort = () => {
        let result = [...products];

        // Category filter
        if (filters.categories.length > 0) {
            result = result.filter(p =>
                filters.categories.some(cat =>
                    p.category?.toLowerCase().includes(cat.toLowerCase()) ||
                    p.name?.toLowerCase().includes(cat.toLowerCase())
                )
            );
        }

        // Price filter
        result = result.filter(p =>
            p.price >= filters.minPrice && p.price <= filters.maxPrice
        );

        // Rating filter (mock - using random rating for demo)
        if (filters.minRating > 0) {
            result = result.filter(() => Math.random() > 0.3); // 70% pass
        }

        // Sorting
        result.sort((a, b) => {
            switch (sortBy) {
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'newest':
                default:
                    return b.id - a.id; // Assume higher ID = newer
            }
        });

        setFilteredProducts(result);
        setCurrentPage(1); // Reset to first page when filters change
    };

    const handleCategoryToggle = (categoryId: string) => {
        setFilters(prev => ({
            ...prev,
            categories: prev.categories.includes(categoryId)
                ? prev.categories.filter(c => c !== categoryId)
                : [...prev.categories, categoryId],
        }));
    };

    const handlePriceChange = (type: 'min' | 'max', value: string) => {
        const numValue = parseInt(value) || 0;
        setFilters(prev => ({
            ...prev,
            [type === 'min' ? 'minPrice' : 'maxPrice']: numValue,
        }));
    };

    const handleAddToCart = (product: any) => {
        if (product.stock > 0) {
            addToCart({
                id: product._id,
                name: product.name,
                price: product.price,
                image: product.image_url,
            }, 1);
            toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
        } else {
            toast.error('Sản phẩm đã hết hàng');
        }
    };

    const clearFilters = () => {
        setFilters({
            categories: [],
            minPrice: 0,
            maxPrice: 10000000,
            minRating: 0,
        });
        setSearchParams({});
    };

    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, endIndex);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Cửa hàng</h1>
                <p className="text-gray-600">Khám phá các sản phẩm linh kiện điện tử chất lượng cao</p>
            </div>

            {/* Two Column Layout */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* LEFT SIDEBAR - FILTERS (25%) */}
                <aside className="lg:w-1/4">
                    <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900">Bộ lọc</h2>
                            <button
                                onClick={clearFilters}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>

                        {/* Category Filter */}
                        <div className="mb-6 pb-6 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-4">Danh mục</h3>
                            <div className="space-y-3">
                                {availableCategories.map(category => (
                                    <label
                                        key={category.id}
                                        className="flex items-center space-x-3 cursor-pointer group"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={filters.categories.includes(category.id)}
                                            onChange={() => handleCategoryToggle(category.id)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700 group-hover:text-blue-600 transition">
                                            {category.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range Filter */}
                        <div className="mb-6 pb-6 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-4">Khoảng giá</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-600 mb-1 block">Giá tối thiểu</label>
                                    <input
                                        type="number"
                                        value={filters.minPrice}
                                        onChange={(e) => handlePriceChange('min', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600 mb-1 block">Giá tối đa</label>
                                    <input
                                        type="number"
                                        value={filters.maxPrice}
                                        onChange={(e) => handlePriceChange('max', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="10,000,000"
                                        min="0"
                                    />
                                </div>
                                <div className="text-sm text-gray-600">
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                    }).format(filters.minPrice)} - {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                    }).format(filters.maxPrice)}
                                </div>
                            </div>
                        </div>

                        {/* Rating Filter */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">Đánh giá</h3>
                            <div className="space-y-3">
                                {[4, 3, 2, 1].map(rating => (
                                    <label
                                        key={rating}
                                        className="flex items-center space-x-2 cursor-pointer group"
                                    >
                                        <input
                                            type="radio"
                                            name="rating"
                                            checked={filters.minRating === rating}
                                            onChange={() => setFilters(prev => ({ ...prev, minRating: rating }))}
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < rating
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : 'text-gray-300'
                                                        }`}
                                                />
                                            ))}
                                            <span className="ml-2 text-sm text-gray-700 group-hover:text-blue-600 transition">
                                                {rating === 4 ? 'Từ 4 sao' : `Từ ${rating} sao`}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="rating"
                                        checked={filters.minRating === 0}
                                        onChange={() => setFilters(prev => ({ ...prev, minRating: 0 }))}
                                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Tất cả</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* RIGHT MAIN CONTENT (75%) */}
                <main className="lg:w-3/4">
                    {/* Toolbar */}
                    <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <p className="text-gray-600">
                            Hiển thị{' '}
                            <span className="font-semibold text-gray-900">
                                {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)}
                            </span>{' '}
                            trong{' '}
                            <span className="font-semibold text-gray-900">{filteredProducts.length}</span>{' '}
                            sản phẩm
                        </p>

                        <div className="flex items-center space-x-2">
                            <label className="text-sm text-gray-600">Sắp xếp:</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="newest">Mới nhất</option>
                                <option value="price-asc">Giá: Thấp đến cao</option>
                                <option value="price-desc">Giá: Cao đến thấp</option>
                                <option value="name">Tên A-Z</option>
                            </select>
                        </div>
                    </div>

                    {/* Product Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : currentProducts.length === 0 ? (
                        <div className="bg-white rounded-xl p-12 text-center">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Không tìm thấy sản phẩm
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Thử điều chỉnh bộ lọc của bạn
                            </p>
                            <button
                                onClick={clearFilters}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Xóa tất cả bộ lọc
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {currentProducts.map((product) => (
                                    <div
                                        key={product._id}
                                        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition group"
                                    >
                                        <Link to={`/product/${product._id}`} className="block">
                                            <div className="relative h-48 bg-gray-200 overflow-hidden">
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                                                        <Package className="w-16 h-16 text-blue-300" />
                                                    </div>
                                                )}
                                                {product.stock === 0 && (
                                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                        <span className="text-white font-bold">Hết hàng</span>
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                        <div className="p-4">
                                            <Link to={`/product/${product._id}`}>
                                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition min-h-[3rem]">
                                                    {product.name}
                                                </h3>
                                            </Link>

                                            {/* Rating */}
                                            <div className="flex items-center mb-3">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < 4
                                                            ? 'text-yellow-400 fill-yellow-400'
                                                            : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                                <span className="text-sm text-gray-500 ml-2">(4.0)</span>
                                            </div>

                                            {/* Price */}
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xl font-bold text-red-600">
                                                    {new Intl.NumberFormat('vi-VN', {
                                                        style: 'currency',
                                                        currency: 'VND',
                                                    }).format(product.price)}
                                                </span>
                                                {product.stock > 0 && (
                                                    <span className="text-xs text-green-600 font-medium">
                                                        Còn {product.stock}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Add to Cart Button */}
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                disabled={product.stock === 0}
                                                className={`w-full py-2 rounded-lg font-medium transition flex items-center justify-center space-x-2 ${product.stock > 0
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                <ShoppingCart className="w-4 h-4" />
                                                <span>{product.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-8 flex justify-center">
                                    <nav className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className={`p-2 rounded-lg border transition ${currentPage === 1
                                                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>

                                        {[...Array(totalPages)].map((_, i) => {
                                            const page = i + 1;
                                            // Show first, last, current, and adjacent pages
                                            if (
                                                page === 1 ||
                                                page === totalPages ||
                                                (page >= currentPage - 1 && page <= currentPage + 1)
                                            ) {
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`min-w-[40px] h-10 px-3 rounded-lg border transition ${currentPage === page
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            } else if (page === currentPage - 2 || page === currentPage + 2) {
                                                return (
                                                    <span key={page} className="px-2 text-gray-400">
                                                        ...
                                                    </span>
                                                );
                                            }
                                            return null;
                                        })}

                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className={`p-2 rounded-lg border transition ${currentPage === totalPages
                                                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </nav>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
