/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://staging-task-manage-umzi.encr.app/api/:path*",
      },
    ];
  },
};

export default nextConfig;
