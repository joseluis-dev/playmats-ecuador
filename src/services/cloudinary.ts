interface CloudinaryResponse {
  secure_url: string
  public_id: string
}

export const uploadToCloudinary = async (file: File, folder: string = 'playmats'): Promise<CloudinaryResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'playmats_unsigned') // Necesitas configurar este preset en Cloudinary
  formData.append('folder', folder)

  const response = await fetch('https://api.cloudinary.com/v1_1/your-cloud-name/image/upload', {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new Error('Error al subir la imagen')
  }

  const data = await response.json()
  return {
    secure_url: data.secure_url,
    public_id: data.public_id
  }
}
