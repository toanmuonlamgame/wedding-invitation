export type StoryMilestone = {
  year: string;
  title: string;
  description: string;
};

export type WeddingDetails = {
  bride: string;
  groom: string;
  dateIso: string;
  dateDisplay: string;
  time: string;
  venue: string;
  address: string;
  mapUrl: string;
  brideFamily: string;
  groomFamily: string;
  story: StoryMilestone[];
};
