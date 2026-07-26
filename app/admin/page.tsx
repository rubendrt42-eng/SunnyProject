import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { weekStartKey, isPast } from "@/lib/dates";
import type { Experience, Reservation } from "@/lib/database.types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard — Sunny Admin" };

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ data: experiences }, { data: reservations }] = await Promise.all([
    supabase.from("experiences").select("*"),
    supabase.from("reservations").select("*"),
  ]);

  const exps = (experiences ?? []) as Experience[];
  const res = (reservations ?? []) as Reservation[];

  const published = exps.filter((e) => e.status === "published");
  const upcoming = published.filter((e) => !isPast(e.starts_at));

  const activeCountByExperience = new Map<string, number>();
  for (const r of res) {
    if (["confirmed", "attended", "no_show"].includes(r.status)) {
      activeCountByExperience.set(r.experience_id, (activeCountByExperience.get(r.experience_id) ?? 0) + 1);
    }
  }

  const totalCapacity = published.reduce((sum, e) => sum + e.capacity, 0);
  const totalReserved = published.reduce((sum, e) => sum + (activeCountByExperience.get(e.id) ?? 0), 0);
  const occupancy = totalCapacity > 0 ? Math.round((totalReserved / totalCapacity) * 100) : 0;
  const availableSpots = Math.max(totalCapacity - totalReserved, 0);
  const soldOutCount = published.filter((e) => (activeCountByExperience.get(e.id) ?? 0) >= e.capacity).length;

  const week = weekStartKey();
  const weekReservations = res.filter((r) => r.week_start === week && r.status !== "cancelled").length;
  const noShows = res.filter((r) => r.status === "no_show").length;

  const sourceCounts = new Map<string, number>();
  for (const r of res) {
    const key = r.source || "sin origen";
    sourceCounts.set(key, (sourceCounts.get(key) ?? 0) + 1);
  }
  const sourceEntries = [...sourceCounts.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Experiencias publicadas" value={published.length} />
        <StatCard label="Experiencias próximas" value={upcoming.length} />
        <StatCard label="Total de reservaciones" value={res.length} />
        <StatCard label="Ocupación general" value={`${occupancy}%`} />
        <StatCard label="Cupos disponibles" value={availableSpots} />
        <StatCard label="Experiencias agotadas" value={soldOutCount} />
        <StatCard label="Reservaciones de la semana" value={weekReservations} />
        <StatCard label="No-shows" value={noShows} />
      </div>

      <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Reservaciones por origen (source)</h2>
        {sourceEntries.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">Aún no hay reservaciones.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {sourceEntries.map(([source, count]) => (
              <li key={source} className="flex items-center justify-between text-sm">
                <span className="text-neutral-700">{source}</span>
                <span className="font-medium">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
