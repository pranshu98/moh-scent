import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCartIcon,
  UserIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon as MenuIcon,
  XMarkIcon as XIcon,
} from '@heroicons/react/24/outline';

const Header = () => {
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // After mounting, we have access to the theme
  useEffect(() => setMounted(true), []);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/products' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm">
      <nav className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-serif font-bold text-primary-600">
              Moh-Scent
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`nav-link ${
                  router.pathname === item.href ? 'nav-link-active' : 'text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Theme Toggle */}
            <button
              aria-label="Toggle Dark Mode"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {mounted && (
                theme === 'dark' ? (
                  <SunIcon className="h-5 w-5 text-gray-300" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-gray-700" />
                )
              )}
            </button>

            {/* Cart */}
            <Link href="/cart" className="p-2 hover:text-primary-600">
              <ShoppingCartIcon className="h-6 w-6" />
            </Link>

            {/* User Profile */}
            <Link href="/profile" className="p-2 hover:text-primary-600">
              <UserIcon className="h-6 w-6" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              className="p-2 rounded-md text-gray-700 hover:text-primary-600 dark:text-gray-300"
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <XIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      router.pathname === item.href
                        ? 'nav-link-active'
                        : 'text-gray-700 hover:text-primary-600 dark:text-gray-300'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="flex items-center space-x-4 px-3 py-2">
                  <Link href="/cart" className="hover:text-primary-600">
                    <ShoppingCartIcon className="h-6 w-6" />
                  </Link>
                  <Link href="/profile" className="hover:text-primary-600">
                    <UserIcon className="h-6 w-6" />
                  </Link>
                  <button
                    aria-label="Toggle Dark Mode"
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  >
                    {mounted && (
                      theme === 'dark' ? (
                        <SunIcon className="h-5 w-5 text-gray-300" />
                      ) : (
                        <MoonIcon className="h-5 w-5 text-gray-700" />
                      )
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Header;
