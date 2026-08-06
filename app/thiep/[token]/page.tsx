import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WeddingInvitation } from "@/src/components/WeddingInvitation";
import { getInvitationByToken } from "@/src/lib/invitations";
import { getPublicWishes } from "@/src/lib/engagement";
import { wedding } from "@/src/lib/wedding-data";
import { getWeddingContent } from "@/src/lib/wedding-content";
import { getInvitationMessages } from "@/src/lib/invitation-i18n";

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
      title: invitation.language === "ko" ? "이용할 수 없는 청첩장" : "Thiệp mời không còn khả dụng",
      description: invitation.language === "ko" ? "이 청첩장 링크는 현재 비활성화되었습니다." : "Liên kết thiệp mời này hiện đã được vô hiệu hóa.",
      robots: { index: false, follow: false },
    };
  }

  const title = invitation.language === "ko"
    ? `${invitation.recipientText}님을 위한 청첩장 | ${wedding.coupleDisplay}`
    : `Thiệp mời dành cho ${invitation.recipientText} | ${wedding.coupleDisplay}`;

  return {
    title,
    description: invitation.language === "ko"
      ? `${invitation.recipientText}님을 ${wedding.coupleDisplay}의 결혼식에 정중히 초대합니다.`
      : `Trân trọng kính mời ${invitation.recipientText} chung vui cùng ${wedding.coupleDisplay}.`,
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title,
      description: invitation.language === "ko"
        ? `${wedding.coupleDisplay}의 온라인 청첩장입니다.`
        : `Thiệp cưới trực tuyến của ${wedding.coupleDisplay}.`,
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
    const messages = getInvitationMessages(invitation.language);
    return (
      <main className="disabled-invitation" lang={invitation.language}>
        <section aria-labelledby="disabled-invitation-title">
          <p className="section-eyebrow">Vũ Bình &amp; Thành Long</p>
          <h1 id="disabled-invitation-title">
            {messages.unavailable.title}
          </h1>
          <p>
            {messages.unavailable.body}
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
      language={invitation.language}
    />
  );
}
