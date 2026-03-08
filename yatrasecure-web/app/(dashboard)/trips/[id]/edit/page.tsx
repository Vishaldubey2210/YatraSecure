"use client";
import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Calendar, Wallet, FileText, Globe, Lock, Loader2, AlertCircle, Save } from "lucide-react";
import { API_BASE_URL, getAccessToken } from "@/app/lib/api";
import toast from "react-hot-toast";

const TRIP_TYPES = ["Group", "Solo", "Family", "Adventure", "Pilgrimage", "Business"];

function fmtForInput(d: string) {
  return new Date(d).toISOString().split("T")[0];
}
function today() {
  return new Date().toISOString().split("T")[0];
}

export default function EditTripPage() {
  const params  = useParams();
  const router  = useRouter();
  const tripId  = params.id as string;

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState("");
  const [isDirty, setIsDirty]         = useState(false);
  const [originalTrip, setOriginalTrip] = useState<any>(null);

  const [form, setForm] = useState({
    name: "", fromCity: "", toCity: "", startDate: "",
    endDate: "", budget: "", tripType: "Group",
    description: "", isPublic: true,
  });
  const [fe, setFe] = useState<Record<string, string>>({});

  useEffect(() => { loadTrip(); }, [tripId]);

  useEffect(() => {
    if (!originalTrip) return;
    const changed =
      form.name        !== originalTrip.name ||
      form.fromCity    !== originalTrip.fromCity ||
      form.toCity      !== originalTrip.toCity ||
      form.startDate   !== fmtForInput(originalTrip.startDate) ||
      form.endDate     !== fmtForInput(originalTrip.endDate) ||
      form.budget      !== String(originalTrip.budget) ||
      form.tripType    !== originalTrip.tripType ||
      form.description !== (originalTrip.description || "") ||
      form.isPublic    !== originalTrip.isPublic;
    setIsDirty(changed);
  }, [form, originalTrip]);

  // Warn before unload
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { if (isDirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  async function loadTrip() {
    try {
      const token      = getAccessToken();
      const storedUser = localStorage.getItem("user");
      const res        = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Trip not found");
      const data = await res.json();
      const cu   = storedUser ? JSON.parse(storedUser) : null;
      if (cu && data.adminId !== cu.id && data.admin?.id !== cu.id) {
        toast.error("Only the trip admin can edit");
        router.replace(`/trips/${tripId}`);
        return;
      }
      setOriginalTrip(data);
      setForm({
        name:        data.name,
        fromCity:    data.fromCity,
        toCity:      data.toCity,
        startDate:   fmtForInput(data.startDate),
        endDate:     fmtForInput(data.endDate),
        budget:      String(data.budget),
        tripType:    data.tripType || "Group",
        description: data.description || "",
        isPublic:    data.isPublic,
      });
    } catch (e: any) {
      toast.error(e.message);
      setError(e.message);
    } finally { setPageLoading(false); }
  }

  function validate(f: string, v: string): string {
    if (f === "name")      return !v.trim() ? "Required" : v.trim().length < 3 ? "Min 3 chars" : "";
    if (f === "fromCity")  return !v.trim() ? "Required" : "";
    if (f === "toCity")    return !v.trim() ? "Required" : v.trim().toLowerCase() === form.fromCity.trim().toLowerCase() ? "Must differ from departure" : "";
    if (f === "startDate") return !v ? "Required" : new Date(v) < new Date(today()) ? "Cannot be in the past" : "";
    if (f === "endDate")   return !v ? "Required" : new Date(v) <= new Date(form.startDate) ? "Must be after start date" : "";
    if (f === "budget")    return !v ? "Required" : Number(v) <= 0 ? "Must be > 0" : "";
    return "";
  }

  function change(f: string, v: any) {
    setForm(p => ({ ...p, [f]: v }));
    if (fe[f]) setFe(p => ({ ...p, [f]: validate(f, String(v)) }));
    setError("");
  }
  function blur(f: string) { setFe(p => ({ ...p, [f]: validate(f, String((form as any)[f])) })); }

  function validateAll(): boolean {
    const fields = ["name", "fromCity", "toCity", "startDate", "endDate", "budget"];
    const errs: Record<string, string> = {};
    fields.forEach(f => { errs[f] = validate(f, String((form as any)[f])); });
    setFe(errs);
    return !Object.values(errs).some(Boolean);
  }

  function handleReset() {
    if (!originalTrip) return;
    setForm({
      name: originalTrip.name, fromCity: originalTrip.fromCity, toCity: originalTrip.toCity,
      startDate: fmtForInput(originalTrip.startDate), endDate: fmtForInput(originalTrip.endDate),
      budget: String(originalTrip.budget), tripType: originalTrip.tripType || "Group",
      description: originalTrip.description || "", isPublic: originalTrip.isPublic,
    });
    setFe({}); setError("");
    toast.success("Changes discarded");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateAll()) { toast.error("Fix errors before saving"); return; }
    if (!isDirty)       { toast("No changes to save", { icon: "ℹ️" }); return; }
    setSaving(true); setError("");
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          budget: Number(form.budget),
          startDate: new Date(form.startDate).toISOString(),
          endDate:   new Date(form.endDate).toISOString(),
          description: form.description.trim() || null,
        }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.message || "Failed"); }
      const updated = await res.json();
      setOriginalTrip(updated);
      setIsDirty(false);
      toast.success("Trip updated!");
      router.push(`/trips/${tripId}`);
    } catch (err: any) { setError(err.message || "Something went wrong"); }
    finally { setSaving(false); }
  }

  const inpStyle = (hasErr: boolean): React.CSSProperties => ({
    paddingLeft: 42,
    border:     `1.5px solid ${hasErr ? "#ef4444" : "#1e293b"}`,
    boxShadow:   hasErr ? "0 0 0 3px rgba(239,68,68,0.1)" : "none",
  });

  // ── Loading skeleton ──
  if (pageLoading) return (
    <div className="anim-in" style={{ maxWidth: 680, margin: "0 auto" }}>
      {[40, 240, 180, 160].map((h, i) => (
        <div key={i} style={{ height: h, borderRadius: 16, background: "#1a2744", marginBottom: 16, animation: "pulse 1.5s ease-in-out infinite" }} />
      ))}
    </div>
  );

  const durationDays = form.startDate && form.endDate
    ? Math.ceil((new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / 86400000)
    : null;

  return (
    <div className="anim-in" style={{ maxWidth: 680, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 13, marginBottom: 16, padding: 0 }}>
          <ArrowLeft style={{ width: 15, height: 15 }} /> Back
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div>
            <h1 className="page-title">Edit Trip</h1>
            <p className="page-subtitle">Updating: <span style={{ color: "#94a3b8" }}>{originalTrip?.name}</span></p>
          </div>
          {isDirty && (
            <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#fbbf24", animation: "pulse 2s ease-in-out infinite" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fbbf24" }} /> Unsaved changes
            </span>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, marginBottom: 20, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
          <AlertCircle style={{ width: 15, height: 15, color: "#ef4444", flexShrink: 0 }} />
          <p style={{ color: "#ef4444", fontSize: 13, margin: 0 }}>{error}</p>
        </div>
      )}

      <form onSubmit={onSubmit}>

        {/* ── Basic Info ── */}
        <div className="card" style={{ padding: 24, marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 18 }}>Basic Information</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Name */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 7 }}>Trip Name</label>
              <div style={{ position: "relative" }}>
                <MapPin style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#475569", pointerEvents: "none" }} />
                <input className="input-field" style={inpStyle(!!fe.name)} placeholder="e.g. Manali Winter Trip" value={form.name} onChange={e => change("name", e.target.value)} onBlur={() => blur("name")} maxLength={100} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                {fe.name ? <p style={{ color: "#ef4444", fontSize: 11 }}>{fe.name}</p> : <span />}
                <p style={{ fontSize: 11, color: "#334155" }}>{form.name.length}/100</p>
              </div>
            </div>
            {/* From / To */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { key: "fromCity", label: "From City", ph: "Delhi" },
                { key: "toCity",   label: "To City",   ph: "Manali" },
              ].map(({ key, label, ph }) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 7 }}>{label}</label>
                  <div style={{ position: "relative" }}>
                    <MapPin style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#475569", pointerEvents: "none" }} />
                    <input className="input-field" style={inpStyle(!!(fe as any)[key])} placeholder={ph} value={(form as any)[key]} onChange={e => change(key, e.target.value)} onBlur={() => blur(key)} />
                  </div>
                  {(fe as any)[key] && <p style={{ color: "#ef4444", fontSize: 11, marginTop: 4 }}>{(fe as any)[key]}</p>}
                </div>
              ))}
            </div>
            {/* Trip type */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 10 }}>Trip Type</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {TRIP_TYPES.map(t => (
                  <button key={t} type="button" onClick={() => change("tripType", t)} style={{
                    padding: "7px 16px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer",
                    background: form.tripType === t ? "linear-gradient(135deg,#f97316,#fbbf24)" : "transparent",
                    border:     `1px solid ${form.tripType === t ? "transparent" : "#1e293b"}`,
                    color:      form.tripType === t ? "white" : "#475569",
                    boxShadow:  form.tripType === t ? "0 3px 10px rgba(249,115,22,0.3)" : "none",
                  }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Dates & Budget ── */}
        <div className="card" style={{ padding: 24, marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 18 }}>
            Dates & Budget
            {durationDays !== null && durationDays > 0 && (
              <span style={{ fontSize: 12, fontWeight: 500, color: "#64748b", marginLeft: 10 }}>({durationDays} day{durationDays !== 1 ? "s" : ""})</span>
            )}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            {[
              { key: "startDate", label: "Start Date", min: today() },
              { key: "endDate",   label: "End Date",   min: form.startDate || today() },
            ].map(({ key, label, min }) => (
              <div key={key}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 7 }}>{label}</label>
                <div style={{ position: "relative" }}>
                  <Calendar style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#475569", pointerEvents: "none" }} />
                  <input type="date" className="input-field" style={{ ...inpStyle(!!(fe as any)[key]), colorScheme: "dark" }} value={(form as any)[key]} onChange={e => change(key, e.target.value)} onBlur={() => blur(key)} min={min} />
                </div>
                {(fe as any)[key] && <p style={{ color: "#ef4444", fontSize: 11, marginTop: 4 }}>{(fe as any)[key]}</p>}
              </div>
            ))}
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 7 }}>Budget (₹)</label>
            <div style={{ position: "relative" }}>
              <Wallet style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#475569", pointerEvents: "none" }} />
              <input type="number" className="input-field" style={inpStyle(!!fe.budget)} placeholder="e.g. 15000" value={form.budget} onChange={e => change("budget", e.target.value)} onBlur={() => blur("budget")} min={1} />
            </div>
            {fe.budget && <p style={{ color: "#ef4444", fontSize: 11, marginTop: 4 }}>{fe.budget}</p>}
          </div>
        </div>

        {/* ── Details & Visibility ── */}
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 18 }}>Details & Visibility</h3>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 7 }}>
              Description <span style={{ color: "#334155" }}>(optional)</span>
            </label>
            <div style={{ position: "relative" }}>
              <FileText style={{ position: "absolute", left: 14, top: 14, width: 14, height: 14, color: "#475569", pointerEvents: "none" }} />
              <textarea className="input-field" style={{ paddingLeft: 42, minHeight: 90, resize: "vertical" }} placeholder="Tell travelers about this trip..." value={form.description} onChange={e => change("description", e.target.value)} />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 10 }}>Visibility</label>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { val: true,  icon: Globe, label: "Public",  desc: "Anyone can find and join" },
                { val: false, icon: Lock,  label: "Private", desc: "Only invited members"     },
              ].map(({ val, icon: Icon, label, desc }) => (
                <div key={label} onClick={() => change("isPublic", val)} style={{ flex: 1, padding: "13px 14px", borderRadius: 12, cursor: "pointer", transition: "all 0.15s", background: form.isPublic === val ? "rgba(249,115,22,0.1)" : "transparent", border: `1.5px solid ${form.isPublic === val ? "rgba(249,115,22,0.35)" : "#1e293b"}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                    <Icon style={{ width: 13, height: 13, color: form.isPublic === val ? "#f97316" : "#475569" }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: form.isPublic === val ? "white" : "#475569" }}>{label}</span>
                  </div>
                  <p style={{ fontSize: 11, color: "#334155", margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          <button type="submit" disabled={saving || !isDirty} className="btn-primary" style={{ flex: 1, padding: "14px", fontSize: 14, opacity: !isDirty ? 0.5 : 1 }}>
            {saving ? <><Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> Saving...</> : <><Save style={{ width: 16, height: 16 }} /> Save Changes</>}
          </button>
          {isDirty && (
            <button type="button" onClick={handleReset} className="btn-ghost" style={{ padding: "14px 22px", fontSize: 14 }}>
              Reset
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
