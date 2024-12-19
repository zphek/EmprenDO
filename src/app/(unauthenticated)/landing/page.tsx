export default function Page() {
    return (
      <main className="bg-white">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-12">
            <div className="w-full lg:w-1/2 space-y-4 sm:space-y-6 lg:space-y-8">
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-900 leading-tight">
                  Impulsa sueños,{' '}
                  <span className="block">transforma realidades,</span>
                  <span className="block">apoya a EmprenDO</span>
                </h1>
                <p className="text-base sm:text-lg text-gray-600">
                  EmprenDO es una plataforma de crowdfunding que conecta emprendedores con mentores e inversionistas para convertir ideas en negocios sostenibles.
                </p>
                <button className="bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-full hover:bg-red-700 transition-colors">
                  Conoce a EmprenDO
                </button>
              </div>
  
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 sm:pt-6 lg:pt-8">
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900">200+</h2>
                  <p className="text-sm sm:text-base text-gray-600 font-medium">Inversionistas</p>
                </div>
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900">2000+</h2>
                  <p className="text-sm sm:text-base text-gray-600 font-medium">Mentores</p>
                </div>
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900">3000+</h2>
                  <p className="text-sm sm:text-base text-gray-600 font-medium">Emprendedores</p>
                </div>
              </div>
            </div>
  
            <div className="w-full lg:w-1/2 px-4 sm:px-6 lg:px-0">
              <div className="relative">
                <img 
                  src="/api/placeholder/600/500"
                  alt="Emprendedores felices"
                  className="rounded-lg w-full"
                />
                <div className="absolute -top-2 sm:-top-4 -left-2 sm:-left-4 w-6 sm:w-8 h-6 sm:h-8 text-blue-600">★</div>
                <div className="absolute -bottom-2 sm:-bottom-4 -right-2 sm:-right-4 w-6 sm:w-8 h-6 sm:h-8 text-blue-600">★</div>
              </div>
            </div>
          </div>
        </section>
  
        {/* Mentores Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 bg-gray-50">
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 text-center mb-6 sm:mb-8 lg:mb-12">
            El éxito de tu emprendimiento empieza aquí
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
            {/* Mentor Cards */}
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="h-10 sm:h-12 w-10 sm:w-12 rounded-full bg-gray-200"></div>
                  <div>
                    <h3 className="font-semibold text-blue-900 text-sm sm:text-base">
                      {["Laura Sánchez", "Daniel Pérez", "Ana Rodríguez"][index]}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {["Administración de empresas", "Marketing Digital", "Finanzas"][index]}
                    </p>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-gray-700">
                  {[
                    '"Me inspira ayudar a convertir ideas en negocios exitosos."',
                    '"Ayudo a crear estrategias de marketing sostenibles."',
                    '"Experta en gestión financiera de startups."'
                  ][index]}
                </p>
              </div>
            ))}
          </div>
  
          <div className="flex justify-end items-center gap-3 sm:gap-4">
            <span className="text-sm sm:text-base text-blue-900 font-medium">Conoce las mentorías</span>
            <button className="bg-red-600 text-white w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
              →
            </button>
          </div>
        </section>
  
        {/* Testimonials Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 text-center mb-6 sm:mb-8 lg:mb-12">
            Testimonios y casos de éxito
          </h2>
        </section>
  
        {/* Destacados Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 bg-gray-50">
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-6 sm:mb-8">
            Los destacados de la semana
          </h2>
  
          <div className="relative">
            {/* Navigation buttons - Hidden on mobile */}
            <button className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 bg-white rounded-full shadow-lg items-center justify-center z-10">
              <span className="sr-only">Previous</span>
              ←
            </button>
  
            {/* Cards Container */}
            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 sm:pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
              {/* Project Cards */}
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="min-w-[280px] sm:min-w-[300px] md:min-w-[350px] flex-none snap-start">
                  <div className="relative rounded-xl overflow-hidden">
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10">
                      <button className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                        ♡
                      </button>
                    </div>
                    <img 
                      src="/api/placeholder/350/200" 
                      alt={`Project ${index + 1}`}
                      className="w-full h-40 sm:h-48 object-cover"
                    />
                    <div className="bg-blue-900 text-white p-3 sm:p-4">
                      <p className="text-xs sm:text-sm">
                        {index === 0 
                          ? "Este sistema utiliza una combinación de dispositivos inteligentes, sensores y tecnologías de conectividad para ofrecer una vigilancia y control constantes."
                          : "Mejorar la calidad de vida de las personas con amputaciones mediante dispositivos que imitan más fielmente la funcionalidad de los miembros naturales."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
  
            {/* Navigation button - Hidden on mobile */}
            <button className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 bg-white rounded-full shadow-lg items-center justify-center z-10">
              <span className="sr-only">Next</span>
              →
            </button>
          </div>
  
          {/* Ver todos link */}
          <div className="flex justify-end items-center mt-6 sm:mt-8">
            <a href="#" className="text-sm sm:text-base text-red-600 hover:text-red-700 inline-flex items-center gap-2">
              Ver todos los emprendimientos
              <span className="text-lg sm:text-xl">→</span>
            </a>
          </div>
        </section>
      </main>
    );
  }