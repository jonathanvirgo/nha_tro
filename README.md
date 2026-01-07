# Nhà Trọ - Hệ thống Quản lý Nhà Trọ

Hệ thống quản lý nhà trọ toàn diện với Next.js 16, Prisma 7.2, và PostgreSQL (Supabase).

## 🚀 Công nghệ

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma 7.2 (với pg adapter)
- **Authentication**: JWT (Custom) / Supabase Auth
- **State Management**: Zustand
- **Form Validation**: Zod + React Hook Form
- **Payment**: Momo (coming soon)

## 📦 Cài đặt

### 1. Cài đặt dependencies

```bash
cd nhatro
pnpm install
```

### 2. Cấu hình Environment Variables

Copy file `.env.example` thành `.env` và cập nhật thông tin:

```bash
cp .env.example .env
```

Cập nhật các biến trong `.env`:

```env
# Prisma Database (Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE-ROLE-KEY]"

# JWT Secret
JWT_SECRET="your-secret-key"
```

### 3. Khởi tạo Database

```bash
# Tạo migration và áp dụng schema
pnpm db:push

# Hoặc tạo migration file
pnpm db:migrate

# Seed dữ liệu mẫu
pnpm db:seed
```

### 4. Chạy ứng dụng

```bash
# Development
pnpm dev

# Production
pnpm build
pnpm start
```

Ứng dụng sẽ chạy tại: http://localhost:3000

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập

### Users
- `GET /api/users/me` - Thông tin user hiện tại
- `PUT /api/users/me` - Cập nhật profile

### Motels
- `GET /api/motels` - Danh sách nhà trọ
- `POST /api/motels` - Tạo nhà trọ
- `GET /api/motels/:id` - Chi tiết nhà trọ
- `PUT /api/motels/:id` - Cập nhật nhà trọ
- `DELETE /api/motels/:id` - Xóa nhà trọ
- `GET /api/motels/:motelId/rooms` - Danh sách phòng
- `POST /api/motels/:motelId/rooms` - Tạo phòng
- `GET /api/motels/:motelId/services` - Danh sách dịch vụ
- `POST /api/motels/:motelId/services` - Tạo dịch vụ

### Rooms
- `GET /api/rooms/:id` - Chi tiết phòng
- `PUT /api/rooms/:id` - Cập nhật phòng
- `DELETE /api/rooms/:id` - Xóa phòng

### Contracts
- `GET /api/contracts` - Danh sách hợp đồng
- `POST /api/contracts` - Tạo hợp đồng

### Invoices
- `GET /api/invoices` - Danh sách hóa đơn
- `GET /api/invoices/:id` - Chi tiết hóa đơn
- `POST /api/invoices/:id` - Ghi nhận thanh toán
- `POST /api/invoices/generate` - Tạo hóa đơn tự động

### Appointments
- `GET /api/appointments` - Danh sách lịch hẹn
- `POST /api/appointments` - Đặt lịch xem phòng

### Maintenance
- `GET /api/maintenance-requests` - Danh sách yêu cầu sửa chữa
- `POST /api/maintenance-requests` - Tạo yêu cầu

### Notifications
- `GET /api/notifications` - Danh sách thông báo
- `PUT /api/notifications/:id` - Đánh dấu đã đọc
- `DELETE /api/notifications/:id` - Xóa thông báo

### Messages
- `GET /api/messages` - Danh sách hội thoại
- `POST /api/messages` - Gửi tin nhắn

### Search (Public)
- `GET /api/search/rooms` - Tìm phòng (30km radius)

### Utilities
- `GET /api/utilities` - Danh sách tiện ích

### Dashboard
- `GET /api/dashboard/stats` - Thống kê tổng quan

## 🗄️ Database Schema

Schema đầy đủ với 18 models:
- `User` - Người dùng
- `Motel` - Nhà trọ
- `Room` - Phòng trọ
- `Contract` - Hợp đồng
- `Invoice` - Hóa đơn
- `Payment` - Thanh toán
- `Appointment` - Lịch hẹn
- `MaintenanceRequest` - Yêu cầu sửa chữa
- `Review` - Đánh giá
- `Message` - Tin nhắn
- `Notification` - Thông báo
- ... và nhiều models khác

## 👥 Tài khoản Demo

Sau khi chạy `npm run db:seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nhatro.vn | Admin@123 |
| Landlord | landlord@nhatro.vn | Landlord@123 |
| Tenant | tenant@nhatro.vn | Tenant@123 |

## 📝 Scripts

```bash
npm run dev          # Chạy development server
npm run build        # Build production
npm run start        # Chạy production server
npm run lint         # Kiểm tra linting
npm run db:migrate   # Tạo và áp dụng migration
npm run db:push      # Push schema lên database
npm run db:studio    # Mở Prisma Studio
npm run db:seed      # Seed dữ liệu mẫu
npm run db:generate  # Generate Prisma Client
```

## 🔒 Phân quyền

| Role | Mô tả |
|------|-------|
| ADMIN | Quản trị viên hệ thống |
| LANDLORD | Chủ nhà trọ |
| STAFF | Nhân viên quản lý |
| TENANT | Người thuê |
| USER | Người dùng đăng ký |

## 📂 Cấu trúc thư mục

```
nhatro/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed data
├── src/
│   ├── app/
│   │   ├── api/         # API Routes
│   │   └── ...          # Pages
│   └── lib/
│       ├── prisma.ts    # Prisma client
│       ├── auth.ts      # Auth utilities
│       ├── validators.ts # Zod schemas
│       └── utils.ts     # Helper functions
├── .env.example
└── package.json
```

## 🚧 Roadmap

- [x] Phase 1: Project Setup & Database
- [x] Phase 2: Authentication API
- [x] Phase 3: Core Management APIs (partial)
- [x] Phase 4: Search API
- [ ] Phase 5: Appointments & Reservations
- [ ] Phase 6: Contracts & Billing
- [ ] Phase 7: Maintenance & Reviews
- [ ] Phase 8: Notifications & Messages
- [ ] Phase 9: Dashboard & Reports
- [ ] Frontend Migration from Vite

## 📄 License

MIT
