# BecaBot México

Asesor de becas en México con Inteligencia Artificial y búsqueda híbrida (RAG + Web), gestión de historial de conversaciones, recordatorios automáticos por correo y suscripción Premium con Mercado Pago.

## Requisitos previos

- **Node.js** 20 o superior
- **pnpm** (o `npm`)

## 1. Instalación

Descomprime el proyecto, abre una terminal en la carpeta raíz e instala las dependencias:

```bash
pnpm install
```
*(Si usas npm: `npm install`)*

## 2. Variables de entorno

Asegúrate de tener el archivo `.env.local` en la raíz del proyecto con las siguientes claves:

```env
OPENROUTER_API_KEY="tu_api_key_openrouter"
GROQ_API_KEY="tu_api_key_groq"
INSFORGE_URL="https://pm3ezvsp.us-east.insforge.app"
INSFORGE_API_KEY="tu_api_key_insforge"
NEXT_PUBLIC_INSFORGE_URL="https://pm3ezvsp.us-east.insforge.app"
NEXT_PUBLIC_INSFORGE_ANON_KEY="tu_anon_key_insforge"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
MP_ACCESS_TOKEN="TEST-tu_token_mercadopago"
MP_SANDBOX="true"
```

## 3. Ejecutar en desarrollo

```bash
pnpm dev
```
*(Si usas npm: `npm run dev`)*

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 4. Compilar para producción

```bash
pnpm build
pnpm start
```
