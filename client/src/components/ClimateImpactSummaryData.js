export const pathways = [
    { id: 0, name: "Extreme Storms" },
    { id: 1, name: "Coastal Security" },
    { id: 2, name: "Flooding and Drought" },
    { id: 3, name: "Food and Personal Security" },
    { id: 4, name: "Pathogenic Marine Microorganisms" },
    { id: 5, name: "Temperature" },
];

export const impacts = [
    {
        id: 0,
        name: "Illness and mortality due to damp building fabrics",
        inPathway: [0, 1],
        icon: "",
    },
    {
        id: 1,
        name: "Respiratory diseases",
        inPathway: [0, 2, 3, 4, 5],
        icon: "",
    },
    {
        id: 2,
        name: "Wellbeing",
        inPathway: [0, 1, 2, 3, 4, 5, 6],
        icon: "",
    },
    {
        id: 3,
        name: "Mental disorders",
        inPathway: [0, 1, 2, 3, 5],
        icon: "",
    },
    {
        id: 4,
        name: "Vector-borne diseases",
        inPathway: [0, 1, 2, 3, 5],
        icon: "",
    },
    {
        id: 5,
        name: "Injury",
        inPathway: [0, 1, 2],
        icon: "",
    },
    {
        id: 6,
        name: "Chronic health conditions",
        inPathway: [0, 1],
        icon: "",
    },
    {
        id: 7,
        name: "Infections caused by pathogenic organisms",
        inPathway: [0, 1, 2, 3, 4, 5],
        icon: "",
    },
    {
        id: 8,
        name: "Adverse health outcomes associated with exposure to chemicals, heavy metals, and microplastics",
        inPathway: [0, 1, 2, 3, 4],
        icon: "",
    },
    {
        id: 9,
        name: "Adverse health outcomes and malnutrition associated with an unhealthy diet",
        inPathway: [3],
        icon: "",
    },
    {
        id: 10,
        name: "Antimicrobial resistance",
        inPathway: [4],
        icon: "",
    },
    {
        id: 11,
        name: "Adverse health outcomes associated with naturally produced toxins in marine environments",
        inPathway: [4],
        icon: "",
    },
    {
        id: 12,
        name: "Pandemic and zoonotic diseases",
        inPathway: [4],
        icon: "",
    },
    {
        id: 13,
        name: "Fertility and endocrine function",
        inPathway: [4],
        icon: "",
    },
    {
        id: 14,
        name: "Cardiovascular diseases",
        inPathway: [5],
        icon: "",
    },
];