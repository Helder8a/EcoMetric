const certificationsDB = {
    lidera: {
        name: "LiderA",
        maxScore: 20,
        scoreUnit: "Points",
        levels: { 11: "A++", 9.5: "A+", 8: "A", 6.5: "B", 5: "C", 3.5: "D", 2: "E", 1: "F", 0: "G" },
        weights: {
            building: { "Local Integration": 1, Resources: 1.5, "Environmental Loads": 1, "Indoor Environmental Quality": 1.2, "Socioeconomic Experiences": 1 },
            urban: { "Local Integration": 1.5, Resources: 1, "Environmental Loads": 1.2, "Indoor Environmental Quality": .8, "Socioeconomic Experiences": 1.5 }
        },
        data: {
            "Local Integration": {
                "Bio-climate": {
                    info: {
                        objective: "Optimization of the project design according to local climatic conditions.",
                        example: "Building in Lisbon with south-facing glass facades protected by overhangs.",
                        benefits: "Reduction in air conditioning needs.",
                        normativa_pt: { name: "REH - Energy Performance Regulation for Residential Buildings (Decree-Law No. 101-D/2020)", link: "https://dre.pt/dre/detalhe/decreto-lei/101-d-2020-150799381" },
                        descriptive_report: "The building's design considered the site's bioclimatic characteristics. Solar orientation was optimized to maximize solar gains in winter and minimize them in summer, and protections against dominant winds were implemented, contributing to thermal comfort and reduced energy consumption."
                    },
                    credits: { "Optimized solar orientation": .4, "Protection against dominant winds": .2, "Adequate shadow study": .2 }
                }
            },
            Resources: {
                "Sustainable Insulation": {
                    info: {
                        objective: "Use insulation materials with low environmental impact and high efficiency.",
                        example: "Wall insulation with expanded cork agglomerate.",
                        benefits: "Improved thermal and acoustic comfort, and reduced energy bills.",
                        normativa_pt: { name: "REH - Annex III (Thermal performance of envelope components)", link: "https://dre.pt/dre/detalhe/decreto-lei/101-d-2020-150799381" },
                        descriptive_report: "High-performance, low-impact materials were selected for the building's envelope insulation. This choice aims to ensure excellent thermal and acoustic comfort, complying with REH requirements and significantly reducing the need for artificial climate control."
                    },
                    solutions_pt: [
                        { name: "Expanded Cork Agglomerate (ICB)", manufacturer: "Amorim Isolamentos, Sofalca", description: "100% natural and Portuguese material. Excellent thermal and acoustic insulator, fully recyclable, and with a negative carbon balance.", application: "Wall insulation (ETICS), roofs, and floors.", link: "https://www.amorimisolamentos.com/", lcca_id: "amorim_icb", kgCO2e: -1.5 },
                        { name: "Mineral Wool (Rock Wool)", manufacturer: "Volcalis, Saint-Gobain (Isover), Knauf Insulation", description: "Insulators made from natural (basalt rock or sand) and recycled raw materials. Great thermal, acoustic, and fire protection performance.", application: "Cavity walls, partitions, false ceilings, and roofs.", link: "https://www.volcalis.pt/", lcca_id: "volcalis_wool", kgCO2e: 1.2 },
                        { name: "Hempcrete", manufacturer: "Natura Materia, Cânhamor", description: "Mix of hemp, lime, and water. Lightweight material with good thermal and acoustic insulation. Regulates indoor humidity.", application: "Non-structural infill walls, roof insulation.", link: "https://naturamateria.pt/", lcca_id: "hempcrete", kgCO2e: -.7 },
                        { name: "Straw Panels", manufacturer: "Pinho&Palha", description: "Prefabricated panels of compacted wheat straw. It is an agricultural byproduct, renewable and biodegradable with excellent insulation properties.", application: "Construction of exterior and interior walls in modular systems.", link: "https://www.pinhopalha.com/", lcca_id: "straw_panel", kgCO2e: -1 }
                    ],
                    credits: { "Cork thermal insulation": .6, "Mineral wool insulation (recycled content)": .4, "Insulation with straw or wood fiber panels": .5, "Use of Hempcrete": .5 }
                },
                "Panels and Structure": {
                    info: {
                        objective: "Employ structural and enclosure systems with renewable or recycled materials.",
                        example: "Building structure in Cross-Laminated Timber (CLT).",
                        benefits: "Reduced construction time, lighter structure, and carbon sequestration.",
                        normativa_pt: { name: "Structural Eurocodes (e.g., Eurocode 5 for timber)", link: "http://www.lnec.pt/pt/atividades/normalizacao/eurocodigos-estruturais/" },
                        descriptive_report: "The project's structure was designed using low embodied carbon materials, such as certified wood (FSC/PEFC) in CLT systems, or compressed earth blocks (CEB). These solutions, besides being sustainable, comply with the applicable Structural Eurocodes and contribute to reducing the overall carbon footprint of the construction."
                    },
                    solutions_pt: [
                        { name: "Cross-Laminated Timber (CLT)", manufacturer: "Grupo Casais, Green Heritage, Tisem", description: "Structural panels and beams of solid wood. Allow for fast, dry construction with a very low carbon footprint.", application: "Building structures (columns, beams, walls, floors, roofs).", link: "https://edificiossustentaveis.casais.pt/", lcca_id: "clt_timber", kgCO2e: -1.8 },
                        { name: "Compressed Earth Block (CEB)", manufacturer: "Terrapalha, various artisanal producers", description: "Produced from local earth, pressed and air-cured, without firing. Has excellent thermal inertia.", application: "Masonry walls, fences.", link: "https://terrapalha.com/", lcca_id: "ceb_brick", kgCO2e: .1 },
                        { name: "Concrete with Recycled Aggregates", manufacturer: "Secil, Cimpor, Betão Liz", description: "Concrete that replaces part of the natural aggregates (sand, gravel) with materials from construction and demolition waste (CDW), promoting a circular economy.", application: "Foundations, slabs, non-structural elements.", link: "https://www.secil-group.com/pt/", kgCO2e: .12 }
                    ],
                    credits: { "Use of Certified Wood (FSC/PEFC)": .6, "CLT or glulam structure": .7, "Masonry with Compressed Earth Blocks (CEB)": .4, "Use of concrete with recycled aggregates": .3 }
                }
            },
            "Environmental Loads": {
                "Waste Management": {
                    info: {
                        objective: "Minimization of waste production.",
                        example: "Construction plan that diverts >70% of waste for recycling.",
                        benefits: "Reduction of landfill waste.",
                        normativa_pt: { name: "RGGR - General Waste Management Regime (Decree-Law No. 102-D/2020)", link: "https://dre.pt/dre/detalhe/decreto-lei/102-d-2020-151049581" },
                        descriptive_report: "A rigorous on-site waste management plan was implemented, in accordance with the RGGR, aiming to divert over 70% of waste to recycling and reuse. Additionally, the project includes dedicated spaces for domestic waste separation for future users, promoting sustainability in the operational phase."
                    },
                    credits: { "Construction waste management plan (>70% diverted)": .6, "Space for domestic waste separation": .4 }
                }
            },
            "Indoor Environmental Quality": {
                "Health and Air Quality": {
                    info: {
                        objective: "Ensure a healthy and comfortable indoor environment, free of toxic emissions.",
                        example: "Design for natural ventilation and use paints without VOCs.",
                        benefits: "Healthier and more productive environment.",
                        normativa_pt: { name: "RECS - Regulation for Commercial and Service Buildings (part of REH)", link: "https://dre.pt/dre/detalhe/decreto-lei/101-d-2020-150799381" },
                        descriptive_report: "Indoor environmental quality was a priority, ensured through a design for cross-ventilation and the specification of materials with low or zero Volatile Organic Compound (VOC) emissions, such as ecological paints and varnishes. These measures aim to ensure a healthy environment for occupants, in line with best practices and applicable regulations."
                    },
                    solutions_pt: [
                        { name: "Ecological Paints and Varnishes", manufacturer: "CIN (CINatura range), Robbialac (Ecolabel range), Biofa", description: "Water-based or natural oil-based paints and varnishes, with very low or zero VOC emissions and certified with the European Ecolabel.", application: "Painting of walls, ceilings, wood, and metals.", link: "https://www.cin.com/", kgCO2e: 1.5 }
                    ],
                    credits: { "Efficient natural cross-ventilation": .5, "Low VOC emission materials (paints, glues)": .4, "Gypsum boards with air purification": .3 }
                }
            }
        }
    },
    breeam: {
        name: "BREEAM",
        maxScore: 100,
        scoreUnit: "Points",
        levels: { 85: "Outstanding", 70: "Excellent", 55: "Very Good", 45: "Good", 30: "Pass", 0: "Unclassified" },
        data: {}
    },
    leed: {
        name: "LEED",
        maxScore: 110,
        scoreUnit: "Points",
        levels: { 80: "Platinum", 60: "Gold", 50: "Silver", 40: "Certified", 0: "Uncertified" },
        data: {}
    }
};