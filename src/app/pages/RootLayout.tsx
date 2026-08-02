import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { SharedHeader } from "../components/SharedHeader";
import { CursorFollower } from "../components/CursorFollower";
import { BookingModal } from "../components/BookingModal";
import { ContactModal } from "../components/ContactModal";
import { C } from "../tokens";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function RootLayout() {
  const location = useLocation();

  useEffect(() => {
    ScrollTrigger.killAll();
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh" }}>
      <SharedHeader />
      <CursorFollower />
      <BookingModal />
      <ContactModal />
      <Outlet />
    </div>
  );
}