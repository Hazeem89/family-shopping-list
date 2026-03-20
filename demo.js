// Demo script — simulates 4 users interacting with the shopping list
// Run with: node demo.js  (while the server is running)

const { io } = require('socket.io-client')

const BASE = 'http://localhost:3001'
const USERS = ['Alex', 'Sam', 'Emma', 'Max']

function delay(ms) {
  return new Promise(res => setTimeout(res, ms))
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  return res.json()
}

async function patch(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  return res.json()
}

async function del(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  return res.json()
}

function connect(username) {
  const socket = io(BASE)
  socket.on('connect', () => {
    socket.emit('setUser', username)
    console.log(`  [${username}] joined`)
  })
  return socket
}

async function run() {
  console.log('\n--- Family Shopping List Demo ---\n')

  // 1. All 4 users connect
  console.log('Step 1: All users join')
  const sockets = USERS.map(connect)
  await delay(3500)

  // 2. Alex adds items
  console.log('\nStep 2: Alex adds Milk, Eggs, Bread')
  const milk  = await post('/items', { name: 'Milk',  user: 'Alex' })
  await delay(3000)
  const eggs  = await post('/items', { name: 'Eggs',  user: 'Alex' })
  await delay(3000)
  const bread = await post('/items', { name: 'Bread', user: 'Alex' })
  await delay(3500)

  // 3. Sam adds items
  console.log('\nStep 3: Sam adds Butter and Apples')
  const butter = await post('/items', { name: 'Butter', user: 'Sam' })
  await delay(3000)
  const apples = await post('/items', { name: 'Apples', user: 'Sam' })
  await delay(3500)

  // 4. Emma adds an item
  console.log('\nStep 4: Emma adds Orange Juice')
  const oj = await post('/items', { name: 'Orange Juice', user: 'Emma' })
  await delay(3500)

  // 5. Max adds an item
  console.log('\nStep 5: Max adds Cheese')
  const cheese = await post('/items', { name: 'Cheese', user: 'Max' })
  await delay(3500)

  // 6. Alex checks off Milk and Bread
  console.log('\nStep 6: Alex checks Milk and Bread')
  await patch(`/items/${milk.id}`,  { user: 'Alex' })
  await delay(3000)
  await patch(`/items/${bread.id}`, { user: 'Alex' })
  await delay(3500)

  // 7. Sam checks Butter
  console.log('\nStep 7: Sam checks Butter')
  await patch(`/items/${butter.id}`, { user: 'Sam' })
  await delay(3500)

  // 8. Emma deletes Orange Juice (changed her mind)
  console.log('\nStep 8: Emma deletes Orange Juice')
  await del(`/items/${oj.id}`, { user: 'Emma' })
  await delay(3500)

  // 9. Max checks Cheese and deletes Eggs
  console.log('\nStep 9: Max checks Cheese and deletes Eggs')
  await patch(`/items/${cheese.id}`, { user: 'Max' })
  await delay(3000)
  await del(`/items/${eggs.id}`, { user: 'Max' })
  await delay(3500)

  // 10. Sam unchecks Butter (forgot to grab it)
  console.log('\nStep 10: Sam unchecks Butter')
  await patch(`/items/${butter.id}`, { user: 'Sam' })
  await delay(3500)

  console.log('\n--- Demo complete ---\n')

  sockets.forEach(s => s.disconnect())
  process.exit(0)
}

run().catch(err => {
  console.error('Error:', err.message)
  console.error('Make sure the server is running: cd server && npm run dev')
  process.exit(1)
})
