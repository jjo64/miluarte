import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAdminApi } from "../../hooks/useAdminApi";
import { motion } from "motion/react";
import { C, SERIF, SANS, ease } from "../../tokens";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const [checking, setChecking] = useState<boolean>(true);
  const [authorized, setAuthorized] = useState<boolean>(false);
  const { getToken, removeToken } = useAdminApi();
  const navigate = useNavigate();

  useEffect(() => {
    const metaRobots = document.querySelector('meta[name="robots"]');
    const originalContent = metaRobots?.getAttribute("content") || "index, follow";
    metaRobots?.setAttribute("content", "noindex, nofollow");
    
    return () => {
      metaRobots?.setAttribute("content", originalContent);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      const token = getToken();
      if (!token) {
        if (isMounted) {
          setAuthorized(false);
          setChecking(false);
          navigate("/admin/login", { replace: true });
        }
        return;
      }

      try {
        const res = await fetch("/api/admin/auth", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          if (isMounted) {
            setAuthorized(true);
            setChecking(false);
          }
        } else {
          removeToken();
          if (isMounted) {
            setAuthorized(false);
            setChecking(false);
            navigate("/admin/login", { replace: true });
          }
        }
      } catch (err) {
        // En caso de fallo de red local sin backend levantado, si hay token permitimos continuar
        if (isMounted) {
          setAuthorized(true);
          setChecking(false);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [getToken, removeToken, navigate]);

  if (checking) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center text-brand-cream select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-10 h-10 border-2 border-brand-blush/20 border-t-brand-blush rounded-full animate-spin" />
          <p className="font-serif italic text-brand-wall text-sm">Verificando acceso a Miluarte Studio...</p>
        </motion.div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
