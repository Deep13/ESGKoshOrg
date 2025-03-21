import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, Table, TableRow, TableCell } from "docx";
import { useSidebar } from "../context/SidebarContext";

const scopeData = {
    "Fuel": "Scope 1",
    "Bioenergy": "Scope 1",
    "Refrigerant and other": "Scope 1",
    "Elec heat cooling": "Scope 2",
    "Owned Vehicles": "Scope 1",
    "Materials": "Scope 3",
    "WTT- fuels": "Scope 3",
    "Waste Disposal": "Scope 3",
    "Flight": "Scope 3",
    "Business travel - land and sea": "Scope 3",
    "Freighting goods": "Scope 3",
    "Employees commuting": "Scope 3",
    "Water": "Scope 3",
    "Accommodation": "Scope 3",
    "Food": "Scope 3",
    "Home Office": "Scope 3"
};
// Helper function to generate a table
const generateTable = (title, unfilteredData) => 
    {const data = unfilteredData.filter(row => scopeData.hasOwnProperty(row.category));
    return [
    new Paragraph({ text: title, heading: "Heading2" }),
    new Table({
        width: { size: 100, type: "pct" }, // Set table width to 100%
        columnWidths: [2000, 5000, 3000], // Adjust column widths as needed
        rows: [
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph("Scopes")] }),
                    new TableCell({ children: [new Paragraph("Category")] }),
                    new TableCell({ children: [new Paragraph("Emission (kg CO₂)")] }),
                ],
            }),
            ...data.map(row =>
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph(String(scopeData[row.category] || "Unknown Scope"))] }),
                        new TableCell({ children: [new Paragraph(row.category)] }),
                        new TableCell({ children: [new Paragraph(String(row.emission.toFixed(4)))] }), // Round off to 2 decimals
                    ],
                })
            ),
        ],
    }),
]};


// Function to generate the DOCX file
const generateDocx = (environmentalData, socialData, governanceData,master,year) => {
    console.log("master",master)
    const doc = new Document({
        sections: [
            {
                children: [
                    new Paragraph({ text: "Sustainability Report", heading: "Title" }),

                    // Organization Details
                    new Paragraph({ text: "Organization Details", heading: "Heading1" }),
                    new Paragraph(`Name of the Organization:${master.organisationName}`),
                    new Paragraph(`Year:${year}`),
                    new Paragraph(`Country: ${master.country}`),
                    new Paragraph("Framework: ____________"),

                    // Environmental Section
                    new Paragraph({ text: "Environmental Data (E)", heading: "Heading1" }),
                    ...generateTable("Environmental Emissions", environmentalData),

                    // Social Section
                    new Paragraph({ text: "Social Data (S)", heading: "Heading1" }),
                    ...generateTable("Social Impact", socialData),

                    // Governance Section
                    new Paragraph({ text: "Governance Data (G)", heading: "Heading1" }),
                    ...generateTable("Governance Metrics", governanceData),
                ],
            },
        ],
    });

    Packer.toBlob(doc).then(blob => {
        saveAs(blob, "Sustainability_Report.docx");
    });
};

export default generateDocx;
