import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: {},
    allowedDevOrigins: [
      "https://9003-firebase-studio-1748078017138.cluster-axf5tvtfjjfekvhwxwkkkzsk2y.cloudworkstations.dev"
    ],
  },
};

export default nextConfig;
