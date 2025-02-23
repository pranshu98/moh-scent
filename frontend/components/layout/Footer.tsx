import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaPinterest } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { name: 'All Products', href: '/products' },
      { name: 'New Arrivals', href: '/products?category=new' },
      { name: 'Best Sellers', href: '/products?category=best-sellers' },
      { name: 'Sale', href: '/products?category=sale' },
    ],
    about: [
      { name: 'Our Story', href: '/about' },
      { name: 'Sustainability', href: '/sustainability' },
      { name: 'Blog', href: '/blog' },
      { name: 'Press', href: '/press' },
    ],
    support: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'FAQs', href: '/faqs' },
      { name: 'Shipping', href: '/shipping' },
      { name: 'Returns', href: '/returns' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: FaFacebook, href: 'https://facebook.com/mohscent' },
    { name: 'Twitter', icon: FaTwitter, href: 'https://twitter.com/mohscent' },
    { name: 'Instagram', icon: FaInstagram, href: 'https://instagram.com/mohscent' },
    { name: 'Pinterest', icon: FaPinterest, href: 'https://pinterest.com/mohscent' },
  ];

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-serif font-bold text-primary-600">
                Moh-Scent
              </span>
            </Link>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Handcrafted luxury candles that transform your space into a sanctuary
              of warmth and tranquility.
            </p>
            <div className="mt-6 flex space-x-6">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                  >
                    <span className="sr-only">{item.name}</span>
                    <Icon className="h-6 w-6" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100">
              Shop
            </h3>
            <ul className="mt-4 space-y-4">
              {footerLinks.shop.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100">
              About
            </h3>
            <ul className="mt-4 space-y-4">
              {footerLinks.about.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100">
              Support
            </h3>
            <ul className="mt-4 space-y-4">
              {footerLinks.support.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 dark:text-gray-400">
              © {currentYear} Moh-Scent. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              {footerLinks.legal.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
