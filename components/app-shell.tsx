'use client'

import { useState } from 'react'
import { CalendarRange, Droplets, ShieldPlus, Users, Waves } from 'lucide-react'
import { MigranSection } from './migran/migran-section'
import { SediaanSection } from './sediaan/sediaan-section'
import { VektorSection } from './vektor/vektor-section'
import { RekapSection } from './rekap/rekap-section'
import { cn } from '@/lib/utils'

const MENU = [
  { id: 'migran', label: 'Survei Migran', short: 'Migran', icon: Users },
  { id: 'sediaan', label: 'Sediaan Darah', short: 'Sediaan', icon: Droplets },
  { id: 'vektor', label: 'Vektor Lagoon', short: 'Vektor', icon: Waves },
  { id: 'rekap', label: 'Rekap Bulanan', short: 'Rekap', icon: CalendarRange },
] as const

type MenuId = (typeof MENU)[number]['id']

export function AppShell() {
  const [active, setActive] = useState<MenuId>('migran')
  const current = MENU.find((m) => m.id === active)!

  const go = (id: MenuId) => {
    setActive(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-gradient-to-b from-sky-50 via-white to-sky-50/60">
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 right-[-10%] size-[480px] rounded-full bg-sky-200/50 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute top-[40%] left-[-15%] size-[420px] rounded-full bg-cyan-100/60 blur-3xl" />

      <header className="relative z-20 md:sticky md:top-0">
        <div className="glass mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-b-3xl px-4 py-3 md:rounded-b-2xl md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-sky-700 text-white shadow-lg shadow-sky-500/30">
              <ShieldPlus className="size-5" aria-hidden="true" />
            </div>
            <div className="leading-tight">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-sky-600">Surveilans</p>
              <h1 className="text-sm font-bold text-foreground md:text-base">Migrasi Malaria</h1>
            </div>
          </div>

          <nav aria-label="Menu utama" className="hidden md:block">
            <ul className="flex gap-1 rounded-2xl bg-sky-50/80 p-1">
              {MENU.map(({ id, label, icon: Icon }) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => go(id)}
                    aria-current={active === id ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition',
                      active === id ? 'bg-white text-sky-700 shadow-md shadow-sky-500/10' : 'text-sky-900/60 hover:text-sky-700',
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200 md:hidden">
            Offline
          </span>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pt-5 pb-28 md:px-6 md:pb-12">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-600">{`Menu ${MENU.indexOf(current) + 1} dari 4`}</p>
          <h2 className="text-2xl font-bold text-foreground text-balance md:text-3xl">{current.label}</h2>
        </div>

        {active === 'migran' && <MigranSection />}
        {active === 'sediaan' && <SediaanSection />}
        {active === 'vektor' && <VektorSection />}
        {active === 'rekap' && <RekapSection />}
      </main>

      <nav
        aria-label="Menu utama"
        className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
      >
        <ul className="glass grid grid-cols-4 gap-1 rounded-2xl p-1.5">
          {MENU.map(({ id, short, icon: Icon }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => go(id)}
                aria-current={active === id ? 'page' : undefined}
                className={cn(
                  'flex w-full flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold transition',
                  active === id ? 'bg-gradient-to-b from-sky-500 to-sky-600 text-white shadow-md shadow-sky-500/30' : 'text-sky-900/60',
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {short}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
