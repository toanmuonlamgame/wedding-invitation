import { Ornament } from "@/src/components/Ornament";
import type { InvitationPersonalization } from "@/src/types/invitation";
import type { InvitationContentSettings } from "@/src/types/wedding";
import { getInvitationMessages, type InvitationLanguage } from "@/src/lib/invitation-i18n";

type InvitationCopyProps = {
  invitation?: InvitationPersonalization;
  settings: InvitationContentSettings;
  preview?: boolean;
  language?: InvitationLanguage;
};

export function InvitationCopy({
  invitation,
  settings,
  preview = false,
  language = "vi",
}: InvitationCopyProps) {
  const messages = getInvitationMessages(language);
  const localized = language === "ko";
  return (
    <div className={preview ? "invitation-admin-preview" : "invitation-copy"}>
      <p className="section-eyebrow" data-invitation-reveal={!preview || undefined}>
        {localized ? messages.invitation.eyebrow : settings.eyebrow}
      </p>
      <h2
        className={`invitation-lead${invitation ? " invitation-recipient" : ""}`}
        id={preview ? undefined : "invitation-title"}
        data-invitation-reveal={!preview || undefined}
      >
        {invitation
          ? invitation.recipientText
          : localized
            ? messages.invitation.title
            : settings.title}
      </h2>
      {!preview ? (
        <div data-ornament-reveal>
          <Ornament />
        </div>
      ) : null}
      <p className="invitation-body" data-invitation-reveal={!preview || undefined}>
        {localized ? messages.invitation.body : settings.body}
      </p>
      {(localized
        ? messages.invitation.supportingText
        : settings.supportingText) ? (
        <p
          className="invitation-supporting-text"
          data-invitation-reveal={!preview || undefined}
        >
          {localized
            ? messages.invitation.supportingText
            : settings.supportingText}
        </p>
      ) : null}

      {!preview && invitation?.guestCount ? (
        <p className="guest-count" data-invitation-reveal>
          {messages.invitation.guestCount(invitation.guestCount)}
        </p>
      ) : null}

      {!preview && invitation?.privateMessage ? (
        <blockquote className="private-message" data-invitation-reveal>
          <span>{messages.invitation.privateMessage}</span>
          <p>{invitation.privateMessage}</p>
        </blockquote>
      ) : null}

      <div
        className="families"
        data-invitation-reveal={!preview || undefined}
      >
        <div className="family">
          <span>{messages.invitation.brideSide}</span>
          <strong>{settings.brideFamily}</strong>
        </div>
        <div className="family-separator" aria-hidden="true">
          &amp;
        </div>
        <div className="family">
          <span>{messages.invitation.groomSide}</span>
          <strong>{settings.groomFamily}</strong>
        </div>
      </div>
    </div>
  );
}

type InvitationSectionProps = {
  invitation?: InvitationPersonalization;
  settings: InvitationContentSettings;
  language?: InvitationLanguage;
};

export function InvitationSection({
  invitation,
  settings,
  language = "vi",
}: InvitationSectionProps) {
  return (
    <section
      className="section invitation-section"
      aria-labelledby="invitation-title"
      data-public-section="invitation"
    >
      <div className="section-shell">
        <InvitationCopy invitation={invitation} settings={settings} language={language} />
      </div>
    </section>
  );
}
