/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        PUBLIC_KEY: process.env.PUBLIC_KEY,
        PRIVATE_KEY: process.env.PRIVATE_KEY,
        KEY_ENCRYPTION_RM_BG: process.env.KEY_ENCRYPTION_RM_BG,
        RM_BG_API_KEY:process.env.RM_BG_API_KEY,
        REDIS_URL: process.env.REDIS_URL,
        REDIS_SECRET: process.env.REDIS_SECRET,
        NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    }
};

export default nextConfig;
