const fs = require('node:fs')
const path = require('node:path')
const file = path.join(process.cwd(), '.mock-clerk.json')
function read() { return JSON.parse(fs.readFileSync(file, 'utf8')) }
function write(users) { fs.writeFileSync(file, JSON.stringify(users)) }
function makeUser(id, email, name = '') {
  return {
    id, firstName: name || null, lastName: null, imageUrl: null,
    primaryEmailAddressId: `${id}_email`,
    emailAddresses: [{ id: `${id}_email`, emailAddress: email, verification: { status: 'verified' } }],
    createdAt: Date.now(), lastSignInAt: null, publicMetadata: {}, privateMetadata: {},
  }
}
exports.makeUser = makeUser
exports.currentUser = async () => read().find(user => user.id === 'mock_owner')
exports.auth = async () => ({ userId: 'mock_owner', sessionId: 'mock_session', protect: async () => ({ userId: 'mock_owner' }) })
exports.clerkClient = async () => ({
  users: {
    async getUserList(params = {}) {
      let users = read()
      if (params.emailAddress) users = users.filter(user => user.emailAddresses.some(entry => params.emailAddress.includes(entry.emailAddress)))
      if (params.query) users = users.filter(user => JSON.stringify(user).toLowerCase().includes(params.query.toLowerCase()))
      const totalCount = users.length
      return { data: users.slice(params.offset || 0, (params.offset || 0) + (params.limit || 500)), totalCount }
    },
    async getUser(id) { const user = read().find(user => user.id === id); if (!user) throw new Error('Local account not found'); return user },
    async createUser(params) {
      const users = read(), email = params.emailAddress[0]
      if (users.some(user => user.emailAddresses.some(entry => entry.emailAddress === email))) throw new Error('Local email already exists')
      const user = makeUser(`mock_${crypto.randomUUID()}`, email, params.firstName)
      users.push(user); write(users); return user
    },
    async deleteUser(id) { write(read().filter(user => user.id !== id)); return { id } },
    async updateUser(id, params) {
      const users = read(), index = users.findIndex(user => user.id === id)
      if (index < 0) throw new Error('Local account not found')
      users[index] = { ...users[index], ...params }; write(users); return users[index]
    },
  },
  invitations: { getInvitationList: async () => ({ data: [], totalCount: 0 }) },
})
