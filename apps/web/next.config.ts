import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configuração mínima para produção
  swcMinify: true,
  poweredByHeader: false,
  // Configurações experimentais para resolver problemas de build
  experimental: {
    esmExternals: "loose",
  },
  // Webpack config para resolver problemas de build
  webpack: (config, { isServer, webpack }) => {
    // Polyfill para __dirname em ambiente ESM
    config.plugins.push(
      new webpack.DefinePlugin({
        __dirname: JSON.stringify(process.cwd()),
      })
    );

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        os: false,
        stream: false,
        util: false,
      };
    }

    // Configuração específica para @react-pdf/renderer
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };

    return config;
  },
};

export default nextConfig;
