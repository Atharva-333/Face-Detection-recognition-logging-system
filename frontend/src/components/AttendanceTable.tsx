import { Image as ImageIcon } from 'lucide-react';
import type { AttendanceRow } from '../types';
import { cacheImageUrl } from '../api';
import { Card } from './Card';

function formatConfidence(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString();
}

function FacePreview({ imageUrl, name }: { imageUrl?: string | null; name: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-border bg-background">
        {imageUrl ? (
          <img alt={name} className="h-full w-full object-cover" loading="lazy" src={cacheImageUrl(imageUrl)} />
        ) : (
          <ImageIcon className="h-5 w-5 text-secondary" />
        )}
      </div>
      <div>
        <p className="font-medium text-text">{name}</p>
        <p className="text-xs text-secondary">Face snapshot</p>
      </div>
    </div>
  );
}

export function AttendanceTable({ rows }: { rows: AttendanceRow[] }) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-text">Attendance</h2>
          <p className="text-sm text-secondary">Latest detections from the backend</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="min-w-full divide-y divide-border text-left text-sm">
          <thead className="bg-background text-secondary">
            <tr>
              <th className="px-4 py-3 font-medium">Person</th>
              <th className="px-4 py-3 font-medium">Camera</th>
              <th className="px-4 py-3 font-medium">Detected At</th>
              <th className="px-4 py-3 font-medium">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card text-text">
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-secondary" colSpan={4}>
                  No detections yet
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={`${row.person_id ?? 'unknown'}-${row.detected_at ?? index}`} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    <FacePreview imageUrl={row.image_url} name={row.person_name} />
                  </td>
                  <td className="px-4 py-3 text-secondary">{row.camera_name ?? '—'}</td>
                  <td className="px-4 py-3 text-secondary">{row.detected_at ? formatTimestamp(row.detected_at) : '—'}</td>
                  <td className="px-4 py-3 text-secondary">{formatConfidence(row.confidence)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}