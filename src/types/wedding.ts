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
};

export type LoveStoryChapter = {
  id: string;
  chapterNumber: string;
  period: string;
  title: string;
  summary: string;
  fullStory: string;
  imageSrc?: string;
  imageStoragePath?: string;
  imageAlt: string;
  positionX: number;
  positionY: number;
  zoom: number;
  fitMode: "cover" | "contain";
  backgroundColor: string;
  available: boolean;
  visible: boolean;
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
