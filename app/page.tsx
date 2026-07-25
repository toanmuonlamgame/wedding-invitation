import type { Metadata } from "next";
import { WeddingInvitation } from "@/src/components/WeddingInvitation";

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

export default function Home() {
  return <WeddingInvitation showCreator />;
}
