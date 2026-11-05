/**
 * Recibe las confirmaciones de la invitación y las guarda en esta hoja de Google.
 *
 * Instalación:
 * 1. Crea una hoja de Google nueva (por ejemplo "Confirmaciones bautizo Salvador").
 * 2. Menú Extensiones → Apps Script. Borra lo que haya y pega este archivo completo. Guarda.
 * 3. Botón "Implementar" → "Nueva implementación" → tipo "Aplicación web".
 *    - Ejecutar como: Yo
 *    - Quién tiene acceso: Cualquier persona
 * 4. Autoriza los permisos y copia la "URL de la aplicación web" (termina en /exec).
 * 5. Pega esa URL en src/content/invitation.ts → rsvp.sheetEndpoint.
 */

const SHEET_NAME = "Confirmaciones";
const HEADERS = ["Fecha", "Familia", "Asiste", "Número de personas", "Nombres", "Versión"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
    }

    const p = e.parameter;
    sheet.appendRow([
      new Date(),
      clean(p.familia),
      clean(p.asiste),
      Number(p.personas) || 0,
      clean(p.nombres),
      clean(p.version),
    ]);

    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
      ContentService.MimeType.JSON,
    );
  } finally {
    lock.releaseLock();
  }
}

// Evita que un texto que empiece con =, +, - o @ se interprete como fórmula.
function clean(value) {
  const text = String(value || "").slice(0, 500);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}
