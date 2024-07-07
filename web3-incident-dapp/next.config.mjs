/** @type {import('next').NextConfig} */
const nextConfig = {
    // ... other Next.js configurations
    async redirects() {
      return [
        {
          source: '/api/:path*',
          destination: '/api/:path*',
          permanent: false,
        },
      ];
    },
    async api({ req }) {
      req.headers.origin = req.headers.origin || req.headers.referer || 'http://localhost:3000'; // Adjust as needed
      return {
        res: {
          options: {
            maxAge: 3600,
            allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
            headers: ['X-Requested-With', 'Content-Type', 'Authorization'],
          },
        },
      };
    },
  };
  
  export default nextConfig;
  