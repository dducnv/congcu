import { NextApiRequest } from "next/types";

export async function POST(request: NextApiRequest) {
  const body = await request.body;
  return removeBg(request, body);
}

export async function removeBg(request: NextApiRequest, body: any) {
  try {
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

    var responseBlob = await response.blob();
    return new Response(responseBlob, {
      status: 200,
    });
  } catch (e) {
    return new Response("Hệ thống gián đoạn!", { status: 500 });
  }
}
