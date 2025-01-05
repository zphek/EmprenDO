"use client"

import React, { useState, useRef } from 'react';
import { ImageIcon, X } from 'lucide-react';

const ImageUploadSection = ({ selectedImages, setSelectedImages }: any) => {
  const fileInputRef = useRef(null);

  const handleImageSelection = (event:any) => {
    const files = Array.from(event.target.files);
    
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setSelectedImages((prev:any) => [...prev, ...newImages]);
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

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-gray-600 text-sm">Imágenes</h3>
      
      <div className="flex gap-2 items-center">
        <div 
          onClick={handleImageClick}
          className="flex-1 flex gap-2 items-center bg-[#F2F0F1] rounded-[20px] py-2 px-4 cursor-pointer hover:bg-gray-200 transition-colors"
        >
          <ImageIcon size={16} className="text-gray-500" />
          <span className="text-gray-500 text-sm">Selecciona tus imágenes</span>
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
          type="button"
          onClick={handleImageClick}
          className="bg-[#DC1D3F] text-white px-4 py-2 rounded-[20px] text-xs font-medium"
        >
          Seleccionar
        </button>
      </div>

      {selectedImages.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedImages.map((img, index) => (
            <div key={index} className="relative group w-8 h-8">
              <img
                src={img.preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploadSection;