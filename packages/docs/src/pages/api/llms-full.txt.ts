import { source } from '@/lib/source';
import { getLLMText } from '@/lib/get-llm-text';

export async function GET() {
  const scan = source
    .getPages()
    .filter(
      (page) =>
        page.data.info.fullPath.includes('/docs/') &&
        !page.data.info.fullPath.includes('/docs/acknowledgements') &&
        !page.data.info.fullPath.includes('/docs/ecosystem'),
    )
    .map(getLLMText);
  const scanned = await Promise.all(scan);
  return new Response(scanned.join('\n\n'), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
