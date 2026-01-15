/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// 1. Interface alignée sur les données envoyées par la page parente
interface ReclamationListProps {
  reclamations: any[];
  T_Id: string;
  onRefresh: () => Promise<void>;
}

// 2. Correction : On déstructure TOUTES les props ici (reclamations, T_Id, onRefresh)
export default function ReclamationList({
  reclamations,
  T_Id,
  onRefresh,
}: ReclamationListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "NOUVELLE":
        return "bg-blue-100 text-blue-800";
      case "EN_ANALYSE":
        return "bg-yellow-100 text-yellow-800";
      case "TRAITEE":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-3.5 text-left text-xs font-bold uppercase text-gray-500">
              Référence
            </th>
            <th className="px-3 py-3.5 text-left text-xs font-bold uppercase text-gray-500">
              Objet
            </th>
            <th className="px-3 py-3.5 text-left text-xs font-bold uppercase text-gray-500">
              Client
            </th>
            <th className="px-3 py-3.5 text-left text-xs font-bold uppercase text-gray-500">
              Statut
            </th>
            <th className="px-3 py-3.5 text-left text-xs font-bold uppercase text-gray-500">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {reclamations && reclamations.length > 0 ? (
            reclamations.map((rec) => (
              <tr key={rec.REC_Id}>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-blue-600">
                  {rec.REC_Reference}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">
                  {rec.REC_Object}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">
                  {rec.REC_Tier?.TR_Name || "N/A"}
                </td>
                <td className="px-3 py-4 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(
                      rec.REC_Status
                    )}`}
                  >
                    {rec.REC_Status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {rec.REC_DateReceipt
                    ? new Date(rec.REC_DateReceipt).toLocaleDateString()
                    : "N/A"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={5}
                className="px-3 py-4 text-sm text-center text-gray-500 italic"
              >
                Aucune réclamation trouvée.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
