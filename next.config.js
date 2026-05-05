
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Remove any experimental features that might cause issues
  experimental: {
    // Keep this empty or remove if not needed
  },
  // Ensure webpack handles node: protocol correctly
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;