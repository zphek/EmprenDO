'use client'

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { db } from "@/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc,
  serverTimestamp 
} from "firebase/firestore";

const FavoriteButton = ({ projectId, userId }: any) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkIfSaved = async () => {
      try {
        const savedProjectsRef = collection(db, "saved_projects");
        const q = query(
          savedProjectsRef, 
          where("userId", "==", userId),
          where("projectId", "==", projectId)
        );
        
        const querySnapshot = await getDocs(q);
        setIsSaved(!querySnapshot.empty);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking saved status:", error);
        setIsLoading(false);
      }
    };

    if (userId && projectId) {
      checkIfSaved();
    }
  }, [userId, projectId]);

  const toggleSave = async () => {
    console.log(isLoading)
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      const savedProjectsRef = collection(db, "saved_projects");
      const q = query(
        savedProjectsRef,
        where("userId", "==", userId),
        where("projectId", "==", projectId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Save project
        await addDoc(savedProjectsRef, {
          userId,
          projectId,
          savedAt: serverTimestamp()
        });
        setIsSaved(true);
      } else {
        // Unsave project
        const docToDelete = querySnapshot.docs[0];
        await deleteDoc(docToDelete.ref);
        setIsSaved(false);
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleSave}
      disabled={isLoading}
      className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer z-[999]"
      aria-label={isSaved ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart 
        className="w-6 h-6 transition-colors"
        fill={isSaved ? "#152080" : "none"}
        color={isSaved ? "#152080" : "currentColor"}
      />
    </button>
  );
};

export default FavoriteButton;