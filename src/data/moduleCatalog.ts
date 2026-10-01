export interface ModuleSpec {
  id: string
  name: string
  description: string
  fields: string[]
  badge?: 'crit' | 'new'
}

export interface ModuleCategory {
  name: string
  color: string
  modules: ModuleSpec[]
}

const C = [
  'Başlık',
  'Açıklama',
  'İlgili personel / birim',
  'Tarih',
  'Durum',
  'Belge / dosya yolu',
  'Notlar',
]

function idOf(name: string) {
  const map: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' }
  let v = name.toLowerCase()
  for (const [k, val] of Object.entries(map)) v = v.split(k).join(val)
  return v.replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

function m(name: string, description: string, fields: string[] = C, badge?: 'crit' | 'new'): ModuleSpec {
  return { id: idOf(name), name, description, fields, badge }
}

export const moduleCatalog: ModuleCategory[] = [
  {
    name: 'Personel özlük & kimlik',
    color: '#185FA5',
    modules: [
      m('Temel kimlik bilgileri', 'Ad, TC, doğum', ['Ad soyad', 'TC kimlik no', 'Doğum tarihi', 'Doğum yeri', 'Cinsiyet', 'Medeni durum', 'Uyruk'], 'crit'),
      m('Fotoğraf yönetimi', 'Profil fotoğrafı', ['Fotoğraf yolu', 'Çekim tarihi', 'Güncelleme notu']),
      m('İletişim bilgileri', 'Telefon, adres, acil kişi', ['Cep telefonu', 'Sabit telefon', 'Kurumsal e-posta', 'Kişisel e-posta', 'Adres', 'Acil kişi', 'Yakınlık']),
      m('Kan grubu & organ bağışı', 'Acil tıbbi bilgi', ['Kan grubu', 'Organ bağışçısı', 'Bilinen alerjiler']),
      m('Unvan & rütbe kaydı', 'Mevcut unvan ve geçmiş', ['Unvan', 'Başlangıç tarihi', 'Önceki unvan', 'Terfi beklentisi']),
      m('Birim & pozisyon', 'Birim, yer, amir', ['Birim', 'Çalışma yeri', 'Direkt amir', 'Birimdeki görevi']),
      m('İşe başlama & kıdem', 'Otomatik kıdem hesabı', ['İşe başlama tarihi', 'Toplam hizmet', 'Staj/geçici görev notu']),
      m('Aile bilgileri', 'Eş, çocuk, bağımlı', ['Yakınlık', 'Ad soyad', 'Doğum tarihi', 'Meslek', 'Telefon']),
      m('Askerlik durumu', 'Tecil, terhis, muafiyet', ['Durum', 'Terhis tarihi', 'Tecil bitiş tarihi', 'Muafiyet gerekçesi']),
      m('Engellilik & özel durum', 'İş kısıtı ve ihtiyaçlar', ['Engellilik oranı', 'Engel türü', 'İş kısıtlamaları', 'Özel düzenleme ihtiyacı']),
      m('Pasaport & vize bilgisi', 'Yurt dışı belge takibi', ['Pasaport no', 'Son kullanma', 'Vize durumu', 'Seyahat kısıtı']),
      m('Sosyal güvenlik & sigorta', 'SGK ve poliçe bilgileri', ['SGK sicil no', 'Sigorta başlangıcı', 'Sağlık sigortası poliçesi']),
    ],
  },
  {
    name: 'Eğitim & yetkinlik',
    color: '#0F6E56',
    modules: [
      m('Eğitim geçmişi', 'Okul, bölüm, mezuniyet', ['Seviye', 'Okul', 'Bölüm', 'Mezuniyet yılı', 'Diploma durumu']),
      m('Lisansüstü & doktora', 'Tez ve program takibi', ['Program', 'Üniversite', 'Tez konusu', 'Durum', 'Mezuniyet tarihi']),
      m('Sertifika & lisans', 'Geçerlilik ve belge takibi', ['Sertifika adı', 'Veren kurum', 'Veriliş tarihi', 'Son kullanma', 'Belge yolu'], 'crit'),
      m('Dil yetkinliği', 'Dil ve seviye', ['Dil', 'CEFR seviye', 'Okuma', 'Yazma', 'Konuşma', 'Sınav puanı']),
      m('Teknik beceri envanteri', 'Ehliyet ve özel beceriler', ['Beceri türü', 'Beceri adı', 'Lisans sınıfı', 'Son kullanma', 'Belge yolu']),
      m('Katıldığı kurslar', 'Kurs ve seminer kayıtları', ['Kurs adı', 'Düzenleyen kurum', 'Başlangıç', 'Bitiş', 'Saat', 'Belge']),
      m('Eğitim ihtiyaç analizi', 'Eksik yetkinlik ve öneriler', ['Eksiklik', 'Önerilen eğitim', 'Öncelik', 'Bütçe durumu'], 'new'),
      m('Görevde yetiştirme planı', 'Mentörlük ve rotasyon', ['Mentör', 'Hedef yetkinlik', 'Başlangıç', 'Bitiş', 'İlerleme notu']),
    ],
  },
  {
    name: 'İzin yönetimi',
    color: '#854F0B',
    modules: [
      m('Yıllık izin planlaması', '12 aylık çizelge', ['Hak gün', 'Planlanan tarihler', 'Onay durumu', 'Birim müsaitliği'], 'crit'),
      m('İzin talep & onay akışı', 'Talep, onay, red', ['Başlangıç', 'Bitiş', 'İzin türü', 'Gerekçe', 'Onaylayan', 'Red gerekçesi']),
      m('Kullanılan / kalan izin', 'Bakiye takibi', ['Toplam hak', 'Kullanılan', 'Kalan', 'Devir', 'Devir son tarihi']),
      m('Mazeret izni', 'Mazeret izinleri', ['Mazeret türü', 'Yasal süre', 'Belge istendi', 'Belge teslim tarihi']),
      m('Ücretsiz izin', 'Ücretsiz izin takibi', ['Süre', 'Onay mercii', 'Ücret kesintisi', 'SGK bildirimi']),
      m('Doğum & babalık izni', 'Yasal süreler', ['Beklenen doğum', 'İzin başlangıcı', 'Toplam süre', 'Erken doğum notu']),
      m('İzin çakışma kontrolü', 'Birim eşik uyarısı', ['Birim', 'Minimum eşik', 'Çakışma günü', 'Uyarı notu'], 'new'),
      m('Resmi tatil takvimi', 'Tatil günleri', ['Tatil adı', 'Tarih', 'Özel gün mü', 'İzin hesabına etkisi']),
    ],
  },
  {
    name: 'Yoklama & zaman takibi',
    color: '#993C1D',
    modules: [
      m('Günlük yoklama girişi', 'Var/yok/geç/erken', ['Durum', 'Giriş saati', 'Çıkış saati', 'Not', 'Giren kişi'], 'crit'),
      m('Toplu yoklama girişi', 'Tüm personel tek ekran', ['Tarih', 'Varsayılan durum', 'Liste notu']),
      m('Geç gelme kaydı & analizi', 'Dakika ve trend', ['Geç dakika', 'Gerekçe', 'Aylık tekrar', 'Sınır uyarısı']),
      m('Fazla mesai kaydı', 'Onaylı mesai', ['Başlangıç', 'Bitiş', 'Gerekçe', 'Onay', 'Telafi/ücret']),
      m('Devamsızlık sebebi analizi', 'Sebep kategorileri', ['Sebep', 'Belge var mı', 'Tekrar uyarısı']),
      m('Devamsızlık eşik uyarısı', 'Aylık/yıllık eşikler', ['Aylık eşik', 'Yıllık eşik', 'Bildirim şekli'], 'new'),
    ],
  },
  {
    name: 'Görev & iş takibi',
    color: '#534AB7',
    modules: [
      m('Görev atama', 'Kime, ne, öncelik', ['Başlık', 'Açıklama', 'Atanan kişi', 'Başlangıç', 'Deadline', 'Öncelik', 'Belge'], 'crit'),
      m('Görev durum takibi', 'Durum ve ilerleme', ['Durum', 'Tamamlanma yüzdesi', 'Son güncelleme', 'Geçmiş notu']),
      m('Alt görev & adım takibi', 'Büyük işi parçala', ['Alt görev', 'Sorumlu', 'Son tarih', 'Durum']),
      m('Görev teslim tarihi hatırlatıcısı', 'Bildirim yönetimi', ['1 hafta önce', '1 gün önce', 'Sabah saati', 'Gecikme bildirimi']),
      m('Görev geçmişi & arşiv', 'Kim ne yaptı', ['Tamamlanma tarihi', 'Personel notu', 'Müdür değerlendirmesi']),
      m('Görev bağımlılığı', 'Önceki görev bağlantısı', ['Önceki görev', 'Bağımlılık uyarısı', 'Gecikme etkisi'], 'new'),
      m('İş yükü görünümü', 'Kim ne kadar meşgul', ['Açık görev', 'Yaklaşan deadline', 'Tahmini saat', 'Dağılım önerisi'], 'new'),
      m('Yinelenen görev şablonu', 'Periyodik görevler', ['Şablon', 'Sıklık', 'Atanan kişi', 'Sonraki açılma']),
    ],
  },
  {
    name: 'Planlama & takvim',
    color: '#3B6D11',
    modules: [
      m('Aylık iş planı', 'Tüm aktiviteler', ['Plan başlığı', 'Aktiviteler', 'Tamamlanma oranı', 'Devredenler']),
      m('Günlük ajanda', 'O günün listesi', ['Öncelikli işler', 'Toplantılar', 'Serbest not', 'Günün özeti']),
      m('Hatırlatıcı & alarm yönetimi', 'Önemli tarihler', ['Başlık', 'Tarih saat', 'Tekrar', 'Öncelik']),
      m('Önemli tarihler listesi', 'Doğum günü ve yıl dönümü', ['Başlık', 'Kişi', 'Hatırlatma günü', 'Yıllık tekrar'], 'new'),
    ],
  },
  {
    name: 'Emir & direktifler',
    color: '#712B13',
    modules: [
      m('Yazılı emir kaydı', 'Tarih, içerik, tebliğ', ['Emir no', 'Tarih', 'İçerik', 'Muhatap', 'Tebliğ tarihi', 'İmza durumu', 'Belge'], 'crit'),
      m('Sözlü emir notu', 'Saat damgalı not', ['Not', 'Tarih saat', 'Muhatap', 'Takip görevi']),
      m('Emir tebliğ durumu', 'Kim aldı', ['Tebliğ edilenler', 'Tebliğ edilmeyenler', 'Hatırlatma notu']),
      m('Emir arşivi & arama', 'Filtrelenebilir arşiv', ['Tarih aralığı', 'Kişi', 'Anahtar kelime', 'Durum']),
      m('Karşı emir & iptal', 'Önceki emri iptal', ['İptal edilen emir', 'Gerekçe', 'İptal tarihi', 'Bilgilendirme']),
    ],
  },
  {
    name: 'Takdir & disiplin',
    color: '#72243E',
    modules: [
      m('Takdir & ödül kaydı', 'Ödül ve gerekçe', ['Tür', 'Gerekçe', 'Tarih', 'Sicile işlendi', 'Belge'], 'crit'),
      m('Sözlü uyarı kaydı', 'Sebep ve şahit', ['Konu', 'Tarih', 'Şahit', 'Personel tepkisi']),
      m('Yazılı ihtar kaydı', 'Belge ve tebliğ', ['İhtar no', 'Konu', 'Belge', 'Tebliğ tarihi', 'İtiraz bitiş']),
      m('Disiplin soruşturması', 'Süreç ve sonuç', ['Konu', 'Açılış', 'Soruşturmacı', 'Süreç notu', 'Karar', 'Karar tarihi']),
      m('Şikayet & itiraz kaydı', 'İtiraz ve yanıt', ['Konu', 'Tarih', 'Müdür yanıtı', 'Sonuç']),
    ],
  },
  {
    name: 'Sağlık & refah',
    color: '#993556',
    modules: [
      m('Sağlık raporu kaydı', 'Rapor ve muafiyet', ['Başlangıç', 'Bitiş', 'Süre', 'Muafiyet', 'Hastane notu', 'Belge teslim'], 'crit'),
      m('İş kazası kaydı', 'Kaza ve tutanak', ['Tarih saat', 'Yer', 'Özet', 'Yaralanma', 'Tanıklar', 'SGK bildirimi']),
      m('Periyodik muayene takibi', 'Muayene tarihleri', ['Son muayene', 'Sonraki muayene', 'Sonuç', 'Kurum']),
      m('Psikolojik destek talebi', 'Gizli destek talebi', ['Talep var mı', 'Talep tarihi', 'Yönlendirme']),
      m('Fiziksel kısıtlama notu', 'İş kısıtları', ['Kısıt türü', 'Gerekçe', 'Geçici mi', 'Bitiş']),
    ],
  },
  {
    name: 'Envanter & zimmet',
    color: '#3B6D11',
    modules: [
      m('Demirbaş zimmet kaydı', 'Eşya kimde', ['Demirbaş adı', 'Seri no', 'Kişi', 'Zimmet tarihi', 'Durum', 'Belge', 'Değer'], 'crit'),
      m('Arızalı ürün kaydı', 'Arıza bildirimleri', ['Ürün', 'Açıklama', 'Bildiren', 'Tarih', 'Durum']),
      m('Bakım & periyodik kontrol', 'Bakım takibi', ['Bakım türü', 'Son bakım', 'Sonraki bakım', 'İşlemler', 'Maliyet', 'Firma']),
      m('Emanet ürün takibi', 'Geçici ürün', ['Ürün', 'Alan kişi', 'Verilme', 'Geri alınma', 'Teslim', 'Durum']),
      m('Stok & sarf malzeme', 'Miktar ve kritik seviye', ['Malzeme', 'Miktar', 'Birim', 'Kritik seviye', 'Son kullanma', 'Konum']),
      m('Garanti & sigorta takibi', 'Bitiş uyarıları', ['Garanti başlangıç', 'Garanti bitiş', 'Poliçe no', 'Sigorta bitiş', 'Bedel'], 'new'),
      m('Envanter sayım çizelgesi', 'Sayım ve fark', ['Sayım tarihi', 'Sayım yapan', 'Kayıt adet', 'Fiili adet', 'Fark', 'Gerekçe']),
      m('İtfa & hurda kaydı', 'Kullanım dışı', ['Ürün', 'Gerekçe', 'Tarih', 'İmha yöntemi', 'Tutanak']),
    ],
  },
  {
    name: 'Nöbet & vardiya',
    color: '#185FA5',
    modules: [
      m('Nöbet çizelgesi', 'Aylık plan', ['Ay yıl', 'Yer', 'Süre', 'Nöbetçi', 'Vardiya', 'Tekrar']),
      m('Nöbet devir teslim notu', 'Teslim eden/alan', ['Teslim eden', 'Teslim alan', 'Tarih saat', 'Olaylar', 'Sorunlar', 'Onay'], 'crit'),
      m('Nöbet takas talebi', 'Takas ve onay', ['Talep eden', 'Takas kişi', 'Tarihler', 'Onay', 'Çizelge güncellendi']),
      m('Nöbet muafiyet kaydı', 'Muafiyet', ['Gerekçe', 'Başlangıç', 'Bitiş', 'Belge']),
    ],
  },
  {
    name: 'Toplantı & iletişim',
    color: '#0F6E56',
    modules: [
      m('Toplantı planlama', 'Gündem ve katılımcılar', ['Başlık', 'Tarih saat', 'Yer', 'Süre', 'Katılımcılar', 'Gündem', 'Hazırlık']),
      m('Toplantı tutanağı', 'Kararlar ve sorumlular', ['Toplantı', 'Katılanlar', 'Özet', 'Kararlar', 'Sorumlu', 'Son tarih', 'Onay']),
      m('Karar takip listesi', 'Karar uygulama', ['Karar', 'Sorumlu', 'Son tarih', 'Durum', 'Not'], 'crit'),
      m('Duyuru yönetimi', 'Duyuru ve okundu', ['Başlık', 'İçerik', 'Hedef kitle', 'Yayın tarihi', 'Önem', 'Okundu takibi']),
      m('Ziyaretçi kaydı', 'Giriş çıkış', ['Ziyaretçi', 'Kurum', 'Amaç', 'Görüştüğü kişi', 'Giriş', 'Çıkış', 'Erişim']),
    ],
  },
  {
    name: 'Performans & gelişim',
    color: '#534AB7',
    modules: [
      m('Dönemsel performans değerlendirmesi', 'Hedef ve puan', ['Dönem', 'Hedefler', 'Gerçekleşme', 'Puan', 'Müdür yorumu', 'Öz değerlendirme'], 'crit'),
      m('Hedef belirleme & takibi', 'Yıllık hedefler', ['Hedef', 'Ölçüm kriteri', 'Hedef tarihi', 'İlerleme', 'Engel'], 'new'),
      m('Kariyer planlaması notu', 'Terfi ve hazırlık', ['Terfi adayı', 'Hazır olma', 'Eksik yetkinlikler', 'Öneri']),
      m('Beceri gelişim grafiği', 'Yetkinlik ölçümü', ['Beceri', 'Başlangıç', 'Dönemsel ölçüm', 'Hedef seviye'], 'new'),
    ],
  },
  {
    name: 'Belge & evrak yönetimi',
    color: '#5F5E5A',
    modules: [
      m('Dijital belge arşivi', 'PDF/foto evrak', ['Başlık', 'Tür', 'İlgili kişi', 'Yüklenme', 'Dosya', 'Gizlilik'], 'crit'),
      m('Belge son kullanma uyarısı', 'Yenileme takibi', ['Belge', 'Son kullanma', 'Uyarı eşiği', 'Yenilendi']),
      m('Belge şablonları', 'Hazır formlar', ['Şablon adı', 'İçerik', 'Son düzenleme', 'Belge oluştur'], 'new'),
      m('Gelen / giden evrak kaydı', 'Resmi yazı', ['Evrak no', 'Yön', 'Kurum', 'Konu', 'Tarih', 'Havale', 'Sonuç']),
    ],
  },
  {
    name: 'Mali & özlük hakları',
    color: '#854F0B',
    modules: [
      m('Maaş bilgisi kaydı', 'Brüt, net, yan ödeme', ['Brüt maaş', 'Net maaş', 'Yan ödemeler', 'Güncelleme tarihi']),
      m('Harcırah & yol masrafı', 'Görev giderleri', ['Görev', 'Tür', 'Gün', 'Toplam', 'Belge', 'Ödeme']),
      m('Giyim yardımı takibi', 'Dağıtım', ['Yardım türü', 'Dağıtım tarihi', 'Beden', 'Teslim']),
      m('İkramiye & prim takibi', 'Tutar ve gerekçe', ['Tür', 'Tutar', 'Ödeme tarihi', 'Gerekçe']),
    ],
  },
  {
    name: 'Güvenlik & risk',
    color: '#A32D2D',
    modules: [
      m('Güvenlik yetki seviyesi', 'Alan erişimi', ['Seviye', 'Alanlar', 'Başlangıç', 'Bitiş', 'Veren kişi'], 'crit'),
      m('Güvenlik ihlali kaydı', 'Olay ve sonuç', ['Tarih saat', 'Tür', 'Özet', 'Kişiler', 'Önlem', 'Sonuç']),
      m('KKD zimmet kaydı', 'Koruyucu ekipman', ['KKD adı', 'Kişi', 'Teslim', 'Ömür bitiş', 'Durum']),
      m('Acil durum eylem planı', 'Senaryolar', ['Senaryo', 'Sorumlular', 'Tahliye yolu', 'Toplanma noktası', 'Son tatbikat', 'Sonraki tatbikat']),
    ],
  },
  {
    name: 'Araç & ulaşım',
    color: '#185FA5',
    modules: [
      m('Araç zimmet & kullanım', 'Tahsis', ['Plaka', 'Model', 'Sürücü', 'Başlangıç', 'Durum']),
      m('Araç kilometre takibi', 'KM kayıtları', ['Çıkış km', 'Dönüş km', 'Toplam', 'Güzergah']),
      m('Yakıt & bakım giderleri', 'Yakıt dolumu', ['Tarih', 'Litre', 'Maliyet', 'Fiş', 'Yakıt türü']),
      m('Araç bakım takvimi', 'Bakım ve muayene', ['Yağ değişimi', 'Sonraki bakım', 'Muayene bitiş', 'Sigorta bitiş', 'Lastik değişimi']),
    ],
  },
  {
    name: 'Denetim & teftiş',
    color: '#0F6E56',
    modules: [
      m('Denetim planlaması', 'Plan ve hazırlık', ['Başlık', 'Tarih', 'Yer/birim', 'Denetçi', 'Hazırlık']),
      m('Teftiş bulguları', 'Tespitler', ['Denetim', 'Bulgu türü', 'Açıklama', 'Sorumlu', 'Düzeltme son tarihi']),
      m('Düzeltici faaliyet takibi', 'Önlem ve kapanış', ['Bulgu', 'Planlanan önlem', 'Uygulama tarihi', 'Sonuç', 'Kapanış'], 'crit'),
      m('İç kontrol listesi', 'Rutin kontroller', ['Kontrol maddesi', 'Sıklık', 'Son kontrol', 'Sonuç', 'Not']),
    ],
  },
  {
    name: 'Raporlama & analitik',
    color: '#534AB7',
    modules: [
      m('Aylık personel özet raporu', 'Devamsızlık, görev, izin', ['Dönem', 'Devamsızlık özeti', 'İzin özeti', 'Görev özeti', 'Disiplin özeti'], 'crit'),
      m('Özelleştirilebilir dashboard', 'Kart ayarları', ['Widget seçimi', 'Sıralama', 'Yenileme sıklığı', 'Tema'], 'new'),
      m('Anlık durum özeti', 'Bugün neler var', ['İzinli personel', 'Bugünkü görevler', 'Nöbetçi', 'Bekleyen onay']),
      m('Karşılaştırmalı dönem raporu', 'Dönem karşılaştırma', ['Tür', 'Metrikler', 'Grafik türü', 'Anormallik tespiti']),
    ],
  },
  {
    name: 'Uygulama & sistem',
    color: '#5F5E5A',
    modules: [
      m('Yerel veritabanı (offline)', 'İnternetsiz kullanım', ['Veritabanı türü', 'Otomatik yedek', 'Veri boyutu'], 'crit'),
      m('Biyometrik giriş', 'Parmak izi/yüz', ['Aktif mi', 'Yedek PIN', 'Hatalı giriş sınırı', 'Kilit süresi']),
      m('Denetim izi (audit log)', 'Kim ne yaptı', ['Tarih', 'Kullanıcı', 'Kayıt', 'Eski değer', 'Yeni değer']),
      m('Veri şifreleme', 'AES-256', ['Durum', 'Standart', 'Hassas alanlar'], 'crit'),
      m('Bildirim yönetimi', 'Bildirim ayarları', ['İzin', 'Görev', 'Sertifika', 'Devamsızlık', 'Günlük özet', 'Sessiz saatler']),
      m('Uygulama içi arama', 'Tüm kayıtlarda ara', ['Kapsam', 'Filtreler', 'Son aramalar'], 'new'),
      m('Çoklu profil / kullanıcı', 'Kullanıcı yönetimi', ['Kullanıcı', 'Yetki', 'Veri ayrımı', 'Oturum']),
    ],
  },
]

export function findModule(moduleId: string) {
  for (const cat of moduleCatalog) {
    const found = cat.modules.find((m) => m.id === moduleId)
    if (found) return { module: found, category: cat }
  }
  return null
}

export function allModules() {
  return moduleCatalog.flatMap((c) => c.modules.map((m) => ({ ...m, category: c.name, color: c.color })))
}

export const moduleCount = moduleCatalog.reduce((n, c) => n + c.modules.length, 0)
