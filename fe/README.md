# 🎓 ATPS Frontend - Hệ Thống Quản Lý Đào Tạo An Toàn Thông tin

## 📖 Giới Thiệu

**ATPS Admin Dashboard** là hệ thống quản lý đào tạo an toàn thông tin được xây dựng bằng **React.js**. Dự án cung cấp giao diện quản lý hoàn chỉnh cho Admin, Giảng viên và Học viên.

### ✨ Tính Năng Chính

- 📚 **Quản lý lớp học**: CRUD lớp học, lịch học, phân công giảng viên
- 👥 **Quản lý học viên**: Ghi danh, theo dõi tiến độ
- 🧑‍🏫 **Quản lý giảng viên**: Phân công, đánh giá
- 📊 **Dashboard**: Thống kê tổng quan
- 🎨 **UI/UX hiện đại**: Responsive, gradient design

## 🚀 Quick Start

```bash
# Clone repository
git clone <repository-url>
cd ATPS_FE/fe

# Cài đặt dependencies
npm install

# Chạy development server
npm start

# Mở browser
http://localhost:3000
```

## 📁 Cấu Trúc Dự Án

```
fe/
├── public/                    # Static assets
├── src/
│   ├── apiServices/          # API services & mock data
│   ├── components/           # Reusable components
│   │   └── features/
│   │       └── class-management/
│   ├── pages/                # Page components
│   │   └── admin/
│   ├── layouts/              # Layout components
│   ├── routingLayer/         # Route configurations
│   ├── constants/            # Constants & config
│   ├── utils/                # Utility functions
│   ├── App.js               # Main app
│   └── index.js             # Entry point
├── database/                  # Database scripts (MỚI)
│   ├── UPDATE_SCHEMA_V2.sql  # Update database schema
│   ├── ROLLBACK_SCHEMA_V2.sql # Rollback script
│   └── HUONG_DAN_CAP_NHAT_DB.md # Hướng dẫn cập nhật
├── package.json
├── SETUP_GUIDE.md           # Hướng dẫn cài đặt chi tiết
├── HUONG_DAN_CLASS_MANAGEMENT.md  # Hướng dẫn module lớp học
├── PROJECT_SUMMARY.md       # Tổng kết dự án
└── README.md                # File này
```

## 🎯 Modules Đã Hoàn Thành

### ✅ Module Quản Lý Lớp Học (V2.0 Final)

- **Route**: `/admin/classes`
- **Chức năng**:
  - ✅ Xem danh sách lớp học (grid responsive)
  - ✅ Thêm lớp học mới (modal form với MUI Autocomplete)
  - ✅ Chỉnh sửa lớp học
  - ✅ Xóa lớp học
  - ✅ Navigate đến quản lý lịch học
  - ✅ Phân công giảng viên (Autocomplete search)
  - ✅ Quản lý học viên ghi danh
  - ✅ Tìm kiếm & lọc

### ✅ Module Quản Lý Lịch Học (MỚI - V2.0)

- **Route**: `/admin/classes/:id/schedule`
- **Chức năng**:
  - ✅ Calendar view trực quan
  - ✅ Thêm nhiều ca học cùng lúc
  - ✅ Thời lượng thông minh (giờ + phút)
  - ✅ Auto-calculate giờ kết thúc
  - ✅ Check trùng ca (validation)
  - ✅ Protection ngày đã qua (view-only)
  - ✅ Bulk add hàng loạt:
    - Hằng ngày (trừ cuối tuần)
    - Hằng tuần (chọn nhiều thứ)
  - ✅ Scroll to section (không dùng modal)

**Chi tiết**:

- [HUONG_DAN_SU_DUNG_LICH_HOC.md](./HUONG_DAN_SU_DUNG_LICH_HOC.md) - Hướng dẫn đầy đủ
- [QUICK_START_V2.md](./QUICK_START_V2.md) - Quick start
- [UPDATE_FINAL_V2.md](./UPDATE_FINAL_V2.md) - Cập nhật final

## 🛠️ Tech Stack

| Technology   | Version | Purpose     |
| ------------ | ------- | ----------- |
| React        | 19.2.0  | UI Library  |
| React Router | 6.20.0  | Routing     |
| Axios        | 1.6.0   | HTTP Client |
| CSS3         | -       | Styling     |

**Không sử dụng**:

- ❌ Redux/Context API (state management)
- ❌ UI Libraries (Material-UI, Ant Design)
- ❌ CSS Frameworks (Bootstrap, Tailwind)

## 📱 Responsive Design

- **Desktop** (>968px): Full sidebar, 3-column grid
- **Tablet** (768-968px): Collapsible sidebar, 2-column grid
- **Mobile** (<768px): Overlay sidebar, 1-column grid

## 💾 Data Storage

Hiện tại sử dụng **localStorage** cho mock data:

```javascript
localStorage.getItem("atps_classes");
localStorage.getItem("atps_instructors");
localStorage.getItem("atps_learners");
```

### Mock Data

- 3 lớp học mẫu
- 5 giảng viên
- 7 học viên

## 🔗 API Integration

### Cấu hình

Tạo file `.env`:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENABLE_MOCK_DATA=false
```

### 🗄️ Database Compatibility

**QUAN TRỌNG**: Frontend đã được thiết kế phù hợp với MySQL database schema. Tuy nhiên, cần cập nhật một số trường trong database để đảm bảo tương thích 100%.

#### 📋 Các thay đổi cần thiết:

1. **Bảng `course`**: Cần thêm 4 trường

   - `InstructorID` INT (FK) - Giảng viên phụ trách
   - `StartDate` DATE - Ngày bắt đầu lớp
   - `EndDate` DATE - Ngày kết thúc lớp
   - `MaxStudents` INT - Sĩ số tối đa

2. **Bảng `timeslot`**: Cần cho phép `LessonID` NULL
   - Sửa constraint từ NOT NULL → NULL
   - Thay đổi composite PK

#### 📝 Cách cập nhật:

```bash
# Backup database trước
mysqldump -u root -p atps > backup_atps.sql

# Chạy script cập nhật
mysql -u root -p atps < database/UPDATE_SCHEMA_V2.sql

# Kiểm tra kết quả
mysql -u root -p atps
DESC course;
DESC timeslot;
```

#### 📚 Tài liệu chi tiết:

- **`DB_COMPATIBILITY_REPORT.md`** - Báo cáo đầy đủ về các vấn đề và giải pháp
- **`database/UPDATE_SCHEMA_V2.sql`** - Script cập nhật database
- **`database/ROLLBACK_SCHEMA_V2.sql`** - Script hoàn tác nếu cần
- **`database/HUONG_DAN_CAP_NHAT_DB.md`** - Hướng dẫn từng bước bằng tiếng Việt

⚠️ **Lưu ý**: Đọc kỹ `DB_COMPATIBILITY_REPORT.md` trước khi thực hiện!

---

### API Endpoints Expected

```
GET    /api/classes              # Danh sách lớp học
GET    /api/classes/:id          # Chi tiết lớp
POST   /api/classes              # Tạo mới
PUT    /api/classes/:id          # Cập nhật
DELETE /api/classes/:id          # Xóa
GET    /api/instructors          # Danh sách GV
GET    /api/learners             # Danh sách HV
```

## 📊 Project Status

| Feature            | Status | Progress |
| ------------------ | ------ | -------- |
| Quản lý lớp học    | ✅     | 100%     |
| Quản lý khóa học   | 🚧     | 0%       |
| Quản lý giảng viên | 🚧     | 0%       |
| Quản lý học viên   | 🚧     | 0%       |
| Authentication     | 🚧     | 0%       |
| Dashboard          | 🚧     | 20%      |

Legend: ✅ Done | 🚧 In Progress | ⏳ Planned

## 🎨 Design Principles

### Color Palette

- **Primary**: `#667eea` → `#764ba2` (Gradient)
- **Success**: `#28a745`
- **Warning**: `#ffc107`
- **Danger**: `#dc3545`

### Typography

- Font: System fonts
- Sizes: 12px - 32px
- Weights: 400, 500, 600, 700

### Spacing

- Base unit: 4px
- Scale: 8px, 12px, 16px, 20px, 24px

## 🐛 Troubleshooting

### Port đã được sử dụng

```bash
# Kill process trên port 3000
npx kill-port 3000
```

### Clear cache & reinstall

```bash
rm -rf node_modules package-lock.json
npm install
```

### Reset localStorage

```javascript
// Mở Console (F12)
localStorage.clear();
location.reload();
```

## 📚 Documentation

### 📘 Hướng dẫn chung

- 📖 [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Hướng dẫn cài đặt chi tiết
- 📖 [QUICK_START_V2.md](./QUICK_START_V2.md) - Bắt đầu nhanh
- 📖 [TONG_KET_HOAN_CHINH.md](./TONG_KET_HOAN_CHINH.md) - Tổng kết hoàn chỉnh V2.0

### 📗 Module quản lý lớp học & lịch học

- 📖 [HUONG_DAN_CLASS_MANAGEMENT.md](./HUONG_DAN_CLASS_MANAGEMENT.md) - Module quản lý lớp học
- 📖 [HUONG_DAN_SU_DUNG_LICH_HOC.md](./HUONG_DAN_SU_DUNG_LICH_HOC.md) - Hướng dẫn quản lý lịch học (user)
- 📖 [HUONG_DAN_LICH_HOC_V2.md](./HUONG_DAN_LICH_HOC_V2.md) - Technical guide lịch học
- 📖 [CHANGELOG_SCHEDULE_UPDATE.md](./CHANGELOG_SCHEDULE_UPDATE.md) - Changelog updates

### 🗄️ Database

- 📖 [DB_COMPATIBILITY_REPORT.md](./DB_COMPATIBILITY_REPORT.md) - Báo cáo tương thích database ⚠️ **ĐỌC ĐẦU TIÊN**
- 📖 [database/HUONG_DAN_CAP_NHAT_DB.md](./database/HUONG_DAN_CAP_NHAT_DB.md) - Hướng dẫn cập nhật DB
- 🗃️ [database/UPDATE_SCHEMA_V2.sql](./database/UPDATE_SCHEMA_V2.sql) - Script cập nhật
- 🗃️ [database/ROLLBACK_SCHEMA_V2.sql](./database/ROLLBACK_SCHEMA_V2.sql) - Script rollback

## 🧪 Testing

```bash
# Run tests
npm test

# Coverage
npm test -- --coverage
```

## 📦 Build & Deploy

```bash
# Build production
npm run build

# Output folder
ls build/
```

### Deploy Options

- **Netlify**: `netlify deploy --prod`
- **Vercel**: `vercel --prod`
- **GitHub Pages**: Configure in `package.json`

## 🤝 Contributing

1. Fork repository
2. Create branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📝 Coding Standards

- ✅ Functional components với hooks
- ✅ Arrow functions
- ✅ Destructuring props
- ✅ PropTypes hoặc TypeScript (future)
- ✅ Meaningful variable names
- ✅ Comments bằng tiếng Việt

## 🔐 Security

- 🔒 XSS protection (sanitize inputs)
- 🔒 CSRF tokens (backend)
- 🔒 HTTPS only in production
- 🔒 Environment variables cho sensitive data

## 🌐 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ⚠️ IE11 (not tested)

## 📞 Support

- **Email**: support@atps.edu.vn
- **Issues**: [GitHub Issues]
- **Documentation**: [Wiki]

## 📄 License

Copyright © 2025 ATPS Team. All rights reserved.

---

## 🎯 Next Steps

### Immediate

- [ ] Cài đặt dependencies: `npm install`
- [ ] Chạy project: `npm start`
- [ ] Test module quản lý lớp học
- [ ] Đọc documentation

### Short Term

- [ ] Kết nối backend API
- [ ] Implement authentication
- [ ] Thêm module quản lý khóa học
- [ ] Dashboard với charts

### Long Term

- [ ] TypeScript migration
- [ ] Unit tests (80% coverage)
- [ ] E2E tests với Cypress
- [ ] PWA support
- [ ] Dark mode

## 🎓 Learn More

- [React Documentation](https://react.dev)
- [React Router](https://reactrouter.com)
- [Axios](https://axios-http.com)

---

**Version**: 1.0.0  
**Last Updated**: 15/10/2025  
**Status**: ✅ Production Ready (Frontend)

**Built with ❤️ by ATPS Development Team**
