/**
 * @typedef {'view'|'create'|'edit'|'delete'|'config'} AdminPermission
 */

/**
 * @typedef {object} AdminRole
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {AdminPermission[]} perms
 * @property {number} userCount
 */

/**
 * @typedef {object} AdminAccountRow
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} roleName
 * @property {AdminPermission[]} perms
 * @property {string} lastLogin
 */

export {}
