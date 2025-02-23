import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/Layout';
import ProductGrid from '../../components/ProductGrid';
import { Product } from '../../types';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface ProductsPageProps {
  products: Product[];
  totalProducts: number;
  currentPage: number;
  totalPages: number;
}

const ProductsPage: React.FC<ProductsPageProps> = ({
  products,
  totalProducts,
  currentPage,
  totalPages,
}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 1000,
  });

  const categories = ['All', 'Scented', 'Unscented', 'Decorative', 'Seasonal'];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push({
      pathname: '/products',
      query: { ...router.query, keyword: searchTerm },
    });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    router.push({
      pathname: '/products',
      query: {
        ...router.query,
        category: category === 'All' ? undefined : category.toLowerCase(),
      },
    });
  };

  const handlePriceChange = () => {
    router.push({
      pathname: '/products',
      query: {
        ...router.query,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
      },
    });
  };

  return (
    <Layout title="Shop | Moh-Scent">
      <div className="container-custom py-8">
        {/* Search and Filter Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-bold mb-4 md:mb-0">
            Our Products
          </h1>
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <form onSubmit={handleSearch} className="flex-1 md:w-64">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </form>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <FunnelIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <motion.div
          initial={false}
          animate={{ height: showFilters ? 'auto' : 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden mb-8"
        >
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Categories */}
              <div>
                <h3 className="font-semibold mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedCategory === category
                          ? 'bg-primary-600 text-white'
                          : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold mb-2">Price Range</h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, min: Number(e.target.value) })
                    }
                    className="w-24 px-2 py-1 rounded-md border border-gray-300"
                    placeholder="Min"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, max: Number(e.target.value) })
                    }
                    className="w-24 px-2 py-1 rounded-md border border-gray-300"
                    placeholder="Max"
                  />
                  <button
                    onClick={handlePriceChange}
                    className="btn btn-primary"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Product Grid */}
        <ProductGrid products={products} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() =>
                  router.push({
                    pathname: '/products',
                    query: { ...router.query, page },
                  })
                }
                className={`px-4 py-2 rounded-md ${
                  currentPage === page
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const {
    keyword = '',
    category = '',
    minPrice,
    maxPrice,
    page = 1,
  } = query;

  const queryParams = new URLSearchParams({
    ...(keyword && { keyword: String(keyword) }),
    ...(category && { category: String(category) }),
    ...(minPrice && { minPrice: String(minPrice) }),
    ...(maxPrice && { maxPrice: String(maxPrice) }),
    page: String(page),
  });

  const { data } = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`
  );

  return {
    props: {
      products: data.data,
      totalProducts: data.total,
      currentPage: data.page,
      totalPages: data.pages,
    },
  };
};

export default ProductsPage;
