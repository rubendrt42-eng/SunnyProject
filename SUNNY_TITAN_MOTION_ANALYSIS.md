# Análisis de la referencia de movimiento (Titan)

## Lo primero, porque cambia cómo hay que leer este documento

**No pude ver el sitio de referencia.**

- No hay ninguna mención a Titan en el repositorio: ni en los 24 documentos, ni
  en el código, ni en `SUNNY_REFERENCE_ANALYSIS.md`, que es donde vivirían las
  referencias anteriores.
- Chromium no tiene salida a internet desde este entorno, así que no puedo
  abrirlo, grabarlo ni medirlo.

Podría haber escrito un análisis plausible de un sitio que no he visto. Es
exactamente el tipo de documento que suena bien y no sostiene ninguna decisión.
No lo voy a hacer.

Lo que sí puedo hacer, y es lo que sigue: **derivar los principios de movimiento
del propio Sunny**, que ya tiene una identidad de movimiento sostenida en el
código, y escribirlos para que dejen de ser tácitos. Si más adelante me pasas
capturas, un vídeo de pantalla o la URL, reviso este documento contra la
referencia real.

---

## 1. Sunny ya tiene una curva, y es una decisión buena

`cubic-bezier(0.22, 1, 0.36, 1)` aparece en **20 de las 22** transiciones del
proyecto.

Es la curva que en la literatura se llama *ease-out-quint*: arranca rápido y
frena mucho al final. Vale la pena entender por qué funciona aquí, porque
justifica mantenerla en vez de cambiarla:

- **Arranca rápido** → la interfaz responde en el primer fotograma. La sensación
  de «respondió» se decide en los primeros 80 ms, no al final.
- **Frena largo** → el elemento llega a su sitio y se posa, no se estrella. Es lo
  que hace que un panel de 350 ms se sienta caro en vez de lento.
- **Nunca rebota.** No hay `overshoot`. Sunny vende calma —un pase semanal para
  probar cosas sin prisa— y un rebote diría lo contrario.

**Decisión: se queda.** El sistema se construye alrededor de esta curva, no
contra ella.

---

## 2. Los cinco principios que voy a aplicar

### 2.1 El movimiento confirma; no decora

Cada animación tiene que responder a una pregunta que la persona se está
haciendo. «¿Me oyó?» «¿De dónde salió esto?» «¿A dónde volvió?» Si no responde a
ninguna, sobra.

Este es el principio que condena la mayor parte del trabajo pendiente al panel:
en el sitio público el movimiento responde preguntas; en el panel, donde las
preguntas son más urgentes —*acabo de cancelar la reservación de alguien, ¿se
canceló?*— no hay movimiento ninguno.

### 2.2 Lo que aparece tiene que decir de dónde vino

El Quick View ya lo hace bien: entra desde el borde derecho en escritorio y
desde abajo en móvil, y sale por donde entró. Eso enseña dónde está el panel
respecto de la página sin una sola palabra.

La regla se extiende: nada aparece por desvanecimiento puro si tiene un origen
espacial defendible.

### 2.3 La duración la fija la distancia, no el gusto

Un color cambia en 150 ms porque no recorre distancia. Un panel de pantalla
completa tarda 350 ms porque recorre media pantalla. Un telón tarda 250 ms
porque solo cambia de opacidad pero cubre mucha superficie.

De ahí sale la escala nombrada del §2 de `SUNNY_MOTION_SYSTEM_1_0.md`: los
nombres son *para qué sirve*, no *cuánto dura*.

### 2.4 Nada que se mueva puede empujar lo que está al lado

Un indicador de carga que cambia el ancho de un botón mueve la fila entera. La
propia documentación de Next lo dice de su indicador de navegación: reserva el
espacio siempre, y anima solo la opacidad.

Esto es lo que rompe `ExperienceRowActions` hoy (`busy ? "…" : label`).

### 2.5 «Sin movimiento» significa sin movimiento

`prefers-reduced-motion` no es un descuento del 50 %. Quien lo activa a menudo
lo hace por vértigo o migraña, no por preferencia estética.

Y no basta con el bloque global de CSS: **no cubre las animaciones de
JavaScript**, que en este proyecto son la mayoría. Cada primitivo tiene que
comprobarlo por su cuenta. Trece de catorce ya lo hacen.

---

## 3. Lo que NO se va a hacer

Anotado para que quede claro que es decisión y no olvido:

- **No se añade movimiento nuevo al sitio público.** Ya tiene el que necesita.
  El trabajo ahí es unificar tiempos, no sumar efectos.
- **No se anima el panel con revelados al hacer scroll.** Es una herramienta de
  trabajo. Emmy va a abrirla veinte veces al día; lo que la primera vez parece
  cuidado, la vigésima es un peaje.
- **No se toca la curva.** Ver §1.
- **No se toca el `SessionLoader`.** Sus dos curvas propias son defendibles para
  una cortina (§2.8 de la auditoría).
