import { Inter } from "next/font/google";
import "./globals.css";

import "./bootstrap.min.css";
import "./select2-theme.min.css";
import "./select2.min.css";
import "./vendors.min.css";
import "./theme.min.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Calendar",
  description: "Calendar of events",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
