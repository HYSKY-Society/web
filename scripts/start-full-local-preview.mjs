import { cp, mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { PGlite } from '@electric-sql/pglite'
import clerkMock from './full-local-preview/clerk-server.cjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const target = path.join(root, '.local-site')
await mkdir(target, { recursive: true })
// Old preview copies must not retain routes retired from the source site.
for (const retiredPath of ['app/(members)/admin/press', 'app/api/admin/news-automation', 'app/api/news-automation', 'lib/news-automation.ts', 'lib/feed-teaser.ts']) {
  const retiredTarget = path.resolve(target, retiredPath)
  if (!retiredTarget.startsWith(target + path.sep)) throw new Error('Preview cleanup escaped its directory.')
  await rm(retiredTarget, { recursive: true, force: true })
}
// Copy code and assets only: no .env, .git, production keys, or remote data.
for (const entry of ['app', 'lib', 'components', 'public']) {
  await cp(path.join(root, entry), path.join(target, entry), { recursive: true })
}
for (const entry of ['tsconfig.json', 'tailwind.config.ts', 'postcss.config.mjs']) {
  await cp(path.join(root, entry), path.join(target, entry))
}
await cp(path.join(root, 'scripts/full-local-preview'), path.join(target, 'mocks'), { recursive: true })
await writeFile(path.join(target, 'package.json'), JSON.stringify({ name: 'hysky-full-local-preview', private: true }))
await writeFile(path.join(target, 'proxy.ts'), "import { NextResponse } from 'next/server'\nexport default function proxy() { return NextResponse.next() }\n")
await writeFile(path.join(target, 'next.config.mjs'), `
import path from 'node:path'
export default {
  serverExternalPackages: ['@electric-sql/pglite'],
  webpack(config) {
    config.resolve.alias['@clerk/nextjs/server$'] = path.resolve('mocks/clerk-server.cjs')
    config.resolve.alias['@clerk/nextjs$'] = path.resolve('mocks/clerk-client.tsx')
    return config
  },
}
`)
// Use a local font fallback instead of downloading a font on first render.
const layout = await readFile(path.join(target, 'app/layout.tsx'), 'utf8')
await writeFile(path.join(target, 'app/layout.tsx'), layout
  .replace("import { Space_Grotesk } from 'next/font/google'", '')
  .replace("const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] })", "const spaceGrotesk = { className: '', style: { fontFamily: 'Arial, sans-serif' } }")
  .replace('<body className={spaceGrotesk.className}>', '<body className={spaceGrotesk.className}><div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:9999,background:"#312600",color:"#ffe799",padding:"6px 12px",fontSize:12,textAlign:"center"}}>LOCAL PREVIEW · Mock Clerk + local database · No live accounts or payments</div>'))
await writeFile(path.join(target, 'lib/pusher-client.ts'), "export function getPusher(): never { throw new Error('Realtime disabled in local preview') }\n")
await writeFile(path.join(target, 'lib/pusher.ts'), `
export const pusherServer = { trigger: async () => {}, authorizeChannel: () => ({}) }
export function dmChannelName(a: string, b: string) { return 'local-dm-' + [a,b].sort().join('-') }
export function chatChannelName(id: string) { return 'local-chat-' + id }
export function gmChannelName(id: string) { return 'local-group-' + id }
`)

const db = new PGlite(path.join(target, '.local-data'))
await db.exec('CREATE TABLE IF NOT EXISTS local_preview_migrations (name text PRIMARY KEY)')
for (const name of (await readdir(path.join(root, 'migrations'))).filter(name => name.endsWith('.sql')).sort()) {
  const done = await db.query('SELECT name FROM local_preview_migrations WHERE name=$1', [name])
  if (done.rows.length) continue
  await db.exec(await readFile(path.join(root, 'migrations', name), 'utf8'))
  await db.query('INSERT INTO local_preview_migrations(name) VALUES ($1)', [name])
}
await db.exec(await readFile(path.join(root, 'scripts/full-local-preview/feed-schema.sql'), 'utf8'))
const examples = [
  { id: 'mock_owner', email: 'd@hy-sky.net', name: 'Danielle McLean', tier: 'member_full' },
  { id: 'mock_vip', email: 'vip-demo@example.com', name: 'Example VIP Member', tier: 'member_full' },
  { id: 'mock_free', email: 'free-demo@example.com', name: 'Example Free Member', tier: 'free' },
]
for (const user of examples) {
  await db.query('INSERT INTO users(id,email,tier) VALUES($1,$2,$3) ON CONFLICT DO NOTHING', [user.id,user.email,user.tier])
  await db.query('INSERT INTO user_profiles(user_id,display_name) VALUES($1,$2) ON CONFLICT DO NOTHING', [user.id,user.name])
}
await db.close()
try { await readFile(path.join(target, '.mock-clerk.json')) }
catch { await writeFile(path.join(target, '.mock-clerk.json'), JSON.stringify(examples.map(user => clerkMock.makeUser(user.id,user.email,user.name)))) }

const env = { ...process.env }
for (const key of Object.keys(env)) {
  if (/CLERK|DATABASE|AZURE|ZOHO|PUSHER|RESEND|BLOB|VERCEL|WEBHOOK|AUTOMATION|SMTP|WIX/.test(key)) delete env[key]
}
Object.assign(env, { LOCAL_DATABASE: 'pglite', NEXT_TELEMETRY_DISABLED: '1', NODE_ENV: 'development' })
console.log('Full local site: http://127.0.0.1:3001/admin — isolated local database and mock Clerk.')
const child = spawn(process.execPath, [path.join(root, 'node_modules/next/dist/bin/next'), 'dev', '--webpack', '--hostname', '127.0.0.1', '--port', '3001'], { cwd: target, env, stdio: 'inherit' })
child.on('exit', code => { process.exitCode = code ?? 0 })
