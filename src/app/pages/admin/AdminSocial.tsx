import { useState, useEffect } from "react";
import { Save, Share2, ExternalLink, Instagram, Linkedin, Twitter, Sparkles } from "lucide-react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { Toast } from "../../components/admin/Toast";
import { SocialLinks } from "../../types/cms";
import { useAdminApi } from "../../hooks/useAdminApi";

export function AdminSocial() {
  const [social, setSocial] = useState<SocialLinks>({
    instagram: "",
    linkedin: "",
    behance: "",
    tiktok: "",
    twitter: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error"; open: boolean }>({
    message: "",
    type: "success",
    open: false,
  });

  const { request } = useAdminApi();

  const fetchSocial = async () => {
    try {
      setLoading(true);
      const data = await request<SocialLinks>("/api/admin/social");
      setSocial(data);
    } catch (err: any) {
      setToast({
        message: "Error al cargar redes sociales: " + (err.message || "Fallo de conexión"),
        type: "error",
        open: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocial();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await request("/api/admin/social", {
        method: "PUT",
        body: JSON.stringify(social),
      });
      setToast({ message: "Enlaces de redes sociales actualizados", type: "success", open: true });
    } catch (err: any) {
      setToast({ message: err.message || "Error al guardar redes", type: "error", open: true });
    } finally {
      setSaving(false);
    }
  };

  const platforms = [
    {
      key: "instagram" as const,
      label: "Instagram",
      icon: Instagram,
      placeholder: "https://www.instagram.com/naraneko13/",
      color: "text-pink-400",
    },
    {
      key: "linkedin" as const,
      label: "LinkedIn",
      icon: Linkedin,
      placeholder: "https://www.linkedin.com/in/nerealucaspajares4815162342/",
      color: "text-blue-400",
    },
    {
      key: "behance" as const,
      label: "Behance",
      icon: Share2,
      placeholder: "https://www.behance.net/tuusuario",
      color: "text-indigo-400",
    },
    {
      key: "tiktok" as const,
      label: "TikTok",
      icon: Share2,
      placeholder: "https://www.tiktok.com/@tuusuario",
      color: "text-emerald-400",
    },
    {
      key: "twitter" as const,
      label: "X (Twitter)",
      icon: Twitter,
      placeholder: "https://x.com/tuusuario",
      color: "text-sky-400",
    },
  ];

  return (
    <AdminLayout
      title="Redes Sociales & Enlaces"
      subtitle="Configura los enlaces a tus perfiles que se muestran en el pie de página del portfolio"
    >
      <div className="max-w-2xl select-none">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-brand-dark/50 border border-brand-cream/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-5">
            <div className="rounded-2xl bg-brand-dark border border-brand-cream/10 p-6 flex flex-col gap-5">
              {platforms.map((platform) => {
                const Icon = platform.icon;
                const url = social[platform.key] || "";

                return (
                  <div key={platform.key} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-sans text-brand-cream/80 text-xs uppercase tracking-wider font-medium flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${platform.color}`} />
                        <span>{platform.label}</span>
                      </label>

                      {url && (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-sans text-brand-blush hover:underline flex items-center gap-1"
                        >
                          <span>Probar enlace</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setSocial({ ...social, [platform.key]: e.target.value })}
                      placeholder={platform.placeholder}
                      className="w-full bg-brand-bg border border-brand-cream/15 rounded-xl px-4 py-2.5 text-brand-cream text-sm focus:border-brand-blush outline-none"
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-brand-blush hover:bg-brand-cream text-brand-ink text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-brand-ink/20 border-t-brand-ink rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Guardar Enlaces</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Toast */}
      <Toast
        isOpen={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </AdminLayout>
  );
}
