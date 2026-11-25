/*
  Bare root layout for the language-picking page at `/`. Each language tree
  under app/(site)/[lang] has its own full layout with the header and footer.
*/
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
