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

    // 3. DNS MX record validation (opcional si hay conexión a internet)
    try {
      const domain = email.split("@")[1];
      const isDomainValid = await resolveMx(domain);
      if (!isDomainValid) {
        return res.status(400).json({
          error: "El dominio del correo electrónico no existe o no puede recibir mensajes. Revisa posibles faltas de ortografía (ej: gamil.com)."
        });
      }
    } catch {
      // Continuar si DNS falla temporalmente
    }

    // Traducir el motivo del contacto
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

    // 4. Guardar SIEMPRE en la base de datos para la bandeja del panel de administración
    try {
      const { kv, isKvConfigured } = await import("./admin/_lib/kv");
      if (isKvConfigured()) {
        const raw = await kv.get("miluarte:messages:contact");
        let messages = typeof raw === "string" ? JSON.parse(raw || "[]") : (raw as any) || [];
        messages.unshift({
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString(),
          name,
          email,
          company: company || "",
          subject: subjectText,
          message,
          read: false,
          type: "contact",
        });
        if (messages.length > 200) messages = messages.slice(0, 200);
        await kv.set("miluarte:messages:contact", JSON.stringify(messages));
      }
    } catch (kvErr) {
      console.warn("KV contact message save warning:", kvErr);
    }

    // 5. Enviar por email si RESEND_API_KEY está configurada
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const toEmail = (subject === "job" || subject === "gigantic")
        ? (process.env.RESEND_TO_PRIORITY || "miluartedenara@gmail.com")
        : (process.env.RESEND_TO_COMMON || "miluartedenara@gmail.com");

      const fromEmail = process.env.RESEND_FROM || "onboarding@resend.dev";
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
      <div class="meta-text">Asunto: <strong>${subjectText}</strong></div>
    </div>
    
    <div class="section-title">Mensaje</div>
    <p class="content-text">${message}</p>
    
    <div class="meta-grid">
      <div class="meta-item">
        <div class="meta-label">Remitente:</div>
        <div class="meta-value">${name}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Correo:</div>
        <div class="meta-value"><a href="mailto:${email}" style="color: #B55C49; text-decoration: none;">${email}</a></div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Empresa / Proyecto:</div>
        <div class="meta-value">${company || "No especificada"}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Fecha:</div>
        <div class="meta-value">${new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}</div>
      </div>
    </div>
    
    <div class="footer">
      Este correo electrónico fue generado automáticamente desde el formulario de contacto de miluartedenara.com.
    </div>
  </div>
</body>
</html>
      `;

      try {
        await fetch("https://api.resend.com/emails", {
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
            reply_to: email
          })
        });
      } catch (emailErr) {
        console.warn("Resend email delivery error:", emailErr);
      }
    } else {
      console.info("ℹ️ RESEND_API_KEY no detectada. Mensaje almacenado localmente en la bandeja del CMS.");
    }

    return res.status(200).json({ success: true, message: "Mensaje recibido y guardado correctamente" });
  } catch (error: any) {
    console.error("Handler error:", error);
    return res.status(500).json({ error: "Error interno del servidor / Internal Server Error" });
  }
}
