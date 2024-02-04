/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        PUBLIC_KEY: process.env.PUBLIC_KEY,
        PRIVATE_KEY: process.env.PRIVATE_KEY,
    }
};

export default nextConfig;
