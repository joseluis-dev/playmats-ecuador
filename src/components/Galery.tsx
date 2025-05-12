import { useState } from "react";
import clsx from "clsx";
import './Galery.css';
import PlayIcon from "./icons/PlayIcon.tsx";
import { Image } from "@unpic/react"


interface Resource {
  id: string;
  name: string;
  url: string;
  watermark: string;
  thumbnail: string;
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
    handlePlay(resource);
  };

  const handlePlay = (resource: Resource) => {
    const videos = document.querySelectorAll('video[data-role="video"]');
    videos.forEach((video) => {
      if (video instanceof HTMLVideoElement) {
        if (video.id !== resource.id) {
          video.pause();
        } else {
          video.play();
        }
      }
    });
  }

  return (
    <div className="relative w-full flex justify-center sm:justify-baseline gap-4">
      <div className="flex flex-col gap-4 w-full max-w-[calc(100vw-5rem)] lg:max-w-2xl xl:max-w-3xl">
        <div className="relative w-full aspect-video">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className={clsx(
                "absolute top-0 left-0 right-0 bottom-0 inset-0 flex items-center justify-center rounded-lg overflow-hidden",
                resource.id === prevSelected?.id && "fade-out",
                resource.id === selected.id && "fade-in"
              )}
              style={{
                opacity: resource.id === selected.id ? 1 : 0,
                pointerEvents: resource.id === selected.id ? 'auto' : 'none'
              }}>
              {resource.type === 'image' ? (
                <Image
                  key={resource.id}
                  data-role="image"
                  id={resource.id}
                  src={resource.watermark}
                  alt={resource.name}
                  width={1920}
                  height={1080}
                  className="object-cover aspect-video w-full"
                />
              ) : (
                <video
                  key={resource.id}
                  data-role="video"
                  id={resource.id}
                  src={resource.watermark}
                  className="object-cover aspect-video w-full"
                  controls
                  muted
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="relative flex-none aspect-video w-32 bg-gray-500/90 rounded-lg shadow-md overflow-hidden hover:ring-1 hover:ring-blue-500 transition-all duration-200 ease-in-out cursor-pointer"
              onClick={() => handleSelect(resource)}
            >
              <Image src={resource.thumbnail} alt={resource.name} width={128} height={72} />
              {resource.type === 'video' && (
                <span className="absolute  top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[var(--color-surface)] rounded-full p-2 shadow-md">
                  <PlayIcon className="fill-[var(--color-text)]"/>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

