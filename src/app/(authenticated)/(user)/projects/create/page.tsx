"use client"

import { ArrowLeft, Linkedin, Image as ImageIcon, Lock, Shield, ChevronDown, X } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"

export default function Page() {
  const route = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [showSplash, setShowSplash] = useState(true);
  const fileInputRef = useRef<any>(null);

  useEffect(() => {
    // Hide splash screen after 2 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handlePublish = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const handleImageSelection = (event:any) => {
    const files = Array.from(event.target.files);
    
    const newImages = files.map((file:any) => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setSelectedImages((prev: any) => [...prev, ...newImages]);
  };

  const removeImage = (index:any) => {
    setSelectedImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center transition-opacity duration-500">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-500 rounded-full animate-spin"></div>
      </div>
    );
  }


  return ( 
    <main className="w-full max-h-screen flex justify-center items-center overflow-hidden bg-white">
      <button onClick={()=> route.back()} className="absolute top-4 left-4 shadow-md p-1.5 rounded-full bg-white hover:scale-110 hover:shadow-lg">
        <ArrowLeft size={20} />
      </button>
      
      <section className="w-full max-w-[840px] py-8 px-4">
        <h2 className="text-[2rem] text-[#152080] font-bold max-w-[500px] mb-8">
          Construye, Crea y Emprende Sin Límites
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-gray-600 mb-2 text-sm">Nombre del proyecto</h3>
              <input 
                type="text" 
                placeholder="Escribe el nombre del proyecto"
                className="w-full bg-[#F2F0F1] rounded-[20px] py-2 px-4 outline-none text-gray-500 text-sm"
              />
            </div>

            <div>
              <h3 className="text-gray-600 mb-2 text-sm">Objetivos del proyecto</h3>
              <textarea 
                placeholder="Escribe el objetivo de tu proyecto"
                rows={5} 
                className="w-full bg-[#F2F0F1] rounded-[20px] py-2 px-4 outline-none resize-none text-gray-500 text-sm"
              />
            </div>

            {/* Payment Information */}
            <div>
              <h3 className="text-2xl text-[#6C6C6C] mb-3">Informaciones de Pago</h3>
              <p className="text-gray-600 mb-2 text-sm">Método de pago</p>
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center gap-2 bg-[#F2F0F1] rounded-[20px] py-2 px-3">
                  <div className="w-4 h-4 border border-gray-300 rounded-full flex-shrink-0" />
                  <span className="text-gray-500 text-xs">Tarjeta de crédito</span>
                </button>
                <button className="flex items-center gap-2 bg-[#F2F0F1] rounded-[20px] py-2 px-3">
                  <img src="/api/placeholder/16/16" alt="PayPal" className="w-4 h-4" />
                  <span className="text-gray-500 text-xs">PayPal</span>
                </button>
                <button className="flex items-center gap-2 bg-[#F2F0F1] rounded-[20px] py-2 px-3">
                  <img src="/api/placeholder/16/16" alt="Google Pay" className="w-4 h-4" />
                  <span className="text-gray-500 text-xs">Google Pay</span>
                </button>
                <button className="flex items-center gap-2 bg-[#F2F0F1] rounded-[20px] py-2 px-3">
                  <img src="/api/placeholder/16/16" alt="Apple Pay" className="w-4 h-4" />
                  <span className="text-gray-500 text-xs">Apple Pay</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-gray-600 mb-2 text-sm">Redes sociales</h3>
              <div className="flex gap-2 items-center">
                <button className="p-1.5 bg-[#F2F0F1] rounded-lg">
                  <Linkedin className="text-[#0077B7]" size={16} />
                </button>
                <input 
                  type="text" 
                  placeholder="Link"
                  className="flex-1 bg-[#F2F0F1] rounded-[20px] py-2 px-4 outline-none text-gray-500 text-sm"
                />
                <button className="bg-[#DC1D3F] text-white px-4 py-2 rounded-[20px] text-xs font-medium">
                  Agregar
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-gray-600 mb-2 text-sm">Imagenes</h3>
              <div className="flex gap-2 items-center">
                <div 
                  onClick={handleImageClick}
                  className="flex-1 flex gap-2 items-center bg-[#F2F0F1] rounded-[20px] py-2 px-4 cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <ImageIcon size={16} className="text-gray-500" />
                  <span className="text-gray-500 text-sm">Selecciona tus imagenes</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelection}
                />
                <button 
                  onClick={handleImageClick}
                  className="bg-[#DC1D3F] text-white px-4 py-2 rounded-[20px] text-xs font-medium"
                >
                  Seleccionar
                </button>
              </div>

              {selectedImages.length > 0 && (
                <div className="flex w-full overflow-x-scroll gap-x-4 mt-4">
                  {selectedImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img.preview}
                        alt={`Preview ${index + 1}`}
                        className="min-w-full h-16 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <h3 className="text-gray-600 mb-2 text-sm">Ubicacion</h3>
                <div className="relative">
                  <select className="w-full bg-[#F2F0F1] rounded-[20px] py-2 px-4 outline-none appearance-none text-gray-500 text-sm">
                    <option>Duracion estimada</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>
              <div>
                <h3 className="text-gray-600 mb-2 text-sm">Duracion estimada</h3>
                <div className="relative">
                  <select className="w-full bg-[#F2F0F1] rounded-[20px] py-2 px-4 outline-none appearance-none text-gray-500 text-sm">
                    <option>Duracion estimada</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>
            </div>

            {/* Security Information */}
            <div className="flex gap-4 mt-2">
              <div className="flex flex-col gap-3 items-start bg-white">
                <Lock className="mt-1 text-[#152080]" size={16} />
                <div>
                  <h4 className="font-medium text-gray-700 text-sm">Tu información está segura</h4>
                  <p className="text-xs text-gray-500">No venderemos ni alquilaremos tu información de contacto personal para ningún propósito de marketing bajo ninguna circunstancia.</p>
                </div>
              </div>
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
          onClick={handlePublish}
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
      </section>

      <Image src={"/images/chinita_cualto.png"} height={400} width={500} alt="Cualto" className="hidden lg:block"/>
    </main>
  )
}