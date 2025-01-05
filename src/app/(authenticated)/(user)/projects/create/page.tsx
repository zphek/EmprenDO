"use client"

import { ArrowLeft, Linkedin, Image as ImageIcon, Lock, Shield, ChevronDown, X } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect, useActionState } from "react"
import { createProject } from "../../../../../../actions/projectActions"
import ImageUploadSection from "./ImageUploadSection"
import LoadingSpinner from "@/components/LoadingSpinner"
import CurrencyInput from "./CurrencyInput"

export default function Page() {
  const route = useRouter();
  const [data, action, isLoading] = useActionState(createProject, undefined);
  const [selectedImages, setSelectedImages] = useState([]);
  const [showSplash, setShowSplash] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [moneyValues, setMoneyValues] = useState({
    moneyGoal: '',
    minInvestmentAmount: ''
  });

  const handleMoneyChange = (e) => {
    const { name, value } = e.target;
    setMoneyValues(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const fileInputRef = useRef(null);

  // Estado para los errores de validación
  const [formErrors, setFormErrors] = useState({
    categoryId: "",
    projectObj: "",
    projectDescription: "",
    moneyGoal: "",
    minInvestmentAmount: "",
    ubication: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Efecto para manejar la respuesta del servidor
  useEffect(() => {
    if (data?.error) {
      // Asumiendo que el mensaje de error viene en el formato "field:message"
      const errorParts = data.message?.split(':');
      if (errorParts?.length === 2) {
        const [field, message] = errorParts;
        setFormErrors(prev => ({
          ...prev,
          [field]: message
        }));
      }
    } else if (data?.projectId) {
      setShowSuccessPopup(true);
      // Redirigir después de 2 segundos
      setTimeout(() => {
        route.push(`/projects/${data.projectId}`);
      }, 2000);
    }
  }, [data, route]);


  const handleSubmit = async (formData: FormData) => {
    // Resetear errores
    setFormErrors({
      categoryId: "",
      projectObj: "",
      projectDescription: "",
      moneyGoal: "",
      minInvestmentAmount: "",
      ubication: "",
    });

    // Agregar las imágenes seleccionadas al FormData
    formData.append('selectedImages', JSON.stringify(selectedImages));
  };

  if (showSplash) {
    return <LoadingSpinner/>
  }

  return ( 
    <main className="w-full min-h-screen flex justify-center items-center overflow-x-hidden bg-white">
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl w-full max-w-md mx-4 animate-[zoomIn_0.3s_ease-out]">
          <div className="relative bg-[#152080] h-16 rounded-t-3xl flex items-center justify-end px-4">
            <button
              className="text-white hover:bg-white/10 rounded-full p-1 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <img 
                src="/images/emprendo-logo.png" 
                alt="Emprendo Logo" 
                className="h-8"
              />
            </div>
            <p className="text-gray-600 text-lg">
              Gracias por registrar un proyecto. Inicia tu aventura y conviertete en un gran emprendedor.
            </p>
          </div>
        </div>
      </div>
      )}

      <button 
        onClick={()=> route.back()} 
        className="absolute top-4 left-4 shadow-md p-1.5 rounded-full bg-white hover:scale-110 hover:shadow-lg"
      >
        <ArrowLeft size={20} />
      </button>
      
      <form action={action} className="w-full max-w-[840px] py-8 px-4">
        <h2 className="text-[2rem] text-[#152080] font-bold max-w-[500px] mb-8">
          Construye, Crea y Emprende Sin Límites
        </h2>

        {/* Mensaje de error general */}
        {data?.error && !data.message?.includes(':') && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{data.message}</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[80%] overflow-y-scroll">
          {/* Left Column */}
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-gray-600 mb-2 text-sm">Categoría</h3>
              <select 
                name="categoryId"
                className={`w-full bg-[#F2F0F1] rounded-[20px] py-2 px-4 outline-none text-gray-500 text-sm
                  ${formErrors.categoryId ? 'border-2 border-red-500' : ''}`}
                required
              >
                <option value="">Selecciona una categoría</option>
                <option value="1">Tecnología</option>
                <option value="2">Arte</option>
                <option value="3">Educación</option>
                <option value="4">Salud</option>
              </select>
              {formErrors.categoryId && (
                <p className="text-red-500 text-xs mt-1">{formErrors.categoryId}</p>
              )}
            </div>

            <div>
              <h3 className="text-gray-600 mb-2 text-sm">Nombre del proyecto</h3>
              <input 
                type="text" 
                name="projectObj"
                placeholder="Escribe el nombre del proyecto"
                className={`w-full bg-[#F2F0F1] rounded-[20px] py-2 px-4 outline-none text-gray-500 text-sm
                  ${formErrors.projectObj ? 'border-2 border-red-500' : ''}`}
                required
              />
              {formErrors.projectObj && (
                <p className="text-red-500 text-xs mt-1">{formErrors.projectObj}</p>
              )}
            </div>

            <div>
              <h3 className="text-gray-600 mb-2 text-sm">Descripción del proyecto</h3>
              <textarea 
                name="projectDescription"
                placeholder="Describe tu proyecto detalladamente"
                rows={5} 
                className={`w-full bg-[#F2F0F1] rounded-[20px] py-2 px-4 outline-none resize-none text-gray-500 text-sm
                  ${formErrors.projectDescription ? 'border-2 border-red-500' : ''}`}
                required
              />
              {formErrors.projectDescription && (
                <p className="text-red-500 text-xs mt-1">{formErrors.projectDescription}</p>
              )}
            </div>

            <div className="flex gap-4 mt-2">
              <div className="flex flex-col gap-3 items-start bg-white">
                <Lock className="mt-1 text-[#152080]" size={16} />
                <div>
                  <h4 className="font-medium text-gray-700 text-sm">Tu información está segura</h4>
                  <p className="text-xs text-gray-500">No venderemos ni alquilaremos tu información de contacto personal para ningún propósito de marketing bajo ninguna circunstancia.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-gray-600 mb-2 text-sm">Redes sociales</h3>
              <div className="flex gap-2 items-center">
                <button type="button" className="p-1.5 bg-[#F2F0F1] rounded-lg">
                  <Linkedin className="text-[#0077B7]" size={16} />
                </button>
                <input 
                  type="text" 
                  placeholder="Link"
                  className="flex-1 bg-[#F2F0F1] rounded-[20px] py-2 px-4 outline-none text-gray-500 text-sm"
                />
                <button type="button" className="bg-[#DC1D3F] text-white px-4 py-2 rounded-[20px] text-xs font-medium">
                  Agregar
                </button>
              </div>
            </div>

            <ImageUploadSection selectedImages={selectedImages} setSelectedImages={setSelectedImages} />

            <div>
              <h3 className="text-gray-600 mb-2 text-sm">Ubicación</h3>
              <input 
                type="text"
                name="ubication"
                placeholder="Ciudad, País"
                className={`w-full bg-[#F2F0F1] rounded-[20px] py-2 px-4 outline-none text-gray-500 text-sm
                  ${formErrors.ubication ? 'border-2 border-red-500' : ''}`}
                required
              />
              {formErrors.ubication && (
                <p className="text-red-500 text-xs mt-1">{formErrors.ubication}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-gray-600 mb-2 text-sm">Meta de financiamiento</h3>
              <CurrencyInput
                name="moneyGoal"
                value={moneyValues.moneyGoal}
                onChange={handleMoneyChange}
                error={formErrors.moneyGoal}
                required
              />
            </div>
            <div>
              <h3 className="text-gray-600 mb-2 text-sm">Inversión mínima</h3>
              <CurrencyInput
                name="minInvestmentAmount"
                value={moneyValues.minInvestmentAmount}
                onChange={handleMoneyChange}
                error={formErrors.minInvestmentAmount}
                required
              />
            </div>
            </div>

            <div className="flex gap-4 mt-2">
              <div className="flex flex-col gap-3 items-start bg-white">
                <Shield className="mt-1 text-[#152080]" size={16} />
                <div>
                  <h4 className="font-medium text-gray-700 text-sm">Pago seguro</h4>
                  <p className="text-xs text-gray-500">Toda la información está encriptada y transmitida sin riesgos utilizando el protocolo Secure Sockets Layer (SSL). ¡Puedes confiar en nosotros!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#DC1D3F] text-white py-3 rounded-[20px] mt-8 font-medium disabled:opacity-75"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"/>
              <span>Publicando...</span>
            </div>
          ) : (
            "Publicar"
          )}
        </button>
      </form>

      <Image src={"/images/chinita_cualto.png"} height={400} width={500} alt="Cualto" className="hidden lg:block"/>
    </main>
  )
}