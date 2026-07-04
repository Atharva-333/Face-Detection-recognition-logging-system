import { useEffect, useMemo, useState } from 'react';
import { cacheImageUrl, fetchDetections, fetchPersons } from '../api';
import type { AttendanceRow, Detection, PersonSummary } from '../types';
import { AttendanceTable } from '../components/AttendanceTable';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export function AttendancePage() {
  const [rows, setRows] = useState<Detection[]>([]);
  const [persons, setPersons] = useState<PersonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const [detectionData, personData] = await Promise.all([fetchDetections(), fetchPersons()]);
        if (!cancelled) {
          setRows(detectionData);
          setPersons(personData);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : 'Failed to load attendance.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const stats = useMemo(
    () => [
      { label: 'Total detections', value: rows.length },
      { label: 'Unique people', value: new Set(rows.map((row) => row.person_name)).size },
      { label: 'Latest confidence', value: rows[0] ? `${Math.round(rows[0].confidence)}%` : '—' },
    ],
    [rows]
  );

  const rowsWithImages = useMemo<AttendanceRow[]>(() => {
    const personById = new Map(persons.map((person) => [person.id, person]));

    return rows.map((row) => ({
      ...row,
      image_url: row.person_id ? personById.get(row.person_id)?.primary_image ?? null : null,
    }));
  }, [persons, rows]);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-sm uppercase tracking-[0.3em] text-primary/80">Live attendance</p>
            <h1 className="font-display text-4xl font-semibold text-text md:text-5xl">Face attendance dashboard</h1>
            <p className="mt-3 text-sm leading-6 text-secondary">
              Monitors the detections table and shows who has been recognized, when, and with what confidence.
            </p>
          </div>
          <Button className="bg-background text-text hover:bg-border" onClick={() => setRefreshKey((value) => value + 1)}>
            Refresh
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => (
          <Card key={item.label}>
            <p className="text-sm text-secondary">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold text-text">{item.value}</p>
          </Card>
        ))}
      </div>

      {error ? <Card>{error}</Card> : null}
      {loading ? <Card>Loading attendance...</Card> : <AttendanceTable rows={rowsWithImages} />}
    </div>
  );
}