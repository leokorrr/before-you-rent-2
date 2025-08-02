import React from 'react';
import { RadioGroup, Radio } from '@headlessui/react';
import { TRadiusOptionsProps } from './types';

const toMiles = (km: number) => (km * 0.621371).toFixed(1);

const OPTIONS: { key: 1 | 5; label: string }[] = [
  { key: 1, label: `1 km (${toMiles(1)} mi)` },
  { key: 5, label: `5 km (${toMiles(5)} mi)` },
  { key: 10, label: `10 km (${toMiles(10)} mi)` },
];

export const RadiusOptions: React.FC<TRadiusOptionsProps> = ({
  value,
  onChange,
  className,
}) => {
  return (
    <RadioGroup value={value} onChange={onChange} className={className}>
      <div className="flex flex-col md:flex-row gap-4">
        {OPTIONS.map(({ key, label }) => (
          <Radio
            key={key}
            value={key}
            className="group inline-flex items-center gap-3 cursor-pointer"
          >
            {/* Outer circle */}
            <span
              className="size-6 rounded-full p-1 ring-1 ring-white/15 ring-inset
                         bg-[#0a0a0a]
                         data-checked:bg-white
                         data-focus:outline data-focus:outline-offset-2 data-focus:outline-white"
              aria-hidden="true"
            >
              {/* Inner dot (visible when checked) */}
              <span className="hidden size-full rounded-full bg-[#ededed] group-data-checked:block" />
            </span>

            <span className="text-sm text-[#ededed] select-none">{label}</span>
          </Radio>
        ))}
      </div>
    </RadioGroup>
  );
};
