/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { QRCodeSVG } from 'qrcode.react'; // npm install qrcode.react
import { useState, useEffect } from 'react';

export default function AttendanceQR({ causerieId, token }: { causerieId: string, token: string }) {
  // L'URL que le participant va scanner
  const attendanceUrl = `${window.location.origin}/mobile/check-in?token=${token}`;

  return (
    <div className="flex flex-col items-center p-10 bg-white rounded-[3rem] shadow-2xl border-4 border-blue-600">
      <h3 className="text-xl font-black uppercase italic mb-6 text-slate-900">Scanner pour Émarger</h3>
      
      <div className="p-4 bg-slate-100 rounded-3xl border-2 border-dashed border-slate-300">
        <QRCodeSVG 
          value={attendanceUrl} 
          size={256}
          level="H"
          includeMargin={true}
          imageSettings={{
            src: "/logo-qualisoft.png",
            x: undefined, y: undefined, height: 40, width: 40, excavate: true,
          }}
        />
      </div>

      <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase text-center">
        Ce code expire dans 60 minutes<br/>
        Conformité §7.3 - Sensibilisation SSE
      </p>
    </div>
  );
}