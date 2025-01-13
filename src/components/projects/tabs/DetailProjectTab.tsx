"use client";

interface Project {
  projectObj: string;
  projectDescription: string;
  founder?: string;
  founderDescription?: string;
  objective?: string;
  mission?: string;
  vision?: string;
}

export default function DetailProjectTab({ project }: { project: Project }) {
  return (
    <section className="w-full mx-auto py-8 space-y-8">
      {/* Descripción General */}
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-blue-900">
          {project.projectObj}
        </h2>
        <p className="text-gray-600 leading-relaxed break-words">
          {project.projectDescription}
        </p>
      </div>

      {/* Fundador/a */}
      {project.founder && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-blue-900 text-wrap">
            Fundador/a
          </h2>
          <p className="text-gray-600 leading-relaxed break-words">
            {project.founderDescription}
          </p>
        </div>
      )}

      {/* Objetivo Principal */}
      {project.objective && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-blue-900">
            Objetivo Principal
          </h2>
          <p className="text-gray-600 leading-relaxed break-words">
            {project.objective}
          </p>
        </div>
      )}

      {/* Misión */}
      {project.mission && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-blue-900">
            Misión
          </h2>
          <p className="text-gray-600 leading-relaxed text-wrap break-words">
            {project.mission}
          </p>
        </div>
      )}

      {/* Visión */}
      {project.vision && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-blue-900">
            Visión
          </h2>
          <p className="text-gray-600 leading-relaxed break-words">
            {project.vision}
          </p>
        </div>
      )}
    </section>
  );
}