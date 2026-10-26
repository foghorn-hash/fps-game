# 📜 MIT-Lisenssi & Usein Kysytyt Kysymykset (FAQ)
## Pelin julkaisu, kaupallistaminen, Apple App Store ja Google Play

Tämä asiakirja selventää **MIT-lisenssin** ehtoja, oikeuksia ja velvollisuuksia liittyen **Dust & Lead: 3D Wild West FPS** -peliin sekä sen WordPress-lisäosaan ja mobiilisovelluksiin.

---

## 📌 1. Mikä on MIT-lisenssi pähkinänkuoressa?

MIT-lisenssi on yksi maailman suosituimmista ja sallivimmista (permissive) avoimen lähdekoodin lisensseistä. Se antaa kenelle tahansa täyden vapauden:

- **Käyttää** koodia mihin tahansa tarkoitukseen (yksityinen, akateeminen, kaupallinen).
- **Muokata** koodia ja luoda siitä uusia versioita (johdannaisteoksia).
- **Yhdistää** koodia osaksi suljettua, kaupallista ohjelmistoa.
- **Myydä** peliä tai sovellusta eteenpäin ilman rojalteja tai rojaltimaksuja alkuperäiselle tekijälle.
- **Julkaista** peli sellaisenaan tai muokattuna missä tahansa jakelukanavassa (App Store, Google Play, Steam, WordPress, oma verkkokauppa).

Ainoa lakisääteinen vaatimus on:
> **Alkuperäinen tekijänoikeusilmoitus ja lisenssiteksti (Copyright notice) on säilytettävä ohjelmiston mukana.**

---

## 🍏 2. Pelin julkaiseminen Apple App Storessa (iOS / iPadOS / macOS)

### Onko MIT-lisenssi yhteensopiva Apple App Storen kanssa?
**Kyllä, 100 % yhteensopiva.**  
Tämä on yksi MIT-lisenssin suurimmista eduista verrattuna esimerkiksi GPL-lisensseihin (GPLv2/GPLv3). GPL-lisenssin DRM-rajoitukset ovat usein ristiriidassa Applen App Store -ehtojen (EULA) kanssa, mutta MIT-lisenssissä ei ole tällaisia copyleft- tai DRM-rajoituksia.

### Miten täytät MIT-lisenssin vaatimuksen App Store -sovelluksessa?
Sinun ei tarvitse julkaista lähdekoodiasi App Storessa. Riittää, että sovelluksessa on jossain näkyvissä tekijänoikeustiedot:
1. **Sovelluksen sisällä**: Esim. *Settings* (Asetukset) tai *About / Credits* (Tietoja / Tekijät) -valikossa, jossa lukee tekijänoikeus ja MIT-lisenssiteksti:
   ```text
   Third-Party Licenses / Credits:
   Dust & Lead: 3D Wild West FPS
   Copyright (c) 2026 Matti Kiviharju
   Licensed under the MIT License.
   ```
2. **Tai App Store -tuotesivulla**: Voit lisätä linkin lisenssiin tai maininnan sovelluksen kuvauksen/tietojen loppuun.

### Miten verkkopeli paketoidaan iOS-sovellukseksi?
Koska Dust & Lead on rakennettu modernilla HTML5-, Three.js- ja TypeScript-teknologialla, sen voi paketoida natiiviksi iOS-sovellukseksi erittäin helposti:
- **Capacitor (Suositeltu)**: `@capacitor/core` ja `@capacitor/ios`. Luo aidon natiivin Xcode-projektin, joka suorittaa peliä suorituskykyisessä `WKWebView`-näkymässä 60 fps nopeudella ja tukee natiiveja ominaisuuksia (In-App Purchases, Game Center, haptinen palaute, äänet).
- **Apache Cordova**: Vastaava hybridi-kehys.
- **Natiivi Swift / SwiftUI `WKWebView`**: Voit luoda minimalistisen iOS-sovelluksen, joka lataa pelin lokaaleista `dist/`-tiedostoista.

### Apple App Store -tarkastustiimin vinkit:
- Muista liittää mukaan sovelluksen tietosuojaseloste (Privacy Policy URL).
- Jos peli käyttää kosketusohjaimia hiiren/näppäimistön sijaan mobiilissa, varmista virtuaalisten joystickien toimivuus kosketusnäytöillä.

---

## 🤖 3. Pelin julkaiseminen Google Playssä (Android)

### Onko MIT-lisenssi yhteensopiva Google Playn kanssa?
**Kyllä, täysin sallittu ja yleisesti käytetty.**  
Google Play Developer Distribution Agreement (DDA) sallii avoimen lähdekoodin ja MIT-lisensoitujen teosten julkaisun sekä ilmaisina että maksullisina sovelluksina.

### Miten peli paketoidaan Android-sovellukseksi (.aab / .apk)?
1. **Capacitor (Suositeltu)**:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap init "Dust and Lead" "com.i4ware.dustandlead" --web-dir dist
   npm run build
   npx cap add android
   npx cap open android
   ```
   Tämä luo valmiin Android Studio -projektin, josta voit kääntää suoraan Google Playhin ladattavan `.aab` (Android App Bundle) -paketin.
2. **Trusted Web Activity (TWA) / Bubblewrap**:
   Googlen virallinen työkalu PWA-verkkopelien viemiseen suoraan Google Playhin ilman monimutkaista natiivikoodia.
3. **Android WebView (Kotlin / Java)**:
   Perinteinen Android-natiivisovellus, joka renderöi pelin Android Chromium WebView:ssä laitteistokiihdytetyllä WebGL2-tuella.

### Lisenssin esittäminen Androidissa:
- Sisällytä lisenssi sovelluksen "Credits" tai "Open Source Licenses" -näkymään tai asetuksiin.

---

## 💰 4. Kaupallistaminen, myynti ja mainokset

### Saanko myydä peliä maksullisena sovelluksena?
**Kyllä.** MIT-lisenssi antaa sinulle nimenomaisen oikeuden myydä ohjelmistoa ("...sell copies of the Software..."). Voit asettaa pelille kiinteän hinnan App Storessa tai Google Playssä (esim. 2,99 €).

### Voinko lisätä peliin sovelluksen sisäisiä ostoja (In-App Purchases) tai mainoksia?
**Kyllä.** Voit vapaasti integroida:
- Google Play Billing / Apple In-App Purchase (esim. uusia aseita, cowboy-hahmoja, kultapusseja).
- Mainosverkostoja (Google AdMob, Unity Ads, AppLovin).
- Palkkiovideoita (rewarded ads) lisäelämistä tai dynamiitista.

### Pitääkö minun maksaa rojaltimaksuja tai prosenttiosuutta alkuperäiselle tekijälle?
**Ei.** MIT-lisenssi on täysin maksuton ja rojaltiton (royalty-free). Kaikki tulot kuuluvat julkaisijalle.

---

## 🔒 5. Lähdekoodi ja suljettu kehitys

### Pitääkö minun julkaista muokattu lähdekoodini julkisesti?
**Ei.** Toisin kuin copyleft-lisenssit (GPL, AGPL), MIT-lisenssi **ei** velvoita sinua avaamaan tai jakamaan tekemiäsi muutoksia tai lisäyksiä. Voit pitää omat koodimuutoksesi täysin suljettuina (proprietary).

### Voinko vaihtaa pelin nimen, grafiikat ja brändin?
**Kyllä.** Voit vapaasti uudelleenbrändätä pelin, vaihtaa tekstejä, 3D-malleja, ääniä ja käyttöliittymää haluamallasi tavalla.

---

## 🛡️ 6. Vastuuvapauslauseke (Takuu ja vastuu)

MIT-lisenssi sisältää standardinmukaisen vastuuvapauslausekkeen:
- Ohjelmisto toimitetaan sellaisenaan ("AS IS") ilman minkäänlaista takuuta.
- Tekijä tai tekijänoikeuden haltija ei ole missään tilanteessa vastuussa mahdollisista vahingoista, tietojen menetyksestä tai korvausvaatimuksista, jotka johtuvat ohjelmiston käytöstä.

---

## ✅ 7. Julkaisijan tarkistuslista (App Store & Google Play)

Kun valmistelet julkaisua sovelluskauppoihin, varmista seuraavat asiat:

- [x] **Lisenssitiedot mukana**: Lisää `LICENSE`-teksti sovelluksen tietoihin tai asetuksiin (Credits / About).
- [x] **Yksityisyydensuoja**: Laadi yksityisyydensuojaseloste (Privacy Policy URL), jota sekä Apple että Google vaativat.
- [x] **Ikärajaluokitus**: Dust & Lead sisältää sarjakuvamaista länkkäriammuskelua (revolverit, räjähteet). Vastaa App Storen ja Google Playn ikärajakyselyihin totuudenmukaisesti (yleensä luokitus PEGI 7/12 tai ESRB Everyone 10+ / Teen).
- [x] **Suorituskyky ja WebGL2**: Varmista, että laitteistokiihdytys on aktiivinen sovelluksen WebView-asetuksissa sulavan 60 fps ruudunpäivityksen takaamiseksi.
- [x] **Äänien hallinta**: Varmista, että peli kunnioittaa laitteen äänettömän tilan (mute switch) kytkintä iOS:ssa.
