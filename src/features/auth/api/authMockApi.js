function sleep(ms = 700) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function buildAxiosLikeResponse(data) {
  return { data }
}

function throwAxiosLikeError(message) {
  throw {
    response: {
      data: {
        message,
      },
    },
    message,
  }
}

export async function loginRequest(payload) {
  await sleep()

  const user = MOCK_USERS.find(user => user.identifier.toLowerCase() === String(payload.identifier).toLowerCase())
  if (!user) {
    throwAxiosLikeError('Email hoặc mật khẩu không hợp lệ.')
  }
  if (user.password !== payload.password) {
    throwAxiosLikeError('Email hoặc mật khẩu không hợp lệ.')
  }

  return {
    data: {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      profile: user.profile,
    },
  }
}

export async function registerRequest(payload) {
  await sleep()

  if (!isValidEmail(payload.email)) {
    throwAxiosLikeError('Email đăng ký không hợp lệ.')
  }
  if (!payload.phoneNumber || String(payload.phoneNumber).replace(/\D/g, '').length < 10) {
    throwAxiosLikeError('Số điện thoại chưa hợp lệ.')
  }
  if (!payload.password || payload.password.length < 8) {
    throwAxiosLikeError('Mật khẩu tối thiểu 8 ký tự.')
  }

  // TODO(BE): Replace mock with registerRequest(payload) when backend is ready
  return buildAxiosLikeResponse({
    success: true,
    userId: 'user-mock-001',
  })
}

export async function forgotPasswordRequest(payload) {
  await sleep()

  if (payload.channel === 'EMAIL' && !isValidEmail(payload.destination)) {
    throwAxiosLikeError('Email không hợp lệ.')
  }

  // TODO(BE): Replace mock with forgotPasswordRequest(payload) when available
  return buildAxiosLikeResponse({
    success: true,
    challengeId: 'challenge-mock-001',
  })
}

export async function verifyResetPasswordCode(payload) {
  await sleep()
  if (!payload.code || payload.code.length < 4) {
    throwAxiosLikeError('Mã xác nhận không hợp lệ.')
  }
  return buildAxiosLikeResponse({ success: true })
}

export async function resetPasswordRequest(payload) {
  await sleep()
  if (!payload.token) {
    throwAxiosLikeError('Token đặt lại mật khẩu không hợp lệ.')
  }
  if (!payload.newPassword || payload.newPassword.length < 8) {
    throwAxiosLikeError('Mật khẩu mới tối thiểu 8 ký tự.')
  }
  return buildAxiosLikeResponse({ success: true })
}

const MOCK_USERS = [
  {
    id: 'u-001',
    identifier: 'admin@gmail.com',
    password: 'Admin@123',
    profile: {
      id: 5001,
      firstName: 'Admin',
      lastName: 'Luxnest',
      email: 'admin@gmail.com',
      role: 'ADMIN',
    },
  },
  {
    id: 'u-002',
    identifier: 'user1@gmail.com',
    password: 'User@1234',
    profile: {
      id: 1001,
      firstName: 'Văn',
      lastName: 'Nguyễn',
      email: 'user1@gmail.com',
      role: 'CUSTOMER',
    },
  },
   {
    id: 'u-004',
    identifier: 'user2@gmail.com',
    password: 'User@1234',
    profile: {
      id: 1002,
      firstName: 'Hồng',
      lastName: 'Trần',
      email: 'user2@gmail.com',
      role: 'CUSTOMER',
    },
  },
  {
    id: 'u-003',
    identifier: 'staff@gmail.com',
    password: 'Staff@123',
    profile: {
      id: 5002,
      firstName: 'Nhân',
      lastName: 'Viên',
      email: 'staff@gmail.com',
      role: 'STAFF',
    },
  },
]