// app/layout.tsx
import "@woe/excalidraw/index.css";
import "../.superdesign/design_iterations/default_ui_darkmode.css";
import "../.superdesign/design_iterations/student_workspace_theme.css";
import "./globals.css"; // keep your existing global/tailwind
// (optional) comment this out for now if you added it earlier
// import "./sd-namespace.css";

export const metadata = {
  title: "Write on English",
  description: "Classroom workspace by Write on English",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Light mode everywhere
  return (
    <html lang="en" className="sd">
      <body>{children}</body>
    </html>
  );
}
