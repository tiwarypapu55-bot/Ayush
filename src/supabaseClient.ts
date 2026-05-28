import { createClient } from "@supabase/supabase-js";
import { Patient } from "./types";

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || "https://orivwcqebtfiztuddosy.supabase.co";
const SUPABASE_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "sb_publishable_Osj37t18anLhncZQj2hoqQ_KfkMvbH1";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Checks if the Supabase table exists and is accessible.
 * Will fall back gracefully if the table is not set up on Supabase yet.
 */
export async function checkSupabaseConnection(): Promise<{ connected: boolean; tableExists: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.from("patients").select("id").limit(1);
    if (error) {
      if (error.code === "PGRST116" || error.message?.includes("does not exist") || error.message?.includes("not found")) {
        return { connected: true, tableExists: false, error: "The 'patients' table is not yet created in your Supabase database." };
      }
      return { connected: false, tableExists: false, error: error.message };
    }
    return { connected: true, tableExists: true };
  } catch (err: any) {
    return { connected: false, tableExists: false, error: err.message || "Network error" };
  }
}

/**
 * Maps camelCase Patient model to snake_case schema columns for the PostgreSQL database
 */
export function mapPatientToDb(p: Patient) {
  return {
    id: p.id,
    name: p.name,
    guardian_name: p.guardianName || "",
    gender: p.gender,
    dob: p.dob,
    phone: p.phone,
    aadhaar: p.aadhaar || "Not Provided",
    address: p.address || "",
    state: p.state || "Delhi",
    district: p.district || "New Delhi",
    blood_group: p.bloodGroup || "O+",
    socioeconomic_category: p.socioeconomicCategory || "General",
    insurance_type: p.insuranceType || "Self-Pay",
    abha_id: p.abhaId || null,
    abha_number: p.abhaNumber || null,
    pmjay_id: p.pmjayId || null,
    registered_at: p.registeredAt || new Date().toISOString()
  };
}

/**
 * Maps PostgreSQL database snake_case columns back into Client interface Model
 */
export function mapDbToPatient(row: any): Patient {
  return {
    id: row.id,
    name: row.name,
    guardianName: row.guardian_name || "",
    gender: (row.gender === "Female" || row.gender === "Other") ? row.gender : "Male",
    dob: row.dob || "1990-01-01",
    phone: row.phone || "",
    aadhaar: row.aadhaar || "Not Provided",
    address: row.address || "",
    state: row.state || "Delhi",
    district: row.district || "New Delhi",
    bloodGroup: row.blood_group || "O+",
    socioeconomicCategory: row.socioeconomic_category || "General",
    insuranceType: (row.insurance_type === "Cashless PM-JAY" || row.insurance_type === "TPA Private") ? row.insurance_type : "Self-Pay",
    abhaId: row.abha_id || undefined,
    abhaNumber: row.abha_number || undefined,
    pmjayId: row.pmjay_id || undefined,
    registeredAt: row.registered_at || new Date().toISOString()
  };
}
