import type { FormSectionDef } from './types'
import { opt } from './form-utils'

const PROVINCES = [
  opt('Québec', 'Québec', 'Quebec'),
  opt('Ontario', 'Ontario', 'Ontario'),
  opt('Alberta', 'Alberta', 'Alberta'),
  opt('Colombie-Britannique', 'Colombie-Britannique', 'British Columbia'),
  opt('Manitoba', 'Manitoba', 'Manitoba'),
  opt('Saskatchewan', 'Saskatchewan', 'Saskatchewan'),
  opt('Nouvelle-Écosse', 'Nouvelle-Écosse', 'Nova Scotia'),
  opt('Nouveau-Brunswick', 'Nouveau-Brunswick', 'New Brunswick'),
  opt('Autre', 'Autre', 'Other'),
]

const YEARS_EXP = [
  opt('Moins de 1 an', 'Moins de 1 an', 'Less than 1 year'),
  opt('1-2 ans', '1-2 ans', '1-2 years'),
  opt('3-5 ans', '3-5 ans', '3-5 years'),
  opt('5-10 ans', '5-10 ans', '5-10 years'),
  opt('10+ ans', '10+ ans', '10+ years'),
]

const EQUIPMENT_OPERATED = [
  opt('Dry Van', 'Dry Van', 'Dry Van'),
  opt('Reefer', 'Reefer', 'Reefer'),
  opt('Flatbed', 'Flatbed', 'Flatbed'),
  opt('Citerne', 'Citerne', 'Tanker'),
  opt('Dompeur', 'Dompeur', 'Dump Truck'),
  opt('Container', 'Container', 'Container'),
  opt('Train Routier', 'Train Routier', 'Road Train'),
  opt('Moffat', 'Moffat', 'Moffat'),
  opt('Tailgate', 'Tailgate', 'Tailgate'),
  opt('Transpalette', 'Transpalette', 'Pallet Jack'),
  opt('Diable', 'Diable', 'Hand Truck'),
]

const LICENSE = [
  opt('Classe 1 FM', 'Classe 1 FM', 'Class 1 FM'),
  opt('Classe 1 F', 'Classe 1 F', 'Class 1 F'),
  opt('Classe 3 FM', 'Classe 3 FM', 'Class 3 FM'),
  opt('Classe 3 F', 'Classe 3 F', 'Class 3 F'),
]

const TRANSPORT = [
  opt('Local', 'Local', 'Local'),
  opt('Régional', 'Régional', 'Regional'),
  opt('Longue Distance Canada', 'Longue Distance Canada', 'Long Haul Canada'),
  opt('Longue Distance U.S.', 'Longue Distance U.S.', 'Long Haul U.S.'),
]

const POSITION_SOUGHT = [
  opt('Dry Van', 'Dry Van', 'Dry Van'),
  opt('Reefer', 'Reefer', 'Reefer'),
  opt('Flatbed', 'Flatbed', 'Flatbed'),
  opt('Container', 'Container', 'Container'),
  opt('Dompeur', 'Dompeur', 'Dump Truck'),
  opt('Citerne', 'Citerne', 'Tanker'),
  opt('Train Routier', 'Train Routier', 'Road Train'),
  opt('B-Train', 'B-Train', 'B-Train'),
  opt('Moffat', 'Moffat', 'Moffat'),
  opt('Tailgate', 'Tailgate', 'Tailgate'),
  opt('Transpalette', 'Transpalette', 'Pallet Jack'),
  opt('Diable', 'Diable', 'Hand Truck'),
  opt('Sans Manutention (Switch/Dock à Dock)', 'Sans Manutention (Switch/Dock à Dock)', 'No Handling (Switch/Dock to Dock)'),
  opt('Avec Manutention', 'Avec Manutention', 'With Handling'),
  opt('Shunter', 'Shunter', 'Shunter'),
]

const DISTANCE_REGION = [
  opt('Local', 'Local', 'Local'),
  opt('Régional', 'Régional', 'Regional'),
  opt('Longue Distance Canada', 'Longue Distance Canada', 'Long Haul Canada'),
  opt('Longue Distance U.S.', 'Longue Distance U.S.', 'Long Haul U.S.'),
]

const SCHEDULE = [
  opt('Jour', 'Jour', 'Day'),
  opt('Soir', 'Soir', 'Evening'),
  opt('Nuit', 'Nuit', 'Night'),
  opt('Fin de Semaine', 'Fin de Semaine', 'Weekend'),
  opt('Flexible', 'Flexible', 'Flexible'),
]

const EMPLOYMENT = [
  opt('Temps Plein', 'Temps Plein', 'Full-Time'),
  opt('Temps Partiel', 'Temps Partiel', 'Part-Time'),
  opt('Permanent', 'Permanent', 'Permanent'),
  opt('Contractuel', 'Contractuel', 'Contract'),
  opt('Saisonnier', 'Saisonnier', 'Seasonal'),
]

const LANGUAGES = [
  opt('Français Parlé', 'Français Parlé', 'French Spoken'),
  opt('Anglais Parlé', 'Anglais Parlé', 'English Spoken'),
  opt('Français Écrit', 'Français Écrit', 'French Written'),
  opt('Anglais Écrit', 'Anglais Écrit', 'English Written'),
]

const LEGAL_STATUS = [
  opt('Citoyen Canadien', 'Citoyen Canadien', 'Canadian Citizen'),
  opt('Résident Permanent', 'Résident Permanent', 'Permanent Resident'),
  opt('Permis de Travail Ouvert', 'Permis de Travail Ouvert', 'Open Work Permit'),
  opt('Permis de Travail Fermé', 'Permis de Travail Fermé', 'Closed Work Permit'),
  opt('Étudiant Étranger', 'Étudiant Étranger', 'International Student'),
  opt('Autres', 'Autres', 'Other'),
]

const YES_NO = [opt('Oui', 'Oui', 'Yes'), opt('Non', 'Non', 'No')]

export const DRIVER_FORM_SECTIONS: FormSectionDef[] = [
  {
    num: 1,
    title: { fr: 'Informations Personnelles', en: 'Personal Information' },
    sub: { fr: 'VOS COORDONNÉES', en: 'YOUR CONTACT DETAILS' },
    fields: [
      { name: 'full_name', type: 'text', required: true, dbColumn: 'full_name', label: { fr: 'Nom complet', en: 'Full name' }, placeholder: { fr: 'Jean Tremblay', en: 'John Smith' } },
      { name: 'phone', type: 'tel', required: true, dbColumn: 'phone', label: { fr: 'Numéro de téléphone', en: 'Phone number' }, placeholder: { fr: '(514) 555-1234', en: '(514) 555-1234' } },
      { name: 'email', type: 'email', required: true, dbColumn: 'email', label: { fr: 'Adresse courriel', en: 'Email address' }, placeholder: { fr: 'jean@gmail.com', en: 'john@gmail.com' } },
      { name: 'city', type: 'text', required: true, dbColumn: 'city', label: { fr: 'Ville', en: 'City' }, placeholder: { fr: 'Montréal', en: 'Montreal' } },
      { name: 'province', type: 'select', required: true, full: true, dbColumn: 'province', label: { fr: 'Province', en: 'Province' }, options: PROVINCES },
    ],
  },
  {
    num: 2,
    title: { fr: 'Expérience & Qualifications', en: 'Experience & Qualifications' },
    sub: { fr: 'VOTRE PROFIL', en: 'YOUR PROFILE' },
    fields: [
      { name: 'years_experience', type: 'select', required: true, full: true, dbColumn: 'years_experience', label: { fr: "Combien d'années d'expérience avez-vous comme chauffeur ?", en: 'How many years of experience do you have as a driver?' }, options: YEARS_EXP },
      { name: 'equipment', type: 'checkboxes', required: true, full: true, dbColumn: 'equipment', label: { fr: "Quel type d'équipement avez-vous déjà opéré ?", en: 'What type of equipment have you operated?' }, options: EQUIPMENT_OPERATED },
      { name: 'license_classes', type: 'checkboxes', required: true, full: true, dbColumn: 'license_classes', label: { fr: 'Classe de permis', en: 'License class' }, options: LICENSE },
      { name: 'transport_types', type: 'checkboxes', required: true, full: true, dbColumn: 'transport_types', label: { fr: 'Type de transport', en: 'Type of transport' }, options: TRANSPORT },
    ],
  },
  {
    num: 3,
    title: { fr: 'Disponibilité & Salaire', en: 'Availability & Salary' },
    sub: { fr: 'VOS CONDITIONS', en: 'YOUR CONDITIONS' },
    fields: [
      { name: 'available_from', type: 'date', required: true, dbColumn: 'available_from', label: { fr: 'À partir de quand êtes-vous disponible ?', en: 'Available from?' } },
      { name: 'desired_salary', type: 'text', required: true, dbColumn: 'desired_salary', label: { fr: 'Salaire recherché (taux horaire)', en: 'Desired salary (hourly rate)' }, placeholder: { fr: 'Ex: 25$/h', en: 'Ex: $25/h' } },
    ],
  },
  {
    num: 4,
    title: { fr: 'Statut Légal', en: 'Legal Status' },
    sub: { fr: 'DROIT DE TRAVAIL', en: 'RIGHT TO WORK' },
    fields: [
      { name: 'legal_right_to_work', type: 'radios', required: true, full: true, dbColumn: 'legal_right_to_work', label: { fr: 'Avez-vous le droit légal de travailler au Canada ?', en: 'Do you have the legal right to work in Canada?' }, options: YES_NO },
      { name: 'legal_status', type: 'radios', required: true, full: true, dbColumn: 'legal_status', label: { fr: 'Quel est votre statut ?', en: 'What is your status?' }, options: LEGAL_STATUS },
    ],
  },
  {
    num: 5,
    title: { fr: 'Type de Poste Recherché', en: 'Desired Position' },
    sub: { fr: 'VOS PRÉFÉRENCES', en: 'YOUR PREFERENCES' },
    fields: [
      { name: 'position_types', type: 'checkboxes', required: true, full: true, dbColumn: 'position_types', label: { fr: 'Type de poste recherché', en: 'Type of position sought' }, options: POSITION_SOUGHT },
      { name: 'distance_regions', type: 'checkboxes', required: true, full: true, dbColumn: 'distance_regions', label: { fr: 'Région de distance recherchée', en: 'Desired region' }, options: DISTANCE_REGION },
    ],
  },
  {
    num: 6,
    title: { fr: "Horaire & Type d'Emploi", en: 'Schedule & Employment Type' },
    sub: { fr: 'VOS DISPONIBILITÉS', en: 'YOUR AVAILABILITY' },
    fields: [
      { name: 'schedule', type: 'checkboxes', required: true, full: true, dbColumn: 'schedule', label: { fr: 'Horaire recherché', en: 'Desired schedule' }, options: SCHEDULE },
      { name: 'employment_types', type: 'checkboxes', required: true, full: true, dbColumn: 'employment_types', label: { fr: "Type d'emploi recherché", en: 'Desired employment type' }, options: EMPLOYMENT },
      { name: 'languages', type: 'checkboxes', required: true, full: true, dbColumn: 'languages', label: { fr: 'Langues', en: 'Languages' }, options: LANGUAGES },
    ],
  },
]

export const DRIVER_FORM_SUBMIT_NOTE: { fr: string; en: string } = {
  fr: 'Seuls les candidats correspondant à nos besoins clients seront contactés. Votre information est confidentielle.',
  en: 'Only candidates matching our client needs will be contacted. Your information is strictly confidential.',
}
