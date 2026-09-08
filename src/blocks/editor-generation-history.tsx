import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Download, Loader2, Plus } from 'lucide-react';

import { apiGet } from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';
import { Button } from '@/components/ui/button';

type HistoryItem = { id: string; prompt: string; status: string };
type HistoryPage = { items: HistoryItem[]; hasMore: boolean };
type Props = {
  userId: string;
  prepareImage: (dataUrl: string) => Promise<string>;
  onAdd: (dataUrl: string) => void;
  onDownload: (dataUrl: string, filename: string) => void;
};

export function EditorGenerationHistory(props: Props) {
  const history = useInfiniteQuery({
    queryKey: ['editor-history', props.userId],
    enabled: !!props.userId,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      apiGet<HistoryPage>(`/api/editor/generate?page=${pageParam}`),
    getNextPageParam: (last, pages) =>
      last.hasMore ? pages.length + 1 : undefined,
  });
  const items = [
    ...new Map(
      history.data?.pages
        .flatMap((page) => page.items)
        .map((item) => [item.id, item])
    ).values(),
  ];
  return (
    <section className="space-y-3" aria-label={m['editor.history.title']()}>
      <h3 className="text-sm font-medium">{m['editor.history.title']()}</h3>
      <p className="text-muted-foreground text-xs">
        {m['editor.history.description']()}
      </p>
      {!props.userId ? (
        <p className="text-muted-foreground py-5 text-center text-sm">
          {m['editor.history.login']()}
        </p>
      ) : history.isPending ? (
        <Loader2
          className="text-muted-foreground mx-auto my-5 size-5 animate-spin"
          aria-label={m['editor.history.loading']()}
        />
      ) : history.isError ? (
        <div className="space-y-2 text-sm">
          <p>{m['editor.history.error']()}</p>
          <Button variant="outline" size="sm" onClick={() => history.refetch()}>
            {m['editor.history.retry']()}
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="text-muted-foreground space-y-2 py-5 text-center text-sm">
          <Plus className="mx-auto size-6" />
          <p>{m['editor.history.empty']()}</p>
        </div>
      ) : (
        <div className="grid max-h-96 grid-cols-2 gap-2 overflow-y-auto pr-1">
          {items.map((item) => (
            <HistoryCard key={item.id} {...props} item={item} />
          ))}
        </div>
      )}
      {history.hasNextPage && (
        <Button
          className="w-full"
          variant="outline"
          size="sm"
          disabled={history.isFetchingNextPage}
          onClick={() => history.fetchNextPage()}
        >
          {m['editor.history.more']()}
        </Button>
      )}
    </section>
  );
}

function HistoryCard({
  item,
  userId,
  prepareImage,
  onAdd,
  onDownload,
}: Props & { item: HistoryItem }) {
  const image = useQuery({
    queryKey: ['editor-saved-image', userId, item.id],
    queryFn: async () => {
      const result = await apiGet<{ status: string; imageDataUrl?: string }>(
        `/api/editor/generate?taskId=${encodeURIComponent(item.id)}`
      );
      return {
        status: result.status,
        dataUrl: result.imageDataUrl
          ? await prepareImage(result.imageDataUrl)
          : undefined,
      };
    },
    staleTime: Infinity,
    refetchInterval: (query) =>
      query.state.data?.status === 'success' ||
      query.state.data?.status === 'failed'
        ? false
        : 5000,
  });
  const dataUrl = image.data?.dataUrl;
  return (
    <div className="bg-background overflow-hidden rounded-lg border">
      <button
        type="button"
        className="focus-visible:ring-primary flex aspect-square w-full items-center justify-center p-2 focus-visible:ring-2"
        disabled={!dataUrl}
        title={item.prompt}
        aria-label={m['editor.history.add']()}
        onClick={() => dataUrl && onAdd(dataUrl)}
      >
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={item.prompt}
            className="h-full w-full object-contain"
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData('application/x-ai-image', dataUrl);
              event.dataTransfer.effectAllowed = 'copy';
            }}
          />
        ) : image.isError || image.data?.status === 'failed' ? (
          <span className="text-muted-foreground text-xs">
            {m['editor.history.error']()}
          </span>
        ) : (
          <Loader2
            className="text-muted-foreground size-5 animate-spin"
            aria-label={m['editor.history.loading']()}
          />
        )}
      </button>
      <div className="flex items-center gap-1 border-t px-2 py-1">
        <p className="min-w-0 flex-1 truncate text-xs" title={item.prompt}>
          {item.prompt}
        </p>
        {dataUrl ? (
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground p-1"
            aria-label={m['editor.bubble_panel.download']()}
            onClick={() => onDownload(dataUrl, `ai-${item.id}.png`)}
          >
            <Download className="size-3.5" />
          </button>
        ) : image.isError ? (
          <button
            type="button"
            className="text-xs underline"
            onClick={() => image.refetch()}
          >
            {m['editor.history.retry']()}
          </button>
        ) : null}
      </div>
    </div>
  );
}
