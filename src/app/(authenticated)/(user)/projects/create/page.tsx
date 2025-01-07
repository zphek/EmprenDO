"use client"

import { ArrowLeft, Linkedin, Image as ImageIcon, Lock, Shield, ChevronDown, X } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import ImageUploadSection from "./ImageUploadSection"
import LoadingSpinner from "@/components/LoadingSpinner"
import CurrencyInput from "./CurrencyInput"
import { createProject } from "../../../../../../actions/projectActions"

export default function ProjectForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [showSplash, setShowSplash] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [serverResponse, setServerResponse] = useState(null);
  
  const [moneyValues, setMoneyValues] = useState({
    moneyGoal: '',
    minInvestmentAmount: ''
  });

  const [projectData, setProjectData] = useState({
    founder: '',
    founderDescription: '',
    objective: '',
    mission: '',
    vision: '',
    linkedinLink: ''
  });

  const [formErrors, setFormErrors] = useState({
    categoryId: "",
    projectObj: "",
    projectDescription: "",
    founder: "",
    founderDescription: "",
    objective: "",
    mission: "",
    vision: "",
    moneyGoal: "",
    minInvestmentAmount: "",
    ubication: "",
  });

  const [socialLinks, setSocialLinks] = useState([]);
  const socialLinkInputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleProjectDataChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSocialLink = () => {
    if (projectData.linkedinLink) {
      setSocialLinks(prev => [...prev, projectData.linkedinLink]);
      setProjectData(prev => ({ ...prev, linkedinLink: '' }));
    }
  };

  const handleRemoveSocialLink = (index) => {
    setSocialLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors({
      categoryId: "",
      projectObj: "",
      projectDescription: "",
      founder: "",
      founderDescription: "",
      objective: "",
      mission: "",
      vision: "",
      moneyGoal: "",
      minInvestmentAmount: "",
      ubication: "",
    });

    try {
      const formData = new FormData(e.currentTarget);
      
      // Agregar los datos del proyecto
      Object.entries(projectData).forEach(([key, value]) => {
        if (key !== 'linkedinLink') { // No incluir el input temporal de LinkedIn
          formData.set(key, value);
        }
      });
      
      // Agregar redes sociales
      formData.set('socialLinks', JSON.stringify(socialLinks));
      
      // Agregar imágenes
      formData.append('selectedImages', JSON.stringify(selectedImages));
      
      // Agregar valores monetarios
      formData.set('moneyGoal', moneyValues.moneyGoal);
      formData.set('minInvestmentAmount', moneyValues.minInvestmentAmount);

      const response:any = await createProject(formData);
      setServerResponse(response);

      if (response.error) {
        const errorParts = response.message?.split(':');
        if (errorParts?.length === 2) {
          const [field, message] = errorParts;
          setFormErrors(prev => ({
            ...prev,
            [field]: message
          }));
        }
      } else if (response.projectId) {
        setShowSuccessPopup(true);
        setTimeout(() => {
          router.push(`/projects/${response.projectId}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoneyChange = (e) => {
    const { name, value } = e.target;
    setMoneyValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (showSplash) {
    return <LoadingSpinner/>;
  }

  return (
    <main className="w-full min-h-screen flex justify-center bg-white overflow-x-hidden mx-auto">
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl w-full max-w-md mx-4 animate-[zoomIn_0.3s_ease-out]">
            <div className="relative bg-[#152080] h-16 rounded-t-3xl flex items-center justify-end px-4">
              <button className="text-white hover:bg-white/10 rounded-full p-1 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <img src="/images/emprendo-logo.png" alt="Emprendo Logo" className="h-8"/>
              </div>
              <p className="text-gray-600 text-lg">
                Gracias por registrar un proyecto. Inicia tu aventura y conviértete en un gran emprendedor.
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        {/* Header with back button */}
      <div className="w-full bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-[840px] mx-auto px-4 py-4 flex items-center">
          <button 
            onClick={() => router.back()} 
            className="mr-4 p-1.5 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold text-[#152080]">
            Crear Proyecto
          </h1>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="w-full max-w-[840px] py-8 px-4">
        <h2 className="text-[2rem] text-[#152080] font-bold max-w-[500px] mb-8">
          Construye, Crea y Emprende Sin Límites
        </h2>

        {/* General Error Message */}
        {serverResponse?.error && !serverResponse.message?.includes(':') && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{serverResponse.message}</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-h-[55vh] px-5 overflow-y-scroll">
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

            <div>
              <h3 className="text-gray-600 mb-2 text-sm">Fundador/a</h3>
              <input 
                type="text" 
                name="founder"
                value={projectData.founder}
                onChange={handleProjectDataChange}
                placeholder="Nombre del fundador/a"
                className={`w-full bg-[#F2F0F1] rounded-[20px] py-2 px-4 outline-none text-gray-500 text-sm
                  ${formErrors.founder ? 'border-2 border-red-500' : ''}`}
                required
              />
              {formErrors.founder && (
                <p className="text-red-500 text-xs mt-1">{formErrors.founder}</p>
              )}
            </div>

            <div>
              <h3 className="text-gray-600 mb-2 text-sm">Descripción del Fundador/a</h3>
              <textarea 
                name="founderDescription"
                value={projectData.founderDescription}
                onChange={handleProjectDataChange}
                placeholder="Describe la experiencia y trayectoria del fundador/a"
                rows={4}
                className={`w-full bg-[#F2F0F1] rounded-[20px] py-2 px-4 outline-none resize-none text-gray-500 text-sm
                  ${formErrors.founderDescription ? 'border-2 border-red-500' : ''}`}
                required
              />
              {formErrors.founderDescription && (
                <p className="text-red-500 text-xs mt-1">{formErrors.founderDescription}</p>
              )}
            </div>

            <div>
              <h3 className="text-gray-600 mb-2 text-sm">Objetivo Principal</h3>
              <textarea 
                name="objective"
                value={projectData.objective}
                onChange={handleProjectDataChange}
                placeholder="¿Cuál es el objetivo principal del proyecto?"
                rows={3}
                className={`w-full bg-[#F2F0F1] rounded-[20px] py-2 px-4 outline-none resize-none text-gray-500 text-sm
                  ${formErrors.objective ? 'border-2 border-red-500' : ''}`}
                required
              />
              {formErrors.objective && (
                <p className="text-red-500 text-xs mt-1">{formErrors.objective}</p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-gray-600 mb-2 text-sm">Misión</h3>
              <textarea 
                name="mission"
                value={projectData.mission}
                onChange={handleProjectDataChange}
                placeholder="¿Cuál es la misión del proyecto?"
                rows={3}
                className={`w-full bg-[#F2F0F1] rounded-[20px] py-2 px-4 outline-none resize-none text-gray-500 text-sm
                  ${formErrors.mission ? 'border-2 border-red-500' : ''}`}
                required
              />
              {formErrors.mission && (
                <p className="text-red-500 text-xs mt-1">{formErrors.mission}</p>
              )}
            </div>

            <div>
              <h3 className="text-gray-600 mb-2 text-sm">Visión</h3>
              <textarea 
                name="vision"
                value={projectData.vision}
                onChange={handleProjectDataChange}
                placeholder="¿Cuál es la visión a futuro del proyecto?"
                rows={3}
                className={`w-full bg-[#F2F0F1] rounded-[20px] py-2 px-4 outline-none resize-none text-gray-500 text-sm
                  ${formErrors.vision ? 'border-2 border-red-500' : ''}`}
                required
              />
              {formErrors.vision && (
                <p className="text-red-500 text-xs mt-1">{formErrors.vision}</p>
              )}
            </div>

            <div>
              <h3 className="text-gray-600 mb-2 text-sm">Redes sociales</h3>
              <div className="space-y-3">
                <div className="flex gap-2 items-center">
                  <button type="button" className="p-1.5 bg-[#F2F0F1] rounded-lg">
                    <Linkedin className="text-[#0077B7]" size={16} />
                  </button>
                  <input 
                    type="text" 
                    ref={socialLinkInputRef}
                    value={projectData.linkedinLink}
                    onChange={(e) => setProjectData(prev => ({ ...prev, linkedinLink: e.target.value }))}
                    placeholder="Link de LinkedIn"
                    className="flex-1 bg-[#F2F0F1] rounded-[20px] py-2 px-4 outline-none text-gray-500 text-sm"
                  />
                  <button 
                    type="button"
                    onClick={handleAddSocialLink}
                    className="bg-[#DC1D3F] text-white px-4 py-2 rounded-[20px] text-xs font-medium"
                  >
                    Agregar
                  </button>
                </div>

                {/* Lista de links agregados */}
                {socialLinks.length > 0 && (
                  <div className="space-y-2">
                    {socialLinks.map((link, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Linkedin className="text-[#0077B7]" size={16} />
                          <span className="text-sm text-gray-600 truncate">{link}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSocialLink(index)}
                          className="p-1 hover:bg-gray-200 rounded-full"
                        >
                          <X size={16} className="text-gray-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <ImageUploadSection 
              selectedImages={selectedImages} 
              setSelectedImages={setSelectedImages} 
            />

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

            {/* Info Box */}
            <div className="flex gap-4 mt-2">
              <div className="flex flex-col gap-3 items-start bg-white">
                <Shield className="mt-1 text-[#152080]" size={16} />
                <div>
                  <h4 className="font-medium text-gray-700 text-sm">Pago seguro</h4>
                  <p className="text-xs text-gray-500">Toda la información está encriptada y transmitida de forma segura utilizando SSL.</p>
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
      </div>

      <div className="hidden lg:block">
        <Image 
          src="/images/chinita_cualto.png" 
          height={400} 
          width={500} 
          alt="Cualto" 
        />
      </div>
    </main>
  );
}