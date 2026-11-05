# Invitación al bautizo de Salvador

Página: https://tatiana1398.github.io/bautizo-salvador/

## Editar la invitación

Casi todo el contenido (nombres, fecha, lugares, horarios, vestimenta, música y la URL de
las confirmaciones) está en `src/content/invitation.ts`.

- Imágenes: `public/images/`
- Música: `public/audio/hallelujah.mp3`
- Confirmaciones: llegan a una hoja de Google mediante el script `google-sheets/Confirmaciones.gs`

## Correr en el computador

```sh
npm install
npm run dev
```

Se abre en http://localhost:8080/

## Publicar

Cada cambio que se sube a la rama `main` se publica solo en GitHub Pages
(`.github/workflows/pages.yml`) en uno o dos minutos.
