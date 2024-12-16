'use client'

import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: {
    id: string
  }
}

export default function Page({ params }: PageProps) {
  const reviews = [
    {
      name: "Samantha D.",
      rating: 4.5,
      date: "August 15, 2023",
      text: "La mentora fue muy útil para mí, me ayudó con temas importantes, respondió mis preguntas y me dio buenos consejos. ¡Estoy muy contenta!"
    },
    {
      name: "Alex M.",
      rating: 4,
      verified: true,
      date: "August 15, 2023",
      text: "Muy profesional y constructiva. Me ayudó a tener una visión clara de mi proyecto. ¡Muy recomendable!"
    },
    {
      name: "Ethan R.",
      rating: 5,
      verified: true,
      date: "August 16, 2023",
      text: "¡Excelente mentor! Ideal para cualquiera que aprecie la buena orientación. Los consejos y el plan perfecto se ajustó a mis necesidades."
    }
  ];

  const resources = [
    {
      title: "Gestión de proyectos",
      type: "PDF",
      description: "Este libro ofrece un software integral contra la gestión de proyectos, continuamente consistente con las mejores prácticas de la industria. La presentación clara y fácil la hacen accesible a todos, proporcionando herramientas específicas para liderar y ejecutar que buscan optimizar sus proyectos y alcanzar resultados efectivos."
    },
    {
      title: "Dirección y gestión de proyectos de TI",
      type: "PDF",
      description: "Una guía completa para gestionar proyectos con un enfoque estratégico. Explora técnicas de liderazgo, gestión de riesgos y control de calidad, ayudando a los profesionales a tomar decisiones informadas y mejorar el desempeño de sus proyectos en entornos competitivos."
    },
    {
      title: "Plantilla Acta de Constitución",
      type: "PDF",
      description: "Documento esencial para formalizar el inicio de un proyecto. Mediante su propuesta estructurada, esta plantilla permite establecer los objetivos, alcance y expectativas del proyecto. Una base sólida para la gestión del proyecto proporcionando claridad y estructura desde el principio."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="col-span-2">
          <img src="/api/placeholder/600/400" alt="Mentor profile" className="rounded-lg w-full object-cover" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <img key={i} src="/api/placeholder/200/133" alt={`Additional photo ${i}`} className="rounded-lg w-full object-cover" />
          ))}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">Aida Gonzalez</h1>
            <p className="text-gray-600">Administración de Empresas</p>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                />
              ))}
              <span className="ml-1">4.95</span>
            </div>
          </div>
          <Button className="bg-red-600 hover:bg-red-700">
            Inscribirse
          </Button>
        </div>

        <p className="text-gray-700 mb-4">
          Soy administradora de empresas con experiencia en gestión de proyectos. Mi metodología se basa en una planificación estratégica clara, seguimiento constante y toma de decisiones informada.
        </p>

        <div className="flex gap-2 mb-4">
          <Badge variant="secondary">Honestidad</Badge>
          <Badge variant="secondary">Perseverancia</Badge>
          <Badge variant="secondary">Responsabilidad</Badge>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Reseñas</h2>
          <Button variant="outline">Escribir una reseña</Button>
        </div>
        
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <Card key={index} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{review.name}</span>
                    {review.verified && (
                      <Badge variant="secondary" className="text-xs">Verificado</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-sm text-gray-500">{review.date}</span>
              </div>
              <p className="mt-2 text-gray-700">{review.text}</p>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Certificaciones y Recursos</h2>
        <div className="space-y-4">
          {resources.map((resource, index) => (
            <Card key={index} className="p-4">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-sm font-semibold">{resource.type}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{resource.title}</h3>
                    <Button variant="ghost" size="icon">
                      <Download size={20} />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
