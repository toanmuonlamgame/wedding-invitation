import { Ornament } from "@/src/components/Ornament";
import { wedding } from "@/src/lib/wedding-details";
import { getInvitationMessages, type InvitationLanguage } from "@/src/lib/invitation-i18n";

export function FooterSection({ language = "vi" }: { language?: InvitationLanguage }) {
  const messages = getInvitationMessages(language);
  return (
    <footer className="footer-section">
      <div className="section-shell" data-reveal>
        <div className="footer-mark" aria-hidden="true">
          ♡
        </div>
        <h2 className="footer-title">{messages.footer.title}</h2>
        <Ornament />
        <p className="footer-copy">
          {messages.footer.body}
        </p>
        <p className="footer-signature">
          {wedding.bride} &amp; {wedding.groom}
        </p>
      </div>
    </footer>
  );
}
