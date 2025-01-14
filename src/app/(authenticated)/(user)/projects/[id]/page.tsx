import { Star, ArrowLeft, Heart } from "lucide-react";
import TabManager from "./TabManager";
import getSession from "../../../../../../actions/verifySession";
import { db } from "@/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import SupportDialog from './SupportDialog';
import FavoriteButton from "./FavoriteButton";

async function getProjectData(projectId:any) {
  console.log(projectId);
  try {
    // Obtener los datos del proyecto
    const projectRef = doc(db, "projects", projectId);
    const projectSnap = await getDoc(projectRef);
    
    console.log(projectSnap.exists());
    
    if (!projectSnap.exists()) {
      throw new Error('Project not found');
    }

    const projectData = projectSnap.data();

    // // Obtener los datos del autor
    // const userRef = doc(db, "users", projectData.userId);
    // const userSnap = await getDoc(userRef);
    // const userData = userSnap.exists() ? userSnap.data() : {};

    // Obtener el total invertido
    const investmentsRef = collection(db, "investments");
    const investmentsQuery = query(investmentsRef, where("projectId", "==", projectId));
    const investmentsSnap = await getDocs(investmentsQuery);

    console.log("XD")
    
    const totalInvested = investmentsSnap.docs.reduce((sum, doc) => {
      return sum + (doc.data().amount || 0);
    }, 0);

    // Obtener las imágenes del proyecto
    const imagesRef = collection(db, "project_images");
    const imagesQuery = query(imagesRef, where("projectId", "==", projectId));
    const imagesSnap = await getDocs(imagesQuery);
    const images = imagesSnap.docs.map(doc => doc.data());

    return {
      ...projectData,
      projectId,
      author_name: 'Usuario Anónimo',
      author_image: 'XD',
      total_invested: totalInvested,
      images
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    throw new Error('Failed to fetch project data');
  }
}

export default async function Page({ params } : any) {
  const {isAuthenticated, user}:any = await getSession();
  // console.log(user.userId, " XDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD");
  const id = await params.id;
  const projectData:any = await getProjectData(await params.id);
  
  const progressPercentage = Math.min(
    Math.round((projectData.total_invested / projectData.moneyGoal) * 100),
    100
  );

  return (
    <main className="max-w-7xl mx-auto p-6">
      <a href='/projects' className="mb-6">
        <ArrowLeft className="w-6 h-6" />
      </a>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-1 space-y-4">
            {projectData.images?.slice(0, 3).map((image:any, index:any) => (
              <div
                key={index}
                className="aspect-square w-full rounded-lg overflow-hidden bg-gray-100"
              >
                <img
                  src={image.image_url || "/api/placeholder/150/150"}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="col-span-4 aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
            <img
              src={projectData.images?.[0]?.image_url || "/api/placeholder/600/450"}
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
            {isAuthenticated && (
              <FavoriteButton projectId={id} userId={user.user_id} />
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
                src={projectData.author_image || "/api/placeholder/32/32"}
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
              {(projectData.values || []).map((value:any, index:any) => (
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

          {isAuthenticated && <SupportDialog/>}
        </div>
      </section>

      <TabManager />
    </main>
  );
}