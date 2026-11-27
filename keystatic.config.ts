import { config, fields, collection, singleton } from '@keystatic/core';

/**
 * Content model for the Novel Inorganic Materials Lab website.
 *
 * Two rules shape everything here:
 *
 * 1. The people editing this are chemists and physicists, not developers. Every
 *    field carries plain-language help text, and required fields are kept to
 *    the bare minimum so nobody gets stuck on a form.
 * 2. The site is bilingual. Short text uses a paired English/中文 object; long
 *    prose uses two rich-text fields, which Keystatic stores as separate files.
 *    Chinese is always optional — the site falls back to English so a
 *    half-finished translation can never leave a blank page.
 */

/** A short piece of text in both languages, shown side by side in the editor. */
function bilingualText(options: {
  label: string;
  description?: string;
  multiline?: boolean;
}) {
  return fields.object(
    {
      en: fields.text({
        label: 'English',
        multiline: options.multiline,
      }),
      zhHant: fields.text({
        label: '中文',
        multiline: options.multiline,
        description: 'Optional. Falls back to the English text if left empty.',
      }),
    },
    {
      label: options.label,
      description: options.description,
      layout: [6, 6],
    },
  );
}

const roleOptions = [
  { label: 'Principal Investigator', value: 'pi' },
  { label: 'Group Member', value: 'member' },
  { label: 'Postdoctoral Researcher', value: 'postdoc' },
  { label: 'PhD Student', value: 'phd' },
  { label: "Master's Student", value: 'masters' },
  { label: 'Undergraduate Student', value: 'undergrad' },
  { label: 'Visiting Researcher', value: 'visiting' },
  { label: 'Research Assistant / Staff', value: 'staff' },
  { label: 'Alumni', value: 'alumni' },
];

/*
  Local mode while developing (edits write straight to disk, no login); GitHub
  mode in production (sign in with GitHub, saves become commits).

  The repo name must be readable from the browser bundle as well as the server,
  hence NEXT_PUBLIC_. It is not a secret — it is the name of the repository.
  Until it is set, the deployed CMS stays in local mode rather than erroring.
*/
const githubRepo = process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO;

export default config({
  storage:
    process.env.NODE_ENV === 'development' || !githubRepo
      ? { kind: 'local' }
      : { kind: 'github', repo: githubRepo as `${string}/${string}` },

  ui: {
    brand: { name: 'Novel Inorganic Materials Lab' },
    navigation: {
      'Lab pages': ['home', 'about', 'research', 'join', 'contact'],
      People: ['people'],
      Output: ['publications', 'news', 'gallery'],
      Settings: ['siteSettings'],
    },
  },

  collections: {
    people: collection({
      label: 'People',
      slugField: 'name',
      path: 'content/people/*/',
      format: { contentField: 'bio' },
      columns: ['name', 'role'],
      entryLayout: 'form',
      schema: {
        name: fields.slug({
          name: {
            label: 'Full name (English)',
            description: 'For example: Yi-Teng Huang',
            validation: { length: { min: 1 } },
          },
          slug: {
            label: 'Web address',
            description:
              'The part that appears in the link to this profile. Generated automatically — you can leave it alone.',
          },
        }),
        nameZhHant: fields.text({
          label: 'Full name (中文)',
          description: 'Optional.',
        }),
        role: fields.select({
          label: 'Position in the lab',
          options: roleOptions,
          defaultValue: 'masters',
        }),
        photo: fields.image({
          label: 'Photo',
          description:
            'Optional. A square, head-and-shoulders photo works best. If you skip this, your initials are shown instead.',
          directory: 'public/images/people',
          publicPath: '/images/people/',
        }),
        title: bilingualText({
          label: 'Subtitle',
          description:
            'Optional one line under your name — a thesis topic or speciality. For example: Perovskite-inspired photovoltaics.',
        }),
        interests: fields.array(
          bilingualText({ label: 'Research interest' }),
          {
            label: 'Research interests',
            description: 'Optional. A few short keywords, added one at a time.',
            itemLabel: (props) => props.fields.en.value || 'Research interest',
          },
        ),
        email: fields.text({
          label: 'Email',
          description: 'Optional. Leave empty if you would rather not show it.',
        }),
        links: fields.array(
          fields.object({
            label: fields.text({
              label: 'Name of the link',
              description: 'For example: Google Scholar, ORCID, GitHub',
            }),
            url: fields.url({ label: 'Web address' }),
          }),
          {
            label: 'Links',
            description: 'Optional. Scholar profile, ORCID, personal site.',
            itemLabel: (props) => props.fields.label.value || 'Link',
          },
        ),
        joinedYear: fields.integer({
          label: 'Year joined the lab',
          description: 'Optional. For example: 2026',
        }),
        alumniNote: bilingualText({
          label: 'Where they are now',
          description:
            'Only used for alumni. For example: PhD student at ETH Zürich.',
        }),
        sortOrder: fields.integer({
          label: 'Ordering',
          description:
            'Optional. People are grouped by position; within a group, a smaller number appears first.',
          defaultValue: 100,
        }),
        bio: fields.markdoc({
          label: 'About you (English)',
          description:
            'Optional. A short paragraph or two. You can use bold, links and lists.',
        }),
        bioZhHant: fields.markdoc({
          label: 'About you (中文)',
          description: 'Optional. Falls back to the English text if left empty.',
        }),
      },
    }),

    publications: collection({
      label: 'Publications',
      slugField: 'title',
      path: 'content/publications/*',
      format: { data: 'yaml' },
      columns: ['title', 'year'],
      schema: {
        title: fields.slug({
          name: {
            label: 'Paper title',
            validation: { length: { min: 1 } },
          },
        }),
        authors: fields.text({
          label: 'Authors',
          description:
            'Exactly as they appear on the paper, separated by commas. Put **bold** around lab members to highlight them.',
          multiline: true,
        }),
        venue: fields.text({
          label: 'Journal or conference',
          description: 'For example: Nature Communications',
        }),
        year: fields.integer({
          label: 'Year',
          validation: { min: 1990, max: 2100 },
        }),
        month: fields.text({
          label: 'Month',
          description: 'Optional. For example: Jan.',
        }),
        volume: fields.text({ label: 'Volume', description: 'Optional.' }),
        pages: fields.text({
          label: 'Pages or article number',
          description: 'Optional. For example: 4960 or 287-304',
        }),
        doi: fields.text({
          label: 'DOI',
          description: 'Optional. For example: 10.1038/s41467-022-32669-3',
        }),
        url: fields.url({
          label: 'Link to the paper',
          description: 'Optional.',
        }),
        type: fields.select({
          label: 'Type',
          options: [
            { label: 'Journal article', value: 'journal' },
            { label: 'Conference paper', value: 'conference' },
            { label: 'Book chapter', value: 'bookChapter' },
            { label: 'Preprint', value: 'preprint' },
          ],
          defaultValue: 'journal',
        }),
        featured: fields.checkbox({
          label: 'Highlight this paper',
          description:
            'Highlighted papers appear on the home page. Three or four is a good number.',
          defaultValue: false,
        }),
      },
    }),

    research: collection({
      label: 'Research areas',
      slugField: 'title',
      path: 'content/research/*/',
      format: { contentField: 'body' },
      columns: ['title'],
      schema: {
        title: fields.slug({
          name: {
            label: 'Title (English)',
            validation: { length: { min: 1 } },
          },
        }),
        titleZhHant: fields.text({
          label: 'Title (中文)',
          description: 'Optional.',
        }),
        summary: bilingualText({
          label: 'One-line summary',
          description: 'Shown on the research overview page.',
          multiline: true,
        }),
        figure: fields.image({
          label: 'Figure',
          description:
            'Optional. A representative image — a device diagram, a spectrum, a micrograph.',
          directory: 'public/images/research',
          publicPath: '/images/research/',
        }),
        figureCaption: bilingualText({
          label: 'Figure caption',
          description: 'Optional.',
        }),
        sortOrder: fields.integer({
          label: 'Ordering',
          description: 'A smaller number appears first.',
          defaultValue: 100,
        }),
        body: fields.markdoc({ label: 'Full description (English)' }),
        bodyZhHant: fields.markdoc({
          label: 'Full description (中文)',
          description: 'Optional. Falls back to the English text if left empty.',
        }),
      },
    }),

    news: collection({
      label: 'News',
      slugField: 'title',
      path: 'content/news/*/',
      format: { contentField: 'body' },
      columns: ['title', 'date'],
      schema: {
        title: fields.slug({
          name: {
            label: 'Headline (English)',
            validation: { length: { min: 1 } },
          },
        }),
        titleZhHant: fields.text({
          label: 'Headline (中文)',
          description: 'Optional.',
        }),
        date: fields.date({
          label: 'Date',
          description: 'Newest posts appear first.',
          defaultValue: { kind: 'today' },
        }),
        image: fields.image({
          label: 'Image',
          description: 'Optional.',
          directory: 'public/images/news',
          publicPath: '/images/news/',
        }),
        summary: bilingualText({
          label: 'Short summary',
          description:
            'One or two sentences, shown in the news list and on the home page.',
          multiline: true,
        }),
        body: fields.markdoc({
          label: 'Full post (English)',
          description: 'Optional — a summary alone is fine for short items.',
        }),
        bodyZhHant: fields.markdoc({
          label: 'Full post (中文)',
          description: 'Optional.',
        }),
      },
    }),

    gallery: collection({
      label: 'Gallery',
      slugField: 'caption',
      path: 'content/gallery/*',
      format: { data: 'yaml' },
      columns: ['caption'],
      schema: {
        caption: fields.slug({
          name: {
            label: 'Caption (English)',
            validation: { length: { min: 1 } },
          },
        }),
        captionZhHant: fields.text({
          label: 'Caption (中文)',
          description: 'Optional.',
        }),
        image: fields.image({
          label: 'Photo',
          directory: 'public/images/gallery',
          publicPath: '/images/gallery/',
          validation: { isRequired: true },
        }),
        date: fields.date({ label: 'Date', description: 'Optional.' }),
        sortOrder: fields.integer({
          label: 'Ordering',
          description: 'A smaller number appears first.',
          defaultValue: 100,
        }),
      },
    }),
  },

  singletons: {
    siteSettings: singleton({
      label: 'Site settings',
      path: 'content/settings/site',
      format: { data: 'yaml' },
      schema: {
        labName: bilingualText({ label: 'Lab name' }),
        tagline: bilingualText({
          label: 'Tagline',
          description: 'One short line under the lab name.',
          multiline: true,
        }),
        institution: bilingualText({
          label: 'Institute',
          description:
            'For example: Graduate Institute of Photonics and Optoelectronics, National Taiwan University',
          multiline: true,
        }),
        footerNote: bilingualText({
          label: 'Footer note',
          description: 'Optional. Appears at the bottom of every page.',
          multiline: true,
        }),
        links: fields.array(
          fields.object({
            label: fields.text({ label: 'Name of the link' }),
            url: fields.url({ label: 'Web address' }),
          }),
          {
            label: 'Lab links',
            description:
              'Shown in the footer. For example: the GIPO lab page, Google Scholar.',
            itemLabel: (props) => props.fields.label.value || 'Link',
          },
        ),
      },
    }),

    home: singleton({
      label: 'Home page',
      path: 'content/pages/home/',
      format: { contentField: 'intro' },
      schema: {
        heroHeading: bilingualText({
          label: 'Main heading',
          description: 'The large text at the top of the home page.',
          multiline: true,
        }),
        heroSubheading: bilingualText({
          label: 'Supporting line',
          description: 'One or two sentences under the main heading.',
          multiline: true,
        }),
        heroImage: fields.image({
          label: 'Background image',
          description:
            'Optional. If empty, the animated interference pattern is shown instead.',
          directory: 'public/images/home',
          publicPath: '/images/home/',
        }),
        highlights: fields.array(
          fields.object({
            value: bilingualText({
              label: 'Figure',
              description: 'For example: 24 or 2025',
            }),
            label: bilingualText({
              label: 'Caption',
              description: 'For example: Publications',
            }),
          }),
          {
            label: 'Key figures',
            description:
              'Optional. A short row of numbers near the top of the home page.',
            itemLabel: (props) => props.fields.label.fields.en.value || 'Figure',
          },
        ),
        introHeading: bilingualText({ label: 'Introduction heading' }),
        intro: fields.markdoc({
          label: 'Introduction (English)',
          description: 'A paragraph or two about what the lab does.',
        }),
        introZhHant: fields.markdoc({
          label: 'Introduction (中文)',
          description: 'Optional.',
        }),
      },
    }),

    about: singleton({
      label: 'About the lab',
      path: 'content/pages/about/',
      format: { contentField: 'body' },
      schema: {
        heading: bilingualText({ label: 'Page heading' }),
        body: fields.markdoc({ label: 'Text (English)' }),
        bodyZhHant: fields.markdoc({
          label: 'Text (中文)',
          description: 'Optional.',
        }),
      },
    }),

    join: singleton({
      label: 'Join us',
      path: 'content/pages/join/',
      format: { contentField: 'body' },
      schema: {
        heading: bilingualText({ label: 'Page heading' }),
        intro: bilingualText({
          label: 'Opening line',
          multiline: true,
        }),
        openings: fields.array(
          fields.object({
            title: bilingualText({
              label: 'Position',
              description:
                "For example: Master's students, PhD students, Postdoctoral researcher",
            }),
            detail: bilingualText({
              label: 'Details',
              description: 'What you are looking for, and how to apply.',
              multiline: true,
            }),
            open: fields.checkbox({
              label: 'Currently recruiting',
              defaultValue: true,
            }),
          }),
          {
            label: 'Positions',
            itemLabel: (props) =>
              props.fields.title.fields.en.value || 'Position',
          },
        ),
        body: fields.markdoc({
          label: 'Anything else (English)',
          description: 'Optional.',
        }),
        bodyZhHant: fields.markdoc({
          label: 'Anything else (中文)',
          description: 'Optional.',
        }),
      },
    }),

    contact: singleton({
      label: 'Contact',
      path: 'content/pages/contact',
      format: { data: 'yaml' },
      schema: {
        heading: bilingualText({ label: 'Page heading' }),
        labRoom: bilingualText({
          label: 'Lab location',
          description: 'For example: R404, EE Building II',
        }),
        officeRoom: bilingualText({
          label: "Professor's office",
          description: 'For example: R535, EE Building II',
        }),
        address: bilingualText({
          label: 'Postal address',
          multiline: true,
        }),
        email: fields.text({ label: 'Email', description: 'Optional.' }),
        phone: fields.text({ label: 'Phone', description: 'Optional.' }),
        mapUrl: fields.url({
          label: 'Map link',
          description: 'Optional. A Google Maps link to the building.',
        }),
        note: bilingualText({
          label: 'Extra note',
          description: 'Optional. For example: visitor instructions.',
          multiline: true,
        }),
      },
    }),
  },
});
