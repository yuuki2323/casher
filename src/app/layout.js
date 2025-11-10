import "./globals.css";

export const metadata = {
  title: "モダンレジ締めアプリ",
  description: "Next.js + Tailwindで作るiPad向けレジ締めアプリ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body className="bg-gray-100 min-h-screen flex justify-center p-6">
        {children}
      </body>
    </html>
  );
}
