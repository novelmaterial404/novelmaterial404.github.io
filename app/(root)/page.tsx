import type { Metadata } from 'next';

/*
  The entry page at `/`. A static host cannot redirect on the server, so this
  page picks a language in the browser and moves on immediately:

  - any Traditional-Chinese-leaning browser language (zh-TW, zh-Hant, zh-HK,
    zh-MO) goes to /zh-Hant/
  - everything else, including Simplified Chinese, goes to /en/
  - without JavaScript, the <meta refresh> sends readers to /en/, and the two
    links are there as a last resort.
*/

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const metadata: Metadata = {
  title: 'Novel Inorganic Materials Lab',
  robots: { index: false },
};

const pickLanguage = `(function(){try{
var langs=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||''];
var target='en';
for(var i=0;i<langs.length;i++){var t=String(langs[i]).toLowerCase();
if(/^zh(-hant\\b|-tw\\b|-hk\\b|-mo\\b)/.test(t)){target='zh-Hant';break}
if(t==='en'||t.indexOf('en-')===0){target='en';break}}
location.replace(${JSON.stringify(base)}+'/'+target+'/');
}catch(e){location.replace(${JSON.stringify(base)}+'/en/')}})();`;

export default function Home() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: pickLanguage }} />
      <noscript>
        <meta httpEquiv="refresh" content={`0; url=${base}/en/`} />
      </noscript>
      <p style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
        <a href={`${base}/en/`}>English</a> · <a href={`${base}/zh-Hant/`}>中文</a>
      </p>
    </>
  );
}
