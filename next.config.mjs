/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Add this block to fix the 404 error
  async rewrites() {
    return [
      {
        source: '/api/process-intent',
        destination: '/api/process-intent',
      },
    ];
  },
}

export default nextConfig;
