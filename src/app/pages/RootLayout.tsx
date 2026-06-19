import { Outlet, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { SharedHeader } from "../components/SharedHeader";
import { CursorFollower } from "../components/CursorFollower";
import { BookingModal } from "../components/BookingModal";
import { C } from "../tokens";

export function RootLayout() {
  const location = useLocation();

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh" }}>
      <SharedHeader />
      <CursorFollower />
      <BookingModal />

      <Outlet />


    </div>
  );
}