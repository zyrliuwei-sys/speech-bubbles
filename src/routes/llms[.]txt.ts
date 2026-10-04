import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';

const STATIC_PAGES: { path: string; title: string; description: string }[] = [
  {
    path: '',
    title: 'Home',
    description: 'Game answers and game site directory',
  },
  {
    path: '/blog',
    title: 'Blog',
    description: 'Guides and explainers about games and game tools',
  },
  {
    path: '/submit',
    title: 'Submit a game',
    description: 'How to list a game site',
  },
];

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      GET: () => {
        const { app_url, app_name, app_description } = envConfigs;

        const lines: string[] = [
          `# ${app_name}`,
          '',
          `> ${app_description}`,
          '',
          '## Pages',
          '',
          ...STATIC_PAGES.map(
            (p) => `- [${p.title}](${app_url}${p.path}): ${p.description}`
          ),
          '',
        ];

        return new Response(lines.join('\n'), {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      },
    },
  },
});
