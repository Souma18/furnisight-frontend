/**
 * @typedef {object} AdminCategory
 * @property {string|number} id
 * @property {string} name
 * @property {string} slug
 * @property {string} iconId
 * @property {number} productCount
 * @property {boolean} visible
 * @property {string} visibleLabel
 * @property {string} [description]
 * @property {string} createdAt
 */

/**
 * @typedef {object} AdminProduct
 * @property {string|number} id
 * @property {string} name
 * @property {string} sku
 * @property {string} category
 * @property {string} [categoryId]
 * @property {number} price
 * @property {number} [comparePrice]
 * @property {number} stock
 * @property {'success'|'low'|'cancel'} status
 * @property {string} statusLabel
 * @property {string} [model3dUrl]
 * @property {string} [model3dFileName]
 * @property {number} [model3dSize]
 */

/**
 * @typedef {object} AdminProfile
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} birthDate
 */

export {}
