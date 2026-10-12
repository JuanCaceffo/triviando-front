'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Button } from '@/app/components/ui/button';
import { passwordService } from '@/app/services/passwordService';
import { handleError } from '@/app/utils/errorHandler';
import { formForgotPasswordSchema } from '@/app/schemas/formForgotPasswordSchema';
import { APP_TEXTS, formatText } from '@/utils/constants';
import CodeInput from './CodeInput';

const texts = APP_TEXTS.auth.forgotPassword;
const RESEND_SECONDS = 60;
const CODE_LENGTH = 6;

type IdentifierFormData = z.infer<typeof formForgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<'identifier' | 'code'>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IdentifierFormData>({
    resolver: zodResolver(formForgotPasswordSchema),
  });

  useEffect(() => {
    if (step !== 'code') {
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  const requestCode = async (value: string) => {
    setIsFetching(true);
    try {
      await passwordService.forgotPassword(value);
      setIdentifier(value);
      setCode('');
      setSecondsLeft(RESEND_SECONDS);
      setStep('code');
    } catch (error) {
      handleError(error);
    } finally {
      setIsFetching(false);
    }
  };

  const onSubmitIdentifier = (data: IdentifierFormData) => requestCode(data.identifier);

  const handleResend = async () => {
    if (secondsLeft > 0 || isFetching) {
      return;
    }
    await requestCode(identifier);
  };

  const handleVerify = async () => {
    const cleanCode = code.replace(/\s/g, '');
    if (cleanCode.length !== CODE_LENGTH || isFetching) {
      return;
    }
    setIsFetching(true);
    try {
      const { resetToken } = await passwordService.verifyResetCode(identifier, cleanCode);
      router.push(`/reset-password?token=${encodeURIComponent(resetToken)}`);
    } catch (error) {
      handleError(error);
      setCode('');
    } finally {
      setIsFetching(false);
    }
  };

  const handleBackToIdentifier = () => {
    setCode('');
    setStep('identifier');
  };

  if (step === 'identifier') {
    return (
      <>
        <CardHeader className="space-y-1 cursor-default">
          <CardTitle className="text-2xl font-bold text-center">{texts.identifierTitle}</CardTitle>
          <CardDescription className="text-center">{texts.identifierSubtitle}</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmitIdentifier)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">{texts.identifierLabel}</Label>
              <Input
                id="identifier"
                type="text"
                placeholder={texts.identifierPlaceholder}
                autoComplete="username"
                autoFocus
                {...register('identifier')}
                className="border-cyan-200 focus:border-cyan-400"
              />
              {errors.identifier && (
                <p className="text-red-500 text-sm">{errors.identifier.message}</p>
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
              {texts.sendCodeButton}
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

  return (
    <>
      <CardHeader className="space-y-1 cursor-default">
        <CardTitle className="text-2xl font-bold text-center">{texts.codeTitle}</CardTitle>
        <CardDescription className="text-center">
          {formatText.codeSubtitle(identifier)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code-first-digit">{texts.codeLabel}</Label>
          <CodeInput value={code} onChange={setCode} disabled={isFetching} autoFocus inputId="code-first-digit" />
        </div>

        <p className="text-sm text-gray-600 text-center cursor-default">{texts.sentNotice}</p>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <Button
          type="button"
          className="w-full bg-gradient-to-r from-teal-400 to-cyan-600 hover:from-teal-500 hover:to-cyan-700 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
          onClick={handleVerify}
          disabled={isFetching || code.replace(/\s/g, '').length !== CODE_LENGTH}
          loading={isFetching}
        >
          {texts.continueButton}
        </Button>

        <div className="flex items-center justify-between w-full text-xs text-gray-600 cursor-default">
          <button
            type="button"
            onClick={handleBackToIdentifier}
            disabled={isFetching}
            className="text-cyan-600 hover:text-cyan-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {texts.useOtherIdentifier}
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={isFetching || secondsLeft > 0}
            className="text-cyan-600 hover:text-cyan-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {secondsLeft > 0 ? formatText.resendIn(secondsLeft) : texts.resend}
          </button>
        </div>

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
