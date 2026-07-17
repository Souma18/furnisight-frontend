export class ProfileResponse {
  /**
   * @param {Object} data 
   */
  constructor(data = {}) {
    this.id = data.id || null
    this.accountId = data.accountId || null
    this.email = data.email || ''
    this.displayName = data.displayName || data.name || ''
    this.fullName = data.fullName || ''
    this.avatarMediaId = data.avatarMediaId || null
    this.avatarUrl = data.avatarUrl || ''
    this.role = data.role || ''
    this.birthday = data.birthday || data.dateOfBirth || ''
    this.gender = data.gender || 'MALE'
    this.bio = data.bio || ''
    this.createdAt = data.createdAt || null
  }
}

export class UserResponse {
  /**
   * @param {Object} data 
   */
  constructor(data = {}) {
    this.id = data.id || null
    this.email = data.email || ''
    this.fullName = data.fullName || ''
    this.avatarUrl = data.avatarUrl || ''
    this.role = data.role || ''
    this.status = data.status || 'ACTIVE'
    this.createdAt = data.createdAt || null
  }
}

export class RoleResponse {
  /**
   * @param {Object} data 
   */
  constructor(data = {}) {
    this.id = data.id || null
    this.name = data.name || ''
    this.description = data.description || ''
    this.permissions = Array.isArray(data.permissions) ? data.permissions : []
  }
}

export class FavoriteProductDto {
  /**
   * @param {Object} data 
   */
  constructor(data = {}) {
    this.id = data.id || null
    this.slug = data.slug || ''
    this.name = data.name || ''
    this.categoryName = data.categoryName || ''
    this.image = data.image || data.imageUrl || ''
    this.price = data.price ?? 0
    this.soldCount = data.soldCount ?? data.soldQuantity ?? 0
  }
}

export class FavoriteResponse {
  /**
   * @param {Object} data 
   */
  constructor(data = {}) {
    this.id = data.id || null
    this.productId = data.productId || null
    this.createdAt = data.createdAt || null
    this.product = data.product ? new FavoriteProductDto(data.product) : null
  }
}
