import type {
  Bilingual,
  FormFieldDef,
  FormFieldOption,
  FormLang,
  FormSectionDef,
  LocalizedField,
  LocalizedSection,
} from './types'

export function t(b: Bilingual, lang: FormLang): string {
  return b[lang]
}

export function opt(value: string, fr: string, en: string): FormFieldOption {
  return { value, label: { fr, en } }
}

export function localizeField(field: FormFieldDef, lang: FormLang): LocalizedField {
  return {
    name: field.name,
    type: field.type,
    label: t(field.label, lang),
    required: field.required,
    full: field.full,
    placeholder: field.placeholder ? t(field.placeholder, lang) : undefined,
    options: field.options?.map((o) => ({ value: o.value, label: t(o.label, lang) })),
  }
}

export function localizeSection(section: FormSectionDef, lang: FormLang): LocalizedSection {
  return {
    num: section.num,
    title: t(section.title, lang),
    sub: t(section.sub, lang),
    fields: section.fields.map((f) => localizeField(f, lang)),
  }
}

export function localizeSections(sections: FormSectionDef[], lang: FormLang): LocalizedSection[] {
  return sections.map((s) => localizeSection(s, lang))
}

const TOP_LEVEL_KEYS = new Set([
  'company_name',
  'contact_name',
  'contact_title',
  'phone',
  'email',
  'website',
  'city_region',
  'position_type',
  'drivers_count',
])

export function buildCompanyApplicationPayload(
  data: Record<string, string | string[]>,
  opts: { leadId?: string | null; locale?: FormLang } = {}
) {
  const locale = opts.locale ?? 'fr'
  const details: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(data)) {
    if (TOP_LEVEL_KEYS.has(key)) continue
    if (value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0)) {
      details[key] = value
    }
  }

  return {
    company_name: String(data.company_name ?? ''),
    contact_name: String(data.contact_name ?? ''),
    contact_title: (data.contact_title as string) || null,
    phone: String(data.phone ?? ''),
    email: String(data.email ?? ''),
    website: (data.website as string) || null,
    city_region: (data.city_region as string) || null,
    position_type: (data.position_type as string) || null,
    drivers_count: (data.drivers_count as string) || null,
    lead_id: opts.leadId || null,
    locale,
    details,
    status: 'new',
  }
}
