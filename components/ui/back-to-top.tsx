"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 240);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed right-4 bottom-6 z-50 sm:right-6">
      <Button
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="h-11 w-11 p-0 rounded-full bg-[linear-gradient(135deg,var(--color-accent),#14b8a6)] text-[color:var(--color-accent-foreground)] shadow-lg shadow-teal-500/25 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        <span className="sr-only">Back to top</span>
        <ArrowUp className="h-5 w-5" />
      </Button>
    </div>
  );
}

export default BackToTop;
