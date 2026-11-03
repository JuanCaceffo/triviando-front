import { render, screen } from '@testing-library/react';
import RoomActiveBanner from '@/app/(pages)/[username]/topics/components/RoomActiveBanner';
import { roomService } from '@/app/services/roomService';
import { makeRoom } from './fixtures';

jest.mock('@/app/services/roomService', () => ({
  roomService: {
    getActiveRoom: jest.fn(),
  },
}));

const mockedGetActiveRoom = roomService.getActiveRoom as jest.Mock;

describe('RoomActiveBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra la sala en curso con link para volver', async () => {
    mockedGetActiveRoom.mockResolvedValue(makeRoom({ status: 'IN_PROGRESS' }));

    render(<RoomActiveBanner />);

    const link = await screen.findByRole('link', { name: /volver/i });
    expect(link).toHaveAttribute('href', '/room/ABC123');
    expect(screen.getByText(/tenés una sala en curso/i)).toBeInTheDocument();
  });

  it('muestra resultados si la última sala terminó', async () => {
    mockedGetActiveRoom.mockResolvedValue(makeRoom({ status: 'FINISHED' }));

    render(<RoomActiveBanner />);

    expect(await screen.findByText(/ver resultados/i)).toBeInTheDocument();
  });

  it('no renderiza nada sin sala activa', async () => {
    mockedGetActiveRoom.mockResolvedValue(null);
    const { container } = render(<RoomActiveBanner />);

    await Promise.resolve();
    expect(container.firstChild).toBeNull();
  });
});
