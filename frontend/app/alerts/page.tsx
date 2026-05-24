import { Suspense } from 'react';
import AlertsView from './AlertsView';

export const metadata = { title: 'Alerts — DefenderMate' };

export default function AlertsPage() {
  return (
    <Suspense>
      <AlertsView />
    </Suspense>
  );
}
