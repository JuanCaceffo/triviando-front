import { parseSseBuffer } from '@/app/(pages)/room/[code]/utils/sse';

describe('parseSseBuffer', () => {
  it('parsea un evento completo con JSON', () => {
    const { events, remainder } = parseSseBuffer(
      'event: snapshot\ndata: {"code":"ABC123"}\n\n',
    );
    expect(remainder).toBe('');
    expect(events).toHaveLength(1);
    expect(events[0].event).toBe('snapshot');
    expect(events[0].data).toBe('{"code":"ABC123"}');
  });

  it('soporta data multilínea, comentarios, id y retry', () => {
    const { events } = parseSseBuffer(
      ': keepalive\nid: 7\nretry: 1500\nevent: reaction\ndata: primera\ndata: segunda\n\n',
    );
    expect(events[0]).toMatchObject({
      event: 'reaction',
      data: 'primera\nsegunda',
      id: '7',
      retry: 1500,
    });
  });

  it('usa message como evento por defecto', () => {
    const { events } = parseSseBuffer('data: hola\n\n');
    expect(events[0].event).toBe('message');
  });

  it('conserva el bloque incompleto en remainder', () => {
    const first = parseSseBuffer('event: snapshot\ndata: {"code":"AB');
    expect(first.events).toHaveLength(0);
    expect(first.remainder).toContain('snapshot');

    const second = parseSseBuffer(`${first.remainder}C123"}\n\n`);
    expect(second.events).toHaveLength(1);
    expect(second.events[0].data).toBe('{"code":"ABC123"}');
  });

  it('normaliza CRLF y descarta bloques sin data', () => {
    const { events } = parseSseBuffer('event: ping\r\n\r\nevent: snapshot\r\ndata: ok\r\n\r\n');
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ event: 'snapshot', data: 'ok' });
  });
});
