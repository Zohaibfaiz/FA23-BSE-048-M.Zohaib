import { ReactNode } from 'react';

export function MetricCard(props: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="surface-card rounded-[1.85rem] p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{props.label}</p>
        {props.icon}
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-semibold tracking-tight text-slate-950">{props.value}</p>
        {props.hint ? <p className="text-sm text-slate-500">{props.hint}</p> : null}
      </div>
    </div>
  );
}
