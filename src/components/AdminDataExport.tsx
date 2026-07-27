"use client";

import { useState } from "react";
import type {
  RsvpExportStatus,
  WishExportStatus,
} from "@/src/types/engagement";

type AdminDataExportProps = {
  creatorSecret: string;
};

function filenameFromResponse(response: Response, fallback: string) {
  const disposition = response.headers.get("Content-Disposition") ?? "";
  return disposition.match(/filename="([^"]+)"/)?.[1] ?? fallback;
}

export function AdminDataExport({ creatorSecret }: AdminDataExportProps) {
  const [wishStatus, setWishStatus] = useState<WishExportStatus>("all");
  const [rsvpStatus, setRsvpStatus] = useState<RsvpExportStatus>("all");
  const [status, setStatus] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  async function download(type: "wishes" | "rsvps") {
    if (isExporting) return;
    setIsExporting(true);
    setStatus("Đang tạo file CSV…");

    try {
      const response = await fetch("/api/admin/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorSecret,
          type,
          wishStatus,
          rsvpStatus,
        }),
      });
      if (!response.ok) {
        const payload = (await response.json()) as { message?: unknown };
        throw new Error(
          typeof payload.message === "string"
            ? payload.message
            : "Chưa thể xuất dữ liệu.",
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filenameFromResponse(
        response,
        type === "wishes" ? "loi-chuc-cuoi.csv" : "danh-sach-tham-du.csv",
      );
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setStatus("Đã tạo file CSV UTF-8 an toàn cho Excel.");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Chưa thể xuất dữ liệu.",
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section className="admin-export" aria-labelledby="admin-export-title">
      <header>
        <p className="section-eyebrow">PostgreSQL / Supabase</p>
        <h3 id="admin-export-title">Xuất dữ liệu</h3>
        <p>
          File được tạo phía server, có UTF-8 BOM và chống công thức nguy hiểm
          khi mở bằng Excel.
        </p>
      </header>

      <div className="admin-export-filters">
        <label>
          Trạng thái lời chúc
          <select
            value={wishStatus}
            onChange={(event) =>
              setWishStatus(event.target.value as WishExportStatus)
            }
          >
            <option value="all">Tất cả</option>
            <option value="visible">Đang hiển thị</option>
            <option value="hidden">Đã ẩn</option>
          </select>
        </label>
        <label>
          Trạng thái RSVP
          <select
            value={rsvpStatus}
            onChange={(event) =>
              setRsvpStatus(event.target.value as RsvpExportStatus)
            }
          >
            <option value="all">Tất cả</option>
            <option value="attending">Có tham dự</option>
            <option value="declined">Không tham dự</option>
          </select>
        </label>
      </div>

      <div className="admin-export-actions">
        <button
          className="button"
          type="button"
          disabled={isExporting}
          onClick={() => void download("wishes")}
        >
          Xuất lời chúc CSV
        </button>
        <button
          className="button"
          type="button"
          disabled={isExporting}
          onClick={() => void download("rsvps")}
        >
          Xuất RSVP CSV
        </button>
        <button
          className="button button-secondary"
          type="button"
          disabled
          title="Dự án chưa có thư viện tạo XLSX phía server."
        >
          Xuất toàn bộ Excel
        </button>
      </div>
      <p className="field-help">
        Excel tổng hợp chưa bật vì CM này không được cài thêm dependency XLSX.
      </p>
      <p className="form-status" role="status" aria-live="polite">
        {status}
      </p>
    </section>
  );
}
