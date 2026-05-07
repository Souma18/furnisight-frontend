<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'
</script>

<template>
  <footer class="app-footer">
    <div class="app-footer-inner">
      <div class="app-footer-top">
        <div class="brand-block">
          <a href="/" class="brand-link">
            <span class="brand-icon">🪺</span>
            <span class="brand">LUXNEST</span>
          </a>
          <p class="desc">
            Nen tang noi that thong minh dau tien tai Viet Nam ung dung AI va truc quan 3D de giup ban
            thiet ke khong gian song ly tuong.
          </p>
          <div class="socials">
            <a href="#" aria-label="Facebook"><AppIcon name="facebook" :size="14" /></a>
            <a href="#" aria-label="Instagram"><AppIcon name="instagram" :size="14" /></a>
            <a href="#" aria-label="YouTube"><AppIcon name="youtube" :size="14" /></a>
            <a href="#" aria-label="Map"><AppIcon name="mapPin" :size="14" /></a>
          </div>
        </div>
        <div class="col">
          <h4>San pham</h4>
          <a href="/products">Ghe van phong</a>
          <a href="/products">Giuong ngu</a>
          <a href="/products">Sofa va ghe sofa</a>
          <a href="/products">Ban an</a>
          <a href="/products">Ke va tu</a>
          <a href="/products">Den trang tri</a>
        </div>
        <div class="col">
          <h4>Tinh nang</h4>
          <a href="/room3d">Truc quan 3D</a>
          <a href="/room3d">AI goi y noi that</a>
          <a href="/">Du an cua toi</a>
          <a href="/">Kho mau phong</a>
          <a href="/">Tu van thiet ke</a>
        </div>
        <div class="col">
          <h4>Ho tro</h4>
          <a href="/">Lien he</a>
          <a href="/">Chinh sach giao hang</a>
          <a href="/">Doi tra va Hoan tien</a>
          <a href="/">Bao hanh san pham</a>
          <a href="/">Cau hoi thuong gap</a>
        </div>
      </div>
      <div class="app-footer-bottom">
        <span>© 2026 LUXNEST. All rights reserved.</span>
        <div class="legal-links">
          <a href="/">Dieu khoan dich vu</a>
          <a href="/">Chinh sach bao mat</a>
          <a href="/">Cookie</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: #12202e;
  color: rgba(255, 255, 255, 0.72);
  padding: 2.5rem 1.25rem 1.25rem;
}

.app-footer-inner {
  max-width: 1300px;
  margin: 0 auto;
}

.app-footer-top {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1fr;
  gap: 2rem;
  padding-bottom: 1.4rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.brand-link {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
}

.brand-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e5b84a, #c9922a);
}

.brand {
  margin: 0;
  font-size: 1.1rem;
  color: #fff;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.desc {
  margin: 0;
  max-width: 320px;
  line-height: 1.7;
  font-size: 0.88rem;
}

.socials {
  margin-top: 1rem;
  display: inline-flex;
  gap: 0.5rem;
}

.socials a {
  width: 2rem;
  height: 2rem;
  border-radius: 0.45rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.68);
  background: rgba(255, 255, 255, 0.1);
  font-size: 0.78rem;
}

.socials a:hover {
  background: #c9922a;
  color: #12202e;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.col h4 {
  margin: 0 0 0.45rem;
  color: #fff;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.col a {
  color: rgba(255, 255, 255, 0.62);
  text-decoration: none;
  font-size: 0.88rem;
}

.col a:hover {
  color: #e5b84a;
}

.app-footer-bottom {
  padding-top: 0.9rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.legal-links {
  display: inline-flex;
  gap: 1rem;
}

.legal-links a {
  color: rgba(255, 255, 255, 0.4);
  text-decoration: none;
}

.legal-links a:hover {
  color: rgba(255, 255, 255, 0.68);
}

@media (max-width: 900px) {
  .app-footer-top {
    grid-template-columns: 1fr;
  }

  .app-footer-bottom {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
