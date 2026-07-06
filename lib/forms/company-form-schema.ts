import type { FormFieldDef, FormSectionDef } from './types'
import { opt } from './form-utils'

const scheduleOptions = [
  opt('day', 'Jour', 'Day'),
  opt('evening', 'Soir', 'Evening'),
  opt('night', 'Nuit', 'Night'),
  opt('weekend', 'Fin de semaine', 'Weekend'),
  opt('rotation', 'Rotation', 'Rotation'),
  opt('flexible', 'Flexible', 'Flexible'),
]

const equipmentOptions = [
  opt('dry_van', 'Dry Van', 'Dry Van'),
  opt('reefer', 'Reefer', 'Reefer'),
  opt('flatbed', 'Flatbed', 'Flatbed'),
  opt('dump', 'Dompeur', 'Dump truck'),
  opt('tanker', 'Citerne', 'Tanker'),
  opt('tipper', 'Benne', 'Tipper'),
  opt('lowboy', 'Lowboy', 'Lowboy'),
  opt('straight', 'Porteur', 'Straight truck'),
]

const transportOptions = [
  opt('local', 'Local', 'Local'),
  opt('regional', 'Regional', 'Regional'),
  opt('long_haul_ca', 'Longue Distance Canada', 'Long haul Canada'),
  opt('long_haul_us', 'Longue Distance USA', 'Long haul USA'),
  opt('cross_border', 'Cross-border', 'Cross-border'),
]

const benefitsOptions = [
  opt('group_insurance', 'Assurance collective', 'Group insurance'),
  opt('group_rrsp', 'REER collectif', 'Group RRSP'),
  opt('vacation_3w', 'Vacances 3 semaines+', '3+ weeks vacation'),
  opt('performance_bonus', 'Bonis de performance', 'Performance bonuses'),
  opt('meal_reimbursement', 'Remboursement repas', 'Meal reimbursement'),
  opt('clothing_allowance', 'Allocation vetements', 'Clothing allowance'),
  opt('paid_training', 'Formation payee', 'Paid training'),
  opt('phone_provided', 'Telephone fourni', 'Phone provided'),
]

const humanQualitiesOptions = [
  opt('punctuality', 'Ponctualite', 'Punctuality'),
  opt('autonomy', 'Autonomie', 'Autonomy'),
  opt('communication', 'Communication', 'Communication'),
  opt('reliability', 'Fiabilite', 'Reliability'),
  opt('deadlines', 'Respect des delais', 'Respect for deadlines'),
  opt('vehicle_care', 'Soin du vehicule', 'Care for the vehicle'),
  opt('team_spirit', 'Esprit d equipe', 'Team spirit'),
  opt('flexibility', 'Flexibilite', 'Flexibility'),
  opt('rules_respect', 'Respect des regles', 'Respect for rules'),
  opt('cleanliness', 'Proprete du vehicule', 'Vehicle cleanliness'),
]

const interviewProcessOptions = [
  opt('phone', 'Entrevue telephonique', 'Phone interview'),
  opt('in_person', 'Entrevue en personne', 'In-person interview'),
  opt('driving_test', 'Test de conduite', 'Driving test'),
  opt('references', 'Verification de references', 'Reference check'),
  opt('drug_test', 'Test de depistage', 'Drug testing'),
  opt('record_check', 'Verification du dossier', 'Record verification'),
]

export const COMPANY_FORM_SECTIONS: FormSectionDef[] = [
  {
    num: 1,
    title: { fr: "Informations de l'entreprise", en: 'Company Information' },
    sub: { fr: 'VOS COORDONNEES', en: 'YOUR CONTACT DETAILS' },
    fields: [
      { name: 'company_name', type: 'text', required: true, dbColumn: 'company_name', label: { fr: "Nom de l'entreprise", en: 'Company name' }, placeholder: { fr: 'Transport ABC Inc.', en: 'ABC Transport Inc.' } },
      { name: 'contact_name', type: 'text', required: true, dbColumn: 'contact_name', label: { fr: 'Nom du contact', en: 'Contact name' }, placeholder: { fr: 'Jean Tremblay', en: 'John Smith' } },
      { name: 'contact_title', type: 'text', dbColumn: 'contact_title', label: { fr: 'Titre / Poste', en: 'Title / Position' }, placeholder: { fr: 'Directeur des operations', en: 'Operations Manager' } },
      { name: 'phone', type: 'tel', required: true, dbColumn: 'phone', label: { fr: 'Telephone', en: 'Phone' }, placeholder: { fr: '(514) 555-1234', en: '(514) 555-1234' } },
      { name: 'email', type: 'email', required: true, dbColumn: 'email', label: { fr: 'Courriel', en: 'Email' }, placeholder: { fr: 'jean@transportabc.ca', en: 'john@abctransport.ca' } },
      { name: 'website', type: 'text', dbColumn: 'website', label: { fr: 'Site web', en: 'Website' }, placeholder: { fr: 'www.transportabc.ca', en: 'www.abctransport.ca' } },
      { name: 'terminal_address', type: 'text', label: { fr: 'Adresse du terminal', en: 'Terminal address' }, placeholder: { fr: '123 rue Industrielle, Montreal', en: '123 Industrial St, Montreal' } },
      { name: 'city_region', type: 'text', required: true, dbColumn: 'city_region', label: { fr: 'Ville / Region', en: 'City / Region' }, placeholder: { fr: 'Montreal, QC', en: 'Montreal, QC' } },
      {
        name: 'employee_count', type: 'select', label: { fr: "Nombre d'employes", en: 'Number of employees' },
        options: [opt('1-10', '1-10', '1-10'), opt('11-25', '11-25', '11-25'), opt('26-50', '26-50', '26-50'), opt('51-100', '51-100', '51-100'), opt('100+', '100+', '100+')],
      },
      { name: 'truck_count', type: 'number', label: { fr: 'Nombre de camions', en: 'Number of trucks' }, placeholder: { fr: 'Ex: 15', en: 'Ex: 15' } },
      { name: 'years_in_business', type: 'number', label: { fr: 'Annees en affaires', en: 'Years in business' }, placeholder: { fr: 'Ex: 10', en: 'Ex: 10' } },
    ],
  },
  {
    num: 2,
    title: { fr: 'Le poste recherche', en: 'Position Details' },
    sub: { fr: 'DETAILS DU POSTE', en: 'JOB REQUIREMENTS' },
    fields: [
      {
        name: 'position_type', type: 'select', required: true, dbColumn: 'position_type', label: { fr: 'Type de poste', en: 'Position type' },
        options: [
          opt('class1_ld', 'Classe 1 — Longue distance', 'Class 1 — Long haul'),
          opt('class1_local', 'Classe 1 — Local/Regional', 'Class 1 — Local/Regional'),
          opt('class3', 'Classe 3', 'Class 3'),
          opt('shunter', 'Shunteur', 'Shunter'),
          opt('delivery', 'Livreur', 'Delivery driver'),
          opt('driver_handler', 'Manutentionnaire-chauffeur', 'Driver-handler'),
          opt('other', 'Autre', 'Other'),
        ],
      },
      {
        name: 'drivers_count', type: 'select', required: true, dbColumn: 'drivers_count', label: { fr: 'Nombre de chauffeurs', en: 'Number of drivers needed' },
        options: [opt('1', '1', '1'), opt('2-3', '2-3', '2-3'), opt('4-5', '4-5', '4-5'), opt('6-10', '6-10', '6-10'), opt('10+', '10+', '10+')],
      },
      {
        name: 'employment_type', type: 'select', label: { fr: "Type d'emploi", en: 'Employment type' },
        options: [
          opt('ft_perm', 'Temps plein permanent', 'Full-time permanent'),
          opt('ft_temp', 'Temps plein temporaire', 'Full-time temporary'),
          opt('pt', 'Temps partiel', 'Part-time'),
          opt('seasonal', 'Saisonnier', 'Seasonal'),
          opt('on_call', 'Sur appel', 'On-call'),
        ],
      },
      {
        name: 'urgency', type: 'select', label: { fr: 'Urgence du besoin', en: 'Urgency' },
        options: [
          opt('immediate', 'Immediat', 'Immediate'),
          opt('2_weeks', 'Dans 2 semaines', 'Within 2 weeks'),
          opt('1_month', 'Dans 1 mois', 'Within 1 month'),
          opt('2_3_months', 'Dans 2-3 mois', 'Within 2-3 months'),
          opt('future', 'Planification future', 'Future planning'),
        ],
      },
      { name: 'schedule_needed', type: 'checkboxes', full: true, label: { fr: 'Horaire recherche', en: 'Schedule needed' }, options: scheduleOptions },
      { name: 'desired_start_date', type: 'date', label: { fr: 'Date de debut souhaitee', en: 'Desired start date' } },
    ],
  },
  {
    num: 3,
    title: { fr: 'Exigences obligatoires', en: 'Mandatory Requirements' },
    sub: { fr: 'CRITERES DU CANDIDAT', en: 'CANDIDATE CRITERIA' },
    fields: [
      {
        name: 'required_license_class', type: 'select', label: { fr: 'Classe de permis requise', en: 'Required license class' },
        options: [
          opt('class1', 'Classe 1', 'Class 1'),
          opt('class1_air', 'Classe 1 avec air', 'Class 1 with air brakes'),
          opt('class3', 'Classe 3', 'Class 3'),
          opt('class4', 'Classe 4', 'Class 4'),
          opt('class5', 'Classe 5', 'Class 5'),
        ],
      },
      {
        name: 'minimum_experience', type: 'select', label: { fr: "Annees d'experience minimum", en: 'Minimum years of experience' },
        options: [
          opt('none', 'Aucune (debutant accepte)', 'None (beginner accepted)'),
          opt('6mo', '6 mois', '6 months'),
          opt('1yr', '1 an', '1 year'),
          opt('2yr', '2 ans', '2 years'),
          opt('3yr', '3 ans', '3 years'),
          opt('5yr+', '5 ans+', '5 years+'),
        ],
      },
      { name: 'equipment_required', type: 'checkboxes', full: true, label: { fr: "Type d'equipement maitrise", en: 'Equipment type required' }, options: equipmentOptions },
      {
        name: 'manual_handling_required', type: 'select', label: { fr: 'Manutention requise', en: 'Manual handling required' },
        options: [opt('no', 'Non', 'No'), opt('yes', 'Oui', 'Yes'), opt('depends', 'Selon les livraisons', 'Depending on delivery')],
      },
      {
        name: 'language_required', type: 'select', label: { fr: 'Langue requise', en: 'Language required' },
        options: [
          opt('fr_only', 'Francais seulement', 'French only'),
          opt('en_only', 'Anglais seulement', 'English only'),
          opt('bilingual_req', 'Bilingue obligatoire', 'Bilingual required'),
          opt('bilingual_asset', 'Bilingue un atout', 'Bilingual an asset'),
        ],
      },
      {
        name: 'maximum_driving_record', type: 'select', label: { fr: 'Dossier de conduite maximum', en: 'Maximum driving record' },
        options: [
          opt('clean', 'Vierge (0 point)', 'Clean (0 points)'),
          opt('2pts', '2 points max', 'Max 2 points'),
          opt('4pts', '4 points max', 'Max 4 points'),
          opt('discuss', 'A discuter', 'To be discussed'),
        ],
      },
      {
        name: 'clean_criminal_record', type: 'select', label: { fr: 'Casier judiciaire vierge', en: 'Clean criminal record' },
        options: [opt('mandatory', 'Obligatoire', 'Mandatory'), opt('depends', "Selon le type d'infraction", 'Depending on offense type'), opt('not_req', 'Non requis', 'Not required')],
      },
      {
        name: 'fast_card_required', type: 'select', label: { fr: 'FAST card requise', en: 'FAST card required' },
        options: [opt('no', 'Non', 'No'), opt('yes', 'Oui — obligatoire', 'Yes — mandatory'), opt('asset', 'Un atout', 'An asset')],
      },
      {
        name: 'drug_testing', type: 'select', label: { fr: 'Test de depistage', en: 'Drug testing' },
        options: [opt('not_req', 'Non requis', 'Not required'), opt('before_hire', 'Oui — avant embauche', 'Yes — before hiring'), opt('random', 'Oui — aleatoire', 'Yes — random')],
      },
      {
        name: 'passport_required', type: 'select', label: { fr: 'Passeport requis', en: 'Passport required' },
        options: [opt('no', 'Non', 'No'), opt('yes', 'Oui', 'Yes')],
      },
      {
        name: 'hand_truck_required', type: 'select', label: { fr: 'Diable / transpalette', en: 'Hand truck / pallet jack' },
        options: [opt('not_req', 'Non requis', 'Not required'), opt('required', 'Requis', 'Required'), opt('asset', 'Un atout', 'An asset')],
      },
    ],
  },
  {
    num: 4,
    title: { fr: 'Type de marchandise', en: 'Type of Cargo' },
    sub: { fr: 'CE QUI EST TRANSPORTE', en: 'WHAT IS BEING TRANSPORTED' },
    fields: [
      { name: 'main_cargo_type', type: 'text', full: true, label: { fr: 'Type de marchandise principale', en: 'Main type of cargo' }, placeholder: { fr: 'Ex: produits alimentaires, materiaux...', en: 'Ex: food products, construction materials...' } },
      {
        name: 'dangerous_goods_tdg', type: 'select', label: { fr: 'Marchandises dangereuses (TMD)', en: 'Dangerous goods (TDG)' },
        options: [opt('no', 'Non', 'No'), opt('yes_cert', 'Oui — certificat requis', 'Yes — certificate required'), opt('sometimes', 'Parfois', 'Sometimes')],
      },
      {
        name: 'food_pharmaceutical', type: 'select', label: { fr: 'Alimentaire / pharmaceutique', en: 'Food / pharmaceutical' },
        options: [opt('no', 'Non', 'No'), opt('haccp', 'Oui — exigences HACCP', 'Yes — HACCP requirements'), opt('other', 'Oui — autres exigences', 'Yes — other requirements')],
      },
      { name: 'special_cargo_requirements', type: 'textarea', full: true, label: { fr: 'Exigences speciales liees a la marchandise', en: 'Special cargo requirements' }, placeholder: { fr: 'Temperatures controlees, certifications...', en: 'Controlled temperatures, certifications...' } },
    ],
  },
  {
    num: 5,
    title: { fr: 'Les routes', en: 'Routes & Territory' },
    sub: { fr: 'TERRITOIRES ET DESTINATIONS', en: 'DESTINATIONS AND TRAVEL' },
    fields: [
      { name: 'transport_types', type: 'checkboxes', full: true, label: { fr: 'Type de transport', en: 'Type of transport' }, options: transportOptions },
      { name: 'main_destinations', type: 'text', full: true, label: { fr: 'Destinations principales', en: 'Main destinations' }, placeholder: { fr: 'Ex: Montreal-Toronto, Quebec-Boston...', en: 'Ex: Montreal-Toronto, Quebec-Boston...' } },
      {
        name: 'overnight_stays_required', type: 'select', label: { fr: 'Decouchers requis', en: 'Overnight stays required' },
        options: [opt('no', 'Non', 'No'), opt('yes_regular', 'Oui — regulierement', 'Yes — regularly'), opt('sometimes', 'Parfois', 'Sometimes')],
      },
      {
        name: 'nights_away_per_week', type: 'select', label: { fr: 'Nuits hors domicile / semaine', en: 'Nights away per week' },
        options: [opt('0', '0', '0'), opt('1-2', '1-2 nuits', '1-2 nights'), opt('3-4', '3-4 nuits', '3-4 nights'), opt('5+', '5 nuits+', '5 nights+')],
      },
      { name: 'weekly_mileage', type: 'text', label: { fr: 'Kilometrage hebdomadaire estime', en: 'Estimated weekly mileage' }, placeholder: { fr: 'Ex: 2000-3000 km/semaine', en: 'Ex: 2000-3000 km/week' } },
      {
        name: 'border_crossings', type: 'select', label: { fr: 'Frontieres traversees', en: 'Border crossings' },
        options: [opt('none', 'Aucune', 'None'), opt('ca_us', 'Canada/USA', 'Canada/USA'), opt('other', 'Autres', 'Other')],
      },
    ],
  },
  {
    num: 6,
    title: { fr: 'Le parc de vehicules', en: 'Fleet & Equipment' },
    sub: { fr: 'VOS EQUIPEMENTS', en: 'YOUR VEHICLES' },
    fields: [
      {
        name: 'truck_brand', type: 'select', label: { fr: 'Marque des camions', en: 'Truck brand' },
        options: [
          opt('kenworth', 'Kenworth', 'Kenworth'),
          opt('peterbilt', 'Peterbilt', 'Peterbilt'),
          opt('freightliner', 'Freightliner', 'Freightliner'),
          opt('volvo', 'Volvo', 'Volvo'),
          opt('international', 'International', 'International'),
          opt('mack', 'Mack', 'Mack'),
          opt('mixed', 'Mixte', 'Mixed fleet'),
        ],
      },
      { name: 'average_truck_year', type: 'text', label: { fr: 'Annee moyenne des camions', en: 'Average truck year' }, placeholder: { fr: 'Ex: 2019-2022', en: 'Ex: 2019-2022' } },
      {
        name: 'fleet_condition', type: 'select', label: { fr: 'Etat general du parc', en: 'Overall fleet condition' },
        options: [opt('excellent', 'Excellent', 'Excellent'), opt('good', 'Bon', 'Good'), opt('average', 'Moyen', 'Average')],
      },
      {
        name: 'assigned_or_shared_truck', type: 'select', label: { fr: 'Camion assigne ou partage', en: 'Assigned or shared truck' },
        options: [opt('assigned', 'Camion assigne', 'Assigned truck'), opt('shared', 'Camion partage', 'Shared truck'), opt('availability', 'Selon disponibilite', 'Based on availability')],
      },
      {
        name: 'transmission', type: 'select', label: { fr: 'Transmission', en: 'Transmission' },
        options: [opt('auto', 'Automatique', 'Automatic'), opt('manual', 'Manuelle', 'Manual'), opt('both', 'Les deux', 'Both')],
      },
      {
        name: 'eld_gps_installed', type: 'select', label: { fr: 'ELD / GPS installe', en: 'ELD / GPS installed' },
        options: [opt('yes', 'Oui', 'Yes'), opt('no', 'Non', 'No')],
      },
      {
        name: 'owner_operator_accepted', type: 'select', full: true, label: { fr: 'Owner-operator accepte', en: 'Owner-operator accepted' },
        options: [opt('employee_only', 'Non — employe seulement', 'No — employee only'), opt('yes', 'Oui — owner-operator accepte', 'Yes — owner-operator accepted'), opt('both', 'Les deux', 'Both')],
      },
    ],
  },
  {
    num: 7,
    title: { fr: 'Conditions offertes', en: 'Compensation & Benefits' },
    sub: { fr: 'SALAIRE ET AVANTAGES', en: 'SALARY AND PERKS' },
    fields: [
      {
        name: 'payment_method', type: 'select', label: { fr: 'Mode de paiement', en: 'Payment method' },
        options: [
          opt('hourly', 'Taux horaire', 'Hourly rate'),
          opt('mileage', 'Kilometrage', 'Per mileage'),
          opt('annual', 'Salaire fixe annuel', 'Annual salary'),
          opt('commission', 'Commission', 'Commission'),
          opt('mixed', 'Mixte', 'Mixed'),
        ],
      },
      { name: 'salary_rate_offered', type: 'text', label: { fr: 'Salaire / taux offert', en: 'Salary / rate offered' }, placeholder: { fr: 'Ex: 25-28$/h ou 0.55$/km', en: 'Ex: $25-28/h or $0.55/km' } },
      { name: 'benefits_offered', type: 'checkboxes', full: true, label: { fr: 'Avantages sociaux offerts', en: 'Benefits offered' }, options: benefitsOptions },
    ],
  },
  {
    num: 8,
    title: { fr: 'Culture et environnement', en: 'Culture & Work Environment' },
    sub: { fr: 'VOTRE MILIEU DE TRAVAIL', en: 'YOUR WORKPLACE' },
    fields: [
      {
        name: 'company_type', type: 'select', label: { fr: "Type d'entreprise", en: 'Company type' },
        options: [
          opt('family', 'Petite entreprise familiale', 'Small family business'),
          opt('sme', 'PME', 'SME'),
          opt('large', 'Grande compagnie', 'Large company'),
          opt('multinational', 'Multinationale', 'Multinational'),
        ],
      },
      {
        name: 'management_style', type: 'select', label: { fr: 'Style de gestion', en: 'Management style' },
        options: [opt('autonomy', 'Grande autonomie', 'High autonomy'), opt('structured', 'Encadrement structure', 'Structured supervision'), opt('mixed', 'Mixte', 'Mixed')],
      },
      { name: 'company_description', type: 'textarea', full: true, label: { fr: 'Decrivez votre entreprise en quelques mots', en: 'Describe your company in a few words' }, placeholder: { fr: 'Culture, valeurs, ambiance...', en: 'Culture, values, atmosphere...' } },
      {
        name: 'dispatcher_communication', type: 'select', full: true, label: { fr: 'Communication avec les repartiteurs', en: 'Communication with dispatchers' },
        options: [
          opt('frequent', 'Tres frequente — contact constant', 'Very frequent — constant contact'),
          opt('moderate', 'Moderee — quelques fois par jour', 'Moderate — a few times a day'),
          opt('minimal', 'Minimale — grande autonomie', 'Minimal — high autonomy'),
        ],
      },
      {
        name: 'probation_period', type: 'select', label: { fr: "Periode d'essai", en: 'Probation period' },
        options: [opt('none', 'Aucune', 'None'), opt('2w', '2 semaines', '2 weeks'), opt('1m', '1 mois', '1 month'), opt('3m', '3 mois', '3 months')],
      },
      {
        name: 'training_provided', type: 'select', label: { fr: 'Formation offerte', en: 'Training provided' },
        options: [opt('full', 'Oui — complete', 'Yes — full training'), opt('partial', 'Oui — partielle', 'Yes — partial'), opt('no', 'Non', 'No')],
      },
      {
        name: 'route_flexibility', type: 'radios', full: true, label: { fr: 'Les chauffeurs ont-ils leur mot a dire sur leurs routes?', en: 'Do drivers have a say in their routes?' },
        options: [opt('yes', 'Oui — grande flexibilite', 'Yes — great flexibility'), opt('partial', 'Partiellement', 'Partially'), opt('no', 'Non — routes fixes', 'No — fixed routes')],
      },
    ],
  },
  {
    num: 9,
    title: { fr: 'Defis et historique', en: 'Challenges & History' },
    sub: { fr: 'VOTRE SITUATION ACTUELLE', en: 'YOUR CURRENT SITUATION' },
    fields: [
      {
        name: 'why_hiring_driver', type: 'select', full: true, label: { fr: 'Pourquoi cherchez-vous un chauffeur?', en: 'Why are you looking for a driver?' },
        options: [
          opt('expansion', 'Expansion — nouveau poste', 'Expansion — new position'),
          opt('replacement_vol', 'Remplacement — depart volontaire', 'Replacement — voluntary departure'),
          opt('replacement_term', 'Remplacement — congediement', 'Replacement — termination'),
          opt('leave', 'Conge maladie/maternite', 'Sick / maternity leave'),
          opt('turnover', 'Roulement eleve', 'High turnover'),
          opt('other', 'Autre', 'Other'),
        ],
      },
      {
        name: 'annual_turnover_rate', type: 'select', label: { fr: 'Taux de roulement annuel', en: 'Annual turnover rate' },
        options: [
          opt('low', 'Faible — moins de 10%', 'Low — less than 10%'),
          opt('medium', 'Moyen — 10-25%', 'Average — 10-25%'),
          opt('high', 'Eleve — 25-50%', 'High — 25-50%'),
          opt('very_high', 'Tres eleve — 50%+', 'Very high — 50%+'),
        ],
      },
      {
        name: 'used_agency_before', type: 'select', label: { fr: 'Avez-vous utilise une agence avant?', en: 'Have you used an agency before?' },
        options: [opt('first', 'Non — premiere fois', 'No — first time'), opt('good', 'Oui — bonne experience', 'Yes — good experience'), opt('bad', 'Oui — mauvaise experience', 'Yes — bad experience')],
      },
      { name: 'past_departure_reasons', type: 'textarea', full: true, label: { fr: 'Raisons principales de departs passes', en: 'Main reasons for past departures' }, placeholder: { fr: 'Ex: salaire, horaire, distance...', en: 'Ex: salary, schedule, distance...' } },
      { name: 'what_didnt_work_previous', type: 'textarea', full: true, label: { fr: "Qu'est-ce qui n'a pas fonctionne avec les anciens chauffeurs?", en: "What didn't work with previous drivers?" }, placeholder: { fr: 'Soyez honnete — ca nous aide...', en: 'Be honest — it helps us find the right match...' } },
      { name: 'recruitment_challenges', type: 'textarea', full: true, label: { fr: 'Vos plus grands defis en recrutement', en: 'Your biggest recruitment challenges' }, placeholder: { fr: 'Ex: manque de candidats qualifies...', en: 'Ex: lack of qualified candidates...' } },
    ],
  },
  {
    num: 10,
    title: { fr: 'Le match parfait', en: 'The Perfect Match' },
    sub: { fr: 'VOTRE CHAUFFEUR IDEAL', en: 'YOUR IDEAL DRIVER' },
    fields: [
      { name: 'ideal_driver_description', type: 'textarea', full: true, label: { fr: 'Decrivez votre chauffeur ideal', en: 'Describe your ideal driver' }, placeholder: { fr: 'Experience, personnalite, valeurs...', en: 'Experience, personality, values...' } },
      { name: 'human_qualities', type: 'checkboxes', full: true, label: { fr: 'Qualites humaines les plus importantes', en: 'Most important human qualities' }, options: humanQualitiesOptions },
      { name: 'deal_breakers', type: 'textarea', full: true, label: { fr: 'Elements rehibitoires', en: 'Deal breakers' }, placeholder: { fr: 'Ex: points sur le permis...', en: 'Ex: points on license...' } },
      {
        name: 'willing_to_train', type: 'radios', full: true, label: { fr: "Pret a former un candidat avec moins d'experience?", en: 'Willing to train a less experienced candidate?' },
        options: [opt('yes', 'Oui — si bon potentiel', 'Yes — if good potential'), opt('no', 'Non — experience obligatoire', 'No — experience required'), opt('depends', 'Depend du candidat', 'Depends on the candidate')],
      },
    ],
  },
  {
    num: 11,
    title: { fr: 'Pourquoi choisir votre entreprise', en: 'Why Choose Your Company' },
    sub: { fr: 'VOTRE VALEUR COMME EMPLOYEUR', en: 'YOUR VALUE AS AN EMPLOYER' },
    fields: [
      { name: 'why_choose_company', type: 'textarea', full: true, label: { fr: 'Pourquoi un chauffeur devrait vous choisir?', en: 'Why should a driver choose you?' }, placeholder: { fr: 'Ce qui vous distingue comme employeur...', en: 'What sets you apart as an employer...' } },
      { name: 'what_makes_different', type: 'textarea', full: true, label: { fr: "Qu'est-ce qui vous distingue des autres employeurs?", en: 'What makes you different from other employers?' }, placeholder: { fr: 'Equipement recent, bonnes routes...', en: 'Recent equipment, good routes...' } },
      { name: 'certifications', type: 'text', full: true, label: { fr: 'Certifications / reconnaissances', en: 'Certifications / recognitions' }, placeholder: { fr: 'Ex: CVOR, certifications ISO...', en: 'Ex: CVOR, ISO certifications...' } },
      {
        name: 'driver_testimonials', type: 'radios', label: { fr: 'Avez-vous des temoignages de chauffeurs satisfaits?', en: 'Testimonials from satisfied drivers?' },
        options: [opt('yes', 'Oui', 'Yes'), opt('no', 'Non', 'No')],
      },
      {
        name: 'transport_association_member', type: 'radios', label: { fr: "Etes-vous membre d'une association de transport?", en: 'Member of a transport association?' },
        options: [opt('yes', 'Oui', 'Yes'), opt('no', 'Non', 'No')],
      },
      { name: 'transport_association_name', type: 'text', full: true, label: { fr: 'Si oui, laquelle?', en: 'If yes, which one?' }, placeholder: { fr: 'Ex: ACQ, ANCAI, PMCA...', en: 'Ex: CTA, OTA, PMCA...' } },
    ],
  },
  {
    num: 12,
    title: { fr: 'Processus et suivi', en: 'Process & Follow-up' },
    sub: { fr: 'COMMENT ON TRAVAILLE ENSEMBLE', en: 'HOW WE WORK TOGETHER' },
    fields: [
      { name: 'interview_process', type: 'checkboxes', full: true, label: { fr: "Votre processus d'entrevue", en: 'Your interview process' }, options: interviewProcessOptions },
      {
        name: 'decision_timeline', type: 'select', label: { fr: 'Delai de decision apres entrevue', en: 'Decision timeline after interview' },
        options: [opt('24-48h', '24-48 heures', '24-48 hours'), opt('1w', '1 semaine', '1 week'), opt('2w', '2 semaines', '2 weeks'), opt('variable', 'Variable', 'Variable')],
      },
      {
        name: 'contact_preference', type: 'select', label: { fr: 'Preference de contact', en: 'Preferred contact method' },
        options: [opt('phone', 'Telephone', 'Phone'), opt('email', 'Courriel', 'Email'), opt('text', 'Texto', 'Text'), opt('any', 'Peu importe', 'No preference')],
      },
      { name: 'best_time_to_reach', type: 'text', label: { fr: 'Meilleur moment pour vous joindre', en: 'Best time to reach you' }, placeholder: { fr: 'Ex: lundi au vendredi, 8h-17h', en: 'Ex: Mon-Fri, 8am-5pm' } },
      { name: 'follow_up_contact_person', type: 'text', label: { fr: 'Responsable du suivi', en: 'Follow-up contact person' }, placeholder: { fr: 'Nom et titre', en: 'Name and title' } },
      {
        name: 'heard_about_us', type: 'select', full: true, label: { fr: 'Comment avez-vous entendu parler de CamionRecrute.com?', en: 'How did you hear about CamionRecrute.com?' },
        options: [
          opt('google', 'Recherche Google', 'Google search'),
          opt('social', 'Reseaux sociaux', 'Social media'),
          opt('word_of_mouth', 'Bouche a oreille', 'Word of mouth'),
          opt('ads', 'Publicite en ligne', 'Online advertising'),
          opt('other', 'Autre', 'Other'),
        ],
      },
      { name: 'additional_info', type: 'textarea', full: true, label: { fr: 'Informations supplementaires', en: 'Additional information' }, placeholder: { fr: 'Tout ce qui pourrait nous aider...', en: 'Anything that could help us...' } },
    ],
  },
]

export const COMPANY_FORM_REQUIRED_FIELDS: FormFieldDef[] = COMPANY_FORM_SECTIONS
  .flatMap((s) => s.fields)
  .filter((f) => f.required)

export const COMPANY_FORM_SUBMIT_NOTE: { fr: string; en: string } = {
  fr: 'Notre equipe vous contactera dans les 24 heures. Zero frais si on ne trouve pas votre candidat. Garantie 30 jours incluse.',
  en: "Our team will contact you within 24 hours. No charge if we don't find your candidate. 30-day guarantee included.",
}
