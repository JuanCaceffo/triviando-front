import { renderHook, waitFor } from '@testing-library/react';
import { useRoomEvents } from '@/app/(pages)/room/[code]/hooks/useRoomEvents';
import { makeRoom } from './fixtures';

jest.mock('@/app/services/baseService', () => ({
  getAuthToken: jest.fn(() => 'token'),
}));

jest.mock('@/app/services/roomService', () => ({
  roomService: {
    getEventsUrl: jest.fn(() => 'http://test/rooms/ABC123/events'),
  },
}));

const encoder = new TextEncoder();

const readerFor = (...chunks: string[]) => {
  let index = 0;
  return {
    read: jest.fn(async () => {
      if (index >= chunks.length) {
        return { done: true, value: undefined };
      }
      const value = encoder.encode(chunks[index]);
      index += 1;
      return { done: false, value };
    }),
    cancel: jest.fn(async () => undefined),
  };
};

const mockFetchWith = (...chunks: string[]) => {
  const reader = readerFor(...chunks);
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    body: { getReader: () => reader },
  });
  return reader;
};

describe('useRoomEvents', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('parsea un snapshot del stream', async () => {
    const room = makeRoom();
    mockFetchWith(`event: snapshot\ndata: ${JSON.stringify(room)}\n\n`);
    const onSnapshot = jest.fn();

    const { unmount, result } = renderHook(() =>
      useRoomEvents({
        code: 'ABC123',
        enabled: true,
        onSnapshot,
        onError: jest.fn(),
      }),
    );

    await waitFor(() => expect(onSnapshot).toHaveBeenCalledWith(room));
    expect(['open', 'reconnecting']).toContain(result.current.connectionState);
    unmount();
  });

  it('parsea reacciones y cierres', async () => {
    mockFetchWith(
      `event: reaction\ndata: {"userId":2,"username":"guest","emoji":"🔥","sentAtEpochMs":1}\n\n` +
        `event: closed\ndata: {"reason":"HOST_CLOSED"}\n\n`,
    );
    const onReaction = jest.fn();
    const onClosed = jest.fn();

    const { unmount, result } = renderHook(() =>
      useRoomEvents({
        code: 'ABC123',
        enabled: true,
        onSnapshot: jest.fn(),
        onReaction,
        onClosed,
        onError: jest.fn(),
      }),
    );

    await waitFor(() => expect(onReaction).toHaveBeenCalled());
    expect(onReaction.mock.calls[0][0]).toMatchObject({ emoji: '🔥' });
    await waitFor(() => expect(onClosed).toHaveBeenCalledWith('HOST_CLOSED'));
    expect(result.current.connectionState).toBe('closed');
    unmount();
  });

  it('no abre el stream si está deshabilitado', () => {
    global.fetch = jest.fn();
    renderHook(() =>
      useRoomEvents({
        code: 'ABC123',
        enabled: false,
        onSnapshot: jest.fn(),
      }),
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
