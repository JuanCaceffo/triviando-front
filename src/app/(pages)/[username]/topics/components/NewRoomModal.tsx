'use client';

import { useState } from 'react';
import { Crown, LogIn, Play, Save, Users } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import FileUploadTab from './FileUploadTab';
import PremiumRoomUpsell from './PremiumRoomUpsell';

interface NewRoomModalProps {
  isOpen: boolean;
  isPremium: boolean;
  creating: boolean;
  onClose: () => void;
  onCreateTopic: (name: string) => void;
  onCreateFromFile: (name: string, file: File) => void;
  onJoin: (code: string) => void;
}

const tabListClass = 'grid w-full grid-cols-2 bg-cyan-50/80 p-1';

const tabTriggerClass =
  'text-cyan-700/80 hover:text-cyan-800 data-[state=active]:border-cyan-400 data-[state=active]:bg-cyan-100 data-[state=active]:text-cyan-800 data-[state=active]:shadow-sm';

export default function NewRoomModal({
  isOpen,
  isPremium,
  creating,
  onClose,
  onCreateTopic,
  onCreateFromFile,
  onJoin,
}: NewRoomModalProps) {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [createMode, setCreateMode] = useState<'topic' | 'file'>('topic');
  const [topicName, setTopicName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [errors, setErrors] = useState<{ topic?: string; code?: string }>({});

  const reset = () => {
    setMode('create');
    setCreateMode('topic');
    setTopicName('');
    setJoinCode('');
    setErrors({});
  };

  const close = () => {
    reset();
    onClose();
  };

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault();
    if (!topicName.trim()) {
      setErrors({ topic: 'El nombre del tema es obligatorio' });
      return;
    }
    onCreateTopic(topicName.trim());
  };

  const handleJoin = (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = joinCode.trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(normalized)) {
      setErrors({ code: 'Ingresá el código de 6 caracteres' });
      return;
    }
    onJoin(normalized);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent className="w-full max-w-[95vw] bg-white p-4 sm:max-w-[540px] sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-cyan-700">
            <Users className="h-5 w-5" />
            Jugar en grupo
          </DialogTitle>
          <DialogDescription>
            Creá una sala en vivo o unite con el código que te compartieron.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(value) => setMode(value as 'create' | 'join')}>
          <TabsList className={tabListClass}>
            <TabsTrigger value="create" className={tabTriggerClass}>
              {!isPremium && <Crown className="mr-1 h-4 w-4 text-amber-500" />}
              Crear sala
            </TabsTrigger>
            <TabsTrigger value="join" className={tabTriggerClass}>
              <LogIn className="mr-1 h-4 w-4" />
              Unirme
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-4">
            {!isPremium ? (
              <PremiumRoomUpsell onCancel={close} />
            ) : (
              <Tabs
                value={createMode}
                onValueChange={(value) => setCreateMode(value as 'topic' | 'file')}
              >
                <TabsList className={tabListClass}>
                  <TabsTrigger value="topic" className={tabTriggerClass}>
                    Por tema
                  </TabsTrigger>
                  <TabsTrigger value="file" className={tabTriggerClass}>
                    Desde archivo
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="topic">
                  <form onSubmit={handleCreate}>
                    <div className="grid gap-4 py-4">
                      <Label htmlFor="room-topic" className="text-cyan-700">
                        Nombre del tema
                      </Label>
                      <Input
                        id="room-topic"
                        placeholder="Ej: Historia argentina, Cine, Programación…"
                        value={topicName}
                        onChange={(event) => {
                          setTopicName(event.target.value);
                          if (errors.topic) setErrors({ ...errors, topic: undefined });
                        }}
                        className={errors.topic ? 'border-red-500' : 'border-cyan-200'}
                      />
                      {errors.topic && <p className="text-xs text-red-500">{errors.topic}</p>}
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline" onClick={close}>
                          Cancelar
                        </Button>
                      </DialogClose>
                      <Button type="submit" loading={creating}>
                        <Save className="mr-2 h-4 w-4" />
                        Crear sala
                      </Button>
                    </DialogFooter>
                  </form>
                </TabsContent>

                <TabsContent value="file">
                  <FileUploadTab
                    onSubmit={(name, file) => onCreateFromFile(name, file)}
                    onCancel={close}
                  />
                </TabsContent>
              </Tabs>
            )}
          </TabsContent>

          <TabsContent value="join" className="mt-4">
            <form onSubmit={handleJoin}>
              <div className="grid gap-4 py-4">
                <Label htmlFor="room-code" className="text-cyan-700">
                  Código de la sala
                </Label>
                <Input
                  id="room-code"
                  placeholder="ABC123"
                  value={joinCode}
                  onChange={(event) => {
                    setJoinCode(event.target.value.toUpperCase().slice(0, 6));
                    if (errors.code) setErrors({ ...errors, code: undefined });
                  }}
                  className={`font-mono tracking-widest ${
                    errors.code ? 'border-red-500' : 'border-cyan-200'
                  }`}
                  autoComplete="off"
                />
                {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
                <p className="text-xs text-muted-foreground">
                  Te lo puede pasar el anfitrión o abrir directamente el link de invitación.
                </p>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" onClick={close}>
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit">
                  <Play className="mr-2 h-4 w-4" />
                  Entrar a la sala
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
