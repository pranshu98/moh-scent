import { NextPage } from 'next';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import Link from 'next/link';

const Home: NextPage = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Layout>
      <div className="relative overflow-hidden">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="container-custom text-center"
          >
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-primary-600 mb-6">
              Transform Your Space
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Discover our collection of handcrafted luxury candles that bring warmth and tranquility to your sanctuary.
            </p>
            <Link 
              href="/products"
              className="btn btn-primary text-lg px-8 py-3"
            >
              Shop Now
            </Link>
          </motion.div>
        </section>

        {/* Featured Categories */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container-custom">
            <h2 className="text-3xl font-serif font-bold text-center mb-12">
              Our Collections
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {['Scented', 'Unscented', 'Decorative', 'Seasonal'].map((category, index) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="card card-hover p-6 text-center"
                >
                  <h3 className="text-xl font-semibold mb-4">{category}</h3>
                  <Link 
                    href={`/products?category=${category.toLowerCase()}`}
                    className="text-primary-600 hover:text-primary-700 dark:hover:text-primary-400"
                  >
                    View Collection →
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Handcrafted Quality',
                  description: 'Each candle is carefully crafted with premium materials and attention to detail.'
                },
                {
                  title: 'Sustainable Materials',
                  description: 'We use eco-friendly materials and packaging to minimize environmental impact.'
                },
                {
                  title: 'Unique Fragrances',
                  description: 'Experience our exclusive collection of carefully curated scents.'
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="text-center p-6"
                >
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-primary-50 dark:bg-gray-800">
          <div className="container-custom text-center">
            <h2 className="text-3xl font-serif font-bold mb-6">
              Ready to Experience Luxury?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Join our community of candle enthusiasts and transform your space with our premium collections.
            </p>
            <Link 
              href="/products"
              className="btn btn-primary text-lg px-8 py-3"
            >
              Explore Now
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
