import { useMemo, useState } from 'react';
import type { PersonSummary } from '../types';
import { addFace, createPerson } from '../api';
import { Button } from './Button';
import { Card } from './Card';

export function PersonForms({ persons, onChanged }: { persons: PersonSummary[]; onChanged: () => void }) {
  const [personName, setPersonName] = useState('');
  const [newPersonImage, setNewPersonImage] = useState<File | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [extraImage, setExtraImage] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('');
  const [busy, setBusy] = useState<'create' | 'upload' | null>(null);

  const firstPersonId = useMemo(() => persons[0]?.id ?? '', [persons]);

  async function handleCreatePerson(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!personName.trim() || !newPersonImage) {
      setStatus('Add a name and a face image.');
      return;
    }

    setBusy('create');
    setStatus('');

    try {
      await createPerson(personName.trim(), newPersonImage);
      setPersonName('');
      setNewPersonImage(null);
      (event.currentTarget.reset as () => void)?.();
      setStatus('Person created.');
      onChanged();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to create person.');
    } finally {
      setBusy(null);
    }
  }

  async function handleAddFace(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const personId = selectedPersonId || firstPersonId;
    if (!personId || !extraImage) {
      setStatus('Pick a person and face image.');
      return;
    }

    setBusy('upload');
    setStatus('');

    try {
      await addFace(personId, extraImage);
      setExtraImage(null);
      (event.currentTarget.reset as () => void)?.();
      setStatus('Additional face added.');
      onChanged();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to add face.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-text">Add person</h2>
          <p className="text-sm text-secondary">Create a new identity with the first face image.</p>
        </div>

        <form className="grid gap-4" onSubmit={handleCreatePerson}>
          <input
            className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-text outline-none placeholder:text-secondary focus:border-primary"
            placeholder="Full name"
            value={personName}
            onChange={(event) => setPersonName(event.target.value)}
          />
          <input
            className="block w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-secondary file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
            type="file"
            accept="image/*"
            onChange={(event) => setNewPersonImage(event.target.files?.[0] ?? null)}
          />
          <Button className="bg-primary text-white hover:bg-primary/90" disabled={busy !== null} type="submit">
            {busy === 'create' ? 'Creating...' : 'Create person'}
          </Button>
        </form>
      </Card>

      <Card>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-text">Add more faces</h2>
          <p className="text-sm text-secondary">Attach extra samples to an existing person.</p>
        </div>

        <form className="grid gap-4" onSubmit={handleAddFace}>
          <select
            className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-text outline-none focus:border-primary"
            value={selectedPersonId}
            onChange={(event) => setSelectedPersonId(event.target.value)}
          >
            <option value="">Select a person</option>
            {persons.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
          <input
            className="block w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-secondary file:mr-4 file:rounded-lg file:border-0 file:bg-success file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
            type="file"
            accept="image/*"
            onChange={(event) => setExtraImage(event.target.files?.[0] ?? null)}
          />
          <Button className="bg-success text-white hover:bg-success/90" disabled={busy !== null} type="submit">
            {busy === 'upload' ? 'Uploading...' : 'Add face'}
          </Button>
        </form>
      </Card>

      {status ? <p className="lg:col-span-2 text-sm text-secondary">{status}</p> : null}
    </div>
  );
}