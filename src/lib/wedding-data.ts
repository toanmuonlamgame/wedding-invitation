import type {
  WeddingContentData,
  WeddingDetails,
} from "@/src/types/wedding";

export const wedding: WeddingDetails = {
  bride: "Vũ Bình",
  groom: "Thành Long",
  coupleDisplay: "Vũ Bình & Thành Long",
  monogram: "B · L",
  datePlaceholder: "Ngày cưới sẽ được cập nhật",
  timePlaceholder: "Thời gian sẽ được cập nhật",
  lunarDatePlaceholder: "Ngày âm lịch sẽ được cập nhật",
  brideFamily: "Gia đình cô dâu Vũ Bình",
  groomFamily: "Gia đình chú rể Thành Long",
  youtubeVideoId: "t-uuZb5PrUs",
  musicTitle:
    "Wedding Music | TOP 20 ca khúc đám cưới được yêu thích nhất",
  musicUrl: "https://www.youtube.com/watch?v=t-uuZb5PrUs",
  musicFallbackSrc: "/music/wedding-theme.wav",
  musicVolume: 0.5,
};

export const defaultWeddingContent: WeddingContentData = {
  weddingDateTime: null,
  expiredCountdownMessage:
    "Hôm nay là ngày vui của Vũ Bình & Thành Long",
  albumIntervalMs: 5_000,
  venues: [
    {
      id: "main-ceremony",
      title: "Điểm hẹn ngày vui",
      eventType: "Lễ thành hôn",
      dateTime: null,
      venueName: "Địa điểm sẽ được cập nhật",
      address: "Thông tin địa chỉ sẽ được gia đình bổ sung.",
      mapsUrl: null,
      note: "Thông tin chính thức đang chờ gia đình cập nhật.",
      available: false,
    },
  ],
  storyChapters: [
    {
      id: "chapter-01",
      chapterNumber: "Chương I",
      period: "Mốc thời gian sẽ được cập nhật",
      title: "Ngày mình gặp nhau",
      summary:
        "Tóm tắt kỷ niệm đầu tiên của Vũ Bình và Thành Long sẽ được bổ sung tại đây.",
      fullStory:
        "Nội dung đầy đủ của chương này đang chờ Vũ Bình và Thành Long chia sẻ.",
      imageSrc: "/images/couple-01.jpg",
      imageAlt: "Ảnh minh họa chương đầu câu chuyện của Vũ Bình và Thành Long",
      available: false,
      visible: true,
    },
    {
      id: "chapter-02",
      chapterNumber: "Chương II",
      period: "Mốc thời gian sẽ được cập nhật",
      title: "Những ngày đồng hành",
      summary:
        "Một dấu mốc đáng nhớ trong hành trình bên nhau sẽ được kể lại tại đây.",
      fullStory:
        "Nội dung đầy đủ của chương này đang chờ Vũ Bình và Thành Long chia sẻ.",
      imageSrc: "/images/couple-02.jpg",
      imageAlt: "Ảnh minh họa những ngày đồng hành của Vũ Bình và Thành Long",
      available: false,
      visible: true,
    },
    {
      id: "chapter-03",
      chapterNumber: "Chương III",
      period: "Mốc thời gian sẽ được cập nhật",
      title: "Về chung một nhà",
      summary:
        "Ngày hai người bắt đầu chương mới sẽ được cập nhật khi thông tin chính thức sẵn sàng.",
      fullStory:
        "Nội dung đầy đủ của chương này đang chờ Vũ Bình và Thành Long chia sẻ.",
      imageSrc: "/images/couple-03.jpg",
      imageAlt: "Ảnh minh họa ngày về chung một nhà",
      available: false,
      visible: true,
    },
  ],
  galleryImages: [
    {
      id: "couple-01",
      src: "/images/couple-01.jpg",
      available: false,
      alt: "Vũ Bình và Thành Long trong ảnh cưới thứ nhất",
      caption: "Khoảnh khắc đầu tiên",
      featured: true,
      carousel: true,
      visible: true,
    },
    {
      id: "couple-02",
      src: "/images/couple-02.jpg",
      available: false,
      alt: "Vũ Bình và Thành Long trong ảnh cưới thứ hai",
      caption: "Một chút bình yên",
      featured: true,
      carousel: true,
      visible: true,
    },
    {
      id: "couple-03",
      src: "/images/couple-03.jpg",
      available: false,
      alt: "Vũ Bình và Thành Long trong ảnh cưới thứ ba",
      caption: "Ngày bên nhau",
      featured: false,
      carousel: true,
      visible: true,
    },
    {
      id: "couple-04",
      src: "/images/couple-04.jpg",
      available: false,
      alt: "Vũ Bình và Thành Long trong ảnh cưới thứ tư",
      caption: "Chuyện của chúng mình",
      featured: false,
      carousel: true,
      visible: true,
    },
  ],
};
