import authHandler from "./_handlers/auth.js";
import changelogHandler from "./_handlers/changelog.js";
import exportHandler from "./_handlers/export.js";
import galleriesHandler from "./_handlers/galleries.js";
import mediaHandler from "./_handlers/media.js";
import messagesHandler from "./_handlers/messages.js";
import rendersHandler from "./_handlers/renders.js";
import socialHandler from "./_handlers/social.js";
import textsHandler from "./_handlers/texts.js";
import uploadHandler from "./_handlers/upload.js";
import worksHandler from "./_handlers/works.js";

const routes: Record<string, (req: any, res: any) => Promise<any> | any> = {
  auth: authHandler,
  changelog: changelogHandler,
  export: exportHandler,
  galleries: galleriesHandler,
  media: mediaHandler,
  messages: messagesHandler,
  renders: rendersHandler,
  social: socialHandler,
  texts: textsHandler,
  upload: uploadHandler,
  works: worksHandler,
};

export default async function handler(req: any, res: any) {
  let slug = req.query?.slug;
  if (Array.isArray(slug)) {
    slug = slug[0];
  } else if (!slug && req.url) {
    const parts = req.url.split("?")[0].split("/").filter(Boolean);
    const adminIdx = parts.indexOf("admin");
    if (adminIdx !== -1 && parts[adminIdx + 1]) {
      slug = parts[adminIdx + 1];
    }
  }

  const routeHandler = slug ? routes[slug] : null;
  if (routeHandler) {
    return routeHandler(req, res);
  }

  return res.status(404).json({ error: `Ruta de administracion no encontrada: /api/admin/${slug || ""}` });
}
