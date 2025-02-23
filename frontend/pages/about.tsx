import { NextPage } from 'next';
import { motion } from 'framer-motion';

const AboutPage: NextPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">About Moh-Scent</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg mb-6">
          Welcome to Moh-Scent, where luxury meets craftsmanship in the art of candle making. 
          Our passion lies in creating exquisite, handcrafted candles that transform your space 
          into a sanctuary of warmth and tranquility.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Story</h2>
        <p className="mb-6">
          Founded with a vision to bring artisanal luxury to every home, Moh-Scent has grown 
          from a small workshop to a beloved brand known for its quality and attention to detail. 
          Each candle is carefully crafted using the finest ingredients and traditional techniques, 
          ensuring a superior product that delights the senses.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Commitment</h2>
        <p className="mb-6">
          We are committed to sustainability and ethical practices. Our candles are made using 
          natural waxes, lead-free cotton wicks, and premium essential oils. We believe in 
          creating products that are not only beautiful but also environmentally conscious.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Quality & Craftsmanship</h2>
        <p className="mb-6">
          Every Moh-Scent candle is a testament to our dedication to quality. Our artisans 
          pour their expertise and passion into each creation, ensuring that every product 
          meets our exacting standards. From the selection of scents to the final packaging, 
          we pay attention to every detail.
        </p>
      </div>
    </motion.div>
  );
};

export default AboutPage;
