'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { PasswordInput } from '@/app/components/ui/password-input';
import { Label } from '@/app/components/ui/label';
import { Button } from '@/app/components/ui/button';
import { passwordService } from '@/app/services/passwordService';
import { handleError } from '@/app/utils/errorHandler';
import { formResetPasswordSchema } from '@/app/schemas/formResetPasswordSchema';
import { APP_TEXTS } from '@/utils/constants';

const texts = APP_TEXTS.auth.resetPassword;

type FormData = z.infer<typeof formResetPasswordSchema>;

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetToken = searchParams.get('token');
  const [isFetching, setIsFetching] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formResetPasswordSchema),
  });

  const onSubmit = async (data: FormData) => {
    if (!resetToken) {
      return;
    }
    setIsFetching(true);
    try {
      await passwordService.resetPassword(resetToken, data.password);
      toast.success(APP_TEXTS.success.passwordReset);
      router.push('/login');
    } catch (error) {
      handleError(error);
    } finally {
      setIsFetching(false);
    }
  };

  if (!resetToken) {
    return (
      <>
        <CardHeader className="space-y-1 cursor-default">
          <CardTitle className="text-xl font-bold text-center">
            {texts.invalidTokenTitle}
          </CardTitle>
          <CardDescription className="text-center">{texts.invalidTokenBody}</CardDescription>
        </CardHeader>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="button"
            className="w-full bg-gradient-to-r from-teal-400 to-cyan-600 hover:from-teal-500 hover:to-cyan-700 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
            onClick={() => router.push('/forgot-password')}
          >
            {texts.requestNewCode}
          </Button>

          <div className="text-center text-sm cursor-default text-gray-700">
            <Link
              href="/login"
              className="text-cyan-600 hover:text-cyan-800 font-medium transition-colors"
            >
              {texts.backToLogin}
            </Link>
          </div>
        </CardFooter>
      </>
    );
  }

  return (
    <>
      <CardHeader className="space-y-1 cursor-default">
        <CardTitle className="text-2xl font-bold text-center">{texts.title}</CardTitle>
        <CardDescription className="text-center">{texts.subtitle}</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">{texts.newPasswordLabel}</Label>
            <PasswordInput
              id="new-password"
              autoComplete="new-password"
              autoFocus
              {...register('password')}
              className="border-cyan-200 focus:border-cyan-400"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">{texts.confirmPasswordLabel}</Label>
            <PasswordInput
              id="confirm-password"
              autoComplete="new-password"
              {...register('confirmPassword')}
              className="border-cyan-200 focus:border-cyan-400"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-400 to-cyan-600 hover:from-teal-500 hover:to-cyan-700 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
            disabled={isFetching}
            loading={isFetching}
          >
            {texts.submitButton}
          </Button>

          <div className="text-center text-sm cursor-default text-gray-700">
            <Link
              href="/login"
              className="text-cyan-600 hover:text-cyan-800 font-medium transition-colors"
            >
              {texts.backToLogin}
            </Link>
          </div>
        </CardFooter>
      </form>
    </>
  );
}
