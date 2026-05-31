# CV Parser App

AI destekli CV analiz ve profil oluşturma uygulaması. CV'nizi yükleyin, yapay zeka otomatik olarak bilgilerinizi çıkarsın.

## Özellikler

- PDF ve DOCX format desteği
- Yerel AI modeli (Ollama + Gemma3) — verileriniz dışarı çıkmaz
- Multi-step wizard ile kolay profil oluşturma
- Türkçe ve İngilizce CV desteği

## Gereksinimler

- Node.js 20+
- Ollama (https://ollama.com/download/windows)
- Docker Desktop (opsiyonel)

## Kurulum

### 1. Repoyu klonla

```bash
git clone https://github.com/OmerTuregun/cv-parser-app.git
cd cv-parser-app
```

### 2. Bağımlılıkları yükle

```bash
npm install
```

### 3. Environment dosyasını oluştur

```bash
cp .env.example .env.local
```

Windows (PowerShell veya CMD):

```powershell
copy .env.example .env.local
```

### 4. Ollama kurulumu

```bash
ollama pull gemma3:12b
ollama serve
```

### 5. Uygulamayı başlat

```bash
npm run dev
```

Uygulama: http://localhost:3010

## Docker ile Çalıştırma

### Production

```bash
docker compose up -d
```

```powershell
.\scripts\ollama-setup.ps1
```

Uygulama: http://localhost:3010

### Development (hot reload)

```bash
docker compose -f docker-compose.dev.yml up
```

```powershell
.\scripts\ollama-setup.ps1 -Dev
```

Dev ortamında Ollama host portu **11435**'tir (yerel `ollama serve` genelde **11434** kullanır; böylece port çakışması olmaz). Uygulama konteyneri Ollama'ya Docker ağı üzerinden `http://ollama:11434` ile bağlanır.

Yerel Ollama zaten 11434'te çalışıyorsa dev compose'u olduğu gibi kullanın; production compose (`docker-compose.yml`) host **11434** eşler — çakışma varsa yerel Ollama'yı durdurun veya compose dosyasında portu `11435:11434` olarak değiştirin.

Kısmen oluşturulmuş konteynerler varsa:

```bash
docker compose -f docker-compose.dev.yml down
docker rm -f cv-parser-ollama-dev cv-parser-app-dev
```

| Servis | Port (host) | URL |
|--------|-------------|-----|
| Next.js | 3010 | http://localhost:3010 |
| Ollama (production) | 11434 | http://localhost:11434 |
| Ollama (dev compose) | 11435 | http://localhost:11435 |

### Durdurma

```bash
docker compose down
```

## Teknolojiler

- Next.js 14 (App Router), TypeScript, Tailwind CSS + shadcn/ui, Zustand, Ollama (Gemma3:12b), Docker
