<script lang="ts">
  import type {
    LinkClickContext,
    LinkClickResult,
    MaybePromise,
  } from "./app-adapter";
  import { renderMarkdown, renderMarkdownSync } from "./markdown";

  interface Props {
    text: string;
    isStreaming?: boolean;
    onLinkClick?: (context: LinkClickContext) => MaybePromise<LinkClickResult>;
  }

  const STREAMING_RENDER_DELAY_MS = 48;
  const HIGHLIGHT_DELAY_MS = 160;
  const LARGE_STREAMING_TEXT_THRESHOLD = 4_000;

  let { text, isStreaming = false, onLinkClick }: Props = $props();

  let html = $state("");

  $effect(() => {
    const currentText = text;
    const currentStreaming = isStreaming;
    let cancelled = false;
    let plainRenderTimeout: number | undefined;
    let highlightTimeout: number | undefined;
    const renderOptions = {
      preferPlainCodeBlocks: currentStreaming,
    };

    const renderPlain = () => {
      if (
        !cancelled &&
        text === currentText &&
        isStreaming === currentStreaming
      ) {
        html = renderMarkdownSync(currentText, renderOptions);
      }
    };

    if (
      currentStreaming &&
      currentText.length > LARGE_STREAMING_TEXT_THRESHOLD
    ) {
      plainRenderTimeout = window.setTimeout(
        renderPlain,
        STREAMING_RENDER_DELAY_MS,
      );
    } else {
      renderPlain();
    }

    if (currentStreaming) {
      return () => {
        cancelled = true;
        if (plainRenderTimeout !== undefined) {
          clearTimeout(plainRenderTimeout);
        }
      };
    }

    highlightTimeout = window.setTimeout(() => {
      void renderMarkdown(currentText, renderOptions)
        .then((rendered) => {
          if (
            !cancelled &&
            text === currentText &&
            isStreaming === currentStreaming
          ) {
            html = rendered;
          }
        })
        .catch(() => {
          renderPlain();
        });
    }, HIGHLIGHT_DELAY_MS);

    return () => {
      cancelled = true;
      if (plainRenderTimeout !== undefined) {
        clearTimeout(plainRenderTimeout);
      }
      if (highlightTimeout !== undefined) {
        clearTimeout(highlightTimeout);
      }
    };
  });

  async function handleClick(event: MouseEvent) {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const link = target.closest("a[href]");
    if (!(link instanceof HTMLAnchorElement)) return;

    const href = link.getAttribute("href");
    if (!href) return;

    if (
      onLinkClick &&
      (await onLinkClick({ href, anchor: link, event })) === "handled"
    ) {
      event.preventDefault();
    }
  }

  function handleKeydown() {
    // The wrapper only delegates clicks to links rendered inside sanitized HTML.
  }
</script>

<div
  class="markdown-content"
  onclick={handleClick}
  onkeydown={handleKeydown}
  role="presentation"
>
  {@html html}
</div>
