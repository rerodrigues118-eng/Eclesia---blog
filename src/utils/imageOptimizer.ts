/**
 * In-browser Image Optimizer & Converter to WebP.
 * Automatically converts PNG, JPG, JPEG, BMP or GIF to lightweight WebP.
 * Downscales images proportionally if larger than maxWidth/maxHeight to prevent lag/memory exhaustion.
 */
export async function convertFileToWebP(
  file: File,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('O arquivo selecionado não é uma imagem válida.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erro ao ler arquivo de imagem.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Erro ao carregar imagem para conversão.'));
      img.onload = () => {
        try {
          let { width, height } = img;

          // Proportional downscale if exceeding maximum dimensions
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.max(1, Math.round(width * ratio));
            height = Math.max(1, Math.round(height * ratio));
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve(e.target?.result as string);
          }

          // High quality image rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to WebP format
          const webpDataUrl = canvas.toDataURL('image/webp', quality);

          resolve(webpDataUrl);
        } catch (err) {
          // Fallback to original read result if canvas security/cors fails
          resolve(e.target?.result as string);
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
