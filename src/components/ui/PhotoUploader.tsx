import { useRef, type ChangeEvent } from 'react';

interface PhotoUploaderProps {
  onPhotoCapture: (file: File) => void;
  multiple?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const PhotoUploader = ({ onPhotoCapture, multiple = false, className = '', children }: PhotoUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        onPhotoCapture(file);
      }
    });

    // Reset so the same file can be selected again
    e.target.value = '';
  };

  return (
    <>
      {/* Intentionally no `capture` attribute: the OS-native picker then lets the
          user choose between the camera and Gallery/Files instead of forcing the
          camera to launch directly (especially on mobile). */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
      <div onClick={handleClick} className={`cursor-pointer ${className}`}>
        {children || (
          <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 transition-colors">
            <span className="text-2xl mb-1">📸</span>
            <span className="text-sm text-gray-500">Take a photo</span>
          </div>
        )}
      </div>
    </>
  );
};