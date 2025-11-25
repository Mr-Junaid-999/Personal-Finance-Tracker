// app/layout.js
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Finance Tracker",
  description: "Track your income and expenses",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className={`${inter.className} min-h-screen bg-gray-50`}>
          {children}
        </div>
      </body>
    </html>
  );
}
