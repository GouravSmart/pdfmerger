"use client";
import React, {
  useState,
  ChangeEvent,
  DragEvent,
  CSSProperties,
  useEffect,
} from "react";
import {
  DocumentTextIcon,
  ArrowUpOnSquareIcon,
  Bars3Icon,
  XMarkIcon,
  FingerPrintIcon,
} from "@heroicons/react/24/outline";
import {
  SignedOut,
  SignedIn,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import { PDFDocument } from "pdf-lib";

/* -------------------------------------------------------------------------- */
/*                                    CSS                                     */
/* -------------------------------------------------------------------------- */
const styles = {
  page: {
    fontFamily: "Inter, sans-serif",
    backgroundColor: "#12121d",
    minHeight: "100vh",
    color: "white",
  },
  /* ------------------------------ navigation ------------------------------ */
  nav: {
    display: "flex",
    alignItems: "center",
    padding: "1rem 2rem",
    borderBottom: "1px solid #2f7bff44",
    position: "sticky" as const,
    top: 0,
    backgroundColor: "#12121d",
    zIndex: 1000,
  },
  navLogoContainer: { display: "flex", alignItems: "center", gap: 8 },
  navLinksContainer: {
    display: "flex",
    gap: 24,
    alignItems: "center",
  },
  navLink: {
    cursor: "pointer",
    color: "inherit",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 16,
  },
  mobileMenuButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    marginLeft: "auto",
  },
  mobileMenu: {
    display: "flex",
    flexDirection: "column" as const,
    backgroundColor: "#1f2937",
    position: "absolute" as const,
    top: 64,
    right: 0,
    width: "100%",
    padding: 16,
    gap: 16,
    zIndex: 999,
  },
  signInButton: {
    backgroundColor: "#2F7BFF",
    border: "none",
    borderRadius: 4,
    color: "white",
    padding: "8px 16px",
    cursor: "pointer",
    fontWeight: 600,
  },
  signInButtonHover: { backgroundColor: "#1c5fd9" },
  /* -------------------------------- layout -------------------------------- */
  hero: { padding: "3rem 2rem", textAlign: "center" as const },
  heroTitle: { fontSize: "2.5rem", marginBottom: 12 },
  heroSubcopy: { fontSize: "1.125rem", color: "#a1a1aa" },
  /* ------------------------------ upload box ------------------------------ */
  uploadWrapper: {
    display: "flex",
    justifyContent: "center",
  },
  uploadCard: {
    marginTop: 45,
    width: 400,
    maxWidth: "100%",
    backgroundColor: "#12121d",
    borderRadius: 12,
    border: "2px dotted #8a2be2",
    padding: 24,
    cursor: "pointer",
    userSelect: "none",
    color: "#a1a1aa",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    textAlign: "center" as const,
  } as CSSProperties,
  uploadIcon: { width: 48, height: 48, marginBottom: 12, stroke: "#8a2be2" },
  uploadTextMain: { fontSize: "1.125rem", marginBottom: 4 },
  uploadTextSub: { fontSize: "0.875rem", marginBottom: 16, color: "#6b7280" },
  uploadButton: {
    backgroundColor: "#2F7BFF",
    color: "white",
    border: "none",
    padding: "0.5rem 1.5rem",
    borderRadius: 9999,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "1rem",
  },
  uploadNote: { marginTop: 12, fontSize: "0.75rem", color: "#4b5563" },
  /* ------------------------------ file list ------------------------------ */
  fileList: { marginTop: 20, display: "flex", flexDirection: "column" as const, gap: 12 },
  fileItem: {
    backgroundColor: "#22222b",
    padding: 12,
    borderRadius: 8,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fileRemoveBtn: {
    background: "none",
    border: "none",
    color: "#ff4d4d",
    cursor: "pointer",
    fontSize: 20,
    lineHeight: 1,
  },
  mergeButton: {
    marginTop: 24,
    padding: "12px 36px",
    backgroundColor: "#2F7BFF",
    border: "none",
    borderRadius: 8,
    color: "white",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 16,
  },
  /* ----------------------------- misc sections ----------------------------- */
  section: { padding: "4rem 2rem" },
  sectionTitleLeft: { fontSize: 24, marginBottom: 24, fontWeight: 700 },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: 40,
    marginTop: 24,
  },
  featureItem: {
    backgroundColor: "#12121d",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 0 8px #2f7bffbb",
    textAlign: "center" as const,
  },
  featureTitle: { fontWeight: 700, fontSize: "1.25rem", marginBottom: 12 },
  featureText: { color: "#a1a1aa", fontSize: "1rem" },
  buttonOutline: {
    border: "2px solid #2F7BFF",
    borderRadius: 8,
    color: "#2F7BFF",
    padding: "10px 20px",
    cursor: "pointer",
    fontWeight: 700,
    textDecoration: "none",
    display: "inline-block",
    transition: "background-color 0.3s, color 0.3s",
  },
  howToUseGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 32,
    marginTop: 24,
  },
  howToUseItem: {
    backgroundColor: "#22222b",
    borderRadius: 12,
    padding: 24,
    textAlign: "center" as const,
    color: "#a1a1aa",
    boxShadow: "0 0 8px #2f7bffbb",
    fontWeight: 500,
  },
};

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */
export default function PDFMergerLanding() {
  /* ------------------------------- state --------------------------------- */
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [merging, setMerging] = useState(false);

  /* ----------------------------- handlers -------------------------------- */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      setSelectedFiles((prev) => [...prev, ...Array.from(files)]);
      setMergedPdfUrl(null);
    }
  };
  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragActive(false);
  };
  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
      setMergedPdfUrl(null);
    }
  };
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setMergedPdfUrl(null);
  };

  /* ------------------------------ merge pdf ------------------------------ */
  const mergeFiles = async () => {
    if (selectedFiles.length < 2) return;
    setMerging(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of selectedFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((p) => mergedPdf.addPage(p));
      }
      const bytes = await mergedPdf.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      setMergedPdfUrl(URL.createObjectURL(blob));
    } catch (err) {
      alert("Error merging PDFs, try again.");
      console.error(err);
    } finally {
      setMerging(false);
    }
  };

  /* ------------------------------- cleanup ------------------------------- */
  useEffect(() => {
    return () => {
      if (mergedPdfUrl) URL.revokeObjectURL(mergedPdfUrl);
    };
  }, [mergedPdfUrl]);

  /* -------------------------------- JSX ---------------------------------- */
  return (
    <>
      {/* media-query helpers */}
      <style>{`
        @media(min-width: 768px){
          .mobile-only{display:none!important;}
        }
        @media(max-width: 767px){
          .desktop-only{display:none!important;}
        }
      `}</style>

      <div style={styles.page}>
        {/* --------------------------- NAVIGATION --------------------------- */}
        <nav style={{ ...styles.nav, justifyContent: "space-between" }}>
          {/* logo ---------------------------------------------------------- */}
          <div style={styles.navLogoContainer}>
            <DocumentTextIcon
              style={{ width: 28, height: 28, color: "#8a2be2" }}
            />
            <h1
              style={{
                margin: 0,
                fontWeight: "bold",
                fontSize: "1.25rem",
                background: "linear-gradient(90deg,#8e44ad,#e91e63)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              PDF Merger
            </h1>
          </div>

          {/* nav links – desktop ------------------------------------------ */}
          <div
            className="desktop-only"
            style={{ ...styles.navLinksContainer, marginLeft: "auto" }}
          >
            <a
              style={styles.navLink}
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Home
            </a>
            <a
              href="https://dev-yener.pantheonsite.io/home-2/"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.navLink}
            >
              About
            </a>
            <a
              style={styles.navLink}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("why-us")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Why Choose Us
            </a>
            <SignedOut>
              <SignInButton>
                <button
                  style={{
                    ...styles.signInButton,
                    ...(hoveredButton === "signin"
                      ? styles.signInButtonHover
                      : {}),
                  }}
                  onMouseEnter={() => setHoveredButton("signin")}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>

          {/* hamburger – mobile ------------------------------------------- */}
          <button
            aria-label="Menu"
            className="mobile-only"
            style={styles.mobileMenuButton}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? (
              <XMarkIcon style={{ width: 32, height: 32 }} />
            ) : (
              <Bars3Icon style={{ width: 32, height: 32 }} />
            )}
          </button>
        </nav>

        {/* mobile dropdown links */}
        {menuOpen && (
          <div className="mobile-only" style={styles.mobileMenu}>
            {[
              {
                label: "Home",
                action: () => window.scrollTo({ top: 0, behavior: "smooth" }),
              },
              {
                label: "About",
                href: "https://dev-yener.pantheonsite.io/home-2/",
              },
              {
                label: "Why Choose Us",
                action: () =>
                  document
                    .getElementById("why-us")
                    ?.scrollIntoView({ behavior: "smooth" }),
              },
            ].map((l) =>
              l.href ? (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.navLink}
                  onClick={() => setMenuOpen(false)}
                >
                  {l.label}
                </a>
              ) : (
                <a
                  key={l.label}
                  style={styles.navLink}
                  onClick={() => {
                    l.action?.();
                    setMenuOpen(false);
                  }}
                >
                  {l.label}
                </a>
              )
            )}

            <SignedOut>
              <SignInButton>
                <button
                  style={styles.signInButton}
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        )}

        {/* ----------------------------- HERO ----------------------------- */}
        <section style={styles.hero}>
          <h2 style={styles.heroTitle}>Merge Your PDFs Easily & Fast</h2>
          <p style={styles.heroSubcopy}>Drag, drop and merge in seconds.</p>

          {/* centered upload area */}
          <div style={styles.uploadWrapper}>
            <label
              htmlFor="file-upload"
              style={{
                ...styles.uploadCard,
                borderColor: dragActive ? "#6f42c1" : "#8a2be2",
                backgroundColor: dragActive ? "#211f2f" : "#12121d",
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <ArrowUpOnSquareIcon style={styles.uploadIcon} />
              <span style={styles.uploadTextMain}>Upload your PDF files</span>
              <span style={styles.uploadTextSub}>or drag & drop</span>
              <input
                id="file-upload"
                type="file"
                accept="application/pdf"
                multiple
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <button
                type="button"
                style={styles.uploadButton}
                onClick={() =>
                  document.getElementById("file-upload")?.click()
                }
              >
                Select Files
              </button>
              <span style={styles.uploadNote}>Any PDF • Max 10 MB Limit.</span>
            </label>
          </div>

          {/* file list */}
          {selectedFiles.length > 0 && (
            <div style={styles.fileList}>
              {selectedFiles.map((f, i) => (
                <div key={i} style={styles.fileItem}>
                  <span>{f.name}</span>
                  <button
                    style={styles.fileRemoveBtn}
                    onClick={() => removeFile(i)}
                  >
                    &times;
                  </button>
                </div>
              ))}
              <button
                style={{
                  ...styles.mergeButton,
                  opacity: merging ? 0.6 : 1,
                  cursor: merging ? "not-allowed" : "pointer",
                }}
                onClick={mergeFiles}
                disabled={selectedFiles.length < 2 || merging}
              >
                {merging ? "Merging…" : "Merge PDFs"}
              </button>
            </div>
          )}

          {/* download link */}
          {mergedPdfUrl && (
            <div style={{ marginTop: 32 }}>
              <a
                href={mergedPdfUrl}
                download="merged.pdf"
                style={styles.buttonOutline}
              >
                Download Merged PDF
              </a>
            </div>
          )}
        </section>

        {/* ------------------------- WHY CHOOSE US ------------------------- */}
        <section id="why-us" style={styles.section}>
          <h2 style={styles.sectionTitleLeft}>Why Choose Us</h2>
          <div style={styles.featureGrid}>
            {[
              {
                icon: <FingerPrintIcon style={{ width: 48, height: 48 }} />,
                title: "Fast & Reliable",
                text: "Merge PDFs in the browser in seconds.",
              },
              {
                icon: <ArrowUpOnSquareIcon style={{ width: 48, height: 48 }} />,
                title: "Private & Secure",
                text: "Files never leave your device.",
              },
              {
                icon: <DocumentTextIcon style={{ width: 48, height: 48 }} />,
                title: "Lossless Quality",
                text: "No compression, no watermarks.",
              },
              {
                icon: <Bars3Icon style={{ width: 48, height: 48 }} />,
                title: "Any PDF Version",
                text: "Works with all standard PDFs.",
              },
            ].map((f) => (
              <div key={f.title} style={styles.featureItem}>
                {f.icon}
                <h3 style={styles.featureTitle}>{f.title}</h3>
                <p style={styles.featureText}>{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* -------------------------- HOW TO USE --------------------------- */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitleLeft}>How to Use</h2>
          <div style={styles.howToUseGrid}>
            {[
              ["Upload", "Select or drag your PDFs."],
              ["Arrange", "Remove or reorder files."],
              ["Merge", "Click ‘Merge PDFs’. "],
              ["Download", "Grab your combined file."],
            ].map(([t, d], i) => (
              <div key={i} style={styles.howToUseItem}>
                <h3>{`${i + 1}. ${t}`}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------------------- FOOTER ----------------------------- */}
        <footer
          style={{
            marginTop: 40,
            padding: "1rem 2rem",
            textAlign: "center",
            backgroundColor: "#12121d",
            color: "#6b7280",
            fontSize: 14,
            borderTop: "1px solid #2f7bff44",
          }}
        >
          © {new Date().getFullYear()} All rights reserved. Made by Gourav
        </footer>
      </div>
    </>
  );
}
