'use client'

import LoadingSpinner from "@/components/LoadingSpinner";
import CalificationAndReviewTab from "@/components/projects/tabs/CalificationAndReviewTab";
import DetailProjectTab from "@/components/projects/tabs/DetailProjectTab";
import { useState } from "react";

interface NavTab{
    tabName: string;
    value: string;
}

const tabs: NavTab[] = [{
    tabName: "Detalles del producto",
    value: "ProductDetail"
}, 
{
    tabName: "Calificaciones y Reseñas",
    value: "Reviews"
}]

export default function TabManager(){
    const [currentTab, setCurrentTab] = useState<string>(tabs[0].value);
    const [isLoading, setIsLoading] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);

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

    return <>
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
          currentTab === tabs[0].value ? <DetailProjectTab /> : <CalificationAndReviewTab />
        )}
      </div>
    </>
}