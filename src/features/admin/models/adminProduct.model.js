/**
 * @typedef {object} AdminProduct
 * @property {string} id
 * @property {string} name
 * @property {string} sku
 * @property {string} category
 * @property {string} categoryId
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
 * @typedef {object} AdminProductPayload
 * @property {string} name
 * @property {string} sku
 * @property {string} category
 * @property {number} price
 * @property {number} stock
 * @property {string} statusLabel
 * @property {string} [model3dUrl]
 * @property {string} [model3dFileName]
 * @property {number} [model3dSize]
 */

/**
 * @typedef {object} UploadProductModelPayload
 * @property {File} file
 */

/**
 * @typedef {object} UploadProductModelResult
 * @property {string} model3dUrl
 * @property {string} model3dFileName
 * @property {number} model3dSize
 */

export {}
