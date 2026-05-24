import { Suspense } from 'react';
import DashboardView from './DashboardView';

export const metadata = { title: 'Dashboard — DefenderMate' };

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardView />
    </Suspense>
  );
}
