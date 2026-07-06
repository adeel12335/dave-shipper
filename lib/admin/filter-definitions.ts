import { COMPANY_FORM_SECTIONS } from '@/lib/forms/company-form-schema'

export type FilterType = 'select' | 'multiselect' | 'boolean' | 'date'

export type AdminFilterDef = {
  key: string
  label: string
  type: FilterType
  column?: string
  jsonb?: boolean
  arrayColumn?: boolean
  /** Load dropdown values from Supabase distinct values */
  dynamic?: boolean
  options?: { value: string; label: string }[]
}

const BOOL_OPTS = [
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
]

const LOCALE_OPTS = [
  { value: 'fr', label: 'French' },
  { value: 'en', label: 'English' },
]

const STATUS_OPTS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'form_sent', label: 'Form Sent' },
  { value: 'matched', label: 'Matched' },
  { value: 'invoiced', label: 'Invoiced' },
  { value: 'closed', label: 'Closed' },
]

const YEARS_EXP_OPTS = [
  { value: 'Moins de 1 an', label: 'Moins de 1 an' },
  { value: '1-2 ans', label: '1-2 ans' },
  { value: '3-5 ans', label: '3-5 ans' },
  { value: '6-10 ans', label: '6-10 ans' },
  { value: 'Plus de 10 ans', label: 'Plus de 10 ans' },
]

const LICENSE_OPTS = ['Classe 1', 'Classe 2', 'Classe 3', 'Classe 4', 'Classe 5'].map((v) => ({ value: v, label: v }))

const POSITION_TYPE_OPTS = [
  { value: 'class1_ld', label: 'Classe 1 — Longue distance' },
  { value: 'class1_local', label: 'Classe 1 — Local/Regional' },
  { value: 'class3', label: 'Classe 3' },
  { value: 'shunter', label: 'Shunteur' },
  { value: 'delivery', label: 'Livreur' },
  { value: 'driver_handler', label: 'Manutentionnaire-chauffeur' },
  { value: 'other', label: 'Autre' },
]

const DRIVERS_COUNT_OPTS = ['1', '2-3', '4-5', '6-10', '10+'].map((v) => ({ value: v, label: v }))

function fieldToFilter(
  field: { name: string; type: string; label: { fr: string }; options?: { value: string; label: { fr: string } }[] },
  jsonb = false,
): AdminFilterDef | null {
  const options = field.options?.map((o) => ({ value: o.value, label: o.label.fr }))
  if (field.type === 'checkboxes') {
    return { key: field.name, label: field.label.fr, type: 'multiselect', jsonb, options }
  }
  if (field.type === 'select' || field.type === 'radios') {
    return { key: field.name, label: field.label.fr, type: 'select', jsonb, options }
  }
  if (field.type === 'date') {
    return { key: field.name, label: field.label.fr, type: 'date', jsonb, dynamic: true }
  }
  if (['text', 'textarea', 'number', 'tel', 'email'].includes(field.type)) {
    return { key: field.name, label: field.label.fr, type: 'select', jsonb, dynamic: true }
  }
  return null
}

const dyn = (key: string, label: string, jsonb = false): AdminFilterDef => ({
  key, label, type: 'select', jsonb, dynamic: true,
})

const TOP_COMPANY_COLS = new Set([
  'company_name', 'contact_name', 'contact_title', 'phone', 'email', 'website', 'city_region', 'position_type', 'drivers_count',
])

const companyDetailFilters: AdminFilterDef[] = COMPANY_FORM_SECTIONS.flatMap((s) =>
  s.fields
    .filter((f) => !TOP_COMPANY_COLS.has(f.name))
    .map((f) => fieldToFilter(f, true))
    .filter((f): f is AdminFilterDef => f !== null)
)

export const ADMIN_FILTER_DEFS: Record<string, AdminFilterDef[]> = {
  company_leads: [
    { key: 'created_from', label: 'Date from', type: 'date', column: 'created_at' },
    { key: 'created_to', label: 'Date to', type: 'date', column: 'created_at' },
    dyn('company_name', 'Company name'),
    dyn('contact_name', 'Contact name'),
    dyn('phone', 'Phone'),
    dyn('email', 'Email'),
    dyn('message', 'Message'),
    { key: 'locale', label: 'Language', type: 'select', options: LOCALE_OPTS },
    { key: 'status', label: 'Status', type: 'select', options: STATUS_OPTS },
    { key: 'synced_zoho', label: 'Synced to Zoho', type: 'boolean', options: BOOL_OPTS },
    { key: 'synced_excel', label: 'Synced to Excel', type: 'boolean', options: BOOL_OPTS },
  ],
  driver_applications: [
    { key: 'created_from', label: 'Date from', type: 'date', column: 'created_at' },
    { key: 'created_to', label: 'Date to', type: 'date', column: 'created_at' },
    dyn('full_name', 'Full name'),
    dyn('phone', 'Phone'),
    dyn('email', 'Email'),
    dyn('city', 'City'),
    dyn('province', 'Province'),
    { key: 'years_experience', label: 'Years experience', type: 'select', options: [
      { value: 'Moins de 1 an', label: 'Moins de 1 an' }, { value: '1-2 ans', label: '1-2 ans' },
      { value: '3-5 ans', label: '3-5 ans' }, { value: '5-10 ans', label: '5-10 ans' }, { value: '10+ ans', label: '10+ ans' },
    ]},
    { key: 'license_classes', label: 'License class', type: 'multiselect', arrayColumn: true, options: [
      { value: 'Classe 1 FM', label: 'Classe 1 FM' }, { value: 'Classe 1 F', label: 'Classe 1 F' },
      { value: 'Classe 3 FM', label: 'Classe 3 FM' }, { value: 'Classe 3 F', label: 'Classe 3 F' },
    ]},
    { key: 'equipment', label: 'Equipment operated', type: 'multiselect', arrayColumn: true, options: [
      { value: 'Dry Van', label: 'Dry Van' }, { value: 'Reefer', label: 'Reefer' }, { value: 'Flatbed', label: 'Flatbed' },
      { value: 'Citerne', label: 'Citerne' }, { value: 'Dompeur', label: 'Dompeur' }, { value: 'Container', label: 'Container' },
      { value: 'Train Routier', label: 'Train Routier' }, { value: 'Moffat', label: 'Moffat' }, { value: 'Tailgate', label: 'Tailgate' },
      { value: 'Transpalette', label: 'Transpalette' }, { value: 'Diable', label: 'Diable' },
    ]},
    { key: 'transport_types', label: 'Transport type', type: 'multiselect', arrayColumn: true, options: [
      { value: 'Local', label: 'Local' }, { value: 'Régional', label: 'Régional' },
      { value: 'Longue Distance Canada', label: 'LD Canada' }, { value: 'Longue Distance U.S.', label: 'LD USA' },
    ]},
    { key: 'position_types', label: 'Position sought', type: 'multiselect', arrayColumn: true, options: [
      { value: 'Dry Van', label: 'Dry Van' }, { value: 'Reefer', label: 'Reefer' }, { value: 'Shunter', label: 'Shunter' },
      { value: 'Sans Manutention (Switch/Dock à Dock)', label: 'No handling' }, { value: 'Avec Manutention', label: 'With handling' },
    ]},
    { key: 'distance_regions', label: 'Distance region', type: 'multiselect', arrayColumn: true, options: [
      { value: 'Local', label: 'Local' }, { value: 'Régional', label: 'Régional' },
      { value: 'Longue Distance Canada', label: 'LD Canada' }, { value: 'Longue Distance U.S.', label: 'LD USA' },
    ]},
    { key: 'schedule', label: 'Schedule', type: 'multiselect', arrayColumn: true, options: [
      { value: 'Jour', label: 'Jour' }, { value: 'Soir', label: 'Soir' }, { value: 'Nuit', label: 'Nuit' },
      { value: 'Fin de Semaine', label: 'Fin de Semaine' }, { value: 'Flexible', label: 'Flexible' },
    ]},
    { key: 'employment_types', label: 'Employment type', type: 'multiselect', arrayColumn: true, options: [
      { value: 'Temps Plein', label: 'Temps Plein' }, { value: 'Temps Partiel', label: 'Temps Partiel' },
      { value: 'Permanent', label: 'Permanent' }, { value: 'Contractuel', label: 'Contractuel' }, { value: 'Saisonnier', label: 'Saisonnier' },
    ]},
    { key: 'languages', label: 'Languages', type: 'multiselect', arrayColumn: true, options: [
      { value: 'Français Parlé', label: 'FR spoken' }, { value: 'Anglais Parlé', label: 'EN spoken' },
      { value: 'Français Écrit', label: 'FR written' }, { value: 'Anglais Écrit', label: 'EN written' },
    ]},
    { key: 'available_from', label: 'Available from', type: 'date', dynamic: true },
    dyn('desired_salary', 'Desired salary'),
    { key: 'legal_right_to_work', label: 'Right to work', type: 'select', options: [{ value: 'Oui', label: 'Oui' }, { value: 'Non', label: 'Non' }] },
    { key: 'legal_status', label: 'Legal status', type: 'select', options: [
      { value: 'Citoyen Canadien', label: 'Citoyen Canadien' }, { value: 'Résident Permanent', label: 'Résident Permanent' },
      { value: 'Permis de Travail Ouvert', label: 'Permis ouvert' }, { value: 'Permis de Travail Fermé', label: 'Permis fermé' },
      { value: 'Étudiant Étranger', label: 'Étudiant' }, { value: 'Autres', label: 'Autres' },
    ]},
    dyn('additional_notes', 'Additional notes'),
    { key: 'locale', label: 'Language', type: 'select', options: LOCALE_OPTS },
    { key: 'status', label: 'Status', type: 'select', options: STATUS_OPTS },
    { key: 'synced_zoho', label: 'Synced to Zoho', type: 'boolean', options: BOOL_OPTS },
    { key: 'synced_excel', label: 'Synced to Excel', type: 'boolean', options: BOOL_OPTS },
  ],
  company_applications: [
    { key: 'created_from', label: 'Date from', type: 'date', column: 'created_at' },
    { key: 'created_to', label: 'Date to', type: 'date', column: 'created_at' },
    dyn('company_name', 'Company name'),
    dyn('contact_name', 'Contact name'),
    dyn('contact_title', 'Contact title'),
    dyn('phone', 'Phone'),
    dyn('email', 'Email'),
    dyn('website', 'Website'),
    dyn('city_region', 'City / Region'),
    { key: 'position_type', label: 'Position type', type: 'select', options: POSITION_TYPE_OPTS },
    { key: 'drivers_count', label: 'Drivers needed', type: 'select', options: DRIVERS_COUNT_OPTS },
    { key: 'locale', label: 'Language', type: 'select', options: LOCALE_OPTS },
    { key: 'status', label: 'Status', type: 'select', options: STATUS_OPTS },
    { key: 'synced_zoho', label: 'Synced to Zoho', type: 'boolean', options: BOOL_OPTS },
    { key: 'synced_excel', label: 'Synced to Excel', type: 'boolean', options: BOOL_OPTS },
    ...companyDetailFilters,
  ],
}

export const PAGE_TO_TABLE: Record<string, string> = {
  leads: 'company_leads',
  drivers: 'driver_applications',
  companies: 'company_applications',
}
