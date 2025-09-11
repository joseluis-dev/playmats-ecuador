import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useDropzone } from 'react-dropzone'
import { Image as ImageIcon, X } from 'lucide-react'
import { toast } from 'sonner'
import type { Resource } from '@/types'
import { CarouselSize } from '@/components/Carousel'

interface ImageUploaderProps {
  value: Resource[]
  onChange: (value: Resource[]) => void
  onUpload: (file: File) => Promise<Resource>
  onRemove: (item: Resource) => void
}

export const MultiImageUploader = ({
  value,
  onChange,
  onUpload,
  onRemove
}: ImageUploaderProps) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    try {
      const resource = await onUpload(file)
      onChange([...value, resource])
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
          border-2 border-dashed rounded-lg p-8
          flex flex-col items-center justify-center text-center
          cursor-pointer
          transition-colors bg-background
          ${isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted hover:border-muted-foreground/40'
          }
        `}
      >
        <input {...getInputProps()} />
        <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {isDragActive
            ? 'Suelta la imagen aquí'
            : 'Arrastra y suelta una imagen aquí, o haz clic para seleccionar'
          }
        </p>
      </div>

      <div className='max-w-[85%] mx-auto'>
        <CarouselSize items={value}>
          {(item, index) => (
            <div
              className="relative flex-none aspect-video bg-muted rounded-lg shadow-sm overflow-hidden transition-all duration-200 ease-in-out group"
              style={{ backgroundImage: `url(${item.url})`, backgroundSize: 'cover' }}
              onClick={() => {
                // addLayers('background', item);
              }}
            >
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow"
                onClick={(e) => {
                  onChange(value.filter(v => v !== item.id.toString()))
                  onRemove(item)
                  e.stopPropagation()
                  e.preventDefault()
                }}
              >
                <X className="w-4 h-4" />
              </Button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1.5">
                {item.name}
              </div>
            </div>
          )}
        </CarouselSize>
      </div>
    </div>
  )
}
