import { GetServerSideProps } from 'next';
import Layout from '../../components/layout/Layout';
import ProductCard from '../../components/ProductCard';
import { Product } from '../../types';
import axios from 'axios';

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  return (
    <Layout>
      <div className="container-custom py-16">
        <h1 className="text-4xl font-bold text-center text-primary-600 mb-6">
          {product.name}
        </h1>
        <div className="flex flex-col md:flex-row items-center">
          <img src={product.images[0]} alt={product.name} className="w-full md:w-1/2 h-64 object-cover rounded-md" />
          <div className="md:ml-8 mt-4 md:mt-0">
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              {product.description}
            </p>
            <p className="text-xl font-semibold text-primary-600 mb-4">
              ${product.price.toFixed(2)}
            </p>
            <button className="btn btn-primary">Add to Cart</button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`);

  return {
    props: {
      product: data.data,
    },
  };
};

export default ProductDetails;
