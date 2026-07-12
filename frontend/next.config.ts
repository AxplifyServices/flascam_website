import type {
  NextConfig,
} from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname:
          '/flascam-public/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '9000',
        pathname:
          '/flascam-public/**',
      },
      {
        protocol: 'https',
        hostname:
          'flascam.axplitest.com',
        pathname:
          '/storage/flascam-public/**',
      },
    ],

    dangerouslyAllowLocalIP:
      true,
  },
};

export default nextConfig;