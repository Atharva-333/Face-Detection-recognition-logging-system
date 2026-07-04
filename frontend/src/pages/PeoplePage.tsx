import { useEffect, useState } from 'react';
import { cacheImageUrl, fetchPerson, fetchPersons } from '../api';
import type { PersonDetails, PersonSummary } from '../types';
import { PersonForms } from '../components/PersonForms';
import { Card } from '../components/Card';
import { StatusPill } from '../components/StatusPill';
import { FaceGalleryModal } from '../components/FaceGalleryModal';

function FacesButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
      onClick={onClick}
      type="button"
    >
      <StatusPill tone={count > 0 ? 'success' : 'warn'}>{`${count} faces`}</StatusPill>
    </button>
  );
}

export function PeoplePage() {
  const [persons, setPersons] = useState<PersonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryError, setGalleryError] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<PersonDetails | null>(null);

  async function load() {
    setLoading(true);
    setError('');

    try {
      setPersons(await fetchPersons());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to load people.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function openFaces(person: PersonSummary) {
    setGalleryOpen(true);
    setGalleryLoading(true);
    setGalleryError('');
    setSelectedPerson(null);

    try {
      setSelectedPerson(await fetchPerson(person.id));
    } catch (requestError) {
      setGalleryError(requestError instanceof Error ? requestError.message : 'Failed to load faces.');
    } finally {
      setGalleryLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.3em] text-success/80">Dataset manager</p>
            <h1 className="font-display text-4xl font-semibold text-text md:text-5xl">Manage persons and face samples</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-secondary">
              Add a new identity or extend an existing one with more images to improve recognition quality.
            </p>
          </div>
          <StatusPill tone={persons.length > 0 ? 'success' : 'warn'}>
            {persons.length > 0 ? `${persons.length} people loaded` : 'No people yet'}
          </StatusPill>
        </div>
      </Card>

      {error ? <Card>{error}</Card> : null}
      {loading ? <Card>Loading people...</Card> : <PersonForms persons={persons} onChanged={load} />}

      <Card>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-text">People registry</h2>
          <p className="text-sm text-secondary">Summary of stored identities and training images.</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {persons.map((person) => (
            <div key={person.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-border bg-card">
                    {person.primary_image ? (
                      <img
                        alt={person.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        src={cacheImageUrl(person.primary_image)}
                      />
                    ) : (
                      <span className="text-sm font-semibold text-secondary">{person.name.slice(0, 1).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text">{person.name}</h3>
                  <p className="text-xs text-secondary">ID: {person.id}</p>
                  </div>
                </div>
                <FacesButton count={person.total_images} onClick={() => void openFaces(person)} />
              </div>
              <div className="mt-4 grid gap-2 text-sm text-secondary">
                <p>Appearances: {person.appearance_count}</p>
                <p>Last seen: {person.last_seen ?? 'Never'}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <FaceGalleryModal
        error={galleryError}
        images={selectedPerson?.images ?? []}
        loading={galleryLoading}
        open={galleryOpen}
        title={selectedPerson?.person.name ?? 'Person faces'}
        onClose={() => setGalleryOpen(false)}
      />
    </div>
  );
}