"use client";

import apiClient from "@/core/api/api-client";
import {
  Archive,
  Edit,
  Mail,
  RefreshCcw,
  ShieldAlert,
  Star,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function HRIntelligenceHub() {
  const [activeView, setActiveView] = useState("MATRIX");
  const [data, setData] = useState({
    users: [],
    competences: [],
    formations: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tenantId, setTenantId] = useState<string | null>(null);

  // 1️⃣ INITIALISATION ET SYNCHRO NOYAU
  useEffect(() => {
    const storage = localStorage.getItem("qualisoft-auth-storage");
    if (storage) {
      try {
        const parsed = JSON.parse(storage);
        setTenantId(parsed.state?.user?.tenantId || null);
      } catch (e) {
        console.error("Erreur lecture storage");
      }
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const [matrixRes, formsRes] = await Promise.all([
        apiClient
          .get("/competences/matrix")
          .catch(() => ({ data: { users: [], competences: [] } })),
        apiClient.get("/formations").catch(() => ({ data: [] })),
      ]);

      setData({
        users: Array.isArray(matrixRes.data.users) ? matrixRes.data.users : [],
        competences: Array.isArray(matrixRes.data.competences)
          ? matrixRes.data.competences
          : [],
        formations: Array.isArray(formsRes.data) ? formsRes.data : [],
      });
    } catch (e) {
      console.error("🚨 ÉCHEC SYNCHRO RH");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    if (tenantId) fetchData();
  }, [fetchData, tenantId]);

  // 2️⃣ MOTEUR DE CALCULS ISO (RISQUES)
  const stats = useMemo(() => {
    const activeUsers = data.users.filter((u: any) => u.U_IsActive !== false);
    if (activeUsers.length === 0 || data.competences.length === 0)
      return { avg: 0, coverage: 0, gaps: 0 };

    let totalGaps = 0;
    activeUsers.forEach((u: any) => {
      data.competences.forEach((c: any) => {
        const lvl =
          u.U_Competences?.find((uc: any) => uc.UC_CompetenceId === c.CP_Id)
            ?.UC_NiveauActuel || 0;
        if (lvl < c.CP_NiveauRequis) totalGaps++;
      });
    });

    const coverage =
      100 - (totalGaps / (activeUsers.length * data.competences.length)) * 100;
    return { avg: 2.5, coverage: coverage.toFixed(1), gaps: totalGaps };
  }, [data]);

  // 3️⃣ ACTIONS CRUD
  const handleEvaluate = async (
    userId: string,
    compId: string,
    current: number,
  ) => {
    const next = current >= 4 ? 0 : current + 1;
    await apiClient.post("/competences/evaluate", {
      userId,
      competenceId: compId,
      level: next,
    });
    fetchData();
  };

  const filteredUsers = data.users.filter((u: any) =>
    `${u.U_FirstName} ${u.U_LastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen text-white italic ml-72 font-sans">
      {/* HEADER NOYAU */}
      <header className="flex justify-between items-end border-b border-white/5 pb-10 mb-10">
        <div>
          <h1 className="text-7xl font-black uppercase tracking-tighter italic leading-none">
            RH <span className="text-blue-600">Master</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-4">
            Intelligence GPEC & Management des Ressources
          </p>
        </div>
        <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
          {["MATRIX", "EMPLOYEES", "RISKS", "FORMATIONS"].map((v) => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeView === v ? "bg-blue-600 shadow-lg" : "text-slate-500 hover:text-white"}`}
            >
              {v}
            </button>
          ))}
        </div>
      </header>

      {/* CONTENU DYNAMIQUE */}
      <div className="bg-slate-900/40 border border-white/5 rounded-[4rem] min-h-[600px] backdrop-blur-3xl overflow-hidden shadow-3xl">
        {loading ? (
          <div className="flex h-96 items-center justify-center font-black uppercase text-blue-500 text-[10px] tracking-[0.5em] animate-pulse">
            <RefreshCcw className="animate-spin mr-3" /> Synchronisation...
          </div>
        ) : (
          <>
            {/* 🔵 VUE MATRIX */}
            {activeView === "MATRIX" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/5">
                      <th className="p-10 text-[10px] font-black uppercase text-slate-500 sticky left-0 bg-[#0B0F1A] border-r border-white/5 z-20">
                        Collaborateurs ({filteredUsers.length})
                      </th>
                      {data.competences.map((c: any) => (
                        <th
                          key={c.CP_Id}
                          className="p-8 text-center min-w-40 border-l border-white/5"
                        >
                          <span className="text-[10px] font-black uppercase text-slate-300 block mb-2">
                            {c.CP_Name}
                          </span>
                          <span className="text-[8px] font-black px-2 py-1 bg-blue-500/10 text-blue-500 rounded uppercase">
                            REQ: L{c.CP_NiveauRequis}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((u: any) => (
                      <tr
                        key={u.U_Id}
                        className="hover:bg-blue-600/5 transition-all"
                      >
                        <td className="p-8 sticky left-0 bg-[#0B0F1A] border-r border-white/5 z-10">
                          <p className="font-black uppercase text-sm leading-none italic">
                            {u.U_FirstName} {u.U_LastName}
                          </p>
                          <p className="text-[8px] text-slate-500 font-bold uppercase mt-2">
                            {u.U_Role}
                          </p>
                        </td>
                        {data.competences.map((c: any) => {
                          const lvl =
                            u.U_Competences?.find(
                              (uc: any) => uc.UC_CompetenceId === c.CP_Id,
                            )?.UC_NiveauActuel || 0;
                          const isGap = lvl < c.CP_NiveauRequis;
                          return (
                            <td
                              key={c.CP_Id}
                              className="p-4 text-center border-l border-white/5"
                            >
                              <button
                                onClick={() =>
                                  handleEvaluate(u.U_Id, c.CP_Id, lvl)
                                }
                                className={`w-12 h-12 rounded-xl flex items-center justify-center font-black transition-all border-2 ${isGap ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-blue-600/20 text-blue-400 border-blue-500/40 shadow-lg"}`}
                              >
                                {lvl}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 👥 VUE EMPLOYEES */}
            {activeView === "EMPLOYEES" && (
              <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredUsers.map((u: any) => (
                  <div
                    key={u.U_Id}
                    className="bg-white/5 border border-white/10 p-8 rounded-[3rem] hover:border-blue-500 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center text-xl font-black text-blue-500 not-italic">
                        {u.U_FirstName[0]}
                        {u.U_LastName[0]}
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button className="p-2 bg-white/5 rounded-lg hover:bg-blue-600">
                          <Edit size={14} />
                        </button>
                        <button className="p-2 bg-white/5 rounded-lg hover:bg-red-600">
                          <Archive size={14} />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-xl font-black uppercase italic leading-none">
                      {u.U_FirstName} {u.U_LastName}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-2 tracking-widest">
                      {u.U_Role}
                    </p>
                    <div className="mt-8 space-y-2 border-t border-white/5 pt-6">
                      <p className="text-[10px] flex items-center gap-3 text-slate-400 font-bold">
                        <Mail size={12} /> {u.U_Email}
                      </p>
                      <p className="text-[10px] flex items-center gap-3 text-slate-400 font-bold">
                        <Star size={12} className="text-amber-500" />{" "}
                        {u.U_Competences?.length || 0} Compétences
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ⚠️ VUE RISKS */}
            {activeView === "RISKS" && (
              <div className="p-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20 text-left">
                  <div className="p-10 bg-blue-600/10 border border-blue-500/20 rounded-[3.5rem]">
                    <TrendingUp className="text-blue-500 mb-6" size={40} />
                    <p className="text-6xl font-black italic">
                      {stats.coverage}%
                    </p>
                    <p className="text-[10px] font-black uppercase text-slate-500 mt-4 tracking-[0.3em]">
                      Taux de couverture SMI
                    </p>
                  </div>
                  <div className="p-10 bg-red-600/10 border border-red-500/20 rounded-[3.5rem]">
                    <ShieldAlert className="text-red-500 mb-6" size={40} />
                    <p className="text-6xl font-black italic">{stats.gaps}</p>
                    <p className="text-[10px] font-black uppercase text-slate-500 mt-4 tracking-[0.3em]">
                      Écarts critiques détectés
                    </p>
                  </div>
                </div>
                <h3 className="text-2xl font-black uppercase italic mb-10 border-l-4 border-blue-600 pl-6">
                  Criticité par <span className="text-blue-500">Profil</span>
                </h3>
                <div className="space-y-4">
                  {data.users
                    .map((u: any) => {
                      const gaps = data.competences.filter(
                        (c: any) =>
                          (u.U_Competences?.find(
                            (uc: any) => uc.UC_CompetenceId === c.CP_Id,
                          )?.UC_NiveauActuel || 0) < c.CP_NiveauRequis,
                      ).length;
                      return (
                        <div
                          key={u.U_Id}
                          className="bg-white/5 border border-white/10 p-8 rounded-3xl flex items-center justify-between group hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-center gap-6">
                            <div
                              className={`w-3 h-3 rounded-full ${gaps > 2 ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`}
                            />
                            <p className="font-black uppercase italic text-white text-lg">
                              {u.U_FirstName} {u.U_LastName}
                            </p>
                          </div>
                          <div className="flex items-center gap-10">
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                              {gaps} Écarts
                            </p>
                            <span
                              className={`text-[10px] font-black px-6 py-2 rounded-full border ${gaps > 2 ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}`}
                            >
                              {gaps > 2
                                ? "ALERTE CRITIQUE"
                                : "SITUATION CONFORME"}
                            </span>
                          </div>
                        </div>
                      );
                    })
                    .sort((a: any, b: any) => b.gaps - a.gaps)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
