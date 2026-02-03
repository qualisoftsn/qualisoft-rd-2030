/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Info } from 'lucide-react';

export default function AttendanceQR({ causerieId, token }: { causerieId: string, token: string }) {
  // Construction de l'URL sécurisée
  const attendanceUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/mobile/check-in?token=${token}` 
    : '';

  return (
    <div className="flex flex-col items-center p-12 bg-white rounded-[4rem] shadow-4xl border-[6px] border-blue-600 relative overflow-hidden group">
      {/* BACKGROUND DECOR */}
      <ShieldCheck className="absolute -right-8 -bottom-8 text-blue-500/5 w-48 h-48 -rotate-12" />

      <h3 className="text-2xl font-black uppercase italic mb-10 text-slate-900 tracking-tighter">
        SCANNER POUR <span className="text-blue-600">ÉMARGER</span>
      </h3>
      
      <div className="p-8 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 relative">
        <QRCodeSVG 
          value={attendanceUrl} 
          size={260}
          level="H"
          includeMargin={true}
          imageSettings={{
            src: "/logo-qualisoft.png", // Assure-toi que le logo est dans /public
            x: undefined,
            y: undefined,
            height: 50,
            width: 50,
            excavate: true,
          }}
        />
      </div>

      <div className="mt-10 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-xl">
          <Info size={14} />
          <span className="text-[10px] font-black uppercase italic tracking-widest">
            JETON TEMPORAIRE : 60 MIN
          </span>
        </div>
        <p className="text-[9px] font-bold text-slate-400 uppercase text-center leading-relaxed italic tracking-wider">
          CONFORMITÉ §7.3 - ISO 45001<br/>
          SENSIBILISATION & SENSIBILISATION SSE
        </p>
      </div>
    </div>
  );
}