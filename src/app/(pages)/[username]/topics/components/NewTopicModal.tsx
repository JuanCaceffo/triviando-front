'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import FileUploadTab from './FileUploadTab';

interface CreateTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateTopic: (topic: { name: string }) => void;
  onGenerateFromFile: (name: string, file: File) => void;
}

export default function CreateTopicModal({
  isOpen,
  onClose,
  onGenerateTopic,
  onGenerateFromFile,
}: CreateTopicModalProps) {
  const [topicName, setTopicName] = useState('');
  const [errors, setErrors] = useState<{ name?: string; general?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación
    const newErrors: { name?: string } = {};
    if (!topicName.trim()) newErrors.name = 'El nombre del tema es obligatorio';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (onGenerateTopic) onGenerateTopic({ name: topicName });
    setTopicName('');
    onClose();
  };

  const handleGenerateFromFile = (name: string, file: File) => {
    onGenerateFromFile(name, file);
    handleClose();
  };

  const handleClose = () => {
    setTopicName('');
    setErrors({});
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-[500px] w-full max-w-[95vw] bg-white p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-cyan-700 text-xl">Crear Nuevo Tema</DialogTitle>
          <DialogDescription>
            Creá un nuevo tema para generar preguntas personalizadas con IA a partir de un nombre o
            de un archivo.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="topic" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="topic"
              className="data-[state=active]:border-cyan-500 data-[state=active]:text-cyan-700"
            >
              Por tema
            </TabsTrigger>
            <TabsTrigger
              value="file"
              className="data-[state=active]:border-cyan-500 data-[state=active]:text-cyan-700"
            >
              Desde archivo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="topic">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <Label htmlFor="topic-name" className="text-cyan-700">
                  Nombre del tema
                </Label>
                <Input
                  id="topic-name"
                  placeholder="Ej: Astronomía, Literatura, Programación..."
                  value={topicName}
                  onChange={(e) => {
                    setTopicName(e.target.value);
                    if (errors.name) {
                      setErrors({ ...errors, name: undefined });
                    }
                  }}
                  className={`border-cyan-200 focus:border-cyan-400 ${
                    errors.name ? 'border-red-500' : ''
                  }`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-cyan-200 hover:bg-cyan-50 text-cyan-700"
                  >
                    Cancelar
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Crear Tema
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="file">
            <FileUploadTab onSubmit={handleGenerateFromFile} onCancel={handleClose} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
