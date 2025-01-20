'use client'

import { db } from "@/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { ArrowLeft, Star } from "lucide-react";
import { useState, useEffect } from "react";
import getSession from "../../../../../../actions/verifySession";
import FavoriteButton from "./FavoriteButton";
import SupportDialog from "./SupportDialog";
import TabManager from "./TabManager";
import { useParams } from "next/navigation";

async function getProjectData(projectId:string) {
  try {
    const projectRef = doc(db, "projects", projectId);
    const projectSnap = await getDoc(projectRef);
    
    if (!projectSnap.exists()) {
      throw new Error('Project not found');
    }

    const projectData = projectSnap.data();
    
    const investmentsRef = collection(db, "investments");
    const investmentsQuery = query(investmentsRef, where("projectId", "==", projectId));
    const investmentsSnap = await getDocs(investmentsQuery);
    
    const totalInvested = investmentsSnap.docs.reduce((sum, doc) => {
      return sum + (doc.data().amount || 0);
    }, 0);

    return {
      ...projectData,
      projectId,
      author_name: 'Usuario Anónimo',
      author_image: '/api/placeholder/32/32',
      total_invested: totalInvested,
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    throw new Error('Failed to fetch project data');
  }
}

export function ProjectNormal({ para }:any) {
  const { id }:any = useParams();
  const [projectData, setProjectData] = useState(null);
  const [authData, setAuthData] = useState({ isAuthenticated: false, user: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [sessionData, projectResult] = await Promise.all([
          getSession(),
          getProjectData(id)
        ]);
        
        setAuthData(sessionData);
        setProjectData(projectResult);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [id]);

  if (isLoading) return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!projectData) return null;

  const progressPercentage = Math.min(
    Math.round((projectData.total_invested / projectData.moneyGoal) * 100),
    100
  );

  const images = Array.isArray(projectData.images) ? projectData.images : [];
  const mainImage = images.length > 0 ? images[0] : "/api/placeholder/600/450";
  const thumbnails = images.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="max-w-7xl mx-auto p-6 flex-grow">
        <a href="/projects" className="mb-6 inline-block">
          <ArrowLeft className="w-6 h-6" />
        </a>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Rest of your existing JSX */}
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-1 space-y-4">
              {thumbnails.map((imageUrl, index) => (
                <div
                  key={index}
                  className="aspect-square w-full rounded-lg overflow-hidden bg-gray-100"
                >
                  <img
                    src={imageUrl}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {[...Array(3 - thumbnails.length)].map((_, index) => (
                <div
                  key={`placeholder-${index}`}
                  className="aspect-square w-full rounded-lg overflow-hidden bg-gray-100"
                >
                  <img
                    src="/api/placeholder/150/150"
                    alt={`Placeholder ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            <div className="col-span-4 aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
              <img
                src={mainImage}
                alt="Main product"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold text-gray-900">
                {projectData.projectObj}
              </h1>
              {authData.isAuthenticated && (
                <FavoriteButton projectId={id} userId={authData.user.user_id} />
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((_, index) => (
                  <Star
                    key={index}
                    size={20}
                    color="orange"
                    fill="orange"
                    className="mr-1"
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-600">4.5/5</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                <img
                  src={projectData.author_image}
                  alt={projectData.author_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-medium text-gray-900">{projectData.author_name}</h3>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg text-blue-800">
              <p className="break-words">{projectData.projectDescription}</p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Valores</h3>
              <div className="flex flex-wrap gap-2">
                {(projectData.values || []).map((value, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Objetivo</h3>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#152080] h-2 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  ${projectData.total_invested.toLocaleString()}
                </span>
                <span className="text-[#152080] font-semibold">
                  {progressPercentage}%
                </span>
              </div>
            </div>

            {authData.isAuthenticated && <SupportDialog/>}
          </div>
        </section>

        <TabManager />
      </main>
    </div>
  );
}
