// ─── NavBar ───────────────────────────────────────────────────────────────────
//
// Sticky top navigation bar with section anchors, theme toggle, and active
// section tracking via IntersectionObserver.

import { useState, useEffect } from "react";
import type { ThemeManager, LocalizationShell } from "@ficecal/ui-foundation";
import { ThemeToggle } from "./ThemeToggle.js";

interface NavSection {
  id: string;
  label: string;
}

const SECTIONS: NavSection[] = [
  { id: "calculator", label: "Calculator" },
  { id: "health", label: "Health" },
  { id: "chart", label: "Chart" },
  { id: "architect", label: "Architect" },
];

interface Props {
  theme: ThemeManager;
  i18n: LocalizationShell;
}

export function NavBar({ theme, i18n }: Props) {
  const [activeSection, setActiveSection] = useState<string>("calculator");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: "-40% 0px -50% 0px" }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav className="navbar" aria-label="FiceCal sections">
      <div className="navbar-brand">
        <span className="navbar-eyebrow">{i18n.t("ui.title")}</span>
        <span className="navbar-tagline">{i18n.t("ui.tagline")}</span>
      </div>

      <ul className="navbar-links" role="list">
        {SECTIONS.map(({ id, label }) => (
          <li key={id}>
            <button
              className={`navbar-link${activeSection === id ? " is-active" : ""}`}
              onClick={() => scrollTo(id)}
              aria-current={activeSection === id ? "location" : undefined}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>

      <ThemeToggle theme={theme} i18n={i18n} />
    </nav>
  );
}
