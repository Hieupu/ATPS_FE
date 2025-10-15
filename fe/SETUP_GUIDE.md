# 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án ATPS Frontend

## 📋 Yêu Cầu Hệ Thống

- **Node.js**: v16.0.0 trở lên
- **npm**: v8.0.0 trở lên (hoặc yarn)
- **Git**: Để clone repository

## 🛠️ Các Bước Cài Đặt

### Bước 1: Clone Repository

```bash
git clone <repository-url>
cd ATPS_FE/fe
```

### Bước 2: Cài Đặt Dependencies

```bash
npm install
```

Hoặc nếu dùng yarn:

```bash
yarn install
```

### Bước 3: Cấu Hình Environment

Tạo file `.env` từ template:

```bash
cp .env.example .env
```

Sửa file `.env` theo cấu hình của bạn:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENABLE_MOCK_DATA=true
```

### Bước 4: Chạy Development Server

```bash
npm start
```

Ứng dụng sẽ chạy tại: **http://localhost:3000**

## 📂 Cấu Trúc Dự Án

```
fe/
├── public/                    # Static files
│   ├── index.html
│   └── ...
│
├── src/
│   ├── apiServices/          # API services
│   │   ├── apiClient.js      # Axios instance
│   │   └── classService.js   # Class management API
│   │
│   ├── components/           # Reusable components
│   │   └── features/
│   │       └── class-management/
│   │
│   ├── pages/                # Page components
│   │   └── admin/
│   │       └── ClassManagementPage/
│   │
│   ├── layouts/              # Layout components
│   │   ├── AdminLayout.js
│   │   └── AdminLayout.css
│   │
│   ├── routingLayer/         # Route configurations
│   │   └── routes.js
│   │
│   ├── constants/            # Constants
│   │   └── config.js
│   │
│   ├── utils/                # Utility functions
│   │   └── validate.js
│   │
│   ├── App.js               # Main App component
│   ├── App.css              # Global styles
│   └── index.js             # Entry point
│
├── package.json              # Dependencies
├── .env.example             # Environment template
├── SETUP_GUIDE.md           # This file
└── HUONG_DAN_CLASS_MANAGEMENT.md  # Class management guide
```

## 🎯 Các Module Đã Triển Khai

### ✅ Module Quản Lý Lớp Học

**Route**: `/admin/classes`

**Chức năng**:

- Xem danh sách lớp học
- Thêm/Sửa/Xóa lớp học
- Quản lý lịch học
- Phân công giảng viên
- Quản lý học viên ghi danh

Xem chi tiết: [HUONG_DAN_CLASS_MANAGEMENT.md](./HUONG_DAN_CLASS_MANAGEMENT.md)

## 🎨 Tech Stack

- **React** v19.2.0 - UI Library
- **React Router** v6.20.0 - Routing
- **Axios** v1.6.0 - HTTP Client
- **CSS3** - Styling (Vanilla CSS, không dùng framework)

## 📱 Routes Hiện Có

### Admin Routes

| Route            | Component           | Mô Tả               |
| ---------------- | ------------------- | ------------------- |
| `/admin`         | AdminDashboard      | Dashboard tổng quan |
| `/admin/classes` | ClassManagementPage | Quản lý lớp học     |

_Các routes khác đang trong quá trình phát triển_

## 🔧 Scripts Có Sẵn

### Development

```bash
npm start          # Chạy development server
npm run build      # Build production
npm test           # Chạy tests
npm run eject      # Eject từ Create React App (cẩn thận!)
```

## 💾 Dữ Liệu Mock

Hiện tại sử dụng **localStorage** để lưu mock data:

- `atps_classes` - Danh sách lớp học
- `atps_instructors` - Danh sách giảng viên
- `atps_learners` - Danh sách học viên

### Reset Dữ Liệu

Mở Console (F12) và chạy:

```javascript
localStorage.clear();
location.reload();
```

## 🔗 Kết Nối Backend

### Cấu hình API URL

Trong file `.env`:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

### Cấu trúc API Expected

```
GET    /api/classes              # Lấy danh sách lớp học
GET    /api/classes/:id          # Lấy chi tiết lớp học
POST   /api/classes              # Tạo lớp học mới
PUT    /api/classes/:id          # Cập nhật lớp học
DELETE /api/classes/:id          # Xóa lớp học

GET    /api/instructors          # Lấy danh sách giảng viên
GET    /api/learners             # Lấy danh sách học viên
```

## 🐛 Troubleshooting

### Port 3000 đã được sử dụng

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Lỗi dependencies

```bash
rm -rf node_modules package-lock.json
npm install
```

### Clear cache

```bash
npm start -- --reset-cache
```

## 📊 Performance

### Build Size

Sau khi build, kiểm tra kích thước:

```bash
npm run build
```

### Optimization Tips

1. Lazy load components với `React.lazy()`
2. Memoize expensive computations với `useMemo`
3. Optimize re-renders với `React.memo`

## 🔐 Bảo Mật

### LocalStorage

- Token được lưu trong `localStorage.authToken`
- Tự động xóa khi 401 (Unauthorized)

### CORS

Backend cần cấu hình CORS cho phép origin: `http://localhost:3000`

## 🌐 Deployment

### Build Production

```bash
npm run build
```

Folder `build/` chứa production files.

### Deploy lên Server

#### Option 1: Static Hosting (Netlify, Vercel)

```bash
# Netlify
netlify deploy --prod

# Vercel
vercel --prod
```

#### Option 2: Docker

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npx", "serve", "-s", "build"]
```

## 📞 Support & Contact

- **Issue Tracker**: [GitHub Issues]
- **Documentation**: [Wiki]
- **Email**: support@atps.edu.vn

## 📝 Changelog

### Version 1.0.0 (15/10/2025)

- ✅ Khởi tạo dự án
- ✅ Tích hợp React Router
- ✅ Tạo AdminLayout với Sidebar
- ✅ Module Quản lý lớp học hoàn chỉnh
- ✅ Mock data với localStorage
- ✅ Responsive design

## 🎯 Roadmap

### Phase 1 (Current)

- [x] Quản lý lớp học

### Phase 2 (Next)

- [ ] Quản lý khóa học
- [ ] Quản lý giảng viên
- [ ] Quản lý học viên

### Phase 3 (Future)

- [ ] Hệ thống authentication
- [ ] Dashboard với charts
- [ ] Báo cáo và thống kê
- [ ] Notification system

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add some AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

## 📄 License

Copyright © 2025 ATPS Team. All rights reserved.

---

**Happy Coding! 🚀**

