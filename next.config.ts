import type { NextConfig } from "next";

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseRemotePatterns: NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
> = [];

if (supabaseUrl) {
  try {
    const parsed = new URL(supabaseUrl);
    if (parsed.protocol === "https:") {
      supabaseRemotePatterns.push({
        protocol: "https",
        hostname: parsed.hostname,
        port: parsed.port,
        pathname: "/storage/v1/object/public/**",
      });
    }
  } catch {
    // Runtime validation reports an actionable storage configuration error.
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseRemotePatterns,
  },
};

export default nextConfig;
