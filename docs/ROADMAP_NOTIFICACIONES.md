# 🚀 Miluarte — Roadmap de Notificaciones & App Móvil (PWA)

Documento de referencia técnico y operativo para el sistema de alertas inmediatas y evolución a app móvil instalable.

---

## ⚡ Parte 1 — Bot de Telegram (Implementado en el Backend)

### ¿Cómo funciona?
Cada vez que un visitante o cliente envía un formulario de **Contacto** o una solicitud de **Encargo**, el backend (`api/send-contact.ts` y `api/send-booking.ts`) almacena el mensaje en la base de datos (KV/Redis), envía el correo de Resend (si está activo) y lanza una notificación instantánea al bot de Telegram configurado.

### Configuración requerida (Paso a paso para Nerea):

1. **Crear el bot en Telegram:**
   - Abre Telegram y busca `@BotFather`.
   - Envía el comando `/newbot`.
   - Sigue las instrucciones (nombre del bot ej. *Miluarte Notificaciones*, y username ej. *miluarte_bot*).
   - BotFather generará un token similar a: `7123456789:AAFxxx...`
   - Configúralo en Vercel (o en tu `.env.local`): `TELEGRAM_BOT_TOKEN`.

2. **Obtener el `chat_id` de Nerea:**
   - Desde la cuenta de Telegram de Nerea, abre el bot creado y presiona **Iniciar** (o envíale un mensaje cualquiera como `hola`).
   - Abre en el navegador la siguiente URL sustituyendo `<TOKEN>` por el token real:
     ```text
     https://api.telegram.org/bot<TOKEN>/getUpdates
     ```
   - En el JSON devuelto, busca `message.chat.id` (un número entero, ej. `123456789`).
   - Configúralo en Vercel (o en tu `.env.local`): `TELEGRAM_CHAT_ID`.

---

## 📱 Parte 2 — PWA + Web Push + Analytics (Mediano Plazo)

### Arquitectura Objetivo
```
Miluarte (Web & CMS)
├── PWA (Instalable en pantalla de inicio de Android / iOS)
├── Web Push API (Notificaciones push nativas al dispositivo)
├── Vercel Analytics (Métricas de visitantes, países y fuentes de tráfico)
└── Gestión móvil adaptada del panel
```

### Fase A: PWA Manifest & Service Worker
- `public/site.webmanifest` ya configurado con standalone display y temas.
- Metadatos en `index.html` vinculados.

### Fase B: Web Push Notifications
- Generación de claves VAPID (`npx web-push generate-vapid-keys`).
- Almacenamiento de la suscripción del navegador de Nerea en Redis (`push:subscription:nerea`).
- Dispatcher con `web-push` en endpoints de eventos.
- Service Worker en `public/sw.js` para recibir eventos push y abrir `/admin` al pulsar la alerta.

### Fase C: Métricas y Analytics
- `@vercel/analytics` y `@vercel/speed-insights` integrados en la aplicación.
- Conexión opcional con la API de Vercel para visualizar métricas directamente en el dashboard del CMS.

### Fase D: Experiencia Móvil CMS
- Vista de tarjetas responsivas y selector rápido de estados para la bandeja de mensajes/encargos.
