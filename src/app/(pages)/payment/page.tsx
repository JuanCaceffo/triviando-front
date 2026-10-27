'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import {
  Crown,
  Check,
  Sparkles,
  FileText,
  Shield,
  ArrowLeft,
  CreditCard,
  Loader2,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { useCurrentUser } from '@/app/utils/auth';
import { suscriptionService } from '@/app/services/suscriptionService';
import type { ISubscriptionPlan } from '@/app/services/suscriptionService';
import { userService } from '@/app/services/userService';
import type { IUserData } from '@/app/services/userService';
import { formatPlanPrice } from './utils/formatPlanPrice';

export default function Subscription() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<IUserData | null>(null);
  const [plan, setPlan] = useState<ISubscriptionPlan | null>(null);
  const user = useCurrentUser();

  // Cargar los datos completos del usuario al montar el componente
  useEffect(() => {
    const loadUserDetails = async () => {
      if (user?.id) {
        try {
          const userData = await userService.getUserById(user.id);
          setUserDetails(userData);
        } catch (error) {
          console.error('Error al cargar datos del usuario:', error);
          setError('Error al cargar los datos del usuario.');
        }
      }
    };

    loadUserDetails();
  }, [user?.id]);

  // Cargar el precio y la moneda del plan desde el backend
  useEffect(() => {
    let cancelled = false;

    suscriptionService
      .getPlan()
      .then((planData) => {
        if (!cancelled) setPlan(planData);
      })
      .catch((error) => {
        console.error('Error al cargar el plan Premium:', error);
        if (!cancelled) setError('No se pudo cargar el precio del plan. Recargá la página.');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Si no hay usuario cargado, mostrar un mensaje o redirigir
  if (!user || !userDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando información del usuario...</p>
        </div>
      </div>
    );
  }

  // Características del plan premium
  const premiumFeatures = [
    {
      icon: FileText,
      title: 'Temas desde tus archivos',
      description:
        'Subí un PDF, DOCX, TXT o MD y generá un tema completo a partir de tus apuntes.',
    },
    {
      icon: Sparkles,
      title: 'Preguntas a partir de tu material',
      description: 'La IA usa el contenido de tu documento para crear el quiz del tema.',
    },
  ];

  // Datos para la tabla de comparación
  const comparisonFeatures = [
    {
      feature: 'Crear temas con IA',
      free: 'Ilimitados',
      premium: 'Ilimitados',
    },
    {
      feature: 'Preguntas generadas',
      free: 'Ilimitadas',
      premium: 'Ilimitadas',
    },
    {
      feature: 'Crear temas desde archivo',
      free: false,
      premium: true,
    },
    {
      feature: 'PDF, DOCX, TXT o MD',
      free: false,
      premium: true,
    },
    {
      feature: 'Tamaño máximo por archivo',
      free: '—',
      premium: '10 MB',
    },
  ];

  const isPremium = userDetails.account === 'PREMIUM';

  const handleSubscribe = async () => {
    if (!user?.id || !userDetails?.email) {
      setError('No se encontró información del usuario. Por favor, inicia sesión nuevamente.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Usar el subscription service con el email de userDetails
      const data = await suscriptionService.getCheckoutUrlForSubscription({
        email: userDetails.email,
      });

      // El backend devuelve la URL directamente como string
      let checkoutUrl: string;

      if (typeof data === 'string') {
        // Si la respuesta es un string directo
        checkoutUrl = data;
      } else if (data && typeof data === 'object') {
        // Si es un objeto, buscar en las propiedades comunes
        checkoutUrl = data.url || data.checkout_url || data.init_point;
      } else {
        throw new Error('Formato de respuesta inesperado del servidor');
      }

      // Verificar que tenemos una URL válida
      if (!checkoutUrl || typeof checkoutUrl !== 'string') {
        throw new Error('No se recibió una URL válida de pago de Mercado Pago');
      }

      // Redirigir directamente a Mercado Pago en la misma ventana
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error('Error al procesar suscripción:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al procesar la suscripción');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="p-4">
        <Link
          href={`/${user?.username}/topics`}
          className="inline-flex items-center text-white hover:text-white/80 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Temas
        </Link>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6"
          >
            <Crown className="h-6 w-6 text-yellow-300" />
            <span className="text-white font-semibold text-lg">trivIAndo Premium</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Convertí tus apuntes en quizzes
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-white/90 max-w-2xl mx-auto"
          >
            Generá temas completos a partir de tus archivos. Los temas y preguntas ilimitados ya
            están incluidos en el plan Gratis; Premium suma la creación desde documentos.
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Características Premium */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6">¿Qué incluye Premium?</h2>

            {premiumFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
              >
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-white/80">{feature.description}</p>
                </div>
              </motion.div>
            ))}

            {/* Tabla de comparación mejorada */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-white/95 backdrop-blur-sm rounded-lg overflow-hidden border border-white/20"
            >
              <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-4">
                <h3 className="text-lg font-semibold text-white text-center">
                  Comparación de Planes
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 font-medium text-gray-700">Característica</th>
                      <th className="text-center p-4 font-medium text-gray-600">Gratis</th>
                      <th className="text-center p-4 font-medium text-teal-600 bg-teal-50">
                        Premium
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="p-4 text-gray-700 font-medium">{item.feature}</td>
                        <td className="p-4 text-center">
                          {typeof item.free === 'boolean' ? (
                            item.free ? (
                              <Check className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-gray-400 mx-auto" />
                            )
                          ) : (
                            <span className="text-gray-600">{item.free}</span>
                          )}
                        </td>
                        <td className="p-4 text-center bg-teal-50/50">
                          {typeof item.premium === 'boolean' ? (
                            item.premium ? (
                              <Check className="h-5 w-5 text-teal-600 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-gray-400 mx-auto" />
                            )
                          ) : (
                            <span className="text-teal-600 font-semibold">{item.premium}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>

          {/* Tarjeta de Suscripción */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-center p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 mx-auto">
                  <Crown className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl mb-2">Plan Premium</CardTitle>
                <div className="text-4xl font-bold mb-2">
                  {plan ? (
                    formatPlanPrice(plan.price, plan.currency)
                  ) : error ? (
                    '—'
                  ) : (
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  )}
                </div>
                <p className="opacity-90">Pago único</p>
              </CardHeader>

              <CardContent className="p-8">
                {/* Lista de beneficios */}
                <div className="space-y-4 mb-6">
                  {[
                    'Creá temas desde tus apuntes',
                    'PDF, DOCX, TXT o MD de hasta 10 MB',
                    'La IA genera las preguntas a partir de tu material',
                  ].map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <Check className="h-5 w-5 text-teal-500 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="mb-6 rounded-lg border border-cyan-200 bg-cyan-50 p-4">
                  <p className="text-sm text-cyan-800">
                    Los temas y preguntas ilimitados ya están incluidos en el plan Gratis.
                  </p>
                </div>

                {/* Información del usuario */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-1">Acceso Premium para:</p>
                  <p className="font-medium text-gray-800">
                    {userDetails?.name && userDetails?.lastName
                      ? `${userDetails.name} ${userDetails.lastName}`
                      : user?.username || 'Usuario'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {userDetails?.email || 'Email no disponible'}
                  </p>
                </div>

                {/* Mensaje de error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
                  >
                    <p className="text-red-700 text-sm">{error}</p>
                  </motion.div>
                )}

                {/* Botón de suscripción o estado Premium */}
                {isPremium ? (
                  <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-center">
                    <div className="mb-2 flex items-center justify-center gap-2">
                      <Crown className="h-5 w-5 text-teal-600" />
                      <span className="font-medium text-teal-800">Ya sos Premium</span>
                    </div>
                    <p className="mb-4 text-sm text-teal-700">
                      Tenés acceso a la generación de temas desde archivos.
                    </p>
                    <Button
                      asChild
                      className="w-full h-12 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white"
                    >
                      <Link href={`/${user?.username}/topics`}>Ir a mis temas</Link>
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full h-14 text-lg bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg"
                    onClick={handleSubscribe}
                    disabled={isLoading || !plan}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        Comprar Premium
                      </>
                    )}
                  </Button>
                )}

                {/* Información adicional */}
                <div className="mt-6 text-center space-y-2">
                  <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    <Shield className="h-4 w-4" />
                    Pago seguro con Mercado Pago
                  </p>
                  <p className="text-xs text-gray-500">
                    El pago es único: no se renueva automáticamente
                  </p>
                  <p className="text-xs text-gray-500">
                    Al comprar aceptas nuestros términos y condiciones
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Testimonios o información adicional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-16 text-center"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">Estudiá con tu propio material</h3>
            <p className="text-white/90 text-lg max-w-3xl mx-auto">
              Subí tus apuntes y convertí cada documento en un tema con preguntas generadas por IA.
              Sin cargar contenido a mano y sin límites de temas ni preguntas.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
