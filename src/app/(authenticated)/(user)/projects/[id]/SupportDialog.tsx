'use client'

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CreditCard, Wallet, X } from "lucide-react";
import { auth, db } from "@/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";

const paymentMethods = [
  {
    id: 'card1',
    type: 'credit',
    last4: '4242',
    expiry: '12/24',
    default: true
  },
  {
    id: 'card2',
    type: 'debit',
    last4: '8888',
    expiry: '06/25',
    default: false
  }
];

const SupportDialog = () => {
  const params = useParams();
  const projectId = params.id as string;
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectData, setProjectData] = useState<any>(null);
  const [error, setError] = useState('');
  const user = auth.currentUser;

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const projectRef = doc(db, "projects", projectId);
        const projectSnap = await getDoc(projectRef);
        
        if (projectSnap.exists()) {
          setProjectData(projectSnap.data());
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

  const handleSupport = async () => {
    if (!amount || !projectData) return;
    
    const amountNum = parseFloat(amount);
    if (amountNum < projectData.minInvestmentAmount) {
      setError(`La inversión mínima es $${projectData.minInvestmentAmount.toLocaleString()}`);
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    try {
      const investmentRef = collection(db, 'investments');
      await addDoc(investmentRef, {
        projectId,
        userId: user?.uid,
        amount: amountNum,
        paymentMethodId: selectedMethod,
        status: 'completed',
        createdAt: serverTimestamp(),
      });

      setIsOpen(false);
      setAmount('');
      // Aquí podrías mostrar una notificación de éxito
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      setError('Error al procesar el pago');
    } finally {
      setIsSubmitting(false);
    }
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
            onClick={() => !isSubmitting && setIsOpen(false)}
          />

          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg w-full max-w-md p-6">
              <button
                onClick={() => !isSubmitting && setIsOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Apoyar proyecto
                  </h2>
                </div>

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
                      className="pl-6 w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
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

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Método de pago
                  </label>
                  <div className="space-y-2">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedMethod === method.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-200'
                        }`}
                        onClick={() => setSelectedMethod(method.id)}
                      >
                        <div className="flex items-center h-5">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              selectedMethod === method.id
                                ? 'border-blue-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {selectedMethod === method.id && (
                              <div className="w-2 h-2 rounded-full bg-blue-500" />
                            )}
                          </div>
                        </div>

                        <div className="ml-3 flex items-center">
                          {method.type === 'credit' ? (
                            <CreditCard className="w-5 h-5 text-gray-600" />
                          ) : (
                            <Wallet className="w-5 h-5 text-gray-600" />
                          )}
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">
                              {method.type === 'credit' ? 'Tarjeta de crédito' : 'Tarjeta de débito'}
                            </p>
                            <p className="text-sm text-gray-500">
                              **** {method.last4} • Expira {method.expiry}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSupport}
                  disabled={!amount || parseFloat(amount) < (projectData.minInvestmentAmount || 0) || isSubmitting}
                  className="w-full bg-[#CD1029] text-white py-3 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Procesando...' : 'Confirmar aporte'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportDialog;