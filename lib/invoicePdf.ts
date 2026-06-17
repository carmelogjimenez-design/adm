// Factura ADM imprimible (Guardar como PDF). Sin dependencias.
export type InvoiceData = {
  number: string; date?: string;
  client_name?: string; client_dni?: string; client_address?: string;
  concept?: string; base: number; currency?: string;
}
const esc = (s?: string) => (s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!))
const eur = (n: number, c = 'EUR') => new Intl.NumberFormat('es-ES', { style: 'currency', currency: c }).format(n)

export function buildInvoiceHtml(d: InvoiceData): string {
  const c = d.currency || 'EUR'
  const base = Number(d.base || 0)
  const iva = base * 0.21
  const total = base + iva
  const date = d.date || new Date().toLocaleDateString('es-ES')
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Factura ${esc(d.number)}</title>
<style>
  @page { size: A4; margin: 18mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system,'Segoe UI',Roboto,Arial,sans-serif; color:#15233a; font-size:12px; margin:0; }
  .top { display:flex; justify-content:space-between; align-items:flex-start; }
  .logo b { color:#0F5EFF; font-size:32px; font-weight:900; letter-spacing:-1px; }
  .logo span { display:block; font-size:7px; font-weight:800; letter-spacing:1.5px; color:#111; }
  .emisor { font-size:10.5px; line-height:1.5; margin-top:6px; color:#333; }
  .ftit { text-align:right; } .ftit h1 { margin:0; font-size:26px; letter-spacing:2px; color:#0F5EFF; }
  .ftit .row { font-size:11px; margin-top:3px; } .ftit .row b { font-size:12px; }
  .client { margin-top:24px; background:#f3f6fc; border-radius:8px; padding:12px 14px; }
  .client h3 { margin:0 0 6px; font-size:9.5px; letter-spacing:1px; color:#0F5EFF; text-transform:uppercase; }
  .client p { margin:1px 0; font-size:11.5px; line-height:1.45; }
  table { width:100%; border-collapse:collapse; margin-top:22px; }
  th { background:#0F5EFF; color:#fff; text-align:left; font-size:10px; letter-spacing:.5px; padding:8px 10px; text-transform:uppercase; }
  th.r, td.r { text-align:right; }
  td { padding:10px; border-bottom:1px solid #e8edf6; font-size:12px; }
  .tot { width:48%; margin-left:auto; margin-top:14px; }
  .tot div { display:flex; justify-content:space-between; padding:5px 10px; font-size:12px; }
  .tot .grand { background:#0F5EFF; color:#fff; font-weight:800; border-radius:6px; font-size:14px; margin-top:4px; }
  .pay { margin-top:22px; background:#f3f6fc; border-radius:8px; padding:12px 14px; font-size:11px; line-height:1.6; }
  .pay h3 { margin:0 0 4px; font-size:9.5px; letter-spacing:1px; color:#0F5EFF; text-transform:uppercase; }
  .legal { margin-top:18px; font-size:8.5px; color:#888; text-align:center; }
  .foot { position:fixed; bottom:8mm; left:0; right:0; display:flex; justify-content:space-between; align-items:center; }
  .foot .bar { height:8px; background:#0F5EFF; flex:1; margin:0 8px; border-radius:2px; } .foot b { color:#0F5EFF; font-size:9px; letter-spacing:1px; }
  @media screen { body { max-width:800px; margin:24px auto; padding:0 24px; } }
</style></head><body>
<div class="top">
  <div>
    <div class="logo"><b>ADM</b><span>ATHLETES DEVELOPMENT MANAGEMENT</span></div>
    <div class="emisor"><b>ADM SPORTS GROUP USA SL</b><br>NIF: ES B05392303<br>Valle del Cabriel 34, Chalet 70<br>Torrejón de Ardoz, 28850<br>Teléfono +34 675 98 33 43</div>
  </div>
  <div class="ftit"><h1>FACTURA</h1>
    <div class="row">FECHA: <b>${esc(date)}</b></div>
    <div class="row">Nº DE FACTURA: <b>${esc(d.number)}</b></div>
  </div>
</div>

<div class="client"><h3>Facturar a</h3>
  <p><b>${esc(d.client_name) || '—'}</b></p>${d.client_dni ? `<p>${esc(d.client_dni)}</p>` : ''}${d.client_address ? `<p>${esc(d.client_address)}</p>` : ''}</div>

<table>
  <thead><tr><th>Descripción</th><th class="r">Precio Unidad</th><th class="r">IVA %</th><th class="r">Base Imponible</th></tr></thead>
  <tbody><tr><td>${esc(d.concept) || 'Servicios de asesoramiento ADM'}</td><td class="r">${eur(base, c)}</td><td class="r">21,00</td><td class="r">${eur(base, c)}</td></tr></tbody>
</table>

<div class="tot">
  <div><span>Base Imponible</span><span>${eur(base, c)}</span></div>
  <div><span>IVA (General 21,00%)</span><span>${eur(iva, c)}</span></div>
  <div class="grand"><span>TOTAL</span><span>${eur(total, c)}</span></div>
</div>

<div class="pay"><h3>Datos bancarios</h3>
  IBAN: ES72 2100 1751 4802 0079 9192<br>SWIFT / BIC: CAIXESBBXXX<br>Dirección sucursal: Calle Regalado 4, 47002 - Valladolid<br>Nombre Banco: CAIXABANK</div>

<div class="legal">B05392303 - Registro Mercantil de Valladolid tomo 1594, folio 42, hoja VA-32147.</div>

<div class="foot"><b>ADM</b><div class="bar"></div><b>TRUST THE PROCESS</b></div>
</body></html>`
}

export function openInvoicePrint(d: InvoiceData) {
  const w = window.open('', '_blank')
  if (!w) { alert('Permite las ventanas emergentes para descargar la factura'); return }
  w.document.write(buildInvoiceHtml(d)); w.document.close(); w.focus()
  setTimeout(() => w.print(), 500)
}
