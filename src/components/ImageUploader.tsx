import { Input } from "@/components/ui/input"
import { Image } from "@unpic/react"
import { Upload, X } from "lucide-react"
import { useRef, useState } from "react"
import { z } from "zod"
import type { ControllerRenderProps } from "react-hook-form"

interface ImageUploaderProps {
  field: ControllerRenderProps<any, string>
  validator?: z.ZodType<any>
  accept?: string
  maxSize?: number
  placeholderText?: {
    main?: string
    sub?: string
    formats?: string
  }
  className?: string
}

export const ImageUploader = ({
  field,
  validator,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  placeholderText = {
    main: "Arrastra y suelta tu imagen aquí",
    sub: "o haz clic para seleccionar un archivo",
    formats: "Formatos soportados: JPG, PNG (máx. 5MB)"
  },
  className = ""
}: ImageUploaderProps) => {
  const [url, setUrl] = useState<string | null>(null)
  const inputFileRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    if (validator) {
      const result = validator.safeParse(file)
      return result.success
    }
    
    // Default validation if no validator provided
    return file.size <= maxSize && file.type.startsWith("image/")
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    field.onChange(file)

    if (file && validateFile(file)) {
      const objectUrl = URL.createObjectURL(file)
      setUrl(objectUrl)
    } else {
      setUrl(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files[0]
    field.onChange(file)

    if (file && validateFile(file)) {
      const objectUrl = URL.createObjectURL(file)
      setUrl(objectUrl)
    } else {
      setUrl(null)
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    inputFileRef.current?.click()
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setUrl(null)
    field.onChange(undefined)
    if (inputFileRef.current) {
      inputFileRef.current.value = ""
    }
  }

  return (
    <div
      className={`border-1 border-dashed border-[var(--color-text)] rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/80 dark:hover:border-blue-400 transition-all duration-200 ease-in-out h-96 ${className}`}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {url ? (
        <picture className="relative w-full h-full">
          <button
            type="button"
            className="absolute top-2 right-2 bg-[var(--color-primary)]/80 p-2 rounded-full hover:bg-[var(--color-primary)]/100 transition-all duration-200 ease-in-out cursor-pointer"
            onClick={handleRemoveImage}
          >
            <X width={16} height={16} />
          </button>
          <Image
            src={url}
            alt="Preview"
            width={100}
            height={300}
            className="w-full h-full object-contain rounded-md"
          />
        </picture>
      ) : (
        <>
          <span className="bg-[var(--color-surface)] p-2 rounded-full mb-4">
            <Upload />
          </span>
          <p className="mb-1">{placeholderText.main}</p>
          <p className="text-sm text-[var(--color-text)]/70 mb-1">
            {placeholderText.sub}
          </p>
          <p className="text-sm text-[var(--color-text)]/70 mb-1">
            {placeholderText.formats}
          </p>
        </>
      )}
      <Input
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
        onBlur={field.onBlur}
        name={field.name}
        ref={inputFileRef}
      />
    </div>
  )
}
