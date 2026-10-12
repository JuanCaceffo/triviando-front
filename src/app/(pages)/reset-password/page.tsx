import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import Logo from '@/app/components/logo';
import ResetPasswordForm from './components/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md z-10">
        <Link
          href="/login"
          className="inline-flex items-center text-white mb-6 hover:text-cyan-100 font-bold"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio de sesión
        </Link>

        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <div className="mx-auto pt-6">
            <Logo size="lg" animated={true} showTagline={false} />
          </div>
          {/* useSearchParams (dentro del form) necesita un Suspense en la página */}
          <Suspense fallback={<div className="p-6" aria-hidden="true" />}>
            <ResetPasswordForm />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}
