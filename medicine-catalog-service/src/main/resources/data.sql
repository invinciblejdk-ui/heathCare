-- ============================================================
-- SEED DATA for medicine_catalog_service schema
-- Database: heathcare (PostgreSQL)
-- Schema: medicine_catalog_service
-- ============================================================

-- ── STEP 1: Categories ────────────────────────────────────────
INSERT INTO medicine_catalog_service.categories (name, description, icon_url, is_active) VALUES
('Analgesics & Pain Relief',  'Medicines that relieve pain without causing loss of consciousness', NULL, true),
('Antibiotics',               'Medicines used to treat bacterial infections',                      NULL, true),
('Antacids & Digestive',      'Medicines for acidity, heartburn, and digestive disorders',         NULL, true),
('Vitamins & Supplements',    'Nutritional supplements and vitamins for daily health',             NULL, true),
('Antihistamines & Allergy',  'Medicines for allergies, hay fever, and urticaria',                NULL, true),
('Antidiabetics',             'Medicines for blood sugar management in diabetes',                  NULL, true),
('Cardiovascular',            'Medicines for heart and blood pressure management',                 NULL, true),
('Cough & Cold',              'Medicines for cough, cold, and flu symptoms',                      NULL, true),
('Dermatology',               'Medicines and creams for skin conditions',                          NULL, true),
('Antifungals',               'Medicines to treat fungal infections',                              NULL, true)
ON CONFLICT (name) DO NOTHING;


-- ── STEP 2: Medicines ─────────────────────────────────────────
INSERT INTO medicine_catalog_service.medicines
    (name, brand, salt_name, chemical_name, category_id, price, stock_quantity,
     image_url, description, dosage_form, strength, requires_prescription, is_active,
     created_at, updated_at)
VALUES

-- ─── Analgesics & Pain Relief ───────────────
('Crocin Advance',   'GSK',        'Paracetamol',              'N-(4-hydroxyphenyl)acetamide',                          (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Analgesics & Pain Relief'),  35.00,  500, NULL, 'Fast-acting paracetamol for fever and pain',               'Tablet',  '500 mg',    false, true, NOW(), NOW()),
('Dolo 650',         'Micro Labs',  'Paracetamol',              'N-(4-hydroxyphenyl)acetamide',                          (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Analgesics & Pain Relief'),  30.00,  800, NULL, 'Paracetamol for mild to moderate pain and fever',          'Tablet',  '650 mg',    false, true, NOW(), NOW()),
('Combiflam',        'Sanofi',      'Ibuprofen + Paracetamol',  'Ibuprofen & Acetaminophen combination',                 (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Analgesics & Pain Relief'),  45.00,  600, NULL, 'Combination analgesic and antipyretic',                    'Tablet',  '400/325 mg',false, true, NOW(), NOW()),
('Brufen',           'Abbott',      'Ibuprofen',                '(RS)-2-(4-(2-methylpropyl)phenyl)propanoic acid',       (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Analgesics & Pain Relief'),  55.00,  400, NULL, 'NSAID for pain, inflammation, and fever',                  'Tablet',  '400 mg',    false, true, NOW(), NOW()),
('Voveran SR',       'Novartis',    'Diclofenac Sodium',        '2-(2,6-dichlorophenylamino)phenylacetic acid sodium salt',(SELECT id FROM medicine_catalog_service.categories WHERE name = 'Analgesics & Pain Relief'), 65.00,  300, NULL, 'Sustained-release NSAID for arthritis and pain',           'Tablet',  '100 mg',    true,  true, NOW(), NOW()),
('Tramacip',         'Cipla',       'Tramadol HCl',             'trans-2-[(dimethylamino)methyl]-1-(3-methoxyphenyl)cyclohexanol HCl', (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Analgesics & Pain Relief'), 120.00, 150, NULL, 'Analgesic for moderate to severe pain',            'Tablet',  '50 mg',     true,  true, NOW(), NOW()),

-- ─── Antibiotics ────────────────────────────
('Augmentin 625',    'GSK',         'Amoxicillin + Clavulanic Acid','Amoxicillin trihydrate & Potassium clavulanate',    (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Antibiotics'), 195.00,  250, NULL, 'Broad-spectrum antibiotic for bacterial infections',        'Tablet',  '625 mg',    true,  true, NOW(), NOW()),
('Azithral 500',     'Alembic',     'Azithromycin',             'Azithromycin dihydrate (macrolide antibiotic)',          (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Antibiotics'), 145.00,  350, NULL, 'Macrolide antibiotic for respiratory and skin infections',  'Tablet',  '500 mg',    true,  true, NOW(), NOW()),
('Mox 500',          'Cipla',       'Amoxicillin',              '(2S,5R,6R)-6-amino-3,3-dimethyl-7-oxo-4-thia-1-azabicyclo[3.2.0]heptane-2-carboxylic acid', (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Antibiotics'), 85.00, 400, NULL, 'Penicillin-type antibiotic for bacterial infections', 'Capsule', '500 mg',    true,  true, NOW(), NOW()),
('Ciplox 500',       'Cipla',       'Ciprofloxacin',            '1-cyclopropyl-6-fluoro-4-oxo-7-(piperazin-1-yl)quinoline-3-carboxylic acid', (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Antibiotics'), 110.00, 300, NULL, 'Fluoroquinolone antibiotic for UTI and infections',  'Tablet',  '500 mg',    true,  true, NOW(), NOW()),
('Doxycap',          'Cipla',       'Doxycycline',              '(4S,4aR,5S,5aR,6R,12aS)-4-(dimethylamino)-3,5,10,12-tetrahydroxy-6-methyl-1,11-dioxo-tetracene-2-carboxamide', (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Antibiotics'), 75.00, 200, NULL, 'Tetracycline antibiotic for various infections', 'Capsule', '100 mg',    true,  true, NOW(), NOW()),
('Metrogyl 400',     'J.B. Chemicals','Metronidazole',          '2-(2-methyl-5-nitro-1H-imidazol-1-yl)ethanol',          (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Antibiotics'),  40.00,  500, NULL, 'Antibacterial for anaerobic and protozoal infections',      'Tablet',  '400 mg',    true,  true, NOW(), NOW()),

-- ─── Antacids & Digestive ───────────────────
('Digene Gel',       'Abbott',      'Magnesium + Aluminum Hydroxide','Magnesium hydroxide & Aluminium hydroxide mixture', (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Antacids & Digestive'),  95.00,  600, NULL, 'Antacid gel for hyperacidity and heartburn',               'Gel',     '200 ml',    false, true, NOW(), NOW()),
('Pantop 40',        'Aristo',      'Pantoprazole Sodium',      'Sodium 5-(difluoromethoxy)-2-[(3,4-dimethoxypyridin-2-yl)methylsulfinyl]benzimidazole', (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Antacids & Digestive'), 85.00, 700, NULL, 'Proton pump inhibitor for GERD and peptic ulcer', 'Tablet',  '40 mg',     true,  true, NOW(), NOW()),
('Omez 20',          'Dr Reddys',   'Omeprazole',               '5-methoxy-2-[(4-methoxy-3,5-dimethylpyridin-2-yl)methylsulfinyl]benzimidazole', (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Antacids & Digestive'), 60.00, 750, NULL, 'Proton pump inhibitor for acid-related disorders',  'Capsule', '20 mg',     false, true, NOW(), NOW()),
('Aristozyme Syrup', 'Aristo',      'Diastase + Pepsin',        'Diastase and Pepsin enzyme combination',                 (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Antacids & Digestive'), 110.00,  300, NULL, 'Digestive enzyme supplement for indigestion',              'Syrup',   '200 ml',    false, true, NOW(), NOW()),
('Cremaffin Plus',   'Abbott',      'Liquid Paraffin + Sodium Picosulphate','Liquid paraffin & Sodium picosulphate',   (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Antacids & Digestive'), 130.00,  400, NULL, 'Laxative for constipation relief',                         'Syrup',   '225 ml',    false, true, NOW(), NOW()),

-- ─── Vitamins & Supplements ─────────────────
('Benadon 40',       'Pfizer',      'Pyridoxine (Vitamin B6)',   '5-hydroxy-6-methylpyridine-3,4-dimethanol',             (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Vitamins & Supplements'),  28.00, 1000, NULL, 'Vitamin B6 supplement for deficiency and nausea',          'Tablet',  '40 mg',     false, true, NOW(), NOW()),
('Becosules Z',      'Pfizer',      'Multivitamin + Zinc',       'B-complex vitamins with zinc',                          (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Vitamins & Supplements'), 115.00,  800, NULL, 'Comprehensive B-complex with zinc for immunity',            'Capsule', 'Standard',  false, true, NOW(), NOW()),
('Shelcal 500',      'Torrent',     'Calcium Carbonate + Vit D3','Calcium carbonate with cholecalciferol',                (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Vitamins & Supplements'),  95.00,  900, NULL, 'Calcium and Vitamin D3 for bone health',                   'Tablet',  '500 mg',    false, true, NOW(), NOW()),
('Zincovit',         'Apex',        'Multivitamin + Zinc',       'Zinc sulphate monohydrate with vitamins',               (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Vitamins & Supplements'), 135.00,  600, NULL, 'Multivitamin and zinc tablet for immunity',                'Tablet',  'Standard',  false, true, NOW(), NOW()),
('Revital H',        'Sun Pharma',  'Multivitamin + Ginseng',    'Multivitamin multimineral with Ginseng extract',        (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Vitamins & Supplements'), 210.00,  500, NULL, 'Daily energy and wellness supplement',                     'Capsule', 'Standard',  false, true, NOW(), NOW()),
('Neurobion Forte',  'P&G',         'Vitamin B1+B6+B12',         'Thiamine + Pyridoxine + Cyanocobalamin combination',    (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Vitamins & Supplements'),  45.00, 1200, NULL, 'Nerve health vitamin B complex supplement',                'Tablet',  'Standard',  false, true, NOW(), NOW()),

-- ─── Antihistamines & Allergy ───────────────
('Cetirizine 10',    'Cipla',       'Cetirizine HCl',            '2-[4-[(4-chlorophenyl)-phenylmethyl]piperazin-1-yl]ethoxyacetic acid dihydrochloride', (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Antihistamines & Allergy'), 25.00, 800, NULL, 'Antihistamine for allergic rhinitis and urticaria', 'Tablet',  '10 mg',     false, true, NOW(), NOW()),
('Allegra 120',      'Sanofi',      'Fexofenadine HCl',          '4-[1-hydroxy-4-[4-(hydroxydiphenylmethyl)piperidin-1-yl]butyl]benzeneacetic acid HCl', (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Antihistamines & Allergy'), 95.00, 600, NULL, 'Non-sedating antihistamine for seasonal allergies', 'Tablet',  '120 mg',    false, true, NOW(), NOW()),
('Avil 25',          'Sanofi',      'Pheniramine Maleate',        'N,N-dimethyl-3-phenyl-3-(pyridin-2-yl)propan-1-amine maleate', (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Antihistamines & Allergy'), 15.00, 700, NULL, 'Classic antihistamine for allergies and itching',   'Tablet',  '25 mg',     false, true, NOW(), NOW()),
('Montek LC',        'Sun Pharma',  'Montelukast + Levocetirizine','Montelukast sodium + Levocetirizine dihydrochloride', (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Antihistamines & Allergy'), 110.00,  400, NULL, 'Combination for allergic rhinitis and asthma',             'Tablet',  '10/5 mg',   true,  true, NOW(), NOW()),

-- ─── Antidiabetics ──────────────────────────
('Glycomet 500',     'USV',         'Metformin HCl',             'N,N-dimethylimidodicarbonimidic diamide hydrochloride', (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Antidiabetics'),  38.00,  600, NULL, 'First-line antidiabetic for Type 2 diabetes',              'Tablet',  '500 mg',    true,  true, NOW(), NOW()),
('Januvia 100',      'MSD',         'Sitagliptin',               '7-[(3R)-3-amino-1-oxo-4-(2,4,5-trifluorophenyl)butyl]-5,6,7,8-tetrahydro-3-(trifluoromethyl)-1,2,4-triazolo[4,3-a]pyrazine', (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Antidiabetics'), 580.00, 200, NULL, 'DPP-4 inhibitor for Type 2 diabetes management', 'Tablet',  '100 mg',    true,  true, NOW(), NOW()),
('Glimisave M1',     'Eris',        'Glimepiride + Metformin',   'Glimepiride & Metformin HCl combination',               (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Antidiabetics'),  75.00,  400, NULL, 'Combination antidiabetic for Type 2 diabetes',             'Tablet',  '1/500 mg',  true,  true, NOW(), NOW()),
('Galvus Met',       'Novartis',    'Vildagliptin + Metformin',  'Vildagliptin & Metformin HCl combination',              (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Antidiabetics'), 225.00,  250, NULL, 'DPP-4 inhibitor + biguanide combination for T2DM',        'Tablet',  '50/500 mg', true,  true, NOW(), NOW()),

-- ─── Cardiovascular ─────────────────────────
('Telma 40',         'Glenmark',    'Telmisartan',               '4-[4-methyl-6-(1-methylbenzimidazol-2-yl)-2-propylbenzimidazol-1-ylmethyl]biphenyl-2-carboxylic acid', (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Cardiovascular'), 115.00, 400, NULL, 'ARB for hypertension and cardiovascular risk reduction', 'Tablet', '40 mg',  true,  true, NOW(), NOW()),
('Stamlo 5',         'Dr Reddys',   'Amlodipine Besylate',       '3-ethyl 5-methyl 2-(2-aminoethoxymethyl)-4-(2-chlorophenyl)-6-methyl-1,4-dihydropyridine-3,5-dicarboxylate besylate', (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Cardiovascular'), 55.00, 500, NULL, 'Calcium channel blocker for hypertension', 'Tablet', '5 mg',     true,  true, NOW(), NOW()),
('Ecosprin 75',      'USV',         'Aspirin',                   'Acetylsalicylic acid',                                  (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Cardiovascular'),  20.00, 1000, NULL, 'Low-dose aspirin for antiplatelet therapy',                'Tablet',  '75 mg',     true,  true, NOW(), NOW()),
('Atorva 10',        'Zydus',       'Atorvastatin Calcium',      '[R-(R*,R*)]-2-(4-fluorophenyl)-beta,delta-dihydroxy-5-(1-methylethyl)-3-phenyl-4-[(phenylamino)carbonyl]-1H-pyrrole-1-heptanoic acid calcium', (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Cardiovascular'), 65.00, 600, NULL, 'Statin for lowering LDL cholesterol', 'Tablet', '10 mg', true, true, NOW(), NOW()),
('Metoprolol 50',    'Sun Pharma',  'Metoprolol Tartrate',       '(RS)-1-(isopropylamino)-3-[4-(2-methoxyethyl)phenoxy]propan-2-ol tartrate', (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Cardiovascular'), 48.00, 450, NULL, 'Beta-blocker for hypertension and angina',          'Tablet',  '50 mg',     true,  true, NOW(), NOW()),

-- ─── Cough & Cold ───────────────────────────
('Ascoril LS Syrup', 'Glenmark',    'Levosalbutamol + Ambroxol + Guaifenesin','Levosalbutamol, Ambroxol HCl & Guaifenesin combination', (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Cough & Cold'), 115.00, 350, NULL, 'Mucolytic and bronchodilator for productive cough', 'Syrup',   '100 ml',    false, true, NOW(), NOW()),
('Benadryl Cough',   'J&J',         'Diphenhydramine + Ammonium Chloride','Diphenhydramine HCl & Ammonium chloride combination',   (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Cough & Cold'),  95.00,  400, NULL, 'Cough suppressant and expectorant',                        'Syrup',   '100 ml',    false, true, NOW(), NOW()),
('Grilinctus BM',    'Franco-Indian','Bromhexine + Guaifenesin',  'Bromhexine HCl & Guaifenesin combination',              (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Cough & Cold'),  80.00,  300, NULL, 'Mucolytic for chesty cough and congestion',                'Syrup',   '100 ml',    false, true, NOW(), NOW()),
('Sinarest',         'Centaur',     'Cetirizine + Paracetamol + Phenylephrine','Cetirizine HCl, Paracetamol & Phenylephrine HCl', (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Cough & Cold'), 55.00, 600, NULL, 'Combination for cold, fever, and congestion',              'Tablet',  'Standard',  false, true, NOW(), NOW()),
('D-Cold Total',     'Reckitt',     'Cetirizine + Paracetamol + Phenylephrine + Caffeine','Multi-ingredient cold relief combination', (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Cough & Cold'), 48.00, 700, NULL, 'Comprehensive cold and flu relief tablet',             'Tablet',  'Standard',  false, true, NOW(), NOW()),

-- ─── Dermatology ────────────────────────────
('Betnovate-N',      'GSK',         'Betamethasone + Neomycin',  'Betamethasone valerate & Neomycin sulphate combination', (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Dermatology'),  75.00,  400, NULL, 'Topical corticosteroid for inflammatory skin conditions',  'Cream',   '20 g',      true,  true, NOW(), NOW()),
('Soframycin Cream', 'Sanofi',      'Framycetin Sulphate',       'Framycetin sulphate (aminoglycoside antibiotic)',        (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Dermatology'),  55.00,  500, NULL, 'Topical antibiotic for skin infections and wounds',        'Cream',   '30 g',      false, true, NOW(), NOW()),
('Fourderm Cream',   'Ranbaxy',     'Beclomethasone + Clotrimazole + Gentamicin + Tolnaftate','Combination antifungal-antibiotic-steroid cream', (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Dermatology'), 110.00, 300, NULL, 'Combination cream for mixed skin infections',        'Cream',   '15 g',      true,  true, NOW(), NOW()),
('Momate Cream',     'Glenmark',    'Mometasone Furoate',        'Mometasone furoate (topical glucocorticosteroid)',       (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Dermatology'),  95.00,  350, NULL, 'Topical corticosteroid for eczema and psoriasis',          'Cream',   '15 g',      true,  true, NOW(), NOW()),

-- ─── Antifungals ───────────────────────────
('Flucos 150',       'Cipla',       'Fluconazole',               '2-(2,4-difluorophenyl)-1,3-bis(1H-1,2,4-triazol-1-yl)propan-2-ol', (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Antifungals'), 75.00, 500, NULL, 'Systemic antifungal for candidiasis',                    'Capsule', '150 mg',    true,  true, NOW(), NOW()),
('Canesten Cream',   'Bayer',       'Clotrimazole',              '1-[(2-chlorophenyl)diphenylmethyl]-1H-imidazole',       (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Antifungals'),  85.00,  600, NULL, 'Topical antifungal for ringworm and athlete''s foot',     'Cream',   '20 g',      false, true, NOW(), NOW()),
('Lamisil AT Cream', 'Novartis',    'Terbinafine HCl',           '(E)-N-(6,6-dimethylhept-2-en-4-yn-1-yl)-N-methyl-1-naphthylmethylamine HCl', (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Antifungals'), 145.00, 400, NULL, 'Allylamine antifungal for tinea infections',  'Cream',   '15 g',      false, true, NOW(), NOW()),
('Itraconazole 100', 'Cipla',       'Itraconazole',              '(+/-)-cis-4-[4-[4-[4-[[(2R*,4S*)-2-(2,4-dichlorophenyl)-2-(1H-1,2,4-triazol-1-ylmethyl)-1,3-dioxolan-4-yl]methoxy]phenyl]piperazin-1-yl]phenyl]-2-propyl-2H-1,2,4-triazol-3(4H)-one', (SELECT id FROM medicine_catalog_service.categories WHERE name = 'Antifungals'), 95.00, 350, NULL, 'Broad-spectrum antifungal for systemic infections', 'Capsule', '100 mg', true, true, NOW(), NOW());

-- ============================================================
-- End of seed data
-- ============================================================
