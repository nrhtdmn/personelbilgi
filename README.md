# MüdürAsistanı PWA

Flutter **MüdürAsistanı** uygulamasının GitHub Pages üzerinde çalışan offline Progressive Web App sürümü.

Veriler sunucuya gitmez; **IndexedDB** içinde tarayıcıda saklanır. Service Worker ile yükleme sonrası offline kullanılabilir.

## Özellikler

### Özel ekranlar (tam CRUD)
- Personel (kimlik, iletişim, görev, sağlık, askerlik, pasaport, SGK sekmeleri)
- Görev, izin (onay/red), yoklama (hızlı + toplu)
- Emir, disiplin, toplantı, nöbet + devir teslim
- Duyuru, ziyaretçi, envanter/zimmet/arıza/stok
- Araç, sağlık raporu, denetim, belge
- Takvim, arama, rapor (PDF), ayarlar

### 130+ katalog modülü
HTML / Flutter `module_catalog` ile aynı **20 kategori · 130+ modül**; her biri için kayıt ekle / düzenle / sil.

### Sistem
- İlk kurulum + PIN / şifre kilidi
- Denetim izi (audit log)
- JSON yedek indir / yükle
- Bildirim tercihleri, resmi tatiller, önemli tarihler, hatırlatıcılar
- PWA: installable, offline, `autoUpdate` SW

## Yerel çalıştırma

```bash
cd mudirasistani-pwa
npm install
npm run dev
```

## GitHub Pages deploy

HashRouter kullanıldığı için proje yolu (`/repo-name/`) altında sorun çıkmaz.

1. Bu klasörü bir GitHub deposuna push edin (veya monorepo’da `mudirasistani-pwa` kökünü Pages source yapın).
2. **Settings → Pages → Build and deployment → GitHub Actions** seçin.
3. Workflow: `.github/workflows/deploy-pages.yml` (bu klasörde veya repo kökünde path ayarlı).

Manuel build çıktısı:

```bash
npm run build
# dist/ klasörünü Pages’e yükleyin
```

Repo adınız `mudirasistani-pwa` değilse `vite.config.ts` içindeki `base` değerini `/REPO_ADI/` yapın; HashRouter ile `./` çoğu durumda yeterlidir.

## Flutter uygulamasıyla ilişki

| Flutter | Bu PWA |
|---------|--------|
| Drift SQLite | Dexie IndexedDB |
| Riverpod / GoRouter | Zustand / React Router (Hash) |
| Generic module CRUD | Aynı katalog + `moduleRecords` |
| Specialty screens | Web karşılıkları |

## Güvenlik notu

Bu bir **yerel / offline** araçtır. TC ve benzeri hassas alanlar tarayıcıda tutulur; paylaşılan bilgisayarda kullanmayın. Yedek dosyaları güvenli saklayın.
