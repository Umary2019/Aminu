const course = (code, title, level = "100", semester = "First") => ({ code, title, level, semester });

export const gsuCatalog = {
  faculties: [
    {
      name: "Faculty of Arts, Social and Management Sciences",
      departments: [
        { name: "Accounting", courses: [course("ACC101", "Introduction to Accounting"), course("ACC201", "Financial Accounting", "200"), course("ACC302", "Cost Accounting", "300", "Second")] },
        { name: "Business Administration", courses: [course("BUS101", "Principles of Management"), course("BUS204", "Marketing Management", "200", "Second"), course("BUS311", "Strategic Management", "300")] },
        { name: "Economics", courses: [course("ECO101", "Principles of Economics"), course("ECO203", "Microeconomics II", "200"), course("ECO315", "Development Economics", "300", "Second")] },
        { name: "English Language", courses: [course("ENG101", "Use of English I"), course("ENG207", "Phonetics and Phonology", "200", "Second"), course("ENG312", "Syntax of English", "300")] },
        { name: "History", courses: [course("HIS101", "Introduction to African History"), course("HIS214", "Nigerian History", "200", "Second"), course("HIS321", "Historiography", "300")] },
        { name: "International Relations", courses: [course("IRS101", "Introduction to International Relations"), course("IRS205", "Foreign Policy Analysis", "200", "Second"), course("IRS312", "International Organizations", "300")] },
        { name: "Library and Information Management", courses: [course("LIM101", "Introduction to Library Science"), course("LIM208", "Information Retrieval", "200", "Second"), course("LIM314", "Digital Libraries", "300")] },
        { name: "Political Science", courses: [course("POL101", "Introduction to Political Science"), course("POL212", "Comparative Politics", "200", "Second"), course("POL324", "Public Policy", "300")] },
        { name: "Public Administration", courses: [course("PAD101", "Introduction to Public Administration"), course("PAD206", "Administrative Theory", "200", "Second"), course("PAD318", "Local Government Administration", "300")] },
        { name: "Religious Studies", courses: [course("RLS101", "Introduction to Religious Studies"), course("RLS205", "Religion and Society", "200"), course("RLS314", "Comparative Religion", "300", "Second")] },
        { name: "Sociology", courses: [course("SOC101", "Introduction to Sociology"), course("SOC207", "Social Statistics", "200", "Second"), course("SOC311", "Urban Sociology", "300")] },
        { name: "Peace and Conflict Resolution", courses: [course("PCR101", "Foundations of Peace Studies"), course("PCR208", "Conflict Analysis", "200", "Second"), course("PCR315", "Mediation and Negotiation", "300")] },
      ],
    },
    {
      name: "Faculty of Education",
      departments: [
        { name: "Biology Education", courses: [course("EDB101", "Biology for Educators"), course("EDB212", "Teaching Practice I", "200", "Second"), course("EDB323", "Curriculum in Biology", "300")] },
        { name: "Chemistry Education", courses: [course("EDC101", "Chemistry for Educators"), course("EDC214", "Teaching Practice I", "200", "Second"), course("EDC322", "Curriculum in Chemistry", "300")] },
        { name: "Computer Science Education", courses: [course("EDS101", "ICT in Education"), course("EDS215", "Educational Software", "200", "Second"), course("EDS326", "Methods of Teaching CS", "300")] },
        { name: "English Education", courses: [course("EDE101", "English Usage for Educators"), course("EDE211", "Teaching Methods in English", "200"), course("EDE324", "Language Curriculum", "300", "Second")] },
        { name: "Geography Education", courses: [course("EDG101", "Map Reading and Interpretation"), course("EDG209", "Field Methods", "200", "Second"), course("EDG327", "Geography Curriculum", "300")] },
        { name: "Mathematics Education", courses: [course("EDM101", "Mathematics for Educators"), course("EDM216", "Statistics for Education", "200", "Second"), course("EDM325", "Teaching Methods in Mathematics", "300")] },
        { name: "Physics Education", courses: [course("EDP101", "Physics for Educators"), course("EDP210", "Laboratory Methods", "200"), course("EDP321", "Teaching Methods in Physics", "300", "Second")] },
        { name: "Political Science Education", courses: [course("EDL101", "Politics and Civic Education"), course("EDL213", "Teaching Practice I", "200", "Second"), course("EDL328", "Curriculum Studies in Political Science", "300")] },
      ],
    },
    {
      name: "Faculty of Environmental Sciences",
      departments: [
        { name: "Architecture", courses: [course("ARC101", "Architectural Graphics"), course("ARC205", "Building Materials", "200"), course("ARC312", "Architectural Design Studio", "300", "Second")] },
        { name: "Building Engineering", courses: [course("BDE101", "Introduction to Building Technology"), course("BDE204", "Construction Methods", "200", "Second"), course("BDE319", "Project Planning", "300")] },
        { name: "Estate Management", courses: [course("EST101", "Principles of Estate Management"), course("EST210", "Property Valuation", "200"), course("EST323", "Estate Law", "300", "Second")] },
        { name: "Quantity Surveying", courses: [course("QTS101", "Measurement and Quantification"), course("QTS211", "Cost Control", "200"), course("QTS326", "Procurement Management", "300", "Second")] },
      ],
    },
    {
      name: "Faculty of Science",
      departments: [
        { name: "Biochemistry", courses: [course("BCH101", "General Biochemistry"), course("BCH213", "Metabolism", "200", "Second"), course("BCH322", "Enzymology", "300")] },
        { name: "Biological Sciences", courses: [course("BIO101", "General Biology"), course("BIO209", "Cell Biology", "200", "Second"), course("BIO318", "Ecology", "300")] },
        { name: "Botany", courses: [course("BOT101", "Introductory Botany"), course("BOT207", "Plant Anatomy", "200", "Second"), course("BOT314", "Plant Physiology", "300")] },
        { name: "Chemistry", courses: [course("CHM101", "General Chemistry"), course("CHM203", "Organic Chemistry", "200"), course("CHM311", "Physical Chemistry", "300", "Second")] },
        { name: "Computer Science", courses: [course("CSC101", "Introduction to Computer Science"), course("CSC204", "Data Structures", "200", "Second"), course("CSC312", "Database Systems", "300")] },
        { name: "Geography", courses: [course("GEO101", "Elements of Physical Geography"), course("GEO206", "Cartography", "200", "Second"), course("GEO317", "Remote Sensing", "300")] },
        { name: "Geology", courses: [course("GLY101", "Physical Geology"), course("GLY214", "Mineralogy", "200", "Second"), course("GLY326", "Structural Geology", "300")] },
        { name: "Mathematics", courses: [course("MTH101", "Elementary Mathematics I"), course("MTH208", "Linear Algebra", "200", "Second"), course("MTH315", "Differential Equations", "300")] },
        { name: "Microbiology", courses: [course("MCB101", "General Microbiology"), course("MCB206", "Bacteriology", "200", "Second"), course("MCB319", "Industrial Microbiology", "300")] },
        { name: "Physics", courses: [course("PHY101", "General Physics I"), course("PHY205", "Electricity and Magnetism", "200", "Second"), course("PHY314", "Quantum Physics", "300")] },
        { name: "Science Laboratory Technology", courses: [course("SLT101", "Lab Safety and Instrumentation"), course("SLT210", "Analytical Techniques", "200"), course("SLT323", "Quality Assurance", "300", "Second")] },
        { name: "Zoology", courses: [course("ZOO101", "Principles of Zoology"), course("ZOO207", "Invertebrate Zoology", "200", "Second"), course("ZOO318", "Parasitology", "300")] },
      ],
    },
    {
      name: "Faculty of Law",
      departments: [
        { name: "Public Law", courses: [course("LAW101", "Legal Method"), course("LAW205", "Constitutional Law", "200", "Second"), course("LAW318", "Administrative Law", "300")] },
        { name: "Sharia Law", courses: [course("SHL101", "Introduction to Islamic Law"), course("SHL214", "Islamic Jurisprudence", "200", "Second"), course("SHL325", "Law of Evidence in Sharia", "300")] },
      ],
    },
    {
      name: "Faculty of Pharmaceutical Sciences",
      departments: [
        { name: "Clinical Pharmacy and Pharmacy Practice", courses: [course("PHA101", "Foundations of Pharmacy"), course("PHA211", "Clinical Therapeutics", "200", "Second"), course("PHA424", "Pharmacy Practice", "400")] },
        { name: "Pharmaceutical Microbiology", courses: [course("PHM101", "Intro to Pharmaceutical Microbiology"), course("PHM209", "Sterile Products", "200", "Second"), course("PHM318", "Industrial Microbiology", "300")] },
        { name: "Pharmacognosy and Drug Development", courses: [course("PGD101", "Medicinal Plants"), course("PGD214", "Natural Products Chemistry", "200", "Second"), course("PGD323", "Drug Discovery", "300")] },
        { name: "Pharmacology and Therapeutics", courses: [course("PHT101", "General Pharmacology"), course("PHT212", "Systemic Pharmacology", "200", "Second"), course("PHT325", "Clinical Pharmacology", "300")] },
        { name: "Pharmaceutics and Medicinal Chemistry", courses: [course("PMC101", "Physical Pharmacy"), course("PMC209", "Medicinal Chemistry I", "200", "Second"), course("PMC321", "Pharmaceutical Formulation", "300")] },
        { name: "Pharmaceutics and Pharmaceutical Technology", courses: [course("PPT101", "Dosage Form Design"), course("PPT213", "Pharmaceutical Engineering", "200", "Second"), course("PPT328", "Manufacturing Technology", "300")] },
      ],
    },
    {
      name: "Faculty of Agriculture",
      departments: [
        { name: "Agricultural Economics", courses: [course("AGE101", "Principles of Agricultural Economics"), course("AGE210", "Farm Management", "200"), course("AGE323", "Agribusiness", "300", "Second")] },
        { name: "Agricultural Extension", courses: [course("AEX101", "Introduction to Extension"), course("AEX211", "Communication in Extension", "200", "Second"), course("AEX324", "Rural Development", "300")] },
        { name: "Animal Science", courses: [course("ANS101", "Introductory Animal Science"), course("ANS214", "Animal Nutrition", "200", "Second"), course("ANS327", "Animal Breeding", "300")] },
        { name: "Crop Sciences", courses: [course("CPS101", "Principles of Crop Production"), course("CPS208", "Crop Physiology", "200", "Second"), course("CPS319", "Plant Breeding", "300")] },
        { name: "Fisheries and Aquaculture", courses: [course("FIA101", "Introduction to Fisheries"), course("FIA207", "Aquaculture Systems", "200", "Second"), course("FIA315", "Fish Nutrition", "300")] },
        { name: "Forestry and Wildlife Management", courses: [course("FWM101", "Introduction to Forestry"), course("FWM205", "Forest Ecology", "200", "Second"), course("FWM318", "Wildlife Conservation", "300")] },
        { name: "Horticulture and Landscape Management", courses: [course("HLM101", "Fundamentals of Horticulture"), course("HLM206", "Landscape Design", "200", "Second"), course("HLM321", "Ornamental Plant Production", "300")] },
        { name: "Soil Science", courses: [course("SOS101", "Introduction to Soil Science"), course("SOS209", "Soil Chemistry", "200", "Second"), course("SOS314", "Soil Fertility", "300")] },
      ],
    },
    {
      name: "Faculty of Basic Medical Sciences",
      departments: [
        { name: "Human Anatomy", courses: [course("ANA101", "Gross Anatomy I"), course("ANA212", "Embryology", "200", "Second"), course("ANA323", "Neuroanatomy", "300")] },
        { name: "Human Physiology", courses: [course("PHS101", "General Physiology"), course("PHS214", "Cardiovascular Physiology", "200", "Second"), course("PHS324", "Neurophysiology", "300")] },
        { name: "Medical Biochemistry", courses: [course("MBI101", "Medical Biochemistry I"), course("MBI213", "Clinical Biochemistry", "200", "Second"), course("MBI321", "Molecular Basis of Disease", "300")] },
        { name: "Nursing Sciences", courses: [course("NUR101", "Foundations of Nursing"), course("NUR210", "Medical-Surgical Nursing", "200"), course("NUR325", "Community Health Nursing", "300", "Second")] },
        { name: "Nutrition and Dietetics", courses: [course("NDT101", "Principles of Nutrition"), course("NDT207", "Human Nutrition", "200", "Second"), course("NDT318", "Clinical Dietetics", "300")] },
        { name: "Pharmacology", courses: [course("BMS101", "Basic Pharmacology"), course("BMS213", "Autonomic Pharmacology", "200", "Second"), course("BMS327", "Clinical Therapeutics", "300")] },
      ],
    },
    {
      name: "Faculty of Basic Clinical Sciences",
      departments: [
        { name: "Chemical Pathology", courses: [course("CHP301", "Clinical Chemistry", "300"), course("CHP412", "Endocrine Pathology", "400", "Second"), course("CHP521", "Advanced Chemical Pathology", "500")] },
        { name: "Clinical Pharmacology and Therapeutics", courses: [course("CPT301", "Clinical Pharmacokinetics", "300"), course("CPT409", "Rational Drug Use", "400", "Second"), course("CPT522", "Advanced Therapeutics", "500")] },
        { name: "Hematology and Blood Transfusion", courses: [course("HBT301", "Hematopoiesis", "300"), course("HBT411", "Transfusion Medicine", "400", "Second"), course("HBT523", "Hemato-oncology", "500")] },
        { name: "Histopathology", courses: [course("HPT301", "General Pathology", "300"), course("HPT410", "Systemic Pathology", "400", "Second"), course("HPT524", "Diagnostic Histopathology", "500")] },
        { name: "Medical Microbiology and Immunology", courses: [course("MMI301", "Medical Bacteriology", "300"), course("MMI413", "Virology and Immunology", "400", "Second"), course("MMI525", "Clinical Microbiology", "500")] },
      ],
    },
    {
      name: "Faculty of Clinical Sciences",
      departments: [
        { name: "Anaesthesia", courses: [course("ANS401", "Basic Anaesthesia", "400"), course("ANS512", "Critical Care", "500", "Second"), course("ANS621", "Advanced Anaesthetic Techniques", "600")] },
        { name: "Community Medicine", courses: [course("COM401", "Public Health Principles", "400"), course("COM510", "Epidemiology", "500", "Second"), course("COM623", "Primary Health Care Practice", "600")] },
        { name: "ENT", courses: [course("ENT401", "Otorhinolaryngology I", "400"), course("ENT509", "Head and Neck Surgery", "500", "Second"), course("ENT622", "Advanced ENT Practice", "600")] },
        { name: "General Surgery", courses: [course("SUR401", "Principles of Surgery", "400"), course("SUR512", "Trauma and Emergency Surgery", "500", "Second"), course("SUR621", "Advanced Surgical Practice", "600")] },
        { name: "Internal Medicine", courses: [course("INM401", "Internal Medicine I", "400"), course("INM511", "Cardiology and Respiratory Medicine", "500", "Second"), course("INM624", "Advanced Internal Medicine", "600")] },
        { name: "Obstetrics and Gynaecology", courses: [course("OBG401", "Reproductive Health", "400"), course("OBG513", "High-Risk Obstetrics", "500", "Second"), course("OBG625", "Advanced Gynaecology", "600")] },
        { name: "Ophthalmology", courses: [course("OPH401", "Clinical Ophthalmology", "400"), course("OPH509", "Ocular Disease Management", "500", "Second"), course("OPH623", "Advanced Eye Care", "600")] },
        { name: "Paediatrics", courses: [course("PED401", "Growth and Development", "400"), course("PED510", "Neonatology", "500", "Second"), course("PED622", "Advanced Paediatric Care", "600")] },
        { name: "Radiology", courses: [course("RAD401", "Diagnostic Imaging", "400"), course("RAD513", "Interventional Radiology", "500", "Second"), course("RAD626", "Advanced Radiologic Practice", "600")] },
      ],
    },
  ],
  levels: ["100", "200", "300", "400", "500", "600"],
  semesters: ["First", "Second"],
};

const allCourses = gsuCatalog.faculties.flatMap((faculty) =>
  faculty.departments.flatMap((department) =>
    department.courses.map((item) => ({ ...item, faculty: faculty.name, department: department.name }))
  )
);

export const facultyNames = gsuCatalog.faculties.map((faculty) => faculty.name);

export const getDepartmentsByFaculty = (facultyName) => {
  if (!facultyName) return [];
  const faculty = gsuCatalog.faculties.find((item) => item.name === facultyName);
  return faculty ? faculty.departments.map((department) => department.name) : [];
};

export const getCoursesByDepartment = (facultyName, departmentName) => {
  if (!facultyName || !departmentName) return [];
  const faculty = gsuCatalog.faculties.find((item) => item.name === facultyName);
  if (!faculty) return [];
  const department = faculty.departments.find((item) => item.name === departmentName);
  return department ? department.courses : [];
};

export const getAllCourseDirectory = () => allCourses;
