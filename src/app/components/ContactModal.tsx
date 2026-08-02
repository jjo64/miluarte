import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useLanguage } from "../context/LanguageContext";
import { ease } from "../tokens";

export function ContactModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { t, language } = useLanguage();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // UI / validation states
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleOpen = () => {
      setName("");
      setEmail("");
      setCompany("");
      setSubject("");
      setMessage("");
      setError("");
      setIsSuccess(false);
      setIsOpen(true);
      document.body.style.overflow = "hidden"; // Lock page scroll
    };

    window.addEventListener("open-contact-modal", handleOpen);
    return () => {
      window.removeEventListener("open-contact-modal", handleOpen);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    document.body.style.overflow = ""; // Unlock page scroll
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError(language === "es" ? "Por favor, introduce tu nombre completo" : "Please enter your full name");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(language === "es" ? "Por favor, introduce un correo electrónico válido" : "Please enter a valid email");
      return;
    }
    if (!subject) {
      setError(language === "es" ? "Por favor, selecciona el motivo del contacto" : "Please select the reason for contact");
      return;
    }
    if (!message.trim()) {
      setError(language === "es" ? "Por favor, introduce tu mensaje" : "Please enter your message");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/send-contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          company,
          subject,
          message
        })
      });

      const data = await response.json();

      if (response.ok) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#EAA898", "#E55427", "#F5EDE0", "#B4FF2E"]
        });
        setIsSuccess(true);
      } else {
        setError(data.error || (language === "es" ? "Error al enviar el mensaje" : "Error sending message"));
      }
    } catch (err) {
      console.error(err);
      const isLocalDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      if (isLocalDev) {
        console.warn("API endpoint not available in local Vite server. Simulating success in development.");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#EAA898", "#E55427", "#F5EDE0", "#B4FF2E"]
        });
        setIsSuccess(true);
      } else {
        setError(language === "es" ? "Error de conexión con el servidor. Inténtalo de nuevo." : "Connection error. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center select-none no-print">
          {/* Overlay background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.95 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-brand-dark/95 backdrop-blur-md cursor-pointer"
            onClick={handleClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ duration: 0.4, ease }}
            className="relative w-full max-w-[640px] h-full sm:h-auto max-h-[100vh] sm:max-h-[85vh] bg-brand-bg border border-brand-cream/10 sm:rounded-2xl shadow-2xl flex flex-col sm:overflow-visible overflow-hidden text-brand-cream p-6 sm:p-10"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="font-sans text-brand-orange text-[9px] tracking-widest uppercase block mb-1">
                  {t("nav.contact")}
                </span>
                <h3 className="font-serif text-brand-cream text-2xl font-light">
                  {t("contactModal.title")}
                </h3>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="w-8 h-8 rounded-full border border-brand-cream/10 flex items-center justify-center hover:bg-brand-cream/10 hover:text-brand-orange cursor-pointer transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <X size={16} />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-brand-orange/15 border border-brand-orange/40 text-brand-orange text-xs rounded-lg py-2.5 px-4 mb-5 font-sans">
                {error}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 flex flex-col justify-center min-h-[300px]">
              <AnimatePresence mode="wait">
                {!isSuccess ? (
                  <motion.form
                    key="contact-form"
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4 overflow-y-auto max-h-[50vh] pr-1"
                  >
                    <p className="font-sans text-brand-cream/50 text-xs mb-2">
                      {t("contactModal.subtitle")}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="flex flex-col gap-2">
                        <label className="font-sans text-brand-cream/70 text-xs font-semibold">
                          {t("contactModal.fields.name")}
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={isSubmitting}
                          className="bg-brand-dark/50 border border-brand-cream/10 rounded-lg p-3 text-[12.5px] font-sans text-brand-cream focus:border-brand-orange focus:outline-none transition-colors duration-200 disabled:opacity-50"
                          required
                        />
                      </div>

                      {/* Email */}
                      <div className="flex flex-col gap-2">
                        <label className="font-sans text-brand-cream/70 text-xs font-semibold">
                          {t("contactModal.fields.email")}
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isSubmitting}
                          className="bg-brand-dark/50 border border-brand-cream/10 rounded-lg p-3 text-[12.5px] font-sans text-brand-cream focus:border-brand-orange focus:outline-none transition-colors duration-200 disabled:opacity-50"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Company */}
                      <div className="flex flex-col gap-2">
                        <label className="font-sans text-brand-cream/70 text-xs font-semibold">
                          {t("contactModal.fields.company")}
                        </label>
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          disabled={isSubmitting}
                          className="bg-brand-dark/50 border border-brand-cream/10 rounded-lg p-3 text-[12.5px] font-sans text-brand-cream focus:border-brand-orange focus:outline-none transition-colors duration-200 disabled:opacity-50"
                        />
                      </div>

                      {/* Subject select */}
                      <div className="flex flex-col gap-2">
                        <label className="font-sans text-brand-cream/70 text-xs font-semibold">
                          {t("contactModal.fields.subject")}
                        </label>
                        <select
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          disabled={isSubmitting}
                          className="bg-brand-dark/50 border border-brand-cream/10 rounded-lg p-3 text-[12.5px] font-sans text-brand-cream focus:border-brand-orange focus:outline-none transition-colors duration-200 disabled:opacity-50 cursor-pointer"
                          required
                        >
                          <option value="" disabled className="bg-brand-dark">
                            {language === "es" ? "Selecciona una opción" : "Select an option"}
                          </option>
                          <option value="job" className="bg-brand-dark">
                            {t("contactModal.fields.subjectOptions.job")}
                          </option>
                          <option value="collab" className="bg-brand-dark">
                            {t("contactModal.fields.subjectOptions.collab")}
                          </option>
                          <option value="gigantic" className="bg-brand-dark">
                            {t("contactModal.fields.subjectOptions.gigantic")}
                          </option>
                          <option value="other" className="bg-brand-dark">
                            {t("contactModal.fields.subjectOptions.other")}
                          </option>
                        </select>
                      </div>
                    </div>

                    {/* Message Area */}
                    <div className="flex flex-col gap-2">
                      <label className="font-sans text-brand-cream/70 text-xs font-semibold">
                        {t("contactModal.fields.message")}
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t("contactModal.fields.messagePlaceholder")}
                        disabled={isSubmitting}
                        rows={4}
                        className="bg-brand-dark/50 border border-brand-cream/10 rounded-lg p-3 text-[12.5px] font-sans text-brand-cream placeholder:text-brand-cream/25 focus:border-brand-orange focus:outline-none transition-colors duration-200 resize-none disabled:opacity-50"
                        required
                      />
                    </div>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success-screen"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-6"
                  >
                    <CheckCircle2 className="w-16 h-16 text-brand-blush mb-5 animate-bounce" />
                    <h4 className="font-serif text-2xl mb-3 text-brand-cream">
                      {t("contactModal.success.title")}
                    </h4>
                    <p className="font-sans text-brand-cream/60 text-[12.5px] leading-relaxed max-w-[360px]">
                      {t("contactModal.success.message")}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Buttons */}
            <div className="mt-8 pt-6 border-t border-brand-cream/10 flex justify-end gap-4">
              {!isSuccess ? (
                <>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="font-sans text-brand-cream/50 hover:text-brand-cream text-[10px] tracking-widest uppercase bg-transparent border border-brand-cream/10 py-3 px-5 rounded-lg cursor-pointer transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {t("contactModal.close")}
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="flex items-center gap-2 font-sans bg-brand-blush hover:bg-[#c44f38] text-brand-ink text-[10px] tracking-widest uppercase border-none py-3 px-6 rounded-lg cursor-pointer transition-colors duration-250 font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="w-3.5 h-3.5 border-2 border-brand-ink border-t-transparent rounded-full animate-spin" />
                    ) : (
                      t("contactModal.submit")
                    )}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleClose}
                  className="font-sans bg-brand-cream text-brand-ink text-[10px] tracking-widest uppercase border-none py-3 px-7 rounded-lg cursor-pointer hover:bg-brand-blush transition-colors duration-250 font-bold"
                >
                  {t("contactModal.success.close")}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
