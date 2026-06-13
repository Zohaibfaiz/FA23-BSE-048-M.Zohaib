import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const DAYS = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

const SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

const defaultSchedule = () =>
  DAYS.map((d) => ({
    day: d.key,
    startTime: '09:00',
    endTime: '17:00',
    isActive: !['sat', 'sun'].includes(d.key),
    blockedSlots: [],
  }));

const scheduleFromClinic = (clinic) => {
  if (!clinic?.schedule?.length) return defaultSchedule();

  return DAYS.map((d) => {
    const existing = clinic.schedule.find((s) => s.day === d.key);
    return existing || { day: d.key, startTime: '09:00', endTime: '17:00', isActive: false, blockedSlots: [] };
  });
};

export const ScheduleBuilder = ({ clinic, onSave, saving }) => {
  const initialSchedule = useMemo(() => scheduleFromClinic(clinic), [clinic]);
  const [schedule, setSchedule] = useState(initialSchedule);
  const [dragging, setDragging] = useState(null);

  useEffect(() => {
    queueMicrotask(() => setSchedule(initialSchedule));
  }, [initialSchedule]);

  const toggleSlot = (dayKey, slot, forceBlock) => {
    setSchedule((prev) =>
      prev.map((day) => {
        if (day.day !== dayKey) return day;
        const blocked = new Set(day.blockedSlots || []);
        const isBlocked = blocked.has(slot);
        if (forceBlock === true) blocked.add(slot);
        else if (forceBlock === false) blocked.delete(slot);
        else if (isBlocked) blocked.delete(slot);
        else blocked.add(slot);
        return { ...day, blockedSlots: [...blocked], isActive: true };
      })
    );
  };

  const handleMouseDown = (dayKey, slot) => {
    const day = schedule.find((d) => d.day === dayKey);
    const willBlock = !(day?.blockedSlots || []).includes(slot);
    setDragging({ dayKey, block: willBlock });
    toggleSlot(dayKey, slot, willBlock);
  };

  const handleMouseEnter = (dayKey, slot) => {
    if (dragging) toggleSlot(dayKey, slot, dragging.block);
  };

  useEffect(() => {
    const up = () => setDragging(null);
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, []);

  const toggleDay = (dayKey) => {
    setSchedule((prev) =>
      prev.map((d) => (d.day === dayKey ? { ...d, isActive: !d.isActive } : d))
    );
  };

  const handleSave = () => {
    if (!clinic) {
      toast.error('Select a clinic first');
      return;
    }
    onSave(schedule);
  };

  if (!clinic) {
    return <p className="text-white/50 text-sm">Select a clinic to edit schedule.</p>;
  }

  return (
    <div className="space-y-4" onMouseLeave={() => setDragging(null)}>
      <p className="text-sm text-white/50">
        Click or drag across slots to block/unblock. Toggle day headers to enable/disable entire days.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="p-2 text-left text-white/50">Time</th>
              {DAYS.map((d) => {
                const dayData = schedule.find((s) => s.day === d.key);
                return (
                  <th key={d.key} className="p-2">
                    <button
                      type="button"
                      onClick={() => toggleDay(d.key)}
                      className={`w-full rounded-lg py-1.5 font-medium transition ${
                        dayData?.isActive ? 'bg-success/20 text-success' : 'bg-white/10 text-white/40'
                      }`}
                    >
                      {d.label}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {SLOTS.map((slot) => (
              <tr key={slot}>
                <td className="p-2 text-white/50">{slot}</td>
                {DAYS.map((d) => {
                  const dayData = schedule.find((s) => s.day === d.key);
                  const inactive = !dayData?.isActive;
                  const blocked = (dayData?.blockedSlots || []).includes(slot);
                  return (
                    <td key={d.key} className="p-1">
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        disabled={inactive}
                        onMouseDown={() => !inactive && handleMouseDown(d.key, slot)}
                        onMouseEnter={() => !inactive && handleMouseEnter(d.key, slot)}
                        className={`h-9 w-full rounded-lg transition select-none ${
                          inactive
                            ? 'bg-white/5 cursor-not-allowed'
                            : blocked
                              ? 'bg-alert/30 border border-alert/50'
                              : 'bg-teal/25 border border-teal/40 hover:bg-teal/40'
                        }`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="button" onClick={handleSave} disabled={saving} className="btn-primary">
        {saving ? 'Saving...' : 'Save Schedule'}
      </button>
    </div>
  );
};
