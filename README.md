# GoFlow Hà Nội

Hãy xây dựng Web hoàn chỉnh có tên "GoFlow Hà Nội" - Quản lý lịch trình thông minh tích hợp bản đồ đo kẹt xe thời gian thực (Real-time Live Traffic) có ĐẦY ĐỦ HỆ THỐNG TÀI KHOẢN NGƯỜI DÙNG & CÁ NHÂN HÓA.

1. BẢNG MÀU THIẾT KẾ (THEME XANH NGỌC - TRẮNG - BE NHẠT):

- Màu chủ đạo Xanh Ngọc (Emerald / Teal #0D9488 hoặc #0F766E): Dùng cho Navbar, thẻ chính, các nút bấm hành động (Primary buttons).

- Màu điểm nhấn (Mint / Teal sáng #14B8A6 hoặc #2DD4BF): Dùng cho các icon, hiệu ứng nổi bật.

- Màu nền web: Trắng hoặc Be rất nhạt (#F8FAFC / #F7F5F0) tạo cảm giác sáng sủa, công nghệ, dịu mắt.

- Màu cảnh báo kẹt xe: Đỏ cam (#E11D48), đường thoáng: Xanh lá (#10B981).

- Giao diện chuẩn Mobile-first, bo góc tròn hiện đại (rounded-2xl).

2. CẤU HÌNH API KEYS CHẠY THẬT (Lưu ngầm vào mã nguồn, TUYỆT ĐỐI KHÔNG hiển thị ô nhập key ra giao diện):

- TomTom API Key: gvmI8Uel6GuwZw2ot0aEiPPGYwEWxX1k

- Google Gemini API Key: AQ.Ab8RN6LxkwfY0sLILX2e8hhmYZWtJeGtnMkwGLm8m6CDaqVdOQ

3. HỆ THỐNG TÀI KHOẢN & CÁ NHÂN HÓA (MULTI-USER SYSTEM):

- Nút "Đăng nhập / Đăng ký" ở góc trên bên phải thanh Navbar.

- Hỗ trợ form Đăng ký / Đăng nhập bằng Email, và NÚT "ĐĂNG NHẬP NHANH BẢN DEMO" (để thuyết trình không cần gõ pass).

- CÁ NHÂN HÓA THEO TỪNG TÀI KHOẢN:

  + Mỗi người dùng có một Hồ sơ riêng lưu trữ: Tên, Nơi ở hiện tại (Số nhà tại HN), Phương tiện di chuyển ưa thích (Xe máy/Ô tô/Bus/Đi bộ), và Thời gian đệm cá nhân (Buffer time).

  + Lịch trình của từng người là RIÊNG BIỆT (Tài khoản nào đăng nhập thì chỉ thấy thời khóa biểu và lộ trình của riêng người đó).

  + Có nút "Đăng xuất" và chỉnh sửa Hồ sơ cá nhân.

4. XỬ LÝ NHẬP ĐỊA CHỈ & SỐ NHÀ CHÍNH XÁC:

- Cho phép người dùng nhập đầy đủ: Số nhà, ngõ, ngách, tên đường tại Hà Nội.

- QUY TẮC: Giữ nguyên vẹn văn bản số nhà mà người dùng đã gõ, KHÔNG tự ý ghi đè tên chung chung của bản đồ lên.

- Tích hợp TomTom Search API để tìm toạ độ GPS sát nhất với địa chỉ đó tại Hà Nội. Kèm nút "Lấy GPS hiện tại" và cho phép CHẠM/CLICK TRỰC TIẾP LÊN BẢN ĐỒ để ghim đúng nóc nhà mình.

- Tự động tính toán lại ngay lập tức khoảng cách (km), thời gian kẹt xe và giờ xuất phát khi đổi địa chỉ.

5. THẺ REALTIME & BẢN ĐỒ TRỰC QUAN (GHIM ĐẦU TRANG CHỦ):

- Hiển thị ca học/ca làm sắp tới của chính người dùng đó.

- BẢN ĐỒ TRỰC QUAN (Interactive Map):

  + Hiển thị bản đồ khu vực Hà Nội.

  + Vẽ tuyến đường đi (Route Polyline) từ vị trí số nhà của người dùng đến trường/chỗ làm.

  + Vệt Đỏ (đoạn kẹt xe ở HN) và Vệt Xanh (đoạn thông thoáng).

  + Có ghim A (Nhà) và ghim B (Điểm hẹn).

- BỘ CHỌN PHƯƠNG TIỆN (4 nút chuyển nhanh):

  + 🛵 Xe máy (Đệm gửi xe: 5 phút)

  + 🚗 Ô tô / Taxi (Đệm tìm bãi đỗ: 15 phút, tính thêm thời gian kẹt xe)

  + 🚇 Bus / Tàu điện trên cao (Đệm đi bộ & chờ tàu: 10 phút)

  + 🚶 Đi bộ

  -> Bấm đổi phương tiện: Tự động vẽ lại đường và tính lại giờ xuất phát theo số liệu giao thông thực tế của TomTom.

- Đồng hồ đếm lùi: "Bạn cần xuất phát sau: [XX] Phút" (Kèm giờ cần đi).

6. TRANG LỊCH TRÌNH - NẠP ĐA ĐỊNH DẠNG (ẢNH, EXCEL, CSV):

- Có nút "Tải Lên Thời Khóa Biểu", bấm vào mở Modal cho phép chọn 3 hình thức:

  + 📷 Tải Ảnh Chụp TKB: Gửi ngầm đến Gemini 1.5 Flash API để tự động bóc tách chữ trong ảnh thành lịch học cá nhân.

  + 📊 Tải File Excel (.xlsx, .xls) hoặc File CSV: Đọc bảng tính tự động trích xuất các cột môn học, phòng, giờ.

  + Có nút tải file mẫu Excel.

- Xem lịch trực quan theo ngày/tuần.

7. KẾ HOẠCH DI CHUYỂN & ĐÁNH GIÁ (FEEDBACK LOOP):

- Danh sách các chuyến đi trong ngày.

- Bấm vào từng ca -> Xem chi tiết lộ trình và đánh giá 1-5 sao sau chuyến đi.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://flowhanoi-navigator.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e067c981-f57f-420c-bf2f-8e6bea0916a7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
