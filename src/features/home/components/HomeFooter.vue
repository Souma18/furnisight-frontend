<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'
</script>

<template>
  <footer id="footer" class="hn-footer">
    <div class="hn-footer-top">
      <div>
        <a class="hn-logo" href="#">
          <span class="hn-logo-icon">
            <AppIcon name="house" :size="18" />
          </span>
          <span class="hn-logo-text">FurniSight</span>
        </a>
        <p class="hn-footer-desc">
          Nền tảng nội thất thông minh ứng dụng AI và trực quan 3D để bạn thiết kế không gian sống.
        </p>
      </div>
      <div class="hn-footer-col">
        <h4>Sản phẩm</h4>
        <a href="#">Ghế văn phòng</a>
        <a href="#">Giường ngủ</a>
        <a href="#">Sofa</a>
      </div>
      <div class="hn-footer-col">
        <h4>Tính năng</h4>
        <a href="/room3d">Trực quan 3D</a>
        <a href="#">AI gợi ý nội thất</a>
        <a href="#">Kho mẫu phòng</a>
      </div>
    </div>
    <div class="hn-footer-bottom">© 2026 FurniSight. All rights reserved.</div>
  </footer>
</template>
