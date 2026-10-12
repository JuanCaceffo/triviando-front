'use client';

import { ClipboardEvent, KeyboardEvent, useRef } from 'react';
import { TYPOGRAPHY } from '@/utils/designSystem';

const LENGTH = 6;

interface CodeInputProps {
  /** Hasta 6 dígitos; puede tener huecos si el usuario salta casillas. */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  /** id del primer casillero, para vincularlo con su <Label>. */
  inputId?: string;
}

/**
 * Casillas para el código de 6 dígitos: auto-avance, retroceso, flechas y pegar.
 * El dígito se escribe en mono para que cada casilla se lea como un espacio fijo.
 */
export default function CodeInput({
  value,
  onChange,
  disabled = false,
  autoFocus = false,
  inputId,
}: CodeInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const putDigit = (index: number, digit: string) => {
    const slots = value.padEnd(LENGTH, ' ').slice(0, LENGTH).split('');
    slots[index] = digit;
    onChange(slots.join('').replace(/\s+$/, ''));
    if (index < LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    if (!digit) {
      return;
    }
    putDigit(index, digit);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      event.preventDefault();
      const slots = value.padEnd(LENGTH, ' ').slice(0, LENGTH).split('');
      if (slots[index] && slots[index] !== ' ') {
        slots[index] = ' ';
        onChange(slots.join('').replace(/\s+$/, ''));
      } else if (index > 0) {
        slots[index - 1] = ' ';
        onChange(slots.join('').replace(/\s+$/, ''));
        refs.current[index - 1]?.focus();
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (event.key === 'ArrowRight' && index < LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
    if (!pasted) {
      return;
    }
    onChange(pasted);
    refs.current[Math.min(pasted.length, LENGTH) - 1]?.focus();
  };

  return (
    <div
      className="flex gap-1.5 sm:gap-2"
      role="group"
      aria-label="Código de 6 dígitos"
      data-testid="code-input"
    >
      {Array.from({ length: LENGTH }, (_, index) => (
        <input
          key={index}
          ref={(element) => {
            refs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          id={index === 0 ? inputId : undefined}
          aria-label={`Dígito ${index + 1} de ${LENGTH}`}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          value={value[index] ?? ''}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          className="h-12 sm:h-14 min-w-0 flex-1 rounded-lg border-2 border-cyan-200 bg-white text-center
                     text-xl sm:text-2xl font-semibold text-cyan-900 outline-none transition-colors
                     focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200
                     disabled:bg-gray-50 disabled:text-gray-400 cursor-text"
          style={{ fontFamily: TYPOGRAPHY.fontFamily.mono, letterSpacing: '0.05em' }}
        />
      ))}
    </div>
  );
}
