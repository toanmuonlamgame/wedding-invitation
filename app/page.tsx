import type { Metadata } from "next";
import { WeddingInvitation } from "@/src/components/WeddingInvitation";
import { getPublicWishes } from "@/src/lib/engagement";
import { getWeddingContent } from "@/src/lib/wedding-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Thiệp cưới Vũ Bình & Thành Long",
  description: "Thiệp cưới trực tuyến cá nhân hóa",
  openGraph: {
    title: "Thiệp cưới Vũ Bình & Thành Long",
    description: "Trân trọng kính mời bạn chung vui cùng hai gia đình.",
    type: "website",
    siteName: "Vũ Bình & Thành Long",
  },
};

export default async function Home() {
  const [content, wishes] = await Promise.all([
    getWeddingContent(),
    getPublicWishes(),
  ]);
  return (
    <WeddingInvitation content={content} wishes={wishes} showCreator />
  );
}
