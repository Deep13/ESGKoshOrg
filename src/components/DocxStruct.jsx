import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, BorderStyle, ImageRun } from "docx";
import { collection,getDocs, query, where } from "firebase/firestore";
import { firestore } from "../firebase";

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

// Function to create a horizontal line
const horizontalLine = new Paragraph({
    children: [],
    border: {
        bottom: { style: BorderStyle.SINGLE, size: 3, color: "000000" } // Black line
    },
});

// Helper function to generate a table
// const generateTableEnv = (title, unfilteredData) => {
//     const data = unfilteredData.filter(row => scopeData.hasOwnProperty(row.category));


//     return [
//         new Paragraph(""), // Space before table
//         new Paragraph({ text: title, heading: "Heading1" , bold:true}),
//         new Table({
//             width: { size: 100, type: "pct" },
//             columnWidths: [2000, 5000, 3000],
//             rows: [
//                 new TableRow({
//                     children: [
//                         new TableCell({ children: [new Paragraph("Scopes")] }),
//                         new TableCell({ children: [new Paragraph("Category")] }),
//                         new TableCell({ children: [new Paragraph("Emission (kg CO₂)")] }),
//                     ],
//                 }),
//                 ...data.map(row =>
//                     new TableRow({
//                         children: [
//                             new TableCell({ children: [new Paragraph(String(scopeData[row.category] || "Unknown Scope"))] }),
//                             new TableCell({ children: [new Paragraph(row.category)] }),
//                             new TableCell({ children: [new Paragraph(String(row.emission.toFixed(4)))] }),
//                         ],
//                     })
//                 ),
//             ],
//         }),
//         new Paragraph(""), // Space after table
//         horizontalLine, // Line after table
//         new Paragraph(""), // Space after table
//     ];
// };

//club child Labor data
const clubChildLaborData = (data) => {
    const result = {
        Low: 0,
        Moderate: 0,
        High: 0,
        Uncertain: 0,
    };

    Object.keys(data || {}).forEach(key => {
        if (key === "year" || key === "type") return;

        const value = data[key];
        if (typeof value !== "object") return;

        // Yearly format — nested structure
        if (Object.values(value)[0] && typeof Object.values(value)[0] === "object") {
            Object.values(value).forEach(location => {
                const types = location["Type"] || {};
                Object.entries(types).forEach(([severity, count]) => {
                    if (result.hasOwnProperty(severity)) {
                        result[severity] += count;
                    } else {
                        result[severity] = count;
                    }
                });
            });
        } else {
            // Monthly format — flat structure
            const types = value["Type"] || {};
            Object.entries(types).forEach(([severity, count]) => {
                if (result.hasOwnProperty(severity)) {
                    result[severity] += count;
                } else {
                    result[severity] = count;
                }
            });
        }
    });

    return result;
};


//club CHS data
const clubCHSData = (data) => {
    const result = {
        "No. of non-compliance Incidents": 0,
        "Customers Impacted": 0,
    };

    Object.keys(data || {}).forEach(key => {
        if (key === "year" || key === "type") return;

        const value = data[key];

        if (typeof value !== "object") return;

        // Check if it's a nested location (yearly format)
        if (Object.values(value)[0] && typeof Object.values(value)[0] === "object") {
            // Yearly format
            Object.values(value).forEach(location => {
                Object.entries(location).forEach(([metric, count]) => {
                    if (result.hasOwnProperty(metric)) {
                        result[metric] += count;
                    } else {
                        result[metric] = count;
                    }
                });
            });
        } else {
            // Monthly format (flat)
            Object.entries(value).forEach(([metric, count]) => {
                if (result.hasOwnProperty(metric)) {
                    result[metric] += count;
                } else {
                    result[metric] = count;
                }
            });
        }
    });

    return result;
};


//club market data
const clubMarketPresence = (data) => {
    const result = {
        "Values": 0,
        "Markets served by the entity nationally": 0,
        "Markets served by the entity internationally": 0
    };

    Object.keys(data || {}).forEach(key => {
        if (key === "year" || key === "type") return;

        const value = data[key];

        if (typeof value !== "object") return;

        // Yearly format — nested structure
        if (Object.values(value)[0] && typeof Object.values(value)[0] === "object") {
            Object.values(value).forEach(location => {
                result["Values"] += parseFloat(location["Values"] || 0);
                result["Markets served by the entity nationally"] += parseInt(location["Markets served by the entity nationally"] || 0);
                result["Markets served by the entity internationally"] += parseInt(location["Markets served by the entity internationally"] || 0);
            });
        } else {
            // Monthly format — flat structure
            result["Values"] += parseFloat(value["Values"] || 0);
            result["Markets served by the entity nationally"] += parseInt(value["Markets served by the entity nationally"] || 0);
            result["Markets served by the entity internationally"] += parseInt(value["Markets served by the entity internationally"] || 0);
        }
    });

    return result;
};


//club social data
const clubSocialBenefits = (data) => {
    const result = {
        "Expenditure": 0,
        "No. of Beneficiaries": 0
    };

    Object.keys(data || {}).forEach(key => {
        if (key === "year" || key === "type") return;

        const value = data[key];
        if (typeof value !== "object") return;

        // Yearly format — nested structure
        if (Object.values(value)[0] && typeof Object.values(value)[0] === "object") {
            Object.values(value).forEach(location => {
                result["Expenditure"] += parseInt(location["Expenditure"] || 0);
                result["No. of Beneficiaries"] += parseInt(location["No. of Beneficiaries"] || 0);
            });
        } else {
            // Monthly format — flat structure
            result["Expenditure"] += parseInt(value["Expenditure"] || 0);
            result["No. of Beneficiaries"] += parseInt(value["No. of Beneficiaries"] || 0);
        }
    });

    return result;
};

//club all type of environmentdata for table
const clubEmissions = (data, moduleType) => {
    let total = 0;

    Object.keys(data || {}).forEach(key => {
        if (key === "year" || key === "type") return;

        const monthData = data[key];
        if (typeof monthData !== "object") return;

        Object.values(monthData).forEach(locationData => {
            if (typeof locationData === "number") {
                total += locationData;
            } else if (typeof locationData === "object") {
                Object.values(locationData).forEach(category => {
                    if (typeof category === "number") {
                        total += category;
                    } else if (typeof category === "object") {
                        Object.values(category).forEach(value => {
                            if (typeof value === "number") {
                                total += value;
                            }
                        });
                    }
                });
            }
        });
    });

    return {
        total
    };
};

const clubTrainingEducation = (trainingData) => {
    const subGroups = new Set(); // like BOD, Workers, etc.
    const totals = {}; // { "POSH training": total, ... }
  
    for (const branch in trainingData) {
      const branchTraining = trainingData[branch]?.["Training and Edu"];
      if (!branchTraining) continue;
  
      for (const group in branchTraining) {
        subGroups.add(group);
        const trainingFields = branchTraining[group];
  
        for (const training in trainingFields) {
          const count = trainingFields[training];
          if (count !== null && !isNaN(count)) {
            if (!totals[training]) {
              totals[training] = 0;
            }
            totals[training] += count;
          }
        }
      }
    }
  
    return {
      groups: Array.from(subGroups),
      totals
    };
  };
  
  

//get All Needed values
const getData = async (year, userData, type, month) => {
    const dataResult = {};
    try {
      const domain = userData?.username.split("@");
      const basePath = [domain[1], "AnalyticsData", "Reporting Data"];
  
      const collectionRef = collection(firestore, ...basePath);
      const q = query(collectionRef, where("year", "==", year));
      const querySnapshot = await getDocs(q);
  
      for (const docSnap of querySnapshot.docs) {
        const docData = docSnap.data();
        const module = docData?.type;
        let processedData = null;
  
        const isEmissionModule = scopeData.hasOwnProperty(module);
  
        if (type === "year") {
          let allMonthsData = {};
  
          for (let m = 1; m <= 12; m++) {
            if (docData[m]) {
              allMonthsData = {
                ...allMonthsData,
                ...docData[m],
              };
            }
          }
  
          if (isEmissionModule) {
            processedData = clubEmissions(docData, module);
          } else {
            switch (module) {
              case "Child Labor":
                processedData = clubChildLaborData(allMonthsData);
                break;
              case "CHS":
                processedData = clubCHSData(allMonthsData);
                break;
              case "Market Presence":
                processedData = clubMarketPresence(allMonthsData);
                break;
              case "Social Benefits":
                processedData = clubSocialBenefits(allMonthsData);
                break;
                case "Social-Overview": {
                    let trainingEduData = {};
                  
                    for (let m = 1; m <= 12; m++) {
                      const monthData = docData?.[m];
                      if (!monthData) continue;
                  
                      for (const branch in monthData) {
                        const branchData = monthData[branch];
                        const monthTraining = branchData?.["Training and Edu"];
                        if (!monthTraining) continue;
                  
                        // Initialize if branch not seen before
                        if (!trainingEduData[branch]) {
                          trainingEduData[branch] = { "Training and Edu": {} };
                        }
                  
                        const existing = trainingEduData[branch]["Training and Edu"];
                  
                        for (const group in monthTraining) {
                          if (!existing[group]) {
                            existing[group] = {};
                          }
                  
                          const trainingFields = monthTraining[group];
                  
                          for (const field in trainingFields) {
                            const value = trainingFields[field];
                            if (!existing[group][field]) {
                              existing[group][field] = 0;
                            }
                            if (value !== null && !isNaN(value)) {
                              existing[group][field] += value;
                            }
                          }
                        }
                      }
                    }
                  
                    if (Object.keys(trainingEduData).length > 0) {
                      const processedTraining = clubTrainingEducation(trainingEduData);
                      if (processedTraining && Object.keys(processedTraining).length > 0) {
                        dataResult["Training and Edu"] = processedTraining;
                      }
                    }
                    continue;
                  }
                  
            }
          }
  
        } else {
          // Monthly type === "month"
          const monthData = docData?.[month];
          if (!monthData || Object.keys(monthData).length === 0) continue;
  
          if (isEmissionModule) {
            processedData = clubEmissions(docData, module);
          } else {
            switch (module) {
              case "Child Labor":
                processedData = clubChildLaborData(monthData);
                break;
              case "CHS":
                processedData = clubCHSData(monthData);
                break;
              case "Market Presence":
                processedData = clubMarketPresence(monthData);
                break;
              case "Social Benefits":
                processedData = clubSocialBenefits(monthData);
                break;
              case "Social-Overview": {
                let trainingEduData = {};
  
                for (const branch in monthData) {
                  const branchData = monthData[branch];
                  if (branchData?.["Training and Edu"]) {
                    trainingEduData[branch] = {
                      "Training and Edu": branchData["Training and Edu"],
                    };
                  }
                }
  
                if (Object.keys(trainingEduData).length > 0) {
                  const processedTraining = clubTrainingEducation(trainingEduData);
                  if (processedTraining && Object.keys(processedTraining).length > 0) {
                    dataResult["Training and Edu"] = processedTraining;
                  }
                }
  
                continue;
              }
            }
          }
        }
  
        if (processedData && Object.keys(processedData).length > 0) {
          dataResult[module] = processedData;
        }
      }
  
      return dataResult;
    } catch (error) {
      console.error("Error fetching data:", error);
      return {};
    }
  };
  


// Function to generate the DOCX file
const generateDocx = async (master, year, userData, type = "year",month=1,chartImages) => {
    let DataObj = await getData(year, userData, type, Number(month));
    console.log("data", DataObj);
    // console.log("check2",environmentalData)

    const docContent = [
        new Paragraph({ text: "ESG Report", heading: "Title" }),

        // Organization Details
        new Paragraph({ text: "Organization Details", heading: "Heading1" }),
        new Paragraph(`Name of the Organization: ${master.organisationName}`),
        new Paragraph(`Year: ${year}`),
        new Paragraph(`Country: ${master?.country}`),
        new Paragraph(`Framework: ${master?.reportingType?.join(", ")}`),

        // Environmental Section
        horizontalLine,
        new Paragraph(""),
        // Generate Environmental Table using DataObj
new Paragraph(""),
new Paragraph({ text: "Environmental Data (E)", heading: "Heading1", bold: true }),

new Table({
    width: { size: 100, type: "pct" },
    columnWidths: [2000, 5000, 3000],
    rows: [
        new TableRow({
            children: [
                new TableCell({ children: [new Paragraph("Scopes")] }),
                new TableCell({ children: [new Paragraph("Category")] }),
                new TableCell({ children: [new Paragraph("Emission (kg CO₂)")] }),
            ],
        }),
        ...Object.entries(DataObj)
            .filter(([category, val]) => scopeData.hasOwnProperty(category))
            .map(([category, val]) =>
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph(scopeData[category] || "Unknown Scope")],
                        }),
                        new TableCell({
                            children: [new Paragraph(category)],
                        }),
                        new TableCell({
                            children: [new Paragraph(val.total.toFixed(4))],
                        }),
                    ],
                })
            ),
    ],
}),
new Paragraph(""),
horizontalLine,
new Paragraph(""),


        // Social Section
        new Paragraph({ text: "Social Data (S)", heading: "Heading1", bold: true }),
        new Paragraph(""),
    ];

    if (DataObj["Training and Edu"]) {
        const trainingData = DataObj["Training and Edu"];
        const totalTrainings = Object.values(trainingData.totals).reduce((sum, val) => sum + val, 0);
        
        const nonZeroTopics = Object.entries(trainingData.totals)
            .filter(([_, val]) => val > 0)
            .map(([topic]) => topic.toLowerCase());
    
        const topicsSentence = nonZeroTopics.join(", ");
    
        docContent.push(
            new Paragraph({
                text: "Training and Education",
                heading: "Heading2",
                bold: true,
                color: "000000",
            }),
            new Paragraph(`The company places a strong emphasis on training for all members of the organization, including the Board of Directors, employees, and workers. It strives to conduct as many training sessions as possible within each reporting period. A total of ${totalTrainings} training sessions were conducted during the reporting period, focusing on topics such as ${topicsSentence}.`),
            new Paragraph("")
        );
    }
    if (chartImages?.Training) {
      const base64Image = chartImages.Training.split(",")[1];
      const imageBuffer = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0));
  
      docContent.push(
          new Paragraph({
              children: [
                  new ImageRun({
                      data: imageBuffer,
                      transformation: {
                          width: 600,
                          height: 350,
                      },
                  }),
              ],
          }),
          new Paragraph("")
      );
  }
  
    
    // Child Labor (dynamic)
    if (DataObj["Child Labor"]) {
        const child = DataObj["Child Labor"];
        const childText = Object.entries(child)
            .filter(([_, val]) => val > 0)
            .map(([level, count]) => `${count} ${level.toLowerCase()} level`)
            .join(", ");

        docContent.push(
            new Paragraph({
                text: "Child Labor",
                heading: "Heading2",
                bold: true,
                color: "000000",
            }),
            new Paragraph(`There were ${childText} cases of child labour identified, highlighting the need for stricter monitoring and compliance with labour laws to uphold ethical supply chain practices.`),
            new Paragraph("")
        );
    }

    // CHS (Customer Health & Safety) - dynamic
    if (DataObj["CHS"]) {
        const chs = DataObj["CHS"];
        docContent.push(
            new Paragraph({
                text: "Customer Health and Safety",
                heading: "Heading2",
                bold: true,
                color: "000000",
            }),
            new Paragraph(`During the reporting period, a total of ${chs["No. of non-compliance Incidents"] || 0} non-compliance incidents related to customer health and safety were recorded, affecting ${chs["Customers Impacted"] || 0} customers. This underscores the importance of continuous improvement in safeguarding consumer interests.`),
            new Paragraph("")
        );
    }

    // Social Benefits 
    if (DataObj["Social Benefits"]) {
        const social = DataObj["Social Benefits"];
        docContent.push(
            new Paragraph({ text: "Social Benefits", heading: "Heading2", bold: true }),
            new Paragraph("The company provides various social benefits, reinforcing its commitment to employee welfare and community development."),
            new Paragraph(`With an investment of ₹${social["Expenditure"]}, the initiative has successfully impacted ${social["No. of Beneficiaries"]} individuals, fostering tangible improvements and driving meaningful progress in the area.`),
            new Paragraph("")
        );
    }


    // Governance
    docContent.push(
        new Paragraph({ text: "Governance Data (G)", heading: "Heading1" }),
        new Paragraph("")
    );
    

    // Market Presence 
    if (DataObj["Market Presence"]) {
        const mp = DataObj["Market Presence"];
        docContent.push(
            new Paragraph({
                text: "Market Presence",
                heading: "Heading2",
                bold: true,
                color: "000000",
            }),
            new Paragraph(`Markets served by the entity: ${mp["Markets served by the entity nationally"] || 0} nationally, ${mp["Markets served by the entity internationally"] || 0} internationally.`),
            // new Paragraph(`The reported value of operations is ₹${mp["Values"].toFixed(2)} during the reporting period.`),
            new Paragraph("")
        );
    }

    // Final Document
    const doc = new Document({
        sections: [
            {
                children: docContent
            }
        ]
    });

    Packer.toBlob(doc).then(blob => {
        saveAs(blob, "ESG_Report.docx");
    });
};


export default generateDocx;
