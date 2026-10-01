# Flutter → PWA kapsama

## Flutter’da vardı / PWA’da karşılığı var

| Alan | Durum |
|------|--------|
| Personel özlük (çok sekmeli) | Var |
| Eğitim / yetkinlik | Katalog modülleri CRUD |
| İzin + onay/red | Var |
| Yoklama + toplu işaret | Var |
| Görev + öncelik/hatırlatıcı | Var |
| Planlama / takvim / hatırlatıcı | Var |
| Emir | Var |
| Takdir & disiplin | Var |
| Sağlık | Var |
| Envanter / zimmet / arıza / stok | Var |
| Nöbet + devir teslim | Var |
| Toplantı / duyuru / ziyaretçi | Var |
| Performans vb. | Katalog CRUD |
| Belge | Var |
| Mali / güvenlik / araç / denetim | Araç+denetim ekranı + katalog |
| Rapor PDF | Var |
| Sistem: kilitleme, audit, yedek, ayarlar | Var |
| 130+ modül kataloğu | Var |

## PWA ekstra

- GitHub Pages + Service Worker (installable offline)
- HashRouter (alt path uyumu)
- JSON tam yedek import/export
- Modül araması + global arama
- PIN pad + şifre kilidi
- Resmi tatil CRUD
- Mobil alt navigasyon

## Bilinçli farklar

- Sunucu / senkron yok (Pages static)
- Biyometrik: WebAuthn yok; PIN/şifre
- Dosya ekleri: URL/yol metni (büyük binary IndexedDB’de sınırlı)
- PDF Türkçe karakterler jsPDF default font ile kısıtlı (ASCII özet)
