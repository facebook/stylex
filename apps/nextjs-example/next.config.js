/** @type {import('next').NextConfig} */
const stylexPlugin = require('@stylexjs/nextjs-plugin');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack(config, options) {
    config.output.hashFunction = 'sha256';
    return config;
  },
};

module.exports = stylexPlugin({})(nextConfig);
