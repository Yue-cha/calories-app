# CaloTrack - Ứng Dụng Quản Lý Calo & Dinh Dưỡng Cá Nhân 🥗

Ứng dụng theo dõi năng lượng và dinh dưỡng cá nhân được xây dựng với hệ thống xác thực người dùng, hồ sơ thể trạng sinh trắc học, tính toán năng lượng chuẩn khoa học (BMR/TDEE) và nhật ký nhập calo thủ công hàng ngày.

---

## 🌟 Các Tính Năng Nổi Bật

### 1. Hệ thống Tài khoản & Xác thực Hồ sơ Sức khỏe
- **Bảo mật và cá nhân hóa**: Yêu cầu người dùng đăng nhập trước khi truy cập các tính năng chính.
- **Xác thực hồ sơ đã có**: Nếu người dùng đã có tài khoản, hệ thống tự động tải toàn bộ hồ sơ thể trạng và lịch sử bữa ăn trước đó.
- **Khởi tạo hồ sơ mới**: Hỗ trợ quy trình đăng ký 2 bước trực quan:
  - *Bước 1*: Thông tin tài khoản (Tên đăng nhập, Mật khẩu, Họ và tên).
  - *Bước 2*: Thiết lập hồ sơ thể trạng: Giới tính, Tuổi, Chiều cao, Cân nặng hiện tại, Cân nặng mục tiêu, Mức độ vận động (từ ít vận động đến rất năng động), Mục tiêu (giảm cân, duy trì, tăng cân).
- **Xem trước tức thì**: Hiển thị ngay chỉ số BMR và mục tiêu calo dự kiến ngay trong quá trình đăng ký.

### 2. Tính toán Calories Dựa Trên Chỉ Số Cơ Thể (BMR & TDEE)
- **Công thức chuẩn khoa học Mifflin - St Jeor**:
  - Nam: `10 * cân_nặng + 6.25 * chiều_cao - 5 * tuổi + 5`
  - Nữ: `10 * cân_nặng + 6.25 * chiều_cao - 5 * tuổi - 161`
- **TDEE (Total Daily Energy Expenditure)**: Năng lượng tiêu hao mỗi ngày dựa theo hệ số vận động thể chất ($1.2 \rightarrow 1.9$).
- **Mục tiêu Calo thích ứng**: Tự động tính mức thâm hụt (Deficit) hoặc thặng dư (Surplus) theo mục tiêu cân nặng:
  - Giảm cân nhanh / an toàn ($-500$ hoặc $-300$ kcal).
  - Duy trì dáng ($0$ kcal).
  - Tăng cân / tăng cơ ($+300$ hoặc $+500$ kcal).
- **Phân bổ Dinh dưỡng Đa lượng (Macronutrients)**: Tính chính xác lượng Đạm (Protein), Tinh bột (Carbohydrates), Chất béo (Fat) và lượng nước khuyến nghị (Lít/ngày).
- **Công cụ mô phỏng "What-If"**: Thử nghiệm thay đổi cân nặng, chiều cao, bài tập và áp dụng trực tiếp vào hồ sơ cá nhân chỉ với 1 click.

### 3. Nhập Thủ Công Lượng Calo & Theo Dõi Dinh Dưỡng Còn Lại
- **Ghi nhận bữa ăn theo phân loại**: Bữa sáng, Bữa trưa, Bữa tối, Bữa phụ/ăn vặt.
- **Tính toán thời gian thực**:
  $$\text{Calo còn lại cần nạp} = \text{Mục tiêu Calo} - \text{Tổng Calo đã nạp hôm nay}$$
- **Trực quan hóa tiến độ**: Thanh tiến trình thể hiện % mục tiêu đã đạt, cảnh báo màu sắc khi nạp thiếu hoặc vượt ngưỡng calo trong ngày.
- **Gợi ý món ăn Việt Nam thông dụng**: Tích hợp sẵn danh mục món ăn (Phở bò, Cơm tấm, Bún chả, Trứng, Ức gà, Bánh mì...) giúp người dùng tìm kiếm và nhập nhanh số calo cũng như macro mà không cần tra cứu bên ngoài.
- **Lịch sử theo ngày**: Dễ dàng chuyển đổi giữa các ngày (Hôm nay, hôm qua, ngày mai...) để xem lại lịch sử ăn uống.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Cơ sở dữ liệu**: SQLite3 (lưu trữ độc lập, bền vững tại `calories.db`).
- **Xác thực**: JSON Web Tokens (JWT), mã hóa mật khẩu với `bcryptjs`.

---

## 🚀 Hướng Dẫn Khởi Chạy

### 1. Cài đặt các thư viện
```bash
# Cài đặt server
cd server && npm install

# Cài đặt client
cd ../client && npm install
```

### 2. Khởi chạy toàn bộ hệ thống
Tại thư mục gốc của dự án:
```bash
node dev.js
# hoặc npm run dev
```

- **Giao diện Web (Client)**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

### 3. Kiểm thử tự động (Unit & E2E Tests)
```bash
npm test
```
