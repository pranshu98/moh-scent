/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'moh-scent-images.s3.amazonaws.com'], // Add your image domains here
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  },
  // Enable SWC minification
  swcMinify: true,
  // Configure webpack if needed
  webpack: (config, { isServer }) => {
    // Custom webpack config if needed
    return config;
  },
}
