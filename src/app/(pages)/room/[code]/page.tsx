'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Card, CardContent } from '@/app/components/ui/card';
import { useCurrentUser } from '@/app/utils/auth';
import { useInitializeUser } from '@/app/hooks/useInitializeUser';
import { roomService } from '@/app/services/roomService';
import {
  RoomLetter,
  RoomReactionEvent,
  RoomSnapshot,
} from './types';
import { useRoomEvents } from './hooks/useRoomEvents';
import { useServerCountdown } from './hooks/useServerCountdown';
import RoomHeader from './components/RoomHeader';
import RoomPreparing from './components/RoomPreparing';
import RoomLobby from './components/RoomLobby';
import RoomQuestion from './components/RoomQuestion';
import RoomResults from './components/RoomResults';
import RoomStatusCard from './components/RoomStatusCard';
import RoomReactions, { RoomReactionItem } from './components/RoomReactions';

const closeMessage = (reason: string | null | undefined): string => {
  switch (reason) {
    case 'HOST_LEFT':
      return 'El anfitrión salió de la sala.';
    case 'HOST_CLOSED':
      return 'El anfitrión cerró la sala.';
    case 'EXPIRED':
      return 'La sala expiró por inactividad.';
    case 'GENERATION_FAILED':
      return 'No se pudieron generar las preguntas de la sala.';
    case 'EMPTY':
      return 'La sala ya no existe.';
    case 'LEFT':
      return 'Saliste de la sala.';
    default:
      return 'La sala se cerró.';
  }
};

export default function RoomPage() {
  const { code: rawCode } = useParams<{ code: string }>();
  const code = (rawCode ?? '').toUpperCase();
  const router = useRouter();
  useInitializeUser();
  const user = useCurrentUser();

  const [snapshot, setSnapshot] = useState<RoomSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const [closedReason, setClosedReason] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<RoomLetter | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [starting, setStarting] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [reactions, setReactions] = useState<RoomReactionItem[]>([]);
  const lastQuestionId = useRef<number | undefined>(undefined);

  const goHome = useCallback(() => {
    router.push(user?.username ? `/${user.username}/topics` : '/');
  }, [router, user?.username]);

  const errorMessage = useCallback((cause: unknown, fallback: string): string => {
    if (axios.isAxiosError(cause)) {
      if (cause.response?.status === 401 && typeof window !== 'undefined') {
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
        return 'Iniciá sesión para continuar.';
      }
      const apiMessage = (cause.response?.data as { error?: string } | undefined)?.error;
      if (apiMessage) {
        return apiMessage;
      }
    }
    return cause instanceof Error ? cause.message : fallback;
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!code) {
      setError('Código de sala inválido.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    roomService
      .joinRoom(code)
      .then((room) => {
        if (cancelled) return;
        setSnapshot(room);
        setJoined(true);
        setSelectedOption(room.me?.selectedOption);
        lastQuestionId.current = room.currentQuestion?.id;
      })
      .catch((cause) => {
        if (!cancelled) {
          setError(errorMessage(cause, 'No pudimos entrar a la sala.'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [code, errorMessage]);

  const onSnapshot = useCallback((room: RoomSnapshot) => {
    setSnapshot(room);
    setClosedReason(null);
    if (room.revealUntilEpochMs) {
      setSelectedOption(room.me?.selectedOption);
    }
  }, []);

  const onReaction = useCallback((reaction: RoomReactionEvent) => {
    setReactions((previous) =>
      [
        ...previous,
        {
          ...reaction,
          id: `${reaction.userId}-${reaction.sentAtEpochMs}-${Math.random()}`,
        },
      ].slice(-20),
    );
  }, []);

  const onClosed = useCallback((reason: string) => {
    setClosedReason(reason);
    setJoined(false);
  }, []);

  const onSseError = useCallback((message: string) => {
    if (message) {
      toast.error(message);
    }
  }, []);

  const { connectionState, stop } = useRoomEvents({
    code,
    enabled: joined && !closedReason && !leaving,
    onSnapshot,
    onReaction,
    onClosed,
    onError: onSseError,
  });

  useEffect(() => {
    const currentId = snapshot?.currentQuestion?.id;
    if (currentId !== lastQuestionId.current) {
      lastQuestionId.current = currentId;
      setSelectedOption(snapshot?.me?.selectedOption);
    } else if (snapshot?.me?.selectedOption) {
      setSelectedOption(snapshot.me.selectedOption);
    }
  }, [snapshot?.currentQuestion?.id, snapshot?.me?.selectedOption]);

  const reveal = Boolean(snapshot?.revealUntilEpochMs);
  const countdown = useServerCountdown(
    snapshot?.status === 'IN_PROGRESS' && !reveal
      ? snapshot.questionDeadlineEpochMs
      : undefined,
    snapshot?.serverTimeEpochMs,
    snapshot?.roundSeconds ?? 30,
  );

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copiado`);
    } catch {
      toast.error('No se pudo copiar. Copialo manualmente.');
    }
  };

  const handleCopyCode = () => copy(code, 'Código');
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      copy(`${window.location.origin}/room/${code}`, 'Link');
    }
  };

  const handleAnswer = async (option: RoomLetter) => {
    if (!snapshot?.currentQuestion || submitting) return;
    if (snapshot.me?.answeredCurrent || snapshot.revealUntilEpochMs) return;

    setSubmitting(true);
    setSelectedOption(option);
    try {
      await roomService.answer(code, snapshot.currentQuestion.id, option);
    } catch (cause) {
      setSelectedOption(snapshot.me?.selectedOption);
      toast.error(errorMessage(cause, 'No se pudo enviar la respuesta.'));
      try {
        setSnapshot(await roomService.getRoom(code));
      } catch {
        // El SSE o el próximo intento sincronizan el estado.
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleStart = async () => {
    if (starting) return;
    setStarting(true);
    try {
      setSnapshot(await roomService.startRoom(code));
    } catch (cause) {
      toast.error(errorMessage(cause, 'No se pudo iniciar la partida.'));
    } finally {
      setStarting(false);
    }
  };

  const handleLeave = async () => {
    if (leaving) return;
    const message = snapshot?.me?.host
      ? 'Si salís, la sala se cierra para todos. ¿Continuar?'
      : '¿Querés salir de la sala?';
    if (typeof window !== 'undefined' && !window.confirm(message)) {
      return;
    }

    setLeaving(true);
    stop();
    try {
      await roomService.leaveRoom(code);
      goHome();
    } catch (cause) {
      setLeaving(false);
      toast.error(errorMessage(cause, 'No se pudo salir de la sala.'));
    }
  };

  const handleClose = async () => {
    if (leaving) return;
    if (typeof window === 'undefined' || !window.confirm('¿Cerrar la sala para todos?')) {
      return;
    }

    setLeaving(true);
    stop();
    try {
      await roomService.closeRoom(code);
      goHome();
    } catch (cause) {
      setLeaving(false);
      toast.error(errorMessage(cause, 'No se pudo cerrar la sala.'));
    }
  };

  const handleReact = async (emoji: string) => {
    try {
      await roomService.react(code, emoji);
    } catch (cause) {
      toast.error(errorMessage(cause, 'No se pudo enviar la reacción.'));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="border-0 bg-white/90 shadow-xl">
          <CardContent className="flex items-center gap-3 px-8 py-10 text-cyan-700">
            <Loader2 className="h-5 w-5 animate-spin" />
            Entrando a la sala…
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !snapshot) {
    return (
      <div className="mx-auto min-h-screen max-w-3xl p-4">
        <RoomStatusCard
          title="No pudimos entrar a la sala"
          description={error ?? 'La sala no está disponible.'}
          actionLabel="Volver a mis temas"
          onAction={goHome}
          tone="error"
        />
      </div>
    );
  }

  if (closedReason) {
    return (
      <div className="mx-auto min-h-screen max-w-3xl p-4">
        <RoomStatusCard
          title="La sala se cerró"
          description={closeMessage(closedReason)}
          actionLabel="Volver a mis temas"
          onAction={goHome}
          tone="error"
        />
      </div>
    );
  }

  const isHost = Boolean(snapshot.me?.host);
  const showLobbyReactions =
    snapshot.status === 'PREPARING' || snapshot.status === 'LOBBY';

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-3xl">
        <RoomHeader
          room={snapshot}
          connectionState={connectionState}
          onCopyCode={handleCopyCode}
          onCopyLink={handleCopyLink}
          onLeave={handleLeave}
          onClose={handleClose}
        />

        {snapshot.status === 'PREPARING' && (
          <RoomPreparing room={snapshot} isHost={isHost} onCancel={handleClose} />
        )}

        {snapshot.status === 'LOBBY' && (
          <RoomLobby
            room={snapshot}
            isHost={isHost}
            starting={starting}
            onStart={handleStart}
          />
        )}

        {snapshot.status === 'IN_PROGRESS' && (
          <RoomQuestion
            room={snapshot}
            remainingSeconds={countdown.remainingSeconds}
            timerProgress={countdown.progress}
            isExpired={countdown.isExpired}
            selectedOption={selectedOption}
            submitting={submitting}
            onAnswer={handleAnswer}
            onReact={handleReact}
            reactions={reactions}
          />
        )}

        {snapshot.status === 'FINISHED' && (
          <RoomResults room={snapshot} onBack={goHome} onLeave={handleLeave} />
        )}

        {(snapshot.status === 'CLOSED' || snapshot.status === 'FAILED') && (
          <RoomStatusCard
            title={
              snapshot.status === 'FAILED'
                ? 'No se pudo preparar la sala'
                : 'La sala se cerró'
            }
            description={
              snapshot.generation?.error ??
              closeMessage(snapshot.closeReason) ??
              'La sala no está disponible.'
            }
            actionLabel="Volver a mis temas"
            onAction={goHome}
            tone="error"
          />
        )}

        {showLobbyReactions && (
          <div className="mt-4">
            <RoomReactions reactions={reactions} onReact={handleReact} />
          </div>
        )}
      </div>
    </div>
  );
}
