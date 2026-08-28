import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, ArrowLeft, CheckCircle2, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
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
  
  // Calendar states
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Validation and Submission states
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleOpen = () => {
      setStep(1);
      setProjectType(null);
      setDescription("");
      setTimeline("");
      setBudget("");
      setName("");
      setEmail("");
      setSelectedDate(null);
      setCurrentMonth(new Date());
      setShowCalendar(false);
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

  const months = language === "es"
    ? ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
    : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
  const weekDays = language === "es"
    ? ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"]
    : ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust so Monday is 0, Sunday is 6
  };

  const handleMonthChange = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isDateBeforeToday = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isSelectedDate = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const handleNext = () => {
    setError("");
    if (step === 1 && !projectType) {
      setError(language === "es" ? "Por favor, selecciona un tipo de proyecto" : "Please select a project type");
      return;
    }
    if (step === 2) {
      if (!description.trim()) {
        setError(language === "es" ? "Por favor, introduce una descripción de tu idea" : "Please describe your idea");
        return;
      }
      if (!selectedDate) {
        setError(language === "es" ? "Por favor, selecciona una fecha en el calendario" : "Please select a date on the calendar");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError(language === "es" ? "Por favor, introduce tu nombre" : "Please enter your name");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(language === "es" ? "Por favor, introduce un correo electrónico válido" : "Please enter a valid email");
      return;
    }
    if (!budget) {
      setError(language === "es" ? "Por favor, selecciona un rango de presupuesto" : "Please select a budget range");
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedDeadline = selectedDate
        ? selectedDate.toLocaleDateString(language === "es" ? "es-ES" : "en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : (timeline || "Flexible");

      const response = await fetch("/api/send-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          projectType,
          description,
          deadline: formattedDeadline,
          timeline: formattedDeadline,
          budget,
          name,
          email
        })
      });

      const data = await response.json();

      if (response.ok) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#E55427", "#EAA898", "#F5EDE0", "#B4FF2E"]
        });
        setStep(4);
      } else {
        setError(data.error || (language === "es" ? "Error al enviar la solicitud" : "Error sending request"));
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
          colors: ["#E55427", "#EAA898", "#F5EDE0", "#B4FF2E"]
        });
        setStep(4);
      } else {
        setError(language === "es" ? "Error de conexión con el servidor. Inténtalo de nuevo." : "Connection error. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
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
            className="relative w-full max-w-[640px] h-full sm:h-auto max-h-[100vh] sm:max-h-[85vh] bg-brand-bg border border-brand-cream/10 sm:rounded-2xl shadow-2xl flex flex-col sm:overflow-visible overflow-hidden text-brand-cream p-6 sm:p-10"
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

                    {/* Timeline Input with Custom Calendar */}
                    <div className="flex flex-col gap-2.5 relative">
                      <label className="font-sans text-brand-cream/70 text-xs font-semibold">
                        {t("booking.fields.timeline")}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          value={
                            selectedDate
                              ? selectedDate.toLocaleDateString(language === "es" ? "es-ES" : "en-US", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })
                              : ""
                          }
                          onClick={() => setShowCalendar(!showCalendar)}
                          placeholder={t("booking.fields.timelinePlaceholder")}
                          className="w-full bg-brand-dark/50 border border-brand-cream/10 rounded-lg p-3 pr-10 text-[12.5px] font-sans text-brand-cream placeholder:text-brand-cream/25 focus:border-brand-orange focus:outline-none transition-colors duration-200 cursor-pointer select-none"
                        />
                        <Calendar
                          size={15}
                          className="absolute right-3 top-3 text-brand-cream/40 pointer-events-none"
                        />
                      </div>

                      {/* Calendar Popover */}
                      <AnimatePresence>
                        {showCalendar && (
                          <>
                            {/* Overlay to catch clicks outside the calendar popover */}
                            <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowCalendar(false)} />
                            
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className="absolute bottom-full left-0 right-0 z-50 mb-2 bg-brand-dark border border-brand-cream/10 rounded-xl p-4 shadow-2xl text-brand-cream select-none"
                            >
                              {/* Header */}
                              <div className="flex justify-between items-center mb-3">
                                <button
                                  type="button"
                                  onClick={() => handleMonthChange("prev")}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-brand-cream/10 hover:bg-brand-cream/10 text-brand-cream/60 hover:text-brand-cream transition-colors duration-150 cursor-pointer"
                                >
                                  <ChevronLeft size={14} />
                                </button>
                                <span className="font-serif text-xs font-light text-brand-cream/90">
                                  {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleMonthChange("next")}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-brand-cream/10 hover:bg-brand-cream/10 text-brand-cream/60 hover:text-brand-cream transition-colors duration-150 cursor-pointer"
                                >
                                  <ChevronRight size={14} />
                                </button>
                              </div>

                              {/* Weekdays */}
                              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                                {weekDays.map((wd) => (
                                  <span key={wd} className="font-sans text-[9px] font-bold text-brand-cream/35">
                                    {wd}
                                  </span>
                                ))}
                              </div>

                              {/* Days Grid */}
                              <div className="grid grid-cols-7 gap-1 text-center">
                                {(() => {
                                  const yr = currentMonth.getFullYear();
                                  const mo = currentMonth.getMonth();
                                  const totalDays = getDaysInMonth(yr, mo);
                                  const firstDayOffset = getFirstDayOfMonth(yr, mo);
                                  
                                  const cells = [];
                                  
                                  // Empty offset slots
                                  for (let i = 0; i < firstDayOffset; i++) {
                                    cells.push(<div key={`empty-${i}`} className="w-8 h-8" />);
                                  }
                                  
                                  // Day cells
                                  for (let d = 1; d <= totalDays; d++) {
                                    const date = new Date(yr, mo, d);
                                    const disabled = isDateBeforeToday(date);
                                    const selected = isSelectedDate(date);
                                    
                                    cells.push(
                                      <button
                                        key={`day-${d}`}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => {
                                          setSelectedDate(date);
                                          setShowCalendar(false);
                                        }}
                                        className={`w-8 h-8 rounded-lg text-[11px] font-sans flex items-center justify-center transition-all duration-150 ${
                                          selected
                                            ? "bg-brand-orange text-brand-ink font-bold shadow-md scale-105"
                                            : disabled
                                            ? "text-brand-cream/15 cursor-not-allowed"
                                            : "text-brand-cream hover:bg-brand-cream/10 hover:text-brand-orange cursor-pointer"
                                        }`}
                                      >
                                        {d}
                                      </button>
                                    );
                                  }
                                  
                                  return cells;
                                })()}
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
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
                  disabled={isSubmitting}
                  onClick={handlePrev}
                  className="flex items-center gap-2 font-sans text-brand-cream/50 hover:text-brand-cream text-[10px] tracking-widest uppercase bg-transparent border border-brand-cream/10 py-3 px-5 rounded-lg cursor-pointer transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
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
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="flex items-center gap-2 font-sans bg-brand-blush hover:bg-brand-cream text-brand-ink text-[10px] tracking-widest uppercase border-none py-3 px-6 rounded-lg cursor-pointer transition-colors duration-250 font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="w-3.5 h-3.5 border-2 border-brand-ink border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        {t("booking.submit")}
                      </>
                    )}
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
