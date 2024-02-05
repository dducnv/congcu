/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        PUBLIC_KEY: process.env.PUBLIC_KEY,
        PRIVATE_KEY: process.env.PRIVATE_KEY,
        KEY_ENCRYPTION_RM_BG: process.env.KEY_ENCRYPTION_RM_BG,
        RM_BG_API_KEY:process.env.RM_BG_API_KEY
    }
};

export default nextConfig;
