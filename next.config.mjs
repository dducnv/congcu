/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        PUBLIC_KEY: process.env.PUBLIC_KEY,
        PRIVATE_KEY: process.env.PRIVATE_KEY,
    },

    async headers() {
        return [
          {
            // Assuming your images are served from a specific domain (replace with your domain)
            source: "https://multitools4u.vercel.app/:path*", 
            headers: [
              {
                key: "Access-Control-Allow-Origin",
                value: "*",
              },
            ],
          },
        ];
      },
};

export default nextConfig;
