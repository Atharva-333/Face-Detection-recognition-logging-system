import { X, Image as ImageIcon } from 'lucide-react';
import { cacheImageUrl } from '../api';
import { Button } from './Button';
import { Card } from './Card';
import type { PersonImage } from '../types';

type FaceGalleryModalProps = {
  open: boolean;
  title: string;
  images: PersonImage[];
  loading?: boolean;
  error?: string;
  onClose: () => void;
};

export function FaceGalleryModal({ open, title, images, loading, error, onClose }: FaceGalleryModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm">
      <Card>
        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary/80">Face gallery</p>
            <h3 className="mt-1 font-display text-2xl font-semibold text-text">{title}</h3>
          </div>
          <Button className="bg-background text-text hover:bg-border" onClick={onClose} type="button">
            <X size={16} />
            Close
          </Button>
        </div>

        <div className="mt-4 min-w-[min(92vw,900px)]">
          {loading ? (
            <p className="text-sm text-secondary">Loading faces...</p>
          ) : error ? (
            <p className="text-sm text-error">{error}</p>
          ) : images.length === 0 ? (
            <p className="text-sm text-secondary">No faces available.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {images.map((image) => (
                <figure key={`${image.image_number}-${image.image_path}`} className="rounded-2xl border border-border bg-background p-3">
                  <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border bg-card">
                    {image.image_path ? (
                      <img
                        alt={`${title} face ${image.image_number}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        src={cacheImageUrl(image.image_path)}
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-secondary" />
                    )}
                  </div>
                  <figcaption className="mt-2 text-xs text-secondary">Face {image.image_number}</figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}