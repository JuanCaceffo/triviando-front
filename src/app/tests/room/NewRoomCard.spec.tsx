import { fireEvent, render, screen } from '@testing-library/react';
import NewRoomCard from '@/app/(pages)/[username]/topics/components/NewRoomCard';

describe('NewRoomCard', () => {
  it('abre el modal y muestra el upsell a FREE', async () => {
    render(<NewRoomCard />);

    fireEvent.click(screen.getByText('Jugar en grupo'));

    expect(await screen.findByText(/crear salas en vivo es premium/i)).toBeInTheDocument();
  });
});
