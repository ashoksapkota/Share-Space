/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["mongoose"],
  },
  //Disabling Browser Source Maps
  productionBrowserSourceMaps: false,
  //Removing the concole.logs in production
  compiler: {
    removeConsole: true,
  },
  images: {
    // Specifies allowed remote image sources for the Next.js Image component
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
      {
        protocol: "https",
        hostname: "uploadthing.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "utfs.io",  // Allowed image source for utfs.io
      },
    ],
  },
};

// Content Security Policy (CSP) header configuration
const cspHeader = `
    default-src 'self';  // Restricts all content to the origin (self)
    script-src 'self' 'unsafe-eval' 'unsafe-inline';  // Allows scripts from self, inline scripts, and eval
    style-src 'self' 'unsafe-inline';  // Allows styles from self and inline styles
    img-src 'self' blob: data:;  // Allows images from self, blob URIs, and data URIs
    font-src 'self';  // Allows fonts only from self
    object-src 'none';  // Disallows embedding objects like Flash
    base-uri 'self';  // Restricts the document base URL to self
    form-action 'self';  // Restricts form submissions to self
    frame-ancestors 'none';  // Disallows the page from being framed
    upgrade-insecure-requests;  // Automatically upgrades HTTP requests to HTTPS
`;

module.exports = {
  async headers() {
    return [
      {
        // Applies the CSP header to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            // Removes newline characters to ensure the CSP header is correctly formatted
            value: cspHeader.replace(/\n/g, ''),
          },
        ],
      },
    ];
  },
  // Spread the existing nextConfig to include all other settings
  ...nextConfig,
};


module.exports = nextConfig;
