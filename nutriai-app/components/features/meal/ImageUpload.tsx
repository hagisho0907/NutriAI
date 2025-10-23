import React, { useRef, useState, useCallback } from 'react';
import { Camera, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { processImage, validateImage, ProcessedImage } from '@/lib/utils/imageProcessing';
import { toast } from 'sonner';

interface ImageUploadProps {
  onImageSelect: (image: ProcessedImage) => void;
  onImageRemove?: () => void;
  selectedImage?: ProcessedImage | null;
  isProcessing?: boolean;
  uploadProgress?: number;
  isUploading?: boolean;
}

export function ImageUpload({
  onImageSelect,
  onImageRemove,
  selectedImage,
  isProcessing = false,
  uploadProgress = 0,
  isUploading = false
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImage(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    try {
      const processed = await processImage(file);
      onImageSelect(processed);
      toast.success(`画像を選択しました (${(processed.size / 1024).toFixed(1)}KB)`);
    } catch (error) {
      toast.error('画像の処理に失敗しました');
    }
  }, [onImageSelect]);

  const startCamera = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      toast.error('お使いの環境ではカメラが利用できません');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      streamRef.current = stream;
      setIsCapturing(true);
    } catch (error) {
      toast.error('カメラの起動に失敗しました');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  }, []);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], 'camera-capture.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now()
      });

      try {
        const processed = await processImage(file);
        onImageSelect(processed);
        stopCamera();
        toast.success('写真を撮影しました');
      } catch (error) {
        toast.error('画像の処理に失敗しました');
      }
    }, 'image/jpeg', 0.9);
  }, [onImageSelect, stopCamera]);

  React.useEffect(() => {
    if (isCapturing && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current
        .play()
        .catch(() => {
          // Safari iOS requires user interaction even though we are already inside one.
        });
    }
  }, [isCapturing]);

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  if (isCapturing) {
    return (
      <div className="space-y-4">
        <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white/90"
            onClick={stopCamera}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={capturePhoto}
            disabled={isProcessing}
            className="flex-1"
          >
            撮影する
          </Button>
          <Button
            variant="outline"
            onClick={stopCamera}
            className="flex-1"
          >
            キャンセル
          </Button>
        </div>
      </div>
    );
  }

  if (selectedImage) {
    return (
      <div className="space-y-4">
        <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={selectedImage.dataUrl}
            alt="選択された食事画像"
            className="w-full h-full object-cover"
          />
          {onImageRemove && !isUploading && !isProcessing && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white/90"
              onClick={onImageRemove}
            >
              <X className="w-5 h-5" />
            </Button>
          )}
          
          {/* Upload/Processing Overlay */}
          {(isUploading || isProcessing) && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-4 w-3/4 max-w-sm">
                <div className="flex items-center gap-3 mb-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">
                    {isUploading ? 'アップロード中...' : 'AI分析中...'}
                  </span>
                </div>
                {isUploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">
                      {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground text-center">
          {selectedImage.width} × {selectedImage.height} • {(selectedImage.size / 1024).toFixed(1)}KB
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="aspect-[4/3] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-2">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
          <p className="text-sm text-gray-600">食事の写真を選択してください</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          onClick={startCamera}
          disabled={isProcessing}
        >
          <Camera className="w-4 h-4 mr-2" />
          カメラで撮影
        </Button>
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          アルバムから選択
        </Button>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
