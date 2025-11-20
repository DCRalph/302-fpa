"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
} from "~/components/ui/dialog";
import Image from "next/image";
import { X } from "lucide-react";

interface ImageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  alt?: string;
}

export default function ImageModal({
  open,
  onOpenChange,
  imageUrl,
  alt = "Image",
}: ImageModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[80vw]! max-h-[80vh]! p-0 bg-black/95 border-none">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white p-4">
            {alt}
          </DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-50 rounded-full bg-black/50 hover:bg-black/70 p-2 text-white transition-colors"
            aria-label="Close image"
          >
            <X className="h-6 w-6" />
          </button>
        </DialogHeader>
        <div className="relative w-[80vw] h-[60vh] flex items-center justify-center">

          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={imageUrl}
              alt={alt}
              fill
              className="object-contain"
              sizes="95vw"
              quality={100}
              priority
            />
          </div>
        </div>
      </DialogContent>
    </Dialog >
  );
}

