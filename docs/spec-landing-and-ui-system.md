# Especificación de Diseño e Interfaz: Landing Page Principal, Chatbot `/asesor`, Sistema Neutral Blanco/Negro y SVGs de Identidad

> **Estado:** Especificación aprobada para implementación  
> **Alcance:** Nueva Landing Page en `/`, reubicación del Chatbot a `/asesor`, Header Unificado (`SiteHeader`), Tokens de Diseño (`app/globals.css`) y Sistema de Ilustraciones/Iconos SVG (`app/components/svg/`).  
> **Disciplina de diseño:** *Interface Design Craft (Impeccable)* + *React 19 Best Practices* + *Principio de Responsabilidad Única (SRP)*.

---

## 1. Exploración de Dominio e Intención de Diseño (Craft Foundations)

Siguiendo la metodología de diseño de producto:

- **¿Quién es la persona?** Un estudiante mexicano (bachillerato, licenciatura o posgrado) o padre de familia buscando claridad entre decenas de convocatorias públicas y privadas (Benito Juárez, Jóvenes Escribiendo el Futuro, CONAHCYT, UNAM, IPN, fundaciones) llenas de PDFs extensos y fechas confusas.
- **¿Qué debe lograr?** Entender de un vistazo qué es BecaBot en la **Landing Page (`/`)**, confiar en que las respuestas provienen de documentos verificados con citas reales, y pasar con un clic (o con una pregunta rápida) al **Asesor Interactivo (`/asesor`)**.
- **¿Cómo debe sentirse?** **Editorial, arquitectónico, confiable y nítido (Estilo Airbnb monocromático en Blanco y Negro).** Luz limpia, contraste tipográfico impecable entre negro carbón (`#111111`) y blanco papel (`#FFFFFF` / `#F7F7F7`), bordes de precisión (`1px solid #EBEBEB`), jerarquía por peso y espacio, y **gráficos vectoriales (SVGs) de trazo geométrico** que dan identidad única tanto a la Landing como al Chatbot.

### Exploración de los 4 Pilares
1. **Dominio:** Convocatoria oficial, sello de verificación documental, expediente académico, calendario de cierres en México, trazabilidad RAG vs. Web.
2. **Mundo de color (Blanco, Negro y Neutros estilo Airbnb):**
   - Lienzo principal: Blanco puro `#FFFFFF` (`--color-bg`)
   - Superficie secundaria / tarjetas en reposo: Piedra papel `#F7F7F7` (`--color-surface`)
   - Superficie elevada / hover: Gris cálido tenue `#F1F1F1` (`--color-surface-2`)
   - Superficie de contraste inverso (bloques destacados / CTA / sello): Negro carbón `#111111` (`--color-ink`) y `#222222` (`--color-primary`)
   - Texto primario: `#111111` (`--color-text`)
   - Texto secundario: `#484848` (`--color-secondary`)
   - Texto terciario / apoyo: `#717171` (`--color-tertiary`, el gris característico de Airbnb)
   - Bordes y divisores: `#EBEBEB` (`--color-line`) y `#DDDDDD` (`--color-line-strong`)
3. **Elemento Firma (Signature):** **Sello y Diagramas SVG de Trazabilidad Documental en Blanco y Negro** — emblemas e ilustraciones vectoriales con línea arquitectónica fina (`1.25px`–`1.75px`), retícula punteada y nodos de contraste sólido (`#111111` sobre `#FFFFFF`) que representan el flujo *Documento Oficial → Verificación RAG → Beca en México*, presentes tanto en los bloques de la Landing Page como en el estado inicial y cabeceras del Chatbot.
4. **Rechazo de Defaults Genéricos:**
   - *Rechazado:* Abrir directamente el chat en `/` sin contexto de producto → *Adoptado:* Landing Page editorial en `/` que presenta el valor, cobertura en México, cómo funciona el RAG y acceso directo a `/asesor`.
   - *Rechazado:* Gradientes neón/azules oscuros genéricos de IA → *Adoptado:* Sistema monocromático de alto contraste Blanco y Negro estilo Airbnb (`#FFFFFF`, `#F7F7F7`, `#717171`, `#111111`).
   - *Rechazado:* Iconos genéricos sueltos sin lenguaje visual → *Adoptado:* Sistema unificado de SVGs de marca (`BecaSealSvg`, `RagPipelineSvg`, `MexicoMapGridSvg`, `CalendarStampSvg`) compartidos entre Landing y Chatbot.

---

## 2. Arquitectura de Rutas y Navegación Unificada

### 2.1 Mapa de Rutas
| Ruta | Rol | Tipo de Layout / Scroll |
|---|---|---|
| `/` (`app/page.tsx`) | **Landing Page principal** (Hero, buscador rápido que redirige a `/asesor`, cómo funciona el RAG, cobertura exclusiva en México, comparativa de fuentes y CTA). | Scroll vertical fluido de documento completo. |
| `/asesor` (`app/asesor/page.tsx`) | **Chatbot / Asesor de Becas** (Vista dedicada con panel lateral informativo `InfoPanel` y espacio de conversación `ChatWorkspace`). Soporta `?q=...` para iniciar una pregunta enviada desde la Landing. | Viewport de aplicación (`h-[calc(100dvh-4rem)] overflow-hidden`) con scroll interno en la lista de mensajes. |
| `/premium` (`app/premium/page.tsx`) | Planes Becario vs. Premium y tabla comparativa. | Scroll vertical fluido. |
| `/login`, `/signup`, `/verify-email` | Flujo de autenticación con InsForge Auth. | Centrado vertical con scroll limpio. |

### 2.2 Header Unificado (`app/components/SiteHeader.tsx`)
El `SiteHeader` será la barra de navegación superior fija (`h-16`, `border-b border-line bg-bg/90 backdrop-blur-md`) compartida por **todas** las pantallas:
- **Izquierda (Identidad de Marca):**
  - Emblema SVG de identidad (`BrandMarkSvg` — birrete geométrico enmarcado en sello negro `#111111`) + logotipo tipográfico `BecaBot` con badge sutil `MX`.
- **Centro (Navegación Principal con indicador activo en negro `#111111`):**
  - `Inicio` (`/`)
  - `Asesor IA` (`/asesor`)
  - `Planes` (`/premium`)
- **Derecha (Acciones de Usuario y CTA Primario):**
  - Enlace `Iniciar sesión` (`/login`)
  - Botón primario en negro sólido (`bg-ink text-bg hover:bg-ink/90 rounded-full px-4 h-9`):
    - Si el usuario está en la Landing (`/`), muestra **`Consultar becas →`** (lleva a `/asesor`).
    - Si el usuario ya está en `/asesor`, muestra **`Hazte Premium ↗`** (lleva a `/premium`).

---

## 3. Tokens del Sistema de Diseño (`app/globals.css`)

Se reemplaza la paleta oscura anterior por un sistema de tokens **Blanco y Negro de precisión estilo Airbnb**:

```css
@theme {
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-display: 'Bricolage Grotesque', 'Inter', ui-sans-serif, system-ui, sans-serif;

  /* ── Paleta Neutros Blanco & Negro (Airbnb Editorial Monochrome) ─────── */
  --color-bg: #ffffff;
  --color-surface: #f7f7f7;
  --color-surface-2: #f1f1f1;
  --color-surface-3: #e8e8e8;
  --color-input: #ffffff;
  --color-line: #ebebeb;
  --color-line-soft: rgba(17, 17, 17, 0.08);
  --color-line-strong: #dddddd;

  --color-text: #111111;
  --color-secondary: #484848;
  --color-tertiary: #717171;
  --color-muted: #8a8a8a;

  --color-primary: #111111;
  --color-accent: #111111;
  --color-accent-deep: #111111;
  --color-accent-dim: #484848;
  --color-accent-soft: #f3f3f3;
  --color-ring: rgba(17, 17, 17, 0.22);

  --color-foil-vault: #ffffff;
  --color-foil-wash: rgba(17, 17, 17, 0.05);
  --color-foil-deep: #222222;
  --color-foil-mid: #484848;

  --color-success: #1f7a4c;
  --color-danger: #c13515;

  --radius-card: 16px;
  --radius-control: 12px;
  --radius-bubble: 18px;
  --radius-seal: 999px;

  --shadow-elevated:
    0 0 0 1px rgba(17, 17, 17, 0.06),
    0 4px 12px rgba(17, 17, 17, 0.05),
    0 12px 28px -8px rgba(17, 17, 17, 0.08);
  --shadow-card:
    0 0 0 1px rgba(17, 17, 17, 0.06),
    0 2px 6px rgba(17, 17, 17, 0.04);
}
```

---

## 4. Sistema de SVGs de Identidad (Compartidos entre Landing y Chatbot)

Siguiendo el principio **SRP**, cada ilustración/emblema SVG vive en su propio componente dentro de `app/components/svg/` y utiliza `currentColor` con trazos negros y rellenos neutros para mantener una firma gráfica reconocible:

1. **`BrandSealSvg.tsx`:** Sello octogonal/circular de doble aro con birrete geométrico y estrella de 4 puntas mexicana. Se usa en el `SiteHeader`, en el Hero de la Landing y en la cabecera del Chatbot (`/asesor`).
2. **`RagArchitectureSvg.tsx`:** Ilustración vectorial isométrica/esquemática en blanco y negro que visualiza cómo BecaBot cruza **Documentos Oficiales (RAG)** + **Verificación Web** → **Respuesta con Fuente Citada**. Se muestra en la Landing Page y como emblema decorativo en el estado inicial del Chatbot.
3. **`MexicoCoverageSvg.tsx`:** Gráfico vectorial minimalista de retícula y nodos que representa la cobertura 100% enfocada en instituciones y convocatorias de México (SEP, CONAHCYT, IPES, Universidades estatales).
4. **`ScholarshipStampSvg.tsx`:** Serie de 3 sellos vectoriales para las tarjetas de valor: *Requisitos Claros*, *Fechas Vigentes* y *Citas Verificables*.

---

## 5. Estructura de la Nueva Landing Page (`app/page.tsx`)

La Landing Page está dividida en secciones modulares bajo `app/components/landing/` (cada componente con responsabilidad única):

1. **`LandingHero.tsx`:**
   - Sello editorial: `ASESOR ESPECIALIZADO · MÉXICO`.
   - Título principal (`font-display`, escala alta, tracking negativo): *"Encuentra la beca en México que sí te corresponde."*
   - Subtítulo claro explicando que BecaBot analiza convocatorias, montos, requisitos y fechas límite citando siempre la fuente.
   - **Barra de consulta interactiva (Estilo buscador Airbnb en blanco y negro):** Permite escribir una duda directamente en la Landing o elegir una píldora rápida (*"Beca Benito Juárez"*, *"Jóvenes Escribiendo el Futuro"*, *"Posgrado CONAHCYT"*, *"Requisitos de manutención"*) y al enviar redirige a `/asesor?q=...` ejecutando automáticamente la consulta en el chatbot.
   - A la derecha (en desktop): tarjeta visual con `RagArchitectureSvg` mostrando un ejemplo real de respuesta verificada con badge `Base de becas`.
2. **`LandingStatsBar.tsx`:**
   - Franja arquitectónica con bordes de `1px` y números tabulares (`tabular-nums`): `+120 Convocatorias mapeadas`, `100% Enfoque en México`, `2 Motores (Base RAG + Web en vivo)`, `0 Respuestas inventadas`.
3. **`LandingHowItWorks.tsx`:**
   - 3 tarjetas limpias en blanco y negro con `ScholarshipStampSvg` explicando el flujo:
     1. **Búsqueda en Base Documental (RAG):** Consulta instantánea sobre requisitos, montos y fechas de convocatorias mexicanas.
     2. **Respaldo Web con Autoaprendizaje:** Si una convocatoria es nueva, busca en fuentes oficiales y aprende el resumen verificado.
     3. **Foco 100% México:** Especialización estricta en becas nacionales (y orientación de portales oficiales si buscas en el extranjero).
4. **`LandingCategoriesGrid.tsx`:**
   - Cuadrícula de exploración rápida por nivel académico (*Educación Básica y Media Superior*, *Licenciatura e Ingeniería*, *Posgrado e Investigación*, *Excelencia y Manutención*). Cada tarjeta tiene su icono SVG y al hacer clic abre `/asesor?q=...` con la consulta preconfigurada.
5. **`LandingFooterCta.tsx`:**
   - Bloque de cierre en alto contraste negro (`#111111`) con texto blanco (`#FFFFFF`), `BrandSealSvg` y botón directo para abrir `/asesor` o conocer `/premium`.

---

## 6. Unificación Visual con el Chatbot (`app/asesor/page.tsx`)

- La ruta `/asesor` aloja el `InfoPanel` (izquierda) y `ChatWorkspace` (derecha).
- Si la URL incluye `?q=pregunta`, el chatbot dispara automáticamente esa consulta al montar (respetando idempotencia en React 19).
- Tanto el `InfoPanel` como `ChatEmptyState`, `ChatMessageList` y `ChatInput` comparten exactamente los mismos tokens blanco/negro, bordes `#EBEBEB`, tipografía `Bricolage Grotesque` + `Inter` y el emblema `BrandSealSvg` de la Landing Page.
