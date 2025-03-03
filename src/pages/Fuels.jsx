import { useEffect, useState, useRef } from "react";
import { useSidebar } from "../context/SidebarContext";
import { firestore } from "../firebase";
import { getDoc, doc, arrayUnion, setDoc, updateDoc, deleteField, collection, getDocs, FieldValue } from "firebase/firestore";
import { FaExclamationCircle, FaPlus, FaMinus } from "react-icons/fa";
import modalIcon from '../assets/modalIcon.png'
import { SiTicktick } from "react-icons/si";
import * as XLSX from "xlsx"
import Spinner from '../components/Spinner'

const Fuels = () => {
  const [tab, setTab] = useState("recorded");
  const [variantData, setVariantData] = useState([]);
  const [fetchedVariant, setFetchedVariant] = useState();
  const [variantOffice, setVariantOffice] = useState();
  const [selectedVariant, setSelectedVariant] = useState();
  const [dataStatus, setDataStatus] = useState();
  const [loading, setLoading] = useState(false);
  const [branch, setBranch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState("");
  const fetchVariantRef = useRef([]);
  const selectedIndexes = useRef([])
  const selectedIndexes2 = useRef([]);
  const [filterList, setFilterList] = useState({});
  const [tempSelectedVariant, setTempSelectedVariant] = useState([]);
  const [tempIndexMap, setTempIndexMap] = useState(new Map());
  const [office, setOffice] = useState(null);
  // Data configurations based on the fuel type (fuel, bioenergy)
  const { module, master, userData, sheets, setMaster } = useSidebar();

  useEffect(() => {
    setSelectedVariant(null);
    setOffice("")
    let ele = document.getElementById("branchSelect")
    if (ele) ele.value = "Select branch";

    selectedIndexes2.current = [];
    setVariantOffice("");
    setFilterList({})
    setDataStatus("not Submitted")
    setFetchedVariant(null);
  }, [module])

  useEffect(() => {
    setTempSelectedVariant([]);
    setOffice("")
    let ele = document.getElementById("branchSelect")
    if (ele) ele.value = "Select branch";

    let ele2 = document.getElementById("officeSelect")
    console.log("officeSeelct", ele2)
    if (ele2) ele2.value = "";
    setSelectedVariant(null);
    setVariantOffice("");
  }, [tab])


  useEffect(() => {
    selectedIndexes.current = [];
    document.querySelectorAll(".table-checkbox").forEach((checkbox) => {
      checkbox.checked = false;
    });
  }, [office])


  useEffect(() => {
    setFilterList({});
    setTempSelectedVariant([]);
    selectedIndexes2.current = [];
    selectedIndexes.current = [];
  }, [branch])

  console.log("variant office", variantOffice)
  const fuelData = {
    Fuel: [
      { title: "Fuels", editable: false, key: "fuels" },
      { title: "Type", editable: false, key: "type" },
      { title: "Fuel", editable: false, key: "fuels2" },
      { title: "Unit", editable: false, key: "unit" },
      { title: "Amount", editable: true, key: "amount", type: "Number" },
      { title: "Factor", editable: true, key: "factor", type: "Number" },
    ],
    Bioenergy: [
      { title: "A", editable: false, key: "A" },
      { title: "B", editable: false, key: "B" },
      { title: "Fuel", editable: false, key: "fuels2" },
      { title: "Unit", editable: false, key: "unit" },
      { title: "Factor", editable: true, key: "factor", type: "Number" },
    ],
  };


  const tooltipData = {
    "Direct economic value generated": "Revenues",
    "Direct economic value Distributed": "Operating costs, employee wages and benefits, payments to providers of capital, payments to government by country, and community investments",
    "Local Minimum Wage as Male": "Minimum compensation for employment per hour, or other unit of time, allowed under law, in circumstances in which different minimums can be used as a reference, report which minimum wage is being used",
    "Local Minimum Wage as Female": "Minimum compensation for employment per hour, or other unit of time, allowed under law, in circumstances in which different minimums can be used as a reference, report which minimum wage is being used",
    "Entry level wage for Male": "Entry level - wage full-time wage in the lowest employment category Note: Intern or apprentice wages are not considered entry level wages.",
    "Entry level wage for Female": "Entry level - wage full-time wage in the lowest employment category Note: Intern or apprentice wages are not considered entry level wages.",
    "1 average meal": "Calculated as 20% vegetarian meal, 40% meal with chicken, 40% meal with beef",
    "1 cold or hot snack": "Calculated as 50% cold sandwich, 50% hot snack (burger and fries)",
    "Water Supply": "Water delivered through the mains supply network",
    "Water Drainage": "Water returned into the sewage system through mains drains",
    "Electricity": "Electricity used by an organization at sites owned/ controlled by them. (Not for renewable energy)",
    "Heat and steam": "Emission within an organization that purchases heat/steam energy for heating purpose or for use in specific industrial processes. For heating from other sources, please use the tab fuels.",
    "District cooling": "Air conditioning from chilled water within a centralized energy plants and underground pipes distribution.",
    "Petrol": "Small Car - Engine size < 1.4 Liters\nMedium Car - Engine size 1.4 – 2.0 Liters\nLarge Car - Engine size > 2.0 Liters",
    "Diesel": "Small Car - Engine size > 1.7 Liters\nMedium Car - Engine size 1.7 – 2.0 Liters\nLarge Car - Engine size > 2.0 Liters",
  }

  const addRow = (param = 'recorded') => {
    console.log("data got", getColumns(module))
    console.log("selected", selectedVariant);
    console.log("fetched", fetchedVariant);
    const newRow = {};
    getColumns(module)?.forEach((col) => (newRow[col.title] = ""));
    console.log("new Row", newRow, branch.split('-')[0])

    if (param == 'recorded') {
      newRow.Country = branch.split('-')[0];
      setSelectedVariant([...selectedVariant, newRow]);
      setTempSelectedVariant([...selectedVariant, newRow]);
      setFetchedVariant({
        ...fetchedVariant,
        [variantOffice]: [...selectedVariant, newRow],
      })
    }
    else {
      setVariantData([...variantData, newRow])
    }
  }

  const deleteRow = (param = 'recorded') => {



    if (param == 'recorded') {
      if (selectedIndexes2.length === 0) return;
      const updatedRows = selectedVariant.filter((_, index) => !selectedIndexes2.current.includes(index));
      // Clear selected indexes after deletion
      selectedIndexes2.current = [];
      setSelectedVariant(updatedRows);
      setTempSelectedVariant(updatedRows);
    }
    else {
      const updatedRows = variantData.filter((_, index) => !selectedIndexes.current.includes(index));
      selectedIndexes.current = [];
      setVariantData(updatedRows)
    }
    // setFetchedVariant({...fetchedVariant,
    //   [variantOffice]:[updatedRows],})
  }

  const checkKey = (moduleValue) => {
    // let arr=Object.keys(sheets)
    console.log(sheets['Environment']);
    for (let key in sheets) {
      console.log(key)
    }
    for (let key in sheets) {
      if (sheets[key].includes(moduleValue)) {
        console.log("hi hi hi", key)
        return key;  // Return the module name (key)
      }


    }
    return null;
  }


  const calculateEmissions = () => {
    let totalEmissions = 0;
    let fullEmissions = 0;
    let bifurcatedEmissions = { Type: {} }; // For modules grouped by Type
    let childEmissions = { Type: {} };
    let activityEmissions = { Activity: {} }; // For modules grouped by Activity
    let disposalMethodEmissions = {}; // For Waste Disposal (grouped by Disposal Method)
    let level2Emissions = { Level2: {} }; // For Owned Vehicles (grouped by Level 2)
    let vehiclesEmissions = { Vehicles: {} }; // For Freighting goods, Business travel land and sea, Employee commuting
    let entityEmissions = { EntityType: { All: { "Male": 0, "Female": 0, "Others": 0 } } };
    let employmentEmissions = { EmploymentType: { All: { "Male": 0, "Female": 0, "Others": 0 } } };
    let retentionData = { EmployeeType: { All: { "Male": 0, "Female": 0, "Others": 0 } } };
    let ohsData = { InjuryType: {} }; // For OH and S module
    //extra in waste disposal and buisness travel
    const checkValue = (value) => {
      return (value === undefined || value === "--") ? "Unknown" : value;
    };

    switch (module) {
      case "Fuel":
      case "Bioenergy":
      case "WTT- fuels":
      case "Water":
        selectedVariant.forEach(item => {
          const type = checkValue(item.Type);
          const amount = parseFloat(item.Amount) || 0;
          const factor = parseFloat(item.Factor) || 0;
          const emission = amount * factor;

          if (!bifurcatedEmissions.Type[type]) {
            bifurcatedEmissions.Type[type] = 0;
          }

          bifurcatedEmissions.Type[type] += emission;
        });
        selectedVariant.forEach(item => {
          fullEmissions += (parseFloat(item.Amount) || 0) * (parseFloat(item.Factor) || 0);
        })

        return { totalEmissions: bifurcatedEmissions, fullEmissions: fullEmissions };

      case "Child Labor":
        selectedVariant.forEach(item => {
          const risk = checkValue(item["Risk Level"]);
          const amount = parseFloat(item["No. of Incidents reported"]) || 0;

          if (!childEmissions.Type[risk]) {
            childEmissions.Type[risk] = 0;
          }

          childEmissions.Type[risk] += amount;
        });


        return { totalEmissions: childEmissions };


      case "Elec heat cooling":
        selectedVariant.forEach(item => {
          const activity = checkValue(item.Activity);
          const amount = parseFloat(item["Amount"]) || 0;
          const factor1 = parseFloat(item["GEF Factors"]) || 0;
          const factor2 = parseFloat(item["T&D Factors"]) || 0;
          const emission = amount * (factor1 + factor2);
          fullEmissions += emission
          if (!activityEmissions.Activity[activity]) {
            activityEmissions.Activity[activity] = 0;
          }

          activityEmissions.Activity[activity] += emission;
        });


        return { totalEmissions: activityEmissions, fullEmissions };

      case "Materials":
        selectedVariant.forEach(item => {
          const activity = checkValue(item.Activity);
          const amount = parseFloat(item["Amount (tonnes)"]) || 0;
          const factor = parseFloat(item.Factor) || 0;
          const emission = amount * factor;
          fullEmissions += emission

          if (!activityEmissions.Activity[activity]) {
            activityEmissions.Activity[activity] = 0;
          }

          activityEmissions.Activity[activity] += emission;
        });

        return { totalEmissions: activityEmissions, fullEmissions };

      case "Waste Disposal":
        disposalMethodEmissions = { Activity: { All: { "Recycled": 0, "Landfilled": 0, "Combusted": 0 } } }; // Initialize structure

        selectedVariant.forEach(item => {
          const disposalMethod = checkValue(item["Disposal Method"]);
          const activity = checkValue(item.Activity);
          const weight = parseFloat(item.Weight) || 0;
          const factor = parseFloat(item.Factor) || 0;
          const emission = weight * factor;
          fullEmissions += emission


          // Ensure disposal method exists
          if (!disposalMethodEmissions.Activity[activity]) {
            disposalMethodEmissions.Activity[activity] = {};
          }


          // Ensure activity inside disposal method exists
          if (!disposalMethodEmissions.Activity[activity][disposalMethod]) {
            disposalMethodEmissions.Activity[activity][disposalMethod] = 0;
          }

          // Accumulate emissions for the activity under the disposal method
          disposalMethodEmissions.Activity[activity][disposalMethod] += emission;
          disposalMethodEmissions.Activity["All"][disposalMethod] += emission;
        });

        console.log(disposalMethodEmissions);
        return { totalEmissions: disposalMethodEmissions, fullEmissions };

      case "Owned Vehicles":
        var scopeWiseEmission = {};

        selectedVariant.forEach(item => {
          const level2 = checkValue(item["Level 2"]);
          const distance = parseFloat(item["Distance (km)"]) || 0;
          const factor = parseFloat(item.Factor) || 0;
          const emission = distance * factor;
          fullEmissions += emission

          if (!scopeWiseEmission[item.Scope]) {
            scopeWiseEmission[item.Scope] = 0;
          }

          scopeWiseEmission[item.Scope] += emission;

          if (!level2Emissions.Level2[level2]) {
            level2Emissions.Level2[level2] = 0;
          }

          level2Emissions.Level2[level2] += emission;
        });

        return { totalEmissions: level2Emissions, fullEmissions, scopeWiseEmission };

      case "Freighting goods":
      case "Business travel - land and sea":
      case "Employees commuting":
        selectedVariant.forEach(item => {
          const vehicle = checkValue(item.Vehicle);
          const distance = parseFloat(item["Distance (km)"]) || parseFloat(item["Total distance"]) || 0;
          const factor = parseFloat(item.Factor) || 0;
          const emission = distance * factor;
          fullEmissions += emission

          if (!vehiclesEmissions.Vehicles[vehicle]) {
            vehiclesEmissions.Vehicles[vehicle] = 0;
          }

          vehiclesEmissions.Vehicles[vehicle] += emission;
        });

        return { totalEmissions: vehiclesEmissions, fullEmissions };

      case "Flight":
        selectedVariant.forEach(item => {
          totalEmissions += parseFloat(item["kg CO2e"]) || 0;
          fullEmissions += parseFloat(item["kg CO2e"]) || 0;
        });
        return { totalEmissions, fullEmissions }
      case "Accommodation":
        selectedVariant.forEach(item => {
          totalEmissions += (parseFloat(item["Number of occupied rooms"]) || 0) *
            (parseFloat(item["Number of nights per room"]) || 0) *
            (parseFloat(item["Factor"]) || 0);
          fullEmissions += (parseFloat(item["Number of occupied rooms"]) || 0) *
            (parseFloat(item["Number of nights per room"]) || 0) *
            (parseFloat(item["Factor"]) || 0);
        });
        return { totalEmissions, fullEmissions }

      case "Home Office":
        selectedVariant.forEach(item => {
          totalEmissions += (parseFloat(item["Number of employees"]) || 0) *
            (parseFloat(item.Factor) || 0);
          fullEmissions += (parseFloat(item["Number of employees"]) || 0) *
            (parseFloat(item.Factor) || 0);
        });
        return { totalEmissions, fullEmissions }

      case "Entity":
        {
          fullEmissions = { "BOD": 0, "CFO": 0, "CEO": 0, "Independent Directors": 0, "Executives": 0, "CFO/CEO": 0 }
          selectedVariant.forEach(item => {
            const entityType = checkValue(item["Entity Type"]);
            const gender = checkValue(item["Gender"]);
            const headCount = parseInt(item["Head Count"]) || 0;

            // Group by Entity Type
            if (!entityEmissions.EntityType[entityType]) {
              entityEmissions.EntityType[entityType] = { "Male": 0, "Female": 0, "Others": 0 };
              entityEmissions.EntityType[entityType][gender] = headCount
              fullEmissions[entityType] += headCount;
            }
            else {
              entityEmissions.EntityType[entityType][gender] += headCount;
              fullEmissions[entityType] += headCount;
            }
            entityEmissions.EntityType["All"][gender] += headCount;

            // Group by Gender
            // if (!entityEmissions.Gender[gender]) {
            //     entityEmissions.Gender[gender] = 0;
            // }
            // entityEmissions.Gender[gender] += headCount;
          });

          return { totalEmissions: entityEmissions, fullEmissions };
        }
      case "Retention": {
        retentionData = { EmployeeType: { All: { Male: 0, Female: 0, Others: 0 } } }; // Initialize structure

        selectedVariant.forEach(item => {
          const entityType = checkValue(item["Employee Type"]);
          const gender = checkValue(item["Gender"]);
          const headCount = parseInt(item["Head Count"]) || 0;
          fullEmissions += headCount;

          // Ensure Employee Type is initialized
          if (!retentionData.EmployeeType[entityType]) {
            retentionData.EmployeeType[entityType] = { Male: 0, Female: 0, Others: 0 };
          }

          // Accumulate headcount for the specific Employee Type and Gender
          retentionData.EmployeeType[entityType][gender] += headCount;

          // Accumulate headcount in "All" category
          retentionData.EmployeeType["All"][gender] += headCount;
        });

        console.log(retentionData);
        return { totalEmissions: retentionData, fullEmissions };
      }

      case "Employment": {
        fullEmissions = { "50+": { "Male": 0, "Female": 0, "LGBTQ": 0 }, "35 to 50": { "Male": 0, "Female": 0, "LGBTQ": 0 }, "22 to 35": { "Male": 0, "Female": 0, "LGBTQ": 0 }, "Less than 22": { "Male": 0, "Female": 0, "LGBTQ": 0 } }
        selectedVariant.forEach(item => {
          const entityType = checkValue(item["Employment Type"]);
          const gender = checkValue(item["Gender"]);
          const headCount = parseInt(item["Head Count"]) || 0;
          const age = item["Age"] || "0";
          fullEmissions[age][gender] += headCount

          // Group by Entity Type
          if (!employmentEmissions.EmploymentType[entityType]) {
            employmentEmissions.EmploymentType[entityType] = { "Male": 0, "Female": 0, "Others": 0 };
            employmentEmissions.EmploymentType[entityType][gender] = headCount
          }
          else {
            employmentEmissions.EmploymentType[entityType][gender] += headCount;
          }
          employmentEmissions.EmploymentType["All"][gender] += headCount;

          // Group by Gender
          // if (!entityEmissions.Gender[gender]) {
          //     entityEmissions.Gender[gender] = 0;
          // }
          // entityEmissions.Gender[gender] += headCount;
        });

        return { totalEmissions: employmentEmissions, fullEmissions };
      }



      case "OH and S": {
        selectedVariant.forEach(item => {
          const injuryType = checkValue(item["Injury Type"]);
          const headCount = parseInt(item["Head Count"]) || 0;
          const incidents = parseInt(item["Number of Incidents"]) || 0;

          // Group by Injury Type
          if (!ohsData.InjuryType[injuryType]) {
            ohsData.InjuryType[injuryType] = { HeadCount: 0, Incidents: 0 };
          }
          ohsData.InjuryType[injuryType].HeadCount += headCount;
          ohsData.InjuryType[injuryType].Incidents += incidents;
        });

        return { totalEmissions: ohsData };
      }
      case "Training and Edu": {
        fullEmissions = {
          "BOD": {
            "Employee health & safety training": 0,
            "Employee Skill Upgradation Training": 0, "Onboarding and orientation": 0, "Technical Training": 0,
            "Other": 0, "Anti-corruption Training": 0, "POSH training": 0, "Strategy Implementation": 0, "Business operation": 0,
            "Organisation structure": 0, "Risk Management training": 0, "Regulatory framework": 0, "Cyber security": 0,
            "Future outlook training": 0, "Leadership connect program": 0, "Corporate governance training": 0,
            "Emerging compliance landscape": 0, "AML (Anti-money laundering)": 0, "KYC": 0, "Whistle-blower Policy Training": 0,
            "NRI Product & KYC Documentation": 0, "Prohibition of Insider Trading": 0, "Cash Management System": 0,
            "Code of Conduct & Ethics": 0, "CERSAI": 0, "Grievance Redressal Mechanism": 0
          }
          , "Employees": {
            "Employee health & safety training": 0,
            "Employee Skill Upgradation Training": 0, "Onboarding and orientation": 0, "Technical Training": 0,
            "Other": 0, "Anti-corruption Training": 0, "POSH training": 0, "Strategy Implementation": 0, "Business operation": 0,
            "Organisation structure": 0, "Risk Management training": 0, "Regulatory framework": 0, "Cyber security": 0,
            "Future outlook training": 0, "Leadership connect program": 0, "Corporate governance training": 0,
            "Emerging compliance landscape": 0, "AML (Anti-money laundering)": 0, "KYC": 0, "Whistle-blower Policy Training": 0,
            "NRI Product & KYC Documentation": 0, "Prohibition of Insider Trading": 0, "Cash Management System": 0,
            "Code of Conduct & Ethics": 0, "CERSAI": 0, "Grievance Redressal Mechanism": 0
          },
          "Key management personnel": {
            "Employee health & safety training": 0,
            "Employee Skill Upgradation Training": 0, "Onboarding and orientation": 0, "Technical Training": 0,
            "Other": 0, "Anti-corruption Training": 0, "POSH training": 0, "Strategy Implementation": 0, "Business operation": 0,
            "Organisation structure": 0, "Risk Management training": 0, "Regulatory framework": 0, "Cyber security": 0,
            "Future outlook training": 0, "Leadership connect program": 0, "Corporate governance training": 0,
            "Emerging compliance landscape": 0, "AML (Anti-money laundering)": 0, "KYC": 0, "Whistle-blower Policy Training": 0,
            "NRI Product & KYC Documentation": 0, "Prohibition of Insider Trading": 0, "Cash Management System": 0,
            "Code of Conduct & Ethics": 0, "CERSAI": 0, "Grievance Redressal Mechanism": 0
          },
          "Workers": {
            "Employee health & safety training": 0,
            "Employee Skill Upgradation Training": 0, "Onboarding and orientation": 0, "Technical Training": 0,
            "Other": 0, "Anti-corruption Training": 0, "POSH training": 0, "Strategy Implementation": 0, "Business operation": 0,
            "Organisation structure": 0, "Risk Management training": 0, "Regulatory framework": 0, "Cyber security": 0,
            "Future outlook training": 0, "Leadership connect program": 0, "Corporate governance training": 0,
            "Emerging compliance landscape": 0, "AML (Anti-money laundering)": 0, "KYC": 0, "Whistle-blower Policy Training": 0,
            "NRI Product & KYC Documentation": 0, "Prohibition of Insider Trading": 0, "Cash Management System": 0,
            "Code of Conduct & Ethics": 0, "CERSAI": 0, "Grievance Redressal Mechanism": 0
          },
          "others": {
            "Employee health & safety training": 0,
            "Employee Skill Upgradation Training": 0, "Onboarding and orientation": 0, "Technical Training": 0,
            "Other": 0, "Anti-corruption Training": 0, "POSH training": 0, "Strategy Implementation": 0, "Business operation": 0,
            "Organisation structure": 0, "Risk Management training": 0, "Regulatory framework": 0, "Cyber security": 0,
            "Future outlook training": 0, "Leadership connect program": 0, "Corporate governance training": 0,
            "Emerging compliance landscape": 0, "AML (Anti-money laundering)": 0, "KYC": 0, "Whistle-blower Policy Training": 0,
            "NRI Product & KYC Documentation": 0, "Prohibition of Insider Trading": 0, "Cash Management System": 0,
            "Code of Conduct & Ethics": 0, "CERSAI": 0, "Grievance Redressal Mechanism": 0
          }
        }
        selectedVariant.forEach(item => {
          const segment = checkValue(item.Segment); // Group by Segment
          const training = checkValue(item["Types of training"]);
          const headCount = parseInt(checkValue(item["Head Count"]))
          fullEmissions[segment][training] += headCount

          // Initialize the segment object if not present
          if (!bifurcatedEmissions.Segment) {
            bifurcatedEmissions.Segment = {};
          }
          if (!bifurcatedEmissions.Segment[segment]) {
            bifurcatedEmissions.Segment[segment] = {};
          }

          // Loop through all fields in the item
          Object.keys(item).forEach(field => {
            if (field !== "Segment") { // Skip the grouping key
              const value = parseFloat(item[field]) || 0; // Convert to number
              if (!bifurcatedEmissions.Segment[segment][field]) {
                bifurcatedEmissions.Segment[segment][field] = 0;
              }
              bifurcatedEmissions.Segment[segment][field] += value;
            }
          });
        });

        console.log("a", JSON.stringify(fullEmissions))

        return { totalEmissions: bifurcatedEmissions, fullEmissions };
      }
      case "Eco. Performance": {
        let saveValues = {
          "Total turnover": 0,
          "Total Revenue": 0,
        }
        fullEmissions = {
          "Total turnover": 0,
          "Total Revenue": 0,
          "Direct economic value generated": 0,
          "Direct economic value Distributed": 0,

        }
        selectedVariant.forEach((item) => {
          if (item.Data == "Total turnover") {
            saveValues["Total turnover"] = item.Values
            fullEmissions["Total turnover"] = item.Values
          }
          if (item.Data == "Total Revenue") {
            saveValues["Total Revenue"] = item.Values
            fullEmissions["Total Revenue"] = item.Values
          }
          if (item.Data == "Direct economic value Distributed") {
            fullEmissions["Direct economic value Distributed"] = item.Values
          }
          if (item.Data == "Direct economic value generated") {
            fullEmissions["Direct economic value generated"] = item.Values
          }
        })

        return { totalEmissions: saveValues, fullEmissions };
      }



      default:
        break;
    }


    if (checkKey(module) != "Environment") {
      console.log("Case 1")

      totalEmissions = selectedVariant.reduce((acc, obj) => {
        Object.keys(obj).forEach(key => {
          if (!isNaN(obj[key])) {  // Only sum up numeric values
            acc[key] = (acc[key] || 0) + Number(obj[key]);
          }
        });
        return acc;
      }, {});

      return { totalEmissions }
    }
    else {
      selectedVariant.forEach(item => {
        totalEmissions += (parseFloat(item.Amount) || 0) * (parseFloat(item.Factor) || 0);
        fullEmissions += (parseFloat(item.Amount) || 0) * (parseFloat(item.Factor) || 0);
      })
    }

    return { totalEmissions, fullEmissions }
  };



  const getVariantData = (module) => {
    var variantMap = {
      "Fuel": [
        {
          "Reference": 7,
          "Fuels": "Fuels",
          "Type": "Gaseous fuels",
          "Fuel": "CNG",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": 11,
          "Fuels": "Fuels",
          "Type": "Gaseous fuels",
          "Fuel": "LNG",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": 15,
          "Fuels": "Fuels",
          "Type": "Gaseous fuels",
          "Fuel": "LPG",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": 19,
          "Fuels": "Fuels",
          "Type": "Gaseous fuels",
          "Fuel": "Natural gas",
          "Unit": "cubic metres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": 2779,
          "Fuels": "Fuels",
          "Type": "Gaseous fuels",
          "Fuel": "Natural gas (100% mineral blend)",
          "Unit": "cubic metres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": 23,
          "Fuels": "Fuels",
          "Type": "Gaseous fuels",
          "Fuel": "Other petroleum gas",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": 31,
          "Fuels": "Fuels",
          "Type": "Liquid fuels",
          "Fuel": "Aviation spirit",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": 35,
          "Fuels": "Fuels",
          "Type": "Liquid fuels",
          "Fuel": "Aviation turbine fuel",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": 39,
          "Fuels": "Fuels",
          "Type": "Liquid fuels",
          "Fuel": "Burning oil",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": 43,
          "Fuels": "Fuels",
          "Type": "Liquid fuels",
          "Fuel": "Diesel (average biofuel blend)",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": 47,
          "Fuels": "Fuels",
          "Type": "Liquid fuels",
          "Fuel": "Diesel (100% mineral diesel)",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": 51,
          "Fuels": "Fuels",
          "Type": "Liquid fuels",
          "Fuel": "Fuel oil",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": 55,
          "Fuels": "Fuels",
          "Type": "Liquid fuels",
          "Fuel": "Gas oil",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": 59,
          "Fuels": "Fuels",
          "Type": "Liquid fuels",
          "Fuel": "Lubricants",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": 63,
          "Fuels": "Fuels",
          "Type": "Liquid fuels",
          "Fuel": "Naphtha",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": 71,
          "Fuels": "Fuels",
          "Type": "Liquid fuels",
          "Fuel": "Petrol (100% mineral petrol)",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": 75,
          "Fuels": "Fuels",
          "Type": "Liquid fuels",
          "Fuel": "Processed fuel oils - residual oil",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": 79,
          "Fuels": "Fuels",
          "Type": "Liquid fuels",
          "Fuel": "Processed fuel oils - distillate oil",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": 87,
          "Fuels": "Fuels",
          "Type": "Liquid fuels",
          "Fuel": "Waste oils",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": 91,
          "Fuels": "Fuels",
          "Type": "Liquid fuels",
          "Fuel": "Marine gas oil",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": 95,
          "Fuels": "Fuels",
          "Type": "Liquid fuels",
          "Fuel": "Marine fuel oil",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": 99,
          "Fuels": "Fuels",
          "Type": "Solid fuels",
          "Fuel": "Coal (industrial)",
          "Unit": "tonnes",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": 102,
          "Fuels": "Fuels",
          "Type": "Solid fuels",
          "Fuel": "Coal (electricity generation)",
          "Unit": "tonnes",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": 105,
          "Fuels": "Fuels",
          "Type": "Solid fuels",
          "Fuel": "Coal (domestic)",
          "Unit": "tonnes",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": 108,
          "Fuels": "Fuels",
          "Type": "Solid fuels",
          "Fuel": "Coking coal",
          "Unit": "tonnes",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": 111,
          "Fuels": "Fuels",
          "Type": "Solid fuels",
          "Fuel": "Petroleum coke",
          "Unit": "tonnes",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": 114,
          "Fuels": "Fuels",
          "Type": "Solid fuels",
          "Fuel": "Coal (electricity generation - home produced coal only)",
          "Unit": "tonnes",
          "Amount": "",
          "Factor": ""
        }
      ],
      "Bioenergy": [
        {
          "Amount": "",
          "Factor": "",
          "Reference": 117,
          "Fuels": "Bioenergy",
          "Type": "Biofuel",
          "Fuel": "Bioethanol",
          "Unit": "litres"
        },
        {
          "Amount": "",
          "Factor": "",
          "Reference": 120,
          "Fuels": "Bioenergy",
          "Type": "Biofuel",
          "Fuel": "Biodiesel ME",
          "Unit": "litres"
        },
        {
          "Amount": "",
          "Factor": "",
          "Reference": 126,
          "Fuels": "Bioenergy",
          "Type": "Biofuel",
          "Fuel": "Biodiesel ME (from used cooking oil)",
          "Unit": "litres"
        },
        {
          "Amount": "",
          "Factor": "",
          "Reference": 129,
          "Fuels": "Bioenergy",
          "Type": "Biofuel",
          "Fuel": "Biodiesel ME (from tallow)",
          "Unit": "litres"
        },
        {
          "Amount": "",
          "Factor": "",
          "Reference": 143,
          "Fuels": "Bioenergy",
          "Type": "Biomass",
          "Fuel": "Wood logs",
          "Unit": "tonnes"
        },
        {
          "Amount": "",
          "Factor": "",
          "Reference": 145,
          "Fuels": "Bioenergy",
          "Type": "Biomass",
          "Fuel": "Wood chips",
          "Unit": "tonnes"
        },
        {
          "Amount": "",
          "Factor": "",
          "Reference": 147,
          "Fuels": "Bioenergy",
          "Type": "Biomass",
          "Fuel": "Wood pellets",
          "Unit": "tonnes"
        },
        {
          "Amount": "",
          "Factor": "",
          "Reference": 149,
          "Fuels": "Bioenergy",
          "Type": "Biomass",
          "Fuel": "Grass/straw",
          "Unit": "tonnes"
        },
        {
          "Amount": "",
          "Factor": "",
          "Reference": 151,
          "Fuels": "Bioenergy",
          "Type": "Biogas",
          "Fuel": "Biogas",
          "Unit": "tonnes"
        },
        {
          "Amount": "",
          "Factor": "",
          "Reference": 153,
          "Fuels": "Bioenergy",
          "Type": "Biogas",
          "Fuel": "Landfill gas",
          "Unit": "tonnes"
        }
      ],
      "Refrigerant and other": [
        {
          "Reference": "154",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol - standard",
          "Fuel": "Carbon dioxide",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "155",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol - standard",
          "Fuel": "Methane",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "156",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol - standard",
          "Fuel": "Nitrous oxide",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "157",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol - standard",
          "Fuel": "HFC-23",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "158",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol - standard",
          "Fuel": "HFC-32",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "159",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol - standard",
          "Fuel": "HFC-41",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "160",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol - standard",
          "Fuel": "HFC-125",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "161",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol - standard",
          "Fuel": "HFC-134",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "162",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol - standard",
          "Fuel": "HFC-134a",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "163",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol - standard",
          "Fuel": "HFC-143",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "164",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol - standard",
          "Fuel": "HFC-143a",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "165",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol - standard",
          "Fuel": "HFC-152a",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "166",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol - standard",
          "Fuel": "HFC-227ea",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "167",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol - standard",
          "Fuel": "HFC-236fa",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "168",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol - standard",
          "Fuel": "HFC-245fa",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "169",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol - standard",
          "Fuel": "HFC-43-I0mee",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "170",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol - standard",
          "Fuel": "Perfluoromethane (PFC-14)",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "171",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol - standard",
          "Fuel": "Perfluoroethane (PFC-116)",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "172",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol - standard",
          "Fuel": "Perfluoropropane (PFC-218)",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "173",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol - standard",
          "Fuel": "Perfluorocyclobutane (PFC-318)",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "174",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol - standard",
          "Fuel": "Perfluorobutane (PFC-3-1-10)",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "175",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol - standard",
          "Fuel": "Perfluoropentane (PFC-4-1-12)",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "176",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol - standard",
          "Fuel": "Perfluorohexane (PFC-5-1-14)",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "177",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol - standard",
          "Fuel": "Sulphur hexafluoride (SF6)",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "178",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol - standard",
          "Fuel": "HFC-152",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "179",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol - standard",
          "Fuel": "HFC-161",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "180",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol - standard",
          "Fuel": "HFC-236cb",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "181",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol - standard",
          "Fuel": "HFC-236ea",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "182",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol - standard",
          "Fuel": "HFC-245ca",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "183",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol - standard",
          "Fuel": "HFC-365mfc",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "184",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol- blends",
          "Fuel": "R404A",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "185",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol- blends",
          "Fuel": "R407A",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "186",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol- blends",
          "Fuel": "R407C",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "187",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol- blends",
          "Fuel": "R407F",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "188",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol- blends",
          "Fuel": "R408A",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "189",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol- blends",
          "Fuel": "R410A",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "190",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol- blends",
          "Fuel": "R507A",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "191",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol- blends",
          "Fuel": "R508B",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "192",
          "Fuels": "Refrigerant & other",
          "Type": "Kyoto protocol- blends",
          "Fuel": "R403A",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "193",
          "Fuels": "Refrigerant & other",
          "Type": "Montreal protocol - standard",
          "Fuel": "CFC-11/R11 = trichlorofluoromethane",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "194",
          "Fuels": "Refrigerant & other",
          "Type": "Montreal protocol - standard",
          "Fuel": "CFC-12/R12 = dichlorodifluoromethane",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "195",
          "Fuels": "Refrigerant & other",
          "Type": "Montreal protocol - standard",
          "Fuel": "CFC-13",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "196",
          "Fuels": "Refrigerant & other",
          "Type": "Montreal protocol - standard",
          "Fuel": "CFC-113",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "197",
          "Fuels": "Refrigerant & other",
          "Type": "Montreal protocol - standard",
          "Fuel": "CFC-114",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "198",
          "Fuels": "Refrigerant & other",
          "Type": "Montreal protocol - standard",
          "Fuel": "CFC-115",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "199",
          "Fuels": "Refrigerant & other",
          "Type": "Montreal protocol - standard",
          "Fuel": "Halon-1211",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "200",
          "Fuels": "Refrigerant & other",
          "Type": "Montreal protocol - standard",
          "Fuel": "Halon-1301",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "201",
          "Fuels": "Refrigerant & other",
          "Type": "Montreal protocol - standard",
          "Fuel": "Halon-2402",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "202",
          "Fuels": "Refrigerant & other",
          "Type": "Montreal protocol - standard",
          "Fuel": "Carbon tetrachloride",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "203",
          "Fuels": "Refrigerant & other",
          "Type": "Montreal protocol - standard",
          "Fuel": "Methyl bromide",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "204",
          "Fuels": "Refrigerant & other",
          "Type": "Montreal protocol - standard",
          "Fuel": "Methyl chloroform",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "205",
          "Fuels": "Refrigerant & other",
          "Type": "Montreal protocol - standard",
          "Fuel": "HCFC-22/R22 = chlorodifluoromethane",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "206",
          "Fuels": "Refrigerant & other",
          "Type": "Montreal protocol - standard",
          "Fuel": "HCFC-123",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "207",
          "Fuels": "Refrigerant & other",
          "Type": "Montreal protocol - standard",
          "Fuel": "HCFC-124",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "208",
          "Fuels": "Refrigerant & other",
          "Type": "Montreal protocol - standard",
          "Fuel": "HCFC-141b",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "209",
          "Fuels": "Refrigerant & other",
          "Type": "Montreal protocol - standard",
          "Fuel": "HCFC-142b",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "210",
          "Fuels": "Refrigerant & other",
          "Type": "Montreal protocol - standard",
          "Fuel": "HCFC-225ca",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "211",
          "Fuels": "Refrigerant & other",
          "Type": "Montreal protocol - standard",
          "Fuel": "HCFC-225cb",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "212",
          "Fuels": "Refrigerant & other",
          "Type": "Montreal protocol - standard",
          "Fuel": "HCFC-21",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "213",
          "Fuels": "Refrigerant & other",
          "Type": "Other perfluorinated gases",
          "Fuel": "Nitrogen trifluoride",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "214",
          "Fuels": "Refrigerant & other",
          "Type": "Other perfluorinated gases",
          "Fuel": "PFC-9-1-18",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "215",
          "Fuels": "Refrigerant & other",
          "Type": "Other perfluorinated gases",
          "Fuel": "Trifluoromethyl sulphur pentafluoride",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "216",
          "Fuels": "Refrigerant & other",
          "Type": "Other perfluorinated gases",
          "Fuel": "Perfluorocyclopropane",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "217",
          "Fuels": "Refrigerant & other",
          "Type": "Fluorinated ethers",
          "Fuel": "HFE-125",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "218",
          "Fuels": "Refrigerant & other",
          "Type": "Fluorinated ethers",
          "Fuel": "HFE-134",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "219",
          "Fuels": "Refrigerant & other",
          "Type": "Fluorinated ethers",
          "Fuel": "HFE-143a",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "220",
          "Fuels": "Refrigerant & other",
          "Type": "Fluorinated ethers",
          "Fuel": "HCFE-235da2",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "221",
          "Fuels": "Refrigerant & other",
          "Type": "Fluorinated ethers",
          "Fuel": "HFE-245cb2",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "222",
          "Fuels": "Refrigerant & other",
          "Type": "Fluorinated ethers",
          "Fuel": "HFE-245fa2",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "223",
          "Fuels": "Refrigerant & other",
          "Type": "Fluorinated ethers",
          "Fuel": "HFE-254cb2",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "224",
          "Fuels": "Refrigerant & other",
          "Type": "Fluorinated ethers",
          "Fuel": "HFE-347mcc3",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "225",
          "Fuels": "Refrigerant & other",
          "Type": "Fluorinated ethers",
          "Fuel": "HFE-347pcf2",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "226",
          "Fuels": "Refrigerant & other",
          "Type": "Fluorinated ethers",
          "Fuel": "HFE-356pcc3",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "227",
          "Fuels": "Refrigerant & other",
          "Type": "Fluorinated ethers",
          "Fuel": "HFE-449sl (HFE-7100)",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "228",
          "Fuels": "Refrigerant & other",
          "Type": "Fluorinated ethers",
          "Fuel": "HFE-569sf2 (HFE-7200)",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "229",
          "Fuels": "Refrigerant & other",
          "Type": "Fluorinated ethers",
          "Fuel": "HFE-43-10pccc124 (H-Galden1040x)",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "230",
          "Fuels": "Refrigerant & other",
          "Type": "Fluorinated ethers",
          "Fuel": "HFE-236ca12 (HG-10)",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "231",
          "Fuels": "Refrigerant & other",
          "Type": "Fluorinated ethers",
          "Fuel": "HFE-338pcc13 (HG-01)",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "232",
          "Fuels": "Refrigerant & other",
          "Type": "Other refrigerants",
          "Fuel": "PFPMIE",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "233",
          "Fuels": "Refrigerant & other",
          "Type": "Other refrigerants",
          "Fuel": "Dimethylether",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "234",
          "Fuels": "Refrigerant & other",
          "Type": "Other refrigerants",
          "Fuel": "Methylene chloride",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "235",
          "Fuels": "Refrigerant & other",
          "Type": "Other refrigerants",
          "Fuel": "Methyl chloride",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "236",
          "Fuels": "Refrigerant & other",
          "Type": "Other refrigerants",
          "Fuel": "R290 = propane",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "237",
          "Fuels": "Refrigerant & other",
          "Type": "Other refrigerants",
          "Fuel": "R600A = isobutane",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "240",
          "Fuels": "Refrigerant & other",
          "Type": "Montreal protocol - blends",
          "Fuel": "R406A",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "241",
          "Fuels": "Refrigerant & other",
          "Type": "Montreal protocol - blends",
          "Fuel": "R409A",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "242",
          "Fuels": "Refrigerant & other",
          "Type": "Montreal protocol - blends",
          "Fuel": "R502",
          "Unit": "kg",
          "Amount": "",
          "Factor": ""
        }
      ]
      ,
      "Elec heat cooling": [
        {
          "Reference": 2938,
          "Reference 2": 814,
          "Activity": "Electricity",
          "Country-Type": "--",
          "Unit": "kWh",
          "Amount": null,
          "GEF Factors": null,
          "T&D Factors": null
        },
        {
          "Reference": 667,
          "Reference 2": 815,
          "Activity": "Heat and steam",
          "Country-Type": "District heat and steam",
          "Unit": "kWh",
          "Amount": null,
          "GEF Factors": null,
          "T&D Factors": null
        },
        {
          "Reference": 3172,
          "Reference 2": null,
          "Activity": "District cooling",
          "Country-Type": "--",
          "Unit": "Ton of refrigeration",
          "Amount": null,
          "GEF Factors": null,
          "T&D Factors": null
        },
        {
          "Reference": 2938,
          "Reference 2": 814,
          "Activity": "Electricity - Backup",
          "Country-Type": "--",
          "Unit": "kWh",
          "Amount": null,
          "GEF Factors": null,
          "T&D Factors": null
        }
      ],
      "Owned Vehicles": [
        {
          "Scope": "Scope 1",
          "Reference": "345",
          "Level 1": "Passenger vehicles",
          "Level 2": "Cars (by size)",
          "Level 3": "Small car",
          "Fuel": "Plug-in Hybrid Electric Vehicle",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },

        {
          "Scope": "Scope 1",
          "Reference": "361",
          "Level 1": "Passenger vehicles",
          "Level 2": "Cars (by size)",
          "Level 3": "Medium car",
          "Fuel": "Plug-in Hybrid Electric Vehicle",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },

        {
          "Scope": "Scope 1",
          "Reference": "377",
          "Level 1": "Passenger vehicles",
          "Level 2": "Cars (by size)",
          "Level 3": "Large car",
          "Fuel": "Plug-in Hybrid Electric Vehicle",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },

        {
          "Scope": "Scope 1",
          "Reference": "393",
          "Level 1": "Passenger vehicles",
          "Level 2": "Cars (by size)",
          "Level 3": "Average car",
          "Fuel": "Plug-in Hybrid Electric Vehicle",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },

        {
          "Scope": "Scope 1",
          "Reference": "333",
          "Level 1": "Passenger vehicles",
          "Level 2": "Cars (by size)",
          "Level 3": "Small car",
          "Fuel": "Diesel",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "335",
          "Level 1": "Passenger vehicles",
          "Level 2": "Cars (by size)",
          "Level 3": "Small car",
          "Fuel": "Petrol",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "337",
          "Level 1": "Passenger vehicles",
          "Level 2": "Cars (by size)",
          "Level 3": "Small car",
          "Fuel": "Hybrid",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "343",
          "Level 1": "Passenger vehicles",
          "Level 2": "Cars (by size)",
          "Level 3": "Small car",
          "Fuel": "Unknown",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "349",
          "Level 1": "Passenger vehicles",
          "Level 2": "Cars (by size)",
          "Level 3": "Medium car",
          "Fuel": "Diesel",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "351",
          "Level 1": "Passenger vehicles",
          "Level 2": "Cars (by size)",
          "Level 3": "Medium car",
          "Fuel": "Petrol",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "353",
          "Level 1": "Passenger vehicles",
          "Level 2": "Cars (by size)",
          "Level 3": "Medium car",
          "Fuel": "Hybrid",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "355",
          "Level 1": "Passenger vehicles",
          "Level 2": "Cars (by size)",
          "Level 3": "Medium car",
          "Fuel": "CNG",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "357",
          "Level 1": "Passenger vehicles",
          "Level 2": "Cars (by size)",
          "Level 3": "Medium car",
          "Fuel": "LPG",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "359",
          "Level 1": "Passenger vehicles",
          "Level 2": "Cars (by size)",
          "Level 3": "Medium car",
          "Fuel": "Unknown",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "365",
          "Level 1": "Passenger vehicles",
          "Level 2": "Cars (by size)",
          "Level 3": "Large car",
          "Fuel": "Diesel",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "367",
          "Level 1": "Passenger vehicles",
          "Level 2": "Cars (by size)",
          "Level 3": "Large car",
          "Fuel": "Petrol",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "369",
          "Level 1": "Passenger vehicles",
          "Level 2": "Cars (by size)",
          "Level 3": "Large car",
          "Fuel": "Hybrid",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "371",
          "Level 1": "Passenger vehicles",
          "Level 2": "Cars (by size)",
          "Level 3": "Large car",
          "Fuel": "CNG",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "373",
          "Level 1": "Passenger vehicles",
          "Level 2": "Cars (by size)",
          "Level 3": "Large car",
          "Fuel": "LPG",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "375",
          "Level 1": "Passenger vehicles",
          "Level 2": "Cars (by size)",
          "Level 3": "Large car",
          "Fuel": "Unknown",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "381",
          "Level 1": "Passenger vehicles",
          "Level 2": "Cars (by size)",
          "Level 3": "Average car",
          "Fuel": "Diesel",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "383",
          "Level 1": "Passenger vehicles",
          "Level 2": "Cars (by size)",
          "Level 3": "Average car",
          "Fuel": "Petrol",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "385",
          "Level 1": "Passenger vehicles",
          "Level 2": "Cars (by size)",
          "Level 3": "Average car",
          "Fuel": "Hybrid",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "387",
          "Level 1": "Passenger vehicles",
          "Level 2": "Cars (by size)",
          "Level 3": "Average car",
          "Fuel": "CNG",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "389",
          "Level 1": "Passenger vehicles",
          "Level 2": "Cars (by size)",
          "Level 3": "Average car",
          "Fuel": "LPG",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "391",
          "Level 1": "Passenger vehicles",
          "Level 2": "Cars (by size)",
          "Level 3": "Average car",
          "Fuel": "Unknown",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "397",
          "Level 1": "Passenger vehicles",
          "Level 2": "Motorbike",
          "Level 3": "Small",
          "Fuel": "",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "399",
          "Level 1": "Passenger vehicles",
          "Level 2": "Motorbike",
          "Level 3": "Medium",
          "Fuel": "",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "401",
          "Level 1": "Passenger vehicles",
          "Level 2": "Motorbike",
          "Level 3": "Large",
          "Fuel": "",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "403",
          "Level 1": "Passenger vehicles",
          "Level 2": "Motorbike",
          "Level 3": "Average",
          "Fuel": "",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },


        {
          "Scope": "Scope 1",
          "Reference": "405",
          "Level 1": "Delivery vehicles",
          "Level 2": "Vans",
          "Level 3": "Class I (up to 1.305 tonnes)",
          "Fuel": "Diesel",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "407",
          "Level 1": "Delivery vehicles",
          "Level 2": "Vans",
          "Level 3": "Class I (up to 1.305 tonnes)",
          "Fuel": "Petrol",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "409",
          "Level 1": "Delivery vehicles",
          "Level 2": "Vans",
          "Level 3": "Class I (up to 1.305 tonnes)",
          "Fuel": "CNG",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "411",
          "Level 1": "Delivery vehicles",
          "Level 2": "Vans",
          "Level 3": "Class I (up to 1.305 tonnes)",
          "Fuel": "LPG",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "413",
          "Level 1": "Delivery vehicles",
          "Level 2": "Vans",
          "Level 3": "Class I (up to 1.305 tonnes)",
          "Fuel": "Unknown",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "419",
          "Level 1": "Delivery vehicles",
          "Level 2": "Vans",
          "Level 3": "Class II (1.305 to 1.74 tonnes)",
          "Fuel": "Diesel",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "421",
          "Level 1": "Delivery vehicles",
          "Level 2": "Vans",
          "Level 3": "Class II (1.305 to 1.74 tonnes)",
          "Fuel": "Petrol",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "423",
          "Level 1": "Delivery vehicles",
          "Level 2": "Vans",
          "Level 3": "Class II (1.305 to 1.74 tonnes)",
          "Fuel": "CNG",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "425",
          "Level 1": "Delivery vehicles",
          "Level 2": "Vans",
          "Level 3": "Class II (1.305 to 1.74 tonnes)",
          "Fuel": "LPG",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "427",
          "Level 1": "Delivery vehicles",
          "Level 2": "Vans",
          "Level 3": "Class II (1.305 to 1.74 tonnes)",
          "Fuel": "Unknown",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "433",
          "Level 1": "Delivery vehicles",
          "Level 2": "Vans",
          "Level 3": "Class III (1.74 to 3.5 tonnes)",
          "Fuel": "Diesel",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "435",
          "Level 1": "Delivery vehicles",
          "Level 2": "Vans",
          "Level 3": "Class III (1.74 to 3.5 tonnes)",
          "Fuel": "Petrol",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "437",
          "Level 1": "Delivery vehicles",
          "Level 2": "Vans",
          "Level 3": "Class III (1.74 to 3.5 tonnes)",
          "Fuel": "CNG",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "439",
          "Level 1": "Delivery vehicles",
          "Level 2": "Vans",
          "Level 3": "Class III (1.74 to 3.5 tonnes)",
          "Fuel": "LPG",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "441",
          "Level 1": "Delivery vehicles",
          "Level 2": "Vans",
          "Level 3": "Class III (1.74 to 3.5 tonnes)",
          "Fuel": "Unknown",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "447",
          "Level 1": "Delivery vehicles",
          "Level 2": "Vans",
          "Level 3": "Average (up to 3.5 tonnes)",
          "Fuel": "Diesel",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "449",
          "Level 1": "Delivery vehicles",
          "Level 2": "Vans",
          "Level 3": "Average (up to 3.5 tonnes)",
          "Fuel": "Petrol",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "451",
          "Level 1": "Delivery vehicles",
          "Level 2": "Vans",
          "Level 3": "Average (up to 3.5 tonnes)",
          "Fuel": "CNG",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "453",
          "Level 1": "Delivery vehicles",
          "Level 2": "Vans",
          "Level 3": "Average (up to 3.5 tonnes)",
          "Fuel": "LPG",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "455",
          "Level 1": "Delivery vehicles",
          "Level 2": "Vans",
          "Level 3": "Average (up to 3.5 tonnes)",
          "Fuel": "Unknown",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "467",
          "Level 1": "Delivery vehicles",
          "Level 2": "HGV (all diesel)",
          "Level 3": "Rigid (>3.5 - 7.5 tonnes)",
          "Fuel": "Average laden",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "475",
          "Level 1": "Delivery vehicles",
          "Level 2": "HGV (all diesel)",
          "Level 3": "Rigid (>7.5 tonnes-17 tonnes)",
          "Fuel": "Average laden",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "483",
          "Level 1": "Delivery vehicles",
          "Level 2": "HGV (all diesel)",
          "Level 3": "Rigid (>17 tonnes)",
          "Fuel": "Average laden",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "491",
          "Level 1": "Delivery vehicles",
          "Level 2": "HGV (all diesel)",
          "Level 3": "All rigids",
          "Fuel": "Average laden",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "499",
          "Level 1": "Delivery vehicles",
          "Level 2": "HGV (all diesel)",
          "Level 3": "Articulated (>3.5 - 33t)",
          "Fuel": "Average laden",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "507",
          "Level 1": "Delivery vehicles",
          "Level 2": "HGV (all diesel)",
          "Level 3": "Articulated (>33t)",
          "Fuel": "Average laden",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "515",
          "Level 1": "Delivery vehicles",
          "Level 2": "HGV (all diesel)",
          "Level 3": "All artics",
          "Fuel": "Average laden",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "523",
          "Level 1": "Delivery vehicles",
          "Level 2": "HGV (all diesel)",
          "Level 3": "All HGVs",
          "Fuel": "Average laden",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "531",
          "Level 1": "Delivery vehicles",
          "Level 2": "HGVs refrigerated (all diesel)",
          "Level 3": "Rigid (>3.5 - 7.5 tonnes)",
          "Fuel": "Average laden",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "539",
          "Level 1": "Delivery vehicles",
          "Level 2": "HGVs refrigerated (all diesel)",
          "Level 3": "Rigid (>7.5 tonnes-17 tonnes)",
          "Fuel": "Average laden",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "547",
          "Level 1": "Delivery vehicles",
          "Level 2": "HGVs refrigerated (all diesel)",
          "Level 3": "Rigid (>17 tonnes)",
          "Fuel": "Average laden",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "555",
          "Level 1": "Delivery vehicles",
          "Level 2": "HGVs refrigerated (all diesel)",
          "Level 3": "All rigids",
          "Fuel": "Average laden",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "563",
          "Level 1": "Delivery vehicles",
          "Level 2": "HGVs refrigerated (all diesel)",
          "Level 3": "Articulated (>3.5 - 33t)",
          "Fuel": "Average laden",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "571",
          "Level 1": "Delivery vehicles",
          "Level 2": "HGVs refrigerated (all diesel)",
          "Level 3": "Articulated (>33t)",
          "Fuel": "Average laden",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "579",
          "Level 1": "Delivery vehicles",
          "Level 2": "HGVs refrigerated (all diesel)",
          "Level 3": "All artics",
          "Fuel": "Average laden",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 1",
          "Reference": "587",
          "Level 1": "Delivery vehicles",
          "Level 2": "HGVs refrigerated (all diesel)",
          "Level 3": "All HGVs",
          "Fuel": "Average laden",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 2",
          "Reference": "628",
          "Level 1": "Passenger vehicles",
          "Level 2": "Cars (by size)",
          "Level 3": "Small car",
          "Fuel": "Battery Electric Vehicle",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 2",
          "Reference": "632",
          "Level 1": "Passenger vehicles",
          "Level 2": "Cars (by size)",
          "Level 3": "Medium car",
          "Fuel": "Battery Electric Vehicle",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 2",
          "Reference": "636",
          "Level 1": "Passenger vehicles",
          "Level 2": "Cars (by size)",
          "Level 3": "Large car",
          "Fuel": "Battery Electric Vehicle",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 2",
          "Reference": "640",
          "Level 1": "Passenger vehicles",
          "Level 2": "Cars (by size)",
          "Level 3": "Average car",
          "Fuel": "Battery Electric Vehicle",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 2",
          "Reference": "645",
          "Level 1": "Delivery vehicles",
          "Level 2": "Vans",
          "Level 3": "Class I (up to 1.305 tonnes)",
          "Fuel": "Battery Electric Vehicle",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 2",
          "Reference": "651",
          "Level 1": "Delivery vehicles",
          "Level 2": "Vans",
          "Level 3": "Class II (1.305 to 1.74 tonnes)",
          "Fuel": "Battery Electric Vehicle",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 2",
          "Reference": "657",
          "Level 1": "Delivery vehicles",
          "Level 2": "Vans",
          "Level 3": "Class III (1.74 to 3.5 tonnes)",
          "Fuel": "Battery Electric Vehicle",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Scope": "Scope 2",
          "Reference": "663",
          "Level 1": "Delivery vehicles",
          "Level 2": "Vans",
          "Level 3": "Average (up to 3.5 tonnes)",
          "Fuel": "Battery Electric Vehicle",
          "Unit": "km",
          "Distance (km)": "",
          "Factor": ""
        },
      ],
      "Materials": [
        {
          "Reference": "672",
          "Activity": "Construction",
          "Waste type": "Aggregates",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "676",
          "Activity": "Construction",
          "Waste type": "Average construction",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "680",
          "Activity": "Construction",
          "Waste type": "Asbestos",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "684",
          "Activity": "Construction",
          "Waste type": "Asphalt",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "688",
          "Activity": "Construction",
          "Waste type": "Bricks",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "692",
          "Activity": "Construction",
          "Waste type": "Concrete",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "696",
          "Activity": "Construction",
          "Waste type": "Insulation",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "700",
          "Activity": "Construction",
          "Waste type": "Metals",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "708",
          "Activity": "Construction",
          "Waste type": "Mineral oil",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "712",
          "Activity": "Construction",
          "Waste type": "Plasterboard",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "716",
          "Activity": "Construction",
          "Waste type": "Tyres",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "720",
          "Activity": "Construction",
          "Waste type": "Wood",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "728",
          "Activity": "Other",
          "Waste type": "Glass",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "732",
          "Activity": "Other",
          "Waste type": "Clothing",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "736",
          "Activity": "Other",
          "Waste type": "Food and drink",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "740",
          "Activity": "Organic",
          "Waste type": "Compost derived from garden waste",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "741",
          "Activity": "Organic",
          "Waste type": "Compost derived from food and garden waste",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "742",
          "Activity": "Electrical items",
          "Waste type": "Electrical items - fridges and freezers",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "746",
          "Activity": "Electrical items",
          "Waste type": "Electrical items - large",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "750",
          "Activity": "Electrical items",
          "Waste type": "Electrical items - IT",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "754",
          "Activity": "Electrical items",
          "Waste type": "Electrical items - small",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "758",
          "Activity": "Electrical items",
          "Waste type": "Batteries - Alkaline",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "762",
          "Activity": "Electrical items",
          "Waste type": "Batteries - Li ion",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "766",
          "Activity": "Electrical items",
          "Waste type": "Batteries - NiMh",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "770",
          "Activity": "Metal",
          "Waste type": "Metal: aluminium cans and foil (excl. forming)",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "772",
          "Activity": "Metal",
          "Waste type": "Metal: mixed cans",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "774",
          "Activity": "Metal",
          "Waste type": "Metal: scrap metal",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "776",
          "Activity": "Metal",
          "Waste type": "Metal: steel cans",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "778",
          "Activity": "Plastic",
          "Waste type": "Plastics: average plastics",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "781",
          "Activity": "Plastic",
          "Waste type": "Plastics: average plastic film",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "784",
          "Activity": "Plastic",
          "Waste type": "Plastics: average plastic rigid",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "787",
          "Activity": "Plastic",
          "Waste type": "Plastics: HDPE (incl. forming)",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "790",
          "Activity": "Plastic",
          "Waste type": "Plastics: LDPE and LLDPE (incl. forming)",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "793",
          "Activity": "Plastic",
          "Waste type": "Plastics: PET (incl. forming)",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "796",
          "Activity": "Plastic",
          "Waste type": "Plastics: PP (incl. forming)",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "799",
          "Activity": "Plastic",
          "Waste type": "Plastics: PS (incl. forming)",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "802",
          "Activity": "Plastic",
          "Waste type": "Plastics: PVC (incl. forming)",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "805",
          "Activity": "Paper",
          "Waste type": "Paper and board: board",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "808",
          "Activity": "Paper",
          "Waste type": "Paper and board: mixed",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        },
        {
          "Reference": "811",
          "Activity": "Paper",
          "Waste type": "Paper and board: paper",
          "Unit": "tonnes",
          "Amount (tonnes)": "",
          "Factor": ""
        }
      ],
      "WTT- fuels": [
        {
          "Reference": "894",
          "Type": "WTT- gaseous fuels",
          "Fuel": "Butane",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "898",
          "Type": "WTT- gaseous fuels",
          "Fuel": "CNG",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "902",
          "Type": "WTT- gaseous fuels",
          "Fuel": "LNG",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "906",
          "Type": "WTT- gaseous fuels",
          "Fuel": "LPG",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "910",
          "Type": "WTT- gaseous fuels",
          "Fuel": "Natural Gas",
          "Unit": "cubic metres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "914",
          "Type": "WTT- gaseous fuels",
          "Fuel": "Other Petroleum Gas",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "918",
          "Type": "WTT- gaseous fuels",
          "Fuel": "Propane",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "922",
          "Type": "WTT- liquid fuels",
          "Fuel": "Aviation Spirit",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "926",
          "Type": "WTT- liquid fuels",
          "Fuel": "Aviation Turbine Fuel",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "930",
          "Type": "WTT- liquid fuels",
          "Fuel": "Burning Oil",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "934",
          "Type": "WTT- liquid fuels",
          "Fuel": "Diesel (average biofuel blend)",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "938",
          "Type": "WTT- liquid fuels",
          "Fuel": "Diesel (100% mineral diesel)",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "942",
          "Type": "WTT- liquid fuels",
          "Fuel": "Fuel Oil",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "946",
          "Type": "WTT- liquid fuels",
          "Fuel": "Gas Oil",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "950",
          "Type": "WTT- liquid fuels",
          "Fuel": "Lubricants",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "954",
          "Type": "WTT- liquid fuels",
          "Fuel": "Naphtha",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "958",
          "Type": "WTT- liquid fuels",
          "Fuel": "Petrol (average biofuel blend)",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "962",
          "Type": "WTT- liquid fuels",
          "Fuel": "Petrol (100% mineral petrol)",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "966",
          "Type": "WTT- liquid fuels",
          "Fuel": "Processed fuel oils - residual oil",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "970",
          "Type": "WTT- liquid fuels",
          "Fuel": "Processed fuel oils - distillate oil",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "974",
          "Type": "WTT- liquid fuels",
          "Fuel": "Refinery Miscellaneous",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "978",
          "Type": "WTT- liquid fuels",
          "Fuel": "Waste oils",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "982",
          "Type": "WTT- liquid fuels",
          "Fuel": "Marine gas oil",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "986",
          "Type": "WTT- liquid fuels",
          "Fuel": "Marine fuel oil",
          "Unit": "litres",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "2783",
          "Type": "WTT- gaseous fuels",
          "Fuel": "Natural gas (100% mineral blend)",
          "Unit": "cubic metres",
          "Amount": "",
          "Factor": ""
        }
      ],
      "Waste Disposal": [
        {
          "Reference": "2518",
          "Activity": "Construction",
          "Waste Material": "Aggregates",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2518",
          "Activity": "Construction",
          "Waste Material": "Aggregates",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2518",
          "Activity": "Construction",
          "Waste Material": "Aggregates",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2524",
          "Activity": "Construction",
          "Waste Material": "Average construction",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2524",
          "Activity": "Construction",
          "Waste Material": "Average construction",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2524",
          "Activity": "Construction",
          "Waste Material": "Average construction",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2530",
          "Activity": "Construction",
          "Waste Material": "Asbestos",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2530",
          "Activity": "Construction",
          "Waste Material": "Asbestos",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2530",
          "Activity": "Construction",
          "Waste Material": "Asbestos",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2536",
          "Activity": "Construction",
          "Waste Material": "Asphalt",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2536",
          "Activity": "Construction",
          "Waste Material": "Asphalt",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2536",
          "Activity": "Construction",
          "Waste Material": "Asphalt",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2542",
          "Activity": "Construction",
          "Waste Material": "Bricks",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2542",
          "Activity": "Construction",
          "Waste Material": "Bricks",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2542",
          "Activity": "Construction",
          "Waste Material": "Bricks",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2548",
          "Activity": "Construction",
          "Waste Material": "Concrete",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2548",
          "Activity": "Construction",
          "Waste Material": "Concrete",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2548",
          "Activity": "Construction",
          "Waste Material": "Concrete",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2554",
          "Activity": "Construction",
          "Waste Material": "Insulation",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2554",
          "Activity": "Construction",
          "Waste Material": "Insulation",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2554",
          "Activity": "Construction",
          "Waste Material": "Insulation",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2560",
          "Activity": "Construction",
          "Waste Material": "Metals",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2560",
          "Activity": "Construction",
          "Waste Material": "Metals",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2560",
          "Activity": "Construction",
          "Waste Material": "Metals",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2566",
          "Activity": "Construction",
          "Waste Material": "Soils",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2566",
          "Activity": "Construction",
          "Waste Material": "Soils",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2566",
          "Activity": "Construction",
          "Waste Material": "Soils",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2572",
          "Activity": "Construction",
          "Waste Material": "Mineral oil",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2572",
          "Activity": "Construction",
          "Waste Material": "Mineral oil",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2572",
          "Activity": "Construction",
          "Waste Material": "Mineral oil",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2578",
          "Activity": "Construction",
          "Waste Material": "Plasterboard",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2578",
          "Activity": "Construction",
          "Waste Material": "Plasterboard",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2578",
          "Activity": "Construction",
          "Waste Material": "Plasterboard",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2584",
          "Activity": "Construction",
          "Waste Material": "Tyres",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2584",
          "Activity": "Construction",
          "Waste Material": "Tyres",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2584",
          "Activity": "Construction",
          "Waste Material": "Tyres",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2590",
          "Activity": "Construction",
          "Waste Material": "Wood",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2590",
          "Activity": "Construction",
          "Waste Material": "Wood",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2590",
          "Activity": "Construction",
          "Waste Material": "Wood",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2596",
          "Activity": "Other",
          "Waste Material": "Books",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2596",
          "Activity": "Other",
          "Waste Material": "Books",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2596",
          "Activity": "Other",
          "Waste Material": "Books",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2602",
          "Activity": "Other",
          "Waste Material": "Glass",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2602",
          "Activity": "Other",
          "Waste Material": "Glass",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2602",
          "Activity": "Other",
          "Waste Material": "Glass",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2608",
          "Activity": "Other",
          "Waste Material": "Clothing",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2608",
          "Activity": "Other",
          "Waste Material": "Clothing",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2608",
          "Activity": "Other",
          "Waste Material": "Clothing",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2614",
          "Activity": "Refuse",
          "Waste Material": "Household residual waste",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2614",
          "Activity": "Refuse",
          "Waste Material": "Household residual waste",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2614",
          "Activity": "Refuse",
          "Waste Material": "Household residual waste",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2620",
          "Activity": "Refuse",
          "Waste Material": "Organic: food and drink waste",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2620",
          "Activity": "Refuse",
          "Waste Material": "Organic: food and drink waste",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2620",
          "Activity": "Refuse",
          "Waste Material": "Organic: food and drink waste",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2626",
          "Activity": "Refuse",
          "Waste Material": "Organic: garden waste",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2626",
          "Activity": "Refuse",
          "Waste Material": "Organic: garden waste",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2626",
          "Activity": "Refuse",
          "Waste Material": "Organic: garden waste",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2632",
          "Activity": "Refuse",
          "Waste Material": "Organic: mixed food and garden waste",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2632",
          "Activity": "Refuse",
          "Waste Material": "Organic: mixed food and garden waste",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2632",
          "Activity": "Refuse",
          "Waste Material": "Organic: mixed food and garden waste",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2638",
          "Activity": "Refuse",
          "Waste Material": "Commercial and industrial waste",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2638",
          "Activity": "Refuse",
          "Waste Material": "Commercial and industrial waste",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2638",
          "Activity": "Refuse",
          "Waste Material": "Commercial and industrial waste",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2642",
          "Activity": "Electrical items",
          "Waste Material": "WEEE - fridges and freezers",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2642",
          "Activity": "Electrical items",
          "Waste Material": "WEEE - fridges and freezers",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2642",
          "Activity": "Electrical items",
          "Waste Material": "WEEE - fridges and freezers",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2646",
          "Activity": "Electrical items",
          "Waste Material": "WEEE - large",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2646",
          "Activity": "Electrical items",
          "Waste Material": "WEEE - large",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2646",
          "Activity": "Electrical items",
          "Waste Material": "WEEE - large",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2650",
          "Activity": "Electrical items",
          "Waste Material": "WEEE - mixed",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2650",
          "Activity": "Electrical items",
          "Waste Material": "WEEE - mixed",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2650",
          "Activity": "Electrical items",
          "Waste Material": "WEEE - mixed",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2654",
          "Activity": "Electrical items",
          "Waste Material": "WEEE - small",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2654",
          "Activity": "Electrical items",
          "Waste Material": "WEEE - small",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2654",
          "Activity": "Electrical items",
          "Waste Material": "WEEE - small",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2658",
          "Activity": "Electrical items",
          "Waste Material": "Batteries",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2658",
          "Activity": "Electrical items",
          "Waste Material": "Batteries",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2658",
          "Activity": "Electrical items",
          "Waste Material": "Batteries",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2662",
          "Activity": "Metal",
          "Waste Material": "Metal: aluminium cans and foil (excl. forming)",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2662",
          "Activity": "Metal",
          "Waste Material": "Metal: aluminium cans and foil (excl. forming)",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2662",
          "Activity": "Metal",
          "Waste Material": "Metal: aluminium cans and foil (excl. forming)",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2666",
          "Activity": "Metal",
          "Waste Material": "Metal: mixed cans",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2666",
          "Activity": "Metal",
          "Waste Material": "Metal: mixed cans",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2666",
          "Activity": "Metal",
          "Waste Material": "Metal: mixed cans",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2670",
          "Activity": "Metal",
          "Waste Material": "Metal: scrap metal",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2670",
          "Activity": "Metal",
          "Waste Material": "Metal: scrap metal",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2670",
          "Activity": "Metal",
          "Waste Material": "Metal: scrap metal",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2674",
          "Activity": "Metal",
          "Waste Material": "Metal: steel cans",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2674",
          "Activity": "Metal",
          "Waste Material": "Metal: steel cans",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2674",
          "Activity": "Metal",
          "Waste Material": "Metal: steel cans",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2678",
          "Activity": "Plastic",
          "Waste Material": "Plastics: average plastics",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2678",
          "Activity": "Plastic",
          "Waste Material": "Plastics: average plastics",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2678",
          "Activity": "Plastic",
          "Waste Material": "Plastics: average plastics",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2682",
          "Activity": "Plastic",
          "Waste Material": "Plastics: average plastic film",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2682",
          "Activity": "Plastic",
          "Waste Material": "Plastics: average plastic film",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2682",
          "Activity": "Plastic",
          "Waste Material": "Plastics: average plastic film",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2686",
          "Activity": "Plastic",
          "Waste Material": "Plastics: average plastic rigid",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2686",
          "Activity": "Plastic",
          "Waste Material": "Plastics: average plastic rigid",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2686",
          "Activity": "Plastic",
          "Waste Material": "Plastics: average plastic rigid",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2690",
          "Activity": "Plastic",
          "Waste Material": "Plastics: HDPE (incl. forming)",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2690",
          "Activity": "Plastic",
          "Waste Material": "Plastics: HDPE (incl. forming)",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2690",
          "Activity": "Plastic",
          "Waste Material": "Plastics: HDPE (incl. forming)",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2694",
          "Activity": "Plastic",
          "Waste Material": "Plastics: LDPE and LLDPE (incl. forming)",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2694",
          "Activity": "Plastic",
          "Waste Material": "Plastics: LDPE and LLDPE (incl. forming)",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2694",
          "Activity": "Plastic",
          "Waste Material": "Plastics: LDPE and LLDPE (incl. forming)",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2698",
          "Activity": "Plastic",
          "Waste Material": "Plastics: PET (incl. forming)",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2698",
          "Activity": "Plastic",
          "Waste Material": "Plastics: PET (incl. forming)",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2698",
          "Activity": "Plastic",
          "Waste Material": "Plastics: PET (incl. forming)",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2702",
          "Activity": "Plastic",
          "Waste Material": "Plastics: PP (incl. forming)",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2702",
          "Activity": "Plastic",
          "Waste Material": "Plastics: PP (incl. forming)",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2702",
          "Activity": "Plastic",
          "Waste Material": "Plastics: PP (incl. forming)",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2706",
          "Activity": "Plastic",
          "Waste Material": "Plastics: PS (incl. forming)",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2706",
          "Activity": "Plastic",
          "Waste Material": "Plastics: PS (incl. forming)",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2706",
          "Activity": "Plastic",
          "Waste Material": "Plastics: PS (incl. forming)",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2710",
          "Activity": "Plastic",
          "Waste Material": "Plastics: PVC (incl. forming)",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2710",
          "Activity": "Plastic",
          "Waste Material": "Plastics: PVC (incl. forming)",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2710",
          "Activity": "Plastic",
          "Waste Material": "Plastics: PVC (incl. forming)",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2715",
          "Activity": "Paper",
          "Waste Material": "Paper and board: board",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2715",
          "Activity": "Paper",
          "Waste Material": "Paper and board: board",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2715",
          "Activity": "Paper",
          "Waste Material": "Paper and board: board",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2720",
          "Activity": "Paper",
          "Waste Material": "Paper and board: mixed",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2720",
          "Activity": "Paper",
          "Waste Material": "Paper and board: mixed",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2720",
          "Activity": "Paper",
          "Waste Material": "Paper and board: mixed",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2725",
          "Activity": "Paper",
          "Waste Material": "Paper and board: paper",
          "Source Description": "",
          "Disposal Method": "Recycled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2725",
          "Activity": "Paper",
          "Waste Material": "Paper and board: paper",
          "Source Description": "",
          "Disposal Method": "Landfilled",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        },
        {
          "Reference": "2725",
          "Activity": "Paper",
          "Waste Material": "Paper and board: paper",
          "Source Description": "",
          "Disposal Method": "Combusted",
          "Unit": "tonnes",
          "Weight": "",
          "Factor": ""
        }
      ]

      ,
      "Flight": [
        {
          "Origin (city or IATA code)": "Delhi",
          "Destination (city or IATA code)": "Mumbai",
          "Class": "Economy",
          "Single way / \nreturn": " Single way",
          "kg CO2e": ""
        }
      ],
      "Accommodation": [
        {
          "Reference": 2806,
          "Country": "India",
          "Number of occupied rooms": "",
          "Number of nights per room": "",
          "Factor": ""
        },

      ],
      "Business travel - land and sea": [
        {
          "Reference": "1850",
          "Vehicle": "Cars (by size)",
          "Type": "Small car",
          "Fuel": "Battery Electric Vehicle",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1866",
          "Vehicle": "Cars (by size)",
          "Type": "Medium car",
          "Fuel": "Battery Electric Vehicle",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1882",
          "Vehicle": "Cars (by size)",
          "Type": "Large car",
          "Fuel": "Battery Electric Vehicle",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1898",
          "Vehicle": "Cars (by size)",
          "Type": "Average car",
          "Fuel": "Battery Electric Vehicle",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1842",
          "Vehicle": "Cars (by size)",
          "Type": "Small car",
          "Fuel": "CNG",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1858",
          "Vehicle": "Cars (by size)",
          "Type": "Medium car",
          "Fuel": "CNG",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1874",
          "Vehicle": "Cars (by size)",
          "Type": "Large car",
          "Fuel": "CNG",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1890",
          "Vehicle": "Cars (by size)",
          "Type": "Average car",
          "Fuel": "CNG",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1836",
          "Vehicle": "Cars (by size)",
          "Type": "Small car",
          "Fuel": "Diesel",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1852",
          "Vehicle": "Cars (by size)",
          "Type": "Medium car",
          "Fuel": "Diesel",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1868",
          "Vehicle": "Cars (by size)",
          "Type": "Large car",
          "Fuel": "Diesel",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1884",
          "Vehicle": "Cars (by size)",
          "Type": "Average car",
          "Fuel": "Diesel",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1840",
          "Vehicle": "Cars (by size)",
          "Type": "Small car",
          "Fuel": "Hybrid",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1856",
          "Vehicle": "Cars (by size)",
          "Type": "Medium car",
          "Fuel": "Hybrid",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1872",
          "Vehicle": "Cars (by size)",
          "Type": "Large car",
          "Fuel": "Hybrid",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1888",
          "Vehicle": "Cars (by size)",
          "Type": "Average car",
          "Fuel": "Hybrid",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1844",
          "Vehicle": "Cars (by size)",
          "Type": "Small car",
          "Fuel": "LPG",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1860",
          "Vehicle": "Cars (by size)",
          "Type": "Medium car",
          "Fuel": "LPG",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1876",
          "Vehicle": "Cars (by size)",
          "Type": "Large car",
          "Fuel": "LPG",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1892",
          "Vehicle": "Cars (by size)",
          "Type": "Average car",
          "Fuel": "LPG",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1838",
          "Vehicle": "Cars (by size)",
          "Type": "Small car",
          "Fuel": "Petrol",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1854",
          "Vehicle": "Cars (by size)",
          "Type": "Medium car",
          "Fuel": "Petrol",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1870",
          "Vehicle": "Cars (by size)",
          "Type": "Large car",
          "Fuel": "Petrol",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1886",
          "Vehicle": "Cars (by size)",
          "Type": "Average car",
          "Fuel": "Petrol",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1848",
          "Vehicle": "Cars (by size)",
          "Type": "Small car",
          "Fuel": "Plug-in Hybrid Electric Vehicle",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1864",
          "Vehicle": "Cars (by size)",
          "Type": "Medium car",
          "Fuel": "Plug-in Hybrid Electric Vehicle",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1880",
          "Vehicle": "Cars (by size)",
          "Type": "Large car",
          "Fuel": "Plug-in Hybrid Electric Vehicle",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1896",
          "Vehicle": "Cars (by size)",
          "Type": "Average car",
          "Fuel": "Plug-in Hybrid Electric Vehicle",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1846",
          "Vehicle": "Cars (by size)",
          "Type": "Small car",
          "Fuel": "Unknown",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1862",
          "Vehicle": "Cars (by size)",
          "Type": "Medium car",
          "Fuel": "Unknown",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1878",
          "Vehicle": "Cars (by size)",
          "Type": "Large car",
          "Fuel": "Unknown",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1894",
          "Vehicle": "Cars (by size)",
          "Type": "Average car",
          "Fuel": "Unknown",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1743",
          "Vehicle": "Ferry",
          "Type": "Foot passenger",
          "Fuel": "",
          "Unit": "passenger.km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1744",
          "Vehicle": "Ferry",
          "Type": "Car passenger",
          "Fuel": "",
          "Unit": "passenger.km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1745",
          "Vehicle": "Ferry",
          "Type": "Average (all passenger)",
          "Fuel": "",
          "Unit": "passenger.km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1900",
          "Vehicle": "Motorbike",
          "Type": "Small",
          "Fuel": "",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1902",
          "Vehicle": "Motorbike",
          "Type": "Medium",
          "Fuel": "",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1904",
          "Vehicle": "Motorbike",
          "Type": "Large",
          "Fuel": "",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1906",
          "Vehicle": "Motorbike",
          "Type": "Average",
          "Fuel": "",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1908",
          "Vehicle": "Taxis",
          "Type": "Regular taxi",
          "Fuel": "",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1909",
          "Vehicle": "Taxis",
          "Type": "Regular taxi",
          "Fuel": "",
          "Unit": "passenger.km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1910",
          "Vehicle": "Taxis",
          "Type": "Black cab",
          "Fuel": "",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1911",
          "Vehicle": "Taxis",
          "Type": "Black cab",
          "Fuel": "",
          "Unit": "passenger.km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1912",
          "Vehicle": "Bus",
          "Type": "Local bus (not London)",
          "Fuel": "",
          "Unit": "passenger.km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1913",
          "Vehicle": "Bus",
          "Type": "Local London bus",
          "Fuel": "",
          "Unit": "passenger.km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1914",
          "Vehicle": "Bus",
          "Type": "Average local bus",
          "Fuel": "",
          "Unit": "passenger.km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1915",
          "Vehicle": "Bus",
          "Type": "Coach",
          "Fuel": "",
          "Unit": "passenger.km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1916",
          "Vehicle": "Rail",
          "Type": "National rail",
          "Fuel": "",
          "Unit": "passenger.km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1917",
          "Vehicle": "Rail",
          "Type": "International rail",
          "Fuel": "",
          "Unit": "passenger.km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1918",
          "Vehicle": "Rail",
          "Type": "Light rail and tram",
          "Fuel": "",
          "Unit": "passenger.km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1919",
          "Vehicle": "Rail",
          "Type": "London Underground",
          "Fuel": "",
          "Unit": "passenger.km",
          "Total distance": "",
          "Factor": ""
        }
      ],
      "Freighting goods": [
        {
          "Reference": "2177",
          "Vehicle": "Vans",
          "Type": "Class I (up to 1.305 tonnes)",
          "Fuel": "Diesel",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2180",
          "Vehicle": "Vans",
          "Type": "Class I (up to 1.305 tonnes)",
          "Fuel": "Petrol",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2183",
          "Vehicle": "Vans",
          "Type": "Class I (up to 1.305 tonnes)",
          "Fuel": "CNG",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2186",
          "Vehicle": "Vans",
          "Type": "Class I (up to 1.305 tonnes)",
          "Fuel": "LPG",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2189",
          "Vehicle": "Vans",
          "Type": "Class I (up to 1.305 tonnes)",
          "Fuel": "Unknown",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2192",
          "Vehicle": "Vans",
          "Type": "Class I (up to 1.305 tonnes)",
          "Fuel": "Plug-in Hybrid Electric Vehicle",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2195",
          "Vehicle": "Vans",
          "Type": "Class I (up to 1.305 tonnes)",
          "Fuel": "Battery Electric Vehicle",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2198",
          "Vehicle": "Vans",
          "Type": "Class II (1.305 to 1.74 tonnes)",
          "Fuel": "Diesel",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2201",
          "Vehicle": "Vans",
          "Type": "Class II (1.305 to 1.74 tonnes)",
          "Fuel": "Petrol",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2204",
          "Vehicle": "Vans",
          "Type": "Class II (1.305 to 1.74 tonnes)",
          "Fuel": "CNG",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2207",
          "Vehicle": "Vans",
          "Type": "Class II (1.305 to 1.74 tonnes)",
          "Fuel": "LPG",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2210",
          "Vehicle": "Vans",
          "Type": "Class II (1.305 to 1.74 tonnes)",
          "Fuel": "Unknown",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2213",
          "Vehicle": "Vans",
          "Type": "Class II (1.305 to 1.74 tonnes)",
          "Fuel": "Plug-in Hybrid Electric Vehicle",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2216",
          "Vehicle": "Vans",
          "Type": "Class II (1.305 to 1.74 tonnes)",
          "Fuel": "Battery Electric Vehicle",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2219",
          "Vehicle": "Vans",
          "Type": "Class III (1.74 to 3.5 tonnes)",
          "Fuel": "Diesel",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2222",
          "Vehicle": "Vans",
          "Type": "Class III (1.74 to 3.5 tonnes)",
          "Fuel": "Petrol",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2225",
          "Vehicle": "Vans",
          "Type": "Class III (1.74 to 3.5 tonnes)",
          "Fuel": "CNG",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2228",
          "Vehicle": "Vans",
          "Type": "Class III (1.74 to 3.5 tonnes)",
          "Fuel": "LPG",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2231",
          "Vehicle": "Vans",
          "Type": "Class III (1.74 to 3.5 tonnes)",
          "Fuel": "Unknown",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2234",
          "Vehicle": "Vans",
          "Type": "Class III (1.74 to 3.5 tonnes)",
          "Fuel": "Plug-in Hybrid Electric Vehicle",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2237",
          "Vehicle": "Vans",
          "Type": "Class III (1.74 to 3.5 tonnes)",
          "Fuel": "Battery Electric Vehicle",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2240",
          "Vehicle": "Vans",
          "Type": "Average (up to 3.5 tonnes)",
          "Fuel": "Diesel",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2243",
          "Vehicle": "Vans",
          "Type": "Average (up to 3.5 tonnes)",
          "Fuel": "Petrol",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2246",
          "Vehicle": "Vans",
          "Type": "Average (up to 3.5 tonnes)",
          "Fuel": "CNG",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2249",
          "Vehicle": "Vans",
          "Type": "Average (up to 3.5 tonnes)",
          "Fuel": "LPG",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2252",
          "Vehicle": "Vans",
          "Type": "Average (up to 3.5 tonnes)",
          "Fuel": "Unknown",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2255",
          "Vehicle": "Vans",
          "Type": "Average (up to 3.5 tonnes)",
          "Fuel": "Plug-in Hybrid Electric Vehicle",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2258",
          "Vehicle": "Vans",
          "Type": "Average (up to 3.5 tonnes)",
          "Fuel": "Battery Electric Vehicle",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2270",
          "Vehicle": "HGV (all diesel)",
          "Type": "Rigid (>3.5 - 7.5 tonnes)",
          "Fuel": "Average laden",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2282",
          "Vehicle": "HGV (all diesel)",
          "Type": "Rigid (>7.5 tonnes-17 tonnes)",
          "Fuel": "Average laden",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2294",
          "Vehicle": "HGV (all diesel)",
          "Type": "Rigid (>17 tonnes)",
          "Fuel": "Average laden",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2306",
          "Vehicle": "HGV (all diesel)",
          "Type": "All rigids",
          "Fuel": "Average laden",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2318",
          "Vehicle": "HGV (all diesel)",
          "Type": "Articulated (>3.5 - 33t)",
          "Fuel": "Average laden",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2330",
          "Vehicle": "HGV (all diesel)",
          "Type": "Articulated (>33t)",
          "Fuel": "Average laden",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2342",
          "Vehicle": "HGV (all diesel)",
          "Type": "All artics",
          "Fuel": "Average laden",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2354",
          "Vehicle": "HGV (all diesel)",
          "Type": "All HGVs",
          "Fuel": "Average laden",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2366",
          "Vehicle": "HGV refrigerated (all diesel)",
          "Type": "Rigid (>3.5 - 7.5 tonnes)",
          "Fuel": "Average laden",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2378",
          "Vehicle": "HGV refrigerated (all diesel)",
          "Type": "Rigid (>7.5 tonnes-17 tonnes)",
          "Fuel": "Average laden",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2390",
          "Vehicle": "HGV refrigerated (all diesel)",
          "Type": "Rigid (>17 tonnes)",
          "Fuel": "Average laden",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2402",
          "Vehicle": "HGV refrigerated (all diesel)",
          "Type": "All rigids",
          "Fuel": "Average laden",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2414",
          "Vehicle": "HGV refrigerated (all diesel)",
          "Type": "Articulated (>3.5 - 33t)",
          "Fuel": "Average laden",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2426",
          "Vehicle": "HGV refrigerated (all diesel)",
          "Type": "Articulated (>33t)",
          "Fuel": "Average laden",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2438",
          "Vehicle": "HGV refrigerated (all diesel)",
          "Type": "All artics",
          "Fuel": "Average laden",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2450",
          "Vehicle": "HGV refrigerated (all diesel)",
          "Type": "All HGVs",
          "Fuel": "Average laden",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2451",
          "Vehicle": "Freight flights",
          "Type": "Domestic, to/from UK",
          "Fuel": "With RF",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2452",
          "Vehicle": "Freight flights",
          "Type": "Domestic, to/from UK",
          "Fuel": "Without RF",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2453",
          "Vehicle": "Freight flights",
          "Type": "Short-haul, to/from UK",
          "Fuel": "With RF",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2454",
          "Vehicle": "Freight flights",
          "Type": "Short-haul, to/from UK",
          "Fuel": "Without RF",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2455",
          "Vehicle": "Freight flights",
          "Type": "Long-haul, to/from UK",
          "Fuel": "With RF",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2456",
          "Vehicle": "Freight flights",
          "Type": "Long-haul, to/from UK",
          "Fuel": "Without RF",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2457",
          "Vehicle": "Freight flights",
          "Type": "International, to/from non-UK",
          "Fuel": "With RF",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2458",
          "Vehicle": "Freight flights",
          "Type": "International, to/from non-UK",
          "Fuel": "Without RF",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2459",
          "Vehicle": "Rail",
          "Type": "Freight train",
          "Fuel": "",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2460",
          "Vehicle": "Sea tanker",
          "Type": "Crude tanker",
          "Fuel": "200,000+ dwt",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2461",
          "Vehicle": "Sea tanker",
          "Type": "Crude tanker",
          "Fuel": "120,000–199,999 dwt",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2462",
          "Vehicle": "Sea tanker",
          "Type": "Crude tanker",
          "Fuel": "80,000–119,999 dwt",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2463",
          "Vehicle": "Sea tanker",
          "Type": "Crude tanker",
          "Fuel": "60,000–79,999 dwt",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2464",
          "Vehicle": "Sea tanker",
          "Type": "Crude tanker",
          "Fuel": "10,000–59,999 dwt",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2465",
          "Vehicle": "Sea tanker",
          "Type": "Crude tanker",
          "Fuel": "0–9999 dwt",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2466",
          "Vehicle": "Sea tanker",
          "Type": "Crude tanker",
          "Fuel": "Average",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2467",
          "Vehicle": "Sea tanker",
          "Type": "Products tanker ",
          "Fuel": "60,000+ dwt",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2468",
          "Vehicle": "Sea tanker",
          "Type": "Products tanker ",
          "Fuel": "20,000–59,999 dwt",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2469",
          "Vehicle": "Sea tanker",
          "Type": "Products tanker ",
          "Fuel": "10,000–19,999 dwt",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2470",
          "Vehicle": "Sea tanker",
          "Type": "Products tanker ",
          "Fuel": "5000–9999 dwt",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2471",
          "Vehicle": "Sea tanker",
          "Type": "Products tanker ",
          "Fuel": "0–4999 dwt",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2472",
          "Vehicle": "Sea tanker",
          "Type": "Products tanker ",
          "Fuel": "Average",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2473",
          "Vehicle": "Sea tanker",
          "Type": "Chemical tanker ",
          "Fuel": "20,000+ dwt",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2474",
          "Vehicle": "Sea tanker",
          "Type": "Chemical tanker ",
          "Fuel": "10,000–19,999 dwt",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2475",
          "Vehicle": "Sea tanker",
          "Type": "Chemical tanker ",
          "Fuel": "5000–9999 dwt",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2476",
          "Vehicle": "Sea tanker",
          "Type": "Chemical tanker ",
          "Fuel": "0–4999 dwt",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2477",
          "Vehicle": "Sea tanker",
          "Type": "Chemical tanker ",
          "Fuel": "Average",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2478",
          "Vehicle": "Sea tanker",
          "Type": "LNG tanker",
          "Fuel": "200,000+ m3",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2479",
          "Vehicle": "Sea tanker",
          "Type": "LNG tanker",
          "Fuel": "0–199,999 m3",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2480",
          "Vehicle": "Sea tanker",
          "Type": "LNG tanker",
          "Fuel": "Average",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2481",
          "Vehicle": "Sea tanker",
          "Type": "LPG Tanker",
          "Fuel": "50,000+ m3",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2482",
          "Vehicle": "Sea tanker",
          "Type": "LPG Tanker",
          "Fuel": "0–49,999 m3",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2483",
          "Vehicle": "Sea tanker",
          "Type": "LPG Tanker",
          "Fuel": "Average",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2484",
          "Vehicle": "Cargo ship",
          "Type": "Bulk carrier",
          "Fuel": "200,000+ dwt",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2485",
          "Vehicle": "Cargo ship",
          "Type": "Bulk carrier",
          "Fuel": "100,000–199,999 dwt",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2486",
          "Vehicle": "Cargo ship",
          "Type": "Bulk carrier",
          "Fuel": "60,000–99,999 dwt",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2487",
          "Vehicle": "Cargo ship",
          "Type": "Bulk carrier",
          "Fuel": "35,000–59,999 dwt",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2488",
          "Vehicle": "Cargo ship",
          "Type": "Bulk carrier",
          "Fuel": "10,000–34,999 dwt",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2489",
          "Vehicle": "Cargo ship",
          "Type": "Bulk carrier",
          "Fuel": "0–9999 dwt",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2490",
          "Vehicle": "Cargo ship",
          "Type": "Bulk carrier",
          "Fuel": "Average",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2491",
          "Vehicle": "Cargo ship",
          "Type": "General cargo",
          "Fuel": "10,000+ dwt",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2492",
          "Vehicle": "Cargo ship",
          "Type": "General cargo",
          "Fuel": "5000–9999 dwt",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2493",
          "Vehicle": "Cargo ship",
          "Type": "General cargo",
          "Fuel": "0–4999 dwt",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2494",
          "Vehicle": "Cargo ship",
          "Type": "General cargo",
          "Fuel": "10,000+ dwt 100+ TEU",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2495",
          "Vehicle": "Cargo ship",
          "Type": "General cargo",
          "Fuel": "5000–9999 dwt 100+ TEU",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2496",
          "Vehicle": "Cargo ship",
          "Type": "General cargo",
          "Fuel": "0–4999 dwt 100+ TEU",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2497",
          "Vehicle": "Cargo ship",
          "Type": "General cargo",
          "Fuel": "Average",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2498",
          "Vehicle": "Cargo ship",
          "Type": "Container ship",
          "Fuel": "8000+ TEU",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2499",
          "Vehicle": "Cargo ship",
          "Type": "Container ship",
          "Fuel": "5000–7999 TEU",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2500",
          "Vehicle": "Cargo ship",
          "Type": "Container ship",
          "Fuel": "3000–4999 TEU",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2501",
          "Vehicle": "Cargo ship",
          "Type": "Container ship",
          "Fuel": "2000–2999 TEU",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2502",
          "Vehicle": "Cargo ship",
          "Type": "Container ship",
          "Fuel": "1000–1999 TEU",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2503",
          "Vehicle": "Cargo ship",
          "Type": "Container ship",
          "Fuel": "0–999 TEU",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2504",
          "Vehicle": "Cargo ship",
          "Type": "Container ship",
          "Fuel": "Average",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2505",
          "Vehicle": "Cargo ship",
          "Type": "Vehicle transport",
          "Fuel": "4000+ CEU",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2506",
          "Vehicle": "Cargo ship",
          "Type": "Vehicle transport",
          "Fuel": "0–3999 CEU",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2507",
          "Vehicle": "Cargo ship",
          "Type": "Vehicle transport",
          "Fuel": "Average",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2508",
          "Vehicle": "Cargo ship",
          "Type": "RoRo-Ferry",
          "Fuel": "2000+ LM",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2509",
          "Vehicle": "Cargo ship",
          "Type": "RoRo-Ferry",
          "Fuel": "0–1999 LM",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2510",
          "Vehicle": "Cargo ship",
          "Type": "RoRo-Ferry",
          "Fuel": "Average",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2511",
          "Vehicle": "Cargo ship",
          "Type": "Large RoPax ferry",
          "Fuel": "Average",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        },
        {
          "Reference": "2512",
          "Vehicle": "Cargo ship",
          "Type": "Refrigerated cargo",
          "Fuel": " All dwt",
          "Unit": "tonne.km",
          "Weight (tonnes)": "",
          "Distance (km)": "",
          "Factor": ""
        }
      ],
      "Employees commuting": [
        {
          "Reference": "1850",
          "Vehicle": "Cars (by size)",
          "Type": "Small car",
          "Fuel": "Battery Electric Vehicle",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1866",
          "Vehicle": "Cars (by size)",
          "Type": "Medium car",
          "Fuel": "Battery Electric Vehicle",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1882",
          "Vehicle": "Cars (by size)",
          "Type": "Large car",
          "Fuel": "Battery Electric Vehicle",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1898",
          "Vehicle": "Cars (by size)",
          "Type": "Average car",
          "Fuel": "Battery Electric Vehicle",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1842",
          "Vehicle": "Cars (by size)",
          "Type": "Small car",
          "Fuel": "CNG",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1858",
          "Vehicle": "Cars (by size)",
          "Type": "Medium car",
          "Fuel": "CNG",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1874",
          "Vehicle": "Cars (by size)",
          "Type": "Large car",
          "Fuel": "CNG",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1890",
          "Vehicle": "Cars (by size)",
          "Type": "Average car",
          "Fuel": "CNG",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1836",
          "Vehicle": "Cars (by size)",
          "Type": "Small car",
          "Fuel": "Diesel",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1852",
          "Vehicle": "Cars (by size)",
          "Type": "Medium car",
          "Fuel": "Diesel",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1868",
          "Vehicle": "Cars (by size)",
          "Type": "Large car",
          "Fuel": "Diesel",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1884",
          "Vehicle": "Cars (by size)",
          "Type": "Average car",
          "Fuel": "Diesel",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1840",
          "Vehicle": "Cars (by size)",
          "Type": "Small car",
          "Fuel": "Hybrid",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1856",
          "Vehicle": "Cars (by size)",
          "Type": "Medium car",
          "Fuel": "Hybrid",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1872",
          "Vehicle": "Cars (by size)",
          "Type": "Large car",
          "Fuel": "Hybrid",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1888",
          "Vehicle": "Cars (by size)",
          "Type": "Average car",
          "Fuel": "Hybrid",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1844",
          "Vehicle": "Cars (by size)",
          "Type": "Small car",
          "Fuel": "LPG",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1860",
          "Vehicle": "Cars (by size)",
          "Type": "Medium car",
          "Fuel": "LPG",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1876",
          "Vehicle": "Cars (by size)",
          "Type": "Large car",
          "Fuel": "LPG",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1892",
          "Vehicle": "Cars (by size)",
          "Type": "Average car",
          "Fuel": "LPG",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1838",
          "Vehicle": "Cars (by size)",
          "Type": "Small car",
          "Fuel": "Petrol",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1854",
          "Vehicle": "Cars (by size)",
          "Type": "Medium car",
          "Fuel": "Petrol",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1870",
          "Vehicle": "Cars (by size)",
          "Type": "Large car",
          "Fuel": "Petrol",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1886",
          "Vehicle": "Cars (by size)",
          "Type": "Average car",
          "Fuel": "Petrol",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1848",
          "Vehicle": "Cars (by size)",
          "Type": "Small car",
          "Fuel": "Plug-in Hybrid Electric Vehicle",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1864",
          "Vehicle": "Cars (by size)",
          "Type": "Medium car",
          "Fuel": "Plug-in Hybrid Electric Vehicle",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1880",
          "Vehicle": "Cars (by size)",
          "Type": "Large car",
          "Fuel": "Plug-in Hybrid Electric Vehicle",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1896",
          "Vehicle": "Cars (by size)",
          "Type": "Average car",
          "Fuel": "Plug-in Hybrid Electric Vehicle",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1846",
          "Vehicle": "Cars (by size)",
          "Type": "Small car",
          "Fuel": "Unknown",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1862",
          "Vehicle": "Cars (by size)",
          "Type": "Medium car",
          "Fuel": "Unknown",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1878",
          "Vehicle": "Cars (by size)",
          "Type": "Large car",
          "Fuel": "Unknown",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1894",
          "Vehicle": "Cars (by size)",
          "Type": "Average car",
          "Fuel": "Unknown",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1743",
          "Vehicle": "Ferry",
          "Type": "Foot passenger",
          "Fuel": "",
          "Unit": "passenger.km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1744",
          "Vehicle": "Ferry",
          "Type": "Car passenger",
          "Fuel": "",
          "Unit": "passenger.km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1745",
          "Vehicle": "Ferry",
          "Type": "Average (all passenger)",
          "Fuel": "",
          "Unit": "passenger.km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1900",
          "Vehicle": "Motorbike",
          "Type": "Small",
          "Fuel": "",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1902",
          "Vehicle": "Motorbike",
          "Type": "Medium",
          "Fuel": "",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1904",
          "Vehicle": "Motorbike",
          "Type": "Large",
          "Fuel": "",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1906",
          "Vehicle": "Motorbike",
          "Type": "Average",
          "Fuel": "",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1908",
          "Vehicle": "Taxis",
          "Type": "Regular taxi",
          "Fuel": "",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1909",
          "Vehicle": "Taxis",
          "Type": "Regular taxi",
          "Fuel": "",
          "Unit": "passenger.km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1910",
          "Vehicle": "Taxis",
          "Type": "Black cab",
          "Fuel": "",
          "Unit": "km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1911",
          "Vehicle": "Taxis",
          "Type": "Black cab",
          "Fuel": "",
          "Unit": "passenger.km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1912",
          "Vehicle": "Bus",
          "Type": "Local bus (not London)",
          "Fuel": "",
          "Unit": "passenger.km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1913",
          "Vehicle": "Bus",
          "Type": "Local London bus",
          "Fuel": "",
          "Unit": "passenger.km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1914",
          "Vehicle": "Bus",
          "Type": "Average local bus",
          "Fuel": "",
          "Unit": "passenger.km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1915",
          "Vehicle": "Bus",
          "Type": "Coach",
          "Fuel": "",
          "Unit": "passenger.km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1916",
          "Vehicle": "Rail",
          "Type": "National rail",
          "Fuel": "",
          "Unit": "passenger.km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1917",
          "Vehicle": "Rail",
          "Type": "International rail",
          "Fuel": "",
          "Unit": "passenger.km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1918",
          "Vehicle": "Rail",
          "Type": "Light rail and tram",
          "Fuel": "",
          "Unit": "passenger.km",
          "Total distance": "",
          "Factor": ""
        },
        {
          "Reference": "1919",
          "Vehicle": "Rail",
          "Type": "London Underground",
          "Fuel": "",
          "Unit": "passenger.km",
          "Total distance": "",
          "Factor": ""
        }
      ],
      "Food": [
        {
          "Factor": "0.84",
          "Meal Type": "1 standard breakfast",
          "Unit": "breakfast",
          "Amount": "",
        },
        {
          "Factor": "2.33",
          "Meal Type": "1 gourmet breakfast",
          "Unit": "breakfast",
          "Amount": "",
        },
        {
          "Factor": "2.02",
          "Meal Type": "1 cold or hot snack",
          "Unit": "hot snack",
          "Amount": "",
        },
        {
          "Factor": "4.7",
          "Meal Type": "1 average meal",
          "Unit": "meal",
          "Amount": "",
        },
        {
          "Factor": "0.2",
          "Meal Type": "Non-alcoholic beverage",
          "Unit": "litre",
          "Amount": "",
        },
        {
          "Factor": "1.87",
          "Meal Type": "Alcoholic beverage",
          "Unit": "litre",
          "Amount": "",
        },
        {
          "Factor": "2.77",
          "Meal Type": "1 hot snack (burger + frites)",
          "Unit": "hot snack",
          "Amount": "",
        },
        {
          "Factor": "1.27",
          "Meal Type": "1 sandwich",
          "Unit": "sandwich",
          "Amount": "",
        },
        {
          "Factor": "1.69",
          "Meal Type": "Meal, vegan",
          "Unit": "meal",
          "Amount": "",
        },
        {
          "Factor": "2.85",
          "Meal Type": "Meal, vegetarian",
          "Unit": "meal",
          "Amount": "",
        },
        {
          "Factor": "6.93",
          "Meal Type": "Meal, with beef",
          "Unit": "meal",
          "Amount": "",
        },
        {
          "Factor": "3.39",
          "Meal Type": "Meal, with chicken",
          "Unit": "meal",
          "Amount": "",
        }
      ],
      "Home Office": [
        {
          "Type of home office": "With cooling",
          "Number of employees": "",
          "Working regime (For full-time)": "",
          "Working from home": "",
          "Number of months": "",
          "Factor": "3.65"
        },
        {
          "Type of home office": "No heating/No cooling",
          "Number of employees": "",
          "Working regime (For full-time)": "",
          "Working from home": "",
          "Number of months": "",
          "Factor": "0.15"
        },
        {
          "Type of home office": "With heating",
          "Number of employees": "",
          "Working regime (For full-time)": "",
          "Working from home": "",
          "Number of months": "",
          "Factor": "5.15"
        }
      ],
      "Water": [
        {
          "Reference": "668",
          "Type": "Water Supply",
          "Unit": "cubic metres",
          "Source": "Surface",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "668",
          "Type": "Water Supply",
          "Unit": "cubic metres",
          "Source": "Ground",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "668",
          "Type": "Water Supply",
          "Unit": "cubic metres",
          "Source": "Sea",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "668",
          "Type": "Water Supply",
          "Unit": "cubic metres",
          "Source": "Rain",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "668",
          "Type": "Water Supply",
          "Unit": "cubic metres",
          "Source": "Treated",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "668",
          "Type": "Water Supply",
          "Unit": "cubic metres",
          "Source": "3rd Party",
          "Amount": "",
          "Factor": ""
        },

        {
          "Reference": "670",
          "Type": "Water Drainage",
          "Unit": "cubic metres",
          "Source": "Surface",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "670",
          "Type": "Water Drainage",
          "Unit": "cubic metres",
          "Source": "Ground",
          "Amount": "",
          "Factor": ""
        },
        {
          "Reference": "670",
          "Type": "Water Drainage",
          "Unit": "cubic metres",
          "Source": "Sea",
          "Amount": "",
          "Factor": ""
        }, {
          "Reference": "670",
          "Type": "Water Drainage",
          "Unit": "cubic metres",
          "Source": "Rain",
          "Amount": "",
          "Factor": ""
        }, {
          "Reference": "670",
          "Type": "Water Drainage",
          "Unit": "cubic metres",
          "Source": "Treated",
          "Amount": "",
          "Factor": ""
        }, {
          "Reference": "670",
          "Type": "Water Drainage",
          "Unit": "cubic metres",
          "Source": "3rd Party",
          "Amount": "",
          "Factor": ""
        }
      ],

      "Entity": [
        {
          "Entity Type": "BOD",
          "Gender": "Male",
          "Age": "50+",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Male",
          "Age": "50+",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Male",
          "Age": "50+",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Male",
          "Age": "50+",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Male",
          "Age": "50+",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Male",
          "Age": "50+",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Male",
          "Age": "35 to 50",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Male",
          "Age": "35 to 50",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Male",
          "Age": "35 to 50",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Male",
          "Age": "35 to 50",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Male",
          "Age": "35 to 50",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Male",
          "Age": "35 to 50",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Male",
          "Age": "22 to 35",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Male",
          "Age": "22 to 35",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Male",
          "Age": "22 to 35",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Male",
          "Age": "22 to 35",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Male",
          "Age": "22 to 35",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Male",
          "Age": "22 to 35",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Male",
          "Age": "Less than 22",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Male",
          "Age": "Less than 22",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Male",
          "Age": "Less than 22",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Male",
          "Age": "Less than 22",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Male",
          "Age": "Less than 22",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Male",
          "Age": "Less than 22",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Female",
          "Age": "50+",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Female",
          "Age": "50+",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Female",
          "Age": "50+",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Female",
          "Age": "50+",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Female",
          "Age": "50+",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Female",
          "Age": "50+",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Female",
          "Age": "35 to 50",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Female",
          "Age": "35 to 50",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Female",
          "Age": "35 to 50",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Female",
          "Age": "35 to 50",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Female",
          "Age": "35 to 50",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Female",
          "Age": "35 to 50",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Female",
          "Age": "22 to 35",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Female",
          "Age": "22 to 35",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Female",
          "Age": "22 to 35",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Female",
          "Age": "22 to 35",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Female",
          "Age": "22 to 35",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Female",
          "Age": "22 to 35",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Female",
          "Age": "Less than 22",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Female",
          "Age": "Less than 22",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Female",
          "Age": "Less than 22",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Female",
          "Age": "Less than 22",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Female",
          "Age": "Less than 22",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Female",
          "Age": "Less than 22",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Others",
          "Age": "50+",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Others",
          "Age": "50+",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Others",
          "Age": "50+",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Others",
          "Age": "50+",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Others",
          "Age": "50+",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Others",
          "Age": "50+",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Others",
          "Age": "35 to 50",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Others",
          "Age": "35 to 50",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Others",
          "Age": "35 to 50",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Others",
          "Age": "35 to 50",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Others",
          "Age": "35 to 50",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Others",
          "Age": "35 to 50",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Others",
          "Age": "22 to 35",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Others",
          "Age": "22 to 35",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Others",
          "Age": "22 to 35",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Others",
          "Age": "22 to 35",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Others",
          "Age": "22 to 35",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Others",
          "Age": "22 to 35",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Others",
          "Age": "Less than 22",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Others",
          "Age": "Less than 22",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Others",
          "Age": "Less than 22",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Others",
          "Age": "Less than 22",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Others",
          "Age": "Less than 22",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "BOD",
          "Gender": "Others",
          "Age": "Less than 22",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Male",
          "Age": "50+",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Male",
          "Age": "50+",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Male",
          "Age": "50+",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Male",
          "Age": "50+",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Male",
          "Age": "50+",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Male",
          "Age": "50+",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Male",
          "Age": "35 to 50",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Male",
          "Age": "35 to 50",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Male",
          "Age": "35 to 50",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Male",
          "Age": "35 to 50",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Male",
          "Age": "35 to 50",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Male",
          "Age": "35 to 50",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Male",
          "Age": "22 to 35",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Male",
          "Age": "22 to 35",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Male",
          "Age": "22 to 35",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Male",
          "Age": "22 to 35",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Male",
          "Age": "22 to 35",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Male",
          "Age": "22 to 35",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Male",
          "Age": "Less than 22",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Male",
          "Age": "Less than 22",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Male",
          "Age": "Less than 22",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Male",
          "Age": "Less than 22",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Male",
          "Age": "Less than 22",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Male",
          "Age": "Less than 22",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Female",
          "Age": "50+",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Female",
          "Age": "50+",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Female",
          "Age": "50+",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Female",
          "Age": "50+",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Female",
          "Age": "50+",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Female",
          "Age": "50+",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Female",
          "Age": "35 to 50",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Female",
          "Age": "35 to 50",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Female",
          "Age": "35 to 50",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Female",
          "Age": "35 to 50",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Female",
          "Age": "35 to 50",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Female",
          "Age": "35 to 50",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Female",
          "Age": "22 to 35",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Female",
          "Age": "22 to 35",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Female",
          "Age": "22 to 35",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Female",
          "Age": "22 to 35",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Female",
          "Age": "22 to 35",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Female",
          "Age": "22 to 35",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Female",
          "Age": "Less than 22",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Female",
          "Age": "Less than 22",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Female",
          "Age": "Less than 22",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Female",
          "Age": "Less than 22",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Female",
          "Age": "Less than 22",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Female",
          "Age": "Less than 22",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Others",
          "Age": "50+",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Others",
          "Age": "50+",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Others",
          "Age": "50+",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Others",
          "Age": "50+",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Others",
          "Age": "50+",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Others",
          "Age": "50+",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Others",
          "Age": "35 to 50",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Others",
          "Age": "35 to 50",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Others",
          "Age": "35 to 50",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Others",
          "Age": "35 to 50",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Others",
          "Age": "35 to 50",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Others",
          "Age": "35 to 50",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Others",
          "Age": "22 to 35",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Others",
          "Age": "22 to 35",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Others",
          "Age": "22 to 35",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Others",
          "Age": "22 to 35",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Others",
          "Age": "22 to 35",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Others",
          "Age": "22 to 35",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Others",
          "Age": "Less than 22",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Others",
          "Age": "Less than 22",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Others",
          "Age": "Less than 22",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Others",
          "Age": "Less than 22",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Others",
          "Age": "Less than 22",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CFO",
          "Gender": "Others",
          "Age": "Less than 22",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Male",
          "Age": "50+",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Male",
          "Age": "50+",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Male",
          "Age": "50+",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Male",
          "Age": "50+",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Male",
          "Age": "50+",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Male",
          "Age": "50+",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Male",
          "Age": "35 to 50",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Male",
          "Age": "35 to 50",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Male",
          "Age": "35 to 50",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Male",
          "Age": "35 to 50",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Male",
          "Age": "35 to 50",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Male",
          "Age": "35 to 50",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Male",
          "Age": "22 to 35",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Male",
          "Age": "22 to 35",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Male",
          "Age": "22 to 35",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Male",
          "Age": "22 to 35",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Male",
          "Age": "22 to 35",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Male",
          "Age": "22 to 35",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Male",
          "Age": "Less than 22",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Male",
          "Age": "Less than 22",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Male",
          "Age": "Less than 22",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Male",
          "Age": "Less than 22",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Male",
          "Age": "Less than 22",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Male",
          "Age": "Less than 22",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Female",
          "Age": "50+",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Female",
          "Age": "50+",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Female",
          "Age": "50+",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Female",
          "Age": "50+",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Female",
          "Age": "50+",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Female",
          "Age": "50+",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Female",
          "Age": "35 to 50",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Female",
          "Age": "35 to 50",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Female",
          "Age": "35 to 50",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Female",
          "Age": "35 to 50",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Female",
          "Age": "35 to 50",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Female",
          "Age": "35 to 50",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Female",
          "Age": "22 to 35",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Female",
          "Age": "22 to 35",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Female",
          "Age": "22 to 35",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Female",
          "Age": "22 to 35",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Female",
          "Age": "22 to 35",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Female",
          "Age": "22 to 35",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Female",
          "Age": "Less than 22",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Female",
          "Age": "Less than 22",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Female",
          "Age": "Less than 22",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Female",
          "Age": "Less than 22",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Female",
          "Age": "Less than 22",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Female",
          "Age": "Less than 22",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Others",
          "Age": "50+",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Others",
          "Age": "50+",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Others",
          "Age": "50+",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Others",
          "Age": "50+",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Others",
          "Age": "50+",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Others",
          "Age": "50+",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Others",
          "Age": "35 to 50",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Others",
          "Age": "35 to 50",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Others",
          "Age": "35 to 50",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Others",
          "Age": "35 to 50",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Others",
          "Age": "35 to 50",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Others",
          "Age": "35 to 50",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Others",
          "Age": "22 to 35",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Others",
          "Age": "22 to 35",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Others",
          "Age": "22 to 35",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Others",
          "Age": "22 to 35",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Others",
          "Age": "22 to 35",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Others",
          "Age": "22 to 35",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Others",
          "Age": "Less than 22",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Others",
          "Age": "Less than 22",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Others",
          "Age": "Less than 22",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Others",
          "Age": "Less than 22",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Others",
          "Age": "Less than 22",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "CEO",
          "Gender": "Others",
          "Age": "Less than 22",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Male",
          "Age": "50+",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Male",
          "Age": "50+",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Male",
          "Age": "50+",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Male",
          "Age": "50+",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Male",
          "Age": "50+",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Male",
          "Age": "50+",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Male",
          "Age": "35 to 50",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Male",
          "Age": "35 to 50",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Male",
          "Age": "35 to 50",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Male",
          "Age": "35 to 50",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Male",
          "Age": "35 to 50",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Male",
          "Age": "35 to 50",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Male",
          "Age": "22 to 35",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Male",
          "Age": "22 to 35",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Male",
          "Age": "22 to 35",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Male",
          "Age": "22 to 35",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Male",
          "Age": "22 to 35",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Male",
          "Age": "22 to 35",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Male",
          "Age": "Less than 22",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Male",
          "Age": "Less than 22",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Male",
          "Age": "Less than 22",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Male",
          "Age": "Less than 22",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Male",
          "Age": "Less than 22",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Male",
          "Age": "Less than 22",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Female",
          "Age": "50+",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Female",
          "Age": "50+",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Female",
          "Age": "50+",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Female",
          "Age": "50+",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Female",
          "Age": "50+",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Female",
          "Age": "50+",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Female",
          "Age": "35 to 50",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Female",
          "Age": "35 to 50",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Female",
          "Age": "35 to 50",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Female",
          "Age": "35 to 50",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Female",
          "Age": "35 to 50",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Female",
          "Age": "35 to 50",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Female",
          "Age": "22 to 35",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Female",
          "Age": "22 to 35",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Female",
          "Age": "22 to 35",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Female",
          "Age": "22 to 35",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Female",
          "Age": "22 to 35",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Female",
          "Age": "22 to 35",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Female",
          "Age": "Less than 22",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Female",
          "Age": "Less than 22",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Female",
          "Age": "Less than 22",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Female",
          "Age": "Less than 22",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Female",
          "Age": "Less than 22",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Female",
          "Age": "Less than 22",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Others",
          "Age": "50+",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Others",
          "Age": "50+",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Others",
          "Age": "50+",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Others",
          "Age": "50+",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Others",
          "Age": "50+",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Others",
          "Age": "50+",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Others",
          "Age": "35 to 50",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Others",
          "Age": "35 to 50",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Others",
          "Age": "35 to 50",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Others",
          "Age": "35 to 50",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Others",
          "Age": "35 to 50",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Others",
          "Age": "35 to 50",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Others",
          "Age": "22 to 35",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Others",
          "Age": "22 to 35",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Others",
          "Age": "22 to 35",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Others",
          "Age": "22 to 35",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Others",
          "Age": "22 to 35",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Others",
          "Age": "22 to 35",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Others",
          "Age": "Less than 22",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Others",
          "Age": "Less than 22",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Others",
          "Age": "Less than 22",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Others",
          "Age": "Less than 22",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Others",
          "Age": "Less than 22",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Independent Directors",
          "Gender": "Others",
          "Age": "Less than 22",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Male",
          "Age": "50+",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Male",
          "Age": "50+",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Male",
          "Age": "50+",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Male",
          "Age": "50+",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Male",
          "Age": "50+",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Male",
          "Age": "50+",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Male",
          "Age": "35 to 50",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Male",
          "Age": "35 to 50",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Male",
          "Age": "35 to 50",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Male",
          "Age": "35 to 50",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Male",
          "Age": "35 to 50",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Male",
          "Age": "35 to 50",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Male",
          "Age": "22 to 35",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Male",
          "Age": "22 to 35",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Male",
          "Age": "22 to 35",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Male",
          "Age": "22 to 35",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Male",
          "Age": "22 to 35",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Male",
          "Age": "22 to 35",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Male",
          "Age": "Less than 22",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Male",
          "Age": "Less than 22",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Male",
          "Age": "Less than 22",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Male",
          "Age": "Less than 22",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Male",
          "Age": "Less than 22",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Male",
          "Age": "Less than 22",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Female",
          "Age": "50+",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Female",
          "Age": "50+",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Female",
          "Age": "50+",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Female",
          "Age": "50+",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Female",
          "Age": "50+",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Female",
          "Age": "50+",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Female",
          "Age": "35 to 50",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Female",
          "Age": "35 to 50",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Female",
          "Age": "35 to 50",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Female",
          "Age": "35 to 50",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Female",
          "Age": "35 to 50",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Female",
          "Age": "35 to 50",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Female",
          "Age": "22 to 35",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Female",
          "Age": "22 to 35",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Female",
          "Age": "22 to 35",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Female",
          "Age": "22 to 35",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Female",
          "Age": "22 to 35",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Female",
          "Age": "22 to 35",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Female",
          "Age": "Less than 22",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Female",
          "Age": "Less than 22",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Female",
          "Age": "Less than 22",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Female",
          "Age": "Less than 22",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Female",
          "Age": "Less than 22",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Female",
          "Age": "Less than 22",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Others",
          "Age": "50+",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Others",
          "Age": "50+",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Others",
          "Age": "50+",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Others",
          "Age": "50+",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Others",
          "Age": "50+",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Others",
          "Age": "50+",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Others",
          "Age": "35 to 50",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Others",
          "Age": "35 to 50",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Others",
          "Age": "35 to 50",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Others",
          "Age": "35 to 50",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Others",
          "Age": "35 to 50",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Others",
          "Age": "35 to 50",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Others",
          "Age": "22 to 35",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Others",
          "Age": "22 to 35",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Others",
          "Age": "22 to 35",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Others",
          "Age": "22 to 35",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Others",
          "Age": "22 to 35",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Others",
          "Age": "22 to 35",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Others",
          "Age": "Less than 22",
          "Tenure": "Less than 1 year",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Others",
          "Age": "Less than 22",
          "Tenure": "Between 1- 2 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Others",
          "Age": "Less than 22",
          "Tenure": "Between 2-5 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Others",
          "Age": "Less than 22",
          "Tenure": "Between 5-7 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Others",
          "Age": "Less than 22",
          "Tenure": "Between 7-9 years",
          "Head Count": ""
        },
        {
          "Entity Type": "Executives",
          "Gender": "Others",
          "Age": "Less than 22",
          "Tenure": "Above 10 years",
          "Head Count": ""
        },

      ]

      ,
      "Eco. Performance": [
        {
          "Data": "Total turnover",
          "Values": ""
        },
        {
          "Data": "Total Revenue",
          "Values": ""
        },
        {
          "Data": "Direct economic value generated",
          "Values": ""
        },
        {
          "Data": "Direct economic value Distributed",
          "Values": ""
        },
        {
          "Data": "Financial assistance received from governments",
          "Values": ""
        },
        {
          "Data": "Remuneration ratio of BOD vs Employee",
          "Values": ""
        }
      ],
      "Market Presence": [
        {
          "Data": "Entry level wage for Male",
          "Values": ""
        },
        {
          "Data": "Entry level wage for Female",
          "Values": ""
        },
        {
          "Data": "Local Minimum Wage as Male",
          "Values": ""
        },
        {
          "Data": "Local Minimum Wage as Female",
          "Values": ""
        },
        {
          "Data": "Ratio of entry level wage to local minimum wage for Male",
          "Values": ""
        },
        {
          "Data": "Ratio of entry level wage to local minimum wage for Female",
          "Values": ""
        },
        {
          "Data": "Markets served by the entity nationally",
          "Values": ""
        },
        {
          "Data": "Markets served by the entity internationally",
          "Values": ""
        }
      ],

      "Employment": [
        {
          "Employment Type": "Employees",
          "Category": "New Hires - Disabled",
          "Gender": "Male",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "New Hires - Disabled",
          "Gender": "Male",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "New Hires - Disabled",
          "Gender": "Male",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "New Hires - Disabled",
          "Gender": "Male",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "New Hires - Disabled",
          "Gender": "Male",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "New Hires - Disabled",
          "Gender": "Female",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "New Hires - Disabled",
          "Gender": "Female",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "New Hires - Disabled",
          "Gender": "Female",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "New Hires - Disabled",
          "Gender": "Female",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "New Hires - Disabled",
          "Gender": "Female",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "New Hires - Disabled",
          "Gender": "LGBTQ",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "New Hires - Disabled",
          "Gender": "LGBTQ",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "New Hires - Disabled",
          "Gender": "LGBTQ",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "New Hires - Disabled",
          "Gender": "LGBTQ",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "New Hires - Disabled",
          "Gender": "LGBTQ",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "New Hires",
          "Gender": "Male",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "New Hires",
          "Gender": "Male",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "New Hires",
          "Gender": "Male",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "New Hires",
          "Gender": "Male",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "New Hires",
          "Gender": "Male",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "New Hires",
          "Gender": "Female",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "New Hires",
          "Gender": "Female",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "New Hires",
          "Gender": "Female",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "New Hires",
          "Gender": "Female",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "New Hires",
          "Gender": "Female",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "New Hires",
          "Gender": "LGBTQ",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "New Hires",
          "Gender": "LGBTQ",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "New Hires",
          "Gender": "LGBTQ",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "New Hires",
          "Gender": "LGBTQ",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "New Hires",
          "Gender": "LGBTQ",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "Existing",
          "Gender": "Male",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "Existing",
          "Gender": "Male",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "Existing",
          "Gender": "Male",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "Existing",
          "Gender": "Male",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "Existing",
          "Gender": "Male",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "Existing",
          "Gender": "Female",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "Existing",
          "Gender": "Female",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "Existing",
          "Gender": "Female",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "Existing",
          "Gender": "Female",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "Existing",
          "Gender": "Female",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "Existing",
          "Gender": "LGBTQ",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "Existing",
          "Gender": "LGBTQ",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "Existing",
          "Gender": "LGBTQ",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "Existing",
          "Gender": "LGBTQ",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "Existing",
          "Gender": "LGBTQ",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "Existing - Disabled",
          "Gender": "Male",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "Existing - Disabled",
          "Gender": "Male",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "Existing - Disabled",
          "Gender": "Male",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "Existing - Disabled",
          "Gender": "Male",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "Existing - Disabled",
          "Gender": "Male",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "Existing - Disabled",
          "Gender": "Female",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "Existing - Disabled",
          "Gender": "Female",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "Existing - Disabled",
          "Gender": "Female",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "Existing - Disabled",
          "Gender": "Female",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "Existing - Disabled",
          "Gender": "Female",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "Existing - Disabled",
          "Gender": "LGBTQ",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "Existing - Disabled",
          "Gender": "LGBTQ",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "Existing - Disabled",
          "Gender": "LGBTQ",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "Existing - Disabled",
          "Gender": "LGBTQ",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Employees",
          "Category": "Existing - Disabled",
          "Gender": "LGBTQ",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "New Hires - Disabled",
          "Gender": "Male",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "New Hires - Disabled",
          "Gender": "Male",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "New Hires - Disabled",
          "Gender": "Male",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "New Hires - Disabled",
          "Gender": "Male",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "New Hires - Disabled",
          "Gender": "Male",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "New Hires - Disabled",
          "Gender": "Female",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "New Hires - Disabled",
          "Gender": "Female",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "New Hires - Disabled",
          "Gender": "Female",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "New Hires - Disabled",
          "Gender": "Female",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "New Hires - Disabled",
          "Gender": "Female",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "New Hires - Disabled",
          "Gender": "LGBTQ",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "New Hires - Disabled",
          "Gender": "LGBTQ",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "New Hires - Disabled",
          "Gender": "LGBTQ",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "New Hires - Disabled",
          "Gender": "LGBTQ",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "New Hires - Disabled",
          "Gender": "LGBTQ",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "New Hires",
          "Gender": "Male",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "New Hires",
          "Gender": "Male",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "New Hires",
          "Gender": "Male",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "New Hires",
          "Gender": "Male",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "New Hires",
          "Gender": "Male",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "New Hires",
          "Gender": "Female",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "New Hires",
          "Gender": "Female",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "New Hires",
          "Gender": "Female",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "New Hires",
          "Gender": "Female",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "New Hires",
          "Gender": "Female",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "New Hires",
          "Gender": "LGBTQ",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "New Hires",
          "Gender": "LGBTQ",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "New Hires",
          "Gender": "LGBTQ",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "New Hires",
          "Gender": "LGBTQ",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "New Hires",
          "Gender": "LGBTQ",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "Existing",
          "Gender": "Male",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "Existing",
          "Gender": "Male",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "Existing",
          "Gender": "Male",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "Existing",
          "Gender": "Male",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "Existing",
          "Gender": "Male",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "Existing",
          "Gender": "Female",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "Existing",
          "Gender": "Female",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "Existing",
          "Gender": "Female",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "Existing",
          "Gender": "Female",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "Existing",
          "Gender": "Female",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "Existing",
          "Gender": "LGBTQ",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "Existing",
          "Gender": "LGBTQ",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "Existing",
          "Gender": "LGBTQ",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "Existing",
          "Gender": "LGBTQ",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "Existing",
          "Gender": "LGBTQ",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "Existing - Disabled",
          "Gender": "Male",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "Existing - Disabled",
          "Gender": "Male",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "Existing - Disabled",
          "Gender": "Male",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "Existing - Disabled",
          "Gender": "Male",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "Existing - Disabled",
          "Gender": "Male",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "Existing - Disabled",
          "Gender": "Female",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "Existing - Disabled",
          "Gender": "Female",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "Existing - Disabled",
          "Gender": "Female",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "Existing - Disabled",
          "Gender": "Female",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "Existing - Disabled",
          "Gender": "Female",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "Existing - Disabled",
          "Gender": "LGBTQ",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "Existing - Disabled",
          "Gender": "LGBTQ",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "Existing - Disabled",
          "Gender": "LGBTQ",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "Existing - Disabled",
          "Gender": "LGBTQ",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Employee",
          "Category": "Existing - Disabled",
          "Gender": "LGBTQ",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "New Hires - Disabled",
          "Gender": "Male",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "New Hires - Disabled",
          "Gender": "Male",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "New Hires - Disabled",
          "Gender": "Male",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "New Hires - Disabled",
          "Gender": "Male",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "New Hires - Disabled",
          "Gender": "Male",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "New Hires - Disabled",
          "Gender": "Female",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "New Hires - Disabled",
          "Gender": "Female",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "New Hires - Disabled",
          "Gender": "Female",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "New Hires - Disabled",
          "Gender": "Female",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "New Hires - Disabled",
          "Gender": "Female",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "New Hires - Disabled",
          "Gender": "LGBTQ",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "New Hires - Disabled",
          "Gender": "LGBTQ",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "New Hires - Disabled",
          "Gender": "LGBTQ",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "New Hires - Disabled",
          "Gender": "LGBTQ",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "New Hires - Disabled",
          "Gender": "LGBTQ",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "New Hires",
          "Gender": "Male",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "New Hires",
          "Gender": "Male",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "New Hires",
          "Gender": "Male",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "New Hires",
          "Gender": "Male",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "New Hires",
          "Gender": "Male",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "New Hires",
          "Gender": "Female",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "New Hires",
          "Gender": "Female",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "New Hires",
          "Gender": "Female",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "New Hires",
          "Gender": "Female",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "New Hires",
          "Gender": "Female",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "New Hires",
          "Gender": "LGBTQ",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "New Hires",
          "Gender": "LGBTQ",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "New Hires",
          "Gender": "LGBTQ",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "New Hires",
          "Gender": "LGBTQ",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "New Hires",
          "Gender": "LGBTQ",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "Existing",
          "Gender": "Male",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "Existing",
          "Gender": "Male",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "Existing",
          "Gender": "Male",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "Existing",
          "Gender": "Male",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "Existing",
          "Gender": "Male",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "Existing",
          "Gender": "Female",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "Existing",
          "Gender": "Female",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "Existing",
          "Gender": "Female",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "Existing",
          "Gender": "Female",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "Existing",
          "Gender": "Female",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "Existing",
          "Gender": "LGBTQ",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "Existing",
          "Gender": "LGBTQ",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "Existing",
          "Gender": "LGBTQ",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "Existing",
          "Gender": "LGBTQ",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Workers",
          "Category": "Existing",
          "Gender": "LGBTQ",
          "Age": "Overall",
          "Head Count": ""
        },



        {
          "Employment Type": "Temporary Workers",
          "Category": "New Hires - Disabled",
          "Gender": "Male",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "New Hires - Disabled",
          "Gender": "Male",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "New Hires - Disabled",
          "Gender": "Male",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "New Hires - Disabled",
          "Gender": "Male",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "New Hires - Disabled",
          "Gender": "Male",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "New Hires - Disabled",
          "Gender": "Female",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "New Hires - Disabled",
          "Gender": "Female",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "New Hires - Disabled",
          "Gender": "Female",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "New Hires - Disabled",
          "Gender": "Female",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "New Hires - Disabled",
          "Gender": "Female",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "New Hires - Disabled",
          "Gender": "LGBTQ",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "New Hires - Disabled",
          "Gender": "LGBTQ",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "New Hires - Disabled",
          "Gender": "LGBTQ",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "New Hires - Disabled",
          "Gender": "LGBTQ",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "New Hires - Disabled",
          "Gender": "LGBTQ",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "New Hires",
          "Gender": "Male",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "New Hires",
          "Gender": "Male",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "New Hires",
          "Gender": "Male",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "New Hires",
          "Gender": "Male",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "New Hires",
          "Gender": "Male",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "New Hires",
          "Gender": "Female",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "New Hires",
          "Gender": "Female",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "New Hires",
          "Gender": "Female",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "New Hires",
          "Gender": "Female",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "New Hires",
          "Gender": "Female",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "New Hires",
          "Gender": "LGBTQ",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "New Hires",
          "Gender": "LGBTQ",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "New Hires",
          "Gender": "LGBTQ",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "New Hires",
          "Gender": "LGBTQ",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "New Hires",
          "Gender": "LGBTQ",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "Existing",
          "Gender": "Male",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "Existing",
          "Gender": "Male",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "Existing",
          "Gender": "Male",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "Existing",
          "Gender": "Male",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "Existing",
          "Gender": "Male",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "Existing",
          "Gender": "Female",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "Existing",
          "Gender": "Female",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "Existing",
          "Gender": "Female",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "Existing",
          "Gender": "Female",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "Existing",
          "Gender": "Female",
          "Age": "Overall",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "Existing",
          "Gender": "LGBTQ",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "Existing",
          "Gender": "LGBTQ",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "Existing",
          "Gender": "LGBTQ",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "Existing",
          "Gender": "LGBTQ",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employment Type": "Temporary Workers",
          "Category": "Existing",
          "Gender": "LGBTQ",
          "Age": "Overall",
          "Head Count": ""
        }
      ]
      ,
      "Leave": [
        {
          "Type of Leave": "Maternity leave",
          "Duration in Days": "",
          "Head Count": ""
        },
        {
          "Type of Leave": "Paternity leave",
          "Duration in Days": "",
          "Head Count": ""
        },
        {
          "Type of Leave": "Birthday leave",
          "Duration in Days": "",
          "Head Count": ""
        },
        {
          "Type of Leave": "Marriage leave",
          "Duration in Days": "",
          "Head Count": ""
        },
        {
          "Type of Leave": "Accidental leave",
          "Duration in Days": "",
          "Head Count": ""
        },
        {
          "Type of Leave": "Sick leave",
          "Duration in Days": "",
          "Head Count": ""
        }
      ]
      ,
      "Retention": [
        {
          "Employee Type": "BOD",
          "Gender": "Male",
          "Tenure": "Less than 1 year",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Male",
          "Tenure": "Less than 1 year",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Male",
          "Tenure": "Less than 1 year",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Male",
          "Tenure": "Less than 1 year",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Male",
          "Tenure": "Between 1-2 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Male",
          "Tenure": "Between 1-2 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Male",
          "Tenure": "Between 1-2 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Male",
          "Tenure": "Between 1-2 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Male",
          "Tenure": "Between 2-5 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Male",
          "Tenure": "Between 2-5 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Male",
          "Tenure": "Between 2-5 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Male",
          "Tenure": "Between 2-5 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Male",
          "Tenure": "Between 5-7 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Male",
          "Tenure": "Between 5-7 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Male",
          "Tenure": "Between 5-7 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Male",
          "Tenure": "Between 5-7 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Male",
          "Tenure": "Between 7-9 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Male",
          "Tenure": "Between 7-9 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Male",
          "Tenure": "Between 7-9 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Male",
          "Tenure": "Between 7-9 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Male",
          "Tenure": "Above 10 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Male",
          "Tenure": "Above 10 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Male",
          "Tenure": "Above 10 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Male",
          "Tenure": "Above 10 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Female",
          "Tenure": "Less than 1 year",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Female",
          "Tenure": "Less than 1 year",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Female",
          "Tenure": "Less than 1 year",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Female",
          "Tenure": "Less than 1 year",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Female",
          "Tenure": "Between 1-2 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Female",
          "Tenure": "Between 1-2 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Female",
          "Tenure": "Between 1-2 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Female",
          "Tenure": "Between 1-2 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Female",
          "Tenure": "Between 2-5 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Female",
          "Tenure": "Between 2-5 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Female",
          "Tenure": "Between 2-5 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Female",
          "Tenure": "Between 2-5 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Female",
          "Tenure": "Between 5-7 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Female",
          "Tenure": "Between 5-7 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Female",
          "Tenure": "Between 5-7 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Female",
          "Tenure": "Between 5-7 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Female",
          "Tenure": "Between 7-9 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Female",
          "Tenure": "Between 7-9 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Female",
          "Tenure": "Between 7-9 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Female",
          "Tenure": "Between 7-9 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Female",
          "Tenure": "Above 10 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Female",
          "Tenure": "Above 10 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Female",
          "Tenure": "Above 10 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Female",
          "Tenure": "Above 10 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Others",
          "Tenure": "Less than 1 year",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Others",
          "Tenure": "Less than 1 year",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Others",
          "Tenure": "Less than 1 year",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Others",
          "Tenure": "Less than 1 year",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Others",
          "Tenure": "Between 1-2 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Others",
          "Tenure": "Between 1-2 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Others",
          "Tenure": "Between 1-2 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Others",
          "Tenure": "Between 1-2 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Others",
          "Tenure": "Between 2-5 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Others",
          "Tenure": "Between 2-5 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Others",
          "Tenure": "Between 2-5 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Others",
          "Tenure": "Between 2-5 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Others",
          "Tenure": "Between 5-7 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Others",
          "Tenure": "Between 5-7 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Others",
          "Tenure": "Between 5-7 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Others",
          "Tenure": "Between 5-7 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Others",
          "Tenure": "Between 7-9 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Others",
          "Tenure": "Between 7-9 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Others",
          "Tenure": "Between 7-9 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Others",
          "Tenure": "Between 7-9 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Others",
          "Tenure": "Above 10 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Others",
          "Tenure": "Above 10 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Others",
          "Tenure": "Above 10 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "BOD",
          "Gender": "Others",
          "Tenure": "Above 10 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Male",
          "Tenure": "Less than 1 year",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Male",
          "Tenure": "Less than 1 year",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Male",
          "Tenure": "Less than 1 year",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Male",
          "Tenure": "Less than 1 year",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Male",
          "Tenure": "Between 1-2 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Male",
          "Tenure": "Between 1-2 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Male",
          "Tenure": "Between 1-2 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Male",
          "Tenure": "Between 1-2 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Male",
          "Tenure": "Between 2-5 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Male",
          "Tenure": "Between 2-5 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Male",
          "Tenure": "Between 2-5 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Male",
          "Tenure": "Between 2-5 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Male",
          "Tenure": "Between 5-7 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Male",
          "Tenure": "Between 5-7 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Male",
          "Tenure": "Between 5-7 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Male",
          "Tenure": "Between 5-7 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Male",
          "Tenure": "Between 7-9 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Male",
          "Tenure": "Between 7-9 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Male",
          "Tenure": "Between 7-9 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Male",
          "Tenure": "Between 7-9 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Male",
          "Tenure": "Above 10 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Male",
          "Tenure": "Above 10 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Male",
          "Tenure": "Above 10 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Male",
          "Tenure": "Above 10 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Female",
          "Tenure": "Less than 1 year",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Female",
          "Tenure": "Less than 1 year",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Female",
          "Tenure": "Less than 1 year",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Female",
          "Tenure": "Less than 1 year",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Female",
          "Tenure": "Between 1-2 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Female",
          "Tenure": "Between 1-2 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Female",
          "Tenure": "Between 1-2 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Female",
          "Tenure": "Between 1-2 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Female",
          "Tenure": "Between 2-5 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Female",
          "Tenure": "Between 2-5 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Female",
          "Tenure": "Between 2-5 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Female",
          "Tenure": "Between 2-5 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Female",
          "Tenure": "Between 5-7 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Female",
          "Tenure": "Between 5-7 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Female",
          "Tenure": "Between 5-7 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Female",
          "Tenure": "Between 5-7 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Female",
          "Tenure": "Between 7-9 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Female",
          "Tenure": "Between 7-9 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Female",
          "Tenure": "Between 7-9 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Female",
          "Tenure": "Between 7-9 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Female",
          "Tenure": "Above 10 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Female",
          "Tenure": "Above 10 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Female",
          "Tenure": "Above 10 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Female",
          "Tenure": "Above 10 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Others",
          "Tenure": "Less than 1 year",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Others",
          "Tenure": "Less than 1 year",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Others",
          "Tenure": "Less than 1 year",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Others",
          "Tenure": "Less than 1 year",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Others",
          "Tenure": "Between 1-2 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Others",
          "Tenure": "Between 1-2 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Others",
          "Tenure": "Between 1-2 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Others",
          "Tenure": "Between 1-2 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Others",
          "Tenure": "Between 2-5 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Others",
          "Tenure": "Between 2-5 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Others",
          "Tenure": "Between 2-5 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Others",
          "Tenure": "Between 2-5 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Others",
          "Tenure": "Between 5-7 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Others",
          "Tenure": "Between 5-7 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Others",
          "Tenure": "Between 5-7 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Others",
          "Tenure": "Between 5-7 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Others",
          "Tenure": "Between 7-9 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Others",
          "Tenure": "Between 7-9 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Others",
          "Tenure": "Between 7-9 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Others",
          "Tenure": "Between 7-9 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Others",
          "Tenure": "Above 10 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Others",
          "Tenure": "Above 10 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Others",
          "Tenure": "Above 10 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Employees",
          "Gender": "Others",
          "Tenure": "Above 10 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Male",
          "Tenure": "Less than 1 year",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Male",
          "Tenure": "Less than 1 year",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Male",
          "Tenure": "Less than 1 year",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Male",
          "Tenure": "Less than 1 year",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Male",
          "Tenure": "Between 1-2 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Male",
          "Tenure": "Between 1-2 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Male",
          "Tenure": "Between 1-2 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Male",
          "Tenure": "Between 1-2 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Male",
          "Tenure": "Between 2-5 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Male",
          "Tenure": "Between 2-5 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Male",
          "Tenure": "Between 2-5 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Male",
          "Tenure": "Between 2-5 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Male",
          "Tenure": "Between 5-7 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Male",
          "Tenure": "Between 5-7 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Male",
          "Tenure": "Between 5-7 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Male",
          "Tenure": "Between 5-7 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Male",
          "Tenure": "Between 7-9 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Male",
          "Tenure": "Between 7-9 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Male",
          "Tenure": "Between 7-9 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Male",
          "Tenure": "Between 7-9 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Male",
          "Tenure": "Above 10 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Male",
          "Tenure": "Above 10 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Male",
          "Tenure": "Above 10 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Male",
          "Tenure": "Above 10 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Female",
          "Tenure": "Less than 1 year",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Female",
          "Tenure": "Less than 1 year",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Female",
          "Tenure": "Less than 1 year",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Female",
          "Tenure": "Less than 1 year",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Female",
          "Tenure": "Between 1-2 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Female",
          "Tenure": "Between 1-2 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Female",
          "Tenure": "Between 1-2 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Female",
          "Tenure": "Between 1-2 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Female",
          "Tenure": "Between 2-5 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Female",
          "Tenure": "Between 2-5 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Female",
          "Tenure": "Between 2-5 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Female",
          "Tenure": "Between 2-5 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Female",
          "Tenure": "Between 5-7 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Female",
          "Tenure": "Between 5-7 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Female",
          "Tenure": "Between 5-7 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Female",
          "Tenure": "Between 5-7 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Female",
          "Tenure": "Between 7-9 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Female",
          "Tenure": "Between 7-9 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Female",
          "Tenure": "Between 7-9 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Female",
          "Tenure": "Between 7-9 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Female",
          "Tenure": "Above 10 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Female",
          "Tenure": "Above 10 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Female",
          "Tenure": "Above 10 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Female",
          "Tenure": "Above 10 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Others",
          "Tenure": "Less than 1 year",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Others",
          "Tenure": "Less than 1 year",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Others",
          "Tenure": "Less than 1 year",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Others",
          "Tenure": "Less than 1 year",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Others",
          "Tenure": "Between 1-2 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Others",
          "Tenure": "Between 1-2 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Others",
          "Tenure": "Between 1-2 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Others",
          "Tenure": "Between 1-2 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Others",
          "Tenure": "Between 2-5 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Others",
          "Tenure": "Between 2-5 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Others",
          "Tenure": "Between 2-5 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Others",
          "Tenure": "Between 2-5 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Others",
          "Tenure": "Between 5-7 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Others",
          "Tenure": "Between 5-7 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Others",
          "Tenure": "Between 5-7 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Others",
          "Tenure": "Between 5-7 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Others",
          "Tenure": "Between 7-9 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Others",
          "Tenure": "Between 7-9 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Others",
          "Tenure": "Between 7-9 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Others",
          "Tenure": "Between 7-9 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Others",
          "Tenure": "Above 10 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Others",
          "Tenure": "Above 10 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Others",
          "Tenure": "Above 10 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Temporary Employee",
          "Gender": "Others",
          "Tenure": "Above 10 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Male",
          "Tenure": "Less than 1 year",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Male",
          "Tenure": "Less than 1 year",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Male",
          "Tenure": "Less than 1 year",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Male",
          "Tenure": "Less than 1 year",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Male",
          "Tenure": "Between 1-2 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Male",
          "Tenure": "Between 1-2 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Male",
          "Tenure": "Between 1-2 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Male",
          "Tenure": "Between 1-2 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Male",
          "Tenure": "Between 2-5 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Male",
          "Tenure": "Between 2-5 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Male",
          "Tenure": "Between 2-5 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Male",
          "Tenure": "Between 2-5 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Male",
          "Tenure": "Between 5-7 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Male",
          "Tenure": "Between 5-7 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Male",
          "Tenure": "Between 5-7 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Male",
          "Tenure": "Between 5-7 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Male",
          "Tenure": "Between 7-9 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Male",
          "Tenure": "Between 7-9 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Male",
          "Tenure": "Between 7-9 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Male",
          "Tenure": "Between 7-9 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Male",
          "Tenure": "Above 10 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Male",
          "Tenure": "Above 10 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Male",
          "Tenure": "Above 10 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Male",
          "Tenure": "Above 10 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Female",
          "Tenure": "Less than 1 year",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Female",
          "Tenure": "Less than 1 year",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Female",
          "Tenure": "Less than 1 year",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Female",
          "Tenure": "Less than 1 year",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Female",
          "Tenure": "Between 1-2 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Female",
          "Tenure": "Between 1-2 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Female",
          "Tenure": "Between 1-2 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Female",
          "Tenure": "Between 1-2 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Female",
          "Tenure": "Between 2-5 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Female",
          "Tenure": "Between 2-5 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Female",
          "Tenure": "Between 2-5 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Female",
          "Tenure": "Between 2-5 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Female",
          "Tenure": "Between 5-7 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Female",
          "Tenure": "Between 5-7 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Female",
          "Tenure": "Between 5-7 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Female",
          "Tenure": "Between 5-7 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Female",
          "Tenure": "Between 7-9 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Female",
          "Tenure": "Between 7-9 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Female",
          "Tenure": "Between 7-9 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Female",
          "Tenure": "Between 7-9 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Female",
          "Tenure": "Above 10 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Female",
          "Tenure": "Above 10 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Female",
          "Tenure": "Above 10 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Female",
          "Tenure": "Above 10 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Others",
          "Tenure": "Less than 1 year",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Others",
          "Tenure": "Less than 1 year",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Others",
          "Tenure": "Less than 1 year",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Others",
          "Tenure": "Less than 1 year",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Others",
          "Tenure": "Between 1-2 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Others",
          "Tenure": "Between 1-2 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Others",
          "Tenure": "Between 1-2 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Others",
          "Tenure": "Between 1-2 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Others",
          "Tenure": "Between 2-5 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Others",
          "Tenure": "Between 2-5 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Others",
          "Tenure": "Between 2-5 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Others",
          "Tenure": "Between 2-5 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Others",
          "Tenure": "Between 5-7 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Others",
          "Tenure": "Between 5-7 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Others",
          "Tenure": "Between 5-7 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Others",
          "Tenure": "Between 5-7 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Others",
          "Tenure": "Between 7-9 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Others",
          "Tenure": "Between 7-9 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Others",
          "Tenure": "Between 7-9 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Others",
          "Tenure": "Between 7-9 years",
          "Age": "Less than 22",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Others",
          "Tenure": "Above 10 years",
          "Age": "50+",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Others",
          "Tenure": "Above 10 years",
          "Age": "35 to 50",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Others",
          "Tenure": "Above 10 years",
          "Age": "22 to 35",
          "Head Count": ""
        },
        {
          "Employee Type": "Workers",
          "Gender": "Others",
          "Tenure": "Above 10 years",
          "Age": "Less than 22",
          "Head Count": ""
        }
      ]
      ,
      "OH and S": [
        {
          "Injury Type": "Slips, Trips, and Falls",
          "Number of Incidents": "",
          "Gender": "Male",
          "Head Count": ""
        },
        {
          "Injury Type": "Slips, Trips, and Falls",
          "Number of Incidents": "",
          "Gender": "Female",
          "Head Count": ""
        },
        {
          "Injury Type": "Slips, Trips, and Falls",
          "Number of Incidents": "",
          "Gender": "Others",
          "Head Count": ""
        },
        {
          "Injury Type": "Cuts and Lacerations",
          "Number of Incidents": "",
          "Gender": "Male",
          "Head Count": ""
        },
        {
          "Injury Type": "Cuts and Lacerations",
          "Number of Incidents": "",
          "Gender": "Female",
          "Head Count": ""
        },
        {
          "Injury Type": "Cuts and Lacerations",
          "Number of Incidents": "",
          "Gender": "Others",
          "Head Count": ""
        },
        {
          "Injury Type": "Overexertion Injuries",
          "Number of Incidents": "",
          "Gender": "Male",
          "Head Count": ""
        },
        {
          "Injury Type": "Overexertion Injuries",
          "Number of Incidents": "",
          "Gender": "Female",
          "Head Count": ""
        },
        {
          "Injury Type": "Overexertion Injuries",
          "Number of Incidents": "",
          "Gender": "Others",
          "Head Count": ""
        },
        {
          "Injury Type": "Contact with Objects and Equipment",
          "Number of Incidents": "",
          "Gender": "Male",
          "Head Count": ""
        },
        {
          "Injury Type": "Contact with Objects and Equipment",
          "Number of Incidents": "",
          "Gender": "Female",
          "Head Count": ""
        },
        {
          "Injury Type": "Contact with Objects and Equipment",
          "Number of Incidents": "",
          "Gender": "Others",
          "Head Count": ""
        },
        {
          "Injury Type": "Fires and Explosions",
          "Number of Incidents": "",
          "Gender": "Male",
          "Head Count": ""
        },
        {
          "Injury Type": "Fires and Explosions",
          "Number of Incidents": "",
          "Gender": "Female",
          "Head Count": ""
        },
        {
          "Injury Type": "Fires and Explosions",
          "Number of Incidents": "",
          "Gender": "Others",
          "Head Count": ""
        },
        {
          "Injury Type": "Exposure to Hazardous Materials",
          "Number of Incidents": "",
          "Gender": "Male",
          "Head Count": ""
        },
        {
          "Injury Type": "Exposure to Hazardous Materials",
          "Number of Incidents": "",
          "Gender": "Female",
          "Head Count": ""
        },
        {
          "Injury Type": "Exposure to Hazardous Materials",
          "Number of Incidents": "",
          "Gender": "Others",
          "Head Count": ""
        },
        {
          "Injury Type": "Accident during Business Travel",
          "Number of Incidents": "",
          "Gender": "Male",
          "Head Count": ""
        },
        {
          "Injury Type": "Accident during Business Travel",
          "Number of Incidents": "",
          "Gender": "Female",
          "Head Count": ""
        },
        {
          "Injury Type": "Accident during Business Travel",
          "Number of Incidents": "",
          "Gender": "Others",
          "Head Count": ""
        },
        {
          "Injury Type": "Accident during workplace commute",
          "Number of Incidents": "",
          "Gender": "Male",
          "Head Count": ""
        },
        {
          "Injury Type": "Accident during workplace commute",
          "Number of Incidents": "",
          "Gender": "Female",
          "Head Count": ""
        },
        {
          "Injury Type": "Accident during workplace commute",
          "Number of Incidents": "",
          "Gender": "Others",
          "Head Count": ""
        },
        {
          "Injury Type": "Others",
          "Number of Incidents": "",
          "Gender": "Male",
          "Head Count": ""
        },
        {
          "Injury Type": "Others",
          "Number of Incidents": "",
          "Gender": "Female",
          "Head Count": ""
        },
        {
          "Injury Type": "Others",
          "Number of Incidents": "",
          "Gender": "Others",
          "Head Count": ""
        },
      ]
      ,
      "Training and Edu": [
        {
          "Types of training": "Employee health & safety training",

          "Segment": "BOD",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Employee health & safety training",

          "Segment": "Employees",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Employee health & safety training",

          "Segment": "Key management personnel",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Employee health & safety training",

          "Segment": "Workers",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Employee health & safety training",

          "Segment": "others",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Employee Skill Upgradation Training",

          "Segment": "BOD",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Employee Skill Upgradation Training",

          "Segment": "Employees",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Employee Skill Upgradation Training",

          "Segment": "Key management personnel",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Employee Skill Upgradation Training",

          "Segment": "Workers",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Employee Skill Upgradation Training",

          "Segment": "others",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Onboarding and orientation",

          "Segment": "BOD",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Onboarding and orientation",

          "Segment": "Employees",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Onboarding and orientation",

          "Segment": "Key management personnel",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Onboarding and orientation",

          "Segment": "Workers",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Onboarding and orientation",

          "Segment": "others",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Technical Training",

          "Segment": "BOD",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Technical Training",

          "Segment": "Employees",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Technical Training",

          "Segment": "Key management personnel",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Technical Training",

          "Segment": "Workers",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Technical Training",

          "Segment": "others",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "corporate training",

          "Segment": "BOD",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "corporate training",

          "Segment": "Employees",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "corporate training",

          "Segment": "Key management personnel",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "corporate training",

          "Segment": "Workers",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "corporate training",

          "Segment": "others",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Anti-corruption Training",

          "Segment": "BOD",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Anti-corruption Training",

          "Segment": "Employees",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Anti-corruption Training",

          "Segment": "Key management personnel",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Anti-corruption Training",

          "Segment": "Workers",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Anti-corruption Training",

          "Segment": "others",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "POSH training",

          "Segment": "BOD",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "POSH training",

          "Segment": "BOD",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "POSH training",

          "Segment": "Employees",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "POSH training",

          "Segment": "Key management personnel",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "POSH training",

          "Segment": "Workers",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "POSH training",

          "Segment": "others",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Strategy Implementation",

          "Segment": "BOD",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Strategy Implementation",

          "Segment": "Employees",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Strategy Implementation",

          "Segment": "Key management personnel",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Strategy Implementation",

          "Segment": "Workers",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Strategy Implementation",

          "Segment": "others",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Business operation",

          "Segment": "BOD",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Business operation",

          "Segment": "Employees",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Business operation",

          "Segment": "Key management personnel",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Business operation",

          "Segment": "Workers",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Business operation",

          "Segment": "others",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Organisation structure",

          "Segment": "BOD",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Organisation structure",

          "Segment": "Employees",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Organisation structure",

          "Segment": "Key management personnel",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Organisation structure",

          "Segment": "Workers",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Organisation structure",

          "Segment": "others",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Risk Management training",

          "Segment": "BOD",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Risk Management training",

          "Segment": "Employees",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Risk Management training",

          "Segment": "Key management personnel",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Risk Management training",

          "Segment": "Workers",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Risk Management training",

          "Segment": "others",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Regulatory framework",

          "Segment": "BOD",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Regulatory framework",

          "Segment": "Employees",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Regulatory framework",

          "Segment": "Key management personnel",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Regulatory framework",

          "Segment": "Workers",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Regulatory framework",

          "Segment": "others",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Cyber security",

          "Segment": "BOD",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Cyber security",

          "Segment": "Employees",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Cyber security",

          "Segment": "Key management personnel",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Cyber security",

          "Segment": "Workers",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Cyber security",

          "Segment": "others",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Future outlook training",

          "Segment": "BOD",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Future outlook training",

          "Segment": "Employees",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Future outlook training",

          "Segment": "Key management personnel",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Future outlook training",

          "Segment": "Workers",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Future outlook training",

          "Segment": "others",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Leadership connect program",

          "Segment": "BOD",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Leadership connect program",

          "Segment": "Employees",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Leadership connect program",

          "Segment": "Key management personnel",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Leadership connect program",

          "Segment": "Workers",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Leadership connect program",

          "Segment": "others",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Corporate governance training",

          "Segment": "BOD",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Corporate governance training",

          "Segment": "Employees",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Corporate governance training",

          "Segment": "Key management personnel",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Corporate governance training",

          "Segment": "Workers",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Corporate governance training",

          "Segment": "others",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Emerging compliance landscape",

          "Segment": "BOD",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Emerging compliance landscape",

          "Segment": "Employees",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Emerging compliance landscape",

          "Segment": "Key management personnel",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Emerging compliance landscape",

          "Segment": "Workers",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Emerging compliance landscape",

          "Segment": "others",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "AML (Anti-money laundering)",

          "Segment": "BOD",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "AML (Anti-money laundering)",

          "Segment": "Employees",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "AML (Anti-money laundering)",

          "Segment": "Key management personnel",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "AML (Anti-money laundering)",

          "Segment": "Workers",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "AML (Anti-money laundering)",

          "Segment": "others",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "KYC",

          "Segment": "BOD",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "KYC",

          "Segment": "Employees",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "KYC",

          "Segment": "Key management personnel",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "KYC",

          "Segment": "Workers",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "KYC",

          "Segment": "others",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Whistle-blower Policy Training",

          "Segment": "BOD",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Whistle-blower Policy Training",

          "Segment": "Employees",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Whistle-blower Policy Training",

          "Segment": "Key management personnel",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Whistle-blower Policy Training",

          "Segment": "Workers",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Whistle-blower Policy Training",

          "Segment": "others",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "NRI Product & KYC Documentation",

          "Segment": "BOD",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "NRI Product & KYC Documentation",

          "Segment": "Employees",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "NRI Product & KYC Documentation",

          "Segment": "Key management personnel",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "NRI Product & KYC Documentation",

          "Segment": "Workers",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "NRI Product & KYC Documentation",

          "Segment": "others",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Mobile Banking",

          "Segment": "BOD",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Mobile Banking",

          "Segment": "Employees",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Mobile Banking",

          "Segment": "Key management personnel",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Mobile Banking",

          "Segment": "Workers",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Mobile Banking",

          "Segment": "others",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Prohibition of Insider Trading",

          "Segment": "BOD",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Prohibition of Insider Trading",

          "Segment": "Employees",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Prohibition of Insider Trading",

          "Segment": "Key management personnel",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Prohibition of Insider Trading",

          "Segment": "Workers",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Prohibition of Insider Trading",

          "Segment": "others",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Cash Management System",

          "Segment": "BOD",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Cash Management System",

          "Segment": "Employees",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Cash Management System",

          "Segment": "Key management personnel",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Cash Management System",

          "Segment": "Workers",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Cash Management System",

          "Segment": "others",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Code of Conduct & Ethics",

          "Segment": "BOD",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Code of Conduct & Ethics",

          "Segment": "Employees",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Code of Conduct & Ethics",

          "Segment": "Key management personnel",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Code of Conduct & Ethics",

          "Segment": "Workers",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Code of Conduct & Ethics",

          "Segment": "others",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "CERSAI",

          "Segment": "BOD",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "CERSAI",

          "Segment": "Employees",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "CERSAI",

          "Segment": "Key management personnel",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "CERSAI",

          "Segment": "Workers",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "CERSAI",

          "Segment": "others",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Grievance Redressal Mechanism",

          "Segment": "BOD",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Grievance Redressal Mechanism",

          "Segment": "Employees",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Grievance Redressal Mechanism",

          "Segment": "Key management personnel",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Grievance Redressal Mechanism",

          "Segment": "Workers",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Grievance Redressal Mechanism",

          "Segment": "others",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Other",

          "Segment": "BOD",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Other",

          "Segment": "Employees",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Other",

          "Segment": "Key management personnel",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Other",

          "Segment": "Workers",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        },
        {
          "Types of training": "Other",

          "Segment": "others",
          "Avg Hours per batch": "",
          "Head Count": "",
          "Financial investment": "",
        }
      ]
      ,
      "Child Labor": [
        {
          "Supplier Name": "",
          "Risk Level": "",
          "No. of Incidents reported": ""
        }
      ]
      ,
      "Customer Privacy": [
        {
          "Nature of Complaints": "Data Breaches",
          "No. of complaints received": "",
          "No. of complaints solved": ""
        },
        {
          "Nature of Complaints": "Data Leaks",
          "No. of complaints received": "",
          "No. of complaints solved": ""
        },
        {
          "Nature of Complaints": "Unauthorized Data Collection or Use",
          "No. of complaints received": "",
          "No. of complaints solved": ""
        },
        {
          "Nature of Complaints": "Difficulties Accessing or Controlling Personal Data",
          "No. of complaints received": "",
          "No. of complaints solved": ""
        }
      ]
      ,
      "Mktg and Labelling": [
        {
          "Incident": "Comparative Advertising",
          "No. of non-compliance Incidents": "",
          "No. of times regulation violated": ""
        },
        {
          "Incident": "Consumer Protection",
          "No. of non-compliance Incidents": "",
          "No. of times regulation violated": ""
        },
        {
          "Incident": "False Advertising and Misleading Claims",
          "No. of non-compliance Incidents": "",
          "No. of times regulation violated": ""
        },
        {
          "Incident": "Greenwashing",
          "No. of non-compliance Incidents": "",
          "No. of times regulation violated": ""
        },
        {
          "Incident": "Health and Wellness Claims",
          "No. of non-compliance Incidents": "",
          "No. of times regulation violated": ""
        },
        {
          "Incident": "Labeling Compliance",
          "No. of non-compliance Incidents": "",
          "No. of times regulation violated": ""
        },
        {
          "Incident": "Product Liability",
          "No. of non-compliance Incidents": "",
          "No. of times regulation violated": ""
        },
        {
          "Incident": "Trademark and Intellectual Property",
          "No. of non-compliance Incidents": "",
          "No. of times regulation violated": ""
        }
      ]
      ,
      "CHS": [
        {
          "Type of Incident": "Product defects or malfunctions",
          "No. of non-compliance Incidents": "",
          "Customers Impacted": ""
        },
        {
          "Type of Incident": "Safety hazards",
          "No. of non-compliance Incidents": "",
          "Customers Impacted": ""
        },
        {
          "Type of Incident": "Injuries or illnesses",
          "No. of non-compliance Incidents": "",
          "Customers Impacted": ""
        },
        {
          "Type of Incident": "Product recalls",
          "No. of non-compliance Incidents": "",
          "Customers Impacted": ""
        },
        {
          "Type of Incident": "Errors or omissions in service delivery",
          "No. of non-compliance Incidents": "",
          "Customers Impacted": ""
        },
        {
          "Type of Incident": "Inadequate customer support",
          "No. of non-compliance Incidents": "",
          "Customers Impacted": ""
        },
        {
          "Type of Incident": "Security incidents",
          "No. of non-compliance Incidents": "",
          "Customers Impacted": ""
        },
        {
          "Type of Incident": "Others",
          "No. of non-compliance Incidents": "",
          "Customers Impacted": ""
        }
      ]
      ,
      "Social Benefits": [
        {
          "Program name": "",
          "Domain": "Plantation"
        },
        {
          "Program name": "",
          "Domain": "Livlihoods"
        },
        {
          "Program name": "",
          "Domain": "Education"
        },
        {
          "Program name": "",
          "Domain": "Rain water harvesting"
        },
        {
          "Program name": "",
          "Domain": "Renewable energy"
        },
        {
          "Program name": "",
          "Domain": "Training and Awareness"
        },
        {
          "Program name": "",
          "Domain": "Forestry"
        },
        {
          "Program name": "",
          "Domain": "Natural Farming"
        },
        {
          "Program name": "",
          "Domain": "Food Safety"
        }
      ]

    };

    if (module == "Flight") {
      return [
        {
          "Origin (city or IATA code)": "Delhi",
          "Destination (city or IATA code)": "Mumbai",
          "Class": "Economy",
          "Single way / \nreturn": " Single way",
          "kg CO2e": ""
        }
      ]
    }

    return variantMap[module];
  }

  const findGHGConversion = (data1, data2) => {
    return data1.map(entry1 => {
      // Concatenate the necessary fields from Data 1
      // let concatenatedValue = Object.values(entry1).join("");

      // Find matching entry in Data 2 by comparing concatenatedValue to Lookup
      if (entry1.Reference) {
        if (module == "Food") {
          return entry1;
        }
        else if (["Elec heat cooling"].indexOf(module) == -1) {
          let matchedEntry = data2.find(entry2 => entry2.ID == entry1.Reference);
          // delete entry1.Reference;
          // If a match is found, return the GHG Conversion, else return null or "Not Found"
          return {
            ...entry1,  // Include original data from Data 1
            Factor: matchedEntry ? matchedEntry['GHG Conversion'] : ''
          };
        }
        else {
          var returnData = {};
          let matchedEntry = data2.find(entry2 => entry2.ID == entry1.Reference);
          // delete entry1.Reference;
          // If a match is found, return the GHG Conversion, else return null or "Not Found"
          returnData = {
            ...entry1,  // Include original data from Data 1
            ["GEF Factors"]: matchedEntry ? matchedEntry['GHG Conversion'] : ''
          };
          let matchedEntry2 = data2.find(entry2 => entry2.ID == entry1["Reference 2"]);
          // delete entry1["Reference 2"];
          returnData["T&D Factors"] = matchedEntry2 ? matchedEntry2['GHG Conversion'] : ''
          return returnData
        }
      }
      else {
        return entry1;
      }

    });
  }

  const getColumns = (module) => {
    var columns = {
      "Fuel": [
        // { "title": "Fuels", "editable": false },
        { "title": "Type", "editable": false },
        { "title": "Fuel", "editable": false },
        { "title": "Unit", "editable": false },
        { "title": "Amount", "editable": true, "type": "Number" },
        { "title": "Factor", "editable": true, "type": "Number" }
      ],
      "Bioenergy": [
        // { "title": "Fuels", "editable": false },
        { "title": "Type", "editable": false },
        { "title": "Fuel", "editable": false },
        { "title": "Unit", "editable": false },
        { "title": "Amount", "editable": true, "type": "Number" },
        { "title": "Factor", "editable": true, "type": "Number" }
      ],
      "Refrigerant and other": [
        { "title": "Fuels", "editable": false },
        { "title": "Type", "editable": false },
        { "title": "Fuel", "editable": false },
        { "title": "Unit", "editable": false },
        { "title": "Amount", "editable": true, "type": "Number" },
        { "title": "Factor", "editable": true, "type": "Number" }
      ],
      "Elec heat cooling": [
        { "title": "Activity", "editable": false },
        { "title": "Country-Type", "editable": false },
        { "title": "Unit", "editable": false },
        { "title": "Amount", "editable": true, "type": "Number" },
        { "title": "GEF Factors", "editable": true, "type": "Number" },
        { "title": "T&D Factors", "editable": true, "type": "Number" }
      ],
      "Owned Vehicles": [
        { "title": "Scope", "editable": false },
        { "title": "Level 1", "editable": false },
        { "title": "Level 2", "editable": false },
        { "title": "Level 3", "editable": false },
        { "title": "Fuel", "editable": false },
        { "title": "Unit", "editable": false },
        { "title": "Distance (km)", "editable": true, "type": "Number" },
        { "title": "Factor", "editable": true, "type": "Number" }
      ],
      "Materials": [
        { "title": "Activity", "editable": false },
        { "title": "Waste type", "editable": false },
        { "title": "Unit", "editable": false },
        { "title": "Amount (tonnes)", "editable": true, "type": "Number" },
        { "title": "Factor", "editable": true, "type": "Number" }
      ],
      "WTT- fuels": [
        { "title": "Type", "editable": false },
        { "title": "Fuel", "editable": false },
        { "title": "Unit", "editable": false },
        { "title": "Amount", "editable": true, "type": "Number" },
        { "title": "Factor", "editable": true, "type": "Number" }
      ],
      "Waste Disposal": [
        { "title": "Activity", "editable": false },
        { "title": "Waste Material", "editable": false },
        { "title": "Unit", "editable": false },
        { "title": "Disposal Method", "editable": false },
        { "title": "Source Description", "editable": true },
        { "title": "Weight", "editable": true, "type": "Number" },
        { "title": "Factor", "editable": true, "type": "Number" }
      ],
      "Flight": [
        { "title": "Origin (city or IATA code)", "editable": true },
        { "title": "Destination (city or IATA code)", "editable": true },
        { "title": "Direct / Indirect", "editable": true },
        { "title": "Class", "editable": true },
        { "title": "Single way / return", "editable": true },
        { "title": "kg CO2e", "editable": true, "type": "Number" },
      ],
      "Accommodation": [
        { "title": "Country", "editable": false },
        { "title": "Number of occupied rooms", "editable": true, "type": "Number" },
        { "title": "Number of nights per room", "editable": true, "type": "Number" },
        { "title": "Factor", "editable": true, "type": "Number" }
      ],
      "Business travel - land and sea": [
        { "title": "Vehicle", "editable": false },
        { "title": "Type", "editable": false },
        { "title": "Fuel", "editable": false },
        { "title": "Unit", "editable": false },
        { "title": "Total distance", "editable": true, "type": "Number" },
        { "title": "Factor", "editable": true, "type": "Number" }
      ],
      "Freighting goods": [
        { "title": "Vehicle", "editable": false },
        { "title": "Type", "editable": false },
        { "title": "Fuel", "editable": false },
        { "title": "Unit", "editable": false },
        { "title": "Weight (tonnes)", "editable": true, "type": "Number" },
        { "title": "Distance (km)", "editable": true, "type": "Number" },
        { "title": "Factor", "editable": true, "type": "Number" }
      ],
      "Employees commuting": [
        { "title": "Vehicle", "editable": false },
        { "title": "Type", "editable": false },
        { "title": "Fuel", "editable": false },
        { "title": "Unit", "editable": false },
        { "title": "Total distance", "editable": true, "type": "Number" },
        { "title": "Factor", "editable": true, "type": "Number" }
      ],
      "Food": [
        { "title": "Meal Type", "editable": false },
        { "title": "Unit", "editable": false },
        { "title": "Amount", "editable": true, "type": "Number" },
        { "title": "Factor", "editable": true, "type": "Number" }
      ],
      "Home Office": [
        { "title": "Type of home office", "editable": false },
        { "title": "Number of employees", "editable": true, "type": "Number" },
        { "title": "Working regime (For full-time)", "editable": true, "type": "Number" },
        { "title": "Working from home", "editable": true, "type": "Number" },
        { "title": "Factor", "editable": true, "type": "Number" }
      ],
      "Water": [
        { "title": "Type", "editable": false },
        { "title": "Unit", "editable": false },
        { "title": "Source", "editable": true },
        { "title": "Amount", "editable": true, "type": "Number" },
        { "title": "Factor", "editable": true, "type": "Number" }
      ],
      "Employment": [
        { "title": "Employment Type", "editable": false },
        { "title": "Category", "editable": false },
        { "title": "Gender", "editable": false },
        { "title": "Age", "editable": false },
        { "title": "Head Count", "editable": true, "type": "Number" }
      ],
      "Leave": [
        { "title": "Type of Leave", "editable": false },
        { "title": "Duration in Days", "editable": true, "type": "Number" },
        { "title": "Head Count", "editable": true, "type": "Number" }
      ],
      "Retention": [
        { "title": "Employee Type", "editable": false },
        { "title": "Gender", "editable": false },
        { "title": "Tenure", "editable": false },
        { "title": "Age", "editable": false },
        { "title": "Head Count", "editable": true, "type": "Number" }
      ],
      "OH and S": [
        { "title": "Injury Type", "editable": false },
        { "title": "Gender", "editable": false },
        { "title": "Number of Incidents", "editable": true, "type": "Number" },
        { "title": "Head Count", "editable": true, "type": "Number" }
      ],
      "Training and Edu": [
        { "title": "Types of training", "editable": false },
        { "title": "Segment", "editable": false },
        { "title": "Avg Hours per batch", "editable": true, "type": "Number" },
        { "title": "Head Count", "editable": true, "type": "Number" },
        { "title": "Financial investment", "editable": true, "type": "Number" },
      ],
      "Child Labor": [
        { "title": "Risk Level", "editable": true, "type": "dropdown" },
        { "title": "Supplier Name", "editable": true },
        { "title": "No. of Incidents reported", "editable": true, "type": "Number" }
      ],
      "Customer Privacy": [
        { "title": "Nature of Complaints", "editable": false },
        { "title": "No. of complaints received", "editable": true, "type": "Number" },
        { "title": "No. of complaints solved", "editable": true, "type": "Number" }
      ],
      "Mktg and Labelling": [
        { "title": "Incident", "editable": false },
        { "title": "No. of non-compliance Incidents", "editable": true, "type": "Number" },
        { "title": "No. of times regulation violated", "editable": true, "type": "Number" }
      ],
      "CHS": [
        { "title": "Type of Incident", "editable": false },
        { "title": "No. of non-compliance Incidents", "editable": true, "type": "Number" },
        { "title": "Customers Impacted", "editable": true, "type": "Number" }
      ],
      "Social Benefits": [
        { "title": "Domain", "editable": false },
        { "title": "Program name", "editable": true },
        { "title": "No. of Beneficiaries", "editable": true, "type": "Number" },
        { "title": "Expenditure", "editable": true, "type": "Number" }
      ],
      "Entity": [
        { "title": "Entity Type", "editable": false },
        { "title": "Gender", "editable": false },
        { "title": "Age", "editable": false },
        { "title": "Tenure", "editable": false },
        { "title": "Head Count", "editable": true, "type": "Number" }
      ],
      "Eco. Performance": [
        { "title": "Data", "editable": false },
        { "title": "Values", "editable": true, "type": "Number" }
      ],
      "Market Presence": [
        { "title": "Data", "editable": false },
        { "title": "Values", "editable": true, "type": "Number" }
      ]
    };

    return columns[module];
  }

  const createVariantData = async () => {
    // var domain = userData?.username.split("@");
    await getDoc(doc(firestore, "Master Data", "Factors"))
      .then((doc) => {
        if (doc.exists) {
          var docData = doc.data();
          console.log(docData)
          var oData = getVariantData(module);
          var conData = findGHGConversion(oData, doc.data().factor);
          setVariantData(conData);
          console.log(conData)
        }
      }

      )
  }

  const onSaveVariant = async () => {
    console.log(selectedIndexes.current)
    var branch = office;
    if (!branch) {
      setShowModal(true);
      setModalText('Kindly Select Office');
      // alert('Kindly Select Office');
      return;
    }
    var selectData = [];
    selectedIndexes.current.map((val) => { selectData.push(variantData[val]) })


    var aColumns = getColumns(module);
    const editableColumns = aColumns
      .filter(header => header.editable)
      .map(header => header.title);

    // Loop through table data and set empty values to ""
    selectData.forEach(row => {
      editableColumns.forEach(column => {
        if (row[column] === undefined || row[column] === null || row[column] === "") {
          row[column] = "";
        }
      });
    });
    var domain = userData?.username.split("@");
    await getDoc(doc(firestore, domain[1], "Master Data", "Reporting Variant", module))
      .then((docRef) => {
        if (docRef.exists && docRef.data() && docRef.data()[office]) {
          setDoc(doc(firestore, domain[1], "Master Data", "Reporting Variant", module), {
            [office]: arrayUnion(...selectData)
          }, { merge: true }).then(() => {
            fetchVariantData()
            setShowModal(true);
            setModalText("Variant Saved Successfully")
            // alert("Variant Saved Successfully")
          })
            .catch(() => {
              setShowModal(true);
              setModalText("Error writing document")
              // alert("Error writing document")
            })
        }
        else {
          setDoc(doc(firestore, domain[1], "Master Data", "Reporting Variant", module), {
            [office]: selectData
          }, { merge: true }).then(() => {
            setShowModal(true)
            setModalText("Variant Saved Successfully")
            fetchVariantData()
          })
            .catch((error) => {
              console.log(error)
              setShowModal(true)
              setModalText("Error writing document")
            })
        }
      })
      .catch((error) => {
        console.log(error)
        setShowModal(true)
        setModalText("Error in getting data")
      })

  }

  const fetchVariantData = async () => {
    var domain = userData?.username.split("@");
    const docRef = doc(firestore,
      domain[1],
      "Master Data",
      "Reporting Variant",
      module
    );

    const docSnapshot = await getDoc(docRef);

    console.log("test", docSnapshot.data())

    if (docSnapshot.exists && docSnapshot.data()) {
      console.log("variant data", docSnapshot.data())
      setFetchedVariant(docSnapshot.data());
    }
  }

  const deleteVariant = async () => {
    console.log(selectedIndexes2.current)
    var branch = variantOffice;
    if (!branch) {
      setShowModal(true)
      setModalText('Kindly Select Office');
      return;
    }
    var selectData = [];
    // var unselectedData=[]
    // selectedIndexes2.current.map((val,index)=>{selectData.push(selectedVariant[val])})
    selectedVariant.map((val, index) => {
      if (!selectedIndexes2.current.includes(index)) {
        selectData.push(val)
      }
    })

    setSelectedVariant(selectData)
    setTempSelectedVariant(selectData)

    var aColumns = getColumns(module);
    const editableColumns = aColumns
      .filter(header => header.editable)
      .map(header => header.title);

    // Loop through table data and set empty values to ""
    selectData.forEach(row => {
      editableColumns.forEach(column => {
        if (row[column] === undefined || row[column] === null || row[column] === "") {
          row[column] = "";
        }
      });
    });
    if (selectData && selectData.length > 0) {
      //do u want to delete these records from this variant
      console.log("Seledct Data", selectData);
      // let anotherArray = fetchedVariant[variantOffice];
      // const filteredArray = anotherArray.filter(
      //   (item) =>
      //     !selectData.some(
      //       (selected) =>
      //         item.Reference === selected.Reference &&
      //         item.Fuels === selected.Fuels &&
      //         item.Type === selected.Type &&
      //         item.Fuel === selected.Fuel &&
      //         item.Unit === selected.Unit &&
      //         item.Amount === selected.Amount &&
      //         item.Factor === selected.Factor
      //     )
      // );
      var domain = userData?.username.split("@");
      updateDoc(doc(firestore, domain[1], "Master Data", "Reporting Variant", module), {
        [variantOffice]: selectData
        // selectData:FieldValue.delete()
      })
        .then(() => {
          setShowModal(true)
          setModalText("Variant successfully deleted!");
          // console.log("test",fetchedVariant[variantOffice])
          console.log(selectedVariant)
          // setSelectedVariant()
          setFetchedVariant((prevData) => ({
            ...prevData,
            [variantOffice]: prevData[variantOffice].filter((item) => !selectData.includes(item)),
          }));
          // setFetchedVariant(
          //   fetchedVariant[variantOffice].filter((data)=>{
          //   data!=selectData;
          // }))


          //fetchVariantData()

        })
        .catch((error) => {
          setShowModal(true)
          setModalText("Error writing document: " + error);
        });

    }
    else {
      //confirm do u want to delete this variant
      var domain = userData?.username.split("@");
      updateDoc(doc(firestore, domain[1], "Master Data", "Reporting Variant", module), {
        [variantOffice]: deleteField()
      })
        .then(() => {
          setShowModal(true)
          setModalText("Variant successfully deleted!");
          fetchVariantData()

        })
        .catch((error) => {
          setShowModal(true)
          setModalText("Error writing document: " + error);
        });
    }
    // console.log("test2",fetchedVariant[variantOffice])
    console.log(selectData)

  }
  // Getting the fuel type from the Sidebar context

  // console.log(fuel)

  // Get the columns for the current fuel type
  const getColumn = () => {
    return fuelData[module] || [];
  };

  var uniqueOfficeTypes = [...new Set(userData?.branches.map(item => item.officeType))];

  // Convert unique officeType values to the desired format
  var formattedOfficeTypes = uniqueOfficeTypes.map(type => ({ officeType: type }))

  console.log(formattedOfficeTypes)

  useEffect(() => {
    if (userData) {
      createVariantData();
      fetchVariantData();


    }
  }, [userData, module])

  useEffect(() => {
    if (fetchedVariant?.length > 0) {
      fetchVariantRef.current = fetchedVariant
    }
  }, [fetchedVariant])


  useEffect(() => {
    if (selectedVariant && selectedVariant.length > 0) {
      var getBranchFilters = filterForColumns[module]
      var filterValues = {};
      getBranchFilters.forEach(val => {
        filterValues[val] = [...new Set(selectedVariant.map(item => item[val]))]
      })

      console.log("filter Values", filterValues)
      setFilterList(filterValues)
      if (tempSelectedVariant.length == 0) setTempSelectedVariant(selectedVariant)
    }
    else {
      setTempSelectedVariant([])
    }
  }, [selectedVariant])

  const createTable = async () => {
    await getDoc(doc(firestore, "Master Data", "Factors"))
      .then((doc) => {
        if (doc.exists) {
          var docData = doc.data();
          console.log("docdata", docData)
          var oData = getVariantData(module);
          console.log("o", oData);
          var conData = findGHGConversion(oData, doc.data().factor);
          setSelectedVariant(conData);
          setTempSelectedVariant(conData);
          console.log("conData", conData)
        }
      }

      )

  }
  const branchChange = async (value) => {
    console.log("Module", module)
    console.log("tabledata", fetchedVariant)
    const parsedValue = JSON.parse(value);
    const branch = parsedValue?.branch;
    console.log("parsed Value", parsedValue.branch)
    const officeType = parsedValue?.officeType;
    var domain = userData?.username.split("@");
    var monthYear = master?.currentReportingCycle;


    // setBranch(parsedValue.branch); // Update the branch state
    console.log("check", officeType);

    // Update the selected variant based on the office type
    if (fetchedVariant && fetchedVariant[officeType]) {
      setSelectedVariant(fetchedVariant[officeType]);
    }
    // setLoading(true)
    try {
      // Fetch data from Firestore
      const docRef = doc(
        firestore,
        domain[1],
        "TransactionData",
        `${monthYear?.month}-${monthYear?.year}`,
        module
      );
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists() && docSnapshot.data()) {
        // Data exists, show it in the table
        const tableData = docSnapshot.data();
        if (tableData[branch] && tableData[branch].data) {
          console.log("Data exists for the branch:", tableData[branch].data);
          setSelectedVariant(tableData[branch].data)
          setTempSelectedVariant(tableData[branch].data)
          setDataStatus(tableData[branch]?.status);
          setLoading(false)
        }
        else {
          setDataStatus("Not Submitted");
          if (fetchedVariant && fetchedVariant[officeType]) {
            console.log("Branch exists in reporting variant:", fetchedVariant[officeType]);
            setSelectedVariant(fetchedVariant[officeType])
            setTempSelectedVariant(fetchedVariant[officeType])
            console.log("selected Variant", selectedVariant)
            setLoading(false)

            // Handle logic if branch exists in reporting variant
            // setTableData([]); // Show an empty table
          } else {
            setDataStatus("Not Submitted");
            console.log("Branch does not exist in reporting variant, creating table...");
            console.log("selected Variant", selectedVariant)
            // console.log("data from func",getVariantData(module))
            // setSelectedVariant(getVariantData(module))
            // setTempSelectedVariant(getVariantData(module))
            createTable()
            // Create the whole table (example logic)
            // const newTableData = {
            //     branch: branch,
            //     officeType: officeType,
            //     data: [] // Initialize with an empty array or default data
            // };

            // // Save the new data to Firestore
            // await setDoc(docRef, newTableData);
            // console.log("New table created for the branch.");
            // setTableData(newTableData); // Update the table with the created data
          }
        }
        // console.log("selected Variant",selectedVariant)
        // setTableData(tableData); // Update the table with the fetched data
      } else {
        // Data does not exist, check the reporting variant
        setDataStatus("Not Submitted");
        if (fetchedVariant && fetchedVariant[officeType]) {
          console.log("Branch exists in reporting variant:", fetchedVariant[officeType]);
          setSelectedVariant(fetchedVariant[officeType])
          setTempSelectedVariant(fetchedVariant[officeType])
          console.log("selected Variant", selectedVariant)
          setLoading(false)

          // Handle logic if branch exists in reporting variant
          // setTableData([]); // Show an empty table
        } else {
          console.log("Branch does not exist in reporting variant, creating table...");
          console.log("selected Variant", selectedVariant)
          // console.log("data from func",getVariantData(module))
          setLoading(false)
          createTable()
          // setSelectedVariant(getVariantData(module))
          // setTempSelectedVariant(getVariantData(module))
          // Create the whole table (example logic)
          // const newTableData = {
          //     branch: branch,
          //     officeType: officeType,
          //     data: [] // Initialize with an empty array or default data
          // };

          // // Save the new data to Firestore
          // await setDoc(docRef, newTableData);
          // console.log("New table created for the branch.");
          // setTableData(newTableData); // Update the table with the created data
        }


      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  //   const groupSubmittedModulesByBranch = (data, moduleCategories, getModuleCategory) => {
  //     let branchWiseData = {};

  //     const scopeData = {
  //         "Fuel": "Scope 1",
  //         "Bioenergy": "Scope 1",
  //         "Refrigerant and other": "Scope 1",
  //         "Elec heat cooling": "Scope 2",
  //         "Owned Vehicles": "Scope 1",
  //         "Materials": "Scope 3",
  //         "WTT- fuels": "Scope 3",
  //         "Waste Disposal": "Scope 3",
  //         "Flight": "Scope 3",
  //         "Business travel - land and sea": "Scope 3",
  //         "Freighting goods": "Scope 3",
  //         "Employees commuting": "Scope 3",
  //         "Water": "Scope 3",
  //         "Accommodation": "Scope 3",
  //         "Food": "Scope 3",
  //         "Home Office": "Scope 3"
  //     };

  //     // Iterate over each module in the data
  //     data.forEach(moduleData => {
  //         const moduleName = Object.keys(moduleData)[0];
  //         const moduleCategory = getModuleCategory(moduleName, moduleCategories);
  //         const branches = moduleData[moduleName];

  //         // Iterate over each branch in the module
  //         Object.keys(branches).forEach(branch => {
  //             const branchData = branches[branch];

  //             // Only process modules with the "Submitted" status
  //             if (branchData.status === "Submitted") {
  //                 if (!branchWiseData[branch]) {
  //                     branchWiseData[branch] = {
  //                         modules: {},
  //                         Overview: {
  //                             TotalEmissions: 0,
  //                             Water: 0,
  //                             Waste: 0,
  //                             Biodiversity: 0,
  //                             Beneficiaries: 0,
  //                             GenderSplit: 0,
  //                             SocialSpend: 0,
  //                             AgeCount: {
  //                                 "50+": 0,
  //                                 "35 to 50": 0,
  //                                 "22 to 35": 0,
  //                                 "Less than 22": 0
  //                             },
  //                             GenderCount: { "Male": 0, "Female": 0, "Others": 0 },
  //                             Scope: {
  //                                 "Scope 1": 0,
  //                                 "Scope 2": 0,
  //                                 "Scope 3": 0
  //                             }
  //                         },
  //                         Environment: {
  //                             Overview: {
  //                                 TotalEmissions: 0,
  //                                 "Scope 1": 0,
  //                                 "Scope 2": 0,
  //                                 "Scope 3": 0,
  //                                 Water: 0,
  //                                 "Water Stress": 0,
  //                                 Waste: 0,
  //                                 Scope: {
  //                                     "Scope 1": 0,
  //                                     "Scope 2": 0,
  //                                     "Scope 3": 0
  //                                 }
  //                             },
  //                             "Scope 1": {
  //                                 "Scope 1": 0,
  //                                 "Bioenergy": 0,
  //                                 "Fuels": 0,
  //                                 "Owned Vehicles": 0,
  //                                 "Refrigerant": 0,
  //                                 Emission: {},
  //                                 BioenergySplit: {}
  //                             },
  //                             "Scope 2": {
  //                                 "Scope 2": 0,
  //                                 "District Cooling": 0,
  //                                 "Electricity": 0,
  //                                 "Heat and steam": 0,
  //                                 "Electricity - Backup": 0,
  //                                 "Owned Vehicles": 0,
  //                                 Activities: {},
  //                                 Emission: {}
  //                             },
  //                             "Scope 3": {
  //                                 "Scope 3": 0,
  //                                 "Business travel - land and sea": 0,
  //                                 "Employees commuting": 0,
  //                                 "Flight": 0,
  //                                 "Freighting goods": 0,
  //                                 "Materials": 0,
  //                                 "Waste Disposal": 0,
  //                                 "WTT- fuels": 0,
  //                                 Emission: {}
  //                             }
  //                         },
  //                         Social: {
  //                             Overview: {
  //                                 Headcount: 0,
  //                                 "Female:Male": 0,
  //                                 "Total training Hrs": 0,
  //                                 "CSR Spend": 0,
  //                                 Attrition: 0,
  //                                 Retention: 0,
  //                                 EmployementType: {},
  //                                 Gender: {},
  //                                 GenderForInjuries: {},
  //                                 ChildLabor: {},
  //                                 Training: {},
  //                                 InjuryType: {},
  //                                 ChildLaborSupplier: {},
  //                                 TrainingType: {}
  //                             },
  //                             PrivacyOthers: {
  //                                 Complaints: {},
  //                                 CHS: {},
  //                                 "Mktg and Labelling": {},
  //                                 SocialEx: {},
  //                                 SocialBe: {}
  //                             }
  //                         },
  //                         Governance: {
  //                             Overview: {
  //                                 BODs: 0,
  //                                 "BODSFemale": 0,
  //                                 "CFO/CEO": 0,
  //                                 "CFO/CEO-Female": 0,
  //                                 "Independent Directors": 0,
  //                                 Revenue: 0,
  //                                 Turnover: 0,
  //                                 Gender: {},
  //                                 EntityType: {}
  //                             }
  //                         }
  //                     };
  //                 }

  //                 // Store module data under the branch
  //                 branchWiseData[branch].modules[moduleName] = branchData;
  //             }
  //         });
  //     });

  //     return branchWiseData;
  // };



  const ignoreFields = () => {
    const checkList = getColumns(module)
    const titles = checkList.map(item => item.title);
    selectedVariant.map((entry) => {
      Object.keys(entry).map((item) => {
        if (titles.indexOf(item) == -1) {
          delete (entry[item])
        }

      })


    })

  }
  const saveRecord = async () => {
    if (!branch) {
      setShowModal(true);
      setModalText("Kindly Select Branch")
      return;
    }

    if (dataStatus == 'Submitted') {
      setShowModal(true);
      setModalText("You cannot submit data for this branch as it is already submitted")
      return;
    }
    //do u want to save this data conformation msg after branch check
    var domain = userData?.username.split("@");
    var monthYear = master?.currentReportingCycle;
    var { totalEmissions, fullEmissions, scopeWiseEmission } = calculateEmissions();

    await getDoc(doc(firestore, domain[1], "Master Data"))
      .then(async (docSnapshot) => {
        if (docSnapshot.data()) {
          console.log(docSnapshot.data());
          setMaster(docSnapshot.data());
          monthYear = docSnapshot.data().currentReportingCycle;
        }
      })
    const docRef = doc(
      firestore,
      domain[1],
      "TransactionData",
      `${monthYear?.month}-${monthYear?.year}`,
      module
    );
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists() && docSnapshot.data()) {
      const tableData = docSnapshot.data();
      // setDataStatus(tableData[branch]?.status);
      if (tableData[branch]?.status == 'Submitted') {
        setShowModal(true);
        setModalText("You cannot submit data for this branch as it is already submitted")
        return;
      }
    }

    ignoreFields();
    console.log("fix", totalEmissions)
    console.log("test23", selectedVariant, monthYear.month, monthYear.year, module, domain[1], userData)
    let sanitizedVariant = sanitizeObject(selectedVariant);
    // if(module=="Elec heat cooling"){
    //   sanitizedVariant = selectedVariant
    //   .filter(item => item.Amount !== "" && item["GEF Factors"] !== undefined && item["T&D Factors"] !== undefined ) // Remove invalid entries
    //   .map(item => ({
    //     ...item
    //   }));
    // }
    // if(checkKey(module)!=="Environment" || module=="Flight" || module=="Accomodation"){
    //   sanitizedVariant=selectedVariant;
    // }
    // else{
    //   sanitizedVariant = selectedVariant
    //   .filter(item => item.Amount !== "" && item.Factor !== undefined) // Remove invalid entries
    //   .map(item => ({
    //     ...item
    //   }));
    // }

    console.log("Sanitized Data:", sanitizedVariant);

    setDoc(doc(firestore, domain[1], "TransactionData", monthYear.month + "-" + monthYear.year, module), {
      [branch]: {
        data: sanitizedVariant,
        status: "Submitted",
        updatedAt: new Date(),
        updatedBy: userData?.userId,
        // dataType: that.custom ? "Custom" : "Variant"
      }

    }, { merge: true })
      .then(() => {
        setDoc(doc(firestore, domain[1], "TransactionData", monthYear.month + "-" + monthYear.year, "Statistics"), {
          [branch]: {
            [checkKey(module)]: arrayUnion(module)
            // dataType: that.custom ? "Custom" : "Variant"
          }

        }, { merge: true })
          .then(() => {
            setShowModal(true);
            setModalText("Data saved Successfully")

          })
          .catch((error) => {
            setShowModal(true);
            setModalText("Error writing document: " + error)

          });

        setDoc(doc(firestore, domain[1], "AnalyticsData", "Reporting Data", module + "-" + monthYear.year), {
          [monthYear.month]: {
            [branch]: totalEmissions,

            // dataType: that.custom ? "Custom" : "Variant"
          },
          type: module,
          year: monthYear.year,

        }, { merge: true })
          .then(() => {
            console.log("Data saved successfully for analytics")

          })
          .catch((error) => {
            console.log("Data saved unsuccessfully for analytics", error)

          });

      })
      .catch((error) => {
        setShowModal(true);
        setModalText("Error writing document: " + error)

      });

    var overviewObj = {
      [module]: fullEmissions,

    }
    if (module == "Owned Vehicles" && scopeWiseEmission) {
      overviewObj["Owned Vehicles ScopeWise"] = scopeWiseEmission
    }
    if (module == "Waste Disposal") {
      var disposalMethodsObj = {}
      var disposalActivityObj = {}
      Object.entries(totalEmissions.Activity).map((type) => {

        Object.keys(type[1]).map((emission) => {
          if (!disposalActivityObj[type[0]]) {
            disposalActivityObj[type[0]] = type[1][emission];
          }
          else {
            disposalActivityObj[type[0]] += type[1][emission];
          }
          if (!disposalMethodsObj[emission]) {
            disposalMethodsObj[emission] = type[1][emission];
          }
          else {
            disposalMethodsObj[emission] += type[1][emission];
          }
        })
      })

      overviewObj['Waste Method'] = disposalMethodsObj
      overviewObj['Waste Activity'] = disposalActivityObj

    }
    if (module == "Business travel - land and sea") {
      var land = 0;
      var sea = 0;

      Object.keys(totalEmissions.Vehicles).map((vehicleType) => {
        if (vehicleType == "Ferry") {
          sea += totalEmissions.Vehicles[vehicleType];
        }
        else {
          land += totalEmissions.Vehicles[vehicleType]
        }
      })

      overviewObj["land"] = land;
      overviewObj["sea"] = sea;
    }

    setDoc(doc(firestore, domain[1], "AnalyticsData", "Reporting Data", checkKey(module) + "-Overview-" + monthYear.year), {
      [monthYear.month]: {
        [branch]: overviewObj

        // dataType: that.custom ? "Custom" : "Variant"
      },
      type: checkKey(module) + "-Overview",
      year: monthYear.year,

    }, { merge: true })
      .then(() => {
        console.log("Data saved successfully for analytics")

      })
      .catch((error) => {
        console.log("Data saved unsuccessfully for analytics", error)

      });

  }
  const saveDraft = async () => {
    console.log("selected", selectedVariant);
    console.log("temp", tempSelectedVariant);
    if (!branch) {
      setShowModal(true);
      setModalText("Kindly Select Branch")
      return;
    }
    if (dataStatus == 'Submitted') {
      setShowModal(true);
      setModalText("You cannot submit data for this branch as it is already submitted")
      return;
    }
    var domain = userData?.username.split("@");
    var monthYear = master?.currentReportingCycle;
    // var flag = fetchedVariant[officeType]

    await getDoc(doc(firestore, domain[1], "Master Data"))
      .then(async (docSnapshot) => {
        if (docSnapshot.data()) {
          console.log(docSnapshot.data());
          setMaster(docSnapshot.data());
          monthYear = docSnapshot.data().currentReportingCycle;
        }
      })
    const docRef = doc(
      firestore,
      domain[1],
      "TransactionData",
      `${monthYear?.month}-${monthYear?.year}`,
      module
    );
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists() && docSnapshot.data()) {
      const tableData = docSnapshot.data();
      setDataStatus(tableData[branch]?.status);
      if (tableData[branch]?.status == 'Submitted') {
        setShowModal(true);
        setModalText("You cannot submit data for this branch as it is already submitted")
        return;
      }
    }

    ignoreFields();
    let sanitizedData = sanitizeObject(selectedVariant);
    setDoc(doc(firestore, domain[1], "TransactionData", monthYear.month + "-" + monthYear.year, module), {
      [branch]: {
        data: sanitizedData,
        status: "Draft",
        updatedAt: new Date(),
        updatedBy: userData?.userId,
        // dataType: that.custom ? "Custom" : "Variant"
      }

    }, { merge: true })
      .then(() => {
        setShowModal(true);
        setModalText("Data successfully saved as draft!")
      })
      .catch((error) => {
        setShowModal(true);
        setModalText("Error writing document: " + error)

      });
  }


  const sanitizeObject = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject); // Recursively handle arrays
    } else if (typeof obj === "object" && obj !== null) {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, value === undefined ? null : sanitizeObject(value)])
      );
    }
    return obj; // Return the value as is if not an object/array
  };

  // Apply sanitization to selectedVariant



  const downloadTableAsExcel = () => {
    if (!selectedVariant.length) return;

    // Get the table columns
    const columns = getColumns(module).map(col => col.title);

    // Format the data to include only visible columns
    const formattedData = selectedVariant.map(ticket => {
      let formattedRow = {};
      columns.forEach(col => {
        formattedRow[col] = ticket[col] || "--"; // Default empty values to "--"
      });
      return formattedRow;
    });

    // Create worksheet with formatted data
    const worksheet = XLSX.utils.json_to_sheet(formattedData, { header: columns });

    // Apply styling (optional) - adjusting column widths
    const colWidths = columns.map(() => ({ wch: 20 })); // Adjust column width to 20 characters
    worksheet["!cols"] = colWidths;

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Table Data");

    // Trigger download
    XLSX.writeFile(workbook, `${module} Report for ${branch}.xlsx`);
  };


  const handleUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const binaryStr = e.target.result;

        // Parse the uploaded Excel file
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];

        // Convert worksheet to JSON
        const data = XLSX.utils.sheet_to_json(worksheet);
        const headerData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const headerDataRow = headerData[0];
        var headerColumn = getColumns(module)?.map(item => item.title);
        if (headerColumn && headerDataRow) {

          const isExactMatch = JSON.stringify(headerDataRow) === JSON.stringify(headerColumn);
          if (isExactMatch) {
            // Set the data to your table
            console.log("func is running", data)
            setSelectedVariant([...data]);
            setTempSelectedVariant([...data]);
          }
          else {
            setShowModal(true);
            setModalText('The file you uploaded is not compatible. Kindly download the correct template and upload again.');
          }
        }
        else {
          setShowModal(true);
          setModalText('The file you uploaded is not compatible. Kindly download the correct template and upload again.');
        }


      };
      reader.readAsBinaryString(file);
    }
  };

  const filterForColumns = {
    "Fuel": ["Type", "Fuel", "Unit"],
    "Bioenergy": ["Type", "Fuel", "Unit"],
    "Refrigerant and other": ["Type", "Fuel", "Unit"],
    "Elec heat cooling": ["Activity", "Country-Type", "Unit"],
    "Owned Vehicles": ["Scope", "Level 1", "Level 2", "Level 3", "Fuel", "Unit"],
    "Materials": ["Activity", "Waste type", "Unit"],
    "WTT- fuels": ["Type", "Fuel", "Unit"],
    "Waste Disposal": ["Activity", "Waste Material", "Unit", "Disposal Method"],
    "Flight": ["Origin (city or IATA code)", "Destination (city or IATA code)", "Direct / Indirect", "Class", "Single way / return"],
    "Accommodation": ["Country"],
    "Business travel - land and sea": ["Vehicle", "Type", "Fuel", "Unit"],
    "Freighting goods": ["Vehicle", "Type", "Fuel", "Unit"],
    "Employees commuting": ["Vehicle", "Type", "Fuel", "Unit"],
    "Food": ["Meal Type", "Unit"],
    "Home Office": [],
    "Water": ["Type", "Unit"],
    "Employment": ["Employment Type", "Category", "Gender", "Age"],
    "Leave": ["Type of Leave"],
    "Retention": ["Employee Type", "Gender", "Tenure", "Age"],
    "OH and S": ["Injury Type", "Gender"],
    "Training and Edu": ["Types of training", "Segment"],
    "Child Labor": ["Risk Level"],
    "Customer Privacy": ["Nature of Complaints"],
    "Mktg and Labelling": ["Incident"],
    "CHS": ["Type of Incident"],
    "Social Benefits": ["Domain"],
    "Entity": ["Entity Type", "Gender", "Age", "Tenure"],
    "Eco. Performance": ["Data"],
    "Market Presence": ["Data"]
  };


  const handleFilter = () => {
    var container = document.getElementById("filterContainer");
    var filters = Array.from(container.children);

    // Check if all filters are set to "All"
    const allFiltersAreAll = filters.every(val => val.value === "All");

    if (allFiltersAreAll) {
      setTempSelectedVariant([...selectedVariant]); // Reset to original data
      setTempIndexMap(new Map(selectedVariant.map((_, index) => [index, index]))); // Reset index map
      return;
    }

    let filteredData = [];
    let indexMap = new Map(); // Store the index mapping

    selectedVariant.forEach((item, originalIndex) => {
      let flag = true;

      for (const val of container.children) {
        if (val.value !== "All" && item[val.dataset.title] !== val.value) {
          flag = false;
          break;
        }
      }

      if (flag) {
        indexMap.set(filteredData.length, originalIndex); // Store (filteredIndex -> originalIndex)
        filteredData.push(item);
      }
    });

    setTempSelectedVariant(filteredData);
    setTempIndexMap(indexMap);
  };

  const handleRatioUpdate = () => {
    console.log(selectedVariant)
  }

  const handleInputChange = (index, columnTitle, value) => {
    // if(module=="Market Presence" && index>4){
    //   handleRatioUpdate();
    // }
    setVariantData(prevData =>
      prevData.map((item, i) =>
        i === index ? { ...item, [columnTitle]: value } : item
      )
    );
  };
  console.log("Branches", typeof (branch), branch)
  return (
    <div className="px-5">
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-10">
          <div
            onClick={() => setTab("recorded")}
            className={` cursor-pointer border-b-[3px] ${tab === "recorded" ? "border-[#29C472] text-[#29C472]" : "text-black border-[#718EBF]"
              }`}
          >
            Records
          </div>
          <div
            onClick={() => setTab("variant")}
            className={` cursor-pointer border-b-[3px] ${tab === "variant" ? "border-[#29C472] text-[#29C472]" : "text-black border-[#718EBF]"
              }`}
          >
            Variants
          </div>
          {!(master?.currentReportingCycle?.status) && (userData?.role == "Admin") &&
            <div
              onClick={() => setTab("create")}
              className={` cursor-pointer border-b-[3px] ${tab === "create" ? "border-[#29C472] text-[#29C472]" : "text-[#718EBF] border-[#718EBF]"
                }`}
            >
              Create Variants
            </div>}
        </div>
        <div className="flex items-center justify-end gap-5 rounded-lg">
          {tempSelectedVariant &&
            <div className="flex items-center justify-end gap-5 rounded-lg">
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer bg-gradient-to-r from-[#3d9f86] to-[#29C472] text-white px-3 py-2 rounded-lg ">
                  <span className="mx-auto">Upload Excel</span>
                  <input
                    type="file"
                    accept=".xls, .xlsx"
                    className="hidden"
                    onChange={(event) => handleUpload(event)}
                  />
                </label>
              </div>

              <button
                className="flex items-center bg-gradient-to-r from-[#3d9f86] to-[#29C472] text-white px-3 py-2 rounded-lg "
                onClick={() => downloadTableAsExcel()}
              >
                Download Excel
              </button>
            </div>
          }
          {(tab == 'recorded' && master?.currentReportingCycle?.status) ?
            <div className="flex gap-5">
              <div onClick={() => saveDraft()} className="border-2 rounded-xl px-3 py-2 cursor-pointer">
                Save as Draft
              </div>
              <div onClick={() => {
                saveRecord()
                setDataStatus("Submitted")
              }} className="border rounded-lg px-10 text-white bg-gradient-to-r from-[#3d9f86] to-[#29C472] py-2 cursor-pointer">
                Save
              </div>
            </div>
            :
            <>
              {(tab === 'variant' && userData?.role == 'Admin') ? (
                <div
                  onClick={() => deleteVariant()}
                  className="border rounded-lg px-10 text-white bg-gradient-to-r from-[#901616] to-[#fb6060] py-2 cursor-pointer"
                >
                  Delete
                </div>
              ) : tab === 'create' ? (

                <div className="flex gap-4 mt-4">
                  <div
                    onClick={() => onSaveVariant()}
                    className="border rounded-lg px-10 text-white bg-gradient-to-r from-[#3d9f86] to-[#29C472] py-2 cursor-pointer"
                  >
                    Save
                  </div>

                  <div
                    onClick={() => {
                      selectedIndexes.current = [];
                      document.querySelectorAll(".table-checkbox").forEach((checkbox) => {
                        checkbox.checked = false;
                      });
                    }}
                    className="border rounded-lg px-10 text-white bg-gradient-to-r from-[#d9534f] to-[#c9302c]
 py-2 cursor-pointer"
                  >
                    Clear
                  </div>
                </div>


              ) : (
                <div></div>
              )}

            </>
          }
        </div>
      </div>

      {tab != "create" ?
        <>
          {tab == 'recorded' &&

            <>
              <div className={`flex ${module === 'Owned Vehicles' ? 'flex-col justify-start items-start' : 'flex-row justify-between items-center'}`}
              >
                <div className="w-32">
                  {userData?.branches && userData?.branches.length > 0 &&
                    <select
                      placeholder="All"
                      className={`p-3 min-w-[200px] rounded-xl mt-2`}
                      // value={branch}
                      id="branchSelect"
                      onChange={(e) => {
                        const selectedBranch = JSON.parse(e.target.value);
                        console.log("Selected Branch:", selectedBranch);
                        setBranch(selectedBranch.branch);
                        branchChange(e.target.value);
                      }}
                    >
                      <option value={"Select branch"} disabled>Select Branch</option>
                      {userData?.branches?.map((branch, index) => (
                        <option key={index} value={JSON.stringify(branch)}>
                          {branch.branch + ` [${branch.officeType}]`}
                        </option>
                      ))}
                    </select>

                  }

                </div>

                <div className=" flex gap-2" id="filterContainer">
                  {Object.keys(filterList).map((item, index) => (
                    <select
                      key={index}
                      data-title={item}
                      placeholder="All"
                      className={` p-3 w-[100px] rounded-xl mt-2`}
                      onChange={() => handleFilter()}
                    >

                      <option selected>
                        All
                      </option>
                      {filterList[item].map((val, idx) => (
                        <option key={idx} value={val}>
                          {val}
                        </option>
                      ))}
                    </select>
                  ))}
                </div>

              </div>




              {(module == "Flight" || module == "Accommodation" || module == "Child Labor") &&
                <div className=" flex items-center justify-between mt-3 px-3">
                  <div className="font-semibold text-xl text-[#343C6A]">Editable Table</div>
                  <div className="flex gap-3">
                    <div onClick={() => addRow()} className="hover:text-[#343C6A] flex gap-2 items-center border-2 border-black hover:border-[#343C6A] rounded-lg px-2 py-1 cursor-pointer font-semibold">
                      <FaPlus />
                      Add row
                    </div>
                    <div onClick={() => deleteRow()} className="hover:text-[#343C6A] flex gap-2 items-center border-2 border-black hover:border-[#343C6A] rounded-lg px-2 py-1 cursor-pointer font-semibold">
                      <FaMinus />
                      Delete selected rows
                    </div>
                  </div>
                </div>
              }

            </>
          }
          {tab == 'variant' &&
            <div className={`flex flex-col w-60 `}>
              {formattedOfficeTypes && formattedOfficeTypes.length > 0 &&
                <select
                  placeholder="All"
                  className={` p-3 min-w-[200px] rounded-xl mt-2`}
                  value={variantOffice}
                  id="officeSelect"
                  onChange={(e) => {
                    setVariantOffice(e.target.value)
                    if (fetchedVariant) {
                      setSelectedVariant(fetchedVariant[e.target.value])
                      setTempSelectedVariant(fetchedVariant[e.target.value])
                    }
                    else {
                      createTable()
                    }
                    // e.target.style.width='auto'
                  }}
                >
                  <option value={""} selected disabled>Select Office</option>
                  {formattedOfficeTypes?.map((offices, index) => (
                    <option key={index} value={offices.officeType}>
                      {offices.officeType}
                    </option>
                  ))}
                </select>
              }

            </div>
          }
          {dataStatus === "Submitted" &&
            <div className=" bg-gradient-to-r from-[#3d9f86] to-[#29C472] text-white font-semibold p-2 mt-3 mx-auto w-28 text-center rounded-t-lg mb-[-1.25rem]">
              Submitted
            </div>}
          <div className="rounded-[1rem] flex justify-center mt-5 pb-3 px-5 border-2 border-[#f26c35] bg-white shadow-lg overflow-y-auto">

            {loading ? (
              // Show the spinner while loading
              <div className="flex justify-center items-center py-10">
                <Spinner />
              </div>
            ) : (
              // Show the table once data is loaded
              <>

                <table className="w-full border-collapse rounded-[1rem]">
                  <thead>
                    <tr className="text-left text-md rounded-lg border-b">
                      <th></th>
                      {getColumns(module)?.map((column, index) => (
                        <th
                          key={index}
                          className={`py-2 px-3 text-left font-medium max-w-[100%] w-[${100 / getColumn().length}%]`}
                        >

                          {column.title == "T&D Factors" ?
                            (<div className="flex gap-2 items-center">
                              <span>{column.title}</span>
                              <div className="group flex mt-2 cursor-pointer gap-2">
                                <FaExclamationCircle size={12} />
                                <div className="hidden group-hover:block z-40 absolute w-40 p-2 bg-black opacity-70 text-white rounded-lg whitespace-pre-wrap">
                                  Emission associated with grid losses (energy loss that occurs in getting the electricity from the power plant to your organization)
                                </div>
                              </div>
                            </div>
                            ) : (
                              column.title == "Count" ? "Head Count" : column.title == "Country-Type" ? "Type" : column.title
                            )}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {tempSelectedVariant?.map((ticket, index) => (
                      <tr key={index} className="text-gray-700 text-sm border-b">
                        <td>
                          {(tab !== "recorded" || module == "Flight" || module == "Accommodation" || module == "Child Labor") && (
                            <input
                              type="checkbox"
                              checked={tab !== "recorded" ? false : ticket.checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  selectedIndexes2.current.push(index);
                                } else {
                                  const itemIndex = selectedIndexes2.current.indexOf(index);
                                  if (itemIndex !== -1) {
                                    selectedIndexes2.current.splice(itemIndex, 1);
                                  }
                                }
                              }}
                            />
                          )}
                        </td>
                        {getColumns(module)?.map((column, columnIndex) => (
                          <td
                            key={columnIndex}
                            className="py-3 px-3"
                            style={{ width: `${100 / getColumns(module).length}%` }}
                          >
                            {column.editable ? (
                              column.type === "dropdown" ? (
                                <select
                                  className="border bg-[#eceded] py-2 px-5 rounded-xl text-[#718EBF] w-full"
                                  disabled={tab === "variant"}
                                  value={tab === "recorded" ? ticket[column.title] : ""}
                                  onChange={(e) => {
                                    const updatedValue = e.target.value;
                                    console.log(tempIndexMap.get(index));

                                    // Update selectedVariant safely
                                    const updatedVariant = [...selectedVariant];
                                    updatedVariant[tempIndexMap.get(index) || index] = {
                                      ...updatedVariant[tempIndexMap.get(index) || index],
                                      [column.title]: updatedValue,
                                    };
                                    setSelectedVariant(updatedVariant);

                                    // Update tempSelectedVariant
                                    const updatedTempVariant = tempSelectedVariant.map((item) =>
                                      item === ticket ? { ...item, [column.title]: updatedValue } : item
                                    );
                                    setTempSelectedVariant(updatedTempVariant);
                                  }}
                                >
                                  <option value="" disabled>
                                    Select {column.title}
                                  </option>
                                  <option value="Low">
                                    Low
                                  </option>
                                  <option value="Moderate">
                                    Moderate
                                  </option>
                                  <option value="High">
                                    High
                                  </option>
                                  <option value="Uncertain">
                                    Uncertain
                                  </option>

                                </select>
                              ) : (
                                <input
                                  placeholder={column.title}
                                  className="border bg-[#eceded] py-2 px-5 rounded-xl text-[#718EBF] w-full"
                                  type={column.type === "Number" ? "number" : "text"}
                                  // disabled={tab === "variant"}
                                  disabled={tab === "variant" || (module == "Market Presence" && (ticket.Data == "Ratio of entry level wage to local minimum wage for Male" || ticket.Data == "Ratio of entry level wage to local minimum wage for Female"))}
                                  min={0}
                                  value={tab === "recorded" ? ticket[column.title] : ""}
                                  onWheel={(e) => e.target.blur()}
                                  onChange={(e) => {
                                    const updatedValue = e.target.value;
                                    console.log(tempIndexMap.get(index));

                                    // Update selectedVariant safely
                                    const updatedVariant = [...selectedVariant];
                                    updatedVariant[tempIndexMap.get(index) || index] = {
                                      ...updatedVariant[tempIndexMap.get(index) || index],
                                      [column.title]: updatedValue,
                                    };

                                    if (module == "Market Presence" && index < 4) {

                                      if (updatedVariant[0].Values != '' && updatedVariant[2].Values != '') {
                                        updatedVariant[4].Values = (parseInt(updatedVariant[0].Values) / parseInt(updatedVariant[2].Values)).toFixed(2)
                                      }
                                      if (updatedVariant[1].Values != '' && updatedVariant[3].Values != '') {
                                        updatedVariant[5].Values = (parseInt(updatedVariant[1].Values) / parseInt(updatedVariant[3].Values)).toFixed(2)
                                      }
                                    }
                                    setSelectedVariant(updatedVariant);

                                    // Update tempSelectedVariant
                                    const updatedTempVariant = tempSelectedVariant.map((item) =>
                                      item === ticket ? { ...item, [column.title]: updatedValue } : item
                                    );
                                    // if(module=="Market Presence" && index<4){

                                    //   if(updatedVariant[0].Values!='' &&updatedVariant[2].Values!=''){
                                    //     updatedTempVariant[4].Values= (parseInt(updatedVariant[0].Values)/parseInt(updatedVariant[2].Values))
                                    //   }
                                    //   if(updatedVariant[1].Values!='' &&updatedVariant[3].Values!=''){
                                    //     updatedTempVariant[5].Values= (parseInt(updatedVariant[1].Values)/parseInt(updatedVariant[3].Values))
                                    //   }
                                    // }
                                    setTempSelectedVariant(updatedTempVariant);
                                  }}
                                />
                              )
                            ) : (
                              tooltipData[ticket[column.title]] ? (
                                <div className="flex gap-2 items-center">
                                  <span>{ticket[column.title]}</span>
                                  <div className="group flex mt-2 cursor-pointer gap-2">
                                    <FaExclamationCircle size={12} />
                                    <div className="hidden group-hover:block z-40 absolute w-56 p-2 bg-black opacity-70 text-white rounded-lg whitespace-pre-wrap">
                                      {tooltipData[ticket[column.title]]}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                ticket[column.title] == "Total Revenue" ? "Net Worth" : ticket[column.title] || "--"
                              )
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>

        </>
        :
        <div>
          <div className={`flex flex-col w-52 `}>
            {formattedOfficeTypes && formattedOfficeTypes.length > 0 &&
              <select
                placeholder="All"
                className={`text-[#718EBF] p-3 min-w-[200px] rounded-xl mt-2`}
                value={office}
                onChange={(e) => {
                  setOffice(e.target.value)
                  // e.target.style.width='auto'
                }}
              >
                <option value={""} selected disabled>Select Office</option>
                {formattedOfficeTypes?.map((offices, index) => (
                  <option key={index} value={offices.officeType}>
                    {offices.officeType}
                  </option>
                ))}
              </select>
            }
          </div>
          {(module == "Flight" || module == "Accommodation" || module == "Child Labor") &&
            <div className=" flex items-center justify-between mt-3 px-3">
              <div className="font-semibold text-xl text-[#343C6A]">Editable Table</div>
              <div className="flex gap-3">
                <div onClick={() => addRow('create')} className="hover:text-[#343C6A] flex gap-2 items-center border-2 border-black hover:border-[#343C6A] rounded-lg px-2 py-1 cursor-pointer font-semibold">
                  <FaPlus />
                  Add row
                </div>
                <div onClick={() => deleteRow('create')} className="hover:text-[#343C6A] flex gap-2 items-center border-2 border-black hover:border-[#343C6A] rounded-lg px-2 py-1 cursor-pointer font-semibold">
                  <FaMinus />
                  Delete selected rows
                </div>
              </div>
            </div>
          }


          <table className="w-full border-collapse rounded-[1rem]">
            <thead>
              <tr className="text-left text-[#718EBF] text-md rounded-lg border-b">
                <th></th>
                {getColumns(module).map((column, index) => (
                  <th
                    key={index}
                    className={`py-2 px-3 text-left font-medium max-w-[100%] w-[${100 / getColumns(module).length}%]`}
                  >
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {variantData.map((ticket, index) => (
                <tr key={index} className="text-gray-700 text-sm border-b">
                  <td >
                    <input type='checkbox' className='table-checkbox' onChange={(e) => {
                      e.target.checked ? selectedIndexes.current.push(index) : selectedIndexes.current.splice(selectedIndexes.current.indexOf(index), 1)
                    }}></input>
                  </td>
                  {getColumns(module).map((column, columnIndex) => (

                    <td
                      key={columnIndex}
                      className="py-3 px-3"
                      style={{ width: `${100 / getColumns(module).length}%` }} // Ensure row width matches header
                    >
                      {column.editable ? (
                        <input
                          placeholder={column.title}
                          className="border bg-[#eceded] py-2 px-5 rounded-xl text-[#718EBF] w-full"
                          type={column.type === "Number" ? "number" : "text"}

                          min={0}
                          value={ticket[column.title]}
                          onChange={(e) =>
                            handleInputChange(index, column.title, e.target.value)
                          }
                        />
                      ) : (
                        ticket[column.title] || "--"
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      }

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 flex flex-col items-center justify-center">

            <div className="mb-5 flex gap-5 jusify-center items-center">
              <img src={modalIcon} alt="modal Icon" className="h-10" />
              {/* <SiTicktick size={32} color={"#29C472"}/> */}
              {modalText}
            </div>


            <button onClick={() => { setShowModal(false) }} className="px-3 py-2 rounded-lg mx-auto bg-gradient-to-r from-[#3d9f86] to-[#29C472] text-white">
              Ok
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default Fuels;

