import type { WeddingDetails } from "@/src/types/wedding";

export const wedding: WeddingDetails = {
  bride: "Vũ Bình",
  groom: "Thành Long",
  coupleDisplay: "Vũ Bình & Thành Long",
  monogram: "B · L",
  dateIso: null,
  dateDisplay: "Ngày cưới sẽ được cập nhật",
  timeDisplay: "Thời gian sẽ được cập nhật",
  lunarDate: "Ngày âm lịch sẽ được cập nhật",
  venue: "Địa điểm sẽ được cập nhật",
  address: "Thông tin địa chỉ sẽ được gia đình bổ sung.",
  mapUrl: null,
  brideFamily: "Gia đình cô dâu Vũ Bình",
  groomFamily: "Gia đình chú rể Thành Long",
  musicSrc: "/music/wedding-theme.wav",
  story: [
    {
      marker: "Chương I",
      title: "Ngày mình gặp nhau",
      description:
        "Kỷ niệm đầu tiên của Vũ Bình và Thành Long sẽ được gia đình bổ sung tại đây.",
    },
    {
      marker: "Chương II",
      title: "Những ngày đồng hành",
      description:
        "Một dấu mốc đáng nhớ trong hành trình bên nhau sẽ được kể lại tại đây.",
    },
    {
      marker: "Chương III",
      title: "Về chung một nhà",
      description:
        "Ngày hai người bắt đầu chương mới sẽ được cập nhật khi thông tin chính thức sẵn sàng.",
    },
  ],
  gallery: [
    {
      src: "/images/couple-01.jpg",
      available: false,
      alt: "Vũ Bình và Thành Long trong ảnh cưới thứ nhất",
      caption: "Khoảnh khắc đầu tiên",
    },
    {
      src: "/images/couple-02.jpg",
      available: false,
      alt: "Vũ Bình và Thành Long trong ảnh cưới thứ hai",
      caption: "Một chút bình yên",
    },
    {
      src: "/images/couple-03.jpg",
      available: false,
      alt: "Vũ Bình và Thành Long trong ảnh cưới thứ ba",
      caption: "Ngày bên nhau",
    },
    {
      src: "/images/couple-04.jpg",
      available: false,
      alt: "Vũ Bình và Thành Long trong ảnh cưới thứ tư",
      caption: "Chuyện của chúng mình",
    },
  ],
};
