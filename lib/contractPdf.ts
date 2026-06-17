// Genera el contrato ADM como documento imprimible (Guardar como PDF en el dialogo de impresion).
// Sin dependencias: abre una ventana con HTML+CSS de marca ADM.

export type ContractTerms = {
  city?: string; date?: string;
  student_name?: string; student_dni?: string; student_address?: string;
  father_name?: string; father_dni?: string; father_address?: string;
  mother_name?: string; mother_dni?: string; mother_address?: string;
  amount1?: string; amount2?: string;
  family_email?: string;
}

const esc = (s?: string) => (s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!))
const v = (s?: string, ph = '________________') => (s && s.trim() ? esc(s) : `<span style="color:#9aa3b2">${ph}</span>`)

export function buildContractHtml(t: ContractTerms, signature?: string | null, signerName?: string | null, signedAt?: string | null): string {
  const a1 = t.amount1 || '1.200€ + IVA (1.420€ IVA Incl.)'
  const a2 = t.amount2 || '1.800€ + IVA (2.178€ IVA Incl.)'
  const sigBlock = signature
    ? `<img src="${signature}" style="height:54px;display:block;margin-bottom:2px"/>`
    : `<div style="height:54px"></div>`
  const signedNote = signedAt ? `<p class="small" style="text-align:center;color:#16B57C;font-weight:700">Firmado digitalmente el ${new Date(signedAt).toLocaleDateString('es-ES')}${signerName ? ' por ' + esc(signerName) : ''}</p>` : ''
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Contrato ADM</title>
<style>
  @page { size: A4; margin: 20mm 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; color: #15233a; font-size: 11px; line-height: 1.5; margin: 0; }
  .head { display:flex; justify-content:flex-end; align-items:center; margin-bottom: 10px; }
  .logo b { color:#0F5EFF; font-size:30px; font-weight:900; letter-spacing:-1px; }
  .logo span { display:block; font-size:6.5px; font-weight:800; letter-spacing:1.5px; color:#111; }
  h1 { text-align:center; font-size:13px; letter-spacing:1px; margin:14px 0 8px; }
  h2 { font-size:11px; margin:14px 0 4px; }
  p { margin:6px 0; text-align:justify; }
  .b { font-weight:800; }
  ol, ul { margin:4px 0 6px 18px; padding:0; } li { margin:2px 0; }
  .bank { background:#f3f6fc; border-radius:6px; padding:8px 12px; margin:8px 0; }
  .small { font-size:10px; }
  .sigs { display:flex; flex-wrap:wrap; gap:24px 40px; margin-top:34px; }
  .sig { width:42%; border-top:1px solid #15233a; padding-top:4px; }
  .sig .b { font-size:10.5px; } .sig .r { font-size:9.5px; color:#555; }
  .foot { position:fixed; bottom:6mm; left:0; right:0; display:flex; justify-content:space-between; align-items:center; }
  .foot .bar { height:8px; background:#0F5EFF; flex:1; margin:0 8px; border-radius:2px; }
  .foot b { color:#0F5EFF; font-size:9px; letter-spacing:1px; }
  .page-break { page-break-before: always; }
  @media screen { body { max-width: 800px; margin: 24px auto; padding: 0 24px; } }
</style></head><body>

<div class="head"><div class="logo"><b>ADM</b><span>ATHLETES DEVELOPMENT MANAGEMENT</span></div></div>

<p style="text-align:right">En ${v(t.city, 'Valladolid')} a ${v(t.date)}</p>

<h1>REUNIDOS</h1>
<p>De una parte, <span class="b">DON GONZALO IGLESIAS SÁNCHEZ</span>, mayor de edad, con N.I.F. número 71162726-J, con domicilio a efectos de notificaciones en Paseo Isabela Católica 9 – Bajo – 47001 - Valladolid. En adelante <span class="b">ADM Sports Group</span>.</p>
<p>Y de otra parte, <span class="b">${v(t.father_name)}</span>, mayor de edad, con DNI ${v(t.father_dni)} y con domicilio a efectos de notificaciones en ${v(t.father_address || t.student_address)}, y <span class="b">${v(t.mother_name)}</span>, mayor de edad, con DNI ${v(t.mother_dni)} y con domicilio a efectos de notificaciones en ${v(t.mother_address || t.student_address)}, en representación de su hijo, <span class="b">${v(t.student_name)}</span> con DNI ${v(t.student_dni)} y con domicilio a efectos de notificaciones en ${v(t.student_address)}, como padres: En adelante <span class="b">EL ESTUDIANTE</span>.</p>
<p>Ambas partes, reconocen plena capacidad legal para el otorgamiento del siguiente contrato.</p>

<h1>MANIFIESTAN</h1>
<p><span class="b">PRIMERO.-</span> Que Don Gonzalo Iglesias Sánchez actúa en nombre y representación de la sociedad ADM SPORTS GROUP USA S.L, domiciliada en Paseo Isabel la Católica Nº 9 Bajo, 47001, Valladolid con C.I.F B05392303 como apoderado, dedicándose a realizar todas las gestiones necesarias para la admisión de estudiantes en una Institución Académica de Estados Unidos y la posible obtención de ayudas financieras y becas otorgadas por las propias instituciones americanas.</p>
<p><span class="b">SEGUNDO.-</span> ADM Sports Group busca las Instituciones que se adapten a las necesidades académicas y económicas del estudiante. Una vez conseguida la institución y el estudiante viaje a Estados Unidos, prestará atención y asesoramiento ante cualquier duda o contratiempo durante el curso académico.</p>
<p><span class="b">TERCERO.-</span> Ambas partes reconocen capacidad legal suficiente para perfeccionar este contrato de agencia, el cual se regirá por lo aquí pactado y por la legislación española.</p>

<h1 class="page-break">CLÁUSULAS</h1>
<p><span class="b">PRIMERA.-</span> El presente contrato de agencia surtirá sus efectos a partir de la fecha indicada en su encabezamiento.</p>
<p><span class="b">SEGUNDA.-</span> ADM Sports Group realizará, en nombre y por cuenta de EL ESTUDIANTE, las gestiones necesarias para su admisión en una Institución Académica de Estados Unidos, así como la solicitud de becas. Plan de Acción:</p>
<ol>
  <li>Reunión con el estudiante y su familia.</li>
  <li>Elaboración del perfil del deportista.</li>
  <li>Contacto con las Instituciones Académicas.</li>
  <li>Recopilación de datos y opciones ofrecidas por las Instituciones.</li>
  <li>Exposición de opciones a EL ESTUDIANTE y selección de Institución conforme a su decisión.</li>
  <li>Gestión del proceso de admisión.</li>
  <li>Ayuda para organizar viaje a Estados Unidos cuando se requiera.</li>
  <li>Atención y asesoramiento durante el curso académico en Estados Unidos.</li>
</ol>
<p class="small">Incluye además: revisión y validación de documentación; seguimiento con departamentos de admisión y deportivos; orientación en elegibilidad de las ligas; asesoramiento del visado; asistencia logística de llegada; servicio de Transfer sin coste en caso de cancelación del programa o cierre de la universidad; y entrada en el siguiente periodo de admisiones si el jugador suspende 2º de Bachillerato o falla el Duolingo.</p>
<p><span class="b">TERCERA.-</span> El presente contrato tendrá una duración de dos años desde la fecha del encabezamiento, prorrogable con el consentimiento expreso de ambas partes.</p>
<p><span class="b">CUARTA.-</span> EL ESTUDIANTE o sus representantes abonarán a ADM Sports Group la cantidad de 3.000 EUROS (+ 21% IVA), según el siguiente calendario:</p>
<ol>
  <li>A la firma del presente contrato: <span class="b">${a1}</span>. (Esta cantidad será devuelta si ADM no proporciona una propuesta a EL ESTUDIANTE).</li>
  <li>Tras la elaboración del perfil, contacto con Instituciones y elección de una opción: <span class="b">${a2}</span>. (Una vez el jugador haya elegido Universidad, con independencia del proceso de Admisiones).</li>
</ol>
<div class="bank"><span class="b">Pagos por transferencia bancaria</span><br>Titular: ADM SPORTS GROUP USA SL<br>IBAN (La Caixa): ES72 2100 1751 4802 0079 9192<br>SWIFT/BIC: CAIXESBBXXX</div>
<p><span class="b">QUINTA.-</span> EL ESTUDIANTE pondrá a disposición de ADM todos los documentos necesarios y autoriza el tratamiento y transferencia nacional e internacional de sus datos e imágenes conforme al RGPD 2016/679 y la LOPD, a entrenadores e instituciones que colaboren con ADM.</p>
<p><span class="b">SEXTA.-</span> Será responsabilidad de EL ESTUDIANTE cumplir los requisitos para la beca: completar Bachillerato; nivel de fútbol adecuado; SAT/TOEFL/DUOLINGO satisfactorios (TOEFL +61, DUOLINGO mín. 100, SAT mín. 1100); ser apto NCAA/NAIA; finalizar el VISADO de estudiante; revisar las Carpetas de Información.</p>
<p><span class="b">SÉPTIMA.-</span> ADM gozará de exclusividad en EE. UU. Mientras esté vigente el contrato, EL ESTUDIANTE no podrá encomendar a terceros el presente mandato.</p>
<p><span class="b">OCTAVA.-</span> ADM actuará como intermediario independiente. Pondrá todos los medios para el resultado, quedando exonerado de responsabilidad en caso de no consecución, salvo la devolución del importe percibido conforme a la cláusula CUARTA. Condiciones de Transfer según división (NJCAA: 70% minutos como titular y GPA &gt; 3.00; NAIA/NCAA: 2.000€ + IVA en dos pagos).</p>
<p><span class="b">NOVENA.-</span> EL ESTUDIANTE podrá resolver el contrato en cualquier momento, perdiendo las cantidades entregadas a cuenta. ADM podrá resolverlo si el jugador no cumple las cláusulas segunda y sexta, con la obligación de devolver las cantidades recibidas hasta ese momento.</p>
<p><span class="b">DÉCIMA.-</span> Notificaciones: ADM Sports Group: giglesias@admsportsgroup.com · EL ESTUDIANTE: ${v(t.family_email)}.</p>
<p><span class="b">UNDÉCIMA.-</span> El contrato quedará resuelto si EL ESTUDIANTE realiza actividad delictiva, tiene mal comportamiento o es expulsado/pierde la beca por motivos disciplinarios.</p>
<p><span class="b">DUODÉCIMA.-</span> El contrato se rige por la legislación española. Las partes se someten a los Juzgados y Tribunales de Valladolid.</p>
<p>Y siendo todo lo anterior fiel reflejo de la libre voluntad de las partes, lo firman por ejemplar triplicado.</p>

${signedNote}
<div class="sigs">
  <div class="sig"><div style="height:54px"></div><div class="b">Fdo: Gonzalo Iglesias Sánchez</div><div class="r">El Apoderado de ADM</div></div>
  <div class="sig">${sigBlock}<div class="b">Fdo: ${v(t.father_name)}</div><div class="r">El Padre</div></div>
  <div class="sig">${sigBlock}<div class="b">Fdo: ${v(t.mother_name)}</div><div class="r">La Madre</div></div>
  <div class="sig">${sigBlock}<div class="b">Fdo: ${v(t.student_name)}</div><div class="r">El Estudiante</div></div>
</div>

<div class="foot"><b>ADM</b><div class="bar"></div><b>TRUST THE PROCESS</b></div>
</body></html>`
}

export function openContractPrint(t: ContractTerms, signature?: string | null, signerName?: string | null, signedAt?: string | null) {
  const w = window.open('', '_blank')
  if (!w) { alert('Permite las ventanas emergentes para descargar el PDF'); return }
  w.document.write(buildContractHtml(t, signature, signerName, signedAt))
  w.document.close(); w.focus()
  setTimeout(() => w.print(), 600)
}
