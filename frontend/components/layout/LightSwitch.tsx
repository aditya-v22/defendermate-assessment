import { Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LightSwitch() {
  return (
    <Button variant="ghost" size="icon" aria-label="Toggle theme">
      <Sun className="h-4 w-4" />
    </Button>
  );
}
