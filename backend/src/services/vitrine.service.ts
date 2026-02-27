/**
 * VITRINE SERVICE - GESTION DU FLUX SORTANT VERS QUALISOFT.SN
 */
export const vitrineApi = {
  // Récupérer les contenus pour l'admin
  getAll: async () => {
    const res = await fetch('/api/admin/vitrine');
    return res.json();
  },

  // Publier ou modifier (Upsert)
  save: async (data: any) => {
    const res = await fetch('/api/admin/vitrine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Supprimer un contenu
  delete: async (id: string) => {
    const res = await fetch(`/api/admin/vitrine?id=${id}`, { method: 'DELETE' });
    return res.json();
  }
};