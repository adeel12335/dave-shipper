export type FormLang = 'fr' | 'en'

export type Bilingual = { fr: string; en: string }

export type FormFieldType =
  | 'text'
  | 'tel'
  | 'email'
  | 'number'
  | 'date'
  | 'select'
  | 'checkboxes'
  | 'radios'
  | 'textarea'

export type FormFieldOption = {
  value: string
  label: Bilingual
}

export type FormFieldDef = {
  name: string
  type: FormFieldType
  label: Bilingual
  required?: boolean
  full?: boolean
  placeholder?: Bilingual
  options?: FormFieldOption[]
  dbColumn?: string
}

export type FormSectionDef = {
  num: number
  title: Bilingual
  sub: Bilingual
  fields: FormFieldDef[]
}

export type LocalizedField = {
  name: string
  type: FormFieldType
  label: string
  required?: boolean
  full?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
}

export type LocalizedSection = {
  num: number
  title: string
  sub: string
  fields: LocalizedField[]
}
