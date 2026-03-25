# 🎨 QS Elite Design System - Reference Document

**Extrait de QSTresor → Qualisoft Elite**  
**Date:** 19 Mars 2026  
**Version:** 1.0

---

## 📋 Table des Matières

1. [Configuration Tailwind](#1-configuration-tailwind)
2. [Palette de Couleurs](#2-palette-de-couleurs)
3. [Typographie](#3-typographie)
4. [Composants UI](#4-composants-ui)
5. [Patterns de Layout](#5-patterns-de-layout)
6. [Composants Dashboard](#6-composants-dashboard)
7. [Accessibilité](#7-accessibilité)
8. [Exemples de Code](#8-exemples-de-code)

---

## 1. Configuration Tailwind

### `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

---

## 2. Palette de Couleurs

### Couleurs Principales (Dark Theme)

| Nom | Variable | Valeur | Usage |
|-----|----------|--------|-------|
| **Background** | `--background` | `#0B0F1A` | Fond principal |
| **Foreground** | `--foreground` | `#FFFFFF` | Texte principal |
| **Card** | `--card` | `#0F172A` | Cartes, panels |
| **Card Border** | `--card-border` | `rgba(255,255,255,0.05)` | Bordures cartes |
| **Primary** | `--primary` | `#3B82F6` | Actions principales |
| **Primary Hover** | `--primary-hover` | `#2563EB` | Hover actions |
| **Secondary** | `--secondary` | `#1E293B` | Éléments secondaires |
| **Muted** | `--muted` | `#64748B` | Texte secondaire |
| **Accent** | `--accent` | `#3B82F6` | Accents, liens |
| **Destructive** | `--destructive` | `#EF4444` | Erreurs, dangers |
| **Success** | `--success` | `#10B981` | Succès, validé |
| **Warning** | `--warning` | `#F59E0B` | Avertissements |
| **Info** | `--info` | `#3B82F6` | Informations |

### Couleurs Sémantiques par Statut

```css
/* Statuts */
.status-approved { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' }
.status-pending { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' }
.status-draft { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' }
.status-obsolete { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' }
.status-archived { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' }
```

### Dégradés Elite

```css
/* Dégradés de fond */
.gradient-hero { bg: 'bg-linear-to-b from-[#0B0F1A] via-[#0B0F1A]/80 to-[#0B0F1A]' }
.gradient-card { bg: 'bg-linear-to-br from-indigo-900/40 to-blue-900/20' }
.gradient-primary { bg: 'bg-linear-to-r from-blue-500 via-indigo-400 to-blue-600' }
.gradient-success { bg: 'bg-linear-to-br from-emerald-500 to-emerald-700' }
.gradient-warning { bg: 'bg-linear-to-br from-amber-500 to-orange-600' }
.gradient-danger { bg: 'bg-linear-to-br from-rose-500 to-red-700' }
```

---

## 3. Typographie

### Font Family

```css
font-family: system-ui, -apple-system, sans-serif;
font-style: italic; /* Signature Elite */
font-weight: 900; /* font-black pour titres */
```

### Hiérarchie Typographique

| Élément | Classes | Usage |
|---------|---------|-------|
| **H1** | `text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter italic` | Titres principaux |
| **H2** | `text-2xl md:text-3xl font-black uppercase italic` | Titres section |
| **H3** | `text-xl md:text-2xl font-black uppercase italic` | Sous-titres |
| **H4** | `text-lg font-black uppercase italic` | Titres cartes |
| **Body** | `text-sm md:text-base font-medium` | Contenu principal |
| **Caption** | `text-[8px] md:text-[9px] font-black uppercase tracking-widest` | Légendes, metadata |
| **Button** | `text-[9px] md:text-[10px] font-black uppercase tracking-widest` | Boutons |

### Tracking & Spacing

```css
/* Tracking (letter-spacing) */
tracking-tighter  /* Titres */
tracking-tight    /* Sous-titres */
tracking-normal   /* Body */
tracking-wide     /* Captions */
tracking-wider    /* Labels */
tracking-widest   /* Buttons, badges */

/* Line Height */
leading-none      /* Titres */
leading-tight     /* Sous-titres */
leading-relaxed   /* Body text */
```

---

## 4. Composants UI

### 4.1 Button

```tsx
// Primaire
<button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/30">
  Action
</button>

// Secondaire
<button className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10">
  Action
</button>

// Ghost
<button className="text-slate-400 hover:text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">
  Action
</button>

// Icon Button
<button className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
  <Icon size={16} />
</button>
```

### 4.2 Card

```tsx
<Card className="bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-7 hover:border-blue-500/30 transition-all shadow-2xl">
  <CardHeader>
    <CardTitle className="text-lg font-black uppercase italic text-white">Titre</CardTitle>
    <CardDescription className="text-[10px] text-slate-500">Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Contenu */}
  </CardContent>
</Card>
```

### 4.3 Input

```tsx
<input
  className="w-full bg-[#0B0F1A] border border-white/10 rounded-xl p-3 md:p-4 text-[10px] md:text-[11px] text-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30 placeholder:text-slate-600"
  placeholder="Placeholder..."
/>
```

### 4.4 Select

```tsx
<select
  className="w-full bg-[#0B0F1A] border border-white/10 rounded-xl p-3 md:p-4 text-[10px] md:text-[11px] text-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30 cursor-pointer appearance-none"
>
  <option value="">Sélectionner...</option>
</select>
```

### 4.5 Badge

```tsx
// Statut
<span className="px-2.5 py-1 rounded-full border text-[8px] md:text-[9px] font-black uppercase italic tracking-widest bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
  Approuvé
</span>

// Plan
<span className="px-3 py-1 bg-blue-600 text-[8px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-lg shadow-blue-600/30 whitespace-nowrap text-white">
  Recommandé
</span>
```

### 4.6 Table

```tsx
<table className="w-full text-left">
  <thead>
    <tr className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
      <th className="px-4 md:px-6 py-3 md:py-4">Colonne</th>
    </tr>
  </thead>
  <tbody className="divide-y divide-white/5">
    <tr className="hover:bg-white/5 transition-all">
      <td className="px-4 md:px-6 py-4 text-[10px] md:text-[11px]">Donnée</td>
    </tr>
  </tbody>
</table>
```

### 4.7 Modal/Dialog

```tsx
<div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
  <div className="bg-[#0F172A] border border-white/10 rounded-2xl md:rounded-3xl w-full max-w-xl shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
    <header className="sticky top-0 bg-[#0F172A]/95 backdrop-blur-md z-20 flex justify-between items-center px-5 md:px-8 py-4 md:py-6 border-b border-white/5">
      <h2 className="text-lg md:text-xl font-black uppercase italic text-white">Titre</h2>
      <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all">
        <X size={20} />
      </button>
    </header>
    <div className="p-5 md:p-8">
      {/* Contenu */}
    </div>
  </div>
</div>
```

### 4.8 Toast/Notification

```tsx
// Utilisation avec sonner
toast.success('Action réussie', { duration: 3000 });
toast.error('Erreur survenue', { duration: 5000 });
toast.loading('Chargement...', { duration: 2000 });
```

---

## 5. Patterns de Layout

### 5.1 Dashboard Layout (100dvh)

```tsx
<div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden">
  {/* Header Fixe */}
  <header className="shrink-0 px-6 py-4 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40">
    {/* Contenu header */}
  </header>

  {/* Toolbar/Filtres */}
  <nav className="shrink-0 px-6 py-3 border-b border-white/5 bg-black/20">
    {/* Filtres */}
  </nav>

  {/* Main Content (Scroll Isolé) */}
  <main className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#0B0F1A]">
    {/* Contenu scrollable */}
  </main>
</div>
```

### 5.2 Sidebar + Main Content

```tsx
<div className="h-screen flex">
  {/* Sidebar Fixe */}
  <aside className="w-[300px] h-full flex flex-col bg-[#0B0F1A] border-r border-white/5 shadow-2xl shrink-0">
    {/* Branding */}
    <header className="h-24 flex items-center gap-5 px-8 border-b border-white/5">
      {/* Logo + Titre */}
    </header>
    
    {/* Navigation */}
    <nav className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
      {/* Items navigation */}
    </nav>
    
    {/* Footer User */}
    <footer className="p-6 bg-[#0F172A]/80 border-t border-white/5">
      {/* User info + Logout */}
    </footer>
  </aside>

  {/* Main Content */}
  <div className="flex-1 flex flex-col min-w-0">
    {/* Header + Content */}
  </div>
</div>
```

### 5.3 Grid Layouts

```tsx
// KPI Cards (2-4 colonnes)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
  {/* Cards */}
</div>

// Content Grid (2-3 colonnes)
<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
  {/* Cards */}
</div>

// Main + Sidebar
<div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
  <div className="xl:col-span-8">
    {/* Main content */}
  </div>
  <div className="xl:col-span-4">
    {/* Sidebar content */}
  </div>
</div>
```

---

## 6. Composants Dashboard

### 6.1 Metric/KPI Card

```tsx
<div className="bg-[#0F172A] border border-white/5 rounded-2xl p-5 md:p-7 hover:border-blue-500/30 transition-all shadow-2xl">
  <div className="flex items-center gap-4 mb-4">
    <div className="p-3 bg-blue-600/20 rounded-xl">
      <Icon size={20} className="text-blue-400" />
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Titre</span>
  </div>
  <p className="text-2xl md:text-3xl font-black italic text-white">{value}</p>
  {trend && (
    <div className="flex items-center gap-2 mt-2">
      <TrendingUp size={14} className="text-emerald-400" />
      <span className="text-[8px] font-black uppercase text-emerald-400">{trend}</span>
    </div>
  )}
</div>
```

### 6.2 Alert Banner

```tsx
<div className="p-4 md:p-5 rounded-2xl border flex items-start gap-3 bg-rose-500/10 border-rose-500/20">
  <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
  <div>
    <p className="text-[10px] font-black uppercase tracking-wider text-rose-400">Titre alerte</p>
    <p className="text-[10px] text-slate-400 mt-1">Description de l'alerte</p>
  </div>
</div>
```

### 6.3 Progress Bar

```tsx
<div className="w-full bg-black/40 rounded-full h-2 overflow-hidden">
  <div 
    className="h-full bg-blue-600 rounded-full transition-all duration-500"
    style={{ width: `${progress}%` }}
  />
</div>
```

### 6.4 Empty State

```tsx
<div className="h-64 md:h-80 border-2 border-dashed border-white/10 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center text-slate-500">
  <Archive size={48} md:size={64} className="mb-3 md:mb-4 opacity-10" />
  <p className="font-black uppercase italic text-[9px] md:text-[10px] tracking-widest text-center px-4">
    Aucun élément trouvé
  </p>
  <button className="mt-4 text-[8px] md:text-[9px] text-blue-400 hover:text-blue-300 uppercase tracking-widest italic underline">
    Créer le premier élément
  </button>
</div>
```

### 6.5 Loading State

```tsx
<div className="h-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-4 md:gap-6">
  <Loader2 className="animate-spin text-blue-500" size={40} md:size={48} />
  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.35em] italic text-slate-400">
    Chargement en cours...
  </p>
</div>
```

---

## 7. Accessibilité

### ARIA Labels

```tsx
// Buttons
<button aria-label="Description de l'action" title="Tooltip">
  <Icon aria-hidden="true" />
</button>

// Inputs
<label htmlFor="input-id" className="sr-only">Label</label>
<input id="input-id" aria-required="true" aria-invalid={!!error} />

// Navigation
<nav role="navigation" aria-label="Menu principal">
  {/* Items */}
</nav>

// Status
<div role="status" aria-live="polite">
  {/* Messages dynamiques */}
</div>
```

### Focus States

```css
:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0B0F1A]
```

### Keyboard Navigation

```tsx
onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    // Action
  }
}}
```

---

## 8. Exemples de Code

### 8.1 Page Dashboard Complète

```tsx
'use client';

export default function DashboardPage() {
  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      {/* Header */}
      <header className="shrink-0 px-6 py-4 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic text-white">
            Titre <span className="text-blue-500">Principal</span>
          </h1>
          <Button onClick={handleAction}>
            <Plus size={16} /> Action
          </Button>
        </div>
      </header>

      {/* Toolbar */}
      <nav className="shrink-0 px-6 py-3 border-b border-white/5 bg-black/20 flex items-center gap-4">
        <Input placeholder="Rechercher..." className="w-64" />
        <Select>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filtre" />
          </SelectTrigger>
        </Select>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#0B0F1A]">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          {/* Metric Cards */}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main + Sidebar */}
        </div>
      </main>
    </div>
  );
}
```

### 8.2 Formulaire avec Validation

```tsx
<form onSubmit={handleSubmit} className="space-y-5">
  <div className="space-y-2">
    <label htmlFor="nom" className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2 block">
      Nom *
    </label>
    <input
      id="nom"
      name="nom"
      required
      className={cn(
        "w-full bg-[#0B0F1A] border rounded-xl p-3 md:p-4 text-[10px] md:text-[11px] text-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30",
        errors.nom ? "border-rose-500/50" : "border-white/10"
      )}
    />
    {errors.nom && (
      <p className="text-rose-400 text-[9px] ml-2 flex items-center gap-1">
        <AlertCircle size={10} /> {errors.nom}
      </p>
    )}
  </div>

  <Button type="submit" disabled={isSubmitting}>
    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
    {isSubmitting ? 'Traitement...' : 'Enregistrer'}
  </Button>
</form>
```

### 8.3 Table avec Actions

```tsx
<table className="w-full text-left">
  <thead>
    <tr className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
      <th className="px-4 md:px-6 py-3 md:py-4">Colonne 1</th>
      <th className="px-4 md:px-6 py-3 md:py-4">Colonne 2</th>
      <th className="px-4 md:px-6 py-3 md:py-4 text-right">Actions</th>
    </tr>
  </thead>
  <tbody className="divide-y divide-white/5">
    {items.map((item) => (
      <tr key={item.id} className="hover:bg-white/5 transition-all group">
        <td className="px-4 md:px-6 py-4 text-[10px] md:text-[11px]">{item.col1}</td>
        <td className="px-4 md:px-6 py-4 text-[10px] md:text-[11px]">{item.col2}</td>
        <td className="px-4 md:px-6 py-4 text-right">
          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ActionButton icon={Edit} onClick={() => handleEdit(item)} color="blue" />
            <ActionButton icon={Trash} onClick={() => handleDelete(item)} color="rose" />
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

---

## 📝 Checklist pour Chaque Nouvelle Page

Avant de soumettre une page pour correction, vérifier :

```markdown
## Structure
- [ ] Layout 100dvh avec scroll isolé
- [ ] Header fixe + Toolbar + Main content
- [ ] Responsive (mobile, tablet, desktop)

## Typographie
- [ ] Font-black pour titres
- [ ] Uppercase + Italic pour cohérence Elite
- [ ] Tracking approprié (tighter pour titres, widest pour buttons)

## Couleurs
- [ ] Background: #0B0F1A
- [ ] Cards: #0F172A
- [ ] Primary: #3B82F6
- [ ] Status colors (emerald, amber, rose, slate)

## Composants
- [ ] Buttons avec hover states
- [ ] Inputs avec focus states
- [ ] Cards avec borders subtiles
- [ ] Icons Lucide React

## Accessibilité
- [ ] ARIA labels sur buttons/icons
- [ ] Focus states visibles
- [ ] Keyboard navigation
- [ ] Error messages avec role="alert"

## Performance
- [ ] Loading states
- [ ] Empty states
- [ ] Error handling
- [ ] Toast notifications
```

---

## 🎯 Comment Utiliser Ce Document

1.  **Pour chaque nouvelle page** : Copier les patterns depuis ce document
2.  **Pour corrections** : Comparer avec les standards définis ici
3.  **Pour nouveaux composants** : Suivre les exemples de code
4.  **Pour consistency** : Vérifier couleurs, typography, spacing

---

**Document maintenu à jour avec chaque extraction QSTresor → Qualisoft Elite**  
**Dernière mise à jour :** 19 Mars 2026

---

✅ **Ce fichier `qselite.md` est maintenant ta référence unique pour tout le design system !**

À chaque fois que tu me soumets une page du projet Elite, je me référerai à ce document pour :
- ✅ Corriger les erreurs JSX (`md:size` → `className`)
- ✅ Appliquer les couleurs Elite (`#0B0F1A`, `#3B82F6`, etc.)
- ✅ Uniformiser la typographie (font-black, uppercase, italic)
- ✅ Standardiser les composants (buttons, cards, inputs, tables)
- ✅ Garantir l'accessibilité (ARIA, focus states, keyboard nav)

**Prêt pour la prochaine page !** 🚀