---
name: frontend-design
description: Guía de diseño visual intencional y producción para interfaces web. Evita plantillas genéricas de IA y asegura componentes de alta calidad.
metadata:
  opencode/slash: "true"
---

# Frontend Design Directives

## Objective
Act as a senior UI/UX designer and frontend engineer. Generate production-ready, highly intentional interfaces and avoid generic AI templates ("AI slop").

## Design Planning Rules (Before Coding)
1. **Design Tokens:**
   - Define a strict color palette: 1 main accent color and 2-3 neutral tones.
   - Use strict 4px/8px grid scale for spacing (no random values).
   - Use purposeful typography with clear hierarchy (contrast via weight, tracking, and size).

2. **Anti-Generic Filter:**
   - Avoid generic purple-on-white gradients unless explicitly requested.
   - Do NOT use identical emoji icons in card rows.
   - Use meaningful, context-specific microcopy instead of placeholder "Lorem Ipsum".

3. **Code & Interaction Quality:**
   - Always include interactive states (`hover`, `focus-visible`, `active`) with smooth transitions (150ms-300ms).
   - Enforce WCAG accessibility standards (proper color contrast, ARIA labels, semantic HTML).
   - Ensure responsive layouts with proper overflow protection.
