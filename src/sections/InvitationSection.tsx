import { Ornament } from "@/src/components/Ornament";
import { wedding } from "@/src/lib/wedding-details";
import type { InvitationPersonalization } from "@/src/types/invitation";
import type { InvitationContentSettings } from "@/src/types/wedding";

type InvitationCopyProps = {
  invitation?: InvitationPersonalization;
  settings: InvitationContentSettings;
  preview?: boolean;
};

export function InvitationCopy({
  invitation,
  settings,
  preview = false,
}: InvitationCopyProps) {
  return (
    <div className={preview ? "invitation-admin-preview" : "invitation-copy"}>
      <p className="section-eyebrow" data-invitation-reveal={!preview || undefined}>
        {settings.eyebrow}
      </p>
      <h2
        className={`invitation-lead${invitation ? " invitation-recipient" : ""}`}
        id={preview ? undefined : "invitation-title"}
        data-invitation-reveal={!preview || undefined}
      >
        {invitation ? invitation.recipientText : settings.title}
      </h2>
      {!preview ? (
        <div data-ornament-reveal>
          <Ornament />
        </div>
      ) : null}
      <p className="invitation-body" data-invitation-reveal={!preview || undefined}>
        {settings.body}
      </p>
      {settings.supportingText ? (
        <p
          className="invitation-supporting-text"
          data-invitation-reveal={!preview || undefined}
        >
          {settings.supportingText}
        </p>
      ) : null}

      {!preview && invitation?.guestCount ? (
        <p className="guest-count" data-invitation-reveal>
          Lời mời dành cho {invitation.guestCount} người
        </p>
      ) : null}

      {!preview && invitation?.privateMessage ? (
        <blockquote className="private-message" data-invitation-reveal>
          <span>Lời nhắn riêng</span>
          <p>{invitation.privateMessage}</p>
        </blockquote>
      ) : null}

      {!preview ? (
        <div className="families" data-invitation-reveal>
          <div className="family">
            <span>Nhà gái</span>
            <strong>{wedding.brideFamily}</strong>
          </div>
          <div className="family-separator" aria-hidden="true">
            &amp;
          </div>
          <div className="family">
            <span>Nhà trai</span>
            <strong>{wedding.groomFamily}</strong>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type InvitationSectionProps = {
  invitation?: InvitationPersonalization;
  settings: InvitationContentSettings;
};

export function InvitationSection({
  invitation,
  settings,
}: InvitationSectionProps) {
  return (
    <section
      className="section invitation-section"
      aria-labelledby="invitation-title"
      data-public-section="invitation"
    >
      <div className="section-shell">
        <InvitationCopy invitation={invitation} settings={settings} />
      </div>
    </section>
  );
}
