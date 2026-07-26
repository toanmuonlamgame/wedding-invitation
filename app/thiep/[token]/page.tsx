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
  const [invitation, content, wishes] = await Promise.all([
    getInvitationByToken(token),
    getWeddingContent(),
    getPublicWishes(),
  ]);

  if (!invitation) {
    notFound();
  }

  return (
    <WeddingInvitation
      content={content}
      invitation={invitation}
      invitationToken={token}
      wishes={wishes}
    />
  );
}
