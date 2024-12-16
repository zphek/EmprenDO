import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface Mentor{
    name: string,
    title: string,
    rating: number,
    description: string
}

const MentorCard = ({ name, title, rating, description }: Mentor) => (
  <Card className="mb-4 p-6 flex items-start gap-6">
    <div className="w-24 h-24 bg-gray-200 rounded-lg shrink-0" />
    <div className="flex-1">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="text-sm text-gray-600">{title}</p>
          <div className="flex items-center gap-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
              />
            ))}
            <span className="ml-1 text-sm">{rating}</span>
          </div>
        </div>
        <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
          Suscríbete
        </Button>
      </div>
      <p className="mt-3 text-sm text-gray-600">{description}</p>
    </div>
  </Card>
);

const Page = () => {
  const mentors = [
    {
      name: "Aida González",
      title: "Administración de Empresas",
      rating: 4.95,
      description: "Soy administradora de empresas con experiencia en gestión de proyectos. Mi metodología se basa en una planificación estratégica clara, seguimiento constante y toma de decisiones informada. Me enfoco en brindar apoyo personalizado, adaptándome a las necesidades de cada emprendedor para maximizar su potencial y asegurar resultados sostenibles."
    },
    {
      name: "Aida González",
      title: "Administración de Empresas",
      rating: 4.95,
      description: "Soy administradora de empresas con experiencia en gestión de proyectos. Mi metodología se basa en una planificación estratégica clara, seguimiento constante y toma de decisiones informada. Me enfoco en brindar apoyo personalizado, adaptándome a las necesidades de cada emprendedor para maximizar su potencial y asegurar resultados sostenibles."
    },
    {
      name: "Aida González",
      title: "Administración de Empresas",
      rating: 4.95,
      description: "Soy administradora de empresas con experiencia en gestión de proyectos. Mi metodología se basa en una planificación estratégica clara, seguimiento constante y toma de decisiones informada. Me enfoco en brindar apoyo personalizado, adaptándome a las necesidades de cada emprendedor para maximizar su potencial y asegurar resultados sostenibles."
    }
  ];

  return (
    <main>
      <div className="min-h-[50vh] w-full bg-[#F2F0F1] p-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-extrabold text-5xl text-[#152080] max-w-[500px] mb-4">
            Conecta con mentores expertos que guiarán tu camino hacia el éxito
          </h1>
          <h4 className="text-lg text-gray-600 max-w-[600px]">
            Recibe orientación de mentores experimentados y lleva tu proyecto al siguiente nivel con conocimiento y experiencia compartidos en EmprenDO.
          </h4>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-[#152080] mb-8">
          Construye tu camino con nuestros mentores
        </h2>
        <div className="space-y-6">
          {mentors.map((mentor, index) => (
            <MentorCard key={index} {...mentor} />
          ))}
        </div>
      </div>
    </main>
  );
};

export default Page;