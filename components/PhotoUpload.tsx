import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from './Button';

interface PhotoUploadProps {
  onPhotoSelect: (base64: string) => void;
  label: string;
  icon?: 'camera' | 'upload';
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotoSelect, label, icon = 'camera' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      
      // Use setTimeout to allow UI to update (show loading spinner) before heavy processing
      setTimeout(() => {
          const reader = new FileReader();
          
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              try {
                  // Compress logic
                  const canvas = document.createElement('canvas');
                  const MAX_WIDTH = 800;
                  const MAX_HEIGHT = 800;
                  let width = img.width;
                  let height = img.height;

                  // Resize while maintaining aspect ratio
                  if (width > height) {
                    if (width > MAX_WIDTH) {
                      height *= MAX_WIDTH / width;
                      width = MAX_WIDTH;
                    }
                  } else {
                    if (height > MAX_HEIGHT) {
                      width *= MAX_HEIGHT / height;
                      height = MAX_HEIGHT;
                    }
                  }

                  canvas.width = width;
                  canvas.height = height;
                  
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    // Convert to base64 with JPEG compression (0.7 quality)
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    onPhotoSelect(dataUrl);
                  }
              } catch (err) {
                  console.error("Compression error", err);
                  alert("画像の処理に失敗しました。");
              } finally {
                  setIsProcessing(false);
                  // Reset input value so same file can be selected again if needed
                  if (fileInputRef.current) fileInputRef.current.value = '';
              }
            };
            
            img.onerror = () => {
                console.error("Failed to load image");
                setIsProcessing(false);
                alert("無効な画像ファイルです。");
            }

            if (event.target?.result) {
                img.src = event.target.result as string;
            }
          };
          
          reader.onerror = () => {
              console.error("FileReader error");
              setIsProcessing(false);
          }
          
          reader.readAsDataURL(file);
      }, 50);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <input
        type="file"
        accept="image/*"
        capture={icon === 'camera' ? "environment" : undefined}
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <Button 
        type="button" 
        variant="secondary" 
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className="w-full flex gap-2 justify-center"
        disabled={isProcessing}
      >
        {isProcessing ? (
           <Loader2 size={18} className="animate-spin" />
        ) : (
           icon === 'camera' ? <Camera size={18} /> : <ImageIcon size={18} />
        )}
        {isProcessing ? '処理中...' : label}
      </Button>
    </div>
  );
};