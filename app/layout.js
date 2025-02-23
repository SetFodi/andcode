// app/layout.js
import Providers from "./providers"; // now this will find a default export
import "./globals.css";

export const metadata = {
  title: "LeetCode Clone",
  description: "Practice coding problems",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
