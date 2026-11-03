'use client';

import { AlertTriangle, Home, XCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

interface RoomStatusCardProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  tone?: 'error' | 'info';
}

export default function RoomStatusCard({
  title,
  description,
  actionLabel,
  onAction,
  tone = 'info',
}: RoomStatusCardProps) {
  const Icon = tone === 'error' ? XCircle : AlertTriangle;
  return (
    <Card className="border-0 bg-white/95 shadow-xl backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyan-800">
          <Icon className={`h-5 w-5 ${tone === 'error' ? 'text-red-500' : 'text-amber-500'}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-gray-600">{description}</p>
        <Button type="button" onClick={onAction}>
          <Home className="mr-2 h-4 w-4" />
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
