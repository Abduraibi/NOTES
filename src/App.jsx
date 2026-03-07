import { useState, useCallback } from "react";
import { Copy, Check, RotateCcw, Save, Clock, X, Moon, Sun, ChevronDown, ChevronUp, FlaskConical, FileText, ClipboardList, BookOpen, Search } from "lucide-react";

// ─── MX DATA ─────────────────────────────────────────────────────────────────

const MX_DATA = [
  {
    category: "🫁 Respiratory",
    color: "blue",
    items: [
      {
        label: "URTI",
        content: `Admit To PMW As A Case Of URTI With Poor Oral Intake:
- Vital Signs Q4hrs
- Keep SpO2 > 94%
- IVF D5 ½ NS ?? ml/hr + 20 mEq KCl/L
- CBC, U/E
- RBS Stat
- Blood C/S and CRP
- Paracetamol 210 MG IV Q4-6hr If Fever > 38.5
- Augmentin mg IV TID (25 mg/kg/dose)
- WHAT DONE AT ER DO NOT REPEAT`
      },
      {
        label: "Acute Bronchiolitis",
        content: `Admit To PMW As A Case Of Acute Bronchiolitis:
- Vital Signs Q4hrs
- Keep SpO2 > 94%
- Keep NPO If RR >
- IVF D5 ½ NS ml/hr + 20 mEq KCl/L
- CBC with Diff, U/E
- Chest XR
- 3% NaCl Nebs 3ml Q4hrs
- Airway Care, CPT and Suction Q2hrs + PRN
- Paracetamol mg IV Q4-6hr If Fever > 38.5
- If Patient Febrile > 38.5 Inform Doctor To Start ABX
- For Respiratory Reassessment
EXTRA:
- N-Acetylcysteine Nebs 2ml (infant) 4ml (child) TID or QID PRN if copious secretions
- Racemic Epinephrine 0.05ml/kg/dose (max 0.5ml) diluted in 3ml NS Q2-3hr PRN
  OR L-Epinephrine 0.5ml/kg/dose (max 2.5ml <4y, 5ml >4y) over 15 min
- If Deteriorates → Consider PICU`
      },
      {
        label: "Asthma Exacerbation (No BN)",
        content: `Admit To PMW As A Case Of BAE:
- V/S Q4hr
- Keep SpO2 > 94%
- Keep NPO If RR > 40
- IVF D5 ½ NS ml/hr + 20 mEq KCl/L
- CBC, U/E, RBS QID, Chest XR
- Ventolin Q2hrs (0.15/kg; 2.5mg <20kg, 5mg >20kg)
- Atrovent (250 mcg <5y, 500 mcg >5y Q4h for 24h)
  (125-250 mcg Q8h infants; 250 mcg Q6-8hr children)
- Methylprednisolone 2mg/kg/day BID x3 days
  IF Severe: 1mg/kg/dose QID x48hr then 2mg/kg/day x3 days
- If Developed Fever → Inform Doctor
- For Respiratory Reassessment
EXTRA:
- CPT and Suction PRN
- Magnesium Sulfate 25-50mg/kg/dose IV over 30 min (max 2g/dose) Q6hr PRN
  Under Cardiopulmonary Monitor — Hold if SBP < 75mmHg (age yrs × 2 + 70)
- If Deteriorates → Consider PICU`
      },
      {
        label: "Asthma Exacerbation (With BN)",
        content: `Admit To PMW As A Case Of BAE With Bronchopneumonia:
- V/S Q4hr
- Keep SpO2 > 94%
- Keep NPO If RR > 40
- CPT and Suction PRN
- IVF D5 ½ NS ml/hr + 20 mEq KCl/L
- CBC, U/E, RBS Stat, Chest XR
- Take Blood Culture and CRP
- Ventolin Q2hrs
- Atrovent
- Methylprednisolone 2mg/kg/day BID x3 days
  IF Severe: 1mg/kg/dose QID x48hr then 2mg/kg/day x3 days
- Magnesium Sulfate 25-50mg/kg/dose IV over 30 min (max 2g/dose) Q6hr PRN
  Hold if SBP < 75mmHg (age yrs × 2 + 70)
- Cefuroxime mg IV TID
- Clindamycin mg IV
- Paracetamol Q4-6hrs PRN Fever > 38
- For Respiratory Reassessment
EXTRA:
- If Deteriorates → Consider PICU`
      },
      {
        label: "Pneumonia",
        content: `Admit To PMW As A Case Of Bronchopneumonia:
- Vital Signs Q4hr
- Keep SpO2 > 94%
- Keep NPO If RR >
- IVF D5 ½ NS ml/hr + 20 mEq/L KCl
- CBC, U/E, Chest XR, VBG and RBS Stat
- CRP, ESR, Blood C/S
ABX by age:
- 1–3 Months: Ampicillin 200-300mg/kg/day IV Q6hrs + Cefotaxime 150mg/kg/day IV Q8hrs
- >3 Months: Cefuroxime 75-150mg/kg/day IV Q8hrs
  OR Augmentin 25mg/kg/dose IV Q8hr
  Severe: Ceftriaxone 75mg/kg/day IV Q12hrs
- School Age 6-12y: Azithromycin + Cefuroxime
- Paracetamol 10mg/kg IV Q4-6hrs PRN Fever > 38.5
- For Respiratory Reassessment`
      },
      {
        label: "Aspiration Pneumonia",
        content: `Admit To PMW As A Case Of Aspiration Pneumonia:
- V/S Q4hrs
- Keep SpO2 > 94%
- Keep NPO If RR > 50
- IVF D5 ½ NS ml/hr + 20 mEq/L KCl
- Anti-Reflux Measures
- CBC, U/E, VBG and RBS Stat, Blood Culture
- Omeprazole If Indicated
ABX by age:
- <3 Months: Clindamycin 40mg/kg/day IV Q8hrs + Cefotaxime 150mg/kg/day IV Q8hrs
- >3 Months: Clindamycin 40mg/kg/day IV Q8hrs
  OR Augmentin 30mg/kg/day IV Q8hrs
- Paracetamol 10mg/kg Q4-6hrs PRN Fever > 38.5`
      },
      {
        label: "Croup",
        content: `Admit To PMW As A Case Of Croup:
- Vital Signs Q4hrs
- Keep SpO2 > 94%
- Keep NPO If RR > 40
- IVF D5 ½ NS ml/hr
- CBC, U/E, CXR, RBS Stat
- VBG In Severe Cases
- Racemic Epinephrine Nebs 0.05ml/kg/dose (max 0.5ml)
- Dexamethasone 0.6mg/kg IV/PO OD
- Pulmicort Nebs Q12hr
- For Respiratory Reassessment
EXTRA:
- Exclude Other Causes (Epiglottitis, Foreign Body)`
      },
      {
        label: "Subjective Fever (Infant)",
        content: `Admit To PMW As A Case Of Subjective Fever For Observation:
- V/S Q4hr
- Keep SpO2 > 94%
- Oral Feeding Adlib
- CBC, CRP, U/E, Chest XR
- If Developed Fever > 38 Rectally → Inform Doctor`
      },
      {
        label: "Cyanosis (Observation)",
        content: `Admit To PMW As A Case Of Cyanosis For Observation:
- V/S Q4hr
- RBS Q4hr
- Close Observation
- Apnea Chart
- Neurovital Monitoring
- IVF D5 ½ NS 10ml/hr (½ M)
- Keep SpO2 > 94%
- CBC, U/E, Chest XR
- If Developed Fever > 38.5 → Inform Doctor`
      },
      {
        label: "Viral Myocitis",
        content: `Admit To PMW As A Case Of Viral Myocitis:
- Vital Signs Q4hr
- Keep SpO2 > 94%
- IVF D5 NS 120ml/hr + 20 KCl/L
- ORS 600ml per each vomiting and LOM
- CBC, U/E, CRP, VBG Stat
- Take Blood C/S
- Start Cefuroxime mg IV TID
- Repeat CPK Tomorrow Morning
- Hydration Reassessment`
      },
    ]
  },
  {
    category: "🦠 Infections",
    color: "red",
    items: [
      {
        label: "Fever Without Focus / Sepsis",
        content: `Admit To PMW As Case Of Fever To R/O Sepsis:
- VS Q4hr
- Keep SpO2 > 94%
- IVF D5 ½ NS ml/hr
- Full Septic Workup (LP, CSF complete analysis, culture, gram stain, PCR)
- Blood C/S
- Urine Analysis and C/S
- CRP, ESR
- Ceftriaxone
- Vancomycin
- Ampicillin
- Cefotaxime
- Paracetamol mg IV Q4-6hr PRN For Fever
NOTE:
**Fever from 2 months and above → Do Partial Septic Workup. Full workup depends on clinical judgement
**If VP Shunt → Give Vanco + Ceftazidime + Review Previous Infections`
      },
      {
        label: "UTI",
        content: `Admit To PMW As A Case Of UTI:
- V/S Q4hrs
- Keep SpO2 > 94%
- IVF D5 ½ NS ml/hr + 20 mEq KCl/L
- CBC, U/E, CRP
- UDS, Urinalysis and Culture
- Blood Culture
- Paracetamol mg IV Q4-6hr PRN For Fever
- Ceftriaxone (Be Cautious With Age)
Oral (febrile): 10 days course Amoxicillin or 3rd gen cephalosporin (e.g. Cefixime)
Oral (afebrile): 5 days course`
      },
      {
        label: "Follicular Tonsillitis",
        content: `Admit To PMW As A Case Of Follicular Tonsillitis With Poor Oral Intake:
- V/S Q4hr
- Keep SpO2 > 94%
- IVF D5 ½ NS ml/hr + 20 KCl mEq/L
- CBC, U/E
- ASO Titer, Blood C/S
- Paracetamol mg IV Q4-6hr PRN For Fever
- Augmentin mg IV TID`
      },
      {
        label: "Periorbital / Orbital Cellulitis",
        content: `Admit To PMW As A Case Of Periorbital Cellulitis:
- Vital Signs Q4hr
- Keep SpO2 > 94%
- IVF D5 ½ NS + 20 mEq/L KCl
- CBC, U/E, ESR, CRP, Blood C/S
- CT Of Orbits and Sinuses (if Orbital; not needed if Periorbital)
- Clindamycin IV OR Vancomycin with Pre-4th Dose Level
- Ceftriaxone IV
- Paracetamol
EXTRA:
- Ophthalmology and ENT Consultations`
      },
      {
        label: "Prolonged Fever / FUO",
        content: `Admit As A Case Of Prolonged Fever For Investigation:
- V/S Q4hr
- Keep SpO2 > 94%
- IVF D5 ½ NS ml/hr + 20 mEq KCl/L
- CBC with Diff, Blood Smear
- U/E, ESR, CRP
- Viral Serology (CMV, EBV, HIV)
- Hepatitis Screening, Brucella Titer
- LFT, Coagulation Profile
- Blood C/S, Urine C/S and Analysis, Stool C/S and Analysis
- Chest XR, Abdomen US
- NPA (if available)
- Paracetamol PRN For Fever
- Cefotaxime`
      },
      {
        label: "Stomatitis",
        content: `Admit To PMW As A Case Of Gingival Stomatitis:
- Vital Signs Q4hr
- Keep SpO2 > 94%
- D5 ½ NS 62ml/hr + KCl 20 mEq/L
- RBS Stat Q2hr x3 readings then Q4hr
- CBC, U/E, Blood Culture, CRP, NPA
- Nystatin 1ml PO TID
- Chlorhexidine Mouth Wash TID
- Paracetamol 150mg IV Q4-6hr PRN For Fever`
      },
      {
        label: "Meningitis — Antibiotics Guide",
        content: `MENINGITIS (neck stiffness, photophobia, nausea; infants: irritability, poor feeding, bulging fontanelle)

- Neonate (≤4 weeks): Ampicillin + Cefotaxime
- 4 wks–3 months: Ampicillin + Cefotaxime + Vancomycin (if sick)
- >3 months: IV Ceftriaxone + IV Vancomycin
  (if no Vanco → Linezolid; if no Ceftriaxone → Cefotaxime)
- Encephalitis (confusion, seizures, focal deficits): ADD Acyclovir
- VP Shunt Infection: IV Vancomycin + IV Ceftazidime (check previous cultures)
- Hospital-Acquired (<72hr discharge with >2 day admission):
  IV Piperacillin-Tazobactam ± IV Vancomycin ± Aminoglycoside`
      },
      {
        label: "Pneumonia — Antibiotics Guide",
        content: `Community Acquired Pneumonia ABX:
- Neonate: Full Septic Workup
- 1–3 months: IV Cefotaxime ± Macrolides
- 3 months–12y (immunized): IV Ampicillin ± Azithromycin
- 3 months–12y (non-immunized): IV Cefuroxime ± Azithromycin
- Aspiration: IV Augmentin
  (<3m or <4kg): 50mg/kg/dose BID
  (>3m and >4kg): 25mg/kg/dose TID (max 1g/dose)`
      },
      {
        label: "Other Infections — Antibiotics Guide",
        content: `Cellulitis: 1st Cloxacillin or Cefazolin; 2nd Clindamycin
Periorbital Cellulitis: Clindamycin
Osteoarticular (infant): Cefotaxime + Vancomycin
Osteoarticular (others): IV Clindamycin
Sickler: Clindamycin + Ceftriaxone
Primary Peritonitis: Ceftriaxone
UTI: Ceftriaxone IV if admitted
Febrile Neutropenia: Ceftazidime / Tazocine / Meropenem`
      },
    ]
  },
  {
    category: "🧠 Neurology",
    color: "purple",
    items: [
      {
        label: "Epilepsy (Unprovoked Convulsions)",
        content: `Admit To PMW As A Case Of Two Unprovoked Convulsions:
- V/S Q4hr
- Keep SpO2 > 94%
- Neurovital Monitoring, Seizure Chart
- Oral Adlib
- CBC, Full U/E, LFT
- MRI Brain, EEG
- Neurology Consultation
- If Seizure > 3 min OR 3 attacks in 1hr → Lorazepam 0.1mg/kg (max 4mg) + Inform Doctor`
      },
      {
        label: "Atypical Febrile Convulsion",
        content: `Admit To PMW As A Case Of Atypical Febrile Convulsion:
- V/S Q4hrs
- Keep SpO2 > 94%
- Keep NPO
- CT Brain
- IVF D5 NS ml/hr + 20 mEq/L KCl
- LP For CSF Study (including PCR)
- Blood and Urine C/S
- CRP, ESR
- Paracetamol, Ceftriaxone, Vancomycin (Pre-4th Dose Level)
- Inform Doctor If Any Convulsion Or Abnormal Behaviour
- If Convulsion > 3 min → Lorazepam`
      },
      {
        label: "Hypocalcemic Spasm",
        content: `Admit To PMW As A Case Of Hypocalcemia:
- V/S Q4hr
- Keep SpO2 > 94%
- Chest XR (?Thymus)
- CBC, U/E, PTH, Vitamin D
- Ca, Albumin, Mg, Phos Q6hr (per endocrinologist)
- Endocrine Consultation
- Start Calcium Protocol

CORRECTED CALCIUM = Serum Ca (mmol/L) + 0.02 × (44 − Patient Albumin)
Normal (Sanjad): ≥ 1.8 mmol/L

Severe (C.Ca < 1.5 mmol/L or iCa < 0.72 mmol/L) SYMPTOMATIC:
1. Ca Gluconate 10% 2ml/kg stat over 30 min under cardiac monitor
2. If still symptomatic → repeat above
3. Maintenance: Ca Gluconate 10% 5-8ml/kg/day
4. Bone profile Q4-6hr during infusion
5. Once C.Ca 1.8-2.0 → decrease IV Ca by 50% over 24hr
6. Start oral calcium 50-75mg/kg/day

ASYMPTOMATIC severe:
1. IV Ca Gluconate 10% 5-8ml/kg/24hr under ECG monitor
2. Bone profile Q4-6hr
3. Once C.Ca 1.8-2.0 → decrease IV Ca by 50%
4. Start oral calcium 50-75mg/kg/day`
      },
    ]
  },
  {
    category: "🍬 Endocrine",
    color: "yellow",
    items: [
      {
        label: "Newly Diagnosed IDDM",
        content: `Admit To PMW As A Case Of Newly Diagnosed IDDM:
- V/S Q4hr, Keep SpO2 > 94%, Diabetic Diet
- CBC, U/E, HbA1c
- Bone Profile (Ca, Phos, Mg, Albumin, ALP)
- TFT, Vitamin D, Celiac Screening, Thyroglobulin Ab
GLUCOSE MONITORING:
Pre-meal, 2hr post-meal, bedtime, 4hr after sleep, pre-snacks, 2hr post + PRN hypoglycemia

INSULIN:
- TDD: 0.7-1.2 U/kg/day (0.7 for ≤7 years)
- Long-acting (Tresiba/Glargine/Toujeo): 40% of TDD OD
- Rapid (Aspart/Lispro): 60% of TDD divided TID with meals
- Sliding Scale ISF = 1500-1800 ÷ TDD
  * Below target → no correction
  * Above target → extra Aspart units per ISF
- Min 3hrs between Aspart injections
- If Reflo ≥ 300 → do UDS; if +ve → VBG

HYPOGLYCEMIA (Reflo < 70):
→ Half cup juice → recheck 15 min → if improved give meal
→ If still low → repeat half cup juice → recheck 15 min

- Diabetic Educator + Dietitian Referral
- Discharge: Glucagon 0.5mg IM for hypoglycemia`
      },
    ]
  },
  {
    category: "💧 GIT",
    color: "green",
    items: [
      {
        label: "Acute Gastroenteritis (AGE)",
        content: `Admit To PMW As A Case Of AGE:
- V/S Q4hr
- Keep SpO2 > 94%
- IVF D5 ½ NS + 20 mEq/L KCl
- ORS 10ml/kg with every LOM or vomiting
- RBS Q4hr, VBG
- CBC, U/E
- Stool Analysis and Culture
- Stool Occult Blood (if blood → Coagulation + Abdomen US)
- UDS and Urine Culture (if febrile)
- Paracetamol mg IV Q4-6hr PRN For Fever
- Ondansetron mg IV TID PRN (0.15mg/kg/dose, max 8mg)
- Hydration Reassessment
EXTRA:
- Glucose Infusion Rate if Hypoglycemia`
      },
      {
        label: "Neonatal Jaundice — Direct",
        content: `Admit To PMW As A Case Of Neonatal Jaundice (Direct):
- V/S Q4hr, Keep SpO2 > 94%
- IVF D10 Maintenance
- CBC, U/E
- LFT (including GGT and Coagulation Profile)
- Blood Group and DCT, Retic Counts
- Abdomen US, Urine C/S
- Hepatitis and HIV Screening
- TORCH Screening
- Thyroid Function Test
- Metabolic Screening
- GIT Consultation`
      },
      {
        label: "Neonatal Jaundice — ABO Indirect",
        content: `Admit To PMW As A Case Of Neonatal Jaundice:
- V/S Q4hr, Keep SpO2 > 94%
- IVF D10 Maintenance
- CBC, U/E
- Blood Group, DCT, Retic Counts
- Keep On Phototherapy
- Repeat SBR After 6 Hours
EXTRA:
- Monitor Hb → Consider Blood Transfusion (target Hb 7-8)
- Consider Metabolic Disease (Ammonia and Lactate)
- Consider Sepsis if looks sick
- Hb Electrophoresis`
      },
      {
        label: "Physiological NNJ — Indirect",
        content: `Admit To PMW As A Case Of Physiological Jaundice:
- VS Q4hr, Keep SpO2 > 94%
- D10 1½ Maintenance
- CBC, U/E
- Blood Group and DCT
- Keep On Phototherapy
- Repeat SBR After 6 Hours`
      },
      {
        label: "Congenital Chloride Diarrhea",
        content: `Admit To PMW As A Case Of Congenital Chloride Diarrhea:
- V/S Q4hrs, Keep SpO2 > 94%
- IVF D5 NS or ½ NS (according to Na level) usually 1.5M + mEq KCl/L
- CBC, Full U/E including Cl
- Repeat VBG (increase K according to K level)
- U/E Q6hr
- Hydration Reassessment
- Home Medication: NaCl ml PO QID, KCl ml PO BID`
      },
    ]
  },
  {
    category: "🩸 Hematology",
    color: "rose",
    items: [
      {
        label: "Febrile Neutropenia",
        content: `Admit To PMW As A Case Of Febrile Neutropenia:
- V/S Q4hr, Keep SpO2 > 94%
- D5 ½ NS ml/hr (M)
- CBC With Diff, Retics Count, Blood Smear
- CRP, ESR
- Viral Serology (CMV, EBV, HIV), Hepatitis Screening, Brucella Titer
- Abdomen US
- Full U/E with Uric Acid, LDH
- LFT, Coagulation Profile
- 2x Blood C/S from different sites
- Urine C/S and Analysis
- Chest XR (interpret with caution — infiltrate may not be apparent till NE recovers)
- NPA
- PHO Consultation
- Start Ceftazidime OR Tazocine ± Vancomycin (pneumonia/soft tissue/mucositis)
- Paracetamol mg IV Q4-6hr PRN For Fever
HIGH RISK: PHO patient, <1y, Down Syndrome, immunosuppressed, any signs of infection`
      },
      {
        label: "Pancytopenia",
        content: `Admit To PMW As A Case Of Pancytopenia:
- V/S Q4hr, Keep SpO2 > 94%
- D5 ½ NS ml/hr (1½ Maintenance)
- CBC With Diff, Retics Count, Blood Smear
- CRP, ESR
- Viral Serology (CMV, EBV, HIV), Hepatitis Screening, Brucella Titer
- Abdomen US
- Full U/E with Uric Acid, LDH
- LFT, Coagulation Profile
- Blood C/S, Urine C/S and Analysis, Chest XR
- COVID-19 Swab
- PHO Consultation
- Start Ceftazidime + Gentamicin if febrile neutropenia
- Paracetamol PRN For Fever`
      },
      {
        label: "ITP / Thrombocytopenia",
        content: `Admit To PMW As A Case Of Thrombocytopenia For Further Evaluation:
- Keep SpO2 > 94%
- VS Q4hr
- Head Trauma Precautions
- IVF D5 NS
- CBC With Diff, Peripheral Smear
- U/E, Coagulation Profile
- ANA, Blood Grouping
- HIV, HBV, HBC, CMV, EBV
- PHO Consultation
- WHAT DONE AT ER DO NOT REPEAT`
      },
    ]
  },
  {
    category: "🫀 Rheumatology",
    color: "orange",
    items: [
      {
        label: "Arthritis",
        content: `Admit To PMW As A Case Of Arthritis:
- V/S Q4hr, Keep SpO2 > 94%
- IVF D5 ½ NS ml/hr
- CBC With Diff, U/E, Blood Film
- CRP, ESR, CPK
- Brucella Titer, ECG, ASO Titer
- Blood and Urine C/S
- Anti-DNA, ANA, RF, C3, C4
- Joint US
- ABX If Needed
- Paracetamol IV
EXTRA:
- Cardiology Consultation (if suspected Rheumatic Fever)`
      },
      {
        label: "HSP",
        content: `Admit As A Case Of HSP With ..:
- V/S Q4hr + BP with proper cuff size
- Keep SpO2 > 94%
- IVF D5 ½ NS 60ml/hr
PAIN MANAGEMENT:
- Mild-Moderate: Paracetamol OR Ibuprofen 10mg/kg IV Q4-6hr PRN
  OR Naproxen 10-20mg/kg/day PO BID (max 1000mg/24hr)
- Severe pain / GI bleeding / scrotal swelling / severe nephritis:
  Prednisone 1-2mg/kg/day (max 60mg/day) + Omeprazole 1mg/kg
- CBC, U/E, ESR, CRP
- Coagulation Profile
- UDS and Urine Analysis
- Abdomen US (if colicky abdominal pain)
- Stool Occult Blood`
      },
    ]
  },
  {
    category: "🫘 Nephrology",
    color: "teal",
    items: [
      {
        label: "Nephrotic Syndrome — New",
        content: `Admit To PMW As A Case Of (Typical) Nephrotic Syndrome:
- V/S + BP Q4hrs
- Keep SpO2 > 94%
- IVF D5 ½ NS (2/3 Maintenance or Oliguric) OR Low Salt-Fat Diet
- Nephrotic Chart, Weight and Abdominal Girth Daily
- Strict I/O Chart, UDS Daily (first voided AM)
- 24hr Urine Protein/Creatinine Ratio
- CBC With Diff and Smear, Full U/E
- Lipid Profile, Urine Analysis and Culture
- CRP, ESR, ASO Titer, C3, C4
- Hepatitis Screening, Chest XR, Abdomen US
- Prednisolone 60mg/m² PO OD Morning (BSA=m²) max 60mg
- Omeprazole 1mg/kg PO OD
- Consider Albumin Transfusion
- BP: If ≥ 95th + 12mmHg for 3 consecutive readings 15 min apart → Inform Doctor
- If Fever > 38.5 → Blood Culture + Inform Doctor to Start ABX`
      },
      {
        label: "Nephrotic Syndrome — Relapse",
        content: `Admit To PMW As K/C Of Nephrotic Syndrome With Relapse:
- V/S + BP Q4hrs
- Keep SpO2 > 94%
- IVF D5 ½ NS (2/3 Maintenance or Oliguric) OR Low Salt-Fat Diet
- Nephrotic Chart, Weight and Abdominal Girth Daily
- Strict I/O Chart, UDS Daily (first voided AM)
- Urine Protein/Creatinine Ratio
- CBC With Diff, Full U/E
- Urine Analysis and Culture, CRP, ESR, Chest XR
- Omeprazole 20mg IV OD
- Consider Albumin Transfusion
- Prednisolone 60mg PO OD Morning
- Repeat Albumin Tomorrow Morning
- BP: If ≥ 95th + 12mmHg x3 readings 15 min apart → Inform Doctor
- If Fever > 38.5 → Blood Culture + Inform Doctor to Start ABX`
      },
    ]
  },
  {
    category: "🧬 Metabolic",
    color: "indigo",
    items: [
      {
        label: "Metabolic Disease",
        content: `Admit To PMW As A Case Of ..:
- VS Q4hr, Keep SpO2 > 94%
- Keep NPO Till Further Order
- IVF D10 ½ NS (1.5 or M) ml/hr
- RBS Stat + Q2hr
- CBC, U/E, LFT, Coagulation Profile
- VBG, CPK, LDH, Uric Acid, Lipid Profile
- Ammonia (WITHOUT tourniquet, green top, on ice, separated within 15 min)
- Follow Metabolic Screening
- If Fever > 38.5 → Blood C/S + Urine C/S + Start ABX`
      },
    ]
  },
  {
    category: "☠️ Toxicology",
    color: "gray",
    items: [
      {
        label: "Scorpion Sting",
        content: `Admit To PMW As A Case Of Scorpion Sting For Observation:
- Vital Signs Q4hr
- Keep SpO2 > 94%
- Neurovital Monitoring
- CBC, Full U/E, LFT, Coagulation Profile, CPK, Amylase, Troponin, CPK-MB, ECG
- IVF D5 NS 78ml/hr
- WHAT DONE AT ER DO NOT REPEAT`
      },
      {
        label: "Aspirin Ingestion",
        content: `Admit To PMW As A Case Of Suspected Aspirin Ingestion Unknown Amount For Observation:
- VS Q4hr, Keep SpO2 > 94%
- IVF D5 ½ NS 50ml/hr
- CBC, U/E, LFT, Full U/E
- Coagulation Profile
- Repeat VBG Now then After 2hr
- Salicylate (Aspirin) Drug Level (collect sample to send if available)
- Urine Analysis`
      },
    ]
  },
  {
    category: "💉 Allergy / Immunology",
    color: "pink",
    items: [
      {
        label: "Anaphylaxis",
        content: `Admit To PMW As A Case Of Anaphylaxis For Observation:
- Vital Signs Q4hr including BP
- Keep SpO2 > 94%
- IVF D5 ½ NS ml/hr (M)
- Epinephrine IM mid antero-lateral thigh (1:1000) 0.01ml/kg (max 0.5ml)
  Can repeat Q5-15 min as needed
- Ventolin 2.5mg Nebs Q4hr + PRN
- Racemic Epinephrine 0.5ml of 2.25% solution inhaled (upper airway obstruction)
- Diphenhydramine IV (H1) 1mg/kg (max 40mg)
- Ranitidine IV (H2) 1mg/kg (max 50mg)
- Methylprednisolone IV 1mg/kg (max 125mg)
DISCHARGE:
- Epi-pen if >30kg; Epi-pen Junior if <30kg`
      },
    ]
  },
  {
    category: "💊 Drug Doses",
    color: "cyan",
    items: [
      {
        label: "Antibiotics",
        content: `AMPICILLIN:
- <1 wk, <2kg: 100mg/kg/day BID
- <1 wk, >2kg: 150mg/kg/day TID
- >1 wk, <2kg: 150mg/kg/day TID
- >1 wk, >2kg: 200mg/kg/day QID

CEFUROXIME:
- ≥3 months: 100mg/kg/day TID (severe: 200mg/kg/day TID)
- PO: 20mg/kg/day BID (max 500mg)

CEFTRIAXONE (≥1 month):
- Moderate: 75mg/kg/day BID
- Severe/Meningitis: 100mg/kg/day BID (max 4g/day)

CEFOTAXIME:
- <1wk, <2kg: 150mg/kg/day TID
- <1wk, >2kg: 150mg/kg/day TID
- 1-4 wks, >2kg: 200mg/kg/day QID
- 1m–12y, <50kg moderate: 150mg/kg/day TID
- Severe: 200mg/kg/day TID/QID (max 12g/day)

VANCOMYCIN (1m–12y CNS/endocarditis/pneumonia/osteomyelitis):
- 20mg/kg/dose Q6hr

AZITHROMYCIN:
- Pneumonia: 10mg/kg day 1 then 5mg/kg OD x4 days
- Tonsillitis/pharyngitis (2y–12y): 12mg/kg OD x5 days
- Pertussis (1m–6m): 10mg/kg OD x5 days

MEROPENEM:
- Meningitis dose: 40mg/kg/dose (max 2g/dose)
- Standard: 20mg/kg/dose (max 1g/dose)

LINEZOLID (3m–11y): 10mg/kg/dose TID
CLINDAMYCIN: 20-40mg/kg/day`
      },
      {
        label: "Respiratory Medications",
        content: `SALBUTAMOL (Ventolin):
- <1y: 0.15mg/kg
- <20kg: 2.5mg nebs
- >20kg: 5mg nebs

ATROVENT:
- <12y: 250 mcg Q4hr
- >12y: 500 mcg Q4hr

METHYLPREDNISOLONE (3-5 days):
- 1-2mg/kg/day BID (max 60mg/day)
- Severe: 1mg/kg/dose QID x48hr then 2mg/kg/day x3 days

PREDNISOLONE: 2mg/kg/day BID x5-7 days (if longer → taper)

RACEMIC EPINEPHRINE: 0.05ml/kg/dose (max 0.5ml) in 3ml NS Q2-3hr PRN
L-EPINEPHRINE: 0.5ml/kg/dose (max 2.5ml <4y; 5ml >4y) over 15 min
EPINEPHRINE (1:1000): 1ml + 3ml NS neb over 15 min

N-ACETYLCYSTEINE NEBS: 2ml (infant), 4ml (child) TID/QID PRN
PULMICORT: 250 mcg nebs OD or BID
DEXAMETHASONE (croup): 0.6mg/kg IV/PO OD`
      },
      {
        label: "Seizure / Neuro Medications",
        content: `LORAZEPAM: 0.1mg/kg (max 4-5mg) IV over 2-5 min
DIAZEPAM: 0.2mg/kg (max 10mg) IV over 2-5 min
PHENOBARBITAL: 20mg/kg (max 1000mg) IV over 20 min (loading)
MAGNESIUM SULFATE: 25-50mg/kg/dose IV over 30 min (max 2g/dose) Q6hr`
      },
      {
        label: "Other Common Medications",
        content: `ONDANSETRON:
- IV (>1 month): 0.15-0.3mg/kg/dose
- Oral: 8-10kg → 2mg; 15-30kg → 4mg; >30kg → 8mg

PARACETAMOL: 10-15mg/kg IV/PO Q4-6hr PRN (fever >38.5)

OMEPRAZOLE: 1mg/kg PO OD

MAGNESIUM SULFATE: 25-50mg/kg/dose IV infusion over 30 min (max 2g/dose) Q6hr

NaHCO3 CORRECTION: (Desired HCO3 − Actual HCO3) × 0.3 × weight (kg)

CALCIUM GLUCONATE 10%:
- Symptomatic hypocalcemia: 2ml/kg stat over 30 min under cardiac monitor`
      },
    ]
  },
];

// ─── BARCODES ─────────────────────────────────────────────────────────────────

const BARCODES = [
  { label: "U/E", codes: "028140026|028140380|028140390|028140204|028140430|028140070|028140423|028140250|028140342" },
  { label: "LFT", codes: "028140364|028140362|028140360|028140400|028140026|028140365|028140056" },
  { label: "CSF Study", codes: "020140030|020150048|028141183|028140086|020150106" },
  { label: "Lipid Profile", codes: "028140408|028140341|028140433|028140090" },
  { label: "Coagulation Profile", codes: "020140101|020140009" },
  { label: "LFT & Coagulation", codes: "028140364|028140362|028140360|028140400|028140026|028140365|028140056|020140101|020140009" },
  { label: "U/E & LFT", codes: "028140026|028140380|028140390|028140204|028140430|028140070|028140423|028140250|028140342|028140364|028140362|028140360|028140400|028140026|028140365|028140056" },
  { label: "U/E & Coagulation", codes: "028140026|028140380|028140390|028140204|028140430|028140070|028140423|028140250|028140342|020140101|020140009" },
  { label: "Viral Panel", codes: "020170066|020170067|020170137|020170023|020170126|020170331|020170344|020190001" },
  { label: "TORCH", codes: "020170248|020170249|020170066|020170067|020160062|020170112|020170323|020170345|020170221|020170222" },
];

const TEMPLATES = [
  { label: "LP Done", icon: "🩸", text: "Lumbar puncture was attempted under aseptic technique after informed consent. Procedure was [successful / unsuccessful] with [CSF obtained / no CSF obtained]. Patient tolerated the procedure [well / with difficulty] and vitals remained stable." },
  { label: "LP Refused", icon: "🚫", text: "LP was explained to the mother including indication, procedure, and possible risks/benefits.\nThe mother refused the procedure and signed refusal form." },
  { label: "DAMA", icon: "⚠️", text: "The mother requested discharge Against Medical Advice (DAMA). The patient's condition, management plan, and potential risks and complications were explained thoroughly, and all her questions were answered. Despite this, she insisted on proceeding with DAMA and signed the DAMA form." },
];

// ─── DEFAULTS ─────────────────────────────────────────────────────────────────

const defaultLabs = { wbc: "", ne: "", hgb: "", plt: "", crp: "", ph: "", pco2: "", hco3: "", na: "140", k: "3.8", glu: "", urea: "", creat: "" };
const defaultState = {
  name: "", age: "", mrn: "", room: "", dx: "", ftNsvd: "FT, NSVD, NO NICU ADMISSION",
  hxLines: ["", "", "", ""], labs: { ...defaultLabs }, extraLabs: [],
  imagingLines: [], showImaging: false, currentMeds: [], erLevel: "", plan: "",
  general: "PT LOOKS WELL , WELL HYDRATED AND PERFUSED , HD STABLE, NOT IN DISTRESS , ON RA",
  chest: "EBAE, NO ADDED SOUNDS", abd: "SOFT AND LAX NO HEPATOSPLENOMEGALY", cvs: "S1+S2+0"
};

const up = v => v.toUpperCase();

// ─── COLOR MAP ────────────────────────────────────────────────────────────────

const COLOR = {
  blue:   { bg: "bg-blue-50",   border: "border-blue-200",   badge: "bg-blue-100 text-blue-700",   btn: "bg-blue-600 hover:bg-blue-700" },
  red:    { bg: "bg-red-50",    border: "border-red-200",    badge: "bg-red-100 text-red-700",     btn: "bg-red-600 hover:bg-red-700" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", badge: "bg-purple-100 text-purple-700", btn: "bg-purple-600 hover:bg-purple-700" },
  yellow: { bg: "bg-yellow-50", border: "border-yellow-200", badge: "bg-yellow-100 text-yellow-700", btn: "bg-yellow-600 hover:bg-yellow-700" },
  green:  { bg: "bg-green-50",  border: "border-green-200",  badge: "bg-green-100 text-green-700", btn: "bg-green-600 hover:bg-green-700" },
  rose:   { bg: "bg-rose-50",   border: "border-rose-200",   badge: "bg-rose-100 text-rose-700",   btn: "bg-rose-600 hover:bg-rose-700" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-100 text-orange-700", btn: "bg-orange-600 hover:bg-orange-700" },
  teal:   { bg: "bg-teal-50",   border: "border-teal-200",   badge: "bg-teal-100 text-teal-700",   btn: "bg-teal-600 hover:bg-teal-700" },
  indigo: { bg: "bg-indigo-50", border: "border-indigo-200", badge: "bg-indigo-100 text-indigo-700", btn: "bg-indigo-600 hover:bg-indigo-700" },
  gray:   { bg: "bg-gray-50",   border: "border-gray-200",   badge: "bg-gray-100 text-gray-700",   btn: "bg-gray-600 hover:bg-gray-700" },
  pink:   { bg: "bg-pink-50",   border: "border-pink-200",   badge: "bg-pink-100 text-pink-700",   btn: "bg-pink-600 hover:bg-pink-700" },
  cyan:   { bg: "bg-cyan-50",   border: "border-cyan-200",   badge: "bg-cyan-100 text-cyan-700",   btn: "bg-cyan-600 hover:bg-cyan-700" },
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

const LabInput = ({ k, label, placeholder, labs, onChange, dark }) => (
  <div className="flex flex-col gap-1">
    <label className={`text-xs font-semibold uppercase tracking-wide ${dark ? "text-gray-400" : "text-gray-500"}`}>{label}</label>
    <input className={`w-16 border rounded px-2 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 ${dark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500" : "border-gray-300 bg-white"}`}
      placeholder={placeholder || ""} value={labs[k]} onChange={e => onChange(k, up(e.target.value))} />
  </div>
);

const Section = ({ title, icon, children, dark, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
      <button onClick={() => setOpen(p => !p)} className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${dark ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}>
        <span className={`font-bold text-sm uppercase tracking-wide ${dark ? "text-gray-300" : "text-gray-700"}`}>{icon} {title}</span>
        {open ? <ChevronUp className={`w-4 h-4 ${dark ? "text-gray-500" : "text-gray-400"}`} /> : <ChevronDown className={`w-4 h-4 ${dark ? "text-gray-500" : "text-gray-400"}`} />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
};

// ─── MX PAGE ──────────────────────────────────────────────────────────────────

const MxPage = ({ dark }) => {
  const [search, setSearch] = useState("");
  const [copiedKey, setCopiedKey] = useState(null);
  const [expandedKey, setExpandedKey] = useState(null);
  const D = dark;

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const query = search.toLowerCase();
  const filtered = MX_DATA.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      item.label.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query) ||
      cat.category.toLowerCase().includes(query)
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="space-y-4 pb-10">
      {/* Search */}
      <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm ${D ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <Search className={`w-4 h-4 flex-shrink-0 ${D ? "text-gray-400" : "text-gray-400"}`} />
        <input
          className={`flex-1 text-sm bg-transparent outline-none ${D ? "text-white placeholder-gray-500" : "text-gray-800 placeholder-gray-400"}`}
          placeholder="Search conditions, drugs, protocols..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
        {search && <button onClick={() => setSearch("")}><X className="w-4 h-4 text-gray-400" /></button>}
      </div>

      {filtered.length === 0 && (
        <p className={`text-center text-sm py-10 ${D ? "text-gray-500" : "text-gray-400"}`}>No results found for "{search}"</p>
      )}

      {filtered.map((cat, ci) => {
        const c = COLOR[cat.color] || COLOR.blue;
        return (
          <div key={ci} className={`rounded-xl border shadow-sm overflow-hidden ${D ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <div className={`px-4 py-3 border-b ${D ? "border-gray-700 bg-gray-750" : `${c.bg} ${c.border}`}`}>
              <h2 className={`font-bold text-sm uppercase tracking-wide ${D ? "text-gray-300" : "text-gray-700"}`}>{cat.category}</h2>
            </div>
            <div className="p-3 space-y-2">
              {cat.items.map((item, ii) => {
                const key = `${ci}-${ii}`;
                const isOpen = expandedKey === key;
                return (
                  <div key={ii} className={`rounded-lg border overflow-hidden ${D ? "border-gray-700" : `${c.border}`}`}>
                    <button onClick={() => setExpandedKey(isOpen ? null : key)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors ${D ? "hover:bg-gray-700" : `hover:${c.bg}`}`}>
                      <span className={`text-sm font-semibold ${D ? "text-gray-200" : "text-gray-700"}`}>{item.label}</span>
                      {isOpen ? <ChevronUp className={`w-4 h-4 flex-shrink-0 ${D ? "text-gray-500" : "text-gray-400"}`} /> : <ChevronDown className={`w-4 h-4 flex-shrink-0 ${D ? "text-gray-500" : "text-gray-400"}`} />}
                    </button>
                    {isOpen && (
                      <div className={`px-3 pb-3 ${D ? "bg-gray-750" : c.bg}`}>
                        <pre className={`text-xs leading-relaxed whitespace-pre-wrap font-mono mb-3 ${D ? "text-gray-300" : "text-gray-700"}`}>{item.content}</pre>
                        <button onClick={() => copyText(item.content, key)}
                          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold text-white transition-all ${copiedKey === key ? "bg-green-500" : c.btn}`}>
                          {copiedKey === key ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── REFERENCES PAGE ──────────────────────────────────────────────────────────

const ReferencesPage = ({ dark }) => {
  const [copiedKey, setCopiedKey] = useState(null);
  const D = dark;
  const copyText = (text, key) => { navigator.clipboard.writeText(text); setCopiedKey(key); setTimeout(() => setCopiedKey(null), 2000); };

  return (
    <div className="space-y-4 pb-10">
      <div className={`rounded-xl border shadow-sm overflow-hidden ${D ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <div className={`flex items-center gap-2 px-4 py-3 border-b ${D ? "border-gray-700" : "border-gray-100"}`}>
          <FlaskConical className={`w-4 h-4 ${D ? "text-blue-400" : "text-blue-500"}`} />
          <h2 className={`font-bold text-sm uppercase tracking-wide ${D ? "text-gray-300" : "text-gray-700"}`}>Lab Barcodes</h2>
        </div>
        <div className="p-4 space-y-3">
          {BARCODES.map((item, i) => (
            <div key={i} className={`rounded-lg border p-3 ${D ? "border-gray-700" : "border-gray-100 bg-gray-50"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold uppercase tracking-wide ${D ? "text-blue-400" : "text-blue-600"}`}>{item.label}</span>
                <button onClick={() => copyText(item.codes, `bc-${i}`)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${copiedKey === `bc-${i}` ? "bg-green-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
                  {copiedKey === `bc-${i}` ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
              <p className={`text-xs font-mono break-all leading-relaxed ${D ? "text-gray-400" : "text-gray-500"}`}>{item.codes}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={`rounded-xl border shadow-sm overflow-hidden ${D ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <div className={`flex items-center gap-2 px-4 py-3 border-b ${D ? "border-gray-700" : "border-gray-100"}`}>
          <FileText className={`w-4 h-4 ${D ? "text-purple-400" : "text-purple-500"}`} />
          <h2 className={`font-bold text-sm uppercase tracking-wide ${D ? "text-gray-300" : "text-gray-700"}`}>Procedure & Admin Templates</h2>
        </div>
        <div className="p-4 space-y-4">
          {TEMPLATES.map((item, i) => (
            <div key={i} className={`rounded-lg border p-3 ${D ? "border-gray-700" : "border-gray-100 bg-gray-50"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold uppercase tracking-wide ${D ? "text-purple-400" : "text-purple-600"}`}>{item.icon} {item.label}</span>
                <button onClick={() => copyText(item.text, `t-${i}`)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${copiedKey === `t-${i}` ? "bg-green-500 text-white" : "bg-purple-600 hover:bg-purple-700 text-white"}`}>
                  {copiedKey === `t-${i}` ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
              <p className={`text-xs leading-relaxed whitespace-pre-wrap ${D ? "text-gray-400" : "text-gray-600"}`}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage]           = useState("notes");
  const [tab, setTab]             = useState("progress");
  const [copied, setCopied]       = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showNote, setShowNote]   = useState(false);
  const [dark, setDark]           = useState(false);
  const [history, setHistory]     = useState([]);
  const [savedPatients, setSavedPatients] = useState([]);
  const [saveLabel, setSaveLabel] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [s, setS]                 = useState({ ...defaultState, labs: { ...defaultLabs } });
  const D = dark;

  const setField = useCallback((key, val) => setS(p => ({ ...p, [key]: val })), []);
  const setLab   = useCallback((key, val) => setS(p => ({ ...p, labs: { ...p.labs, [key]: val } })), []);

  const buildNote = () => {
    const { name, age, mrn, room, dx, ftNsvd, hxLines, labs, extraLabs, imagingLines, showImaging, currentMeds, erLevel, plan, general, chest, abd, cvs } = s;
    const examBlock      = `O/E :\n${general}\nCHEST : ${chest}\nABD : ${abd}\nCVS : ${cvs}`;
    const extraLabsBlock = extraLabs.filter(l => l.name || l.value).map(l => `- ${l.name}: ${l.value}`).join("\n");
    const labBlock       = `LABS:\n- CBC: WBC ${labs.wbc} | NE ${labs.ne} | HGB ${labs.hgb} | PLT ${labs.plt}\n- CRP: ${labs.crp} MG/L\n- VBG: PH 7.${labs.ph} | PCO2 ${labs.pco2} | HCO3 ${labs.hco3} |\n- U/E: NA ${labs.na} | K ${labs.k} | GLU ${labs.glu} | UREA ${labs.urea} | CREAT ${labs.creat} |${extraLabsBlock ? "\n" + extraLabsBlock : ""}`;
    const imagingBlock   = showImaging && imagingLines.some(l => l.trim()) ? `* IMAGING:\n${imagingLines.filter(l => l.trim()).map(l => `- ${l}`).join("\n")}` : "";
    const medsBlock      = currentMeds.filter(m => m.trim()).length > 0 ? `* CURRENTLY ON :\n${currentMeds.filter(m => m.trim()).map(m => `- ${m}`).join("\n")}` : "";
    const hxBlock        = hxLines.map(l => `- ${l}`).join("\n");
    const erBlock        = erLevel.trim() ? `AT ER LEVEL :\n${erLevel}\n------------------------------------------------------------\n` : "";

    if (tab === "progress") {
      return [
        `------------------------------------------------------------`,
        `THIS IS ${name ? name + " ," : ","} ${age ? age + " OLD ," : ""} ${ftNsvd.trim() ? ftNsvd : ""}`,
        `* PRESENTED TO ER WITH HX OF :`,
        hxBlock,
        `------------------------------------------------------------`,
        erBlock || null,
        `* ${examBlock}`,
        ``,
        `* ${labBlock}`,
        ``,
        imagingBlock ? imagingBlock + "\n" : null,
        medsBlock ? medsBlock + "\n" : null,
        `* ASSESSMENT:`,
        `${name ? name + ", " : ""}${age} OLD. ADMITTED AS A CASE OF ${dx}, HD STABLE, ON RA.`,
        ``,
        `* PLAN:`,
        plan.trim() ? plan : "SEE ORDER SHEET",
      ].filter(l => l !== null).join("\n");
    }

    return [
      `* IDENTIFICATION:`,
      `${name} , ${age} OLD.`,
      `MRN#${mrn}, ROOM#${room}`,
      ``,
      `* SITUATION:`,
      `${name} ${age} OLD. ADMITTED AS A CASE OF ${dx}, HD STABLE, ON RA.`,
      ``,
      `* BACKGROUND:`,
      ` PRESENTED TO ER WITH HX OF :`,
      hxBlock,
      `------------------------------------------------------------`,
      erBlock || null,
      `* ${examBlock}`,
      ``,
      `* ${labBlock}`,
      ``,
      imagingBlock ? imagingBlock + "\n" : null,
      medsBlock ? medsBlock + "\n" : null,
      `------------------------------------------------------------`,
      `* ASSESSMENT:`,
      `${name} ${age} OLD. ADMITTED AS A CASE OF ${dx}, HD STABLE, ON RA.`,
      ``,
      `R-RECOMMENDATION :`,
      plan.trim() ? plan : "SEE ORDER SHEET",
    ].filter(l => l !== null).join("\n");
  };

  const output = buildNote();

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    const entry = { id: Date.now(), type: tab.toUpperCase(), label: s.name || s.dx || "Unnamed", note: output, time: new Date().toLocaleString() };
    setHistory(p => [entry, ...p].slice(0, 10));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => { if (confirm("Reset all fields?")) setS({ ...defaultState, labs: { ...defaultLabs } }); };
  const savePatient = () => {
    if (!saveLabel.trim()) return;
    setSavedPatients(p => [{ id: Date.now(), label: saveLabel, tab, state: s }, ...p]);
    setSaveLabel(""); setShowSaveInput(false);
  };
  const loadPatient   = (entry) => { setS(entry.state); setTab(entry.tab); setShowSaved(false); setPage("notes"); };
  const deletePatient = (id)    => setSavedPatients(p => p.filter(x => x.id !== id));
  const deleteHistory = (id)    => setHistory(p => p.filter(x => x.id !== id));

  const inp     = `w-full border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${D ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500" : "border-gray-300 bg-white"}`;
  const inpMono = `w-full border rounded px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 ${D ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500" : "border-gray-300 bg-white"}`;
  const lbl     = `text-xs font-semibold uppercase tracking-wide mb-1 block ${D ? "text-gray-400" : "text-gray-500"}`;
  const dash    = `font-mono text-sm flex-shrink-0 ${D ? "text-gray-500" : "text-gray-400"}`;
  const subhead = `text-xs mb-2 font-semibold uppercase ${D ? "text-gray-500" : "text-gray-400"}`;

  const NAV_PAGES = [
    { id: "notes",      icon: <ClipboardList className="w-3.5 h-3.5" />, label: "Notes" },
    { id: "mx",         icon: <BookOpen className="w-3.5 h-3.5" />,      label: "MX" },
    { id: "references", icon: <FlaskConical className="w-3.5 h-3.5" />,  label: "References" },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${D ? "bg-gray-900" : "bg-gray-100"}`}>

      {/* ── Top Nav ── */}
      <div className={`sticky top-0 z-50 px-3 py-2.5 flex items-center justify-between shadow-md ${D ? "bg-gray-800 border-b border-gray-700" : "bg-white border-b border-gray-200"}`}>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className={`text-sm font-bold mr-1 ${D ? "text-white" : "text-gray-800"}`}>📋 Notes</h1>
          <div className={`flex rounded-lg p-0.5 ${D ? "bg-gray-700" : "bg-gray-100"}`}>
            {NAV_PAGES.map(p => (
              <button key={p.id} onClick={() => setPage(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${page === p.id ? "bg-blue-600 text-white shadow" : D ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}>
                {p.icon} {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setDark(p => !p)} className={`p-2 rounded-lg ${D ? "text-yellow-400 bg-gray-700" : "text-gray-500 bg-gray-100"}`}>
            {D ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {page === "notes" && <>
            <button onClick={() => { setShowSaved(p => !p); setShowHistory(false); }} className={`p-2 rounded-lg ${showSaved ? "bg-blue-600 text-white" : D ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
              <Save className="w-4 h-4" />
            </button>
            <button onClick={() => { setShowHistory(p => !p); setShowSaved(false); }} className={`p-2 rounded-lg ${showHistory ? "bg-blue-600 text-white" : D ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
              <Clock className="w-4 h-4" />
            </button>
          </>}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 py-4 pb-32">

        {page === "mx"         && <MxPage dark={D} />}
        {page === "references" && <ReferencesPage dark={D} />}

        {page === "notes" && <>
          {showHistory && (
            <div className={`rounded-xl border shadow-sm p-4 mb-4 ${D ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
              <div className="flex justify-between items-center mb-3">
                <h2 className={`font-bold text-sm uppercase tracking-wide ${D ? "text-gray-300" : "text-gray-700"}`}>📜 History (Last 10)</h2>
                <button onClick={() => setShowHistory(false)}><X className="w-4 h-4 text-gray-400" /></button>
              </div>
              {history.length === 0 ? <p className={`text-xs italic ${D ? "text-gray-500" : "text-gray-400"}`}>No notes yet.</p> :
                <div className="space-y-2">
                  {history.map(h => (
                    <div key={h.id} className={`flex items-start justify-between border rounded-lg p-3 gap-2 ${D ? "border-gray-700" : "border-gray-100"}`}>
                      <div className="min-w-0">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full mr-2 ${h.type === "ISBAR" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}>{h.type}</span>
                        <span className={`text-sm font-medium ${D ? "text-gray-300" : "text-gray-700"}`}>{h.label}</span>
                        <p className={`text-xs mt-0.5 ${D ? "text-gray-500" : "text-gray-400"}`}>{h.time}</p>
                      </div>
                      <div className="flex gap-2 items-center flex-shrink-0">
                        <button onClick={() => navigator.clipboard.writeText(h.note)} className="text-xs text-blue-500 hover:underline">Copy</button>
                        <button onClick={() => deleteHistory(h.id)}><X className="w-3.5 h-3.5 text-red-400" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              }
            </div>
          )}

          {showSaved && (
            <div className={`rounded-xl border shadow-sm p-4 mb-4 ${D ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
              <div className="flex justify-between items-center mb-3">
                <h2 className={`font-bold text-sm uppercase tracking-wide ${D ? "text-gray-300" : "text-gray-700"}`}>💾 Saved ({savedPatients.length})</h2>
                <button onClick={() => setShowSaved(false)}><X className="w-4 h-4 text-gray-400" /></button>
              </div>
              {savedPatients.length === 0 ? <p className={`text-xs italic ${D ? "text-gray-500" : "text-gray-400"}`}>No saved patients yet.</p> :
                <div className="space-y-2">
                  {savedPatients.map(p => (
                    <div key={p.id} className={`flex items-center justify-between border rounded-lg p-3 ${D ? "border-gray-700" : "border-gray-100"}`}>
                      <div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full mr-2 ${p.tab === "isbar" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}>{p.tab.toUpperCase()}</span>
                        <span className={`text-sm font-medium ${D ? "text-gray-300" : "text-gray-700"}`}>{p.label}</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <button onClick={() => loadPatient(p)} className="text-xs text-blue-500 font-semibold hover:underline">Load</button>
                        <button onClick={() => deletePatient(p.id)}><X className="w-3.5 h-3.5 text-red-400" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              }
            </div>
          )}

          <div className={`flex rounded-xl p-1 mb-4 ${D ? "bg-gray-800" : "bg-white shadow-sm border border-gray-200"}`}>
            {[["progress", "Progress Note"], ["isbar", "ISBAR Note"]].map(([v, l]) => (
              <button key={v} onClick={() => setTab(v)}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${tab === v ? "bg-blue-600 text-white shadow" : D ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}>
                {l}
              </button>
            ))}
          </div>

          <div className="lg:grid lg:grid-cols-2 lg:gap-6">
            <div className="space-y-3">
              <Section title="Patient Info" icon="🧑‍⚕️" dark={D}>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={lbl}>Name</label><input className={inp} placeholder="BABY OF SARA" value={s.name} onChange={e => setField("name", up(e.target.value))} /></div>
                  <div><label className={lbl}>Age</label><input className={inp} placeholder="3 DAYS" value={s.age} onChange={e => setField("age", up(e.target.value))} /></div>
                  {tab === "isbar" && <>
                    <div><label className={lbl}>MRN #</label><input className={inp} placeholder="123456" value={s.mrn} onChange={e => setField("mrn", up(e.target.value))} /></div>
                    <div><label className={lbl}>Room #</label><input className={inp} placeholder="204" value={s.room} onChange={e => setField("room", up(e.target.value))} /></div>
                  </>}
                </div>
                {tab === "progress" && (
                  <div className="mt-3">
                    <label className={lbl}>Birth Info <span className={`normal-case font-normal ${D ? "text-gray-500" : "text-gray-400"}`}>(optional)</span></label>
                    <input className={inp} placeholder="FT, NSVD, NO NICU ADMISSION" value={s.ftNsvd} onChange={e => setField("ftNsvd", up(e.target.value))} />
                  </div>
                )}
                <div className="mt-3"><label className={lbl}>Diagnosis (Dx)</label><input className={inp} placeholder="NEONATAL JAUNDICE" value={s.dx} onChange={e => setField("dx", up(e.target.value))} /></div>
              </Section>

              <Section title="History (HX)" icon="📝" dark={D}>
                <div className="space-y-2">
                  {s.hxLines.map((line, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className={dash}>-</span>
                      <input className={inpMono} placeholder={`History point ${i + 1}`} value={line}
                        onChange={e => { const u = [...s.hxLines]; u[i] = up(e.target.value); setField("hxLines", u); }} />
                      {s.hxLines.length > 1 && <button onClick={() => setField("hxLines", s.hxLines.filter((_, j) => j !== i))} className="text-red-400 text-xl leading-none flex-shrink-0">×</button>}
                    </div>
                  ))}
                  <button onClick={() => setField("hxLines", [...s.hxLines, ""])} className="text-sm text-blue-500 font-semibold mt-1">+ Add line</button>
                </div>
              </Section>

              <Section title="AT ER LEVEL" icon="🏥" dark={D} defaultOpen={false}>
                <p className={`text-xs italic mb-2 ${D ? "text-gray-500" : "text-gray-400"}`}>Leave empty to omit from note</p>
                <textarea className={`${inpMono} resize-none`} rows={3} placeholder="WHAT WAS DONE AT ER LEVEL..." value={s.erLevel} onChange={e => setField("erLevel", up(e.target.value))} />
              </Section>

              <Section title="O/E Examination" icon="🩺" dark={D}>
                <div className="space-y-3">
                  {[["general", "General"], ["chest", "Chest"], ["abd", "ABD"], ["cvs", "CVS"]].map(([key, label]) => (
                    <div key={key}><label className={lbl}>{label}</label><input className={inpMono} value={s[key]} onChange={e => setField(key, up(e.target.value))} /></div>
                  ))}
                </div>
              </Section>

              <Section title="Labs" icon="🧪" dark={D}>
                <div className="space-y-4">
                  <div><p className={subhead}>CBC</p><div className="flex flex-wrap gap-2">{["wbc","ne","hgb","plt"].map(k => <LabInput key={k} k={k} label={k.toUpperCase()} labs={s.labs} onChange={setLab} dark={D} />)}</div></div>
                  <div><p className={subhead}>CRP & VBG</p><div className="flex flex-wrap gap-2"><LabInput k="crp" label="CRP" labs={s.labs} onChange={setLab} dark={D} /><LabInput k="ph" label="pH 7." labs={s.labs} onChange={setLab} dark={D} /><LabInput k="pco2" label="PCO2" labs={s.labs} onChange={setLab} dark={D} /><LabInput k="hco3" label="HCO3" labs={s.labs} onChange={setLab} dark={D} /></div></div>
                  <div><p className={subhead}>U/E</p><div className="flex flex-wrap gap-2"><LabInput k="na" label="NA" placeholder="140" labs={s.labs} onChange={setLab} dark={D} /><LabInput k="k" label="K" placeholder="3.8" labs={s.labs} onChange={setLab} dark={D} /><LabInput k="glu" label="GLU" labs={s.labs} onChange={setLab} dark={D} /><LabInput k="urea" label="UREA" labs={s.labs} onChange={setLab} dark={D} /><LabInput k="creat" label="CREAT" labs={s.labs} onChange={setLab} dark={D} /></div></div>
                  <div>
                    <p className={subhead}>Additional Labs</p>
                    <div className="space-y-2">
                      {s.extraLabs.map((el, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <input className={inpMono} placeholder="Name" value={el.name} onChange={e => { const u = [...s.extraLabs]; u[i] = { ...u[i], name: up(e.target.value) }; setField("extraLabs", u); }} />
                          <input className={inpMono} placeholder="Value" value={el.value} onChange={e => { const u = [...s.extraLabs]; u[i] = { ...u[i], value: up(e.target.value) }; setField("extraLabs", u); }} />
                          <button onClick={() => setField("extraLabs", s.extraLabs.filter((_, j) => j !== i))} className="text-red-400 text-xl leading-none flex-shrink-0">×</button>
                        </div>
                      ))}
                      <button onClick={() => setField("extraLabs", [...s.extraLabs, { name: "", value: "" }])} className="text-sm text-blue-500 font-semibold">+ Add lab</button>
                    </div>
                  </div>
                </div>
              </Section>

              <Section title="Imaging" icon="🩻" dark={D} defaultOpen={false}>
                <div className="flex items-center justify-between mb-3">
                  <p className={`text-xs italic ${D ? "text-gray-500" : "text-gray-400"}`}>{s.showImaging ? "Add results below" : "Toggle to add imaging"}</p>
                  <button onClick={() => { setField("showImaging", !s.showImaging); setField("imagingLines", []); }}
                    className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${s.showImaging ? "bg-blue-100 text-blue-700" : D ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                    {s.showImaging ? "Has Imaging ✓" : "+ Add Imaging"}
                  </button>
                </div>
                {s.showImaging && (
                  <div className="space-y-2">
                    {s.imagingLines.map((line, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className={dash}>-</span>
                        <input className={inpMono} placeholder="CXR: NORMAL" value={line} onChange={e => { const u = [...s.imagingLines]; u[i] = up(e.target.value); setField("imagingLines", u); }} />
                        {s.imagingLines.length > 1 && <button onClick={() => setField("imagingLines", s.imagingLines.filter((_, j) => j !== i))} className="text-red-400 text-xl leading-none flex-shrink-0">×</button>}
                      </div>
                    ))}
                    <button onClick={() => setField("imagingLines", [...s.imagingLines, ""])} className="text-sm text-blue-500 font-semibold">+ Add imaging</button>
                  </div>
                )}
              </Section>

              <Section title="Currently On" icon="💉" dark={D} defaultOpen={false}>
                <div className="space-y-2">
                  {s.currentMeds.map((med, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className={dash}>-</span>
                      <input className={inpMono} placeholder="IV AMPICILLIN 200MG Q12H" value={med} onChange={e => { const u = [...s.currentMeds]; u[i] = up(e.target.value); setField("currentMeds", u); }} />
                      <button onClick={() => setField("currentMeds", s.currentMeds.filter((_, j) => j !== i))} className="text-red-400 text-xl leading-none flex-shrink-0">×</button>
                    </div>
                  ))}
                  <button onClick={() => setField("currentMeds", [...s.currentMeds, ""])} className="text-sm text-blue-500 font-semibold">+ Add medication / IVF</button>
                </div>
                {s.currentMeds.length === 0 && <p className={`text-xs italic mt-2 ${D ? "text-gray-500" : "text-gray-400"}`}>Leave empty to omit from note</p>}
              </Section>

              <Section title={tab === "isbar" ? "Recommendation / Plan" : "Plan"} icon="💊" dark={D}>
                <p className={`text-xs italic mb-2 ${D ? "text-gray-500" : "text-gray-400"}`}>Leave empty to default to "SEE ORDER SHEET"</p>
                <textarea className={`${inpMono} resize-none`} rows={4} placeholder="SEE ORDER SHEET" value={s.plan} onChange={e => setField("plan", up(e.target.value))} />
              </Section>
            </div>

            {/* Desktop Preview */}
            <div className="hidden lg:flex flex-col sticky top-16 h-fit">
              <div className={`rounded-xl border shadow-sm flex flex-col ${D ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                <div className={`flex items-center justify-between px-4 py-3 border-b flex-wrap gap-2 ${D ? "border-gray-700" : "border-gray-100"}`}>
                  <h2 className={`font-bold text-sm uppercase tracking-wide ${D ? "text-gray-300" : "text-gray-700"}`}>Generated Note</h2>
                  <div className="flex gap-2 flex-wrap">
                    {showSaveInput ? (
                      <div className="flex gap-1">
                        <input className={`border rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 ${D ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
                          placeholder="Label (e.g. Baby Sara)" value={saveLabel} onChange={e => setSaveLabel(e.target.value)} onKeyDown={e => e.key === "Enter" && savePatient()} autoFocus />
                        <button onClick={savePatient} className="bg-green-500 text-white text-xs px-2 py-1 rounded">Save</button>
                        <button onClick={() => setShowSaveInput(false)}><X className="w-4 h-4 text-gray-400" /></button>
                      </div>
                    ) : (
                      <button onClick={() => setShowSaveInput(true)} className="flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1.5 rounded-lg hover:bg-green-100">
                        <Save className="w-3.5 h-3.5" /> Save
                      </button>
                    )}
                    <button onClick={reset} className="flex items-center gap-1 bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-1.5 rounded-lg hover:bg-red-100">
                      <RotateCcw className="w-3.5 h-3.5" /> Reset
                    </button>
                    <button onClick={copy} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-lg transition-all">
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
                <pre className={`p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-auto rounded-b-xl max-h-[75vh] ${D ? "bg-gray-900 text-green-400" : "bg-gray-50 text-gray-800"}`}>{output}</pre>
              </div>
            </div>
          </div>
        </>}
      </div>

      {/* Mobile Bottom Bar */}
      {page === "notes" && (
        <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 py-3 border-t shadow-lg ${D ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          {showNote && (
            <div className={`absolute bottom-full left-0 right-0 border-t shadow-xl rounded-t-2xl overflow-hidden ${D ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
              <div className={`flex items-center justify-between px-4 py-3 border-b ${D ? "border-gray-700" : "border-gray-200"}`}>
                <span className={`font-bold text-sm uppercase ${D ? "text-gray-300" : "text-gray-700"}`}>Generated Note</span>
                <button onClick={() => setShowNote(false)}><X className="w-4 h-4 text-gray-400" /></button>
              </div>
              <pre className={`p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-auto max-h-72 ${D ? "bg-gray-900 text-green-400" : "bg-gray-50 text-gray-800"}`}>{output}</pre>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={() => setShowNote(p => !p)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all ${showNote ? "bg-blue-600 text-white border-blue-600" : D ? "bg-gray-700 text-gray-300 border-gray-600" : "bg-gray-100 text-gray-700 border-gray-200"}`}>
              {showNote ? "Hide Note" : "Preview"}
            </button>
            {showSaveInput ? (
              <div className="flex gap-1 flex-1">
                <input className={`flex-1 border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 ${D ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
                  placeholder="Label..." value={saveLabel} onChange={e => setSaveLabel(e.target.value)} onKeyDown={e => e.key === "Enter" && savePatient()} autoFocus />
                <button onClick={savePatient} className="bg-green-500 text-white text-xs px-3 py-2 rounded-xl font-semibold">Save</button>
                <button onClick={() => setShowSaveInput(false)} className="text-gray-400 px-1"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <button onClick={() => setShowSaveInput(true)} className={`p-3 rounded-xl border ${D ? "bg-gray-700 text-gray-300 border-gray-600" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                <Save className="w-5 h-5" />
              </button>
            )}
            <button onClick={reset} className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-500"><RotateCcw className="w-5 h-5" /></button>
            <button onClick={copy} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm transition-all">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
