import type { ZodError } from "zod";
import type { FieldErrors } from "@/src/types/engagement";

export async function readJsonBody(request: Request) {
  try {
    return { data: (await request.json()) as unknown, success: true } as const;
  } catch {
    return {
      response: Response.json(
        { message: "Dữ liệu gửi lên không phải JSON hợp lệ." },
        { status: 400 },
      ),
      success: false,
    } as const;
  }
}

export function getFieldErrors(error: ZodError): FieldErrors {
  const fieldErrors: FieldErrors = {};

  for (const issue of error.issues) {
    const path = issue.path.map(String).join(".");
    if (path && !fieldErrors[path]) {
      const fieldName = String(issue.path.at(-1) ?? "");
      const labels: Record<string, string> = {
        address: "Địa chỉ",
        albumIntervalMs: "Chu kỳ carousel",
        alt: "Alt text",
        caption: "Chú thích ảnh",
        chapterNumber: "Số chương",
        confirmedCount: "Số người",
        dateTime: "Ngày giờ sự kiện",
        eventType: "Loại sự kiện",
        expiredCountdownMessage: "Thông điệp countdown",
        fullStory: "Nội dung chương",
        fontPreset: "Bộ font",
        galleryImages: "Album",
        imageAlt: "Alt text",
        imageSrc: "Đường dẫn ảnh",
        imageStoragePath: "Đường dẫn Storage",
        mapsUrl: "Đường dẫn Google Maps",
        message: "Nội dung",
        note: "Ghi chú",
        period: "Mốc thời gian",
        positionX: "Vị trí ngang của ảnh",
        positionY: "Vị trí dọc của ảnh",
        senderName: "Tên người gửi",
        src: "Đường dẫn ảnh",
        storagePath: "Đường dẫn Storage",
        storyChapters: "Câu chuyện",
        summary: "Tóm tắt",
        title: "Tiêu đề",
        themePreset: "Giao diện",
        venueName: "Tên địa điểm",
        venues: "Danh sách địa điểm",
        weddingDateTime: "Ngày cưới",
        zoom: "Độ phóng ảnh",
      };
      const isTechnicalMessage =
        /^(Invalid input|Too (small|big)|Unrecognized key|Expected )/i.test(
          issue.message,
        );
      fieldErrors[path] = isTechnicalMessage
        ? `${labels[fieldName] ?? "Giá trị"} chưa hợp lệ.`
        : issue.message;
    }
  }

  return fieldErrors;
}

export function validationErrorResponse(error: ZodError) {
  return Response.json(
    {
      error: "VALIDATION_ERROR",
      message: "Dữ liệu chưa hợp lệ.",
      fieldErrors: getFieldErrors(error),
    },
    { status: 400 },
  );
}
