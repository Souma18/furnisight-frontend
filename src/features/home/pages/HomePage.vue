<script setup>
import HomeHeroSection from '../components/HomeHeroSection.vue'
import HomeProcess3DSection from '../components/HomeProcess3DSection.vue'
import HomeFeaturesStripSection from '../components/HomeFeaturesStripSection.vue'
import HomeCategoriesSection from '../components/HomeCategoriesSection.vue'
import HomeCombosSection from '../components/HomeCombosSection.vue'
import HomeSharedProductsSection from '../components/HomeSharedProductsSection.vue'
import HomeTestimonialsSection from '../components/HomeTestimonialsSection.vue'
import HomeNewsletterSection from '../components/HomeNewsletterSection.vue'
import { useHomePage } from '../composables/useHomePage'
import {
  homeFeatures,
  homeHero,
} from '../composables/homeContent'

const {
  categories,
  combos,
  products,
  activeCategoryId,
  wishedProductIds,
  topReviews,
  comboBuyingId,
  comboMessage,
  buyCombo,
  toggleWish,
} = useHomePage()
</script>

<template>
  <div class="home-page">
    <HomeHeroSection :hero="homeHero" />
    <HomeFeaturesStripSection :items="homeFeatures" />
    <HomeCategoriesSection
      :categories="categories"
      :active-category-id="activeCategoryId"
      @select-category="activeCategoryId = $event"
    />
    <HomeCombosSection :combos="combos" :buying-id="comboBuyingId" @buy="buyCombo" />
    <p v-if="comboMessage" class="home-combo-message" role="status">{{ comboMessage }}</p>
    <HomeSharedProductsSection
      :products="products"
      :wished-product-ids="wishedProductIds"
      @toggle-wish="toggleWish"
    />
    <HomeProcess3DSection />
    <HomeNewsletterSection />
    <HomeTestimonialsSection :testimonials="topReviews" />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700&display=swap');

.home-page { background: #faf6f0; color: #1a1a1a; }
.home-page { font-family: var(--sans); }
.hero { position: relative; overflow: hidden; background: #12202e; min-height: 88vh; display: flex; align-items: center; }
.hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 60% 70% at 70% 40%, rgba(201,146,42,.13) 0%, transparent 60%), radial-gradient(ellipse 40% 50% at 20% 80%, rgba(28,49,72,.8) 0%, transparent 60%); }
.orb { position: absolute; border-radius: 50%; filter: blur(60px); opacity: .18; animation: floatOrb 8s ease-in-out infinite alternate; }
.orb1 { width: 350px; height: 350px; background: #c9922a; top: -80px; right: 15%; animation-delay: 0s; }
.orb2 { width: 250px; height: 250px; background: #3a7bd5; bottom: 10%; left: 5%; animation-delay: -3s; }
.orb3 { width: 180px; height: 180px; background: #e5b84a; top: 40%; right: 5%; animation-delay: -5s; }
@keyframes floatOrb { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(20px, -30px) scale(1.1); } }
.hero-content { position: relative; z-index: 2; max-width: 1300px; margin: 0 auto; width: 100%; padding: 80px 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
.hero-tag { display: inline-flex; background: rgba(201,146,42,.15); border: 1px solid rgba(201,146,42,.3); color: #e5b84a; font-size: 12px; padding: 6px 14px; border-radius: 20px; margin-bottom: 24px; text-transform: uppercase; }
.hero-title { font-family: var(--sans); font-size: 62px; line-height: 1.1; font-weight: 300; color: #fff; margin-bottom: 20px; }
.hero-title em { color: #e5b84a; }
.hero-sub { color: rgba(255,255,255,.6); font-size: 15px; line-height: 1.7; margin-bottom: 36px; max-width: 440px; }
.hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
.btn-primary { background: linear-gradient(135deg, #e5b84a, #c9922a); color: #12202e; font-size: 14px; font-weight: 600; padding: 14px 28px; border-radius: 30px; text-decoration: none; }
.btn-outline { border: 1.5px solid rgba(255,255,255,.25); color: rgba(255,255,255,.85); font-size: 14px; padding: 14px 28px; border-radius: 30px; text-decoration: none; }
.preview-card { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12); border-radius: 24px; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,.5); }
.preview-card-header { padding: 14px 20px; background: rgba(255,255,255,.05); border-bottom: 1px solid rgba(255,255,255,.08); display: flex; align-items: center; gap: 10px; }
.preview-dots { display: flex; gap: 6px; }
.preview-dots span { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,.2); }
.preview-dots span:first-child { background: #ff6058; }
.preview-dots span:nth-child(2) { background: #ffbd2e; }
.preview-dots span:nth-child(3) { background: #28ca41; }
.preview-label { font-size: 11px; color: rgba(255,255,255,.4); margin-left: 6px; font-family: monospace; }
.ai-badge { margin-left: auto; background: linear-gradient(135deg, #7c3aed, #a855f7); color: #fff; font-size: 10px; font-weight: 600; padding: 3px 10px; border-radius: 10px; }
.preview-scene { position: relative; height: 300px; background: linear-gradient(180deg, #1a2535 0%, #0e1822 100%); overflow: hidden; }
.grid-floor { position: absolute; bottom: 0; left: -30%; width: 160%; height: 200px; transform: perspective(400px) rotateX(65deg); transform-origin: bottom center; background-image: linear-gradient(rgba(201,146,42,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(201,146,42,.2) 1px, transparent 1px); background-size: 40px 40px; animation: gridMove 4s linear infinite; }
@keyframes gridMove { from { background-position: 0 0; } to { background-position: 0 40px; } }
.cube-wrap { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -60%); }
.cube { width: 70px; height: 70px; position: relative; transform-style: preserve-3d; animation: rotateCube 6s linear infinite; transform: rotateX(-20deg) rotateY(30deg); }
@keyframes rotateCube { from { transform: rotateX(-20deg) rotateY(0deg); } to { transform: rotateX(-20deg) rotateY(360deg); } }
.face { position: absolute; width: 70px; height: 70px; border: 1.5px solid rgba(201,146,42,.5); }
.front { background: rgba(201,146,42,.12); transform: translateZ(35px); }
.back { background: rgba(201,146,42,.06); transform: rotateY(180deg) translateZ(35px); }
.left { background: rgba(201,146,42,.08); transform: rotateY(-90deg) translateZ(35px); }
.right { background: rgba(201,146,42,.08); transform: rotateY(90deg) translateZ(35px); }
.top { background: rgba(201,146,42,.15); transform: rotateX(90deg) translateZ(35px); }
.bottom { background: rgba(201,146,42,.04); transform: rotateX(-90deg) translateZ(35px); }
.scan-line { position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #e5b84a, transparent); animation: scan 3s ease-in-out infinite; }
@keyframes scan { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
.preview-footer { padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.preview-text { font-size: 13px; color: rgba(255,255,255,.55); }
.preview-start { background: #c9922a; color: #12202e; font-size: 12px; font-weight: 600; padding: 8px 16px; border-radius: 20px; text-decoration: none; }
.features-strip { background: #1c3148; padding: 28px 60px; display: flex; align-items: center; justify-content: center; gap: 60px; border-top: 1px solid rgba(201,146,42,.2); border-bottom: 1px solid rgba(201,146,42,.2); }
.feat-icon { width: 42px; height: 42px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #e5b84a; background: rgba(201,146,42,.14); flex: 0 0 auto; }
.process-3d-wrap { background: #12202e; border-radius: 24px; overflow: hidden; display: grid; grid-template-columns: 1fr 1fr; min-height: 340px; }
.process-3d-left { padding: 48px; color: #fff; }
.process-3d-left .section-title.process-title { color: #fff; margin-bottom: 10px; }
.process-title em { color: #e5b84a; }
.process-sub { color: rgba(255,255,255,.65); margin-bottom: 22px; line-height: 1.7; }
.process-steps { display: grid; gap: 10px; }
.process-step { display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,.82); font-size: 14px; }
.process-step span { width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; background: rgba(201,146,42,.25); border: 1px solid #c9922a; color: #f0cc81; font-size: 12px; font-weight: 700; }
.process-actions { margin-top: 26px; display: flex; gap: 12px; }
.process-3d-right { padding: 36px; display: flex; align-items: center; justify-content: center; }
.process-preview { width: 100%; max-width: 340px; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.06); }
.process-preview-body { height: 200px; background: linear-gradient(180deg, #1a2535, #0f1b27); position: relative; display: flex; align-items: center; justify-content: center; }
.process-preview-grid { position: absolute; bottom: 0; left: -20%; width: 140%; height: 120px; transform: perspective(300px) rotateX(60deg); transform-origin: bottom; background-image: linear-gradient(rgba(201,146,42,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(201,146,42,.25) 1px, transparent 1px); background-size: 30px 30px; }
.process-cube-wrap { position: relative; z-index: 2; }
.process-cube { width: 60px; height: 60px; position: relative; transform-style: preserve-3d; animation: rotateCube 6s linear infinite; transform: rotateX(-20deg) rotateY(30deg); }
.process-face { position: absolute; width: 60px; height: 60px; border: 1.5px solid rgba(201,146,42,.55); }
.process-front { background: rgba(201,146,42,.15); transform: translateZ(30px); }
.process-back { background: rgba(201,146,42,.06); transform: rotateY(180deg) translateZ(30px); }
.process-left { background: rgba(201,146,42,.09); transform: rotateY(-90deg) translateZ(30px); }
.process-right { background: rgba(201,146,42,.09); transform: rotateY(90deg) translateZ(30px); }
.process-top { background: rgba(201,146,42,.18); transform: rotateX(90deg) translateZ(30px); }
.process-bottom { background: rgba(201,146,42,.04); transform: rotateX(-90deg) translateZ(30px); }
.process-progress { height: 3px; background: rgba(201,146,42,.3); }
.process-progress span { display: block; height: 100%; width: 65%; background: #e5b84a; animation: progressAnim 3s ease-in-out infinite alternate; }
.process-info { padding: 12px 14px; display: grid; gap: 8px; }
.process-info div { display: flex; justify-content: space-between; gap: 10px; font-size: 12px; }
.process-info span { color: rgba(255,255,255,.58); }
.process-info strong { color: rgba(255,255,255,.86); font-weight: 500; }
.process-info .highlight { color: #e5b84a; }
@keyframes progressAnim { 0% { width: 20%; } 100% { width: 90%; } }
.feat-item { display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,.7); }
.feat-text strong { color: #fff; display: block; font-size: 14px; }
.home-page section { padding: 80px 60px; max-width: 1300px; margin: 0 auto; }
.section-head { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 44px; }
.section-label { font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: #c9922a; font-weight: 600; margin-bottom: 10px; }
.section-title { font-size: 42px; font-weight: 300; line-height: 1.2; color: #1a1a1a; margin-bottom: 14px; }
.section-title em { color: #c9922a; }
.categories-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; }
.cat-card { background: #fff; border-radius: 16px; padding: 24px 16px; border: 2px solid transparent; box-shadow: 0 2px 12px rgba(0,0,0,.05); cursor: pointer; }
.cat-card.active { border-color: #c9922a; box-shadow: 0 8px 30px rgba(201,146,42,.2); transform: translateY(-4px); }
.cat-icon { min-height: 40px; margin-bottom: 10px; display: inline-flex; align-items: center; justify-content: center; color: #c9922a; }
.cat-name { font-size: 13px; font-weight: 500; }
.cat-count { font-size: 11px; color: #888; margin-top: 3px; }
.home-combo-message { max-width: 1180px; margin: -48px auto 48px; padding: 0 24px; color: #a13a2d; font-size: 13px; text-align: center; }
.products-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 22px; }
.product-card { text-decoration: none; color: inherit; display: block; background: #fff; border-radius: 18px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,.06); position: relative; }
.product-img { height: 200px; background: #f0e9dd; position: relative; overflow: hidden; }
.product-img img { width: 100%; height: 100%; object-fit: cover; }
.product-img-disabled { width: 100%; height: 100%; object-fit: cover; opacity: .92; }
.product-fallback { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 64px; }
.product-tag { position: absolute; top: 12px; left: 12px; font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 6px; color: #fff; }
.tag-hot { background: #e64444; } .tag-new { background: #12202e; } .tag-ai { background: #7c3aed; } .tag-sale { background: #c9922a; color: #12202e; }
.product-wish { position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,.85); border: none; cursor: pointer; }
.product-body { padding: 16px; }
.product-cat { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
.product-name-link { text-decoration: none; color: inherit; }
.product-name { font-size: 15px; font-weight: 500; margin-bottom: 10px; line-height: 1.35; }
.product-name-disabled { color: #444; cursor: default; }
.product-footer { display: flex; align-items: center; justify-content: space-between; }
.product-price { font-size: 16px; font-weight: 600; color: #c9922a; }
.product-sold { color: #7e7c77; font-size: 12px; font-weight: 500; white-space: nowrap; }
.testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
.testi-card { background: #fff; border-radius: 18px; padding: 28px; box-shadow: 0 2px 16px rgba(0,0,0,.06); }
.testi-text { font-size: 14px; color: #555; line-height: 1.75; margin-bottom: 22px; }
.testi-footer { display: flex; align-items: center; justify-content: space-between; }
.testi-name { font-size: 14px; font-weight: 600; color: #1a1a1a; }
.testi-role { font-size: 12px; color: #888; }
.testi-stars { color: #c9922a; font-size: 12px; }
.newsletter-wrap {
  background: linear-gradient(135deg, #c9922a 0%, #b8841f 100%);
  border-radius: 24px;
  padding: 48px 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
  margin: 0 auto 80px;
  max-width: 1300px;
}
.newsletter-title {
  margin: 0 0 8px;
  font-family: var(--sans);
  font-size: 34px;
  font-weight: 600;
  color: #12202e;
}
.newsletter-sub { margin: 0; font-size: 14px; color: rgba(18,32,46,.7); }
.newsletter-form { display: flex; gap: 10px; flex-shrink: 0; }
.newsletter-input {
  padding: 12px 20px;
  border-radius: 30px;
  border: none;
  font-size: 14px;
  width: 280px;
  outline: none;
  background: rgba(255,255,255,.9);
}
.newsletter-btn {
  padding: 12px 26px;
  border-radius: 30px;
  border: none;
  background: #12202e;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.fade-up { opacity: 0; transform: translateY(30px); transition: opacity .7s ease, transform .7s ease; }
.fade-up.is-visible { opacity: 1; transform: translateY(0); }
@media (max-width: 1100px) { .hero-content { grid-template-columns: 1fr; gap: 36px; padding: 56px 24px; } .features-strip { padding: 20px 24px; gap: 24px; flex-wrap: wrap; } .process-3d-wrap { grid-template-columns: 1fr; } .process-3d-left, .process-3d-right { padding: 24px; } .categories-grid { grid-template-columns: repeat(3, 1fr); } .products-grid { grid-template-columns: repeat(2, 1fr); } .testimonials-grid { grid-template-columns: 1fr; } .newsletter-wrap { margin: 0 24px 64px; padding: 32px 24px; flex-direction: column; align-items: flex-start; } .newsletter-form { width: 100%; } .newsletter-input { width: 100%; min-width: 0; } .home-page section { padding: 56px 24px; } }
@media (max-width: 720px) { .hero-title { font-size: 42px; } .categories-grid, .products-grid { grid-template-columns: 1fr; } .preview-footer { flex-direction: column; align-items: flex-start; } }
</style>
