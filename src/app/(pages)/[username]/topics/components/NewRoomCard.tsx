'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import AnimatedContainer, { useCardAnimation } from '@/app/components/AnimatedContainer';
import { useAccountBackground } from '@/app/hooks/useAccountBackground';
import { roomService } from '@/app/services/roomService';
import NewRoomModal from './NewRoomModal';
import { notifyApiError } from '../utils/apiError';

const NewRoomCard = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const cardAnimation = useCardAnimation();
  const { isPremium } = useAccountBackground();

  const handleCreateTopic = async (name: string) => {
    setCreating(true);
    try {
      const room = await roomService.createRoom(name);
      setOpen(false);
      router.push(`/room/${room.code}`);
    } catch (error) {
      notifyApiError(error, 'No se pudo crear la sala.');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateFromFile = async (name: string, file: File) => {
    if (!isPremium) {
      return;
    }
    setCreating(true);
    try {
      const room = await roomService.createRoomFromFile(name, file);
      setOpen(false);
      router.push(`/room/${room.code}`);
    } catch (error) {
      notifyApiError(error, 'No se pudo crear la sala desde el archivo.');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = (code: string) => {
    setOpen(false);
    router.push(`/room/${code}`);
  };

  return (
    <AnimatedContainer style={{ height: '100%' }} animation="fade" {...cardAnimation}>
      <Card
        hover={true}
        className="h-full cursor-pointer border-0 bg-gradient-to-br from-white/95 to-cyan-50/90 shadow-lg backdrop-blur-sm transition-shadow duration-200"
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
      >
        <CardContent className="flex h-full flex-col items-center justify-center p-6 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-md">
            <Users className="h-7 w-7 text-white" />
          </div>
          <h3 className="mb-1 text-xl font-bold text-cyan-700">Jugar en grupo</h3>
          <p className="text-sm text-muted-foreground">
            Creá una sala o unite con un código
          </p>
          <span className="mt-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
            En vivo
          </span>
        </CardContent>
      </Card>

      <NewRoomModal
        isOpen={open}
        isPremium={isPremium}
        creating={creating}
        onClose={() => setOpen(false)}
        onCreateTopic={handleCreateTopic}
        onCreateFromFile={handleCreateFromFile}
        onJoin={handleJoin}
      />
    </AnimatedContainer>
  );
};

export default NewRoomCard;
