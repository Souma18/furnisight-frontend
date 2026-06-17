<script setup>
import ContactBookingSection from '../components/ContactBookingSection.vue'
import ContactFaqSection from '../components/ContactFaqSection.vue'
import ContactFormCard from '../components/ContactFormCard.vue'
import ContactHeroSection from '../components/ContactHeroSection.vue'
import ContactSidebar from '../components/ContactSidebar.vue'
import ContactToast from '../components/ContactToast.vue'
import { useContactReveal } from '../composables/useContactReveal'
import { useContactToast } from '../composables/useContactToast'
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
} from '../config/contactPageContent'
import '../styles/contactPage.css'

const { toast, showToast } = useContactToast(CONTACT_DEFAULT_TOAST)
useContactReveal()

function handleSubmitSuccess() {
  showToast(CONTACT_DEFAULT_TOAST)
}

function handleBook(item) {
  showToast({
    title: `Đã nhận yêu cầu: ${item.name}`,
    subtitle: 'Đội ngũ FurniSight sẽ liên hệ để chốt thời gian phù hợp.',
  })
}
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
