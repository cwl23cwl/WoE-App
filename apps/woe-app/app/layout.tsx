// apps/woe-app/app/layout.tsx
import "@woe/excalidraw-wrapper/index.css";
import "../.superdesign/design_iterations/default_ui_darkmode.css";
import "../.superdesign/design_iterations/student_workspace_theme.css";
import "../styles/fixed-stage.css"; // Fixed stage canvas styles
import "./globals.css"; // Global/tailwind styles
import type { ReactNode } from 'react';
import Providers from './providers';

export const metadata = {
  title: "Write on English",
  description: "Classroom workspace by Write on English",
  other: {
    viewport: "width=device-width, initial-scale=1, user-scalable=yes",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // Light mode everywhere
  return (
    <html lang="en" className="sd">
      <head>
        {/* Google Fonts - Open Sans for elementary education */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500;1,600&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
