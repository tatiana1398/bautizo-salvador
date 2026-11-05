# Invitación al bautizo de Salvador

Página: https://tatiana1398.github.io/bautizo-salvador/

Es una página hecha solo con HTML, CSS y JavaScript: no hay que instalar ni compilar nada.

## Editar la invitación

- Textos (nombres, fecha, lugares, horarios, vestimenta): `index.html`
- Estilos y colores: `css/styles.css`
- Sobre de entrada, música y formulario de confirmación: `js/main.js`
  (la URL de las confirmaciones está al inicio de ese archivo)
- Imágenes: `images/`
- Música: `audio/hallelujah.mp3`
- Confirmaciones: llegan a una hoja de Google mediante el script `google-sheets/Confirmaciones.gs`

## Ver en el computador

```sh
python3 -m http.server 8080
```

Se abre en http://localhost:8080/ (también funciona abriendo `index.html` directamente en el navegador).

## Publicar

Cada cambio que se sube a la rama `main` se publica solo en GitHub Pages
(`.github/workflows/pages.yml`) en uno o dos minutos.
