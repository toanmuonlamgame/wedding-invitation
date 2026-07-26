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
