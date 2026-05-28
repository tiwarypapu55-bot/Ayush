import React, { useState, useEffect } from "react";
import { Package, Truck, FileText, Plus, AlertCircle, CheckCircle, ArrowDownCircle, BadgeAlert } from "lucide-react";
import { InventoryItem, Vendor, GoodsReceivedNote } from "../types";

export default function InventoryView() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [grns, setGrns] = useState<GoodsReceivedNote[]>([]);
  
  const [activeTab, setActiveTab] = useState<"items" | "grn" | "vendors">("items");
  const [filterCategory, setFilterCategory] = useState<string>("All");

  // Form states and builders
  const [issueItemId, setIssueItemId] = useState("");
  const [issueQuantity, setIssueQuantity] = useState(10);
  const [issueDept, setIssueDept] = useState("OPD General Ward");
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // New Vendor Form State
  const [vName, setVName] = useState("");
  const [vContact, setVContact] = useState("");
  const [vPhone, setVPhone] = useState("");
  const [vEmail, setVEmail] = useState("");
  const [vGst, setVGst] = useState("");

  // New GRN states
  const [grnNum, setGrnNum] = useState("");
  const [grnPO, setGrnPO] = useState("");
  const [grnVendor, setGrnVendor] = useState("");
  const [grnItemName, setGrnItemName] = useState("");
  const [grnItemQty, setGrnItemQty] = useState(100);
  const [grnItemPrice, setGrnItemPrice] = useState(25);
  const [grnBatch, setGrnBatch] = useState("B-FRESH-99");
  const [grnExpiry, setGrnExpiry] = useState("2027-12-31");

  const loadData = async () => {
    try {
      const [iRes, vRes, gRes] = await Promise.all([
        fetch("/api/inventory").then(r => r.json()),
        fetch("/api/vendors").then(r => r.json()),
        fetch("/api/grn").then(r => r.json())
      ]);
      setItems(iRes);
      setVendors(vRes);
      setGrns(gRes);
      if (iRes.length > 0) {
        setIssueItemId(iRes[0].id);
      }
      if (vRes.length > 0) {
        setGrnVendor(vRes[0].name);
      }
    } catch (err) {
      console.error("Failed to load inventory stack", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const clearMessage = () => setTimeout(() => setMessage(null), 4000);

  const handleIssueStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueItemId) return;
    try {
      const resp = await fetch("/api/inventory/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: issueItemId, quantity: issueQuantity })
      });
      const data = await resp.json();
      if (resp.ok) {
        setMessage({ type: 'success', text: `Successfully issued ${issueQuantity} units to ${issueDept}!` });
        loadData();
      } else {
        setMessage({ type: 'error', text: data.error || "Issue transaction failed" });
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Server connection failed" });
    }
    clearMessage();
  };

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vName) return;
    try {
      const resp = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: vName,
          contactPerson: vContact,
          phone: vPhone,
          email: vEmail,
          gstNumber: vGst,
          contractStatus: "Active"
        })
      });
      if (resp.ok) {
        setMessage({ type: 'success', text: `New Vendor "${vName}" registered successfully!` });
        setVName(""); setVContact(""); setVPhone(""); setVEmail(""); setVGst("");
        loadData();
      } else {
        setMessage({ type: 'error', text: "Failed to save vendor" });
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Encountered server connection fault" });
    }
    clearMessage();
  };

  const handleCreateGRN = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grnNum || !grnVendor || !grnItemName) return;
    try {
      const resp = await fetch("/api/grn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grnNumber: grnNum,
          purchaseOrderId: grnPO,
          vendorName: grnVendor,
          itemsReceived: [
            {
              name: grnItemName,
              quantity: grnItemQty,
              unitPrice: grnItemPrice,
              batchNumber: grnBatch,
              expiryDate: grnExpiry
            }
          ],
          qualityCheckedBy: "Bio-safety Inspector Desk"
        })
      });
      if (resp.ok) {
        setMessage({ type: 'success', text: `GRN ${grnNum} stored and database updated successfully!` });
        setGrnNum(""); setGrnPO(""); setGrnItemName("");
        loadData();
      } else {
        setMessage({ type: 'error', text: "Failed to store Goods Received Note" });
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Server connection fault" });
    }
    clearMessage();
  };

  const categories = ["All", "Critical Consumables", "Surgical Instruments", "Personal Protective Equipment", "General Medicines", "Anesthetics"];
  const filteredItems = filterCategory === "All" ? items : items.filter(i => i.category === filterCategory);

  // Expiry check helpers
  const isExpired = (expiryStr: string) => {
    return new Date(expiryStr) < new Date();
  };

  const isExpiringSoon = (expiryStr: string) => {
    const timeDiff = new Date(expiryStr).getTime() - new Date().getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    return daysDiff >= 0 && daysDiff <= 30;
  };

  return (
    <div className="space-y-6" id="inventory-workspace">
      {/* Header banner */}
      <div className="bg-slate-900 text-slate-100 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-slate-800">
        <div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full uppercase tracking-wider mb-2.5 inline-block">
            Medical Consumables Operations
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">Central Store & Hospital Inventory Management</h2>
          <p className="text-xs text-slate-400 mt-1">Monitor batch controls, distribute department supplies, log direct Goods Received Notes (GRN), and verify active CDSCO vendors.</p>
        </div>
        <div className="flex gap-4 text-xs font-mono select-none">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 text-center">
            <span className="text-[9px] text-slate-500 uppercase block">Store Stock Level</span>
            <strong className="text-blue-400 text-sm">
              {items.reduce((acc, c) => acc + c.centralStockUnits, 0).toLocaleString()} Units
            </strong>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 text-center">
            <span className="text-[9px] text-slate-500 uppercase block">Vendors Network</span>
            <strong className="text-green-500 text-sm">{vendors.length} Approved</strong>
          </div>
        </div>
      </div>

      {/* Message center */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 border text-xs leading-normal transition-all duration-200 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border-green-250' 
            : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="h-4 w-4 shrink-0 text-green-600" /> : <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Workspace Tabs */}
      <div className="bg-slate-100 p-1 rounded-lg flex space-x-1 border border-slate-200" id="inventory-tabs">
        <button
          onClick={() => setActiveTab("items")}
          className={`flex-1 py-2 px-3 rounded-md text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
            activeTab === "items" ? "bg-white text-slate-950 shadow-xs" : "text-slate-505 hover:text-slate-800"
          }`}
        >
          <Package className="h-3.5 w-3.5 text-blue-500" /> Stock Ledger & Department Issue
        </button>
        <button
          onClick={() => setActiveTab("grn")}
          className={`flex-1 py-2 px-3 rounded-md text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
            activeTab === "grn" ? "bg-white text-slate-950 shadow-xs" : "text-slate-505 hover:text-slate-800"
          }`}
        >
          <FileText className="h-3.5 w-3.5 text-indigo-500" /> Goods Received Notes (GRN)
        </button>
        <button
          onClick={() => setActiveTab("vendors")}
          className={`flex-1 py-2 px-3 rounded-md text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
            activeTab === "vendors" ? "bg-white text-slate-950 shadow-xs" : "text-slate-550 hover:text-slate-850"
          }`}
        >
          <Truck className="h-3.5 w-3.5 text-orange-500" /> Vendor Directories & Contacts
        </button>
      </div>

      {/* Render Stock Ledger */}
      {activeTab === "items" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Stock status summary grid */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Hospital Central Store Stock Status</h3>
                  <p className="text-[11px] text-slate-500">Expiries and reorders audited in real-time mode</p>
                </div>
                
                {/* Category filters */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="text-xs border border-slate-300 rounded-lg whitespace-nowrap bg-slate-50 py-1.5 px-3 focus:outline-hidden font-semibold"
                >
                  {categories.map((c, idx) => (
                    <option key={idx} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b">
                      <th className="p-3 pl-4">Consumable Details</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 font-mono">Central Store</th>
                      <th className="p-3 font-mono">Dept Issued</th>
                      <th className="p-3">Batch & Expiry</th>
                      <th className="p-3">Safety Alerts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredItems.map(item => {
                      const isLow = item.centralStockUnits <= item.reorderLevel;
                      const expired = isExpired(item.expiryDate);
                      const soon = isExpiringSoon(item.expiryDate);

                      return (
                        <tr key={item.id} className="hover:bg-slate-50 transition duration-150">
                          <td className="p-3 pl-4">
                            <strong className="text-slate-900 block font-semibold">{item.name}</strong>
                            <span className="text-[10px] text-slate-400 font-mono">{item.id} • Cost: ₹{item.unitCost}/unit</span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600 border">
                              {item.category}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-900">
                            {item.centralStockUnits.toLocaleString()} units
                          </td>
                          <td className="p-3 font-mono text-slate-650">
                            {item.departmentIssuedUnits.toLocaleString()} units
                          </td>
                          <td className="p-3 font-mono text-[11px]">
                            <div className="text-slate-700">Batch: {item.batchNumber}</div>
                            <div className={`text-[10px] font-semibold ${
                              expired ? "text-rose-600 font-bold" : soon ? "text-amber-600" : "text-slate-500"
                            }`}>
                              Expiry: {item.expiryDate} {expired && "(EXPIRED)"} {soon && "(Expiring Soon)"}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-col gap-1.5">
                              {isLow && (
                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold py-0.5 px-2 rounded-md max-w-max">
                                  <AlertCircle className="h-3 w-3" /> Reorder Needed
                                </span>
                              )}
                              {expired && (
                                <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 text-[9px] font-bold py-0.5 px-2 rounded-md max-w-max">
                                  <BadgeAlert className="h-3 w-3" /> CRITICAL EXPIRED
                                </span>
                              )}
                              {!isLow && !expired && !soon && (
                                <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-[9px] font-bold py-0.5 px-2 rounded-md max-w-max">
                                  <CheckCircle className="h-3 w-3" /> Optimum Supply
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Department stock issuances form */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2 mb-4 flex items-center gap-2">
                <ArrowDownCircle className="h-4 w-4 text-blue-600" /> Department Stock Issue
              </h3>
              
              <form onSubmit={handleIssueStock} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Select Consumable *</label>
                  <select
                    value={issueItemId}
                    onChange={(e) => setIssueItemId(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:outline-hidden font-semibold"
                    required
                  >
                    {items.map(i => (
                      <option key={i.id} value={i.id}>{i.name} (Stock: {i.centralStockUnits})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Distribute Units *</label>
                  <input
                    type="number"
                    min={1}
                    value={issueQuantity}
                    onChange={(e) => setIssueQuantity(parseInt(e.target.value) || 0)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Target Department Wing *</label>
                  <select
                    value={issueDept}
                    onChange={(e) => setIssueDept(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:outline-hidden"
                  >
                    <option value="OPD General Ward">OPD General Ward</option>
                    <option value="Cardiology ICU">Cardiology ICU</option>
                    <option value="General Surgery OT">General Surgery OT</option>
                    <option value="Pediatrics Wing">Pediatrics Wing</option>
                    <option value="Clinical Pathology Lab">Clinical Pathology Lab</option>
                    <option value="ER Trauma Unit">ER Trauma Unit</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-lg cursor-pointer transition"
                >
                  Confirm Issue & Update EMR Store
                </button>
              </form>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px] leading-relaxed text-slate-500">
              📌 <strong>Reorder Policy Guidelines:</strong> Consumable levels falling low automatically register on the central Procurement board for verification. Expired batches must not be distributed under the National Patient Safety Guidelines.
            </div>
          </div>
        </div>
      )}

      {/* Render GRN */}
      {activeTab === "grn" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Goods Received Notes (GRN) Ledger</h3>
                <p className="text-[11px] text-slate-500">Validating quality control logs against Purchase orders</p>
              </div>

              <div className="divide-y divide-slate-100">
                {grns.map(note => (
                  <div key={note.id} className="p-4 bg-slate-50/25 space-y-3 hover:bg-slate-50 transition">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center text-xs gap-2">
                      <div>
                        <strong className="text-slate-900 text-sm">{note.grnNumber}</strong>
                        <div className="text-[10px] text-slate-500 font-mono">
                          ID: {note.id} • PO Reference: {note.purchaseOrderId} • Log Date: {new Date(note.dateReceived).toLocaleString()}
                        </div>
                      </div>
                      <span className="bg-green-100 text-green-700 border border-green-200 text-[10px] font-extrabold py-1 px-3 rounded-full uppercase tracking-wider">
                        ★ Verified: {note.status}
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1 bg-slate-100/10">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Vendor Supplier:</div>
                      <div className="font-semibold text-slate-900">{note.vendorName}</div>
                      
                      <div className="mt-3 overflow-hidden border rounded-lg">
                        <table className="w-full text-left bg-slate-50/20">
                          <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500">
                            <tr>
                              <th className="p-2">Material Received</th>
                              <th className="p-2 text-right">Qty</th>
                              <th className="p-2 text-right">Unit Rate</th>
                              <th className="p-2">Batch Ref</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y text-[11px]">
                            {note.itemsReceived.map((ri, iIdx) => (
                              <tr key={iIdx}>
                                <td className="p-2 font-medium text-slate-900">{ri.name}</td>
                                <td className="p-2 text-right font-mono">{ri.quantity.toLocaleString()}</td>
                                <td className="p-2 text-right font-mono">₹{ri.unitPrice}</td>
                                <td className="p-2 font-mono text-slate-500 text-[10px]">{ri.batchNumber} (Exp: {ri.expiryDate})</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 border-t pt-2">
                      <span>Quality Assurer: <strong>{note.qualityCheckedBy}</strong></span>
                      <span className="text-slate-400">HL7 FHIR Inventory Payload Compliant</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2 mb-4 flex items-center gap-2">
                <Plus className="h-4 w-4 text-indigo-600" /> Create Goods Received Note (GRN)
              </h3>

              <form onSubmit={handleCreateGRN} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">GRN Number *</label>
                  <input
                    type="text"
                    required
                    value={grnNum}
                    onChange={(e) => setGrnNum(e.target.value)}
                    placeholder="e.g. NDHM-GRN-2026-9041"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Purchase Order ID *</label>
                  <input
                    type="text"
                    required
                    value={grnPO}
                    onChange={(e) => setGrnPO(e.target.value)}
                    placeholder="e.g. PO-2026-4412"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Vendor Supplier *</label>
                  <select
                    value={grnVendor}
                    onChange={(e) => setGrnVendor(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:outline-hidden font-semibold"
                  >
                    {vendors.map(v => (
                      <option key={v.id} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                </div>

                {/* Sub Item */}
                <div className="bg-slate-50 p-3.5 rounded-lg border space-y-3">
                  <span className="block text-[9px] font-extrabold uppercase text-slate-500 border-b pb-1">Incoming Consumable Details</span>
                  
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Item Name *</label>
                    <input
                      type="text"
                      required
                      value={grnItemName}
                      onChange={(e) => setGrnItemName(e.target.value)}
                      placeholder="e.g. Propofol Injection 10mg/mL"
                      className="w-full text-center text-xs bg-white border rounded p-1.5 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Quantity</label>
                      <input
                        type="number"
                        value={grnItemQty}
                        onChange={(e) => setGrnItemQty(parseInt(e.target.value) || 0)}
                        className="w-full text-center text-xs bg-white border rounded p-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Unit Price (₹)</label>
                      <input
                        type="number"
                        value={grnItemPrice}
                        onChange={(e) => setGrnItemPrice(parseInt(e.target.value) || 0)}
                        className="w-full text-center text-xs bg-white border rounded p-1.5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Batch Code</label>
                      <input
                        type="text"
                        value={grnBatch}
                        onChange={(e) => setGrnBatch(e.target.value)}
                        className="w-full text-center text-xs bg-white border rounded p-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Expiry Date</label>
                      <input
                        type="date"
                        value={grnExpiry}
                        onChange={(e) => setGrnExpiry(e.target.value)}
                        className="w-full text-center text-xs bg-white border rounded p-1.5 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-650 hover:bg-indigo-700 text-slate-100 font-bold text-xs py-2.5 rounded-lg cursor-pointer transition flex items-center justify-center gap-2"
                >
                  Confirm Cargo Check & Store Stock
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Render Vendors */}
      {activeTab === "vendors" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Hospital Approved Vendors Directory</h3>
                <p className="text-[11px] text-slate-500">Registered drugs, therapeutics & supplies CDSCO providers board</p>
              </div>

              <div className="divide-y divide-slate-100">
                {vendors.map(v => (
                  <div key={v.id} className="p-4 hover:bg-slate-50 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-950 font-bold text-sm">{v.name}</strong>
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md uppercase border ${
                          v.contractStatus === "Active" ? "bg-green-50 text-green-700 border-green-250" : "bg-amber-50 text-amber-700 border-amber-255"
                        }`}>
                          {v.contractStatus}
                        </span>
                      </div>
                      <div className="text-slate-450 font-mono text-[10px]">Vendor ID: {v.id} • CDSCO GSTIN: {v.gstNumber}</div>
                      <div className="text-slate-600 mt-1 font-medium">Contact Person: <strong>{v.contactPerson}</strong></div>
                    </div>

                    <div className="text-right text-xs text-slate-500 font-mono space-y-0.5">
                      <div>📞 {v.phone}</div>
                      <div>✉ {v.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2 mb-4 flex items-center gap-2">
                <Truck className="h-4 w-4 text-orange-600" /> Register Certified Vendor
              </h3>

              <form onSubmit={handleCreateVendor} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Company legal Name *</label>
                  <input
                    type="text"
                    required
                    value={vName}
                    onChange={(e) => setVName(e.target.value)}
                    placeholder="e.g. Apex Biotech Distributers Pvt Ltd"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-605 uppercase mb-1">Key Account Manager *</label>
                  <input
                    type="text"
                    required
                    value={vContact}
                    onChange={(e) => setVContact(e.target.value)}
                    placeholder="e.g. Anand Sen"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">GSTIN Reg No *</label>
                    <input
                      type="text"
                      required
                      value={vGst}
                      onChange={(e) => setVGst(e.target.value)}
                      placeholder="e.g. 07AAAXXXX"
                      className="w-full text-center text-xs border rounded p-2 focus:outline-hidden font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Mobile Contact *</label>
                    <input
                      type="text"
                      required
                      value={vPhone}
                      onChange={(e) => setVPhone(e.target.value)}
                      placeholder="Mobile Phone"
                      className="w-full text-center text-xs border rounded p-2 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Business Email *</label>
                  <input
                    type="email"
                    required
                    value={vEmail}
                    onChange={(e) => setVEmail(e.target.value)}
                    placeholder="orders@apexbiotech.co.in"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-750 text-white font-extrabold text-xs py-2.5 rounded-lg cursor-pointer transition shadow-xs"
                >
                  Validate CDSCO Code & Contract
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
