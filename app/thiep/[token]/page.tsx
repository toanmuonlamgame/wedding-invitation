import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WeddingInvitation } from "@/src/components/WeddingInvitation";
import { getInvitationByToken } from "@/src/lib/invitations";
import { getPublicWishes } from "@/src/lib/engagement";
import { wedding } from "@/src/lib/wedding-data";
import { getWeddingContent } from "@/src/lib/wedding-content";

export const dynamic = "force-dynamic";

type InvitationPageProps = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata({
  params,
}: InvitationPageProps): Promise<Metadata> {
  const { token } = await params;
  const invitation = await getInvitationByToken(token);

  if (!invitation) {
    notFound();
  }

  if (!invitation.isActive) {
    return {
      title: "Thiệp mời không còn khả dụng",
      description: "Liên kết thiệp mời này hiện đã được vô hiệu hóa.",
      robots: { index: false, follow: false },
    };
  }

  const title = `Thiệp mời dành cho ${invitation.recipientText} | ${wedding.coupleDisplay}`;

  return {
    title,
    description: `Trân trọng kính mời ${invitation.recipientText} chung vui cùng ${wedding.coupleDisplay}.`,
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title,
      description: `Thiệp cưới trực tuyến của ${wedding.coupleDisplay}.`,
      type: "website",
      siteName: wedding.coupleDisplay,
    },
  };
}

export default async function InvitationPage({
  params,
}: InvitationPageProps) {
  const { token } = await params;
  const invitation = await getInvitationByToken(token);

  if (!invitation) {
    notFound();
  }

  if (!invitation.isActive) {
    return (
      <main className="disabled-invitation">
        <section aria-labelledby="disabled-invitation-title">
          <p className="section-eyebrow">Vũ Bình &amp; Thành Long</p>
          <h1 id="disabled-invitation-title">
            Thiệp mời này hiện không còn khả dụng.
          </h1>
          <p>
            Có thể gia đình đã gửi một liên kết mới. Vui lòng liên hệ người gửi
            thiệp để được hỗ trợ.
          </p>
        </section>
      </main>
    );
  }

  const [content, wishes] = await Promise.all([
    getWeddingContent(),
    getPublicWishes(),
  ]);

  return (
    <WeddingInvitation
      content={content}
      invitation={invitation}
      invitationToken={token}
      wishes={wishes}
    />
  );
}
