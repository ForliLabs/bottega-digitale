import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    {
      type: 'category',
      label: 'Getting started',
      collapsed: false,
      items: [
        'getting-started/introduction',
        'getting-started/quickstart',
        'getting-started/first-booking',
        'getting-started/environment',
      ],
    },
    {
      type: 'category',
      label: 'Core concepts',
      collapsed: false,
      items: [
        'concepts/overview',
        'concepts/data-model',
        'concepts/event-bus',
        'concepts/multi-tenancy',
        'concepts/why',
        'concepts/comparison',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/online-booking',
        'guides/whatsapp-automation',
        'guides/payments-stripe',
        'guides/fattura-pa',
        'guides/loyalty',
        'guides/storefront',
        'guides/ai-content',
        'guides/gdpr',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/api',
        'reference/configuration',
        'reference/webhooks',
        'reference/cli-and-scripts',
      ],
    },
    {
      type: 'category',
      label: 'Operations',
      items: [
        'operations/deployment',
        'operations/testing',
        'operations/troubleshooting',
        'operations/faq',
        'operations/contributing',
        'operations/code-of-conduct',
        'operations/roadmap',
        'operations/changelog',
      ],
    },
  ],
};

export default sidebars;
