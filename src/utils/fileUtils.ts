export async function dataUrlToFile(dataUrl: string, fileName = `resource-${Date.now()}.png`): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const type = blob.type || 'image/png';
  return new File([blob], fileName, { type });
}