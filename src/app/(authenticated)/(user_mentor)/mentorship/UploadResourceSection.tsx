'use client'

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadResourceProps {
  onFileUploaded: (fileUrl: string) => void;
}

const UploadResourceSection = ({ onFileUploaded }: UploadResourceProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const storage = getStorage();

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      
      // Crear una referencia única para el archivo
      const fileExtension = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExtension}`;
      const storageRef = ref(storage, `resources/${fileName}`);
      
      // Subir el archivo
      await uploadBytes(storageRef, file);
      
      // Obtener la URL de descarga
      const fileUrl = await getDownloadURL(storageRef);
      
      onFileUploaded(fileUrl);
      setUploading(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error al subir el archivo');
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleUpload(e.target.files[0]);
    }
  };

  return (
    <div>
      <label className="text-sm font-medium">Archivo</label>
      <div
        className={`mt-1 p-4 border-2 border-dashed rounded-lg text-center 
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">
          {uploading ? 'Subiendo archivo...' : 'Arrastra y suelta archivos aquí o haz clic para seleccionar'}
        </p>
        <input
          type="file"
          className="hidden"
          onChange={handleChange}
          disabled={uploading}
        />
        <Button 
          variant="outline" 
          className="mt-2" 
          disabled={uploading}
          onClick={() => document.querySelector('input[type="file"]')?.click()}
        >
          Seleccionar archivo
        </Button>
      </div>
    </div>
  );
};

export default UploadResourceSection;