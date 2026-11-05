import { Minus, Plus } from 'lucide-react';
import { Button } from './Button';

interface Props {
  name: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
}

export function QuantityControl({ name, value, max, onChange }: Props) {
  return (
    <div
      className="quantity-control"
      role="group"
      aria-label={`Quantity for ${name}`}
    >
      <Button
        variant="ghost"
        aria-label={`Decrease quantity of ${name}`}
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus size={16} aria-hidden="true" />
      </Button>
      <output aria-label={`Quantity of ${name}`}>{value}</output>
      <Button
        variant="ghost"
        aria-label={`Increase quantity of ${name}`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus size={16} aria-hidden="true" />
      </Button>
    </div>
  );
}
