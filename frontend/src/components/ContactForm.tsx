
import React, { useState } from 'react';

export default function ContactForm() {
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const response = await fetch("https://formspree.io/f/xojjjjld", {
      method: "POST",
      body: data,
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      setStatus("MERCI ! Votre demande a été envoyée. Nous vous répondrons très vite.");
      form.reset();
    } else {
      setStatus("Oups ! Il y a eu un problème. Veuillez réessayer.");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Demander une démo Qualisoft Elite</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nom de l&apos;entreprise</label>
          <input type="text" name="company" required className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">Votre Email</label>
          <input type="email" name="email" required className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">Message</label>
          <textarea name="message" rows={4} className="w-full border p-2 rounded"></textarea>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Envoyer ma demande
        </button>
        {status && <p className="mt-4 text-green-600 font-medium">{status}</p>}
      </form>
    </div>
  );
}