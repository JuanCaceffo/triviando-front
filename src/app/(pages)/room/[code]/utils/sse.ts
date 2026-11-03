export interface ParsedSseEvent {
  event: string;
  data: string;
  id?: string;
  retry?: number;
}

/**
 * Parsea un buffer SSE. Devuelve los eventos completos y el resto que todavía
 * no terminó de llegar.
 */
export function parseSseBuffer(buffer: string): {
  events: ParsedSseEvent[];
  remainder: string;
} {
  const normalized = buffer.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.split('\n\n');
  const remainder = blocks.pop() ?? '';

  const events: ParsedSseEvent[] = [];
  for (const block of blocks) {
    const parsed = parseBlock(block);
    if (parsed) {
      events.push(parsed);
    }
  }
  return { events, remainder };
}

function parseBlock(block: string): ParsedSseEvent | null {
  let event = 'message';
  let id: string | undefined;
  let retry: number | undefined;
  const data: string[] = [];

  for (const line of block.split('\n')) {
    if (!line || line.startsWith(':')) {
      continue;
    }
    const separator = line.indexOf(':');
    const field = separator === -1 ? line : line.slice(0, separator);
    const value =
      separator === -1 ? '' : line.slice(separator + 1).replace(/^ /, '');

    if (field === 'event') {
      event = value;
    } else if (field === 'data') {
      data.push(value);
    } else if (field === 'id') {
      id = value;
    } else if (field === 'retry') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        retry = parsed;
      }
    }
  }

  if (data.length === 0) {
    return null;
  }
  return { event, data: data.join('\n'), id, retry };
}
