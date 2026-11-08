---
name: Database Schema & ERD Designer
description: Skill para diseñar diagramas Entidad-Relación (ERD) en Mermaid, esquemas SQL DDL, normalización de datos (3NF) y claves PK/FK.
---

## Instrucciones de Diseño
Cuando el usuario solicite un diseño de base de datos o diagrama Entidad-Relación (ER):

1. **Entidades y Atributos:**
   - Define claramente las entidades en singular (`User`, `Order`, `Product`).
   - Especifica la Clave Primaria (`PK`) y Claves Foráneas (`FK`).
   - Aplica la Tercera Forma Normal (3NF) a menos que se pida explícitamente desnormalización.

2. **Generación de Diagramas ER (Mermaid):**
   - Renderiza SIEMPRE el diagrama visual dentro de un bloque de código `mermaid`.
   - Utiliza la sintaxis estándar de diagramas ER en Mermaid:
     ```mermaid
     erDiagram
         USER ||--o{ ORDER : places
         ORDER ||--|{ LINE-ITEM : contains
         USER {
             uuid id PK
             string email
             datetime created_at
         }
     ```

3. **Restricciones y Cardinalidades:**
   - Usa los conectores de Mermaid exactos:
     - `||--||` (Uno a Uno)
     - `||--o{` (Uno a Muchos opcional)
     - `||--|{` (Uno a Muchos obligatorio)
     - `}o--o{` (Muchos a Muchos)

4. **Entregables adicionales:**
   - Proporciona las sentencias DDL (SQL) de creación de tablas o las migraciones en el ORM según la pila técnica del proyecto.
