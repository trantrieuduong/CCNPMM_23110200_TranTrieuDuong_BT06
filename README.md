# SNEAKERLAB - MERN E-Commerce Project

SNEAKERLAB là một nền tảng thương mại điện tử chuyên biệt cho giày sneaker, được xây dựng trên kiến trúc MERN Stack (MongoDB, Express.js, React, Node.js) hiện đại. Dự án áp dụng mô hình Controller-Service-Repository (CSR) chuẩn hóa, đảm bảo tính mở rộng và dễ dàng bảo trì.

## Công nghệ sử dụng

- **Frontend**: ReactJS (Vite), Tailwind CSS, React Router DOM v6, Axios, Lucide React, Swiper.js.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Multer (Xử lý file), Slugify.
- **Xác thực**: JSON Web Token (Access & Refresh Token), Cookie-parser (HttpOnly Cookie), Bcryptjs.
- **Cấu trúc**: Controller - Service - Repository (CSR Architecture).

## Tính năng chính

### Phía Người dùng (User)
- **Hệ thống xác thực**: Đăng ký, đăng nhập tài khoản. Hỗ trợ tự động làm mới phiên đăng nhập thông qua cơ chế Silent Refresh bằng Refresh Token.
- **Trang cá nhân (Profile)**: Xem và cập nhật thông tin cá nhân bao gồm Họ tên và Email.
- **Trang chủ**: Thiết kế slider banner quảng bá trực quan, hiển thị các danh mục sản phẩm mới nhất, sản phẩm bán chạy và sản phẩm đang khuyến mãi.
- **Tìm kiếm và Lọc**: Thanh tìm kiếm thông minh kết hợp bộ lọc nâng cao theo danh mục, khoảng giá và trạng thái còn hàng/hết hàng.
- **Chi tiết sản phẩm**: Xem chi tiết thông số sản phẩm, trình chiếu gallery hình ảnh (sử dụng Swiper), chọn số lượng, chọn kích cỡ và gợi ý danh sách sản phẩm tương tự.
- **Giỏ hàng (Cart)**: Thêm sản phẩm vào giỏ hàng với số lượng tùy chọn, cập nhật số lượng trực tiếp trong giỏ hàng, xóa sản phẩm, tự động tính tổng tiền và đồng bộ giỏ hàng giữa Local Storage và Database sau khi đăng nhập.
- **Thanh toán (Checkout)**: Nhập thông tin giao hàng gồm Họ tên, Số điện thoại, Địa chỉ nhận hàng, ghi chú đơn hàng và chọn phương thức thanh toán thích hợp.
- **Lịch sử đơn hàng (Order History)**: Xem danh sách các đơn hàng đã mua kèm trạng thái xử lý thực tế.
- **Chi tiết đơn hàng (Order Detail)**: Xem thông tin chi tiết từng đơn hàng bao gồm mã đơn, ngày đặt, danh sách sản phẩm, giá tiền chi tiết, địa chỉ giao nhận và trạng thái đơn hàng.
- **Giao diện Responsive**: Thiết kế tối ưu và đồng bộ giao diện hiển thị trên tất cả thiết bị di động, tablet và desktop.

### Phía Quản trị (Admin)
- **Dashboard**: Trang tổng quan cung cấp các số liệu thống kê trực quan về doanh thu tháng, số lượng đơn hàng mới và số khách hàng mới đăng ký hệ thống.
- **Quản lý sản phẩm**: CRUD (Thêm, Xem, Sửa, Xóa) sản phẩm hoàn chỉnh, hỗ trợ tải lên và thay đổi tối đa 5 hình ảnh cho mỗi sản phẩm thông qua Multer.
- **Quản lý danh mục**: CRUD danh mục sản phẩm và tự động tạo đường dẫn thân thiện (slug) cho SEO.
- **Quản lý người dùng**: Xem danh sách tất cả người dùng trong hệ thống và kiểm soát trạng thái hoạt động (Kích hoạt/Khóa) của từng tài khoản.
- **Quản lý đơn hàng (Orders Management)**: Xem danh sách đơn hàng toàn hệ thống, lọc đơn hàng theo trạng thái và cập nhật trạng thái đơn hàng (Chờ xác nhận, Đang xử lý, Đang giao, Đã giao, Đã hủy).
- **Bảo mật hệ thống**: Các route admin được bảo vệ chặt chẽ bởi middleware phân quyền nâng cao (AdminOnly).

## Cấu trúc thư mục

```text
SNEAKERLAB/
├── backend/
│   ├── src/
│   │   ├── config/          # Cấu hình kết nối cơ sở dữ liệu MongoDB
│   │   ├── controllers/     # Tiếp nhận Request và trả về Response (chỉ gọi Service)
│   │   ├── services/        # Xử lý logic nghiệp vụ của hệ thống (chỉ gọi Repository)
│   │   ├── repositories/    # Tương tác trực tiếp với Database thông qua các Model Mongoose
│   │   ├── middleware/      # Bộ lọc bảo mật, phân quyền Admin và upload hình ảnh
│   │   ├── models/          # Định nghĩa cấu trúc Schema Mongoose (User, Product, Category, Cart, Order)
│   │   ├── routes/          # Định nghĩa các Endpoint API (Auth, Product, Category, Cart, Order, Admin)
│   │   ├── utils/           # Các hàm tiện ích hỗ trợ (JWT, Cookie, ApiError)
│   │   └── server.js        # File khởi động máy chủ Backend
│   └── uploads/             # Thư mục lưu trữ hình ảnh tải lên của sản phẩm
├── frontend/
│   ├── src/
│   │   ├── components/      # Các thành phần giao diện dùng chung (Navbar, Footer, ProductCard...)
│   │   ├── context/         # AuthContext và CartContext quản lý trạng thái đăng nhập, giỏ hàng toàn cục
│   │   ├── pages/           # Các trang giao diện cho User (Home, Search, ProductDetail, Cart, Checkout, Orders...) và Admin
│   │   ├── services/        # Cấu hình API (Axios Interceptor xử lý đính kèm Token và Refresh Token tự động)
│   │   └── App.jsx          # Cấu hình Routing và cấu trúc khung của ứng dụng
├── .gitignore               # Cấu hình loại bỏ các tệp không cần thiết khi đẩy lên Git
└── README.md
```

## Hướng dẫn cài đặt

1. **Cài đặt Backend**:
   ```bash
   cd backend
   npm install
   # Cấu hình file .env dựa trên các biến:
   # PORT, MONGO_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, FRONTEND_URL
   npm run dev
   ```

2. **Cài đặt Frontend**:
   ```bash
   cd frontend
   npm install
   # Cấu hình VITE_API_URL trong .env
   npm run dev
   ```