<script setup>
import { reactive, ref, watch } from 'vue'
import AppButton from '@shared/ui/AppButton.vue'
import AppInput from '@shared/ui/AppInput.vue'
import AppModal from '@shared/ui/AppModal.vue'
import { useVietnamAddress } from '@shared/composables/useVietnamAddress'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  open: { type: Boolean, default: false },
  address: { type: Object, default: null },
})

const emit = defineEmits(['close', 'save'])
const { t } = useI18n()

const {
  provinces,
  wards,
  loadingProvince,
  loadingWard,
  addressApiUnavailable,
  fetchProvinces,
  fetchWards,
  clearWards,
} = useVietnamAddress()

const formError = ref('')
const form = reactive(createEmptyForm())

function createEmptyForm() {
  return {
    fullName: '',
    phone: '',
    detail: '',
    provinceCode: '',
    wardCode: '',
    provinceName: '',
    wardName: '',
    type: 'home',
    isDefault: false,
  }
}

watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    formError.value = ''
    if (props.address) {
      Object.assign(form, {
        fullName: props.address.fullName || '',
        phone: props.address.phone || '',
        detail: props.address.detail || '',
        provinceCode: props.address.provinceCode || '',
        wardCode: props.address.wardCode || '',
        provinceName: props.address.provinceName || '',
        wardName: props.address.wardName || '',
        type: props.address.type || 'home',
        isDefault: Boolean(props.address.isDefault),
      })
    } else {
      Object.assign(form, createEmptyForm())
    }

    await fetchProvinces()
    if (form.provinceCode) {
      try {
        await fetchWards(form.provinceCode)
      } catch (err) {
        formError.value = err.message
      }
    } else {
      clearWards()
    }
  }
})

async function onProvinceChange() {
  const selected = provinces.value.find((item) => String(item.code) === String(form.provinceCode))
  form.provinceName = selected?.name ?? ''
  form.wardCode = ''
  form.wardName = ''
  clearWards()
  formError.value = ''

  if (form.provinceCode) {
    try {
      await fetchWards(form.provinceCode)
    } catch (err) {
      formError.value = err.message
    }
  }
}

function onWardChange() {
  const selected = wards.value.find((item) => String(item.code) === String(form.wardCode))
  form.wardName = selected?.name ?? ''
}

function submitAddress() {
  if (!form.fullName || !form.phone || !form.detail || !form.provinceCode || !form.wardCode) {
    formError.value = t('checkout.address.validationError')
    return
  }

  const phoneRegex = /^(0|84)(3|5|7|8|9)[0-9]{8}$/
  if (!phoneRegex.test(form.phone)) {
    formError.value = t('checkout.address.invalidPhone')
    return
  }

  formError.value = ''
  emit('save', {
    ...(props.address ? { id: props.address.id } : {}),
    ...form,
  })
}
</script>

<template>
  <AppModal :open="open" width="550px" no-bg @close="$emit('close')">
    <div class="co-address-dialog" role="dialog" aria-modal="true">
      <div class="co-address-dialog-head">
        <h3>{{ address ? $t('checkout.address.modalEdit') : $t('checkout.address.modalAdd') }}</h3>
        <AppButton variant="unstyled" type="button" class="co-address-close" :aria-label="$t('checkout.address.close')" @click="$emit('close')">×</AppButton>
      </div>

      <div class="co-address-form">
        <label>
          {{ $t('checkout.address.fullName') }}
          <AppInput v-model.trim="form.fullName" placeholder="Nguyễn Văn A" />
        </label>
        <label>
          {{ $t('checkout.address.phone') }}
          <AppInput v-model.trim="form.phone" placeholder="0123456789" />
        </label>
        <label>
          {{ $t('checkout.address.province') }}
          <select
            v-model="form.provinceCode"
            :disabled="loadingProvince || addressApiUnavailable"
            @change="onProvinceChange"
          >
            <option value="">{{ loadingProvince ? $t('checkout.address.loading') : $t('checkout.address.chooseProvince') }}</option>
            <option v-for="province in provinces" :key="province.code" :value="province.code">
              {{ province.name }}
            </option>
          </select>
        </label>
        <label>
          {{ $t('checkout.address.ward') }}
          <select v-model="form.wardCode" :disabled="loadingWard || !wards.length" @change="onWardChange">
            <option value="">{{ loadingWard ? $t('checkout.address.loading') : $t('checkout.address.chooseWard') }}</option>
            <option v-for="ward in wards" :key="ward.code" :value="ward.code">{{ ward.name }}</option>
          </select>
        </label>
        <label class="co-address-form-full">
          {{ $t('checkout.address.detail') }}
          <AppInput v-model.trim="form.detail" placeholder="Số nhà, tên đường..." />
        </label>
        <label>
          {{ $t('checkout.address.type') }}
          <select v-model="form.type">
            <option value="home">{{ $t('checkout.address.types.home') }}</option>
            <option value="office">{{ $t('checkout.address.types.office') }}</option>
            <option value="other">{{ $t('checkout.address.types.other') }}</option>
          </select>
        </label>
        <label class="co-address-default-check">
          <input v-model="form.isDefault" type="checkbox" />
          <span>{{ $t('checkout.address.isDefault') }}</span>
        </label>
      </div>

      <p v-if="addressApiUnavailable" class="co-address-warning">
        {{ $t('checkout.address.apiError') }}
      </p>
      <p v-if="formError" class="co-address-warning">{{ formError }}</p>

      <div class="co-address-dialog-actions">
        <AppButton variant="unstyled" type="button" class="co-address-secondary" @click="$emit('close')">{{ $t('checkout.address.cancel') }}</AppButton>
        <AppButton variant="unstyled" type="button" class="co-address-primary" @click="submitAddress">
          {{ address ? $t('checkout.address.update') : $t('checkout.address.save') }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
