"use client"

import React, { useState, useRef } from 'react';
import { ImageIcon, X } from 'lucide-react';

interface ImageUploadSectionProps {
  selectedImages: Array<{ file: File; preview: string }>;
  setSelectedImages: React.Dispatch<React.SetStateAction<Array<{ file: File; preview: string }>>>;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 6;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({ 
  selectedImages, 
  setSelectedImages 
}) => {
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Validar tipo de archivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Solo se permiten imágenes en formato JPG o PNG');
      return false;
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      setError('La imagen no debe superar los 5MB');
      return false;
    }

    return true;
  };

  const handleImageSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const files = event.target.files;
    if (!files) return;

    // Validar número máximo de imágenes
    if (selectedImages.length + files.length > MAX_IMAGES) {
      setError(`Solo puedes subir un máximo de ${MAX_IMAGES} imágenes`);
      return;
    }

    const validFiles = Array.from(files).filter(validateFile);
    
    if (validFiles.length === 0) return;

    try {
      const newImages = validFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      
      setSelectedImages(prev => [...prev, ...newImages]);
      
      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error processing images:', error);
      setError('Error al procesar las imágenes');
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => {
      const newImages = [...prev];
      // Liberar URL del objeto para evitar memory leaks
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleImageClick = () => {
    if (selectedImages.length >= MAX_IMAGES) {
      setError(`Solo puedes subir un máximo de ${MAX_IMAGES} imágenes`);
      return;
    }
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-gray-600 text-sm">Imágenes</h3>
      
      <div className="flex gap-2 items-center">
        <div 
          onClick={handleImageClick}
          className="flex-1 flex gap-2 items-center bg-[#F2F0F1] rounded-[20px] py-2 px-4 cursor-pointer hover:bg-gray-200 transition-colors"
        >
          <ImageIcon size={16} className="text-gray-500" />
          <span className="text-gray-500 text-sm">
            {selectedImages.length === 0 
              ? 'Selecciona tus imágenes' 
              : `${selectedImages.length} imagen(es) seleccionada(s)`}
          </span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          multiple
          className="hidden"
          onChange={handleImageSelection}
        />
        <button 
          type="button"
          onClick={handleImageClick}
          disabled={selectedImages.length >= MAX_IMAGES}
          className="bg-[#DC1D3F] text-white px-4 py-2 rounded-[20px] text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Seleccionar
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}

      {selectedImages.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedImages.map((img, index) => (
            <div key={index} className="relative group w-16 h-16">
              <img
                src={img.preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-1">
        Máximo {MAX_IMAGES} imágenes. Formatos permitidos: JPG, PNG. Tamaño máximo: 5MB por imagen
      </p>
    </div>
  );
};

export default ImageUploadSection;