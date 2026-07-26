import { getPublicWishes } from "@/src/lib/engagement";

export async function GET() {
  return Response.json(await getPublicWishes());
}
