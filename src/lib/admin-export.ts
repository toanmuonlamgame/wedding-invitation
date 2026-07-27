import "server-only";

import { prisma } from "@/src/lib/prisma";
import { createCsv } from "@/src/lib/csv";
import type {
  RsvpExportStatus,
  WishExportStatus,
} from "@/src/types/engagement";

const vietnamDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
  dateStyle: "short",
  timeStyle: "medium",
});

const filenameDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Ho_Chi_Minh",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function formatDate(value: Date) {
  return vietnamDateFormatter.format(value);
}

export function exportFilename(prefix: string, now = new Date()) {
  return `${prefix}-${filenameDateFormatter.format(now)}.csv`;
}

export async function createWishesCsv(status: WishExportStatus) {
  const wishes = await prisma.weddingWish.findMany({
    where:
      status === "all"
        ? undefined
        : { isVisible: status === "visible" },
    orderBy: { createdAt: "desc" },
    include: {
      invitation: {
        select: { recipientText: true },
      },
    },
  });

  return createCsv([
    [
      "STT",
      "Tên người gửi",
      "Nội dung lời chúc",
      "Trạng thái hiển thị",
      "Người nhận / thiệp liên quan",
      "Thời gian gửi",
      "Thời gian cập nhật",
    ],
    ...wishes.map((wish, index) => [
      index + 1,
      wish.senderName,
      wish.message,
      wish.isVisible ? "Đang hiển thị" : "Đã ẩn",
      wish.invitation?.recipientText ?? "",
      formatDate(wish.createdAt),
      formatDate(wish.updatedAt),
    ]),
  ]);
}

export async function createRsvpsCsv(status: RsvpExportStatus) {
  const rsvps = await prisma.rsvp.findMany({
    where:
      status === "all"
        ? undefined
        : { attending: status === "attending" },
    orderBy: { updatedAt: "desc" },
    include: {
      invitation: {
        select: {
          recipientText: true,
          guestCount: true,
        },
      },
    },
  });

  return createCsv([
    [
      "STT",
      "Tên khách / nội dung người được mời",
      "Trạng thái tham dự",
      "Số người xác nhận",
      "Số khách dự kiến trên thiệp",
      "Ghi chú",
      "Thời gian xác nhận",
      "Thời gian cập nhật",
    ],
    ...rsvps.map((rsvp, index) => [
      index + 1,
      rsvp.invitation.recipientText,
      rsvp.attending ? "Có tham dự" : "Không tham dự",
      rsvp.confirmedCount ?? "",
      rsvp.invitation.guestCount ?? "",
      rsvp.note ?? "",
      formatDate(rsvp.createdAt),
      formatDate(rsvp.updatedAt),
    ]),
  ]);
}
