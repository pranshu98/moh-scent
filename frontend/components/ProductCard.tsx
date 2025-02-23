import { Product } from '../types';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="card card-hover p-4">
      <Link href={`/products/${product._id}`}>
        <img src={product.images[0]} alt={product.name} className="w-full h-48 object-cover rounded-md" />
        <h3 className="mt-2 text-lg font-semibold">{product.name}</h3>
        <p className="text-gray-600 dark:text-gray-400">${product.price.toFixed(2)}</p>
      </Link>
    </div>
  );
};

export default ProductCard;
