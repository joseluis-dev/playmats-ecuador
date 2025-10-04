import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useDropzone } from 'react-dropzone'
import { Image as ImageIcon, Video, X } from 'lucide-react'
import { toast } from 'sonner'
import type { Resource } from '@/types'
import { CarouselSize } from '@/components/Carousel'

interface ImageUploaderProps {
  value: Resource[]
  onChange: (value: Resource[]) => void
  onUpload: (files: File[]) => Promise<Resource[]>
  onRemove: (item: Resource) => void
  onSelect: (item: Resource) => void
}

export const MultiImageUploader = ({
  value,
  onChange,
  onUpload,
  onRemove,
  onSelect
}: ImageUploaderProps) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return

    try {
      const resources = await onUpload(acceptedFiles)
      onChange([...value, ...resources])
    } catch (error) {
      console.error('Error al subir la imagen:', error)
      toast.error('Error al subir la imagen')
    }
  }, [onUpload, onChange, value])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.gif', '.jpeg', '.jpg'],
      'video/*': ['.mp4', '.mov', '.avi', '.mkv']
    }
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
        <div className="flex items-center space-x-2 mb-2 gap-2">
          <ImageIcon className="w-8 h-8 text-muted-foreground m-0" /> <span className='text-muted-foreground m-0'>ó</span> <Video className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          {isDragActive
            ? 'Suelta los recursos aquí'
            : 'Arrastra y suelta los recursos aquí, o haz clic para seleccionar'
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
              <span className='absolute bottom-10 right-5 text-[var(--color-primary)] font-bold bg-[var(--color-surface)]/80 dark:bg-black/80 px-2 pt-1 rounded-t-md font-heading'>{item.isBanner ? 'Banner' : ''}</span>
              <div className="flex items-center justify-between absolute bottom-0 left-0 right-0 bg-[var(--color-surface)]/80 dark:bg-black/80 text-[var(--color-text)] text-xs p-1.5 h-10">
                <p className="truncate px-1">{item.name}</p>
                {!item.isBanner && <Button
                  variant="link"
                  type='button'
                  className='text-[var(--color-primary)] text-xs'
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    onSelect(item)
                  }}
                >
                  Seleccionar Banner
                </Button>}
              </div>
            </div>
          )}
        </CarouselSize>
      </div>
    </div>
  )
}
