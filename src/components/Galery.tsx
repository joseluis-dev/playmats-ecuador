import { useEffect, useState } from "react";
import clsx from "clsx";
import './Galery.css';


interface Resource {
  id: string;
  name: string;
  url: string;
  type: string;
  hosting: string;
}

interface GaleryProps {
  resources: Resource[];
}

export const Galery = ({ resources = [] }: GaleryProps) => {
  const [selected, setSelected] = useState<Resource>(resources[0]);
  const [prevSelected, setPrevSelected] = useState<Resource | null>(null);

  const handleSelect = (resource: Resource) => {
    if (resource.id !== selected.id) {
      setSelected(prev => {
        setPrevSelected(prev);
        return resource;
      });
    }
  };

  return (
    <div className="w-full lg:max-w-2xl xl:max-w-3xl flex flex-col gap-4">
      <div className="relative w-full aspect-video max-w-[calc(100vw-80px)] overflow-x-auto">
        {resources.map((resource) => (
          <div key={resource.id} className={clsx(
            "absolute top-0 left-0 right-0 bottom-0 inset-0 flex items-center justify-center rounded-lg overflow-hidden",
            resource.id === prevSelected?.id && "fade-out",
            resource.id === selected.id && "fade-in"
          )} style={{ opacity: resource.id === selected.id ? 1 : 0 }}>
            {resource.type === 'image' ? (
              <img
                key={resource.id}
                src={resource.url}
                alt={resource.name}
                className="object-cover aspect-video w-full"
                onClick={() => handleSelect(resource)}
              />
            ) : (
              <video
                key={resource.id}
                src={resource.url}
                onClick={() => handleSelect(resource)}
                controls
              />
            )}
          </div>
        ))}
      </div>
      <div className="w-full max-w-[calc(100vw-80px)] overflow-x-auto">
        <div className="flex flex-nowrap gap-2">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="flex-none aspect-video w-32 bg-gray-500/90 rounded-lg shadow-md overflow-hidden hover:ring-1 hover:ring-blue-500 transition-all duration-200 ease-in-out cursor-pointer"
              onClick={() => handleSelect(resource)}
            >
              <img src={resource.url} alt={resource.name} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

