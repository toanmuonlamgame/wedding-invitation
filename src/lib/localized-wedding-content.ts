import type { InvitationLanguage } from "@/src/lib/invitation-i18n";
import type {
  LoveStoryChapter,
  WeddingContentData,
  WeddingEvent,
  WeddingTextCopy,
} from "@/src/types/wedding";

function text(value: string | undefined, fallback: string) {
  return value?.trim() || fallback;
}

function copyWithFallback(primary: WeddingTextCopy, fallback: WeddingTextCopy) {
  return Object.fromEntries(
    Object.entries(fallback).map(([section, fallbackFields]) => {
      const primaryFields = primary[section as keyof WeddingTextCopy] as unknown as Record<string, string>;
      return [
        section,
        Object.fromEntries(
          Object.entries(fallbackFields).map(([field, fallbackValue]) => [
            field,
            text(primaryFields[field], fallbackValue),
          ]),
        ),
      ];
    }),
  ) as WeddingTextCopy;
}

export function getLocalizedWeddingContent(
  content: WeddingContentData,
  language: InvitationLanguage,
) {
  const copy = language === "ko"
    ? copyWithFallback(
        content.experience.localizedCopy.ko,
        content.experience.localizedCopy.vi,
      )
    : content.experience.localizedCopy.vi;
  const localizeVenue = (venue: WeddingEvent): WeddingEvent => {
    if (language !== "ko") return venue;
    const translated = venue.translations?.ko;
    return {
      ...venue,
      title: text(translated?.title, venue.title),
      eventType: text(translated?.eventType, venue.eventType),
      venueName: text(translated?.venueName, venue.venueName),
      address: text(translated?.address, venue.address),
      note: text(translated?.note, venue.note ?? "") || undefined,
    };
  };
  const localizeChapter = (chapter: LoveStoryChapter): LoveStoryChapter => {
    if (language !== "ko") return chapter;
    const translated = chapter.translations?.ko;
    return {
      ...chapter,
      chapterNumber: text(translated?.chapterNumber, chapter.chapterNumber),
      period: text(translated?.period, chapter.period),
      title: text(translated?.title, chapter.title),
      summary: text(translated?.summary, chapter.summary),
      fullStory: text(translated?.fullStory, chapter.fullStory),
    };
  };

  return {
    copy,
    cover: { ...content.experience.cover, ...copy.cover },
    invitation: { ...content.experience.invitation, ...copy.invitation },
    youtube: { ...content.experience.youtube, ...copy.youtube },
    expiredCountdownMessage:
      language === "vi"
        ? content.expiredCountdownMessage
        : copy.countdown.expiredMessage,
    venues: content.venues.map(localizeVenue),
    storyChapters: content.storyChapters.map(localizeChapter),
  };
}

function collectEmpty(value: unknown, prefix: string, result: string[]) {
  if (typeof value === "string") {
    if (!value.trim()) result.push(prefix);
    return;
  }
  if (!value || typeof value !== "object") return;
  Object.entries(value).forEach(([key, child]) =>
    collectEmpty(child, prefix ? `${prefix}.${key}` : key, result),
  );
}

export function getMissingKoreanContent(content: WeddingContentData) {
  const missing: string[] = [];
  collectEmpty(content.experience.localizedCopy.ko, "experience.localizedCopy.ko", missing);
  content.venues.forEach((venue, index) => {
    const translated = venue.translations?.ko;
    (["title", "eventType", "venueName", "address"] as const).forEach((key) => {
      if (!translated?.[key]?.trim()) missing.push(`venues.${index}.translations.ko.${key}`);
    });
  });
  content.storyChapters.forEach((chapter, index) => {
    const translated = chapter.translations?.ko;
    (["chapterNumber", "period", "title", "summary", "fullStory"] as const).forEach((key) => {
      if (!translated?.[key]?.trim()) missing.push(`storyChapters.${index}.translations.ko.${key}`);
    });
  });
  return missing;
}

export function weddingMessageOverrides(copy: WeddingTextCopy) {
  return {
    cover: {
      invitationLabel: copy.cover.kicker,
      openInvitation: copy.cover.buttonText,
      note: copy.cover.note,
    },
    invitation: {
      eyebrow: copy.invitation.eyebrow,
      title: copy.invitation.title,
      body: copy.invitation.body,
      supportingText: copy.invitation.supportingText,
    },
    album: copy.album,
    story: copy.story,
    schedule: {
      eyebrow: copy.countdown.eyebrow,
      title: copy.countdown.title,
      description: copy.countdown.description,
      expired: copy.countdown.expiredMessage,
    },
    venue: copy.venue,
    rsvp: copy.rsvp,
    wishes: copy.wishes,
    youtube: copy.youtube,
    footer: copy.footer,
  };
}
