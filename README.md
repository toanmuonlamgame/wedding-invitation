# Thiệp cưới Vũ Bình & Thành Long

Website thiệp cưới dành cho một đám cưới gia đình khoảng 50–100 khách. Trang
chính là thiệp mẫu, nơi tạo link và admin nhẹ để gia đình cập nhật countdown,
địa điểm, câu chuyện và album dùng chung. Trang `/thiep/[token]` luôn đọc nội
dung chung mới nhất nhưng chỉ hiển thị trải nghiệm dành cho khách.

## Stack

- Next.js 16 App Router, React 19 và TypeScript
- Tailwind CSS 4 cùng CSS tùy chỉnh mobile-first
- GSAP + ScrollTrigger cho chuyển động có cleanup
- Prisma ORM 6 + Supabase PostgreSQL
- Zod cho validation phía server
- Node.js `crypto` cho token URL-safe

## Chạy local

Yêu cầu Node.js 20 trở lên.

```bash
npm install
```

Tự sao chép `.env.example` thành `.env`, điền các biến theo phần dưới, sau đó
tự chạy migration lần đầu:

```bash
npx prisma migrate deploy
npx prisma generate
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Biến môi trường

```dotenv
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
INVITATION_CREATOR_SECRET="..."
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="..."
SUPABASE_STORAGE_BUCKET="wedding-media"
```

- `DATABASE_URL`: URL Transaction pooler của Supabase (port `6543`) cho lưu
  lượng serverless. Với Prisma 6 có thể thêm
  `?pgbouncer=true&connection_limit=1`.
- `DIRECT_URL`: URL Direct connection (port `5432`) dùng cho Prisma Migrate.
  Nếu máy không có IPv6, dùng Session pooler port `5432` do Supabase cung cấp.
- `INVITATION_CREATOR_SECRET`: chuỗi bí mật dài, chỉ đặt ở server. Có thể tự
  tạo bằng
  `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`.
- `NEXT_PUBLIC_SITE_URL`: origin chính xác của site, không kèm đường dẫn; dùng
  `http://localhost:3000` ở local và domain HTTPS thật trên Vercel.
- `SUPABASE_URL`: Project URL HTTPS dùng bởi API upload phía server.
- `SUPABASE_SERVICE_ROLE_KEY`: service-role key chỉ cấu hình phía server, tuyệt đối
  không đổi tên thành biến `NEXT_PUBLIC_*`.
- `SUPABASE_STORAGE_BUCKET`: bucket ảnh công khai; giá trị mặc định của dự án là
  `wedding-media`.

## Supabase Storage

Tạo thủ công một bucket trước khi dùng uploader:

1. Mở Supabase Dashboard → Storage.
2. Chọn **New bucket**.
3. Đặt tên chính xác `wedding-media`.
4. Bật **Public bucket**.
5. Có thể đặt giới hạn file 10 MB và MIME cho phép:
   `image/jpeg`, `image/png`, `image/webp`.
6. Không cần tạo sẵn thư mục; API sẽ dùng `album/YYYY/`, `story/YYYY/` và
   `venues/YYYY/`.

Uploader nằm trong `/admin`, xác thực bằng cùng mã quản trị. Service-role key chỉ
được dùng bởi Route Handler để upload/xóa và không xuất hiện trong client bundle.

API kiểm tra giới hạn 10 MB mỗi ảnh. Tuy nhiên Vercel Functions hiện giới hạn
request body 4,5 MB; nếu cần tải ảnh 4,5–10 MB trên production, bước tiếp theo là
đổi sang signed upload URL để trình duyệt gửi thẳng tới Supabase Storage.

Không commit `.env`. File `.env.example` chỉ chứa tên biến và giá trị mẫu.

## Luồng tạo thiệp

1. Gia đình mở trang `/` và đi đến khu vực “Tạo thiệp cá nhân”.
2. Nhập thông tin người nhận và mã tạo thiệp.
3. Nhập nội dung người được mời, số người tùy chọn, lời nhắn tùy chọn và mã tạo
   thiệp.
4. Form gọi `POST /api/invitations`.
5. Server dùng Zod kiểm tra body, so sánh mã tạo thiệp, sinh token 192-bit bằng
   Node.js `crypto` và lưu một bản ghi `Invitation`.
6. Giao diện trả về link thật, cho phép sao chép hoặc mở ngay.
7. `/thiep/[token]` ghép invitation với singleton `WeddingContent` và render
   thiệp chỉ đọc.

Mã tạo thiệp không được lưu trong database, URL, localStorage hoặc response.

## Routes

- `/`: thiệp mẫu công khai và form tạo thiệp cá nhân, không có điều khiển quản trị nội dung chung.
- `/admin`: quản trị nội dung chung, preset giao diện/font, căn khung ảnh, lời
  chúc, danh sách RSVP, xuất CSV và preview sau khi xác thực.
- `POST /api/invitations`: endpoint duy nhất để tạo thiệp.
- `GET /api/wedding-content`: nội dung chung cần để render thiệp.
- `POST /api/wedding-content`: xác thực mã quản trị, không lưu secret.
- `PUT /api/wedding-content`: cập nhật singleton nội dung chung, bắt buộc secret.
- `GET /api/wishes`: chỉ trả các lời chúc đang hiển thị.
- `POST /api/invitations/[token]/wishes`: gửi lời chúc từ đúng thiệp khách.
- `GET/PUT /api/invitations/[token]/rsvp`: đọc hoặc cập nhật RSVP của đúng thiệp khách.
- `/api/admin/wishes` và `/api/admin/rsvps`: bắt buộc mã quản trị ở server.
- `POST /api/admin/export`: tạo CSV lời chúc hoặc RSVP phía server, bắt buộc mã
  quản trị.
- `POST /api/admin/media/upload`: upload một ảnh lên Supabase Storage phía server.
- `DELETE /api/admin/media`: xóa file đã xác nhận trong các prefix media cho phép.
- `/thiep/[token]`: thiệp cá nhân render động, có gửi lời chúc và RSVP nhưng không có công cụ creator/admin.
- Token sai định dạng hoặc không tồn tại trả về trang 404.

Không có endpoint liệt kê, chỉnh sửa hoặc xóa invitation.

## Prisma

Schema nằm tại `prisma/schema.prisma`. Migration thêm `WeddingContent` đã có
source tại `prisma/migrations/20260725000000_add_wedding_content`. Migration lời chúc
và RSVP nằm tại `prisma/migrations/20260726000000_add_wishes_and_rsvp`. Các lệnh chỉ
kiểm tra/generate, không kết nối database:

Migration preset giao diện/font nằm tại
`prisma/migrations/20260727000000_add_appearance_presets`. Metadata căn ảnh
(`positionX`, `positionY`, `zoom`) tiếp tục nằm trong JSON nên tương thích với
dữ liệu ảnh cũ và không cần cột riêng.

```bash
npx prisma validate
npx prisma generate
```

Áp dụng migration source đã review bằng:

```bash
npx prisma migrate deploy
```

Không dùng `prisma db push` cho production. Script `postinstall` chỉ generate
Prisma Client; nó không chạy migration.

## Kiểm tra source

```bash
npm run lint
npm run build
npx prisma validate
npx prisma generate
node --experimental-strip-types --test tests/*.test.mts
git diff --check
```

Build không truy vấn database. Truy vấn invitation chỉ chạy khi có request thật
tới `/thiep/[token]`.

## Checklist deploy Vercel

1. Tạo project Supabase và lấy Transaction pooler URL cùng Direct/Session URL.
2. Điền `.env` local, chạy và review migration ban đầu.
3. Kiểm tra một thiệp thật ở local.
4. Push source lên repository theo quy trình của gia đình.
5. Import repository vào Vercel, không cần Vercel CLI.
6. Thêm đủ bốn biến môi trường cho Production và Preview phù hợp.
7. Đặt `NEXT_PUBLIC_SITE_URL` thành domain HTTPS production.
8. Chạy `npx prisma migrate deploy` từ môi trường được ủy quyền trước khi nhận
   traffic production.
9. Deploy; Vercel sẽ chạy `postinstall` để generate Prisma Client.
10. Tạo một thiệp thử, kiểm tra link khách, 404 và log server không chứa dữ liệu
    người nhận.

## Nội dung cần gia đình cập nhật

Ngày giờ, ngày âm lịch, địa điểm, địa chỉ, Google Maps, tên phụ huynh, câu
chuyện và bốn ảnh cưới hiện vẫn là placeholder có chủ đích trong
`src/lib/wedding-data.ts` và `public/images`.

Nhạc dùng video YouTube do gia đình cung cấp; `public/music/wedding-theme.wav`
là fallback nội bộ. Cả hai trình phát mặc định ở 50% âm lượng.
