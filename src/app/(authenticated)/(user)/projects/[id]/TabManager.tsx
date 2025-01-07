"use client"

import LoadingSpinner from "@/components/LoadingSpinner";
import CalificationAndReviewTab from "@/components/projects/tabs/CalificationAndReviewTab";
import DetailProjectTab from "@/components/projects/tabs/DetailProjectTab";
import { useEffect, useState } from "react";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useParams } from "next/navigation";

interface NavTab {
  tabName: string;
  value: string;
}

const tabs: NavTab[] = [
  {
    tabName: "Detalles del producto",
    value: "ProductDetail"
  },
  {
    tabName: "Calificaciones y Reseñas",
    value: "Reviews"
  }
];

export default function TabManager() {
  const params = useParams();
  const [currentTab, setCurrentTab] = useState<string>(tabs[0].value);
  const [isLoading, setIsLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [projectData, setProjectData] = useState<any>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const projectRef = doc(db, 'projects', params.id as string);
        const projectDoc = await getDoc(projectRef);
        
        if (projectDoc.exists()) {
          setProjectData({ id: projectDoc.id, ...projectDoc.data() });
        } else {
          console.log("No existe el proyecto");
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [params.id]);

  async function changeTab(value: string) {
    if (currentTab === value) return;

    setFadeOut(true);
    setIsLoading(true);

    // Wait for fade out animation
    await new Promise(resolve => setTimeout(resolve, 200));

    setCurrentTab(value);

    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 500));

    setIsLoading(false);
    setFadeOut(false);
  }

  if (!projectData && isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className="flex flex-grow mt-10">
        {tabs.map(({tabName, value}, index) => (
          <button
            key={index}
            onClick={() => changeTab(value)}
            className={`grow py-4 transition-[400ms] ${
              currentTab === value
                ? 'border-b-2 border-blue-700 text-blue-700'
                : 'border-b-2 border-white text-slate-400'
            }`}
          >
            {tabName}
          </button>
        ))}
      </div>

      <div className={`transition-opacity duration-200 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          currentTab === tabs[0].value ? 
            <DetailProjectTab project={projectData} /> : 
            <CalificationAndReviewTab />
        )}
      </div>
    </>
  );
}