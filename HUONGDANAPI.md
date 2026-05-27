# MessageService

Dịch vụ phía sau cho chat, hội thoại, ghi chú nội bộ, thông báo, khuyến mãi và đăng ký nhận tin.

## 1. Công nghệ đang dùng

- Spring Boot 4.0.5
- Java 17
- Spring Web MVC
- Spring Data JPA / Hibernate
- MySQL
- WebSocket + STOMP + SockJS
- Kafka
- Redis
- Spring Mail
- Lombok
- Jakarta Validation

## 2. Kiến trúc tổng quan

Service này đang dùng kiến trúc phân tầng:

- Tầng Controller: nhận REST request và WebSocket message
- Tầng Service: xử lý nghiệp vụ
- Tầng Repository: truy cập database qua Spring Data JPA
- Tầng Entity: ánh xạ bảng dữ liệu bằng JPA
- Tầng DTO: định nghĩa request/response
- Tầng Exception: custom exception và global handler

Hiện tại service chưa có auth/JWT nội bộ. Phần lớn các field định danh người dùng vẫn đang được client gửi lên.

## 3. Các service bên ngoài cần có

Để chạy đầy đủ, hệ thống cần các dịch vụ sau:

- MySQL database
- Kafka broker
- SMTP mail server
- Redis server

## 4. Biến môi trường

Tạo file `.env` ở thư mục gốc project.

```env
DATABASE_URL=jdbc:mysql://localhost:3307/message_service
DATABASE_USERNAME=root
DATABASE_PASSWORD=your_password

KAFKA_BOOTSTRAP_SERVERS=localhost:9092
KAFKA_CONSUMER_GROUP_ID=message-service-group

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_NAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

SERVER_PORT=8085
```

Ghi chú khi FE đang test chưa có gateway:

- `VITE_MESSAGE_SERVICE_PREFIX` để trống.
- FE gọi trực tiếp các path như `/conversation/create`, `/message`, `/notification` qua Vite proxy tới `localhost:8085`.
- WebSocket dev dùng `/ws` thay vì `/api/v1/furniro/message-service/ws`.

Ghi chú:

- `KAFKA_CONSUMER_GROUP_ID` là tên bạn tự đặt.
- Redis hiện đang dùng `localhost:6379` trong code, có thể cấu hình lại bằng biến môi trường.
- Application sẽ load `.env` thông qua `dotenv-java` khi khởi động.

## 5. Cách chạy local

### 5.1 Yêu cầu trước khi chạy

- JDK 17
- Maven Wrapper trong repo
- MySQL đang chạy
- Kafka broker đang chạy
- Redis đang chạy nếu dùng OTP/cache

### 5.2 Chạy ứng dụng

```bash
./mvnw spring-boot:run
```

Trên Windows PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```

### 5.3 Build project

```bash
./mvnw clean package -DskipTests
```

## 6. Sử dụng Docker

Repository đã có sẵn Dockerfile để build image cho MessageService.

### 6.1 Dockerfile đang làm gì

- Build Spring Boot application bằng Maven builder stage
- Extract layered JAR
- Tạo runtime image nhỏ hơn
- Expose port `8085`

### 6.2 Build Docker image

```bash
docker build -t message-service .
```

### 6.3 Run Docker image

```bash
docker run --rm -p 8085:8085 --env-file .env message-service
```

### 6.4 Có cần docker-compose không?

Không bắt buộc, nhưng rất nên dùng cho môi trường local.

Lý do:

- Service phụ thuộc vào MySQL
- Service phụ thuộc vào Kafka
- Service phụ thuộc vào Redis
- Service có gửi mail qua SMTP

Nếu không dùng `docker-compose`, bạn phải tự chạy các service phụ trợ riêng và cấu hình `.env` trỏ đúng host/port.

### 6.5 Docker Compose

Nếu muốn chạy toàn bộ stack bằng một lệnh, dùng file `docker-compose.yml` ở root project.

Compose hiện tại khởi động:

- MySQL
- Redis
- ZooKeeper
- Kafka
- MessageService

Chạy:

```bash
docker compose up --build
```

Dừng và xóa volume:

```bash
docker compose down -v
```

Đây là cách khởi chạy phù hợp nhất cho local vì app container cần dùng tên service nội bộ thay vì `localhost`.

## 7. Tài liệu API

Các REST API đang được expose theo các route dưới đây.

- Nếu chạy sau gateway, prefix từ OpenAPI là `/api/v1/furniro/message-service`.
- Nếu đang test local chưa có gateway, `VITE_MESSAGE_SERVICE_PREFIX` để trống và FE gọi trực tiếp các path như `/conversation/create`, `/message`, `/notification` qua Vite proxy.

### 7.1 Conversation APIs

#### POST /conversation/create

Tạo conversation và đồng thời tạo tin nhắn đầu tiên.

Request body:

```json
{
  "buyerId": 1001,
  "staffId": null,
  "message": "Xin chào, tôi cần hỗ trợ",
  "messageType": "TEXT",
  "channel": "SUPPORT",
  "fileId": null
}
```

Response mẫu:

```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "id": 1,
    "buyerId": 1001,
    "staffId": null,
    "channel": "SUPPORT",
    "status": "OPEN",
    "priority": "MEDIUM",
    "assignedAdminId": null,
    "lastMessageAt": "2026-05-27T10:00:00",
    "lastMessageContent": "Xin chào, tôi cần hỗ trợ",
    "createdAt": "2026-05-27T10:00:00",
    "updatedAt": "2026-05-27T10:00:00"
  }
}
```

Ghi chú cho FE:

- Dùng khi user nhắn tin lần đầu
- `staffId` có thể để `null` ở lần tạo đầu tiên
- `priority` mặc định là `MEDIUM`

#### GET /conversation/all/{userId}

Lấy danh sách conversation mà user đang tham gia với vai trò buyer hoặc staff.

#### GET /conversation/{id}

Lấy chi tiết một conversation theo id.

#### GET /conversation/channel/{channel}

Lấy toàn bộ conversation theo kênh.

Ví dụ các kênh:

- SUPPORT
- SALES
- TECHNICAL

#### GET /conversation/admin/inbox

Lấy danh sách inbox dành cho admin với các bộ lọc tùy chọn.

Query params hỗ trợ:

- `channel`: SUPPORT, SALES, TECHNICAL
- `status`: OPEN, ASSIGNED, IN_PROGRESS, WAITING_CUSTOMER, RESOLVED, CLOSED
- `priority`: LOW, MEDIUM, HIGH, URGENT
- `assignedAdminId`: id admin đang xử lý
- `unreadOnly`: true/false

Ví dụ:

```http
GET /conversation/admin/inbox?channel=SUPPORT&status=OPEN&priority=HIGH&unreadOnly=true
```

#### PATCH /conversation/{id}/assign/{adminId}

Gán conversation cho một admin.

#### PATCH /conversation/{id}/status/{status}

Cập nhật trạng thái hội thoại.

Ví dụ:

```http
PATCH /conversation/1/status/IN_PROGRESS
```

#### PATCH /conversation/{id}/priority/{priority}

Cập nhật mức ưu tiên của hội thoại.

Ví dụ:

```http
PATCH /conversation/1/priority/URGENT
```

#### PATCH /conversation/{id}/close

Đóng một conversation.

### 7.2 Message APIs

#### GET /message?conversationID={id}&page=0&size=20

Lấy danh sách message theo conversation với phân trang.

Mặc định backend chỉ trả message hiển thị cho user.

Nếu admin muốn xem cả ghi chú nội bộ thì gọi thêm:

```http
GET /message?conversationID=1&page=0&size=20&includeInternal=true
```

#### PATCH /message/{messageID}/read

Đánh dấu message là đã đọc.

#### POST /message/{conversationID}/internal-note

Tạo ghi chú nội bộ cho admin. Người dùng thường sẽ không nhìn thấy note này.

Request body:

```json
{
  "senderId": 5001,
  "content": "Khách đã gọi điện, hẹn phản hồi sau 30 phút",
  "messageType": "TEXT"
}
```

Ghi chú cho FE:

- Dùng cho ghi chú giữa các ca admin
- Note nội bộ sẽ được đánh dấu `isInternal = true`
- Socket nội bộ sẽ phát trên topic riêng: `/topic/conversation/{conversationId}/internal`

### 7.3 Notification APIs

#### GET /notification?receiverID={id}&page=0&size=10&sortBy=createdAt

Lấy danh sách notification của một user với phân trang.

#### PATCH /notification/{notificationID}/read

Đánh dấu notification là đã đọc.

### 7.4 Promotion APIs

#### POST /promotion/

Tạo promotion và gửi email khuyến mãi cho toàn bộ subscriber.

#### GET /promotion/all?page=0&size=10&sortBy=createdAt

Lấy danh sách promotion với phân trang.

#### PUT /promotion/{id}

Cập nhật promotion.

#### DELETE /promotion/{id}

Xóa promotion.

### 7.5 Subscription APIs

#### POST /subscribe

Tạo subscription và gửi email xác nhận đăng ký.

#### GET /subscribe/all?page=0&size=10&sortBy=subscribedAt

Lấy danh sách subscriber với phân trang.

#### DELETE /subscribe/{id}

Xóa subscriber.

## 8. Luồng tích hợp FE đề xuất

### 8.1 Luồng phía người dùng

1. Người dùng bấm vào icon chat ở góc màn hình.
2. FE kiểm tra conversation bằng `GET /conversation/all/{userId}`.
3. Nếu chưa có conversation thì tạo mới bằng `POST /conversation/create`.
4. FE lưu `conversationId` trả về để dùng cho các lần load tiếp theo.
5. FE gọi lịch sử tin nhắn bằng `GET /message?conversationID={conversationId}&page=0&size=20`.
6. FE kết nối WebSocket tới `/ws`.
7. FE subscribe topic `/topic/conversation/{conversationId}`.
8. Khi người dùng gửi tin nhắn mới, FE publish vào `/app/chat.sendMessage`.
9. Khi nhận message mới từ socket, FE append message vào UI ngay lập tức.

### 8.2 Luồng phía admin

1. Admin mở trang inbox.
2. FE lấy danh sách conversation theo kênh bằng `GET /conversation/admin/inbox` hoặc `GET /conversation/channel/SUPPORT`.
3. Khi admin chọn một conversation, FE gọi `GET /message?conversationID={conversationId}&page=0&size=20`.
4. FE subscribe topic `/topic/conversation/{conversationId}`.
5. Nếu admin muốn nhận xử lý riêng cuộc chat đó thì gọi `PATCH /conversation/{id}/assign/{adminId}`.
6. Admin gửi tin nhắn qua socket như user, nhưng `senderId` sẽ là id của admin.

### 8.3 Ghi chú nội bộ

- Admin gửi note qua `POST /message/{conversationID}/internal-note` hoặc socket với `isInternal=true`.
- FE admin muốn xem note nội bộ thì gọi `GET /message?conversationID={conversationId}&page=0&size=20&includeInternal=true`.
- Socket note nội bộ sẽ phát vào topic riêng `/topic/conversation/{conversationId}/internal`.

### 8.4 Giữ kết nối socket

- Backend hiện không cần API ping riêng.
- FE nên bật auto reconnect ở client STOMP/SockJS.
- Khi socket reconnect thì subscribe lại topic hiện tại.

## 9. WebSocket APIs

- Endpoint kết nối: `/ws`
- Destination để gửi chat: `/app/chat.sendMessage`
- Topic chat: `/topic/conversation/{conversationId}`
- Topic note nội bộ: `/topic/conversation/{conversationId}/internal`
- Topic notification: `/topic/notifications/{userID}`

## 10. Kafka topics đang dùng

### Topic tiêu thụ

- `auth.send.active`
- `auth.send.otp`
- `notification.created`

### Topic phát ra

- `upload.active`

## 11. Các bảng dữ liệu

Application đang dùng Hibernate `ddl-auto=update`, nên bảng sẽ được tạo hoặc cập nhật tự động từ entity.

Các bảng hiện có:

- `conversations`
- `messages`
- `notifications`
- `promotions`
- `subscription`

### Tóm tắt entity

- Conversation: buyer, staff, channel, status, priority, assigned admin, thông tin tin nhắn gần nhất
- Message: nội dung tin nhắn, sender, receiver, trạng thái đã đọc, cờ internal, khóa ngoại tới conversation
- Notification: dữ liệu thông báo và trạng thái đọc
- Promotion: thông tin khuyến mãi và trạng thái
- Subscription: dữ liệu subscriber theo email

## 12. Validation và xử lý lỗi

- Validation request dùng Jakarta Validation annotations
- Lỗi business được bọc bằng custom exception và trả về qua global exception handler
- Format response được chuẩn hóa qua `ApiType` và `ErrorType`

## 13. Ghi chú hiện trạng

Backend hiện tại đã đủ cho flow chat cơ bản và inbox admin nâng cấp:

- user mở chat box
- tạo conversation lần đầu
- gửi tin nhắn realtime
- admin vào inbox theo kênh
- lọc theo trạng thái/ưu tiên/chưa đọc
- ghi chú nội bộ cho admin
- load lại lịch sử tin nhắn
- đánh dấu message đã đọc

Nếu FE chỉ cần chạy MVP, có thể dùng ngay bộ API này.
