/*
 * HEp-2 IFA pattern knowledge base.
 *
 * Based on the International Consensus on ANA Patterns (ICAP, www.anapatterns.org)
 * classification tree, AC-0 … AC-29. Antigen / disease associations are the
 * commonly cited ones and are informative only — they are not diagnostic.
 */

// ---------------------------------------------------------------------------
// Final patterns
// ---------------------------------------------------------------------------
const PATTERNS = {
  "AC-0": {
    name: "Negative",
    group: "Negative",
    description:
      "No specific nuclear, cytoplasmic or mitotic staining above the background at the screening dilution.",
    antigens: [],
    associations: ["Does not exclude antibodies that are poorly detected on HEp-2 (e.g. some anti-SSA/Ro60, anti-Jo-1, anti-ribosomal P)."],
  },

  // ----- Nuclear -----
  "AC-1": {
    name: "Nuclear homogeneous",
    group: "Nuclear",
    description:
      "Uniform, diffuse staining of the entire nucleoplasm; nucleoli may be stained or not. Metaphase chromatin plate is intensely and homogeneously stained.",
    antigens: ["dsDNA", "Nucleosomes", "Histones"],
    associations: ["SLE", "Drug-induced lupus", "Juvenile idiopathic arthritis"],
  },
  "AC-2": {
    name: "Nuclear dense fine speckled",
    group: "Nuclear",
    description:
      "Fine, dense speckles of uneven size and brightness distributed throughout the interphase nucleus, sparing nucleoli. Metaphase chromatin plate is strongly stained with a speckled/coarse texture.",
    antigens: ["DFS70 / LEDGF-p75"],
    associations: [
      "Frequently found in apparently healthy individuals",
      "Isolated anti-DFS70 argues against a systemic autoimmune rheumatic disease — confirm with a DFS70-specific test",
    ],
  },
  "AC-3": {
    name: "Centromere",
    group: "Nuclear",
    description:
      "40–80 discrete, evenly sized coarse speckles in interphase nuclei. In mitotic cells the speckles line up on the metaphase plate (condensed chromatin).",
    antigens: ["CENP-A", "CENP-B", "CENP-C"],
    associations: ["Limited cutaneous systemic sclerosis (CREST)", "Primary biliary cholangitis"],
  },
  "AC-4": {
    name: "Nuclear fine speckled",
    group: "Nuclear",
    description:
      "Fine, small speckles across the nucleoplasm, nucleoli may be stained or not. Metaphase chromatin plate is NOT stained.",
    antigens: ["SS-A/Ro60", "SS-B/La", "Mi-2", "TIF1γ", "TIF1β", "Ku"],
    associations: ["Sjögren syndrome", "SLE", "Dermatomyositis", "SSc/PM overlap", "Neonatal / subacute cutaneous lupus"],
  },
  "AC-5": {
    name: "Nuclear large / coarse speckled",
    group: "Nuclear",
    description:
      "Dense, large/coarse speckles across the nucleoplasm, nucleoli typically spared. Metaphase chromatin plate is NOT stained.",
    antigens: ["hnRNP", "U1-snRNP", "Sm", "RNA polymerase III"],
    associations: ["Mixed connective tissue disease", "SLE", "Systemic sclerosis"],
  },
  "AC-6": {
    name: "Multiple nuclear dots",
    group: "Nuclear",
    description: "Countable discrete dots in the nucleus — typically 6–20 per nucleus (PML / Sp100 bodies).",
    antigens: ["Sp100", "PML proteins", "MJ / NXP-2"],
    associations: ["Primary biliary cholangitis", "Systemic autoimmune rheumatic diseases", "Dermatomyositis"],
  },
  "AC-7": {
    name: "Few nuclear dots",
    group: "Nuclear",
    description: "1–6 discrete dots per nucleus (Cajal bodies); dots may appear only in a portion of cells.",
    antigens: ["p80-coilin", "SMN"],
    associations: ["Sjögren syndrome", "SLE", "Systemic sclerosis", "Polymyositis", "Asymptomatic individuals"],
  },
  "AC-8": {
    name: "Nucleolar homogeneous",
    group: "Nuclear",
    description: "Diffuse, homogeneous staining of the whole nucleolus; the rest of the nucleus is weak or unstained.",
    antigens: ["PM/Scl-75", "PM/Scl-100", "Th/To", "B23 / nucleophosmin", "Nucleolin", "No55/SC65"],
    associations: ["Systemic sclerosis", "SSc/PM overlap"],
  },
  "AC-9": {
    name: "Nucleolar clumpy",
    group: "Nuclear",
    description:
      "Clumpy, irregular nucleolar staining, often with Cajal-body-like dots in the nucleoplasm. In mitotic cells the staining rims the condensed chromosomes.",
    antigens: ["U3-snoRNP / fibrillarin"],
    associations: ["Systemic sclerosis"],
  },
  "AC-10": {
    name: "Nucleolar punctate",
    group: "Nuclear",
    description:
      "Dense, fine dots in the nucleoli. In metaphase, 5–10 bright pairs of dots (nucleolar organizer regions, NORs) are seen on the chromosomes.",
    antigens: ["RNA polymerase I", "hUBF / NOR-90"],
    associations: ["Systemic sclerosis", "Sjögren syndrome"],
  },
  "AC-11": {
    name: "Nuclear envelope smooth",
    group: "Nuclear",
    description:
      "Homogeneous, linear staining of the nuclear rim, stronger at contact points of adjacent cells. Mitotic cells are negative (envelope disassembled).",
    antigens: ["Lamins A, B, C", "Lamin-associated proteins (LAP2)"],
    associations: ["SLE", "Sjögren syndrome", "Seronegative arthritis", "Autoimmune liver disease"],
  },
  "AC-12": {
    name: "Nuclear envelope punctate",
    group: "Nuclear",
    description: "Punctate (dotted) staining of the nuclear envelope — nuclear pore complexes. Mitotic cells are negative.",
    antigens: ["gp210", "p62 nucleoporin", "Nuclear pore complex proteins"],
    associations: ["Primary biliary cholangitis"],
  },
  "AC-13": {
    name: "PCNA-like",
    group: "Nuclear",
    description:
      "Pleomorphic speckled staining that varies with the cell cycle: strongest, coarse speckles in S-phase nuclei, weak or absent in G1 nuclei. Mitotic cells negative.",
    antigens: ["PCNA"],
    associations: ["SLE", "Other conditions"],
  },
  "AC-14": {
    name: "CENP-F-like",
    group: "Nuclear",
    description:
      "Pleomorphic: G1 nuclei negative, nucleoplasmic speckles increase through S/G2. In prometaphase/metaphase the kinetochores stain, and in anaphase/telophase the midbody is stained.",
    antigens: ["CENP-F"],
    associations: ["Malignancy", "Other conditions"],
  },
  "AC-29": {
    name: "Topo I-like",
    group: "Nuclear",
    description:
      "Fine granular nuclear staining with stained nucleoli, positive metaphase chromatin plate (strong at NORs) and fine reticular cytoplasmic staining in interphase cells.",
    antigens: ["DNA topoisomerase I (Scl-70)"],
    associations: ["Systemic sclerosis (diffuse cutaneous)"],
  },

  // ----- Cytoplasmic -----
  "AC-15": {
    name: "Cytoplasmic fibrillar linear",
    group: "Cytoplasmic",
    description: "Decorated cable-like fibres running the length of the cell (stress fibres, actin).",
    antigens: ["Actin", "Non-muscle myosin"],
    associations: ["Mixed connective tissue disease", "Autoimmune hepatitis (type 1)", "Liver cirrhosis", "Crohn's disease"],
  },
  "AC-16": {
    name: "Cytoplasmic fibrillar filamentous",
    group: "Cytoplasmic",
    description: "Filamentous network radiating from the nucleus outward to the cell periphery (intermediate filaments / microtubules).",
    antigens: ["Vimentin", "Cytokeratins", "Tubulin"],
    associations: ["Infectious or inflammatory conditions", "Clinical association uncertain"],
  },
  "AC-17": {
    name: "Cytoplasmic fibrillar segmental",
    group: "Cytoplasmic",
    description: "Short, interrupted segments or dots aligned along stress fibres.",
    antigens: ["α-actinin", "Vinculin", "Tropomyosin"],
    associations: ["Myasthenia gravis", "Crohn's disease", "Ulcerative colitis"],
  },
  "AC-18": {
    name: "Cytoplasmic discrete dots (GW body-like)",
    group: "Cytoplasmic",
    description: "Few to many discrete, variably sized dots scattered in the cytoplasm.",
    antigens: ["GW182", "Su / Ago2", "Ge-1"],
    associations: ["Primary biliary cholangitis", "Systemic autoimmune rheumatic diseases", "Neurological diseases"],
  },
  "AC-19": {
    name: "Cytoplasmic dense fine speckled",
    group: "Cytoplasmic",
    description: "Homogeneous-looking, dense fine speckled staining of the whole cytoplasm.",
    antigens: ["PL-7", "PL-12", "Ribosomal P proteins"],
    associations: ["Antisynthetase syndrome", "SLE (anti-ribosomal P)", "Juvenile SLE"],
  },
  "AC-20": {
    name: "Cytoplasmic fine speckled",
    group: "Cytoplasmic",
    description: "Fine, scattered speckles throughout the cytoplasm.",
    antigens: ["Jo-1 / histidyl-tRNA synthetase"],
    associations: ["Antisynthetase syndrome", "Polymyositis / dermatomyositis", "Interstitial lung disease"],
  },
  "AC-21": {
    name: "Cytoplasmic reticular / AMA",
    group: "Cytoplasmic",
    description: "Coarse, granular, filamentous staining extending throughout the cytoplasm (mitochondria).",
    antigens: ["PDC-E2 / M2", "BCOADC-E2", "OGDC-E2", "E1α subunit of PDC", "E3BP / protein X"],
    associations: ["Primary biliary cholangitis", "Systemic sclerosis"],
  },
  "AC-22": {
    name: "Cytoplasmic polar / Golgi-like",
    group: "Cytoplasmic",
    description: "Irregular, speckled or ribbon-like staining of the perinuclear Golgi apparatus, at one pole of the nucleus.",
    antigens: ["Giantin / macrogolgin", "Golgin-95 / GM130", "Golgin-160", "Golgin-97", "Golgin-245"],
    associations: ["Rare in Sjögren syndrome, SLE, RA, MCTD, GPA", "Idiopathic cerebellar ataxia", "Paraneoplastic cerebellar degeneration"],
  },
  "AC-23": {
    name: "Rods and rings",
    group: "Cytoplasmic",
    description: "Distinct rod-shaped (3–10 µm) and ring-shaped (2–5 µm) structures in the cytoplasm of most cells.",
    antigens: ["IMPDH2", "CTPS1"],
    associations: ["HCV patients treated with IFN-α/ribavirin", "SLE", "Hashimoto's thyroiditis", "Healthy controls (rare)"],
  },

  // ----- Mitotic -----
  "AC-24": {
    name: "Centrosome",
    group: "Mitotic",
    description: "One or two discrete dots in the cytoplasm of interphase cells; in mitotic cells one bright dot at each spindle pole.",
    antigens: ["Pericentrin", "Ninein", "Cep250", "Cep110", "Enolase"],
    associations: ["Rare in SSc and Raynaud phenomenon", "Viral and mycoplasma infections"],
  },
  "AC-25": {
    name: "Spindle fibres",
    group: "Mitotic",
    description: "Staining of the mitotic spindle fibres (without strong pole accentuation); interphase cells negative.",
    antigens: ["HsEg5"],
    associations: ["Rare in Sjögren syndrome and SLE"],
  },
  "AC-26": {
    name: "NuMA-like",
    group: "Mitotic",
    description:
      "Interphase: fine speckled nuclear staining. Mitosis: staining of the spindle poles that fans out into the spindle fibres (cone/triangle shape at the poles).",
    antigens: ["Centrophilin (NuMA)"],
    associations: ["Sjögren syndrome", "SLE", "Other conditions"],
  },
  "AC-27": {
    name: "Intercellular bridge",
    group: "Mitotic",
    description: "Staining of the midbody / intercellular bridge between two daughter cells in late telophase / cytokinesis.",
    antigens: ["Aurora kinase B", "CENP-E", "MSA-2", "KIF-14", "MKLP-1"],
    associations: ["Rare in SSc and Raynaud phenomenon", "Malignancy"],
  },
  "AC-28": {
    name: "Mitotic chromosomal coat",
    group: "Mitotic",
    description: "Staining that coats the condensed mitotic chromosomes (perichromosomal), while interphase nuclei are negative or very weak.",
    antigens: ["Modified histone H3", "MCA-1"],
    associations: ["Rare in discoid lupus, chronic lymphocytic leukaemia, Sjögren syndrome, polymyalgia rheumatica"],
  },
};

// Group-level (competent-level) results used when the reader cannot or does not
// want to go down to the individual AC code.
const GROUP_RESULTS = {
  "G-NUC-SPECKLED": { name: "Nuclear speckled", codes: ["AC-2", "AC-4", "AC-5", "AC-29"] },
  "G-NUC-DOTS": { name: "Discrete nuclear dots", codes: ["AC-6", "AC-7"] },
  "G-NUCLEOLAR": { name: "Nucleolar", codes: ["AC-8", "AC-9", "AC-10"] },
  "G-ENVELOPE": { name: "Nuclear envelope", codes: ["AC-11", "AC-12"] },
  "G-PLEOMORPHIC": { name: "Pleomorphic", codes: ["AC-13", "AC-14"] },
  "G-CYTO-FIBRILLAR": { name: "Cytoplasmic fibrillar", codes: ["AC-15", "AC-16", "AC-17"] },
  "G-CYTO-SPECKLED": { name: "Cytoplasmic speckled", codes: ["AC-18", "AC-19", "AC-20"] },
  "G-MITOTIC": { name: "Mitotic", codes: ["AC-24", "AC-25", "AC-26", "AC-27", "AC-28"] },
};

// ---------------------------------------------------------------------------
// Guided decision tree
//   option.next   -> id of the next question
//   option.result -> AC code (PATTERNS) or group id (GROUP_RESULTS)
// ---------------------------------------------------------------------------
const TREE = {
  start: "q-compartment",
  nodes: {
    "q-compartment": {
      title: "Where is the staining in interphase cells?",
      help:
        "Look at the majority of non-dividing (interphase) cells first. Compare the brightness of the nucleus with the cytoplasm, and ignore isolated mitotic cells for now.",
      options: [
        { label: "Nucleus", hint: "Staining predominantly inside the nucleus (nucleoplasm, nucleoli or nuclear rim).", next: "q-nuclear" },
        { label: "Cytoplasm", hint: "Staining outside the nucleus; the nucleus is dark or much weaker.", next: "q-cyto" },
        { label: "Only mitotic cells", hint: "Interphase cells are essentially negative; only dividing cells show a specific structure.", next: "q-mitotic" },
        { label: "No specific staining", hint: "Everything is at background level at the screening dilution.", result: "AC-0" },
      ],
    },

    // ----------------------- Nuclear -----------------------
    "q-nuclear": {
      title: "Which nuclear structure is stained?",
      help: "Focus on the texture and distribution of the staining inside interphase nuclei.",
      options: [
        { label: "Whole nucleoplasm — smooth / uniform", hint: "Even, homogeneous staining without a granular texture.", next: "q-homog" },
        { label: "Whole nucleoplasm — speckled / granular", hint: "Many speckles throughout the nucleus, too many to count.", next: "q-speckled" },
        { label: "Discrete, countable dots", hint: "Separate bright dots you could count (from 1 up to ~80 per nucleus).", next: "q-dots" },
        { label: "Nucleoli", hint: "Staining mainly in the 1–6 nucleoli; nucleoplasm weak.", next: "q-nucleolar" },
        { label: "Nuclear rim / envelope", hint: "A bright ring outlining the nucleus.", next: "q-envelope" },
        { label: "Varies strongly from cell to cell", hint: "Some nuclei bright, others negative, depending on the cell-cycle phase.", next: "q-pleomorphic" },
      ],
    },
    "q-homog": {
      title: "Is the metaphase chromatin plate stained?",
      help: "Find a metaphase cell (chromosomes condensed in a band across the middle of the cell).",
      options: [
        { label: "Yes — intensely, homogeneously stained", hint: "The chromosome plate is as bright or brighter than interphase nuclei.", result: "AC-1" },
        { label: "Yes, but with a speckled / coarse texture", hint: "The chromatin plate is stained but looks granular.", next: "q-speckled" },
        { label: "No — chromatin plate negative", hint: "Re-look at the texture: a very fine speckled pattern can look homogeneous.", next: "q-speckled" },
      ],
    },
    "q-speckled": {
      title: "Look at the metaphase chromatin plate. Is it stained?",
      help: "This is the key differentiator between speckled patterns.",
      options: [
        { label: "Yes — and the cytoplasm & nucleoli are stained too", hint: "Fine granular nucleus, stained nucleoli, reticular cytoplasm, NORs bright on chromosomes.", result: "AC-29" },
        { label: "Yes — dense, uneven speckles in the plate and the nuclei", hint: "Speckles of varying size and brightness; nucleoli spared.", result: "AC-2" },
        { label: "No — chromatin plate is dark", hint: "The plate is negative; the surrounding mitotic cytoplasm may be speckled.", next: "q-speckle-size" },
        { label: "Not sure / no suitable mitosis", hint: "Report at group level.", result: "G-NUC-SPECKLED" },
      ],
    },
    "q-speckle-size": {
      title: "What size are the speckles?",
      help: "Compare speckle size to the nucleolus. Fine speckles are tiny and numerous; large/coarse speckles are clearly bigger and more irregular.",
      options: [
        { label: "Fine speckles", hint: "Small, numerous, evenly distributed.", result: "AC-4" },
        { label: "Large / coarse speckles", hint: "Bigger, irregular speckles; nucleoli usually negative.", result: "AC-5" },
        { label: "Not sure", hint: "Report at group level.", result: "G-NUC-SPECKLED" },
      ],
    },
    "q-dots": {
      title: "How many dots are there per nucleus?",
      help: "Count dots in several interphase nuclei. Then check a mitotic cell.",
      options: [
        { label: "40–80 uniform dots; aligned on chromosomes in mitosis", hint: "The dots line up on the metaphase plate.", result: "AC-3" },
        { label: "6–20 dots", hint: "Medium number of dots, mitotic chromatin not aligned.", result: "AC-6" },
        { label: "1–6 dots", hint: "Only a few dots, often near the nucleolus; not in all cells.", result: "AC-7" },
        { label: "Not sure", hint: "Report at group level.", result: "G-NUC-DOTS" },
      ],
    },
    "q-nucleolar": {
      title: "What does the nucleolar staining look like?",
      help: "Zoom into the nucleoli of interphase cells and, if possible, look at a metaphase cell.",
      options: [
        { label: "Homogeneous / smooth", hint: "Whole nucleolus evenly stained.", result: "AC-8" },
        { label: "Clumpy, irregular", hint: "Lumpy nucleoli, often with coiled-body dots; chromosome rims stain in mitosis.", result: "AC-9" },
        { label: "Punctate — fine dots", hint: "Dotted nucleoli; 5–10 bright pairs of dots (NORs) in metaphase.", result: "AC-10" },
        { label: "Not sure", hint: "Report at group level.", result: "G-NUCLEOLAR" },
      ],
    },
    "q-envelope": {
      title: "What does the nuclear rim look like?",
      help: "Focus the image so the edge of the nucleus is sharp.",
      options: [
        { label: "Smooth, continuous line", hint: "Even ring, accentuated where cells touch.", result: "AC-11" },
        { label: "Punctate — dotted line", hint: "Ring made of fine dots (nuclear pores).", result: "AC-12" },
        { label: "Not sure", hint: "Report at group level.", result: "G-ENVELOPE" },
      ],
    },
    "q-pleomorphic": {
      title: "What happens in mitotic cells?",
      help: "Pleomorphic patterns are told apart by their behaviour during mitosis.",
      options: [
        { label: "Mitotic cells negative; S-phase nuclei bright and coarsely speckled", hint: "G1 nuclei weak or negative.", result: "AC-13" },
        { label: "Kinetochores stained in metaphase, midbody in telophase", hint: "G1 negative, G2 nuclei bright.", result: "AC-14" },
        { label: "Not sure", hint: "Report at group level.", result: "G-PLEOMORPHIC" },
      ],
    },

    // ----------------------- Cytoplasmic -----------------------
    "q-cyto": {
      title: "Which cytoplasmic structure is stained?",
      help: "Describe the overall shape of the cytoplasmic staining.",
      options: [
        { label: "Fibres / filaments", hint: "Lines or networks crossing the cytoplasm.", next: "q-cyto-fibrillar" },
        { label: "Speckles or dots", hint: "Granular or dotted staining.", next: "q-cyto-speckled" },
        { label: "Coarse granular network filling the cytoplasm", hint: "Reticular, mitochondria-like.", result: "AC-21" },
        { label: "One-sided perinuclear structure", hint: "Ribbon-like or speckled staining at one pole of the nucleus.", result: "AC-22" },
        { label: "Rods and rings", hint: "Distinct rod- and ring-shaped structures.", result: "AC-23" },
      ],
    },
    "q-cyto-fibrillar": {
      title: "What do the fibres look like?",
      help: "Follow single fibres across the cell.",
      options: [
        { label: "Long, straight cables across the cell", hint: "Stress fibres (actin).", result: "AC-15" },
        { label: "Network radiating from the nucleus", hint: "Filamentous, web-like.", result: "AC-16" },
        { label: "Short interrupted segments along fibres", hint: "Dashed / dotted lines.", result: "AC-17" },
        { label: "Not sure", hint: "Report at group level.", result: "G-CYTO-FIBRILLAR" },
      ],
    },
    "q-cyto-speckled": {
      title: "What do the speckles look like?",
      help: "Compare density and number of the cytoplasmic speckles.",
      options: [
        { label: "Few to many discrete, countable dots", hint: "Variable size, clearly separate dots.", result: "AC-18" },
        { label: "Dense, fine speckles — almost homogeneous", hint: "The cytoplasm looks evenly stained.", result: "AC-19" },
        { label: "Fine, scattered speckles", hint: "Sparse fine speckles.", result: "AC-20" },
        { label: "Not sure", hint: "Report at group level.", result: "G-CYTO-SPECKLED" },
      ],
    },

    // ----------------------- Mitotic -----------------------
    "q-mitotic": {
      title: "Which structure is stained in the mitotic cells?",
      help: "Look at cells in different phases of mitosis (prometaphase → telophase).",
      options: [
        { label: "One bright dot at each spindle pole", hint: "Interphase cells may show 1–2 cytoplasmic dots.", result: "AC-24" },
        { label: "Spindle fibres", hint: "Fibres between the poles, without accentuated poles.", result: "AC-25" },
        { label: "Poles fanning into the spindle (cone shape)", hint: "Interphase nuclei show a fine speckled pattern.", result: "AC-26" },
        { label: "Bridge / midbody between two daughter cells", hint: "Late telophase / cytokinesis.", result: "AC-27" },
        { label: "Coat around the condensed chromosomes", hint: "Perichromosomal staining.", result: "AC-28" },
        { label: "Not sure", hint: "Report at group level.", result: "G-MITOTIC" },
      ],
    },
  },
};
