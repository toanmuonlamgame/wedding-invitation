export type StoryMilestone = {
  marker: string;
  title: string;
  description: string;
};

export type GalleryMoment = {
  src: string;
  available: boolean;
  alt: string;
  caption: string;
};

export type WeddingDetails = {
  bride: string;
  groom: string;
  coupleDisplay: string;
  monogram: string;
  dateIso: string | null;
  dateDisplay: string;
  timeDisplay: string;
  lunarDate: string;
  venue: string;
  address: string;
  mapUrl: string | null;
  brideFamily: string;
  groomFamily: string;
  youtubeVideoId: string;
  musicTitle: string;
  musicUrl: string;
  musicFallbackSrc: string;
  story: StoryMilestone[];
  gallery: GalleryMoment[];
};
