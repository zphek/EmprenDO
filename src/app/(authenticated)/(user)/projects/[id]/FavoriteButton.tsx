'use client'

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { toggleFavoriteProjectFunction, callFunction } from "@/utils/functions";

interface FavoriteButtonProps {
  projectId: string;
  userId: string;
}

const FavoriteButton = ({ projectId, userId }: FavoriteButtonProps) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkIfSaved = async () => {
      if (!userId || !projectId) {
        setIsLoading(false);
        return;
      }

      try {
        const savedProjectsRef = collection(db, "saved_projects");
        const q = query(
          savedProjectsRef, 
          where("userId", "==", userId),
          where("projectId", "==", projectId)
        );
        
        const querySnapshot = await getDocs(q);
        if (isMounted) {
          setIsSaved(!querySnapshot.empty);
          setError(null);
        }
      } catch (error) {
        console.error("Error checking saved status:", error);
        if (isMounted) {
          setError("Error al verificar el estado guardado");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkIfSaved();

    return () => {
      isMounted = false;
    };
  }, [userId, projectId]);

  const toggleSave = async () => {
    if (isLoading || !userId || !projectId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await callFunction(toggleFavoriteProjectFunction, { projectId });
      
      setIsSaved(result.isFavorite);
    } catch (error) {
      console.error("Error toggling save:", error);
      setError("Error al guardar/eliminar el proyecto");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={toggleSave}
        disabled={isLoading}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={isSaved ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart 
          className={`w-6 h-6 transition-colors ${isLoading ? 'opacity-50' : ''}`}
          fill={isSaved ? "#152080" : "none"}
          color={isSaved ? "#152080" : "currentColor"}
        />
      </button>
      {error && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-red-500 text-white text-sm rounded shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default FavoriteButton;