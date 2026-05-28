import { computed, inject, provide, ref } from 'vue'

const AUTH_VIEW_STATE_KEY = Symbol('authViewState')

export const AUTH_VIEWS = {
  LOGIN: 'login',
  REGISTER: 'register',
  FORGOT: 'forgot',
  SUCCESS: 'success',
}

export function useAuthViewState(initialView = AUTH_VIEWS.LOGIN) {
  const activeView = ref(initialView)
  const successState = ref({
    title: '',
    message: '',
    mode: AUTH_VIEWS.LOGIN,
  })

  const showTabs = computed(
    () => activeView.value === AUTH_VIEWS.LOGIN || activeView.value === AUTH_VIEWS.REGISTER,
  )

  function setView(view) {
    activeView.value = view
  }

  function showSuccess({ title, message, mode = AUTH_VIEWS.LOGIN }) {
    successState.value = { title, message, mode }
    activeView.value = AUTH_VIEWS.SUCCESS
  }

  return {
    AUTH_VIEWS,
    activeView,
    successState,
    showTabs,
    setView,
    showSuccess,
  }
}

export function provideAuthViewState(authViewState) {
  provide(AUTH_VIEW_STATE_KEY, authViewState)
  return authViewState
}

export const useAuthViewStateContext = () => {
  return inject(AUTH_VIEW_STATE_KEY, null) ?? useAuthViewState()
}
