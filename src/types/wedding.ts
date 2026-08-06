export type ThemePresetId =
  | "ivory-sage"
  | "champagne-gold"
  | "blush-romance"
  | "midnight-navy"
  | "forest-noir"
  | "burgundy-velvet"
  | "lavender-dream"
  | "peach-garden"
  | "terracotta-boho"
  | "black-pearl";

export type FontPresetId =
  | "elegant-editorial"
  | "classic-wedding"
  | "royal-serif"
  | "french-elegance"
  | "luxury-magazine"
  | "modern-clean"
  | "minimal-chic"
  | "soft-contemporary"
  | "urban-wedding"
  | "scandinavian-light"
  | "romantic-script"
  | "garden-calligraphy"
  | "dreamy-blossom"
  | "love-letter"
  | "fairytale-wedding"
  | "vintage-invitation"
  | "victorian-romance"
  | "art-nouveau"
  | "bohemian-poetry"
  | "cinematic-love";

export type ImageFraming = {
  positionX: number;
  positionY: number;
  zoom: number;
  fitMode: "cover" | "contain";
  backgroundColor: string;
};

export type WishLayout = "elegant" | "bubble";
export type InvitationSide = "groom" | "bride" | "unspecified";
export type WishOverlayPreset = "soft" | "balanced" | "prominent";

export type CoverSettings = {
  kicker: string;
  brideName: string;
  connector: string;
  groomName: string;
  note: string;
  buttonText: string;
  backgroundEnabled: boolean;
  backgroundSrc?: string;
  backgroundStoragePath?: string;
  backgroundAlt: string;
  background: ImageFraming;
  textColor: string;
  overlayColor: string;
  overlayOpacity: number;
  blurPx: number;
  alignment: "left" | "center" | "right";
  nameSize: "compact" | "balanced" | "grand";
  logoMode: "monogram" | "image" | "hidden";
  monogramText: string;
  logoSrc?: string;
  logoStoragePath?: string;
  logoAlt: string;
  logoSize: "small" | "medium" | "large";
  logoFrame: ImageFraming;
};

export type MusicSettings = {
  enabled: boolean;
  src: string;
  title: string;
  volume: number;
  loop: boolean;
  autoplayAfterOpen: boolean;
};

export type YouTubeSettings = {
  enabled: boolean;
  url: string;
  title: string;
  description: string;
};

export type CountdownSettings = {
  backgroundEnabled: boolean;
  backgroundSrc?: string;
  backgroundStoragePath?: string;
  backgroundAlt: string;
  background: ImageFraming;
  overlayColor: string;
  overlayOpacity: number;
  showCalendar: boolean;
  showLunarDate: boolean;
  showTime: boolean;
  showCountdown: boolean;
  markerStyle: "circle" | "dot" | "heart";
};

export type SectionCopy = {
  eyebrow: string;
  title: string;
  description: string;
};

export type WeddingTextCopy = {
  cover: Pick<
    CoverSettings,
    "kicker" | "brideName" | "connector" | "groomName" | "note" | "buttonText"
  >;
  invitation: InvitationContentSettings;
  album: Pick<SectionCopy, "eyebrow" | "title">;
  story: SectionCopy;
  countdown: SectionCopy & { expiredMessage: string };
  venue: SectionCopy;
  rsvp: SectionCopy;
  wishes: SectionCopy;
  youtube: Pick<YouTubeSettings, "title" | "description">;
  footer: Pick<SectionCopy, "title"> & { body: string };
};

export type LocalizedWeddingCopy = Record<"vi" | "ko", WeddingTextCopy>;

export type WeddingExperienceSettings = {
  cover: CoverSettings;
  invitation: InvitationContentSettings;
  music: MusicSettings;
  youtube: YouTubeSettings;
  countdown: CountdownSettings;
  wishLayout: WishLayout;
  wishes: {
    overlayEnabled: boolean;
    showList: boolean;
    preset: WishOverlayPreset;
    intervalMs: number;
    opacity: number;
    visibleCount: number;
    autoHideWhenTyping: boolean;
  };
  sections: {
    invitation: boolean;
    heroCollage: boolean;
    story: boolean;
    rsvp: boolean;
  };
  allowGuestSideSelection: boolean;
  localizedCopy: LocalizedWeddingCopy;
};

export type InvitationContentSettings = {
  eyebrow: string;
  title: string;
  body: string;
  supportingText: string;
  brideFamily: string;
  groomFamily: string;
};

export type WeddingEvent = {
  id: string;
  title: string;
  eventType: string;
  dateTime: string | null;
  venueName: string;
  address: string;
  mapsUrl: string | null;
  note?: string;
  imageSrc?: string;
  imageStoragePath?: string;
  imageAlt?: string;
  positionX: number;
  positionY: number;
  zoom: number;
  fitMode: "cover" | "contain";
  backgroundColor: string;
  showImage: boolean;
  available: boolean;
  translations?: {
    ko?: Partial<Pick<WeddingEvent, "title" | "eventType" | "venueName" | "address" | "note">>;
  };
};

export type StoryImage = ImageFraming & {
  id: string;
  src: string;
  storagePath?: string;
  alt: string;
  available: boolean;
};

export type LoveStoryChapter = {
  id: string;
  chapterNumber: string;
  period: string;
  title: string;
  summary: string;
  fullStory: string;
  images: StoryImage[];
  available: boolean;
  visible: boolean;
  translations?: {
    ko?: Partial<
      Pick<LoveStoryChapter, "chapterNumber" | "period" | "title" | "summary" | "fullStory">
    >;
  };
};

export type GalleryMoment = {
  id: string;
  src: string;
  storagePath?: string;
  available: boolean;
  alt: string;
  caption: string;
  positionX: number;
  positionY: number;
  zoom: number;
  fitMode: "cover" | "contain";
  backgroundColor: string;
  featured: boolean;
  carousel: boolean;
  visible: boolean;
};

export type WeddingContentData = {
  weddingDateTime: string | null;
  expiredCountdownMessage: string;
  venues: WeddingEvent[];
  storyChapters: LoveStoryChapter[];
  galleryImages: GalleryMoment[];
  albumIntervalMs: number;
  themePreset: ThemePresetId;
  fontPreset: FontPresetId;
  experience: WeddingExperienceSettings;
};

export type WeddingDetails = {
  bride: string;
  groom: string;
  coupleDisplay: string;
  monogram: string;
  datePlaceholder: string;
  timePlaceholder: string;
  lunarDatePlaceholder: string;
  brideFamily: string;
  groomFamily: string;
  youtubeVideoId: string;
  musicTitle: string;
  musicUrl: string;
  musicFallbackSrc: string;
  musicVolume: number;
};
