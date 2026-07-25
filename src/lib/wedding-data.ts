import type { WeddingDetails } from "@/src/types/wedding";

export const wedding: WeddingDetails = {
  bride: "Minh Anh",
  groom: "Quang Huy",
  dateIso: "2026-12-20T17:30:00+07:00",
  dateDisplay: "20 · 12 · 2026",
  time: "17:30 · Chủ Nhật, 20 tháng 12 năm 2026",
  venue: "The Garden Riverside",
  address: "12 Nguyễn Bỉnh Khiêm, Phường Sài Gòn, Thành phố Hồ Chí Minh",
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=12+Nguyen+Binh+Khiem+Ho+Chi+Minh+City",
  brideFamily: "Ông Nguyễn Văn Minh & Bà Lê Thu Hà",
  groomFamily: "Ông Trần Quốc Nam & Bà Phạm Ngọc Lan",
  story: [
    {
      year: "2019",
      title: "Một lần tình cờ",
      description:
        "Chúng mình gặp nhau trong một buổi chiều mưa, từ một lời chào giản dị mà thành cả hành trình dài.",
    },
    {
      year: "2022",
      title: "Những ngày đồng hành",
      description:
        "Qua bao chuyến đi và những bữa cơm nhà, cả hai nhận ra bình yên chính là có nhau bên cạnh.",
    },
    {
      year: "2026",
      title: "Về chung một nhà",
      description:
        "Chúng mình chọn mùa cuối năm để viết chương mới và mong được sẻ chia khoảnh khắc ấy cùng bạn.",
    },
  ],
};
