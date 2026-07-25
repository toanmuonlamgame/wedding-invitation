import type { Metadata } from "next";
import { WeddingAdmin } from "@/src/components/WeddingAdmin";
import { getWeddingContent } from "@/src/lib/wedding-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quản trị thiệp cưới",
  description: "Khu vực quản trị nội dung thiệp cưới gia đình",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const content = await getWeddingContent();

  return <WeddingAdmin initialContent={content} standalone />;
}
