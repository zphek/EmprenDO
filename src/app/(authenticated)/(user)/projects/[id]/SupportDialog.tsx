'use client'

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CreditCard, X } from "lucide-react";
import { auth, db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);


const PaymentForm = ({ amount, projectData, onSuccess, onError }: {
  amount: string;
  projectData: any;
  onSuccess: () => void;
  onError: (error: string) => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = auth.currentUser;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onError('Card element not found');
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum < projectData.minInvestmentAmount) {
      onError(`La inversión mínima es $${projectData.minInvestmentAmount.toLocaleString()}`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Create payment intent
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountNum,
          projectId: projectData.id,
        }),
      });

      const { clientSecret } = await response.json();

      if (!clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      // Confirm payment
      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: user?.email || '',
          },
        },
      });

      if (stripeError) {
        onError(stripeError.message || 'Error al procesar el pago');
      } else {
        onSuccess();
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      onError('Error al procesar el pago');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-200 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Información de la tarjeta
        </label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      
      <button
        type="submit"
        disabled={!stripe || !amount || parseFloat(amount) < (projectData.minInvestmentAmount || 0) || isSubmitting}
        className="w-full bg-[#CD1029] text-white py-3 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Procesando...' : `Confirmar aporte de $${amount}`}
      </button>
    </form>
  );
};

const SupportDialog = () => {
  const params = useParams();
  const projectId = params.id as string;
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [projectData, setProjectData] = useState<any>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const projectRef = doc(db, "projects", projectId);
        const projectSnap = await getDoc(projectRef);
        
        if (projectSnap.exists()) {
          setProjectData({ id: projectId, ...projectSnap.data() });
        } else {
          setError('Proyecto no encontrado');
        }
      } catch (err) {
        setError('Error al cargar los datos del proyecto');
        console.error('Error fetching project:', err);
      }
    };

    fetchProjectData();
  }, [projectId]);

  const handleSuccess = () => {
    setSuccessMessage('¡Pago procesado exitosamente!');
    setError('');
    setTimeout(() => {
      setIsOpen(false);
      setAmount('');
      setSuccessMessage('');
      // Refresh the page to show updated amounts
      window.location.reload();
    }, 2000);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setSuccessMessage('');
  };

  if (!projectData) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-[#CD1029] text-white py-3 rounded-3xl hover:bg-red-700 transition-colors"
      >
        Apoyar
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => !successMessage && setIsOpen(false)}
          />

          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg w-full max-w-md p-6">
              <button
                onClick={() => !successMessage && setIsOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                disabled={!!successMessage}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Apoyar proyecto
                  </h2>
                </div>

                {successMessage && (
                  <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    {successMessage}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Monto a aportar
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      id="amount"
                      min={projectData.minInvestmentAmount}
                      className="pl-6 w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-2"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={!!successMessage}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Inversión mínima: ${projectData.minInvestmentAmount?.toLocaleString()}
                  </p>
                  {error && (
                    <p className="text-sm text-red-600">
                      {error}
                    </p>
                  )}
                </div>

                {amount && !successMessage && (
                  <Elements stripe={stripePromise}>
                    <PaymentForm
                      amount={amount}
                      projectData={projectData}
                      onSuccess={handleSuccess}
                      onError={handleError}
                    />
                  </Elements>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportDialog;