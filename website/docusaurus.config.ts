import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const GITHUB_URL = 'https://github.com/ForliLabs/bottega-digitale';

const config: Config = {
  title: 'Bottega Digitale',
  tagline: 'Il bancone digitale per ogni bottega italiana — sito, prenotazioni e clienti in un unico posto.',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://bottegadigitale.it',
  baseUrl: '/',

  organizationName: 'ForliLabs',
  projectName: 'bottega-digitale',

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: `${GITHUB_URL}/edit/main/website/`,
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        indexBlog: false,
        docsRouteBasePath: '/docs',
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
  ],

  themeConfig: {
    image: 'img/social-card.svg',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    metadata: [
      {name: 'keywords', content: 'italian SME, artigiani, prenotazioni online, fattura elettronica, WhatsApp business, CRM, e-commerce, FatturaPA, Forlì, Romagna'},
      {name: 'og:type', content: 'website'},
    ],
    navbar: {
      title: 'Bottega Digitale',
      logo: {
        alt: 'Bottega Digitale logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo-dark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/docs/getting-started/quickstart',
          label: 'Quickstart',
          position: 'left',
        },
        {
          to: '/docs/reference/api',
          label: 'API',
          position: 'left',
        },
        {
          to: '/docs/operations/changelog',
          label: 'Changelog',
          position: 'right',
        },
        {
          href: GITHUB_URL,
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Quickstart', to: '/docs/getting-started/quickstart'},
            {label: 'Core concepts', to: '/docs/concepts/overview'},
            {label: 'Guides', to: '/docs/guides/online-booking'},
            {label: 'API reference', to: '/docs/reference/api'},
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'GitHub', href: GITHUB_URL},
            {label: 'Discussions', href: `${GITHUB_URL}/discussions`},
            {label: 'Issues', href: `${GITHUB_URL}/issues`},
            {label: 'Contributing', to: '/docs/operations/contributing'},
          ],
        },
        {
          title: 'Project',
          items: [
            {label: 'Why Bottega Digitale', to: '/docs/concepts/why'},
            {label: 'Compared to alternatives', to: '/docs/concepts/comparison'},
            {label: 'Roadmap', to: '/docs/operations/roadmap'},
            {label: 'Changelog', to: '/docs/operations/changelog'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} ForliLabs — Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript', 'tsx', 'sql'],
    },
    mermaid: {
      theme: {light: 'neutral', dark: 'dark'},
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
