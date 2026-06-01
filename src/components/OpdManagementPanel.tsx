import React, { useState, useMemo } from "react";
import { 
  Calendar, 
  Search, 
  Filter, 
  Download, 
  X, 
  Sparkles, 
  Check, 
  Plus, 
  User,
  Clock, 
  Activity, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  Coins, 
  CheckCircle2, 
  ChevronRight, 
  Stethoscope, 
  Heart,
  TrendingUp,
  FileSpreadsheet
} from "lucide-react";
import { Patient, Appointment } from "../types";

interface OpdManagementPanelProps {
  patients: Patient[];
  appointments: Appointment[];
  onAddAppointment: (record: Appointment) => void;
  onUpdateAppointment: (apptData: Partial<Appointment> & { id: string }) => Promise<void> | void;
  onAddPatient: (patient: Patient) => void;
  onSwitchToStandardRegister: () => void;
}

export default function OpdManagementPanel({
  patients,
  appointments,
  onAddAppointment,
  onUpdateAppointment,
  onAddPatient,
  onSwitchToStandardRegister
}: OpdManagementPanelProps) {
  // Tabs: "Live Queue" | "Appointments" | "Patient Records"
  const [activeTab, setActiveTab] = useState<"queue" | "appointments" | "patients">("queue");
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all"); // "all" | "ayushman" | "non-ayushman"
  
  // Modals & Sliders
  const [showBookModal, setShowBookModal] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Book Appointment Form State
  const [formPatientId, setFormPatientId] = useState("");
  const [formDoctorName, setFormDoctorName] = useState("Dr. Arvind Swaminathan");
  const [formDepartment, setFormDepartment] = useState("Cardiology");
  const [formDateTime, setFormDateTime] = useState("2026-05-30T10:00");
  const [formConsultType, setFormConsultType] = useState<'OPD' | 'Tele-Consultation' | 'Follow-up'>("OPD");
  const [formUrgency, setFormUrgency] = useState<'Normal' | 'Urgent' | 'Emergency'>("Normal");
  const [formPaymentStatus, setFormPaymentStatus] = useState<'Paid' | 'Unpaid' | 'Pending' | 'Ayushman Approved' | 'Ayushman Pending'>("Paid");

  // Show status notification
  const triggerNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Sync payment and class when selecting a patient in appointment form
  const handleFormPatientChange = (pId: string) => {
    setFormPatientId(pId);
    const selectedPat = patients.find(p => p.id === pId);
    if (selectedPat) {
      if (selectedPat.insuranceType === "Cashless PM-JAY") {
        setFormPaymentStatus("Ayushman Approved");
      } else if (selectedPat.insuranceType === "TPA Private") {
        setFormPaymentStatus("Pending");
      } else {
        setFormPaymentStatus("Paid");
      }
    }
  };

  // Automatically update department based on doctor selection
  const handleDoctorChange = (docName: string) => {
    setFormDoctorName(docName);
    if (docName.includes("Arvind")) {
      setFormDepartment("Cardiology");
    } else if (docName.includes("Shruti")) {
      setFormDepartment("General Medicine");
    }
  };

  // Submit new appointment booking
  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPatientId) {
      triggerNotification("error", "Please select a registered patient.");
      return;
    }

    const selectedPat = patients.find(p => p.id === formPatientId);
    if (!selectedPat) {
      triggerNotification("error", "Patient not found.");
      return;
    }

    const isAyushman = selectedPat.insuranceType === "Cashless PM-JAY";
    const nextTokenNumber = appointments.length + 101;
    const computedToken = `OPD-TK-${nextTokenNumber}`;
    const nextRoomNo = formDoctorName.includes("Arvind") ? "Room 101" : "Room 205";

    const newApt: Appointment = {
      id: `APT-${Math.floor(1000 + Math.random() * 8999)}`,
      patientId: selectedPat.id,
      patientName: selectedPat.name,
      doctorName: formDoctorName,
      department: formDepartment,
      dateTime: new Date(formDateTime).toISOString(),
      roomNo: nextRoomNo,
      consultType: formConsultType,
      status: formConsultType === "OPD" ? "Checked In" : "Scheduled", // OPD usually checks in immediately
      token: computedToken,
      paymentStatus: formPaymentStatus,
      urgency: formUrgency,
      patientClass: isAyushman ? "Ayushman" : "Non-Ayushman"
    };

    onAddAppointment(newApt);
    setShowBookModal(false);
    triggerNotification("success", `Token ${computedToken} generated successfully for ${selectedPat.name}!`);
    
    // Reset form states
    setFormPatientId("");
  };

  // Quick check-in appointment
  const handleCheckIn = async (apt: Appointment) => {
    const isAyushman = apt.patientClass === "Ayushman" || 
      patients.find(p => p.id === apt.patientId)?.insuranceType === "Cashless PM-JAY";
      
    const tokenNo = apt.token || `OPD-TK-${Math.floor(200 + Math.random() * 799)}`;
    const updateData: Partial<Appointment> & { id: string } = {
      id: apt.id,
      status: "Checked In",
      token: tokenNo,
      paymentStatus: isAyushman ? "Ayushman Approved" : (apt.paymentStatus || "Paid")
    };
    
    await onUpdateAppointment(updateData);
    triggerNotification("success", `Patient ${apt.patientName} Checked In successfully! Assigned Token: ${tokenNo}`);
  };

  // Process and complete appointment
  const handleComplete = async (aptId: string) => {
    await onUpdateAppointment({ id: aptId, status: "Completed" });
    triggerNotification("success", "OPD Consultation completed & synced with medical record!");
  };

  // Cancel appointment
  const handleCancel = async (aptId: string) => {
    await onUpdateAppointment({ id: aptId, status: "Cancelled" });
    triggerNotification("success", "Appointment cancelled successfully.");
  };

  // Export current list to CSV file
  const handleExportQueue = () => {
    const listToExport = filteredAppointments;
    if (listToExport.length === 0) {
      triggerNotification("error", "No records found in the active list to export.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Token,Patient ID,Patient Name,Category,Doctor,Department,Time,Status,Payment,Urgency\n";

    listToExport.forEach(apt => {
      const isAyushman = apt.patientClass === "Ayushman" ? "Ayushman Cashless" : "Non-Ayushman";
      const timeStr = new Date(apt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      csvContent += `"${apt.token || "N/A"}","${apt.patientId}","${apt.patientName}","${isAyushman}","${apt.doctorName}","${apt.department}","${timeStr}","${apt.status}","${apt.paymentStatus || "Paid"}","${apt.urgency || "Normal"}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `OPD_Queue_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerNotification("success", `Exported ${listToExport.length} outpatient queue records successfully!`);
  };

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      // 1. Tab filtering
      if (activeTab === "queue") {
        // Queue shows active on-duty patients (Scheduled or Checked In)
        if (apt.status !== "Checked In" && apt.status !== "Scheduled") return false;
      } else if (activeTab === "appointments") {
        // Appointments shows all scheduled, completed, and cancelled logs
      }

      // 2. Class/Category filtering (Ayushman vs Non-Ayushman)
      const isAyushman = apt.patientClass === "Ayushman" || 
        patients.find(p => p.id === apt.patientId)?.insuranceType === "Cashless PM-JAY";

      if (selectedClass === "ayushman" && !isAyushman) return false;
      if (selectedClass === "non-ayushman" && isAyushman) return false;

      // 3. Doctor Filter
      if (selectedDoctor !== "all" && apt.doctorName !== selectedDoctor) return false;

      // 4. Text Query search (Patient name, ID, or Token)
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchName = apt.patientName.toLowerCase().includes(query);
        const matchId = apt.patientId.toLowerCase().includes(query);
        const matchToken = apt.token?.toLowerCase().includes(query) || false;
        if (!matchName && !matchId && !matchToken) return false;
      }

      return true;
    });
  }, [appointments, activeTab, selectedClass, selectedDoctor, searchQuery, patients]);

  // Micro statistics for OPD dashboard
  const stats = useMemo(() => {
    let ayushmanCount = 0;
    let nonAyushmanCount = 0;
    let activeQueueLength = 0;
    let completedCount = 0;

    appointments.forEach(a => {
      const isAyushman = a.patientClass === "Ayushman" || 
        patients.find(p => p.id === a.patientId)?.insuranceType === "Cashless PM-JAY";

      if (isAyushman) {
        ayushmanCount++;
      } else {
        nonAyushmanCount++;
      }

      if (a.status === "Checked In") {
        activeQueueLength++;
      }
      if (a.status === "Completed") {
        completedCount++;
      }
    });

    return {
      ayushmanCount,
      nonAyushmanCount,
      activeQueueLength,
      completedCount,
      totalCount: appointments.length
    };
  }, [appointments, patients]);

  return (
    <div className="space-y-6 select-none animate-[fadeIn_0.2s_ease-out]" id="opd-mgmt-panel">
      
      {/* Toast Notification Bar */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4.5 py-3.5 rounded-xl border shadow-xl text-xs font-bold transition-all animate-[slideIn_0.25s_ease-out] ${
          notification.type === "success" 
            ? "bg-emerald-50 text-emerald-850 border-emerald-250 shadow-emerald-100" 
            : "bg-rose-50 text-rose-850 border-rose-250 shadow-rose-100"
        }`}>
          {notification.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 animate-bounce" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 animate-pulse" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* OPD DASHBOARD HERO HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-indigo-600 animate-ping" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">OPD Management Desk</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-normal">
            Manage outpatient department registrations, queue status tracks, tokens, and billing handshakes. Differentiated workflows for <strong>Ayushman PM-JAY</strong> and <strong>Non-Ayushman / Private</strong> beneficiaries.
          </p>
        </div>

        {/* Primary Operational Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportQueue}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 border border-slate-250 rounded-xl hover:bg-slate-50 bg-white transition cursor-pointer active:scale-95 shadow-2xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Queue</span>
          </button>

          <button
            type="button"
            onClick={() => setShowBookModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-850 rounded-xl transition cursor-pointer active:scale-95 shadow-sm shadow-indigo-100"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Book Appointment</span>
          </button>

          <button
            type="button"
            onClick={onSwitchToStandardRegister}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-teal-900 bg-teal-50 border border-teal-200 hover:bg-teal-100 rounded-xl transition cursor-pointer active:scale-95 shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Patient Register</span>
          </button>
        </div>
      </div>

      {/* BENCHMARK OPD STATS PANELS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-gradient-to-br from-indigo-50/60 to-indigo-100/10 p-4 rounded-xl border border-indigo-100/70 shadow-2xs">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Live OPD Queue</span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-black text-indigo-950">{stats.activeQueueLength}</span>
            <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">PATIENTS</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Currently in-waiting/checked-in</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50/60 to-emerald-100/10 p-4 rounded-xl border border-emerald-100/70 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Ayushman (PM-JAY)</span>
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-black text-emerald-900">{stats.ayushmanCount}</span>
            <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">CASHLESS</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Pre-authorized PMJAY patients</p>
        </div>

        <div className="bg-gradient-to-br from-sky-50/60 to-sky-100/10 p-4 rounded-xl border border-sky-100/70 shadow-2xs">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Non-Ayushman / Private</span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-black text-sky-950">{stats.nonAyushmanCount}</span>
            <span className="text-[10px] font-black text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded">STANDARD</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Self-pay / TPA Private covers</p>
        </div>

        <div className="bg-gradient-to-br from-green-50/60 to-green-100/10 p-4 rounded-xl border border-green-100/70 shadow-2xs">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Consults Completed</span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-black text-green-950">{stats.completedCount}</span>
            <span className="text-[10px] font-black text-green-800 bg-green-50 px-1.5 py-0.5 rounded">DONE</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Total completed today</p>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-slate-900 p-4 rounded-xl text-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[8.5px] font-bold uppercase text-slate-400 tracking-widest">NHA Integration</span>
            <h4 className="text-xs font-bold text-emerald-450 mt-1 flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" /> SECURE LIVE APIS
            </h4>
          </div>
          <p className="text-[9.5px] text-slate-400 leading-normal mt-2">
            Patient tokens are synced in real-time with Ayushman Bharat registries.
          </p>
        </div>

      </div>

      {/* LIST CONTROLS AND VISUAL LIST BAR */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        
        {/* Navigation Tabs and Controls Row */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Tabs */}
          <div className="flex bg-slate-200/60 p-1 rounded-xl w-full lg:w-auto" id="opd-tab-switcher">
            <button
              onClick={() => setActiveTab("queue")}
              className={`flex-1 lg:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "queue" 
                  ? "bg-white text-slate-900 shadow-2xs font-extrabold" 
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/30 font-semibold"
              }`}
            >
              Live Queue ({appointments.filter(a => a.status === "Checked In" || a.status === "Scheduled").length})
            </button>
            <button
              onClick={() => setActiveTab("appointments")}
              className={`flex-1 lg:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "appointments" 
                  ? "bg-white text-slate-900 shadow-2xs font-extrabold" 
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/30 font-semibold"
              }`}
            >
              All Appointments ({appointments.length})
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            
            {/* Search Input */}
            <div className="relative flex-1 lg:w-64 min-w-[180px]">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search Patient Name/UHID/Token..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-250 py-1.5 pl-9 pr-4 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-150 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-650"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Doctor Filter */}
            <div className="flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-slate-400 block" />
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="bg-white border border-slate-250 hover:border-slate-350 px-2.5 py-1.5 rounded-xl text-xs text-slate-700 focus:outline-hidden cursor-pointer"
              >
                <option value="all">Doctor: All</option>
                <option value="Dr. Arvind Swaminathan">Dr. Arvind Swaminathan</option>
                <option value="Dr. Shruti Aggarwal">Dr. Shruti Aggarwal</option>
              </select>
            </div>

            {/* Ayushman vs Non-Ayushman Filter */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-white border border-slate-250 hover:border-slate-350 px-2.5 py-1.5 rounded-xl text-xs text-slate-700 font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="all">Scheme: All Patients</option>
              <option value="ayushman">🛡️ Ayushman (PM-JAY)</option>
              <option value="non-ayushman">🟢 Non-Ayushman / Private</option>
            </select>

          </div>

        </div>

        {/* DATA TABLE VIEW */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-slate-800">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-205 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                <th className="py-3 px-4 w-28">Token</th>
                <th className="py-3 px-4">Patient details</th>
                <th className="py-3 px-4">Consulting Doctor</th>
                <th className="py-3 px-4 w-28">Schedule Time</th>
                <th className="py-3 px-4 w-32">Status</th>
                <th className="py-3 px-4 w-44">Billing Status</th>
                <th className="py-3 px-4 w-28">Urgency</th>
                <th className="py-3 px-4 text-right pr-6 w-52">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((apt) => {
                  const patInfo = patients.find(p => p.id === apt.patientId);
                  const isAyushman = apt.patientClass === "Ayushman" || 
                    patInfo?.insuranceType === "Cashless PM-JAY";

                  return (
                    <tr 
                      key={apt.id} 
                      className={`hover:bg-slate-50/50 transition-colors ${
                        apt.status === "Completed" ? "bg-slate-50/15" : ""
                      }`}
                    >
                      {/* Token */}
                      <td className="py-3.5 px-4 font-mono font-bold">
                        {apt.token ? (
                          <span className={`px-2 py-1 rounded text-[10px] border ${
                            apt.status === "Checked In"
                              ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                              : "bg-slate-150 text-slate-600 border-slate-250"
                          }`}>
                            {apt.token}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not Checked In</span>
                        )}
                      </td>

                      {/* Patient Name / Banner */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-900 text-sm hover:underline cursor-pointer">
                              {apt.patientName}
                            </span>
                            {isAyushman ? (
                              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black border border-emerald-200 uppercase tracking-tight shadow-3xs">
                                <Sparkles className="h-2.5 w-2.5 animate-pulse text-emerald-600" /> PM-JAY
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-800 text-[9px] font-extrabold border border-sky-250 uppercase tracking-tight">
                                Non-Ayushman
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                            UHID: {apt.patientId} {patInfo?.phone ? `• 📞 ${patInfo.phone}` : ""}
                          </span>
                        </div>
                      </td>

                      {/* Consulting Doctor */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Stethoscope className="h-3.5 w-3.5 text-indigo-500" />
                          <div>
                            <p className="font-bold text-slate-800">{apt.doctorName}</p>
                            <span className="text-[10px] text-slate-450 block uppercase tracking-tight font-semibold mt-0.5">
                              {apt.department}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Schedule Time */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 select-none">
                          {new Date(apt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Queue Status Select */}
                      <td className="py-3.5 px-4">
                        <select
                          value={apt.status}
                          aria-label="Queue status selection"
                          onChange={async (e) => {
                            await onUpdateAppointment({ id: apt.id, status: e.target.value as any });
                            triggerNotification("success", `Updated status to ${e.target.value} for ${apt.patientName}`);
                          }}
                          className={`text-[10px] font-black uppercase tracking-wider border rounded-lg px-2 py-1 bg-white cursor-pointer ${
                            apt.status === "Scheduled" ? "text-amber-800 border-amber-200 bg-amber-50/20" :
                            apt.status === "Checked In" ? "text-indigo-800 border-indigo-200 bg-indigo-50/20 shadow-2xs" :
                            apt.status === "Completed" ? "text-green-800 border-green-200 bg-green-50/20" :
                            "text-slate-500 border-slate-200"
                          }`}
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="Checked In">Checked In</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Payment Status Dropdown Selector */}
                      <td className="py-3.5 px-4">
                        <select
                          value={apt.paymentStatus || "Paid"}
                          aria-label="payment status selection"
                          onChange={async (e) => {
                            await onUpdateAppointment({ id: apt.id, paymentStatus: e.target.value as any });
                            triggerNotification("success", `Billing status updated: ${e.target.value}`);
                          }}
                          className={`text-[10px] font-bold border rounded-lg px-2.5 py-1 bg-white cursor-pointer ${
                            apt.paymentStatus === "Paid" ? "text-green-700 bg-green-50 border-green-200" :
                            apt.paymentStatus === "Unpaid" ? "text-rose-700 bg-rose-50 border-rose-200 font-extrabold" :
                            apt.paymentStatus === "Ayushman Approved" ? "text-emerald-700 bg-emerald-50 border-emerald-300 font-extrabold animate-pulse" :
                            apt.paymentStatus === "Ayushman Pending" ? "text-amber-700 bg-amber-50 border-amber-300 font-bold" :
                            "text-slate-600 bg-slate-50 border-slate-200"
                          }`}
                        >
                          <option value="Paid">Paid (Cash/UPI)</option>
                          <option value="Unpaid">Unpaid / Due</option>
                          <option value="Pending">TPA Auth Pending</option>
                          <option value="Ayushman Approved">🛡️ PM-JAY Cashless Approved</option>
                          <option value="Ayushman Pending">🛡️ PM-JAY Pre-Auth Pending</option>
                        </select>
                      </td>

                      {/* Urgency */}
                      <td className="py-3.5 px-4">
                        <select
                          value={apt.urgency || "Normal"}
                          aria-label="urgency state selection"
                          onChange={async (e) => {
                            await onUpdateAppointment({ id: apt.id, urgency: e.target.value as any });
                            triggerNotification("success", `Urgency set to ${e.target.value}`);
                          }}
                          className={`text-[10px] font-bold border rounded-lg px-2 py-1 bg-white cursor-pointer ${
                            apt.urgency === "Emergency" ? "text-rose-700 bg-rose-50 border-rose-200 animate-bounce font-extrabold" :
                            apt.urgency === "Urgent" ? "text-amber-700 bg-amber-50 border-amber-200 font-black" :
                            "text-slate-700 bg-slate-50 border-slate-200"
                          }`}
                        >
                          <option value="Normal">Normal</option>
                          <option value="Urgent">Urgent</option>
                          <option value="Emergency">🚨 Emergency</option>
                        </select>
                      </td>

                      {/* Action Triggers */}
                      <td className="py-3.5 px-4 text-right pr-6 space-x-1.5 whitespace-nowrap">
                        {apt.status === "Scheduled" && (
                          <button
                            type="button"
                            onClick={() => handleCheckIn(apt)}
                            className="text-[10px] font-black bg-indigo-100 hover:bg-indigo-700 text-indigo-750 hover:text-white px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-3xs"
                          >
                            Check In
                          </button>
                        )}
                        {apt.status === "Checked In" && (
                          <button
                            type="button"
                            onClick={() => handleComplete(apt.id)}
                            className="text-[10px] font-black bg-green-100 hover:bg-green-700 text-green-750 hover:text-white px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-3xs"
                          >
                            Mark Consult Done
                          </button>
                        )}
                        {apt.status !== "Cancelled" && apt.status !== "Completed" && (
                          <button
                            type="button"
                            onClick={() => handleCancel(apt.id)}
                            className="text-[10px] font-bold bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white px-2 py-1 rounded-lg transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        {isAyushman && (
                          <span className="inline-block text-[9px] font-black text-indigo-900 border border-indigo-200 bg-indigo-50/50 px-1.5 py-1 rounded-md">
                            🛡️ PM-JAY Registered
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium bg-slate-50/20">
                    <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-2 animate-pulse" />
                    <span>No active outpatient registers matching current filters.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info tracking */}
        <div className="bg-slate-50 px-6 py-4.5 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 font-semibold gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-505 animate-pulse bg-emerald-500" />
            <span>National PM-JAY Cashless Network Status: Connected and operational</span>
          </div>
          <span>Showing {filteredAppointments.length} of {appointments.length} total outpatient rosters today</span>
        </div>

      </div>

      {/* MODAL WINDOW: BOOK NEW APPOINTMENT */}
      {showBookModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-white rounded-3xl border border-slate-205 shadow-2xl max-w-lg w-full overflow-hidden animate-[zoomIn_0.2s_ease-out]">
            
            {/* Modal Title Row */}
            <div className="bg-[#1e1b4b] text-white px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2 tracking-tight">
                  <Calendar className="h-5 w-5 text-indigo-300 animate-pulse" />
                  <span>Book Outpatient OPD Appointment</span>
                </h3>
                <p className="text-[10.5px] text-indigo-200/90 mt-0.5">Assigned token generated instantly on check-in.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowBookModal(false)}
                className="text-indigo-200 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleBookSubmit} className="p-6 space-y-4 bg-white">
              
              {/* Select Patient */}
              <div className="space-y-1">
                <label className="text-[10.5px] font-extrabold text-[#334155] uppercase tracking-wider block mb-1">
                  Select Registered Patient *
                </label>
                <select
                  value={formPatientId}
                  onChange={(e) => handleFormPatientChange(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 px-3.5 py-2.5 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#4f46e5] focus:ring-1 focus:ring-indigo-150 transition cursor-pointer font-bold"
                >
                  <option value="">-- Choose Patient from Registry --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id}) [{p.insuranceType === "Cashless PM-JAY" ? "🛡️ PM-JAY" : "Self-Pay"}]
                    </option>
                  ))}
                </select>
                {patients.length === 0 && (
                  <p className="text-[10px] text-amber-700 font-bold bg-amber-50 p-2 rounded border border-amber-200 mt-1">
                    ⚠️ No patients registered in the main database yet. Please register a patient first in the Standard Register!
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                
                {/* Consulting Doctor */}
                <div className="space-y-1">
                  <label className="text-[10.5px] font-extrabold text-[#334155] uppercase tracking-wider block mb-1">
                    Consulting Doctor *
                  </label>
                  <select
                    value={formDoctorName}
                    onChange={(e) => handleDoctorChange(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 px-3.5 py-2.5 rounded-xl text-xs text-slate-800 cursor-pointer font-bold focus:outline-hidden focus:border-[#4f46e5]"
                  >
                    <option value="Dr. Arvind Swaminathan">Dr. Arvind Swaminathan</option>
                    <option value="Dr. Shruti Aggarwal">Dr. Shruti Aggarwal</option>
                  </select>
                </div>

                {/* Department (read-only bound to Doctor) */}
                <div className="space-y-1">
                  <label className="text-[10.5px] font-extrabold text-[#334155] uppercase tracking-wider block mb-1">
                    Assigned Specialty
                  </label>
                  <input
                    type="text"
                    value={formDepartment}
                    disabled
                    className="w-full bg-[#f1f5f9] text-[#475569] border border-[#cbd5e1] px-3.5 py-2.5 rounded-xl text-xs font-bold focus:outline-hidden"
                  />
                </div>

              </div>

              <div className="grid grid-cols-2 gap-4">
                
                {/* Date and Time */}
                <div className="space-y-1">
                  <label className="text-[10.5px] font-extrabold text-[#334155] uppercase tracking-wider block mb-1">
                    Datetime Slot *
                  </label>
                  <input
                    type="datetime-local"
                    value={formDateTime}
                    onChange={(e) => setFormDateTime(e.target.value)}
                    required
                    className="w-full bg-white border border-[#cbd5e1] px-3.5 py-2.5 rounded-xl text-xs text-slate-800 focus:outline-hidden font-bold"
                  />
                </div>

                {/* Consult Category type */}
                <div className="space-y-1">
                  <label className="text-[10.5px] font-extrabold text-[#334155] uppercase tracking-wider block mb-1">
                    Encounter Mode *
                  </label>
                  <select
                    value={formConsultType}
                    onChange={(e) => setFormConsultType(e.target.value as any)}
                    required
                    className="w-full bg-white border border-[#cbd5e1] px-3.5 py-2.5 rounded-xl text-xs text-slate-800 cursor-pointer font-bold focus:outline-hidden"
                  >
                    <option value="OPD">Standard OPD (Check-in now)</option>
                    <option value="Tele-Consultation">Tele-Consultation</option>
                    <option value="Follow-up">Physical Follow-up</option>
                  </select>
                </div>

              </div>

              <div className="grid grid-cols-2 gap-4">
                
                {/* Urgency */}
                <div className="space-y-1">
                  <label className="text-[10.5px] font-extrabold text-[#334155] uppercase tracking-wider block mb-1">
                    Triage / Urgency *
                  </label>
                  <select
                    value={formUrgency}
                    onChange={(e) => setFormUrgency(e.target.value as any)}
                    required
                    className="w-full bg-white border border-[#cbd5e1] px-3.5 py-2.5 rounded-xl text-xs text-slate-800 cursor-pointer font-bold focus:outline-hidden"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Emergency">🚨 Emergency Triage</option>
                  </select>
                </div>

                {/* Payment status */}
                <div className="space-y-1">
                  <label className="text-[10.5px] font-extrabold text-[#334155] uppercase tracking-wider block mb-1">
                    Default Billing Protocol
                  </label>
                  <select
                    value={formPaymentStatus}
                    onChange={(e) => setFormPaymentStatus(e.target.value as any)}
                    className="w-full bg-white border border-[#cbd5e1] px-3.5 py-2.5 rounded-xl text-xs text-slate-850 cursor-pointer font-extrabold focus:outline-hidden"
                  >
                    <option value="Paid">Paid (Cash/UPI) - OPD Fee ₹400</option>
                    <option value="Unpaid">Unpaid / Collect Later</option>
                    <option value="Pending">Private TPA Authorization</option>
                    <option value="Ayushman Approved">🛡️ PM-JAY Cashless Approved</option>
                    <option value="Ayushman Pending">🛡️ PM-JAY Pending approval</option>
                  </select>
                </div>

              </div>

              {/* Patient class detection indicator based on selection */}
              {formPatientId && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-150 rounded-xl flex items-start gap-2.5 select-none text-[11px] leading-relaxed">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-emerald-950 block">Category Auto-Match Protocol Active</span>
                    <p className="text-emerald-800 font-medium">
                      The patient selected is recognized as <strong>{patients.find(p => p.id === formPatientId)?.insuranceType === "Cashless PM-JAY" ? "Eligible PM-JAY Beneficiary" : "Direct Payee / Private Billing"}</strong>. System has automatically matching billing code references.
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2.5 text-xs font-bold border border-slate-300 bg-white text-slate-700 hover:text-slate-900 rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={patients.length === 0}
                  className="px-5 py-2.5 text-xs font-black text-white bg-[#4f46e5] hover:bg-[#4338ca] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition cursor-pointer shadow-sm shadow-indigo-150"
                >
                  Generate Ticket (Check-In)
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
