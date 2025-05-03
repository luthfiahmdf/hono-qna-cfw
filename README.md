# 🌐 Hono QnA API (Cloudflare Workers Template)

Ini adalah **API backend** untuk aplikasi **Tanya-Tanya** — platform Q&A interaktif antara streamer dan viewer yang mendukung tampilan pertanyaan secara realtime di overlay OBS.

Dibangun menggunakan [**Hono**](https://hono.dev/) — framework ringan untuk **Cloudflare Workers**, serta **D1 Database**, **Drizzle ORM**, dan **Durable Object** untuk mendukung komunikasi realtime antar klien dan overlay.

---

## ⚙️ Fitur API

- 🔐 Autentikasi pengguna (streamer & viewer)
- ❓ CRUD pertanyaan (tambah, ambil, aktifkan)
- 🟢 Aktivasi pertanyaan untuk overlay secara realtime
- 📡 Realtime WebSocket melalui **Cloudflare Durable Objects**
- 📘 Dokumentasi otomatis via Zod + Scalar

---

## 🧰 Teknologi

| Teknologi                                                                                             | Keterangan                              |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------- |
| [Hono](https://hono.dev/)                                                                             | Web framework ringan                    |
| [Cloudflare Workers](https://developers.cloudflare.com/workers/)                                      | Serverless execution                    |
| [Cloudflare Durable Objects](https://developers.cloudflare.com/workers/runtime-apis/durable-objects/) | State management dan WebSocket realtime |
| [Cloudflare D1](https://developers.cloudflare.com/d1/)                                                | SQLite DB di Cloudflare                 |
| [Drizzle ORM](https://orm.drizzle.team/)                                                              | ORM TypeScript untuk D1                 |
| [Zod](https://zod.dev/)                                                                               | Validasi data dengan typesafety tinggi  |
| [Scalar](https://scalar.com/)                                                                         | UI dokumentasi API berbasis OpenAPI     |
| [Wrangler](https://developers.cloudflare.com/workers/wrangler/)                                       | CLI Workers                             |

---

## 🚧 Perintah Dev & Deploy

| Perintah             | Deskripsi                                    |
| -------------------- | -------------------------------------------- |
| `bun run dev`        | Jalankan Cloudflare Workers secara lokal     |
| `bun run db:dev`     | Generate & apply migrasi Drizzle untuk lokal |
| `bun run db:push`    | Push schema D1 ke environment production     |
| `bun run db:reset`   | Reset state database lokal                   |
| `bun run cf-typegen` | Generate TypeScript binding Cloudflare       |
| `bun run deploy`     | Deploy ke Cloudflare                         |
