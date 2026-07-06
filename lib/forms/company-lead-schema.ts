import type { FormFieldDef } from './types'

export const COMPANY_LEAD_FIELDS: FormFieldDef[] = [
  {
    name: 'company_name',
    type: 'text',
    required: true,
    label: { fr: "Nom de l'entreprise", en: 'Company name' },
    placeholder: { fr: 'Transport ABC Inc.', en: 'ABC Transport Inc.' },
  },
  {
    name: 'contact_name',
    type: 'text',
    required: true,
    label: { fr: 'Nom du contact', en: 'Contact name' },
    placeholder: { fr: 'Jean Tremblay', en: 'John Smith' },
  },
  {
    name: 'phone',
    type: 'tel',
    required: true,
    label: { fr: 'Telephone', en: 'Phone' },
    placeholder: { fr: '(514) 555-1234', en: '(514) 555-1234' },
  },
  {
    name: 'email',
    type: 'email',
    required: true,
    label: { fr: 'Courriel', en: 'Email' },
    placeholder: { fr: 'contact@entreprise.ca', en: 'contact@company.ca' },
  },
  {
    name: 'message',
    type: 'textarea',
    full: true,
    label: { fr: 'Votre message (optionnel)', en: 'Your message (optional)' },
    placeholder: { fr: 'Decrivez brievement votre besoin...', en: 'Briefly describe your needs...' },
  },
]

export const COMPANY_LEAD_INTRO: { fr: string; en: string } = {
  fr: 'Remplissez ce court formulaire. On vous rappelle pour comprendre vos besoins, puis on vous envoie le formulaire detaille.',
  en: 'Fill out this short form. We will call you to understand your needs, then send you the detailed form.',
}
