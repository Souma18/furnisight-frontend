<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import ContactBookingSection from '../components/ContactBookingSection.vue'
import ContactFaqSection from '../components/ContactFaqSection.vue'
import ContactFormCard from '../components/ContactFormCard.vue'
import ContactHeroSection from '../components/ContactHeroSection.vue'
import ContactSidebar from '../components/ContactSidebar.vue'
import ContactToast from '../components/ContactToast.vue'
import {
  CONTACT_BREADCRUMB,
  CONTACT_BOOKING_OPTIONS,
  CONTACT_BOOKING_SECTION,
  CONTACT_DEFAULT_TOAST,
  CONTACT_FAQS,
  CONTACT_FAQ_SECTION,
  CONTACT_FORM_CONFIG,
  CONTACT_HERO,
  CONTACT_SIDEBAR,
} from '../mock/contactPageMockData'
import '../styles/contactPage.css'

const toast = ref({
  show: false,
  title: CONTACT_DEFAULT_TOAST.title,
  subtitle: CONTACT_DEFAULT_TOAST.subtitle,
})

let toastTimer = null
let revealObserver = null

function showToast(payload = CONTACT_DEFAULT_TOAST) {
  toast.value = {
    show: true,
    title: payload.title,
    subtitle: payload.subtitle,
  }

  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    toast.value = { ...toast.value, show: false }
  }, 4000)
}

function handleSubmitSuccess() {
  showToast(CONTACT_DEFAULT_TOAST)
}

function handleBook(item) {
  showToast({
    title: `Đã nhận yêu cầu: ${item.name}`,
    subtitle: 'Đội ngũ LUXNEST sẽ liên hệ để chốt thời gian phù hợp.',
  })
}

onMounted(() => {
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('ct-visible')
      })
    },
    { threshold: 0.08 },
  )

  document.querySelectorAll('.ct-fade-up').forEach((element) => revealObserver.observe(element))
})

onBeforeUnmount(() => {
  window.clearTimeout(toastTimer)
  toastTimer = null
  revealObserver?.disconnect()
  revealObserver = null
})
</script>

<template>
  <section class="contact-page">
    <ContactHeroSection :breadcrumb="CONTACT_BREADCRUMB" :hero="CONTACT_HERO" />

    <div class="ct-inner ct-main-wrap">
      <ContactFormCard :config="CONTACT_FORM_CONFIG" @submit-success="handleSubmitSuccess" />
      <ContactSidebar :sidebar="CONTACT_SIDEBAR" />
    </div>

    <ContactBookingSection
      :section="CONTACT_BOOKING_SECTION"
      :items="CONTACT_BOOKING_OPTIONS"
      @book="handleBook"
    />

    <ContactFaqSection :section="CONTACT_FAQ_SECTION" :items="CONTACT_FAQS" />

    <ContactToast :show="toast.show" :title="toast.title" :subtitle="toast.subtitle" />
  </section>
</template>
