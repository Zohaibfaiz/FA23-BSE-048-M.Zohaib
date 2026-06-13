import { jsPDF } from 'jspdf';
import { Download, Lock } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

export const PrescriptionCard = ({ prescription }) => {
  const locked = prescription.isLocked;

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Doctor Hub — Prescription', 20, 20);
    doc.setFontSize(11);
    doc.text(`Date: ${formatDate(prescription.createdAt)}`, 20, 32);
    doc.text(`Doctor: ${prescription.doctorId?.name || 'N/A'}`, 20, 40);

    let y = 55;
    doc.text('Medicines:', 20, y);
    y += 8;
    prescription.medicines?.forEach((med, i) => {
      doc.text(
        `${i + 1}. ${med.name} — ${med.dosage}, ${med.frequency}, ${med.duration}`,
        20,
        y
      );
      y += 7;
    });
    if (prescription.notes) {
      y += 5;
      doc.text(`Notes: ${prescription.notes}`, 20, y);
    }
    doc.save(`prescription-${prescription._id}.pdf`);
  };

  return (
    <div className="glass p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/50">{formatDate(prescription.createdAt)}</p>
          <p className="font-heading font-bold">Dr. {prescription.doctorId?.name}</p>
        </div>
        {locked && (
          <span className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-xs text-white/60">
            <Lock size={12} /> Locked
          </span>
        )}
      </div>

      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-white/50">
            <th className="pb-2">Medicine</th>
            <th>Dosage</th>
            <th>Frequency</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {prescription.medicines?.map((med, i) => (
            <tr key={i} className="border-b border-white/5">
              <td className="py-2 font-medium">{med.name}</td>
              <td>{med.dosage}</td>
              <td>{med.frequency}</td>
              <td>{med.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {prescription.notes && (
        <p className="mt-3 text-sm text-white/60">{prescription.notes}</p>
      )}

      <button type="button" onClick={downloadPDF} className="btn-primary mt-4 text-sm">
        <Download size={16} /> Download PDF
      </button>
    </div>
  );
};
