import type { WeddingExperienceSettings } from "@/src/types/wedding";
import { invitationMessages } from "./invitation-i18n.ts";

function defaultTextCopy(language: "vi" | "ko") {
  const messages = invitationMessages[language];
  return {
    cover: {
      kicker: messages.cover.invitationLabel,
      brideName: "Vũ Bình",
      connector: "&",
      groomName: "Thành Long",
      note: messages.cover.note,
      buttonText: messages.cover.openInvitation,
    },
    invitation: {
      eyebrow: messages.invitation.eyebrow,
      title: messages.invitation.title,
      body: messages.invitation.body,
      supportingText: messages.invitation.supportingText,
      brideFamily: language === "ko" ? "신부 Vũ Bình 가족" : "Gia đình cô dâu Vũ Bình",
      groomFamily: language === "ko" ? "신랑 Thành Long 가족" : "Gia đình chú rể Thành Long",
    },
    album: { eyebrow: messages.album.eyebrow, title: messages.album.title },
    story: {
      eyebrow: messages.story.eyebrow,
      title: messages.story.title,
      description: messages.story.description,
    },
    countdown: {
      eyebrow: messages.schedule.eyebrow,
      title: messages.schedule.title,
      description: messages.schedule.description,
      expiredMessage: messages.schedule.expired,
    },
    venue: {
      eyebrow: messages.venue.eyebrow,
      title: messages.venue.title,
      description: messages.venue.description,
    },
    rsvp: {
      eyebrow: messages.rsvp.eyebrow,
      title: messages.rsvp.title,
      description: messages.rsvp.description,
    },
    wishes: {
      eyebrow: messages.wishes.eyebrow,
      title: messages.wishes.title,
      description: messages.wishes.description,
    },
    youtube: {
      title: messages.youtube.title,
      description: messages.youtube.description,
    },
    footer: { title: messages.footer.title, body: messages.footer.body },
  };
}

export const defaultExperienceSettings: WeddingExperienceSettings = {
  cover: {
    kicker: "Trân trọng kính mời",
    brideName: "Vũ Bình",
    connector: "&",
    groomName: "Thành Long",
    note: "Cùng mở thiệp và chung vui với hai gia đình",
    buttonText: "Mở thiệp",
    backgroundEnabled: false,
    backgroundAlt: "Ảnh nền mở thiệp",
    background: {
      positionX: 50,
      positionY: 50,
      zoom: 1,
      fitMode: "cover",
      backgroundColor: "#ffffff",
    },
    textColor: "#27362d",
    overlayColor: "#1d2d25",
    overlayOpacity: 0.28,
    blurPx: 0,
    alignment: "center",
    nameSize: "balanced",
    logoMode: "monogram",
    monogramText: "B & L",
    logoAlt: "Biểu trưng Vũ Bình và Thành Long",
    logoSize: "medium",
    logoFrame: {
      positionX: 50,
      positionY: 50,
      zoom: 1,
      fitMode: "contain",
      backgroundColor: "#ffffff",
    },
  },
  invitation: {
    eyebrow: "Lời mời thân tình",
    title:
      "“Có những hành trình đẹp hơn khi được sẻ chia cùng những người mình thương.”",
    body:
      "Hai gia đình trân trọng kính mời bạn tới chung vui trong lễ thành hôn. Sự hiện diện của bạn là món quà quý giá với chúng mình.",
    supportingText: "",
    brideFamily: "Gia đình cô dâu Vũ Bình",
    groomFamily: "Gia đình chú rể Thành Long",
  },
  music: {
    enabled: false,
    src: "/music/wedding-theme.wav",
    title: "Giai điệu ngày vui",
    volume: 0.28,
    loop: true,
    autoplayAfterOpen: true,
  },
  youtube: {
    enabled: true,
    url: "https://www.youtube.com/watch?v=t-uuZb5PrUs",
    title:
      "Wedding Music | TOP 20 ca khúc đám cưới được yêu thích nhất",
    description:
      "Video YouTube được tải sau khi mở thiệp và giữ nguyên bộ điều khiển phát.",
  },
  countdown: {
    backgroundEnabled: false,
    backgroundAlt: "Ảnh nền lịch cưới",
    background: {
      positionX: 50,
      positionY: 50,
      zoom: 1,
      fitMode: "cover",
      backgroundColor: "#ffffff",
    },
    overlayColor: "#17251f",
    overlayOpacity: 0.36,
    showCalendar: true,
    showLunarDate: true,
    showTime: true,
    showCountdown: true,
    markerStyle: "heart",
  },
  wishLayout: "elegant",
  wishes: {
    overlayEnabled: true,
    showList: true,
    preset: "balanced",
    intervalMs: 5_500,
    opacity: 0.66,
    visibleCount: 3,
    autoHideWhenTyping: true,
  },
  sections: {
    invitation: true,
    heroCollage: true,
    story: true,
    rsvp: true,
  },
  allowGuestSideSelection: false,
  localizedCopy: {
    vi: defaultTextCopy("vi"),
    ko: defaultTextCopy("ko"),
  },
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function mergeExperienceSettings(value: unknown): unknown {
  const source = record(value);
  const cover = record(source.cover);
  const countdown = record(source.countdown);
  const youtube = record(source.youtube);
  const usedTemporaryYouTubeDefault =
    youtube.title === "Bản nhạc chúng mình yêu thích";
  const localizedCopy = record(source.localizedCopy);
  const mergedCover = { ...defaultExperienceSettings.cover, ...cover };
  const mergedInvitation = {
    ...defaultExperienceSettings.invitation,
    ...record(source.invitation),
  };
  const mergedYoutube = {
    ...defaultExperienceSettings.youtube,
    ...youtube,
    ...(usedTemporaryYouTubeDefault
      ? {
          url: defaultExperienceSettings.youtube.url,
          title: defaultExperienceSettings.youtube.title,
          description: defaultExperienceSettings.youtube.description,
        }
      : {}),
  };
  const legacyCoverCopy = {
    kicker: mergedCover.kicker,
    brideName: mergedCover.brideName,
    connector: mergedCover.connector,
    groomName: mergedCover.groomName,
    note: mergedCover.note,
    buttonText: mergedCover.buttonText,
  };
  const legacyYoutubeCopy = {
    title: mergedYoutube.title,
    description: mergedYoutube.description,
  };

  const mergeCopy = (language: "vi" | "ko") => {
    const defaults = defaultExperienceSettings.localizedCopy[language];
    const stored = record(localizedCopy[language]);
    return {
      ...defaults,
      ...stored,
      cover: {
        ...defaults.cover,
        ...(language === "vi" ? legacyCoverCopy : {}),
        ...record(stored.cover),
      },
      invitation: {
        ...defaults.invitation,
        ...(language === "vi" ? mergedInvitation : {}),
        ...record(stored.invitation),
      },
      album: { ...defaults.album, ...record(stored.album) },
      story: { ...defaults.story, ...record(stored.story) },
      countdown: { ...defaults.countdown, ...record(stored.countdown) },
      venue: { ...defaults.venue, ...record(stored.venue) },
      rsvp: { ...defaults.rsvp, ...record(stored.rsvp) },
      wishes: { ...defaults.wishes, ...record(stored.wishes) },
      youtube: {
        ...defaults.youtube,
        ...(language === "vi" ? legacyYoutubeCopy : {}),
        ...record(stored.youtube),
      },
      footer: { ...defaults.footer, ...record(stored.footer) },
    };
  };

  return {
    cover: {
      ...mergedCover,
      background: {
        ...defaultExperienceSettings.cover.background,
        ...record(cover.background),
      },
      logoFrame: {
        ...defaultExperienceSettings.cover.logoFrame,
        ...record(cover.logoFrame),
      },
    },
    invitation: mergedInvitation,
    music: {
      ...defaultExperienceSettings.music,
      ...record(source.music),
    },
    youtube: mergedYoutube,
    countdown: {
      ...defaultExperienceSettings.countdown,
      ...countdown,
      background: {
        ...defaultExperienceSettings.countdown.background,
        ...record(countdown.background),
      },
    },
    wishLayout:
      source.wishLayout ?? defaultExperienceSettings.wishLayout,
    wishes: {
      ...defaultExperienceSettings.wishes,
      ...record(source.wishes),
    },
    sections: {
      ...defaultExperienceSettings.sections,
      ...record(source.sections),
    },
    allowGuestSideSelection:
      source.allowGuestSideSelection ??
      defaultExperienceSettings.allowGuestSideSelection,
    localizedCopy: { vi: mergeCopy("vi"), ko: mergeCopy("ko") },
  };
}
