import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useLanguage } from "../context/LanguageContext";
import { ease } from "../tokens";

export function BookingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const { t, language } = useLanguage();

  // Form states
  const [projectType, setProjectType] = useState<"commercial" | "personal" | null>(null);
  const [description, setDescription] = useState("");
  const [timeline, setTimeline] = useState("");
  const [budget, setBudget] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  // Validation states
  const [error, setError] = useState("");

  useEffect(() => {
    const handleOpen = () => {
      setStep(1);
      setProjectType(null);
      setDescription("");
      setTimeline("");
      setBudget("");
      setName("");
      setEmail("");
      setError("");
      setIsOpen(true);
      document.body.style.overflow = "hidden"; // Lock page scroll
    };

    window.addEventListener("open-booking-modal", handleOpen);
    return () => {
      window.removeEventListener("open-booking-modal", handleOpen);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    document.body.style.overflow = ""; // Unlock page scroll
  };

  const handleNext = () => {
    setError("");
    if (step === 1 && !projectType) {
      setError(language === "es" ? "Por favor, selecciona un tipo de proyecto" : "Please select a project type");
      return;
    }
    if (step === 2 && !description.trim()) {
      setError(language === "es" ? "Por favor, introduce una descripción de tu idea" : "Please describe your idea");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError(language === "es" ? "Por favor, introduce tu nombre" : "Please enter your name");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError(language === "es" ? "Por favor, introduce un correo electrónico válido" : "Please enter a valid email");
      return;
    }
    if (!budget) {
      setError(language === "es" ? "Por favor, selecciona un rango de presupuesto" : "Please select a budget range");
      return;
    }

    // Trigger canvas-confetti explosion
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#E55427", "#EAA898", "#F5EDE0", "#B4FF2E"]
    });

    setStep(4);
  };

  const budgetRanges = t("booking.fields.budgetRanges") || [];

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
            className="relative w-full max-w-[640px] h-full sm:h-auto max-h-[100vh] sm:max-h-[85vh] bg-brand-bg border border-brand-cream/10 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden text-brand-cream p-6 sm:p-10"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="font-sans text-brand-orange text-[9px] tracking-widest uppercase block mb-1">
                  {step < 4 ? `${t("booking.steps.step")} ${step} ${t("booking.steps.of")} 3` : "Completado"}
                </span>
                <h3 className="font-serif text-brand-cream text-2xl font-light">
                  {t("booking.title")}
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full border border-brand-cream/10 flex items-center justify-center hover:bg-brand-cream/10 hover:text-brand-orange cursor-pointer transition-colors duration-200"
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

            {/* Steps Content */}
            <div className="flex-1 flex flex-col justify-center min-h-[280px]">
              <AnimatePresence mode="wait">
                
                {/* ── STEP 1: PROJECT TYPE ── */}
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-4"
                  >
                    <p className="font-sans text-brand-cream/50 text-xs mb-2">
                      {t("booking.subtitle")}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Commercial Card */}
                      <button
                        type="button"
                        onClick={() => setProjectType("commercial")}
                        className={`p-6 text-left border rounded-xl cursor-pointer transition-all duration-300 flex flex-col gap-3 group ${
                          projectType === "commercial"
                            ? "bg-brand-orange/10 border-brand-orange shadow-lg"
                            : "bg-brand-dark/50 border-brand-cream/10 hover:border-brand-cream/35"
                        }`}
                      >
                        <span className={`font-serif text-lg ${projectType === "commercial" ? "text-brand-orange" : "text-brand-cream"}`}>
                          {t("booking.types.commercial.title")}
                        </span>
                        <span className="font-sans text-brand-cream/45 text-[11px] leading-relaxed">
                          {t("booking.types.commercial.desc")}
                        </span>
                      </button>

                      {/* Personal Card */}
                      <button
                        type="button"
                        onClick={() => setProjectType("personal")}
                        className={`p-6 text-left border rounded-xl cursor-pointer transition-all duration-300 flex flex-col gap-3 group ${
                          projectType === "personal"
                            ? "bg-brand-blush/10 border-brand-blush shadow-lg"
                            : "bg-brand-dark/50 border-brand-cream/10 hover:border-brand-cream/35"
                        }`}
                      >
                        <span className={`font-serif text-lg ${projectType === "personal" ? "text-brand-blush" : "text-brand-cream"}`}>
                          {t("booking.types.personal.title")}
                        </span>
                        <span className="font-sans text-brand-cream/45 text-[11px] leading-relaxed">
                          {t("booking.types.personal.desc")}
                        </span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 2: PROJECT DETAILS ── */}
                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-5"
                  >
                    {/* Description Area */}
                    <div className="flex flex-col gap-2.5">
                      <label className="font-sans text-brand-cream/70 text-xs font-semibold">
                        {t("booking.fields.description")}
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t("booking.fields.descriptionPlaceholder")}
                        rows={4}
                        className="bg-brand-dark/50 border border-brand-cream/10 rounded-lg p-3 text-[12.5px] font-sans text-brand-cream placeholder:text-brand-cream/25 focus:border-brand-orange focus:outline-none transition-colors duration-200 resize-none"
                      />
                    </div>

                    {/* Timeline Input */}
                    <div className="flex flex-col gap-2.5">
                      <label className="font-sans text-brand-cream/70 text-xs font-semibold">
                        {t("booking.fields.timeline")}
                      </label>
                      <input
                        type="text"
                        value={timeline}
                        onChange={(e) => setTimeline(e.target.value)}
                        placeholder={t("booking.fields.timelinePlaceholder")}
                        className="bg-brand-dark/50 border border-brand-cream/10 rounded-lg p-3 text-[12.5px] font-sans text-brand-cream placeholder:text-brand-cream/25 focus:border-brand-orange focus:outline-none transition-colors duration-200"
                      />
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 3: CONTACT & BUDGET ── */}
                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-5"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="flex flex-col gap-2">
                        <label className="font-sans text-brand-cream/70 text-xs font-semibold">
                          {t("booking.fields.name")}
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-brand-dark/50 border border-brand-cream/10 rounded-lg p-3 text-[12.5px] font-sans text-brand-cream focus:border-brand-orange focus:outline-none transition-colors duration-200"
                          required
                        />
                      </div>

                      {/* Email */}
                      <div className="flex flex-col gap-2">
                        <label className="font-sans text-brand-cream/70 text-xs font-semibold">
                          {t("booking.fields.email")}
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-brand-dark/50 border border-brand-cream/10 rounded-lg p-3 text-[12.5px] font-sans text-brand-cream focus:border-brand-orange focus:outline-none transition-colors duration-200"
                          required
                        />
                      </div>
                    </div>

                    {/* Budget Tiers */}
                    <div className="flex flex-col gap-2.5">
                      <label className="font-sans text-brand-cream/70 text-xs font-semibold">
                        {t("booking.fields.budget")}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {budgetRanges.map((range: string) => (
                          <button
                            key={range}
                            type="button"
                            onClick={() => setBudget(range)}
                            className={`p-2.5 text-center text-xs border rounded-lg cursor-pointer transition-all duration-300 font-sans ${
                              budget === range
                                ? "bg-brand-orange text-brand-ink border-brand-orange font-semibold"
                                : "bg-brand-dark/50 border-brand-cream/10 hover:border-brand-cream/35 text-brand-cream/70"
                            }`}
                          >
                            {range}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 4: SUCCESS ── */}
                {step === 4 && (
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-6"
                  >
                    <CheckCircle2 className="w-16 h-16 text-brand-orange mb-5 animate-bounce" />
                    <h4 className="font-serif text-2xl mb-3 text-brand-cream">
                      {t("booking.success.title")}
                    </h4>
                    <p className="font-sans text-brand-cream/60 text-[12.5px] leading-relaxed max-w-[360px]">
                      {t("booking.success.message")}
                    </p>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Footer buttons */}
            <div className="mt-8 pt-6 border-t border-brand-cream/10 flex justify-between gap-4">
              {step > 1 && step < 4 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center gap-2 font-sans text-brand-cream/50 hover:text-brand-cream text-[10px] tracking-widest uppercase bg-transparent border border-brand-cream/10 py-3 px-5 rounded-lg cursor-pointer transition-colors duration-200"
                >
                  <ArrowLeft size={13} /> {t("booking.prev")}
                </button>
              )}

              <div className="ml-auto flex gap-3">
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 font-sans bg-brand-cream/10 hover:bg-brand-cream/20 text-brand-cream text-[10px] tracking-widest uppercase border border-brand-cream/10 py-3 px-6 rounded-lg cursor-pointer transition-colors duration-250 font-semibold"
                  >
                    {t("booking.next")} <ArrowRight size={13} />
                  </button>
                ) : step === 3 ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex items-center gap-2 font-sans bg-brand-orange hover:bg-[#c94520] text-brand-cream text-[10px] tracking-widest uppercase border-none py-3 px-6 rounded-lg cursor-pointer transition-colors duration-250 font-bold shadow-md"
                  >
                    {t("booking.submit")}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleClose}
                    className="font-sans bg-brand-cream text-brand-ink text-[10px] tracking-widest uppercase border-none py-3 px-7 rounded-lg cursor-pointer hover:bg-brand-blush transition-colors duration-250 font-bold"
                  >
                    {t("booking.success.close")}
                  </button>
                )}
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
