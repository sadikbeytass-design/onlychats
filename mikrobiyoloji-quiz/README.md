# Günün Mikrobiyolojisi

Windows'ta çalışan, her gün **10 yeni Tıbbi Mikrobiyoloji sorusu** veren post-it tarzı bir çalışma uygulaması.
Kurulum gerektirmez, internet bağlantısı gerektirmez.

## Kullanım

1. `mikrobiyoloji-quiz` klasörünü bilgisayarına indir (klasörün tamamı gerekli).
2. **`Baslat.bat`** dosyasına çift tıkla — uygulama varsayılan tarayıcıda açılır.
   (İstersen doğrudan `index.html` dosyasına da çift tıklayabilirsin.)
3. Ekranda o günün 10 sorusu post-it olarak durur. **Bir post-it'e tıkladığında arkasına döner ve cevabı gösterir**; tekrar tıklayınca soruya döner.

Kısayol istersen: `Baslat.bat` dosyasına sağ tık → *Kısayol oluştur* → kısayolu masaüstüne taşı.

## Nasıl çalışır

- Uygulama her açılışta tarihi kontrol eder. Gün değiştiyse **yeni 10 soru** seçer.
- Aynı gün içinde kaç kez açarsan aç, o günün soruları değişmez.
- **Sorulan sorular bir daha sorulmaz.** Hangi soruların sorulduğu tarayıcının yerel hafızasında (localStorage) tutulur.
- Sorular konular arasında dengeli dağıtılır: Bakteriyoloji, Seroloji, Mikoloji, Parazitoloji, IFA, Flow Sitometri.
- Banka bittiğinde otomatik olarak yeni bir tur başlar ve bunu ekranda bildirir.
- Sayfanın altındaki **Önceki günler** bölümünden geçmiş günlerin soru ve cevaplarını tekrar okuyabilirsin.

## Düğmeler

| Düğme | İşlevi |
|---|---|
| Tüm cevapları aç | 10 post-it'i birden çevirir |
| Tümünü kapat | Hepsini soru yüzüne döndürür |
| Yazdır | O günün sorularını ve cevaplarını yazdırır / PDF'e kaydeder |
| Geçmişi sıfırla | Tüm kayıtları siler, sorular en baştan sorulmaya başlar |

## Yeni soru eklemek

`sorular.js` dosyasını Not Defteri ile aç, listenin sonundaki `];` satırının **üstüne** aynı formatta satır ekle:

```js
{k:"Bakteriyoloji",s:"Soru metni burada?",c:"Cevap metni burada."},
```

`k` alanı konu adıdır; mevcut konu adlarından birini kullanmak konu dengesini korur.
Dosyayı **UTF-8** olarak kaydet, yoksa Türkçe karakterler bozulur.

## Notlar

- Geçmiş kaydı tarayıcıya ve klasör konumuna bağlıdır. Tarayıcı geçmişini/site verilerini temizlersen ya da klasörü başka bir yola taşırsan kayıt sıfırlanabilir.
- Farklı tarayıcılarda açarsan (Chrome / Edge) her biri kendi kaydını tutar; tek bir tarayıcıda kalmak en iyisi.
