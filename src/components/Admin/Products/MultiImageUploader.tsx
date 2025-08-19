import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useDropzone } from 'react-dropzone'
import { Image as ImageIcon, X } from 'lucide-react'
import { toast } from 'sonner'
import type { Resource } from '@/types'
import { CarouselSize } from '@/components/Carousel'

interface ImageUploaderProps {
  value: string[]
  onChange: (value: string[]) => void
  resources: Resource[]
  onUpload: (file: File) => Promise<string>
  onRemove: (id: string) => void
}

export const MultiImageUploader = ({
  value,
  onChange,
  resources,
  onUpload,
  onRemove
}: ImageUploaderProps) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    try {
      const resourceId = await onUpload(file)
      onChange([...value, resourceId])
    } catch (error) {
      console.error('Error al subir la imagen:', error)
      toast.error('Error al subir la imagen')
    }
  }, [onUpload, onChange, value])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.gif', '.jpeg', '.jpg']
    },
    maxFiles: 1
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6
          flex flex-col items-center justify-center
          cursor-pointer
          transition-colors
          ${isDragActive
            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
            : 'border-[var(--color-text)]/20 hover:border-[var(--color-text)]/40'
          }
        `}
      >
        <input {...getInputProps()} />
        <ImageIcon className="w-8 h-8 mb-2 text-[var(--color-text)]/60" />
        <p className="text-sm text-center text-[var(--color-text)]/60">
          {isDragActive
            ? 'Suelta la imagen aquí'
            : 'Arrastra y suelta una imagen aquí, o haz clic para seleccionar'
          }
        </p>
      </div>

      <div className='max-w-[85%] mx-auto'>
        <CarouselSize items={resources}>
          {(item, index) => (
            <div
              className="relative flex-none aspect-video bg-gray-500/90 rounded-lg shadow-md overflow-hidden transition-all duration-200 ease-in-out group"
              style={{ backgroundImage: `url(${item.url})`, backgroundSize: 'cover' }}
              onClick={() => {
                // addLayers('background', item);
              }}
            >
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-50"
                onClick={(e) => {
                  onChange(value.filter(v => v !== item.id.toString()))
                  onRemove(item.id.toString())
                  e.stopPropagation()
                  e.preventDefault()
                }}
              >
                <X className="w-4 h-4" />
              </Button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-sm p-1">
                {item.name}
              </div>
            </div>
          )}
        </CarouselSize>
      </div>
    </div>
  )
}
