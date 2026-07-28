import { Ornament } from "@/src/components/Ornament";
import { wedding } from "@/src/lib/wedding-details";
import type { InvitationPersonalization } from "@/src/types/invitation";

type InvitationSectionProps = {
  invitation?: InvitationPersonalization;
};

export function InvitationSection({ invitation }: InvitationSectionProps) {
  return (
    <section
      className="section invitation-section"
      aria-labelledby="invitation-title"
    >
      <div className="section-shell invitation-copy">
        <p className="section-eyebrow" data-invitation-reveal>
          {invitation ? "Trân trọng kính mời" : "Lời mời thân tình"}
        </p>
        <h2
          className={`invitation-lead${invitation ? " invitation-recipient" : ""}`}
          id="invitation-title"
          data-invitation-reveal
        >
          {invitation ? (
            invitation.recipientText
          ) : (
            <>
              “Có những hành trình đẹp hơn khi được sẻ chia cùng những người
              mình thương.”
            </>
          )}
        </h2>
        <div data-ornament-reveal>
          <Ornament />
        </div>
        <p className="invitation-body" data-invitation-reveal>
          Hai gia đình trân trọng kính mời{" "}
          {invitation ? invitation.recipientText : "bạn"} tới chung vui trong
          lễ thành hôn. Sự hiện diện của bạn là món quà quý giá với chúng mình.
        </p>

        {invitation?.guestCount ? (
          <p className="guest-count" data-invitation-reveal>
            Lời mời dành cho {invitation.guestCount} người
          </p>
        ) : null}

        {invitation?.privateMessage ? (
          <blockquote className="private-message" data-invitation-reveal>
            <span>Lời nhắn riêng</span>
            <p>{invitation.privateMessage}</p>
          </blockquote>
        ) : null}

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
      </div>
    </section>
  );
}
