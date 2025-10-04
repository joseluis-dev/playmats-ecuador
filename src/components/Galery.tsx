import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import './Galery.css';
import PlayIcon from "./icons/PlayIcon.tsx";
import ArrowLeftIcon from "./icons/ArrowLeftIcon.tsx";
import ArrowRightIcon from "./icons/ArrowRightIcon.tsx";
import { Image } from "@unpic/react"
import type { Resource } from "@/types/index.ts";

interface GaleryProps {
  resources: Resource[];
}

export const Galery = ({ resources = [] }: GaleryProps) => {
  const [selected, setSelected] = useState<Resource>(resources.find(r => r.isBanner) || resources[0]);
  const [prevSelected, setPrevSelected] = useState<Resource | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Check scroll position to show/hide navigation buttons
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Initialize scroll position check
  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      const resizeObserver = new ResizeObserver(checkScrollPosition);
      resizeObserver.observe(container);
      
      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
        resizeObserver.disconnect();
      };
    }
  }, [resources]);

  // Scroll navigation functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = 144; // Width of one item (128px) + gap (16px)
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = 144; // Width of one item (128px) + gap (16px)
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

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
                "absolute top-0 left-0 right-0 bottom-0 inset-0 flex items-center justify-center rounded-lg overflow-hidden bg-[var(--color-surface)]/70",
                resource.id === prevSelected?.id && "fade-out",
                resource.id === selected.id && "fade-in"
              )}
              style={{
                opacity: resource.id === selected.id ? 1 : 0,
                pointerEvents: resource.id === selected.id ? 'auto' : 'none'
              }}>
              {resource.type === 'IMAGE' ? (
                <img
                  key={resource.id}
                  data-role="image"
                  id={resource.id as string}
                  src={resource.url as string}
                  alt={resource.name}
                  width={1920}
                  height={1080}
                  className={`${resource.categories?.find(cat => cat.name.toLocaleLowerCase().includes('sello')) ? '!object-contain bg-no-repeat' : 'object-cover'} object-center aspect-video w-full`}
                />
              ) : (
                <video
                  key={resource.id}
                  data-role="video"
                  id={resource.id as string}
                  src={resource.url as string}
                  className="object-cover aspect-video w-full"
                  controls
                  muted
                />
              )}
            </div>
          ))}
        </div>
        <div className="relative">
          {/* Left Navigation Button */}
          {canScrollLeft && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[var(--color-surface)]/90 hover:bg-[var(--color-surface)] text-[var(--color-text)] rounded-full p-2 shadow-lg transition-all duration-200 ease-in-out hover:scale-105"
              aria-label="Scroll left"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
          )}
          
          {/* Right Navigation Button */}
          {canScrollRight && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[var(--color-surface)]/90 hover:bg-[var(--color-surface)] text-[var(--color-text)] rounded-full p-2 shadow-lg transition-all duration-200 ease-in-out hover:scale-105"
              aria-label="Scroll right"
            >
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          )}
          
          {/* Scrollable Container */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="relative flex-none aspect-video w-32 bg-gray-500/90 rounded-lg shadow-md overflow-hidden hover:ring-1 hover:ring-blue-500 transition-all duration-200 ease-in-out cursor-pointer"
                onClick={() => handleSelect(resource)}
              >
                {resource.type === 'IMAGE' ? (
                  <Image src={resource.thumbnail ?? resource.url as string} alt={resource.name} width={128} height={72} className={`${resource.categories?.find(cat => cat.name.toLocaleLowerCase().includes('sello')) ? 'object-contain bg-no-repeat' : 'object-cover'} object-center aspect-video w-full`} />
                ) : (
                  <video
                    src={resource.url}
                    className="object-cover rounded-md border"
                    controls={false}
                    muted
                    preload="metadata"
                  />
                )}
                {resource.type === 'VIDEO' && (
                  <span className="absolute  top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[var(--color-surface)] rounded-full p-2 shadow-md">
                    <PlayIcon className="fill-[var(--color-text)]"/>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

