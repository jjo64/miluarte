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
  // Extract route name from req.url (e.g. /api/admin/works?slug=musae -> "works")
  let endpoint = "";
  if (req.url) {
    const pathname = req.url.split("?")[0];
    const match = pathname.match(/\/api\/admin\/([^\/]+)/);
    if (match) endpoint = match[1];
  }

  if (!endpoint && req.query?.slug) {
    const s = Array.isArray(req.query.slug) ? req.query.slug[0] : req.query.slug;
    if (routes[s]) endpoint = s;
  }

  const routeHandler = routes[endpoint];
  if (routeHandler) {
    return routeHandler(req, res);
  }

  return res.status(404).json({ error: `Ruta no encontrada: ${req.url}` });
}
