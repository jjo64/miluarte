import dns from "dns";

// DNS MX Record lookup helper
function resolveMx(domain: string): Promise<boolean> {
  return new Promise((resolve) => {
    dns.resolveMx(domain, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { name, email, company, subject, message } = req.body;

    // 1. Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: "Los campos Nombre, Correo, Motivo y Mensaje son obligatorios."
      });
    }

    // 2. Email syntax check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "El formato del correo electrónico no es válido / Invalid email format."
      });
    }

    // 3. DNS MX record validation (Verificar si el dominio existe y recibe correos)
    const domain = email.split("@")[1];
    const isDomainValid = await resolveMx(domain);
    if (!isDomainValid) {
      return res.status(400).json({
        error: "El dominio del correo electrónico no existe o no puede recibir mensajes. Revisa posibles faltas de ortografía (ej: gamil.com)."
      });
    }

    // 4. Configure recipients
    // Rutear a la bandeja de prioridad si es Oferta Laboral ("job") o Proyecto Gigante ("gigantic")
    const toEmail = (subject === "job" || subject === "gigantic")
      ? (process.env.RESEND_TO_PRIORITY || "miluartedenara@gmail.com")
      : (process.env.RESEND_TO_COMMON || "miluartedenara@gmail.com");

    const fromEmail = process.env.RESEND_FROM || "onboarding@resend.dev";
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error("RESEND_API_KEY is not defined in environment variables.");
      return res.status(500).json({
        error: "La plataforma de envío de correos no está configurada. Contacta con soporte técnico."
      });
    }

    // Traducir el motivo del contacto para el asunto del correo
    let subjectText = "";
    switch (subject) {
      case "job":
        subjectText = "Oferta Laboral / Trabajo";
        break;
      case "collab":
        subjectText = "Colaboración / Alianza";
        break;
      case "gigantic":
        subjectText = "Proyecto de Gran Envergadura";
        break;
      default:
        subjectText = "Consulta General";
    }

    const emailSubject = `[CONTACTO - ${subjectText.toUpperCase()}] de ${name}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #FAF6F0; color: #1C1714; padding: 20px; margin: 0; }
    .card { background-color: #FFFFFF; border: 1px solid #EADFD0; border-radius: 12px; padding: 30px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
    .header { border-bottom: 2px solid #B55C49; padding-bottom: 15px; margin-bottom: 20px; }
    .title { font-size: 20px; font-weight: bold; color: #B55C49; margin: 0; }
    .meta-text { font-size: 13px; color: #8A8070; margin-top: 5px; }
    .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #8A8070; margin-top: 25px; margin-bottom: 8px; letter-spacing: 0.05em; }
    .content-text { font-size: 14px; line-height: 1.6; color: #2C2520; margin: 0; white-space: pre-wrap; background-color: #FAF6F0; padding: 15px; border-radius: 8px; border: 1px solid #EADFD0/30; }
    .meta-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; margin-top: 25px; border-top: 1px solid #FAF6F0; padding-top: 15px; }
    .meta-item { font-size: 13px; }
    .meta-label { color: #8A8070; font-weight: bold; }
    .meta-value { color: #1C1714; margin-top: 2px; }
    .footer { text-align: center; font-size: 11px; color: #8A8070; margin-top: 40px; border-top: 1px solid #EADFD0; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2 class="title">Nuevo Mensaje de Contacto</h2>
      <div class="meta-text">Motivo: <strong>${subjectText}</strong></div>
    </div>
    
    <div class="section-title">Mensaje</div>
    <p class="content-text">${message}</p>
    
    <div class="meta-grid">
      <div class="meta-item">
        <div class="meta-label">Remitente</div>
        <div class="meta-value">${name}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Correo electrónico</div>
        <div class="meta-value"><a href="mailto:${email}" style="color: #B55C49; text-decoration: none;">${email}</a></div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Empresa / Organización</div>
        <div class="meta-value">${company || "<em>No especificada</em>"}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Buzón de entrega</div>
        <div class="meta-value">${(subject === "job" || subject === "gigantic") ? "Prioridad (Comercial / Empleo)" : "Común"}</div>
      </div>
    </div>
    
    <div class="footer">
      Este correo electrónico fue generado automáticamente desde el formulario de contacto de miluartedenara.com a través de Resend.
    </div>
  </div>
</body>
</html>
    `;

    // 5. Send using Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: fromEmail,
        to: toEmail,
        subject: emailSubject,
        html: htmlContent,
        reply_to: email // Permite al usuario responder directamente al remitente
      })
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API error:", resendData);
      return res.status(500).json({
        error: "Hubo un problema al procesar el envío con Resend. Inténtalo de nuevo."
      });
    }

    return res.status(200).json({ success: true, id: resendData.id });
  } catch (error: any) {
    console.error("Handler error:", error);
    return res.status(500).json({ error: "Error interno del servidor / Internal Server Error" });
  }
}
