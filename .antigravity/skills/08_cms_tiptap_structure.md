# Skill: Admin CMS Engine & Text Editor (Tiptap Integration)

## 1. Objectif du Module Éditeur
Ce skill régit la structure technique de l'éditeur de texte riche utilisé dans le panneau d'administration (`EditorPage.tsx` / `EditorPanel.tsx`)[cite: 1]. Cet outil permet de rédiger le contenu éditorial, les articles de presse et les récits culturels stockés dans MongoDB[cite: 1].

## 2. Architecture de l'Éditeur & Extensions Imposées
Lors de la configuration ou de la maintenance du composant basé sur `@tiptap/react`, utilise l'écosystème d'extensions suivant pour garantir un rendu propre et standardisé :

```typescript
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

// Configuration imposée du hook Tiptap
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: { levels: [2, 3, 4] }, // Interdit le H1 (réservé au titre de l'article en DB)
    }),
    Image.configure({
      HTMLAttributes: { class: 'rounded-xl max-w-full my-6 border border-stone-200' }
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { class: 'text-emerald-600 underline font-medium hover:text-emerald-700' }[cite: 1]
    }),
    Placeholder.configure({
      placeholder: 'Racontez l\'histoire du match, insérez les analyses techniques...'
    })
  ],
  content: '',
  onUpdate: ({ editor }) => {
    const html = editor.getHTML();
    // Toujours propager le contenu vers le state de formulaire (ex: React Hook Form)
  }
});