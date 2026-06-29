<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ContactBookingSection from '../components/ContactBookingSection.vue'
import ContactFaqSection from '../components/ContactFaqSection.vue'
import ContactFormCard from '../components/ContactFormCard.vue'
import ContactHeroSection from '../components/ContactHeroSection.vue'
import ContactSidebar from '../components/ContactSidebar.vue'
import { useContactReveal } from '../composables/useContactReveal'
import { useToast } from '@shared/composables/useToast'
import '../styles/contactPage.css'

const { t } = useI18n()
const defaultToast = computed(() => ({
  title: t('contact.toast.successTitle'),
  subtitle: t('contact.toast.successSubtitle'),
}))
const { show: showToast } = useToast()
useContactReveal()

const breadcrumb = computed(() => [{ label: t('nav.home'), href: '/' }, { label: t('nav.contact') }])
const hero = computed(() => ({
  label: t('contact.hero.label'),
  titleLine1: t('contact.hero.titleLine1'),
  titleLine2Prefix: t('contact.hero.titleLine2Prefix'),
  titleAccent: t('contact.hero.titleAccent'),
  titleLine2Suffix: '',
  subtitle: t('contact.hero.subtitle'),
  quickActions: [
    { label: t('contact.hero.message'), href: '#contact-form', variant: 'primary', icon: 'mail' },
    { label: t('contact.hero.booking'), href: '#contact-booking', variant: 'ghost', icon: 'calendar' },
  ],
  infoCards: [
    { id: 'hotline', icon: 'phone', label: t('contact.hero.hotline'), value: t('contact.hero.hotlineValue'), sub: t('contact.hero.hotlineSub') },
    { id: 'chat', icon: 'messageCircle', label: t('contact.hero.chat'), value: t('contact.hero.chatValue'), sub: t('contact.hero.chatSub'), accent: 'success' },
    { id: 'showroom', icon: 'store', label: t('contact.hero.showroom'), value: t('contact.hero.showroomValue'), sub: t('contact.hero.showroomSub') },
  ],
}))

const formConfig = computed(() => ({
  tag: t('contact.form.tag'),
  titleLine1: t('contact.form.titleLine1'),
  titleLine2Prefix: t('contact.form.titleLine2Prefix'),
  titleAccent: t('contact.form.titleAccent'),
  titleLine2Suffix: '',
  note: t('contact.form.note'),
  intents: [
    { id: 'general', label: t('contact.form.intents.general'), icon: 'messageCircle', placeholder: t('contact.form.placeholders.general') },
    { id: 'design', label: t('contact.form.intents.design'), icon: 'house', placeholder: t('contact.form.placeholders.design'), showDesignFields: true },
    { id: 'order', label: t('contact.form.intents.order'), icon: 'box', placeholder: t('contact.form.placeholders.order') },
    { id: 'partner', label: t('contact.form.intents.partner'), icon: 'handshake', placeholder: t('contact.form.placeholders.partner') },
  ],
  roomTypes: [
    t('contact.form.roomTypes.bedroom'),
    t('contact.form.roomTypes.living'),
    t('contact.form.roomTypes.dining'),
    t('contact.form.roomTypes.kitchen'),
    t('contact.form.roomTypes.office'),
    t('contact.form.roomTypes.apartment'),
  ],
  areaOptions: [
    t('contact.form.areas.under15'),
    '15 - 25m²',
    '25 - 40m²',
    '40 - 70m²',
    t('contact.form.areas.over70'),
  ],
  budgetOptions: [
    t('contact.form.budgets.under30'),
    '30 - 80tr',
    '80 - 150tr',
    '150tr - 300tr',
    t('contact.form.budgets.over300'),
  ],
  initialBudget: '30 - 80tr',
}))

const sidebar = computed(() => ({
  consultant: {
    avatarIcon: 'user',
    name: 'Huynh Minh Hien',
    role: t('contact.sidebar.role'),
    onlineText: t('contact.sidebar.online'),
    description: t('contact.sidebar.description'),
    actions: [
      { id: 'chat', label: t('contact.sidebar.chatNow'), icon: 'messageCircle', href: '#' },
      { id: 'booking', label: t('contact.sidebar.videoCall'), icon: 'calendar', href: '#contact-booking', ghost: true },
    ],
  },
  contactInfo: [
    { id: 'hotline', icon: 'phone', label: t('contact.sidebar.hotline'), value: '1800 6868', href: 'tel:18006868' },
    { id: 'email', icon: 'mail', label: 'Email', value: 'hello@furnisight.store', href: 'mailto:hello@furnisight.store' },
    { id: 'hcm', icon: 'mapPin', label: t('contact.sidebar.showroomHcm'), value: '123 Nguyen Dinh Chieu, District 3, HCMC' },
    { id: 'hn', icon: 'mapPin', label: t('contact.sidebar.showroomHn'), value: '456 Tran Duy Hung, Cau Giay, Hanoi' },
  ],
  socials: [
    { id: 'facebook', label: 'Facebook', icon: 'facebook', href: '#' },
    { id: 'instagram', label: 'Instagram', icon: 'instagram', href: '#' },
    { id: 'youtube', label: 'YouTube', icon: 'youtube', href: '#' },
    { id: 'tiktok', label: 'TikTok', icon: 'music2', href: '#' },
    { id: 'zalo', label: 'Zalo', icon: 'messagesSquare', href: '#' },
  ],
  hours: [
    { id: 'weekday', day: t('contact.sidebar.weekday'), time: '8:00 - 21:00' },
    { id: 'sat', day: t('contact.sidebar.saturday'), time: '8:00 - 20:00' },
    { id: 'sun', day: t('contact.sidebar.sunday'), time: '9:00 - 18:00' },
    { id: 'chat', day: t('contact.sidebar.onlineChat'), time: '24/7', accent: 'success' },
  ],
}))

const bookingSection = computed(() => ({
  label: t('contact.booking.label'),
  titleLine1: t('contact.booking.titleLine1'),
  titleLine2Prefix: t('contact.booking.titleLine2Prefix'),
  titleAccent: '',
  titleLine2Suffix: t('contact.booking.titleLine2Suffix'),
  subtitle: t('contact.booking.subtitle'),
}))

const bookingOptions = computed(() => [
  { id: 'video', type: 'Online', icon: 'video', name: t('contact.booking.videoName'), description: t('contact.booking.videoDesc'), duration: t('contact.booking.videoDuration'), buttonLabel: t('contact.booking.videoButton'), popular: true },
  { id: 'showroom', type: t('contact.booking.showroomType'), icon: 'store', name: t('contact.booking.showroomName'), description: t('contact.booking.showroomDesc'), duration: t('contact.booking.showroomDuration'), buttonLabel: t('contact.booking.showroomButton') },
  { id: 'home', type: t('contact.booking.homeType'), icon: 'house', name: t('contact.booking.homeName'), description: t('contact.booking.homeDesc'), duration: t('contact.booking.homeDuration'), buttonLabel: t('contact.booking.homeButton') },
])

const faqSection = computed(() => ({
  label: t('contact.faq.label'),
  titleLine1: t('contact.faq.titleLine1'),
  titleAccent: t('contact.faq.titleAccent'),
}))

const faqs = computed(() => ['free3d', 'shipping', 'return', 'ai', 'designFee', 'showroom'].map((id, index) => ({
  id,
  question: t(`contact.faq.items.${id}.q`),
  answer: t(`contact.faq.items.${id}.a`),
  open: index === 0,
})))

function handleSubmitSuccess() {
  showToast(`${defaultToast.value.title} - ${defaultToast.value.subtitle}`, 'success')
}

function handleBook(item) {
  showToast(`${t('contact.toast.bookingTitle', { name: item.name })} - ${t('contact.toast.bookingSubtitle')}`, 'success')
}
</script>

<template>
  <section class="contact-page">
    <ContactHeroSection :breadcrumb="breadcrumb" :hero="hero" />

    <div class="ct-inner ct-main-wrap">
      <ContactFormCard :config="formConfig" @submit-success="handleSubmitSuccess" />
      <ContactSidebar :sidebar="sidebar" />
    </div>

    <ContactBookingSection
      :section="bookingSection"
      :items="bookingOptions"
      @book="handleBook"
    />

    <ContactFaqSection :section="faqSection" :items="faqs" />
  </section>
</template>
