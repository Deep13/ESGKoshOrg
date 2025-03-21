import { useState, useEffect } from "react";
import { useSidebar } from "../context/SidebarContext";
import { firestore } from "../firebase";
import { getDoc, doc, collection,getDocs,setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import modalIcon from "../assets/modalIcon.png"
import generateDocx from "../components/DocxStruct"

const Admin = () => {
  const [tableInfo, setTableInfo] = useState();
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [noticeModal,setNoticeModal] = useState(false);
  const [noticeModalText,setNoticeModalText] = useState("");
  const [terminateModal, setTerminateModal] = useState(false);
  const [loading,setLoading] = useState(false);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const { master, userData, sheets,module,fullTotalPercentage,setMaster } = useSidebar();
  const [action, setAction] = useState(master?.currentReportingCycle?.status);
  const [noData,setNoData] = useState(false);
  

  const getData = async (domain) => {
    setLoading(true)
    try {
      console.log(domain);
      const docRef = doc(firestore, domain[1], "Master Data", "Reporting Cycle", "All Cycle");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Document Data:", data);

        // Convert the data into an array of objects with the required structure
        const formattedData = Object.values(data).map((entry) => ({
          monthYear: `${entry.month}-${entry.year}`,
          startDate: new Date(entry.startedAt.seconds * 1000).toLocaleDateString(),
          endDate: new Date(entry.closedAt.seconds * 1000).toLocaleDateString(),
        }));

        // Set the formatted data to tableInfo
        setTableInfo(formattedData);
        setLoading(false)
      } else {
        console.log("No such document!");
        setNoData(true);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const calculateEmissions = (selectedVariant,moduleName) => {
    let totalEmissions = 0;
    let bifurcatedEmissions = { Type: {} }; // For modules grouped by Type
    let activityEmissions = { Activity: {} }; // For modules grouped by Activity
    let disposalMethodEmissions = { DisposalMethod: {}, Activity: {} }; // For Waste Disposal (grouped by Disposal Method)
    let level2Emissions = { Level2: {} }; // For Owned Vehicles (grouped by Level 2)
    let vehiclesEmissions = { Vehicles: {} }; // For Freighting goods, Business travel land and sea, Employee commuting
    
    const checkValue = (value) => {
        return (value === undefined || value === "--") ? "Unknown" : value;
    };

    console.log("slecting",selectedVariant)

    switch (moduleName) {
        case "Fuel":
        case "Bioenergy":
        case "WTT- fuels":
        case "Water":
            selectedVariant.data.map((item) => {
                const type = checkValue(item.Type);
                const amount = parseFloat(item.Amount) || 0;
                const factor = parseFloat(item.Factor) || 0;
                const emission = amount * factor;

                if (!bifurcatedEmissions.Type[type]) {
                    bifurcatedEmissions.Type[type] = 0;
                }

                bifurcatedEmissions.Type[type] += emission;
            });

            console.log("bug",selectedVariant,bifurcatedEmissions)

            return bifurcatedEmissions;

       
        case "Elec heat cooling":
        selectedVariant.data.map((item) => {
            const countryType = item["Country Type"] || "Unknown"; // Using Country Type
            const activity = item.Activity || "Unknown"; // Activity filter
            const amount = parseFloat(item.Amount || 0);
            const gefFactor = parseFloat(item["GEF Factors"] || 0);
            const tdFactor = parseFloat(item["T&D Factors"] || 0);
            const emission = amount * gefFactor + amount * tdFactor;

            // Group by Country Type
            if (!bifurcatedEmissions.CountryType) {
                bifurcatedEmissions.CountryType = {};
            }
            if (!bifurcatedEmissions.CountryType[countryType]) {
                bifurcatedEmissions.CountryType[countryType] = 0;
            }
            bifurcatedEmissions.CountryType[countryType] += emission;

            // Group by Activity
            if (!activityEmissions.Activity) {
                activityEmissions.Activity = {};
            }
            if (!activityEmissions.Activity[activity]) {
                activityEmissions.Activity[activity] = 0;
            }
            activityEmissions.Activity[activity] += emission;
        });

        return {
            CountryType: bifurcatedEmissions.CountryType,
            Activity: activityEmissions.Activity
        };


        case "Materials":
            selectedVariant.data.map((item) => {
                const activity = checkValue(item.Activity);
                const amount = parseFloat(item["Amount (tonnes)"]) || 0;
                const factor = parseFloat(item.Factor) || 0;
                const emission = amount * factor;

                if (!activityEmissions.Activity[activity]) {
                    activityEmissions.Activity[activity] = 0;
                }

                activityEmissions.Activity[activity] += emission;
            });

            return activityEmissions;

        case "Waste Disposal":
            selectedVariant.data.map((item) => {
                const disposalMethod = checkValue(item["Disposal Method"]);
                const weight = parseFloat(item.Weight) || 0;
                const factor = parseFloat(item.Factor) || 0;
                const emission = weight * factor;

                // Ensure DisposalMethod is defined
                if (!disposalMethodEmissions.DisposalMethod[disposalMethod]) {
                    disposalMethodEmissions.DisposalMethod[disposalMethod] = 0;
                }
                disposalMethodEmissions.DisposalMethod[disposalMethod] += emission;
                
                // Ensure Activity is defined
                const activity = checkValue(item.Activity);
                if (!disposalMethodEmissions.Activity[activity]) {
                    disposalMethodEmissions.Activity[activity] = 0;
                }

                disposalMethodEmissions.Activity[activity] += emission;
            });

            return disposalMethodEmissions;

        case "Owned Vehicles":
            selectedVariant.data.map((item) => {
                const level2 = checkValue(item["Level 2"]);
                const distance = parseFloat(item["Distance (km)"]) || 0;
                const factor = parseFloat(item.Factor) || 0;
                const emission = distance * factor;

                if (!level2Emissions.Level2[level2]) {
                    level2Emissions.Level2[level2] = 0;
                }

                level2Emissions.Level2[level2] += emission;
            });

            return level2Emissions;

        case "Freighting goods":
        case "Business travel - land and sea":
        case "Employees commuting":
            selectedVariant.data.map((item) => {
                const vehicle = checkValue(item.Vehicle);
                const distance = parseFloat(item["Distance (km)"]) || 0;
                const factor = parseFloat(item.Factor) || 0;
                const emission = distance * factor;

                if (!vehiclesEmissions.Vehicles[vehicle]) {
                    vehiclesEmissions.Vehicles[vehicle] = 0;
                }

                vehiclesEmissions.Vehicles[vehicle] += emission;
            });

            return vehiclesEmissions;

        case "Flight":
            selectedVariant.data.map((item) => {
                totalEmissions += parseFloat(item.co2e) || 0;
            });
            break;

        case "Home Office":
            selectedVariant.data.map((item) => {
                totalEmissions += (parseFloat(item["Working regime (For full-time)"]) || 0) * 
                                   (parseFloat(item["Number of months"]) || 0) * 
                                   (parseFloat(item.Factor) || 0) + 
                                  ((parseFloat(item["Working from home"]) || 0) / 2) * 
                                   (parseFloat(item["Number of months"]) || 0) * 
                                   (parseFloat(item.Factor) || 0);
            });
            break;

        default:
            break;
    }

    return { total: totalEmissions }; 
};

const getModuleCategory = (moduleName, moduleCategories)=> {
  if (moduleCategories.Environment.includes(moduleName)) {
      return "Environment";
  } else if (moduleCategories.Social.includes(moduleName)) {
      return "Social";
  } else if (moduleCategories.Governance.includes(moduleName)) {
      return "Governance";
  }
  return "Unknown"; // Fallback if the module doesn't match any category
}

  const groupSubmittedModulesByBranch=async()=>{
    let branchWiseData = {};
    var moduleCategories=sheets;
    var data=await fetchData();

    console.log("fetched test",data)

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
    // Iterate over each module in the data
    data.map((moduleData) => {
        // Get module name (the key of the first object inside the module data)
        const moduleName = Object.keys(moduleData)[0];
        const moduleCategory = getModuleCategory(moduleName, moduleCategories); // Get module category (Environment, Social, Governance)
        const branches = moduleData[moduleName];

        // Iterate over each branch in the module
        Object.keys(branches).map((branch) => {
            const branchData = branches[branch];

            // Only add modules that have the status "Submitted"
            if (branchData.status === "Submitted") {
                // If the branch does not exist in the result, initialize it
                if (!branchWiseData[branch]) {
                    branchWiseData[branch] = {
                        modules: {},
                        Overview: {
                            TotalEmissions: 0,
                            Water: 0,
                            Waste: 0,
                            Biodiversity: 0,   // Initialize Biodiversity
                            Beneficiaries: 0,  // Initialize Beneficiaries
                            GenderSplit: 0,     // Initialize GenderSplit
                            SocialSpend: 0,
                            AgeCount: {
                                "50+": 0,        // Initialize age group counts
                                "35 to 50": 0,
                                "22 to 35": 0,
                                "Less than 22": 0
                            },      // Initialize AgeCount
                            GenderCount: { "Male": 0, "Female": 0, "Others": 0 },
                            Scope: {           // Initialize Scope totals
                                "Scope 1": 0,
                                "Scope 2": 0,
                                "Scope 3": 0
                            }
                        },
                        Environment: {
                            "Overview": {
                                TotalEmissions: 0,
                                "Scope 1": 0,
                                "Scope 2": 0,
                                "Scope 3": 0,
                                Water: 0,
                                "Water Stress": 0,
                                Waste: 0,
                                Scope: {
                                    "Scope 1": 0,
                                    "Scope 2": 0,
                                    "Scope 3": 0
                                }
                            },        // Add new Environment key in the branch
                            "Scope 1": {
                                "Scope 1": 0,
                                "Bioenergy": 0,
                                "Fuels": 0,
                                "Owned Vehicles": 0,
                                "Refrigerant": 0,
                                Emission: {
                                },
                                BioenergySplit: {}

                            },      // Initialize Scope 1, 2, 3 for Environment
                            "Scope 2": {
                                "Scope 2": 0,
                                "District Cooling": 0,
                                "Electricity": 0,
                                "Heat and steam": 0,
                                "Electricity - Backup": 0,
                                "Owned Vehicles": 0,
                                Activities: {
                                },
                                Emission: {}

                            },
                            "Scope 3": {
                                "Scope 3": 0,
                                "Business travel - land and sea": 0,
                                "Employees commuting": 0,
                                "Flight": 0,
                                "Freighting goods": 0,
                                "Materials": 0,
                                "Waste Disposal": 0,
                                "WTT- fuels": 0,
                                Emission: {
                                }

                            }
                        },
                        Social: {
                            "Overview": {
                                Headcount: 0,
                                "Female:Male": 0,
                                "Total training Hrs": 0,
                                "CSR Spend": 0,
                                Attrition: 0,
                                Retention: 0,
                                EmployementType: {},
                                Gender: {},
                                GenderForInjuries: {},
                                ChildLabor: {},
                                Training: {},
                                InjuryType: {},
                                ChildLaborSupplier: {},
                                TrainingType: {},
                            },
                            "PrivacyOthers": {
                                "Complaints": {
                                },
                                "CHS": {
                                },
                                "Mktg and Labelling": {
                                },
                                "SocialEx": {
                                },
                                "SocialBe": {
                                }
                            }
                        },
                        Governance: {
                            "Overview": {
                                BODs: 0,
                                "BODSFemale": 0,
                                "CFO/CEO": 0,
                                "CFO/CEO-Female": 0,
                                "Independent Directors": 0,
                                Revenue: 0,
                                Turnover: 0,
                                Gender: {},
                                EntityType: {}
                            }
                        }
                    };
                }

                // Add the module data to the corresponding branch, along with its category
                branchWiseData[branch].modules[moduleName] = {
                    ...branchData,
                    category: moduleCategory, // Add the module category (Environment, Social, Governance)
                    scope: scopeData[moduleName] || ""
                };
                console.log("ab",moduleCategory)
                // If the module belongs to the "Environment" category, calculate and add its emissions
                if (moduleCategory === "Environment") {
                    console.log("Inhere");
                    const emissions = calculateEmissions(branchData,moduleName);
                    console.log("em",emissions)
                    branchWiseData[branch].Overview.TotalEmissions += emissions;
                    const scope = scopeData[moduleName];
                    if (scope) {
                        if (moduleName == "Owned Vehicles") {
                            branchData.data.map(val => {
                                branchWiseData[branch].Overview.Scope[val.Scope] += parseFloat(val["Distance (km)"]) * parseFloat(val.Factor);
                            })
                        }
                        else {
                            branchWiseData[branch].Overview.Scope[scope] += emissions;
                        }
                    }
                    // branchData.data.forEach(item => {
                    branchWiseData[branch].Environment[scope].Emission[moduleName] = (branchWiseData[branch].Environment[scope].Emission[moduleName] || 0) + emissions;
                    // });
                    if (moduleName === "Water") {
                        branchWiseData[branch].Overview.Water += emissions;
                        branchWiseData[branch].Environment.Overview.Water += emissions;
                        branchWiseData[branch].Environment["Scope 3"].Water = (branchWiseData[branch].Environment["Scope 3"].Water || 0) + emissions;
                    }
                    if (moduleName === "Accommodation") {
                        branchWiseData[branch].Environment["Scope 3"].Accommodation = (branchWiseData[branch].Environment["Scope 3"].Accommodation || 0) + emissions;
                    }
                    if (moduleName === "Food") {
                        branchWiseData[branch].Environment["Scope 3"].Food = (branchWiseData[branch].Environment["Scope 3"].Food || 0) + emissions;
                    }
                    if (moduleName === "Home Office") {
                        branchWiseData[branch].Environment["Scope 3"]["Home Office"] = (branchWiseData[branch].Environment["Scope 3"]["Home Office"] || 0) + emissions;
                    }

                    if (moduleName === "Elec heat cooling") {
                        branchData.data.forEach(item => {
                            if (branchWiseData[branch].Environment["Scope 2"][item.Activity]) {
                                branchWiseData[branch].Environment["Scope 2"][item.Activity] += (parseFloat(item.Amount) * (parseFloat(item["GEF Factors"])) + (parseFloat(item.Amount) * parseFloat(item["T&D Factors"])));
                            }
                            else {
                                branchWiseData[branch].Environment["Scope 2"][item.Activity] = (parseFloat(item.Amount) * (parseFloat(item["GEF Factors"])) + (parseFloat(item.Amount) * parseFloat(item["T&D Factors"])))
                            }
                            if (branchWiseData[branch].Environment["Scope 2"].Activities[item.Activity]) {
                                branchWiseData[branch].Environment["Scope 2"].Activities[item.Activity] += (parseFloat(item.Amount) * (parseFloat(item["GEF Factors"])) + (parseFloat(item.Amount) * parseFloat(item["T&D Factors"])));
                            }
                            else {
                                branchWiseData[branch].Environment["Scope 2"].Activities[item.Activity] = (parseFloat(item.Amount) * (parseFloat(item["GEF Factors"])) + (parseFloat(item.Amount) * parseFloat(item["T&D Factors"])))
                            }
                        });
                    }
                    if (moduleName === "Waste Disposal") {
                        branchWiseData[branch].Overview.Waste += emissions;
                        branchWiseData[branch].Environment.Overview.Waste += emissions;
                    }
                    if (moduleName === "Bioenergy") {
                        branchWiseData[branch].Environment["Scope 1"].Bioenergy += emissions;
                        branchData.data.forEach(item => {
                            if (branchWiseData[branch].Environment["Scope 1"].BioenergySplit[item.Type]) {
                                branchWiseData[branch].Environment["Scope 1"].BioenergySplit[item.Type] += parseFloat(item.Amount) * parseFloat(item.Factor);
                            }
                            else {
                                branchWiseData[branch].Environment["Scope 1"].BioenergySplit[item.Type] = parseFloat(item.Amount) * parseFloat(item.Factor)
                            }
                        });

                    }
                    if (moduleName === "Fuel") {
                        branchWiseData[branch].Environment["Scope 1"].Fuels += emissions;
                    }
                    if (moduleName === "Owned Vehicles") {
                        branchData.data.map(val => {
                            branchWiseData[branch].Environment[val.Scope]["Owned Vehicles"] += parseFloat(val["Distance (km)"]) * parseFloat(val.Factor);
                        })
                    }
                    if (moduleName === "Refrigerant and other") {
                        branchWiseData[branch].Environment["Scope 1"]["Refrigerant"] += emissions;
                    }
                    if (moduleName === "Business travel - land and sea") {
                        branchWiseData[branch].Environment["Scope 3"]["Business travel - land and sea"] += emissions;
                    }
                    if (moduleName === "Employees commuting") {
                        branchWiseData[branch].Environment["Scope 3"]["Employees commuting"] += emissions;
                    }
                    if (moduleName === "Flight") {
                        branchWiseData[branch].Environment["Scope 3"]["Flight"] += emissions;
                    }
                    if (moduleName === "Freighting goods") {
                        branchWiseData[branch].Environment["Scope 3"]["Freighting goods"] += emissions;
                    }
                    if (moduleName === "Materials") {
                        branchWiseData[branch].Environment["Scope 3"]["Materials"] += emissions;
                    } if (moduleName === "Waste Disposal") {
                        branchWiseData[branch].Environment["Scope 3"]["Waste Disposal"] += emissions;
                    } if (moduleName === "WTT- fuels") {
                        branchWiseData[branch].Environment["Scope 3"]["WTT- fuels"] += emissions;
                    }




                    // if (scope == "Scope 1") {
                    //     if (branchWiseData[branch].Environment["Scope 1"].Emission[moduleName]) {
                    //         if (moduleName === "Owned Vehicles") {
                    //             branchData.data.map(val => {
                    //                 branchWiseData[branch].Environment["Scope 1"].Emission[moduleName] += parseFloat(val["Distance (km)"]) * parseFloat(val.Factor);
                    //             })
                    //         }
                    //         else {
                    //             branchWiseData[branch].Environment["Scope 1"].Emission[moduleName] += emissions;
                    //         }
                    //     }
                    //     else {
                    //         branchWiseData[branch].Environment["Scope 1"].Emission[moduleName] = emissions
                    //     }


                    // }
                    // if (scope == "Scope 3") {
                    //     if (branchWiseData[branch].Environment["Scope 3"].Emission[moduleName]) {
                    //         branchWiseData[branch].Environment["Scope 3"].Emission[moduleName] += emissions;
                    //     }
                    //     else {
                    //         branchWiseData[branch].Environment["Scope 3"].Emission[moduleName] = emissions
                    //     }


                    // }

                    let waterStress = 0;
                    branchData.data.forEach(item => {
                        // Gender Count logic
                        if (item.Type === "Water Drainage") {
                            waterStress += parseFloat(item.Amount) || 0;
                        }
                    });
                    branchWiseData[branch].Environment.Overview["Water Stress"] += waterStress;
                }
                // If the module belongs to the "Social" category and is "Social Benefits", sum "No. of Beneficiaries" and "Expenditure"
                if (moduleCategory === "Social") {
                    if (moduleName === "Social Benefits") {
                        branchData.data.forEach(item => {
                            branchWiseData[branch].Overview.Biodiversity += parseFloat(item["No. of Beneficiaries"]) || 0;
                            branchWiseData[branch].Overview.Beneficiaries += parseFloat(item.Expenditure) || 0;
                            branchWiseData[branch].Overview.SocialSpend += parseFloat(item.Expenditure) || 0;
                            branchWiseData[branch].Social["Overview"]["CSR Spend"] += parseFloat(item.Expenditure) || 0;
                            if (branchWiseData[branch].Social["PrivacyOthers"]["SocialEx"][item["Domain"]]) {
                                branchWiseData[branch].Social["PrivacyOthers"]["SocialEx"][item["Domain"]] += parseFloat(item["Expenditure"]) || 0;
                            }
                            else {
                                branchWiseData[branch].Social["PrivacyOthers"]["SocialEx"][item["Domain"]] = parseFloat(item["Expenditure"]) || 0;
                            }
                            if (branchWiseData[branch].Social["PrivacyOthers"]["SocialBe"][item["Domain"]]) {
                                branchWiseData[branch].Social["PrivacyOthers"]["SocialBe"][item["Domain"]] += parseFloat(item["No. of Beneficiaries"]) || 0;
                            }
                            else {
                                branchWiseData[branch].Social["PrivacyOthers"]["SocialBe"][item["Domain"]] = parseFloat(item["No. of Beneficiaries"]) || 0;
                            }

                        });
                    }
                    if (moduleName === "Training and Edu") {
                        branchData.data.forEach(item => {
                            branchWiseData[branch].Social["Overview"]["Total training Hrs"] += parseFloat(item["Avg Hours per batch"]) || 0;
                        });
                    }
                    if (moduleName === "Retention") {
                        branchData.data.forEach(item => {
                            branchWiseData[branch].Social["Overview"]["Attrition"] += parseFloat(item["Head Count"]) || 0;
                        });
                    }
                    if (moduleName === "Child Labor") {
                        branchData.data.forEach(item => {
                            if (branchWiseData[branch].Social["Overview"]["ChildLabor"][item["Risk Level"]]) {
                                branchWiseData[branch].Social["Overview"]["ChildLabor"][item["Risk Level"]] += parseFloat(item["No. of Incidents reported"]) || 0;
                            }
                            else {
                                branchWiseData[branch].Social["Overview"]["ChildLabor"][item["Risk Level"]] = parseFloat(item["No. of Incidents reported"]) || 0;
                            }
                            if (branchWiseData[branch].Social["Overview"]["ChildLaborSupplier"][item["Risk Level"]]) {
                                branchWiseData[branch].Social["Overview"]["ChildLaborSupplier"][item["Risk Level"]] += parseFloat(item["Supplier Name"]) || 0;
                            }
                            else {
                                branchWiseData[branch].Social["Overview"]["ChildLaborSupplier"][item["Risk Level"]] = parseFloat(item["Supplier Name"]) || 0;
                            }
                        });
                    }
                    if (moduleName === "Customer Privacy") {
                        branchData.data.forEach(item => {
                            if (branchWiseData[branch].Social["PrivacyOthers"]["Complaints"][item["Nature of Complaints"]]) {
                                branchWiseData[branch].Social["PrivacyOthers"]["Complaints"][item["Nature of Complaints"]]["No. of complaints received"] += parseFloat(item["No. of complaints received"]);
                                branchWiseData[branch].Social["PrivacyOthers"]["Complaints"][item["Nature of Complaints"]]["No. of complaints solved"] += parseFloat(item["No. of complaints solved"]);

                            }
                            else {
                                branchWiseData[branch].Social["PrivacyOthers"]["Complaints"][item["Nature of Complaints"]] = {
                                    "No. of complaints received": parseFloat(item["No. of complaints received"]) || 0,
                                    "No. of complaints solved": parseFloat(item["No. of complaints solved"]) || 0
                                }
                            }
                        });
                    }
                    if (moduleName === "CHS") {
                        branchData.data.forEach(item => {
                            if (branchWiseData[branch].Social["PrivacyOthers"]["CHS"][item["Type of Incident"]]) {
                                branchWiseData[branch].Social["PrivacyOthers"]["CHS"][item["Type of Incident"]]["No. of non-compliance Incidents"] += parseFloat(item["No. of non-compliance Incidents"]);
                                branchWiseData[branch].Social["PrivacyOthers"]["CHS"][item["Type of Incident"]]["Customers Impacted"] += parseFloat(item["Customers Impacted"]);

                            }
                            else {
                                branchWiseData[branch].Social["PrivacyOthers"]["CHS"][item["Type of Incident"]] = {
                                    "No. of non-compliance Incidents": parseFloat(item["No. of non-compliance Incidents"]) || 0,
                                    "Customers Impacted": parseFloat(item["Customers Impacted"]) || 0
                                }
                            }
                        });
                    }
                    if (moduleName === "Mktg and Labelling") {
                        branchData.data.forEach(item => {
                            if (branchWiseData[branch].Social["PrivacyOthers"]["Mktg and Labelling"][item["Incident"]]) {
                                branchWiseData[branch].Social["PrivacyOthers"]["Mktg and Labelling"][item["Incident"]]["No. of non-compliance Incidents"] += parseFloat(item["No. of non-compliance Incidents"]);
                                branchWiseData[branch].Social["PrivacyOthers"]["Mktg and Labelling"][item["Incident"]]["No. of times regulation violated"] += parseFloat(item["No. of times regulation violated"]);

                            }
                            else {
                                branchWiseData[branch].Social["PrivacyOthers"]["Mktg and Labelling"][item["Incident"]] = {
                                    "No. of non-compliance Incidents": parseFloat(item["No. of non-compliance Incidents"]) || 0,
                                    "No. of times regulation violated": parseFloat(item["No. of times regulation violated"]) || 0
                                }
                            }
                        });
                    }
                    if (moduleName === "Training and Edu") {
                        branchData.data.forEach(item => {
                            if (branchWiseData[branch].Social["Overview"]["Training"][item["Segment"]]) {
                                branchWiseData[branch].Social["Overview"]["Training"][item["Segment"]] += parseFloat(item["Head Count"]) || 0;
                            }
                            else {
                                branchWiseData[branch].Social["Overview"]["Training"][item["Segment"]] = parseFloat(item["Head Count"]) || 0;
                            }

                            if (branchWiseData[branch].Social["Overview"]["TrainingType"][item["Types of training"]]) {
                                branchWiseData[branch].Social["Overview"]["TrainingType"][item["Types of training"]] += parseFloat(item["Financial investment"]) || 0;
                            }
                            else {
                                branchWiseData[branch].Social["Overview"]["TrainingType"][item["Types of training"]] = parseFloat(item["Financial investment"]) || 0;
                            }
                        });
                    }
                    if (moduleName === "OH and S") {
                        branchData.data.forEach(item => {
                            if (branchWiseData[branch].Social["Overview"]["GenderForInjuries"][item["Gender"]]) {
                                branchWiseData[branch].Social["Overview"]["GenderForInjuries"][item["Gender"]] += parseFloat(item["Head Count"]) || 0;
                            }
                            else {
                                branchWiseData[branch].Social["Overview"]["GenderForInjuries"][item["Gender"]] = parseFloat(item["Head Count"]) || 0;
                            }

                            if (branchWiseData[branch].Social["Overview"]["InjuryType"][item["Injury Type"]]) {
                                branchWiseData[branch].Social["Overview"]["InjuryType"][item["Injury Type"]] += parseFloat(item["Number of Incidents"]) || 0;
                            }
                            else {
                                branchWiseData[branch].Social["Overview"]["InjuryType"][item["Injury Type"]] = parseFloat(item["Number of Incidents"]) || 0;
                            }
                        });
                    }
                    if (moduleName === "Employment") {
                        branchData.data.forEach(item => {
                            if (branchWiseData[branch].Social["Overview"]["EmployementType"][item["Employment Type"]]) {
                                branchWiseData[branch].Social["Overview"]["EmployementType"][item["Employment Type"]] += parseFloat(item["Head Count"]) || 0;
                            }
                            else {
                                branchWiseData[branch].Social["Overview"]["EmployementType"][item["Employment Type"]] = parseFloat(item["Head Count"]) || 0
                            }
                            if (branchWiseData[branch].Social["Overview"]["Gender"][item["Gender"]]) {
                                branchWiseData[branch].Social["Overview"]["Gender"][item["Gender"]] += parseFloat(item["Head Count"]) || 0;
                            }
                            else {
                                branchWiseData[branch].Social["Overview"]["Gender"][item["Gender"]] = parseFloat(item["Head Count"]) || 0
                            }
                        });
                    }
                }
                // If the module is "Entity" and category is "Governance", calculate the GenderSplit
                // If the module is "Entity" and category is "Governance", calculate GenderSplit, AgeCount, and GenderCount
                // If the module is "Entity" and category is "Governance", calculate GenderSplit, AgeCount, and GenderCount
                if (moduleCategory === "Governance") {
                    if (moduleName === "Entity") {
                        let femaleCount = 0;
                        let maleCount = 0;
                        let othersCount = 0;
                        let femaleBODCount = 0;
                        let maleBODCount = 0;
                        let othersBODCount = 0;
                        let allCount = 0;

                        branchData.data.forEach(item => {
                            // Gender Count logic
                            allCount += parseFloat(item["Head Count"])
                            if (item.Gender === "Female") {
                                femaleCount += parseFloat(item["Head Count"]) || 0;
                            } else if (item.Gender === "Male") {
                                maleCount += parseFloat(item["Head Count"]) || 0;
                            }
                            else if (item.Gender === "Others") {
                                othersCount += parseFloat(item["Head Count"]) || 0;
                            }


                            // Age Count logic with defined age ranges
                            const age = parseInt(item.Age, 10);
                            if (age >= 50) {
                                branchWiseData[branch].Overview.AgeCount["50+"] += parseFloat(item["Head Count"]) || 0;
                            } else if (age >= 35 && age < 50) {
                                branchWiseData[branch].Overview.AgeCount["35 to 50"] += parseFloat(item["Head Count"]) || 0;
                            } else if (age >= 22 && age < 35) {
                                branchWiseData[branch].Overview.AgeCount["22 to 35"] += parseFloat(item["Head Count"]) || 0;
                            } else if (age < 22) {
                                branchWiseData[branch].Overview.AgeCount["Less than 22"] += parseFloat(item["Head Count"]) || 0;
                            }

                            if (item["Entity Type"] !== "BOD turnover rate" && item["Entity Type"] !== "Compensation ratio") {
                                branchWiseData[branch].Social["Overview"].Headcount += parseFloat(item["Head Count"]) || 0;
                                if (branchWiseData[branch].Governance["Overview"]["Gender"][item["Gender"]]) {
                                    branchWiseData[branch].Governance["Overview"]["Gender"][item["Gender"]] += parseFloat(item["Head Count"]) || 0;
                                }
                                else {
                                    branchWiseData[branch].Governance["Overview"]["Gender"][item["Gender"]] = parseFloat(item["Head Count"]) || 0
                                }
                                if (branchWiseData[branch].Governance["Overview"]["EntityType"][item["Entity Type"]]) {
                                    branchWiseData[branch].Governance["Overview"]["EntityType"][item["Entity Type"]] += parseFloat(item["Head Count"]) || 0;
                                }
                                else {
                                    branchWiseData[branch].Governance["Overview"]["EntityType"][item["Entity Type"]] = parseFloat(item["Head Count"]) || 0
                                }
                            }
                            // GenderSplit logic
                            if (item["Entity Type"] === "BOD") { // Filter by "Entity Type" as "BOD"
                                branchWiseData[branch].Governance["Overview"].BODs += parseFloat(item["Head Count"]) || 0;
                                if (item.Gender === "Female") {
                                    femaleBODCount += parseFloat(item["Head Count"]) || 0;
                                    branchWiseData[branch].Governance["Overview"]["BODSFemale"] += parseFloat(item["Head Count"]) || 0;

                                } else if (item.Gender === "Male") {
                                    maleBODCount += parseFloat(item["Head Count"]) || 0;
                                }
                                else if (item.Gender === "Others") {
                                    othersBODCount += parseFloat(item["Head Count"]) || 0;
                                }
                            }


                            if (item["Entity Type"] === "CFO/CEO") { // Filter by "Entity Type" as "BOD"

                                branchWiseData[branch].Governance["Overview"]["CFO/CEO"] += parseFloat(item["Head Count"]) || 0;
                                if (item.Gender === "Female") {
                                    branchWiseData[branch].Governance["Overview"]["CFO/CEO-Female"] += parseFloat(item["Head Count"]) || 0;
                                }
                            }
                            if (item["Entity Type"] === "CEO") { // Filter by "Entity Type" as "BOD"

                                branchWiseData[branch].Governance["Overview"]["CEO"] += parseFloat(item["Head Count"]) || 0;
                                if (item.Gender === "Female") {
                                    branchWiseData[branch].Governance["Overview"]["CEO-Female"] += parseFloat(item["Head Count"]) || 0;
                                }
                            }
                            if (item["Entity Type"] === "CFO") { // Filter by "Entity Type" as "BOD"

                                branchWiseData[branch].Governance["Overview"]["CFO"] += parseFloat(item["Head Count"]) || 0;
                                if (item.Gender === "Female") {
                                    branchWiseData[branch].Governance["Overview"]["CFO-Female"] += parseFloat(item["Head Count"]) || 0;
                                }
                            }
                            if (item["Entity Type"] === "Independent Directors") { // Filter by "Entity Type" as "BOD"

                                branchWiseData[branch].Governance["Overview"]["Independent Directors"] += parseFloat(item["Head Count"]) || 0;
                            }
                        });



                        // Calculate GenderSplit (femaleCount / maleCount)
                        if (maleCount > 0) {  // To avoid division by zero
                            branchWiseData[branch].Overview.GenderSplit = `${femaleCount}:${maleCount}`;
                        }


                        // Set Gender Count
                        branchWiseData[branch].Overview.GenderCount = {
                            Male: maleCount,
                            Female: femaleCount,
                            Others: othersCount,
                        };
                        branchWiseData[branch].Social["Overview"]["Female:Male"] = `${femaleCount}:${maleCount}`
                    }
                    if (moduleName === "Eco. Performance") {
                        branchData.data.forEach(item => {
                            if (item["Data"] === "Total Revenue") { // Filter by "Entity Type" as "BOD"

                                branchWiseData[branch].Governance["Overview"]["Revenue"] += parseFloat(item.Values) || 0;
                            }
                            if (item["Data"] === "Total turnover") { // Filter by "Entity Type" as "BOD"

                                branchWiseData[branch].Governance["Overview"]["Turnover"] += parseFloat(item.Values) || 0;
                            }
                        });
                    }

                }
            }
        });
    });
    // Round off TotalEmissions to two decimal places for every branch
    // Object.keys(branchWiseData).forEach(branch => {
    //     branchWiseData[branch].Overview.TotalEmissions = parseFloat(branchWiseData[branch].Overview.TotalEmissions.toFixed(4));
    //     branchWiseData[branch].Environment.Overview.TotalEmissions = parseFloat(branchWiseData[branch].Overview.TotalEmissions.toFixed(4));
    //     delete branchWiseData[branch].modules;
    //     const totalEmissions = branchWiseData[branch].Overview.TotalEmissions;
    //     if (totalEmissions > 0) {
    //         const scopeData = { ...branchWiseData[branch].Overview.Scope };
    //         Object.keys(scopeData).forEach(scope => {
    //             // Convert scope emissions to percentage of total emissions
    //             branchWiseData[branch].Overview.Scope[scope] = parseFloat(((scopeData[scope] / totalEmissions) * 100).toFixed(4));
    //             branchWiseData[branch].Environment.Overview.Scope[scope] = parseFloat(((scopeData[scope] / totalEmissions) * 100).toFixed(4));
    //             branchWiseData[branch].Environment.Overview[scope] = scopeData[scope].toFixed(4);
    //             if (scope == "Scope 1") {
    //                 branchWiseData[branch].Environment["Scope 1"]["Scope 1"] = scopeData[scope].toFixed(4);
    //             }
    //             if (scope == "Scope 3") {
    //                 branchWiseData[branch].Environment["Scope 3"]["Scope 3"] = scopeData[scope].toFixed(4);
    //                 Object.keys(branchWiseData[branch].Environment["Scope 3"].Emission).map(val => {
    //                     branchWiseData[branch].Environment["Scope 3"].Emission[val] = parseFloat(((branchWiseData[branch].Environment["Scope 3"].Emission[val] / scopeData[scope]) * 100).toFixed(4));
    //                 }
    //                 )
    //             }
    //             if (scope == "Scope 2") {
    //                 branchWiseData[branch].Environment["Scope 2"]["Scope 2"] = scopeData[scope].toFixed(4);
    //                 Object.keys(branchWiseData[branch].Environment["Scope 2"].Activities).map(val => {
    //                     branchWiseData[branch].Environment["Scope 2"].Activities[val] = parseFloat(((branchWiseData[branch].Environment["Scope 2"].Activities[val] / scopeData[scope]) * 100).toFixed(4));
    //                 }
    //                 )
    //             }

    //         });
    //         branchWiseData[branch].Social["Overview"]["Retention"] = parseFloat((branchWiseData[branch].Social["Overview"]["Attrition"] / branchWiseData[branch].Social["Overview"].Headcount).toFixed(4));
    //     }
    // });
    return branchWiseData;
}

  const fetchData = async () => {
    // Get Firestore instance
    // const db = getFirestore();
    console.log("userData",userData)
    var domain = userData?.domain;
    // Define the path to the collection
    var closedData=master?.currentReportingCycle;
    const docRef = collection(
      firestore,
      domain,
      "TransactionData",
      `${closedData.month}-${closedData.year}`
    );

    try {
      const snapShot = await getDocs(docRef); // Fetch documents from Firestore
      const fetchedData = snapShot.docs.map(doc => ({
        [doc.id]: doc.data() // Map documents to an array of objects with document ID as key
      }));

      console.log("test1",fetchedData); // Update state with fetched data
      return fetchedData
    } catch (error) {
      console.error("Error fetching data: ", error); // Handle any errors during the fetch
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (userData && master && sheets) {
      if(userData.role!="Admin"){
        navigate('/loading');
      }
      const domain = userData?.username.split("@");
      getData(domain);
    }
  }, [userData, master, sheets]);

  console.log("Table Info", tableInfo);

  const handleInitiate = async() => {
    console.log("Initiating cycle with:", { year, month });
    const selectedYear = parseInt(year, 10);
    const selectedMonth = parseInt(month, 10);

    // Get current date
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // getMonth() is 0-based
    if (selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonth)) {
        setShowModal(false)
        setNoticeModal(true);
        setNoticeModalText("You cannot initiate a cycle for a past date. Please verify your selected month and year values and try again.");
        
        console.log("Error: Selected month/year is in the past.");
        return;
    }
    // Add your logic for initiating a new cycle here
    if (year && month) {
        setDoc(doc(firestore,userData.domain,"Master Data"),{
            currentReportingCycle: {
                month: month,
                year: year,
                status: true,
                startedAt: new Date()
            }
        }, { merge: true })
            .then(() => {
                setMaster(prev=>({...prev,currentReportingCycle:{
                    month: month,
                    year: year,
                    status: true,
                    startedAt: new Date()
                }

            }))
            setAction(true)
            //add success msg here
            setNoticeModal(true);
            setNoticeModalText("Cycle has been successfully Initiated")
                
            })
            .catch((error) => {
                setNoticeModal(true);
                setNoticeModalText("Error writing document: "+error)
                console.log("Error writing document: " + error);
            });

    } else {
        //show pop Up
        setNoticeModal(true);
        setNoticeModalText("Please enter both month and year.")
       console.log("Please enter both month and year.");
       return
    }
    
    setAction(true)
    setShowModal(false); // Close the modal after submitting
  };

  const handleTerminate = async() => {
    
    const calcData= await groupSubmittedModulesByBranch()
    // const monthYear=master?.currentReportingCycle
    console.log(calcData)
    // const docRef = doc(
    //   firestore,
    //   userData?.domain,  // Assuming userData.domain contains the Firestore collection path
    //   "AnalyticsData",  // Collection name
    //   "Reporting Cycle", // Sub-collection name
    //   `${monthYear.month}-${monthYear.year}` // Document ID based on the month and year
    // );
    var closedData = { ...master.currentReportingCycle }
        closedData.status = false;
        closedData.closedAt = new Date();
        closedData.progress = fullTotalPercentage;
    setDoc(doc(firestore,userData.domain,"Master Data","Reporting Cycle","All Cycle"),{ [closedData.month + "-" + closedData.year]: closedData }, { merge: true })
                                            .then(() => {

                                                master.currentReportingCycle.status = false;
                                                setMaster(prev=>({...prev,currentReportingCycle:{...prev.currentReportingCycle,status:false}}))
                                                setAction(false);
                                                // that.updateCycle();
                                                // that.updateAnalytics(closedData);
                                            })
                                            .catch((error) => {
                                                // MessageBox.error("Error writing document: " + error);
                                                console.log("error writing doc ",error)
                                            });
                                        setDoc(doc(firestore,userData.domain,"Master Data"),{
                                            currentReportingCycle: {
                                                status: false,
                                                closedAt: new Date()
                                            }
                                        }, { merge: true })
                                            .then(() => {
                                                //show popUp
                                                setNoticeModal(true)
                                                setNoticeModalText("Cycle has been successfully terminated.")
                                                console.log("Success")
                                                // MessageBox.success(`Reporting Cycle for ${data.currentReportingCycle.month}/${data.currentReportingCycle.year} is closed.`);
 
                                            })
                                            .catch((error) => {
                                                setNoticeModal(true)
                                                setNoticeModalText("Error writing document: " + error)
                                                // MessageBox.error("Error writing document: " + error);
                                                console.log(error)
                                            });
 
    // try {
    //   // Save the document with the required data
    //   await setDoc(docRef, {
    //     data: calcData, 
    //     year: monthYear.year
    //   });
      
    //   // Optional: Hide busy indicator or perform additional actions on success
    //   console.log("Data saved successfully");
    // } catch (error) {
    //   // Handle any errors during the save operation
    //   console.error("Error saving document: ", error);
    // }
    setTerminateModal(false);
  }

  function sumMonthlyData(data, month) {
    if (!data[month]) {
        console.log("No data available for this month.");
        return {};
    }

    const monthData = data[month];
    const totals = {};

    function addToTotal(key, value) {
        if (typeof value === "number") {
            totals[key] = parseFloat(((totals[key] || 0) + value).toFixed(4)); // Round off to 2 decimals
        } else if (typeof value === "object") {
            // Recursively sum nested objects
            Object.entries(value).forEach(([subKey, subValue]) => {
                addToTotal(key, subValue);
            });
        }
    }

    Object.values(monthData).forEach((branchData) => {
        Object.entries(branchData).forEach(([key, value]) => {
            addToTotal(key, value);
        });
    });

    return totals;
}


  const handleDownload = async(monthYear) => {
    const month=monthYear.split("-")[0];
    const year=monthYear.split("-")[1];
    var domain = userData?.username.split("@");
    const env="Environment-Overview-2024"
    const docRef = doc(firestore,
         domain[1],
         "AnalyticsData", 
         "Reporting Data",
         env
       );
    const docSnapshot = await getDoc(docRef);
    if(docSnapshot.exists() && docSnapshot.data()){
        console.log(docSnapshot.data());
        console.log("check",sumMonthlyData(docSnapshot.data(),10))
        let emissionData=sumMonthlyData(docSnapshot.data(),10);
        let transformedData=Object.entries(emissionData).map(([category, emission]) => ({ category, emission }))
        console.log(transformedData)
        generateDocx(transformedData,transformedData,transformedData,master,year)
    }
  }

  console.log(action)
  return (
    <div className="bg-slate-100 flex flex-col w-full h-screen p-2">
      <div className="mb-3 flex justify-between items-center">
        <div className="flex">
          {master?.currentReportingCycle?.status ? "Current" : "Last"} Reporting Cycle:
          <div className="font-semibold ml-3">
            {master?.currentReportingCycle
              ? `${master?.currentReportingCycle?.month}-${master?.currentReportingCycle?.year}`
              : "-"}
          </div>
        </div>
        <div className="flex gap-3">
          {action?
          (
           <button
           onClick={() => setTerminateModal(true)}
           className={`px-7 py-2 bg-gradient-to-r from-[#3d9f86] to-[#29C472] border rounded-xl ${
             action === "Terminate" ? "opacity-50" : ""
           } text-white`}
         >
           Terminate
         </button>):(
           <button
           onClick={() => setShowModal(true)} // Show modal on click
           className={`px-7 py-2 bg-gradient-to-r from-[#3d9f86] to-[#29C472] border rounded-xl ${
             action === "Initiate" ? "opacity-50" : ""
           } text-white`}
         >
           Initiate
         </button>

          )
          }
          
        </div>
      </div>

      <div
        className="rounded-[1rem] mt-5 pb-3 px-10 bg-white shadow-lg overflow-y-auto
            [&::-webkit-scrollbar]:w-1
            [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-track]:bg-[#f5fcf9]
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-[#29C472]"
      >
        {loading?(
            <div className="flex justify-center items-center py-10">
            {noData?(
                <div>
                    No previous cycles found.
                </div>
            ):(
                <Spinner />
            )}
          </div>):(
            <>
                <table className="w-full border-collapse rounded-[1rem] py-5">
            <thead>
                <tr className="text-[#718EBF] text-md rounded-lg border-b">
                <th className="py-2 px-3">Month-Year</th>
                <th className="py-2 px-3">Start Date</th>
                <th className="py-2 px-3">End date</th>
                <th className="py-2 px-3">Download Report</th>
                </tr>
            </thead>

            <tbody className="rounded-lg">
                {tableInfo?.map((tableData, index) => (
                <tr key={index} className="text-gray-700 text-center text-sm border-b mx-auto px-20">
                    <td className="py-3 px-3">{tableData.monthYear}</td>
                    <td className="py-3 px-3">{tableData.startDate}</td>
                    <td className="py-3 px-3">{tableData.endDate}</td>
                    <td className="py-3 px-3">
                    <button
                        onClick={() => handleDownload(tableData.monthYear)}
                        className={`px-7 py-2 bg-gradient-to-r from-[#3d9f86] to-[#29C472] border rounded-xl ${
                            action === "Initiate" ? "opacity-50" : ""
                        } text-white`}
                        >
                        Download
                        </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
            </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">Initiate New Cycle</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter Year (e.g., 2025)"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}  // Convert value to number
                className="w-full border rounded px-3 py-2 bg-white"
                >
                <option value="">Select Month</option>
                <option value={1}>January</option>
                <option value={2}>February</option>
                <option value={3}>March</option>
                <option value={4}>April</option>
                <option value={5}>May</option>
                <option value={6}>June</option>
                <option value={7}>July</option>
                <option value={8}>August</option>
                <option value={9}>September</option>
                <option value={10}>October</option>
                <option value={11}>November</option>
                <option value={12}>December</option>
                </select>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleInitiate}
                className="px-4 py-2 bg-gradient-to-r from-[#3d9f86] to-[#29C472] text-white rounded-lg"
              >
                Initiate
              </button>
            </div>
          </div>
        </div>
      )}

      {terminateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-2">Terminate Existing Cycle</h2>
            
            <div className="mb-4">
              Are you sure you want to close the existing cycle ?
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setTerminateModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleTerminate}
                className="px-4 py-2 bg-gradient-to-r from-[#3d9f86] to-[#29C472] text-white rounded-lg"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {noticeModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-96 flex flex-col items-center justify-center">
                  
                  <div className="mb-5 flex gap-5 jusify-center items-center">
                    <img src={modalIcon} alt="modal Icon" className="h-10"/>
                    {noticeModalText}
                  </div>
      
                  
                    <button onClick={()=>{setNoticeModal(false)}} className="px-3 py-2 rounded-lg mx-auto bg-gradient-to-r from-[#3d9f86] to-[#29C472] text-white">
                      Ok
                    </button>
                  
                </div>
              </div>
            )}
    </div>
  );
};

export default Admin;



