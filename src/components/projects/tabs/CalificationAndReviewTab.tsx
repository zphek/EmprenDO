"use client";

import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { 
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  getDoc,
  doc
} from 'firebase/firestore';
import { db } from '@/firebase';

interface Review {
  id: string;
  userId: string;
  projectId: string;
  author: string;
  rating: number;
  content: string;
  createdAt: Date;
  verified: boolean;
}

interface ProjectReviewsProps {
  projectId: string;
  currentUser: any;
}

const CalificationAndReviewTab = ({ projectId, currentUser }: ProjectReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showAddReview, setShowAddReview] = useState(false);
  const [hasContributed, setHasContributed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkContribution = async () => {
      if (!currentUser) return;
      
      try {
        const investmentsRef = collection(db, 'investments');
        const q = query(
          investmentsRef,
          where('userId', '==', currentUser.uid),
          where('projectId', '==', projectId)
        );
        
        const querySnapshot = await getDocs(q);
        setHasContributed(!querySnapshot.empty);
      } catch (err) {
        setError('Error al verificar tu contribución');
        console.error(err);
      }
    };

    const fetchReviews = async () => {
      try {
        const reviewsRef = collection(db, 'reviews');
        const q = query(reviewsRef, where('projectId', '==', projectId));
        const querySnapshot = await getDocs(q);
        
        const reviewPromises = querySnapshot.docs.map(async (docSnapshot: any) => {
          const data = docSnapshot.data();
          // Aquí está la corrección - usando la función doc de Firebase
          const userDocRef = doc(db, 'users', data.userId);
          const userDoc = await getDoc(userDocRef);
          const userData: any = userDoc.data();
          
          return {
            id: docSnapshot.id,
            author: userData?.username || 'Usuario Anónimo',
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
          } as Review;
        });
    
        const reviewsData = await Promise.all(reviewPromises);
        setReviews(reviewsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      } catch (err) {
        setError('Error al cargar las reseñas');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    checkContribution();
    fetchReviews();
  }, [projectId, currentUser]);

  const handleSubmitReview = async (rating: number, content: string) => {
    if (!currentUser) {
      setError('Debes iniciar sesión para dejar una reseña');
      return;
    }

    try {
      const reviewsRef = collection(db, 'reviews');
      const q = query(
        reviewsRef,
        where('userId', '==', currentUser.uid),
        where('projectId', '==', projectId)
      );
      const existingReviews = await getDocs(q);

      if (!existingReviews.empty) {
        setError('Ya has dejado una reseña para este proyecto');
        return;
      }

      const newReview = {
        userId: currentUser.uid,
        projectId,
        rating,
        content,
        createdAt: serverTimestamp(),
        verified: true
      };

      const docRef = await addDoc(collection(db, 'reviews'), newReview);
      
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();

      const reviewWithId = {
        id: docRef.id,
        author: userData?.username || 'Usuario Anónimo',
        ...newReview,
        createdAt: new Date(),
      };

      setReviews([reviewWithId, ...reviews]);
      setShowAddReview(false);
      setError(null);
    } catch (err) {
      setError('Error al publicar la reseña');
      console.error(err);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando reseñas...</div>;
  }

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Debes iniciar sesión para ver y dejar reseñas.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-blue-900">Reseñas del Proyecto</h1>
        {hasContributed && (
          <button
            onClick={() => setShowAddReview(!showAddReview)}
            className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
          >
            Escribir una reseña
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!hasContributed && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Solo los usuarios que han contribuido al proyecto pueden dejar reseñas.
              </p>
            </div>
          </div>
        </div>
      )}

      {showAddReview ? (
        <AddReview onSubmit={handleSubmitReview} onCancel={() => setShowAddReview(false)} />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
          {reviews.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              Este proyecto aún no tiene reseñas.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="border rounded-lg p-6 mb-4 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">{review.author}</span>
            {review.verified && (
              <span className="text-blue-600 text-sm bg-blue-50 px-2 py-0.5 rounded-full">
                ✓ Contribuidor verificado
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((_, index) => (
                <Star
                  key={index}
                  size={20}
                  className={`${
                    index < review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-200'
                  } mr-1`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="text-gray-700 mb-3">{review.content}</p>
      <span className="text-sm text-gray-500">
        {review.createdAt.toLocaleDateString()}
      </span>
    </div>
  );
}

function AddReview({ 
  onSubmit,
  onCancel 
}: { 
  onSubmit: (rating: number, content: string) => void;
  onCancel: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');

  const handleSubmit = () => {
    if (rating === 0) {
      alert('Por favor selecciona una calificación');
      return;
    }
    if (review.trim() === '') {
      alert('Por favor escribe una reseña');
      return;
    }
    onSubmit(rating, review);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm border">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Agregar Reseña</h2>
      <div className="mb-6">
        <p className="text-gray-600 mb-2">Calificación</p>
        <div
          className="flex gap-1"
          onMouseLeave={() => setHoveredRating(0)}
        >
          {[1, 2, 3, 4, 5].map((starIndex) => (
            <button
              key={starIndex}
              onClick={() => setRating(starIndex)}
              onMouseEnter={() => setHoveredRating(starIndex)}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Star
                size={24}
                className={`${
                  (hoveredRating || rating) >= starIndex
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                } transition-colors`}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="mb-6">
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Escribe tu reseña aquí..."
          className="w-full min-h-32 p-4 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex gap-4">
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
        >
          Publicar Reseña
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default CalificationAndReviewTab;