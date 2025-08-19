
import { Input } from "@/components/ui/input"
import { Image } from "@unpic/react"
import { Upload, X } from "lucide-react"
import { useRef, useState } from "react"
import { z } from "zod"
import type { ControllerRenderProps } from "react-hook-form"


type AllowedTypes = 'image' | 'video' | 'both';

interface ImageUploaderProps {
  field: ControllerRenderProps<any, string>;
  validator?: z.ZodType<any>;
  allowedTypes?: AllowedTypes;
  accept?: string;
  maxSize?: number;
  placeholderText?: {
    main?: string;
    sub?: string;
    formats?: string;
  };
  className?: string;
}


export const ImageUploader = ({
  field,
  validator,
  allowedTypes = 'image',
  accept,
  maxSize = 5 * 1024 * 1024, // 5MB default
  placeholderText,
  className = ""
}: ImageUploaderProps) => {
  const [url, setUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);

  // Determine accept and placeholder by allowedTypes if not provided
  const computedAccept = accept ||
    (allowedTypes === 'image' ? 'image/*'
      : allowedTypes === 'video' ? 'video/*'
      : 'image/*,video/*');
  const computedPlaceholder = {
    main: placeholderText?.main ||
      (allowedTypes === 'image' ? 'Arrastra y suelta tu imagen aquí'
        : allowedTypes === 'video' ? 'Arrastra y suelta tu video aquí'
        : 'Arrastra y suelta tu archivo aquí'),
    sub: placeholderText?.sub || 'o haz clic para seleccionar un archivo',
    formats: placeholderText?.formats ||
      (allowedTypes === 'image' ? 'Formatos soportados: JPG, PNG (máx. 5MB)'
        : allowedTypes === 'video' ? 'Formatos soportados: MP4, WEBM (máx. 20MB)'
        : 'Formatos soportados: JPG, PNG, MP4, WEBM (máx. 20MB)'),
  };


  const validateFile = (file: File): boolean => {
    if (validator) {
      const result = validator.safeParse(file);
      return result.success;
    }
    // Default validation if no validator provided
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (allowedTypes === 'image') return isImage && file.size <= maxSize;
    if (allowedTypes === 'video') return isVideo && file.size <= (maxSize); // e.g. 20MB for video
    return (isImage && file.size <= maxSize) || (isVideo && file.size <= (maxSize));
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    field.onChange(file);
    if (file && validateFile(file)) {
      const objectUrl = URL.createObjectURL(file);
      setUrl(objectUrl);
      setFileType(file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null);
    } else {
      setUrl(null);
      setFileType(null);
    }
  };


  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    field.onChange(file);
    if (file && validateFile(file)) {
      const objectUrl = URL.createObjectURL(file);
      setUrl(objectUrl);
      setFileType(file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null);
    } else {
      setUrl(null);
      setFileType(null);
    }
  };


  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    inputFileRef.current?.click();
  };


  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };


  const handleRemoveFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setUrl(null);
    setFileType(null);
    field.onChange(undefined);
    if (inputFileRef.current) {
      inputFileRef.current.value = "";
    }
  };


  return (
    <div
      className={`border-1 border-dashed border-[var(--color-text)] rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/80 dark:hover:border-blue-400 transition-all duration-200 ease-in-out h-96 ${className}`}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      tabIndex={0}
      role="button"
      aria-label={computedPlaceholder.main}
    >
      {url ? (
        <div className="relative w-full h-full flex items-center justify-center">
          <button
            type="button"
            className="absolute top-2 right-2 bg-[var(--color-primary)]/80 p-2 rounded-full hover:bg-[var(--color-primary)]/100 transition-all duration-200 ease-in-out cursor-pointer z-40"
            onClick={handleRemoveFile}
            aria-label="Eliminar archivo"
          >
            <X width={16} height={16} />
          </button>
          {fileType === 'image' && (
            <Image
              src={url}
              alt="Vista previa"
              width={100}
              height={300}
              className="w-full h-full object-contain rounded-md"
            />
          )}
          {fileType === 'video' && (
            <video
              src={url}
              controls
              className="w-full h-full object-contain rounded-md"
              aria-label="Vista previa de video"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      ) : (
        <>
          <span className="bg-[var(--color-surface)] p-2 rounded-full mb-4">
            <Upload />
          </span>
          <p className="mb-1">{computedPlaceholder.main}</p>
          <p className="text-sm text-[var(--color-text)]/70 mb-1">
            {computedPlaceholder.sub}
          </p>
          <p className="text-sm text-[var(--color-text)]/70 mb-1">
            {computedPlaceholder.formats}
          </p>
        </>
      )}
      <Input
        type="file"
        accept={computedAccept}
        className="hidden"
        onChange={handleChange}
        onBlur={field.onBlur}
        name={field.name}
        ref={inputFileRef}
      />
    </div>
  );
}
