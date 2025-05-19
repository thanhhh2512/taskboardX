/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://prod-management-api-2zoi.encr.app/api/:path*",
      },
    ];
  },
};

export default nextConfig;
