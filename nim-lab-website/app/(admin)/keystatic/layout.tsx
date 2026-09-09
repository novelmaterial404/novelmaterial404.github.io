import KeystaticApp from './keystatic';

// Root layout for the editing UI. It is deliberately separate from the public
// site's layout: the CMS gets no site chrome, fonts, or theming.
export default function KeystaticLayout() {
  return (
    <html lang="en">
      <body>
        <KeystaticApp />
      </body>
    </html>
  );
}
