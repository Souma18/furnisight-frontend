function sleep(ms = 700) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function mockLoginRequest(payload) {
  await sleep()

  if (!isValidEmail(payload.email)) {
    throw new Error('Email không hợp lệ.')
  }
  if (!payload.password || payload.password.length < 8) {
    throw new Error('Mật khẩu tối thiểu 8 ký tự.')
  }

  // TODO(BE): Replace mock with loginRequest(payload) from authApi.js
  return {
    accessToken: 'mock-access-token',
    profile: {
      id: 'user-mock-001',
      firstName: 'Nguyen',
      lastName: 'Van A',
      email: payload.email,
    },
  }
}

export async function mockRegisterRequest(payload) {
  await sleep()

  if (!isValidEmail(payload.email)) {
    throw new Error('Email đăng ký không hợp lệ.')
  }
  if (!payload.phone || payload.phone.replace(/\D/g, '').length < 10) {
    throw new Error('Số điện thoại chưa hợp lệ.')
  }
  if (!payload.password || payload.password.length < 8) {
    throw new Error('Mật khẩu tối thiểu 8 ký tự.')
  }
  if (!payload.agree) {
    throw new Error('Vui lòng đồng ý điều khoản dịch vụ.')
  }

  // TODO(BE): Replace mock with registerRequest(payload) when backend is ready
  return { success: true }
}

export async function mockForgotPasswordRequest(payload) {
  await sleep()

  if (!isValidEmail(payload.email)) {
    throw new Error('Email không hợp lệ.')
  }

  // TODO(BE): Replace mock with forgotPasswordRequest(payload) when available
  return { success: true }
}
