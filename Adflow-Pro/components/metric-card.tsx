import { ReactNode } from 'react';

export function MetricCard(props: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur">
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
