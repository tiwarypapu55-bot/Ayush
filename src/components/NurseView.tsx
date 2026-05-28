import { useState } from "react";
import { Building2, Plus, LogOut, CheckSquare, Square, Clipboard, Info, ShieldCheck, Heart, ThermometerSun } from "lucide-react";
import { HospitalBed, Patient, Encounter } from "../types";

interface NurseViewProps {
  patients: Patient[];
  beds: HospitalBed[];
  encounters: Encounter[];
  onAllocateBed: (bedId: string, patientId: string, patientName: string) => void;
  onReleaseBed: (bedId: string) => void;
  onDispenseMedication: (encounterId: string, medIndex: number) => void;
}

export default function NurseView({ patients, beds, encounters, onAllocateBed, onReleaseBed, onDispenseMedication }: NurseViewProps) {
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  const [targetPatientId, setTargetPatientId] = useState(patients[0]?.id || "");
  const [showAllocatePopup, setShowAllocatePopup] = useState(false);

  // ICU / Critical Nurse Chart Simulator state
  const [ventilatorMode, setVentilatorMode] = useState("PEEP Standard Support");
  const [oxygenFlow, setOxygenFlow] = useState("4 L/min");
  const [nurseHandover, setNurseHandover] = useState("");
  const [handoverLogs, setHandoverLogs] = useState<{ time: string; text: string; author: string }[]>([
    {
      time: "2026-05-24T18:00:00Z",
      text: "Bed GW-01 (Priyanka Devi) Post-Lap surgery stable. Vitals checked q2h. Retaining IV cannula left forearm.",
      author: "Officer Sr. Rosamma"
    }
  ]);

  const handleOpenAllocation = (bedId: string) => {
    setSelectedBedId(bedId);
    setShowAllocatePopup(true);
  };

  const handleAllocationSubmit = () => {
    if (!selectedBedId || !targetPatientId) return;
    const patObj = patients.find(p => p.id === targetPatientId);
    if (!patObj) return;

    onAllocateBed(selectedBedId, patObj.id, patObj.name);
    setShowAllocatePopup(false);
    setSelectedBedId(null);
  };

  const executeReleaseBed = (bedId: string) => {
    if (confirm("Are you sure you want to vacate and discharge this bed? Total package balance will be transferred to billing panel.")) {
      onReleaseBed(bedId);
    }
  };

  const addHandoverNote = () => {
    if (!nurseHandover) return;
    const newLog = {
      time: new Date().toISOString(),
      text: nurseHandover,
      author: "Duty Nurse Officer"
    };
    setHandoverLogs([newLog, ...handoverLogs]);
    setNurseHandover("");
  };

  // Find active prescriptions across all encounters to display in Medication Administration Record
  const activePrxList: { encounterId: string; patientName: string; medicine: string; generic: string; dosage: string; frequency: string; duration: string; index: number; dispensed?: boolean }[] = [];
  
  encounters.forEach(enc => {
    enc.prescriptions.forEach((p, idx) => {
      activePrxList.push({
        encounterId: enc.id,
        patientName: enc.patientName,
        medicine: p.medicine,
        generic: p.generic,
        dosage: p.dosage,
        frequency: p.frequency,
        duration: p.duration,
        index: idx,
        dispensed: p.dispensed
      });
    });
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="nurse-panel-container">
      {/* LEFT COLUMN: Ward bed structures and allocation map */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Interactive Ward & Bed Registry Panel</h2>
              <p className="text-xs text-slate-500">Live deployment of admitted patient portfolios to General Wards, Private Cabins, and Critical ICU zones.</p>
            </div>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded">
              NABH Ward Census Linkage Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {beds.map(bed => {
              const isOccupied = bed.status === "Occupied";
              return (
                <div
                  key={bed.id}
                  className={`rounded-xl border p-4.5 transition duration-150 relative ${
                    isOccupied
                      ? "bg-rose-50/10 border-rose-200/60 shadow-xs"
                      : "bg-green-50/10 border-green-250/50 shadow-xs"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {bed.bedNumber}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded select-none border ${
                        isOccupied
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-green-100 text-green-700 border-green-200"
                      }`}
                    >
                      {bed.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wide">{bed.type}</h4>
                  
                  {isOccupied ? (
                    <div className="mt-3 space-y-1">
                      <p className="text-sm font-bold text-slate-950 truncate">{bed.patientName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Admission ID: {bed.patientId}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Admitted at: {new Date(bed.admittedAt || "").toLocaleDateString()}</p>
                      
                      <button
                        onClick={() => executeReleaseBed(bed.id)}
                        className="mt-3 w-full border border-rose-200 hover:bg-rose-50 text-rose-700 text-[11px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition"
                      >
                        <LogOut className="h-3 w-3" /> Discharge & Vacate Bed
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs text-slate-500">Price Rate: ₹{bed.pricePerDay}/day</p>
                      <p className="text-[10px] text-slate-400">Suitable for standard recovery care protocols</p>

                      <button
                        onClick={() => handleOpenAllocation(bed.id)}
                        className="mt-3.5 w-full bg-slate-900 hover:bg-slate-800 text-slate-100 text-[11px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition"
                      >
                        <Plus className="h-3 w-3" /> Assign Admitted Patient
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* MAR Checkbox administration grid */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">NABH Safety Checklists</span>
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Facility Medication Administration Record (MAR - Hourly Ledger)</h3>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-mono text-slate-500">
                  <th className="p-3">Patient Admitted</th>
                  <th className="p-3">Medication Assigned</th>
                  <th className="p-3">Dose Registry</th>
                  <th className="p-3">Frequency Summary</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {activePrxList.length > 0 ? (
                  activePrxList.map((med, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <strong className="text-slate-950 font-sans">{med.patientName}</strong>
                        <p className="text-[10px] text-slate-400 font-mono">Encounter {med.encounterId}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-slate-900">{med.medicine}</p>
                        <p className="text-[10px] font-mono text-slate-400 font-medium">{med.generic}</p>
                      </td>
                      <td className="p-3 font-mono text-slate-700">{med.dosage}</td>
                      <td className="p-3 font-mono text-slate-700">{med.frequency}</td>
                      <td className="p-3">
                        {med.dispensed ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded">
                            <ShieldCheck className="h-3.5 w-3.5" /> Administered Dose
                          </span>
                        ) : (
                          <button
                            onClick={() => onDispenseMedication(med.encounterId, med.index)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] py-1 px-2 rounded-md flex items-center gap-1 cursor-pointer transition select-none"
                          >
                            Mark Administered
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">
                      No pharmacological prescriptions present in historic clinical databases. Register diagnostic medications to visualize hourly MAR logs.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: ICU/PICU Ventilator logs and handovers */}
      <div className="lg:col-span-4 space-y-6">
        {/* Admitted Patient Form Modal Popup */}
        {showAllocatePopup && (
          <div className="bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <span>🛏️</span> Allocate Selected Bed Block
            </h3>
            
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Target Patient UHID</label>
              <select
                value={targetPatientId}
                onChange={(e) => setTargetPatientId(e.target.value)}
                className="w-full text-xs text-slate-100 bg-slate-950 border border-slate-800 rounded p-2.5 focus:outline-hidden"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                onClick={() => setShowAllocatePopup(false)}
                className="px-3 py-1.5 border border-slate-800 hover:bg-slate-800 text-slate-400 rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAllocationSubmit}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded cursor-pointer"
              >
                Confirm Placement
              </button>
            </div>
          </div>
        )}

        {/* ICU Critical Care / Ventilator logs widget */}
        <div className="bg-slate-950 text-slate-100 p-6 rounded-xl border border-slate-850 shadow-md">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
            <ThermometerSun className="h-5 w-5 text-red-500" />
            <div>
              <h3 className="font-bold text-slate-200 text-sm">ICU & Critical Care Module</h3>
              <p className="text-slate-500 text-[10px]">Real-time NHA critical alerts & telemetry tracker.</p>
            </div>
          </div>

          <div className="space-y-4 text-xs font-sans">
            <div className="p-3.5 bg-rose-950/20 text-red-400 border border-red-900/40 rounded flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-ping shrink-0" />
              <div>
                <strong>Active Vital Telemetry Alert:</strong> PEEP ventilators are synchronized with Bed ICU-01 standard checks. Correct settings hourly.
              </div>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase">Ventilator Ventilation State</label>
                <input
                  type="text"
                  value={ventilatorMode}
                  onChange={(e) => setVentilatorMode(e.target.value)}
                  className="w-full text-slate-100 bg-slate-900 border border-slate-800 font-mono text-xs rounded p-2 focus:border-red-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase">Oxygen Infusion Rate</label>
                <input
                  type="text"
                  value={oxygenFlow}
                  onChange={(e) => setOxygenFlow(e.target.value)}
                  className="w-full text-slate-100 bg-slate-900 border border-slate-800 font-mono text-xs rounded p-2 focus:border-red-500 outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Shift Handovers Ledger */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <Clipboard className="h-5 w-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Nursing Shift Handovers</h3>
              <p className="text-slate-500 text-[10px]">Track historical bedside safety handovers.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5 text-xs">
              <textarea
                rows={3}
                value={nurseHandover}
                onChange={(e) => setNurseHandover(e.target.value)}
                placeholder="e.g., Bed B-102 (Suresh) checked. Post-op pain managed with paracetamol iv."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:outline-hidden focus:border-indigo-500"
              />
              <button
                onClick={addHandoverNote}
                className="w-full bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold text-xs py-2 rounded-lg cursor-pointer"
              >
                Log Shift Handover Note
              </button>
            </div>

            <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-none border-t pt-3">
              {handoverLogs.map((log, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-lg border text-xs text-slate-700 leading-relaxed">
                  <div className="flex justify-between text-[10px] text-slate-500 font-medium mb-1">
                    <span>{log.author}</span>
                    <span>{new Date(log.time).toLocaleTimeString()}</span>
                  </div>
                  <p>{log.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
