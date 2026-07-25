# Thiệp cưới Vũ Bình & Thành Long

Website thiệp cưới dành cho một đám cưới gia đình khoảng 50–100 khách. Trang
chính là thiệp mẫu hoàn chỉnh và có form để gia đình tạo liên kết cá nhân
`/thiep/[token]`. Trang khách giữ trọn trải nghiệm cover, animation, nhạc, album
và địa điểm nhưng ở chế độ chỉ đọc.

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
npx prisma migrate dev --name init_invitation
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

Không commit `.env`. File `.env.example` chỉ chứa tên biến và giá trị mẫu.

## Luồng tạo thiệp

1. Gia đình mở trang `/`, đi đến khu vực “Tạo thiệp cá nhân”.
2. Nhập nội dung người được mời, số người tùy chọn, lời nhắn tùy chọn và mã tạo
   thiệp.
3. Form gọi `POST /api/invitations`.
4. Server dùng Zod kiểm tra body, so sánh mã tạo thiệp, sinh token 192-bit bằng
   Node.js `crypto` và lưu một bản ghi `Invitation`.
5. Giao diện trả về link thật, cho phép sao chép hoặc mở ngay.
6. `/thiep/[token]` đọc đúng một bản ghi bằng Prisma và render thiệp chỉ đọc.

Mã tạo thiệp không được lưu trong database, URL, localStorage hoặc response.

## Routes

- `/`: thiệp mẫu hoàn chỉnh + form tạo thiệp.
- `POST /api/invitations`: endpoint duy nhất để tạo thiệp.
- `/thiep/[token]`: thiệp cá nhân chỉ đọc, render động.
- Token sai định dạng hoặc không tồn tại trả về trang 404.

Không có endpoint liệt kê, chỉnh sửa hoặc xóa invitation.

## Prisma

Schema nằm tại `prisma/schema.prisma`. Các lệnh chỉ kiểm tra/generate, không
kết nối database:

```bash
npx prisma validate
npx prisma generate
```

Lệnh tạo migration ban đầu cần người vận hành tự chạy sau khi đã điền URL
Supabase thật:

```bash
npx prisma migrate dev --name init_invitation
```

Với production, chỉ chạy migration đã được review:

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
là fallback nội bộ nếu trình phát ngoài không khả dụng.
