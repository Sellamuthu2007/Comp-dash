/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@comp-dash/api',
    '@comp-dash/design-system',
    '@comp-dash/hooks',
    '@comp-dash/i18n',
    '@comp-dash/types',
    '@comp-dash/utils',
  ],
}

module.exports = nextConfig
