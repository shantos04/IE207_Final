import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productService } from '../services/productService';
import { ShoppingBag, Search, Filter } from 'lucide-react';

export default function ShopPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [sortBy, setSortBy] = useState('name');
    const [categoryFilter, setCategoryFilter] = useState('all');

    useEffect(() => {
        fetchProducts();
    }, [searchParams]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const search = searchParams.get('search') || '';
            const response = await productService.getProducts({ limit: 100 });
            let filtered = response.data;

            // Search filter
            if (search) {
                filtered = filtered.filter((p: any) =>
                    p.name.toLowerCase().includes(search.toLowerCase()) ||
                    p.description?.toLowerCase().includes(search.toLowerCase())
                );
            }

            // Category filter
            if (categoryFilter !== 'all') {
                filtered = filtered.filter((p: any) => p.category === categoryFilter);
            }

            // Sort
            filtered.sort((a: any, b: any) => {
                if (sortBy === 'price-asc') return a.price - b.price;
                if (sortBy === 'price-desc') return b.price - a.price;
                if (sortBy === 'name') return a.name.localeCompare(b.name);
                return 0;
            });

            setProducts(filtered);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery) {
            setSearchParams({ search: searchQuery });
        } else {
            setSearchParams({});
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [sortBy, categoryFilter]);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Sản phẩm</h1>
                <p className="text-gray-600">Khám phá tất cả sản phẩm của chúng tôi</p>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <form onSubmit={handleSearch} className="mb-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm sản phẩm..."
                                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Tìm kiếm
                        </button>
                    </div>
                </form>

                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center space-x-2">
                        <Filter className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-700">Lọc:</span>
                    </div>

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Tất cả danh mục</option>
                        <option value="electronics">Điện tử</option>
                        <option value="clothing">Thời trang</option>
                        <option value="food">Thực phẩm</option>
                        <option value="books">Sách</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="name">Sắp xếp theo tên</option>
                        <option value="price-asc">Giá: Thấp đến cao</option>
                        <option value="price-desc">Giá: Cao đến thấp</option>
                    </select>
                </div>
            </div>

            {/* Results Count */}
            <div className="mb-4">
                <p className="text-gray-600">
                    Hiển thị <span className="font-medium">{products.length}</span> sản phẩm
                </p>
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                            <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-16">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                        Không tìm thấy sản phẩm
                    </h3>
                    <p className="text-gray-600">
                        Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            to={`/product/${product.id}`}
                            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition group"
                        >
                            <div className="relative h-48 bg-gray-200 overflow-hidden">
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                                        <ShoppingBag className="w-16 h-16 text-blue-300" />
                                    </div>
                                )}
                                {product.stock === 0 && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                        <span className="text-white font-bold text-lg">Hết hàng</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                                    {product.name}
                                </h3>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                    {product.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xl font-bold text-blue-600">
                                        {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                        }).format(product.price)}
                                    </span>
                                    {product.stock > 0 && (
                                        <span className="text-sm text-gray-500">
                                            Còn {product.stock}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
