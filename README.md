# Barter MVP (React Native + Expo + Supabase)

Bu proje, **Dolap** benzeri bir ilan/takas pazar yeri uygulaması için hazır bir başlangıç iskeletidir.
- Mobil: React Native (Expo), Expo Router, React Query, Zustand
- Backend: Supabase (Postgres + Auth + Storage + Realtime)

## Hızlı Başlangıç

1) Depoyu çıkarın ve bağımlılıkları yükleyin:
```bash
npm i -g expo-cli
npm i
```
2) `.env` veya `app.json` -> `expo.extra` içine Supabase URL ve anon key'i girin:
```json
"extra": {
  "supabaseUrl": "https://YOUR-PROJECT.supabase.co",
  "supabaseAnonKey": "ey..."
}
```
3) Supabase içinde `sql/supabase.sql` dosyasını çalıştırın (tablo + RLS).
4) Storage'da `listing-photos` adında public bucket oluşturun.
5) Geliştirme
```bash
npm run start
```

## Klasör Yapısı

- `app/` -> Expo Router ekranları (tabs: keşfet, ilan ver, mesajlar, profil)
- `src/services/` -> Supabase veri işlemleri
- `src/state/` -> Auth Provider
- `sql/` -> Supabase şema ve politikalar

