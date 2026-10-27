'use client';

import Link from 'next/link';
import { Check, Crown, FileText } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface PremiumFileUpsellProps {
  onCancel: () => void;
}

export default function PremiumFileUpsell({ onCancel }: PremiumFileUpsellProps) {
  const benefits = [
    'PDF, DOCX, TXT o MD · hasta 10 MB',
    'La IA arma el tema y las preguntas a partir de tu material',
  ];

  return (
    <div className="py-4">
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 shadow-md">
          <Crown className="h-7 w-7 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-cyan-800">Generar desde archivos es Premium</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          La creación de temas desde archivos es exclusiva del plan Premium. Subí tus apuntes y
          convertilos en un quiz.
        </p>
      </div>

      <ul className="mx-auto mt-5 max-w-sm space-y-2">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2 text-sm text-gray-700">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="border-cyan-200 text-cyan-700 hover:bg-cyan-50"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          asChild
          className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600"
        >
          <Link href="/payment">
            <Crown className="h-4 w-4" />
            Actualizar a Premium
          </Link>
        </Button>
      </div>

      <p className="mt-4 flex items-center justify-center gap-1 text-xs text-muted-foreground">
        <FileText className="h-3.5 w-3.5" />
        Los temas y preguntas ilimitados ya están incluidos en el plan Gratis
      </p>
    </div>
  );
}
