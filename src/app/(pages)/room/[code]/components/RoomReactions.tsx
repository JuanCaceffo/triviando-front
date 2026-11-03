'use client';

import { motion } from 'framer-motion';
import { ROOM_REACTION_EMOJIS, RoomReactionEvent } from '../types';

export type RoomReactionItem = RoomReactionEvent & { id: string };

interface RoomReactionsProps {
  reactions: RoomReactionItem[];
  onReact: (emoji: string) => void;
  disabled?: boolean;
}

export default function RoomReactions({ reactions, onReact, disabled = false }: RoomReactionsProps) {
  const visible = reactions.slice(-8);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 bottom-12 flex h-32 items-end justify-center gap-2 overflow-hidden">
        {visible.map((reaction, index) => (
          <motion.span
            key={reaction.id}
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: [0, 1, 1, 0], y: -90, scale: 1.1 }}
            transition={{ duration: 2.4, delay: index * 0.03 }}
            className="text-2xl drop-shadow"
            title={`@${reaction.username}`}
          >
            {reaction.emoji}
          </motion.span>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-full bg-white/90 px-3 py-2 shadow-md">
        <span className="text-xs font-medium text-gray-500">Reaccionar:</span>
        {ROOM_REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            disabled={disabled}
            onClick={() => onReact(emoji)}
            className="rounded-full px-2 py-1 text-xl transition-transform hover:scale-125 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Reaccionar con ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
