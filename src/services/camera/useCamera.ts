import { useRef, useCallback } from 'react';

interface CameraOptions {
  facingMode?: 'user' | 'environment';
  width?: number;
  height?: number;
}

export const useCamera = (options: CameraOptions = {}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: options.facingMode || 'environment',
          width: { ideal: options.width || 1920 },
          height: { ideal: options.height || 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      return stream;
    } catch (error) {
      console.error('Camera access denied:', error);
      return null;
    }
  }, [options.facingMode, options.width, options.height]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const capturePhoto = useCallback((): Promise<File | null> => {
    const video = videoRef.current;
    if (!video) return Promise.resolve(null);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return Promise.resolve(null);

    ctx.drawImage(video, 0, 0);

    return new Promise<File | null>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
            resolve(file);
          } else {
            resolve(null);
          }
        },
        'image/jpeg',
        0.8
      );
    });
  }, []);

  return {
    videoRef,
    startCamera,
    stopCamera,
    capturePhoto,
  };
};

// Future: Image compression for upload
export const compressImage = async (file: File, maxWidth = 1200): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        0.8
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};