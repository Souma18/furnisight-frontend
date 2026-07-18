# Stage 1: Build the Vue app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the project
COPY . .

# Build the project (output will be in the 'dist' folder)
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Xóa cấu hình mặc định của Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copy kết quả build từ stage 1 sang thư mục html của Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
