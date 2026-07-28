import type { WeddingExperienceSettings } from "@/src/types/wedding";

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
  music: {
    enabled: true,
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
    heroCollage: true,
    story: true,
    rsvp: true,
  },
  allowGuestSideSelection: false,
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

  return {
    cover: {
      ...defaultExperienceSettings.cover,
      ...cover,
      background: {
        ...defaultExperienceSettings.cover.background,
        ...record(cover.background),
      },
      logoFrame: {
        ...defaultExperienceSettings.cover.logoFrame,
        ...record(cover.logoFrame),
      },
    },
    music: {
      ...defaultExperienceSettings.music,
      ...record(source.music),
    },
    youtube: {
      ...defaultExperienceSettings.youtube,
      ...youtube,
      ...(usedTemporaryYouTubeDefault
        ? {
            url: defaultExperienceSettings.youtube.url,
            title: defaultExperienceSettings.youtube.title,
            description: defaultExperienceSettings.youtube.description,
          }
        : {}),
    },
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
  };
}
