import { encryptData } from "@/core/utils";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {

  const redis = new Redis({
    url: process.env.REDIS_URL as string,
    token: process.env.REDIS_SECRET as string,
  });



  const rateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "3h"),
  });


  const { url } = request;
  const { pathname } = new URL(url);
  const path = pathname.split("/").filter((i) => i);
  const body = await request.json();
  let ip = request.ip ?? request.headers.get('x-real-ip') ?? request.headers.get('x-client-ip') ?? "127.0.0.1";
  if (path[1] === "remove-bg") {
    try {
      const { success } = await rateLimiter.limit(ip);

      if (!success) {
        return new Response(
          JSON.stringify({ message: "Bạn đã hết lượt sử dụng, hãy chờ 3h" })
        , { status: 429 });
      }
      const { file } = body;
      const url = `https://api.remove.bg/v1.0/removebg`;
      const headers = {
        "X-Api-Key": process.env.RM_BG_API_KEY as string,
      };
      const formData = new FormData();
      formData.append("image_file_b64", file);

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });

      const blob = await response.blob();
      return new Response(blob, {
        status: 200,
      });
    } catch (e) {
      return new Response("Hệ thống gián đoạn!", { status: 500 });
    }
  }
  return new Response("Not found", { status: 404 });
}
