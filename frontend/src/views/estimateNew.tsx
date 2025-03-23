// import { Grid, Title } from "@mantine/core";
import { Accordion, ActionIcon, Avatar, Center, Checkbox, Indicator, List, LoadingOverlay, Modal, MultiSelect, NumberInput, Paper, SegmentedControl, Select, Stack, Textarea, Tooltip } from "@mantine/core";
import DropZoneExcel from "../components/fileDropZone";
import {
    Badge,
    Box,
    Button,
    Card,
    Divider,
    Flex,
    Grid,
    Group,
    MdLensBlur,
    MdOutlineArrowForward,
    MdPin,
    MdOutlineFileDownload,
    ScrollArea,
    SimpleGrid,
    Space,
    Text,
    TextInput,
    Title,
    useState,
    MdPictureAsPdf,
    ThemeIcon,
    MdOutlineTimeline,
    MdOutlineMiscellaneousServices,
    Progress,
    axios,
    showNotification,
    Table,
    useEffect,
    useForm,
    XLSX,
    useAtom,
} from "../constants/GlobalImports";
import { AreaChart } from "@mantine/charts";
import '../App.css';
import { IconChartArcs3, IconCheck, IconChecklist, IconChevronDown, IconChevronUp, IconCircleCheck, IconClipboard, IconClipboardCheck, IconClock, IconClockCheck, IconClockCode, IconClockDown, IconClockHour4, IconClockShare, IconClockUp, IconDeselect, IconDownload, IconError404, IconFile, IconFileCheck, IconFileDownload, IconHourglass, IconListCheck, IconListDetails, IconLoader, IconMessage, IconMessage2Plus, IconMinimize, IconPercentage, IconPercentage66, IconPin, IconPlane, IconPlaneTilt, IconPlus, IconRecycle, IconReport, IconRowRemove, IconSettingsDollar, IconShadow, IconSquareCheck, IconStatusChange, IconTrash, IconX } from "@tabler/icons-react";
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import { useApi } from "../api/services/estimateSrvice";
import { baseUrl, getEstimateReport_Url } from "../api/apiUrls";
import RFQUploadDropZoneExcel from "../components/rfqUploadDropzone";
import robotGif from "../../public/7efs.gif";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import CsvDownloadButton from "react-json-to-csv";
import { showAppNotification } from "../components/showNotificationGlobally";
import SkillRequirementAnalytics from "./skillReqAnalytics";
import { useApiSkillAnalysis } from "../api/services/skillsService";
import { useMemo, useRef } from "react";
import { userName } from "../components/tokenJotai";
import excelTemplateFile from '../assets/RFQ_Excel_Template.xlsx';  
import estimateData from '../../src/assets/IHV_output.json';

dayjs.extend(utc);
dayjs.extend(timezone);

export default function EstimateNew() {
    const { postEstimateReport, updateRemarkByEstID, validateTasks, RFQFileUpload, getAllEstimatesStatus, getEstimateByID, downloadEstimatePdf, getProbabilityWiseDetails } = useApi();
    const { getAllDataExpertInsights } = useApi();
    const { getSkillAnalysis } = useApiSkillAnalysis();
    const [currentUser] = useAtom(userName);
    const [value, setValue] = useState('estimate');
    const [opened, setOpened] = useState(false);
    const [probOpened, setProbOpened] = useState(false);
    const [remarksOpened, setRemarksOpened] = useState(false);
    const [selectedFileTasksOpened, setSelectedFileTasksOpened] = useState(false);
    const [selectedEstimateId, setSelectedEstimateId] = useState<any>();
    const [selectedDownloadEstimateId, setSelectedDownloadEstimateId] = useState<any>();
    const [selectedEstimateIdReport, setSelectedEstimateIdReport] = useState<any>();
    const [selectedEstimateIdProbability, setSelectedEstimateIdProbability] = useState<any>();
    const [selectedEstimateRemarks, setSelectedEstimateIdRemarks] = useState<any>();
    const [selectedEstRemarksData, setSelectedEstRemarksData] = useState<any[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [extractedTasks, setExtractedTasks] = useState<string[]>([]);
    const [sheetInfo, setSheetInfo] = useState<{ sheetName: string, columnName: string } | undefined>(undefined);
    const [rfqSubmissionResponse, setRfqSubmissionResponse] = useState<any>(null);
    const [rfqSubModalOpened, setRfqSubModalOpened] = useState(false);
    const [estimatesStatusData, setEstimatesStatusData] = useState<any[]>([]);
    const [selectedEstimateTasks, setSelectedEstimateTasks] = useState<string[]>([]);
    const [estimateReportData, setEstReportData] = useState<any>(null);
    const [estimateReportloading, setEstimateReportLoading] = useState(false); // Add loading state
    const [validatedTasks, setValidatedTasks] = useState<any[]>([]);
    const [validatedSkillsTasks, setValidatedSkillsTasks] = useState<any[]>([]);
    const [isValidating, setIsValidating] = useState(false);
    const [isValidating2, setIsValidating2] = useState(false);
    const [probabilityWiseData, setProbabilityWiseData] = useState<any>(null);
    const [isProbWiseLoading, setIsProbLoading] = useState(false);
    const [skillAnalysisData, setSkillAnalysisData] = useState<any>(null);
    const [expertInsightsData, setExpertInsightsData] = useState<any>();
    const [expertInsightsTasks, setExpertInsightsTasks] = useState<any[]>([]);
    const [selectedExpertInsightsTaskIDs, setSelectedExpertInsightTaskIDs] = useState<any[]>([]);
    const [selectedExpertInsightTasks, setSelectedExpertInsightTasks] = useState<any[]>([]);
    const aircraftRegNoRef = useRef<HTMLInputElement | null>(null);
    const [additionalTasks, setAdditionalTasks] = useState<any>([]);
    // const [tasks, setTasks] = useState<string[]>([]);
    // const [estimateId, setEstimateId] = useState<string>("");
    const [generatedEstimateId, setGeneratedEstimateId] = useState<string>("");
    const [loading, setLoading] = useState(false); // Add loading state
    // const [validatedTasks, setValidatedTasks] = useState<any[]>([]);
    // const [isLoading, setIsLoading] = useState(false);
    console.log("selected remarks >>>>", selectedEstRemarksData);


    // const fetchEstimatesStatus = async () => {
    //     setLoading(true);
    //     const data = await getAllEstimatesStatus();
    //     if (data) {
    //         setEstimatesStatusData(data?.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    //     }
    //     setLoading(false);
    // };
    const fetchEstimatesStatus = async () => {
        setLoading(true);
        const data = await getAllEstimatesStatus();
        if (data) {
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 5);

            const filteredData = data.filter((item: any) => new Date(item.createdAt) >= threeDaysAgo);
            const sortedData = filteredData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setEstimatesStatusData(sortedData);

            // setEstimatesStatusData(data?.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
        setLoading(false);
    };
    useEffect(() => {
        fetchEstimatesStatus();
        const intervalId = setInterval(fetchEstimatesStatus, 15000);
        return () => clearInterval(intervalId);
    }, []);

    console.log("all estimates status>>>", estimatesStatusData);
    console.log("selected estimate tasks >>>>", selectedEstimateTasks);

    useEffect(() => {
        fetchExpertInsights();
    }, []);

    const fetchExpertInsights = async () => {
        try {
            const data = await getAllDataExpertInsights();
            if (data && data.length > 0) {
                const insightData = data[0];
                setExpertInsightsData(insightData);
                // setId(insightData._id);
                // setProbability(insightData.defaultProbability);
                // setThresholds(insightData.thresholds || {
                //   tatThreshold: 12.0,
                //   manHoursThreshold: 5.0
                // });
                setExpertInsightsTasks(insightData.miscLaborTasks);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    console.log("expert insight data >>>>", expertInsightsData);

    console.log("expert insight tasks >>>>", expertInsightsTasks);

    const handleExpertInsightsChange = (selectedIDs: string[]) => {
        setSelectedExpertInsightTaskIDs(selectedIDs);

        // Store selected full objects
        const selectedObjects = expertInsightsTasks?.filter(task => selectedIDs?.includes(task.taskID));
        setSelectedExpertInsightTasks(selectedObjects);
    };

    console.log("selected expert insights tasks ids >>>>", selectedExpertInsightsTaskIDs);
    console.log("selected expert insights tasks obj >>>>", selectedExpertInsightTasks);

    // Handle file and extracted tasks
    const handleFileChange = async (
        file: File | null,
        tasks: string[],
        fileSheetInfo?: { sheetName: string, columnName: string }
    ) => {
        setIsValidating(true);
        setSelectedFile(file);
        setExtractedTasks(tasks ?? []); // Ensure tasks is always an array
        setSheetInfo(fileSheetInfo);
        
        console.log("✅ Selected File:", file ? file.name : "None");
        console.log("📌 Extracted Tasks:", tasks.length > 0 ? tasks : "No tasks found");
        console.log("From sheet:", fileSheetInfo?.sheetName);
        console.log("From column:", fileSheetInfo?.columnName);
        
        if (tasks.length > 0) {
        const response = await validateTasks(tasks);
        setValidatedTasks(response);
            
        const invalidTasks = response.filter((task) => task.status === false);
        if (invalidTasks.length > 0) {
            showNotification({
            title: "Tasks Not Available!",
            message: `${invalidTasks.length} tasks are not available. Only valid tasks will be used for Skill Analysis.`,
            color: "orange",
            style: { position: "fixed", top: 100, right: 20, zIndex: 1000 },
            });
        }
        } else {
        setValidatedTasks([]);
        }
        
        setIsValidating(false);
    };


    // 🟢 Function to validate tasks & update UI
    const handleValidateTasks = async (tasks: string[]) => {
        setIsValidating(true);
        const response = await validateTasks(tasks);

        if (response.length > 0) {
            setValidatedTasks(response);
            setValidatedSkillsTasks(response);
        }
        setIsValidating(false);
    };

    const handleValidateSkillsTasks = async (tasks: string[]) => {
        setIsValidating2(true);
        const response = await validateTasks(tasks);

        if (response.length > 0) {
            setValidatedSkillsTasks(response);
        }
        setIsValidating2(false);
    }

    const downloadCSV = (status: boolean) => {
        const filteredTasks = validatedTasks?.filter((task) => task?.status === status);
        const csvHeaders = ["Estimate ID", "Tasks", "Status"];
        const csvData = filteredTasks?.map((task) => [
            selectedEstimateId,  // Include the selectedEstimateId for each task
            task?.taskid || 0,
            task?.status ? "Available" : "Not Available",
        ]);

        // Convert array to CSV format
        const csvContent =
            "data:text/csv;charset=utf-8," +
            [csvHeaders, ...csvData].map((e) => e.join(",")).join("\n");

        // Create a download link and trigger click
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Estimate_${selectedEstimateId}_${status ? 'Available' : 'NotAvailable'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadExcel = (status: boolean) => {
        const filteredTasks = validatedTasks?.filter((task) => task?.status === status);

        // Prepare data with selectedEstimateId
        const excelData = filteredTasks?.map((task) => ({
            "Estimate ID": selectedEstimateId,
            "Tasks": task?.taskid || 0,
            "Status": task?.status ? "Available" : "Not Available",
        }));

        // Create a worksheet and book
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Tasks");

        // Download the Excel file
        XLSX.writeFile(wb, `Estimate_${selectedEstimateId}_${status ? 'Available' : 'NotAvailable'}.xlsx`);
    };


    // Form initialization
    const form = useForm({
        initialValues: {
            tasks: [],
            probability: 0,
            operator: "",
            aircraftRegNo: "",
            aircraftModel:"",
            aircraftAge: "",
            aircraftFlightHours: "",
            aircraftFlightCycles: "",
            areaOfOperations: '',
            cappingDetails: {
                cappingTypeManhrs: "",
                cappingManhrs: 0,
                cappingTypeSpareCost: "",
                cappingSpareCost: 0,
            },
            taskID: '',
            taskDescription: '',
            typeOfCheck: '',
            miscLaborTasks: [],
            additionalTasks: []
        },

        validate: {
            operator: (value) => (value.trim() ? null : "Operator is required"),
            aircraftRegNo: (value) => (value.trim() ? null : "Aircraft Registration Number is required"),
            typeOfCheck: (value) => value.trim() ? null : "Type of Check is required",
            aircraftModel: (value) => value.trim() ? null : "Aircraft Model is required",
        },
    });

    // Handle Submit
    const handleSubmit = async () => {

        const validationErrors = form.validate();

        if (validationErrors.hasErrors) {
            if (validationErrors.errors.typeOfCheck) {
                showAppNotification("warning", "Validation Error", "Please select a Type of Check");
            }
            if (validationErrors.errors.operator) {
                showAppNotification("warning", "Validation Error", "Operator is required");
            }
            if (validationErrors.errors.aircraftModel) {
                showAppNotification("warning", "Validation Error", "Aircraft Model is required");
            }
            if (validationErrors.errors.aircraftRegNo) {
                showAppNotification("warning", "Validation Error", "Aircraft Registration Number is required");
                if (aircraftRegNoRef.current) {
                    aircraftRegNoRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
                    aircraftRegNoRef.current.focus(); // Focus on the input field
                }
            }
            return;
        }

        // Check if aircraft reg no is N/A and type of check is empty
        if (form.values.aircraftRegNo.trim().toLowerCase() === "n/a" && !form.values.typeOfCheck.trim()) {
            showAppNotification("warning", "Validation Error", "When Aircraft Registration Number is N/A, Type of Check is mandatory");
            return;
        }
        // Check if type of check is N/A and aircraft reg no is empty
        // if (form.values.typeOfCheck.trim().toLowerCase() === "n/a" && !form.values.aircraftRegNo.trim()) {
        //     showAppNotification("warning", "Validation Error", "When Type of Check is N/A, Aircraft Registration Number is mandatory");
        //     return;
        // }

        // if (form.values.aircraftRegNo.toLocaleLowerCase() === "n/a" && form.values.operator.toLowerCase() === "n/a") {
        //     showAppNotification("warning", "Both are N/A", "Reg Num or Operator Any of one is Mandatory");
        // }

        if (!selectedFile) {
            showAppNotification("warning", "Error", "Please Select File");
            return;
        }
        const validTasks = validatedTasks?.filter((task) => task?.status === true)?.map((task) => task?.taskid);

        // Ensure at least one empty additional task if none are added
        const defaultAdditionalTasks = additionalTasks.length > 0 ? additionalTasks : [{ taskID: "", taskDescription: "" }];

        // Ensure at least one empty misc labor task if none exist
        const defaultMiscLaborTasks = selectedExpertInsightTasks.length > 0
            ? selectedExpertInsightTasks
            : [{ taskID: "", taskDescription: "", manHours: 0, skill: "", spareParts: [{ partID: "", quantity: 0 }] }];


        const requestData = {
            tasks: validTasks || [],
            probability: (Number(form.values.probability)) || 0,
            operator: form.values.operator || "",
            aircraftRegNo: form.values.aircraftRegNo || "",
            aircraftModel: form.values.aircraftModel || "",
            aircraftAge: Number(form.values.aircraftAge) || 0,
            aircraftFlightHours: Number(form.values.aircraftFlightHours) || 0,
            aircraftFlightCycles: Number(form.values.aircraftFlightCycles) || 0,
            areaOfOperations: form.values.areaOfOperations || "N/A", // Ensure it's not empty
            cappingDetails: {
                cappingTypeManhrs: form.values.cappingDetails.cappingTypeManhrs || 'N/A',
                cappingManhrs: form.values.cappingDetails.cappingManhrs || 0,
                cappingTypeSpareCost: form.values.cappingDetails.cappingTypeSpareCost || 'N/A',
                cappingSpareCost: form.values.cappingDetails.cappingSpareCost || 0,
            },
            additionalTasks: defaultAdditionalTasks,
            typeOfCheck: form.values.typeOfCheck || "N/A", // Ensure it's not empty
            miscLaborTasks: defaultMiscLaborTasks
        };


        console.log("Submitting data:", requestData);

        try {
            setLoading(true);
            const response = await RFQFileUpload(requestData, selectedFile);
            console.log("RFQ API Response:", response);

            if (response) {
                setRfqSubmissionResponse(response);
                setRfqSubModalOpened(true);
                showAppNotification("success", "Success!", "Estimate report submitted successfully!");
                 // Reset form fields after successful submission
                form.reset();
                // Reset related state variables
                setSelectedFile(null); // Reset the selected file
                setValidatedTasks([]); // Reset validated tasks
                setAdditionalTasks([]); // Reset additional tasks
                setSelectedExpertInsightTasks([]); // Reset expert insight tasks
            }
        } catch (error) {
            console.error("API Error:", error);
            showAppNotification("error", "Error!", "Failed to submit estimate report.!");
            showNotification({
                title: "Error",
                message: "Failed to submit estimate report.",
                color: "red",
            });
        } finally {
            setLoading(false);
        }

    };

    console.log("rfq sub >>> ", rfqSubmissionResponse);

    const handleSubmitSkills = async () => {
        const validTasks = validatedSkillsTasks?.filter((task) => task?.status === true)?.map((task) => task?.taskid);

        if (validTasks.length === 0) {
            // showAppNotification("warning", "Warning!", "No valid tasks available to estimate the report.");
            return null; // Return null to indicate no response
        }

        const requestData = {
            source_tasks: validTasks,
        };

        console.log("Submitting data:", requestData);

        try {
            setLoading(true);
            const response = await getSkillAnalysis(requestData);
            console.log("API Response:", response);

            // if (response) {
            setSkillAnalysisData(response);
            // showAppNotification("success", "Success!", "Successfully Generated Skill Analysis");
            return response; // Return the response
            // }
        } catch (error) {
            // showAppNotification("error", "Error!", "Failed Generating Skill Analysis, try again");
            console.error("API Error:", error);
        } finally {
            setLoading(false);
        }
        return null; // Return null if no response
    };

    useEffect(() => {
        handleSubmitSkills()
    }, [validatedSkillsTasks]);

    console.log("skillAnalysisData", skillAnalysisData);


    // const handleBothSubmissions = async () => {
    //     try {
    //         setLoading(true);
    //         await handleSubmit(); // Call the first function
    //         await handleSubmitSkills(); // Call the second function
    //     } catch (error) {
    //         console.error("Error during submission:", error);
    //         showNotification({
    //             title: "Error",
    //             message: "An error occurred during submission.",
    //             color: "red",
    //         });
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    const handleCloseModal = () => {
        setRfqSubModalOpened(false);
        setSelectedFile(null); // Clear selected file
        setExtractedTasks([]); // Clear extracted tasks
        form.reset();
        fetchEstimatesStatus();
    };

    // Api Call by est id
    // const fetchEstimateById = async (id: string) => {
    //     if (!id) return;
    //     setEstimateReportLoading(true);
    //     const data = await getEstimateByID(id);
    //     if (data) {
    //         setEstReportData(data);
    //     }
    //     setEstimateReportLoading(false);
    // };

    // Load data from local JSON file based on ID
    const fetchEstimateById = (id: string) => {
        // if (!id) return;
        
        setEstimateReportLoading(true);
        
        try {
            // Find the matching estimate in your local JSON file
            // const matchingEstimate = estimateData.find((estimate: any) => estimate.estID === id);
            
            // if (matchingEstimate) {
                setEstReportData(estimateData);
            // } else {
            //     console.error(`Estimate with ID ${id} not found in local data`);
                // setEstReportData(null);
            // }
        } catch (error) {
            console.error("Error loading estimate data:", error);
            setEstReportData(null);
        } finally {
            setEstimateReportLoading(false);
        }
    };

    // Call API when `selectedEstimateId` changes
    useEffect(() => {
        if (selectedEstimateIdReport) {
            fetchEstimateById(selectedEstimateIdReport);
        }
    }, [selectedEstimateIdReport]);
    console.log("estimate report >>>>", estimateReportData);

    const fetchProbabilityWisedata = async (id: string) => {
        if (!id) return;
        setIsProbLoading(true);
        const data = await getProbabilityWiseDetails(id);
        if (data) {
            setProbabilityWiseData(data);
        }
        setIsProbLoading(false);
    };

    // Call API when `selectedEstimateId` changes
    useEffect(() => {
        if (selectedEstimateIdProbability) {
            fetchProbabilityWisedata(selectedEstimateIdProbability);
        }
    }, [selectedEstimateIdProbability]);
    console.log("probabilityWiseData  >>>>", probabilityWiseData);

    // Transform data for the chart
    const transformedData = probabilityWiseData?.estProb?.map((item: any) => ({
        prob: item?.prob , // Multiply by 100 and round
        totalManhrs: item?.totalManhrs,
        totalSpareCost: item?.totalSpareCost,
    }));


    const [downloading, setDownloading] = useState(false);

    const handleDownload = (id: any) => {
        downloadEstimatePdf(id);
    }

    const probabilityData = {
        "estId": "1234",
        "probData": [
            {
                prob: 0,
                totalManHrs: 500,
                totalSparesCost: 3000
            },
            {
                prob: 0.1,
                totalManHrs: 490,
                totalSparesCost: 2900
            },
            {
                prob: 0.2,
                totalManHrs: 450,
                totalSparesCost: 2800
            },
            {
                prob: 0.3,
                totalManHrs: 430,
                totalSparesCost: 2700
            },
            {
                prob: 0.4,
                totalManHrs: 410,
                totalSparesCost: 2600
            },
            {
                prob: 0.5,
                totalManHrs: 390,
                totalSparesCost: 2500
            },
            {
                prob: 0.6,
                totalManHrs: 370,
                totalSparesCost: 2400
            },
            {
                prob: 0.7,
                totalManHrs: 350,
                totalSparesCost: 2300
            },
            {
                prob: 0.8,
                totalManHrs: 320,
                totalSparesCost: 2200
            },
            {
                prob: 0.9,
                totalManHrs: 310,
                totalSparesCost: 2100
            },
            {
                prob: 1.0,
                totalManHrs: 300,
                totalSparesCost: 2000
            },
        ]
    }

    const handleAddAdditionalTask = () => {
        setAdditionalTasks([...additionalTasks, { taskID: '', taskDescription: '' }]);
    };

    const handleDeleteAdditionalTask = (index: any) => {
        const newTasks = additionalTasks.filter((_: any, i: any) => i !== index);
        setAdditionalTasks(newTasks);
    };

    const handleTaskChange = (index: any, field: any, value: any) => {
        const newTasks = additionalTasks.map((task: any, i: any) => (i === index ? { ...task, [field]: value } : task));
        setAdditionalTasks(newTasks);
    };

    console.log("additional tasks >>>>", additionalTasks);
    // const handleSubmit = async () => {
    //     // const validTasks = validatedTasks?.filter((task) => task?.status === true)?.map((task) => task?.taskid);

    //     if (!form.isValid()) {
    //         form.validate();
    //         return;
    //     }

    //     if (extractedTasks?.length === 0) {
    //         showNotification({
    //             title: "Error",
    //             message: "Tasks are required",
    //             color: "red",
    //             style: { position: "fixed", top: 20, right: 20, zIndex: 1000 },
    //         });
    //         return;
    //     }

    //     const requestData = {
    //         tasks: extractedTasks,
    //         probability: Number(form.values.probability),
    //         operator: form.values.operator,
    //         aircraftAge: Number(form.values.aircraftAge),
    //         aircraftFlightHours: Number(form.values.aircraftFlightHours),
    //         aircraftFlightCycles: Number(form.values.aircraftFlightCycles),
    //     };

    //     console.log("Submitting data:", requestData);

    //     try {
    //         setLoading(true);
    //         const response = await postEstimateReport(requestData);
    //         console.log("API Response:", response);

    //         if (response) {
    //             setEstReportData(response);
    //             setEstimateId(response?.estID);
    //             showNotification({
    //                 title: "Success",
    //                 message: "Estimate report submitted successfully!",
    //                 color: "green",
    //             });
    //         }
    //     } catch (error) {
    //         showNotification({
    //             title: "Submission Failed",
    //             message: "An error occurred while submitting the estimate report.",
    //             color: "red",
    //         });
    //         console.error("API Error:", error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // useEffect(() => {
    //     console.log("Updated UI response:", estimateReportData);
    // }, [estimateReportData]);
    // console.log("response UI >>>>", estimateReportData);
    const [expanded, setExpanded] = useState(false);
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [showFields, setShowFields] = useState<string[]>([]);

    const toggleFieldSelection = (field: string) => {
        setSelectedFields((prev) =>
            prev.includes(field)
                ? prev.filter((f) => f !== field)
                : [...prev, field]
        );
    };
    const fields = [
        { label: "Select Probability", name: "probability", component: <NumberInput size="xs" min={0} max={100} step={1} {...form.getInputProps("probability")} /> },
        { label: "Aircraft Age", name: "aircraftAge", component: <TextInput size="xs" placeholder="Ex:50" {...form.getInputProps("aircraftAge")} /> },
        // { label: "Operator", name: "operator", component: <TextInput size="xs" placeholder="Indigo, AirIndia" {...form.getInputProps("operator")} /> },
        // { label: "Aircraft Reg No", name: "aircraftRegNo", component: <TextInput size="xs" placeholder="Ex:N734AB, SP-LR" {...form.getInputProps("aircraftRegNo")} /> },
        // { label: "Check Type", name: "typeOfCheck", component: <Select size="xs" data={['EOL', 'C CHECK', 'NON C CHECK', '18Y CHECK', '12Y CHECK', '6Y CHECK']} {...form.getInputProps("typeOfCheck")} /> },
        { label: "Flight Cycles", name: "aircraftFlightCycles", component: <TextInput size="xs" placeholder="Ex:50" {...form.getInputProps("aircraftFlightCycles")} /> },
        { label: "Flight Hours", name: "aircraftFlightHours", component: <TextInput size="xs" placeholder="Ex:50" {...form.getInputProps("aircraftFlightHours")} /> },
        { label: "Area of Operations", name: "areaOfOperations", component: <TextInput size="xs" placeholder="Ex: Area" {...form.getInputProps("areaOfOperations")} /> },
        {
            label: "Expert Insights", name: "expertInsights", component: (
                <MultiSelect
                    size="xs"
                    // label="Expert Insights"
                    placeholder="Select from Insights"
                    data={expertInsightsTasks?.map(task => ({ value: task.taskID, label: task.taskID }))}
                    value={selectedExpertInsightsTaskIDs}
                    onChange={handleExpertInsightsChange}
                    style={(theme) => ({
                        // Customize the selected badge styles
                        selected: {
                            backgroundColor: theme.colors.green[6], // Change this to your desired color
                            color: theme.white, // Change text color if needed
                        },
                    })}
                />
            )
        },
        // { label: "Man Hrs Capping Type", name: "cappingTypeManhrs", component: <Select data={['Type - 1', 'Type - 2', 'Type - 3']} {...form.getInputProps("cappingDetails.cappingTypeManhrs")} /> },
        // { label: "Man Hours", name: "cappingManhrs", component: <TextInput placeholder="Ex: 40" {...form.getInputProps("cappingDetails.cappingManhrs")} /> },
        // { label: "Spares Capping Type", name: "cappingTypeSpareCost", component: <Select data={['Type - 1', 'Type - 2', 'Type - 3']} {...form.getInputProps("cappingDetails.cappingTypeSpareCost")} /> },
        // { label: "Cost ($)", name: "cappingSpareCost", component: <TextInput placeholder="Ex: 600$" {...form.getInputProps("cappingDetails.cappingSpareCost")} /> },
        { label: "Capping Man Hrs", name: "cappingManhrs" },
        { label: "Capping Spares", name: "cappingSpares" },
    ];


    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Sort remarks from oldest to newest (ensures scrolling from bottom)
    const sortedRemarks = [...selectedEstRemarksData]?.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    useEffect(() => {
        if (remarksOpened && scrollAreaRef.current) {
            const scrollElement = scrollAreaRef.current;
            scrollElement.scrollTop = scrollElement.scrollHeight; // Scroll to the bottom
        }
    }, [remarksOpened, sortedRemarks.length]); // Update on new messages


    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);

        // Convert to IST by adding 5 hours 30 minutes
        date.setHours(date.getHours() + 5);
        date.setMinutes(date.getMinutes() + 30);

        return date.toLocaleString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true, // Ensures AM/PM format
            timeZone: "Asia/Kolkata" // Ensures IST format
        });
    };

    // Format date

    const scrollAreaRefRemark = useRef<HTMLDivElement | null>(null);
    const scrollViewportRefRemark = useRef<HTMLDivElement | null>(null);
    const contentRefRemark = useRef<HTMLDivElement | null>(null);

    // Add this effect to scroll to bottom when remarks change
    useEffect(() => {
        if (scrollViewportRefRemark.current) {
            // Scroll to bottom of the chat
            scrollViewportRefRemark.current.scrollTo({
                top: scrollViewportRefRemark.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [selectedEstRemarksData]); // Dependency on remarks data
    const [newRemark, setNewRemark] = useState('');
    const handleRemark = async () => {
        if (!newRemark.trim()) {
            showNotification({
                title: "Error",
                message: "Remark cannot be empty",
                color: "red",
            });
            return;
        }

        const data = { remark: newRemark };
        const result = await updateRemarkByEstID(selectedEstimateRemarks, data);
        console.log("result", result);
        if (result) {
            // Create a new remark object similar to what your API would return
            const user = currentUser; // Replace with actual current user name or ID
            const newRemarkObj = {
                remark: newRemark,
                updatedBy: user,
                createdAt: new Date() // Current timestamp
            };
            setSelectedEstRemarksData(prevRemarks => [...prevRemarks, newRemarkObj]);
            setNewRemark('');
            fetchEstimatesStatus();
        }
    };


    // const downloadEmptyExcel = () => {
    //     const filename = 'Example_RFQ.xlsx'
    //     const headers = [
    //         'Task Id',
    //         'Description'
    //     ]
    //     // Create a new workbook
    //     const workbook = XLSX.utils.book_new();
        
    //     // Create an empty worksheet with just the headers
    //     // We create an array with one empty row (just the headers)
    //     const worksheetData = [headers];
        
    //     // Convert the data to a worksheet
    //     const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        
    //     // Add the worksheet to the workbook
    //     XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        
    //     // Write the workbook to a binary string
    //     const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        
    //     // Create a Blob from the buffer
    //     const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
    //     // Create a download link and trigger the download
    //     const url = URL.createObjectURL(blob);
    //     const link = document.createElement('a');
    //     link.href = url;
    //     link.download = filename;
    //     document.body.appendChild(link);
    //     link.click();
        
    //     // Clean up
    //     document.body.removeChild(link);
    //     URL.revokeObjectURL(url);
    //   };

      const downloadEmptyExcel = async () => {
        try {
          // Fetch the file from your project assets
          const response = await fetch(excelTemplateFile);
          
          if (!response.ok) {
            throw new Error('Failed to load the template file');
          }
          
          // Get the file as blob
          const blob = await response.blob();
          
          // Create a URL for the blob
          const url = window.URL.createObjectURL(blob);
          
          // Create a temporary anchor element to trigger the download
          const a = document.createElement('a');
          a.href = url;
          a.download = 'RFQ_Template.xlsx'; // Name that will appear when downloading
          document.body.appendChild(a);
          
          // Trigger the download
          a.click();
          
          // Clean up
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          // Show success notification
          showAppNotification(
            'success',
            'Successful!',
            'RFQ template downloaded successfully',
          );
        } catch (error) {
          console.error('Error downloading the template:', error);
          
          // Show error notification
          showAppNotification(
            'error',
            'Failed!',
            'Failed to download the template file',
          );
        }
      };
    

    return (
        <>
            {/* Estimate success Modal */}
            <Modal
                opened={rfqSubModalOpened}
                onClose={() => {
                    //   setRfqSubModalOpened(false);
                    //   form.reset();
                }}
                size={600}
                title={`Estimate Created !`}
                radius="lg"
                padding="xl"
                centered
                withCloseButton={false}
                closeOnClickOutside={false}
                styles={{
                    // content: { backgroundColor: "#e8f5e9" }, // Light green shade
                    // header: { backgroundColor: "#e0f2f1" }, // Slightly different green for header
                    // content: { backgroundColor: "#d4e1fc" },
                    header: { backgroundColor: "#d4e1fc" },
                }}
            >
                {rfqSubmissionResponse && (

                    <div>
                        <Group justify="center">
                            <Avatar h={150} w={150} src={robotGif} />
                        </Group>

                        <Group justify="center">

                            <Group justify="center">
                                <Badge
                                    variant="light"
                                    color="cyan"
                                    size="lg"
                                    radius="md"
                                    className="px-6 py-3"
                                >
                                    <Group gap="xs">
                                        <IconCheck size={16} />
                                        <Text>{rfqSubmissionResponse?.status}</Text>
                                    </Group>
                                </Badge>
                            </Group>
                            <Text size="sm" fw={600}>

                            </Text>
                        </Group>
                        <Space h='sm' />

                        <Group justify="center">
                            <Text size="sm" fw={500} ta="center" className="text-gray-700">
                                {rfqSubmissionResponse?.msg}
                            </Text>
                        </Group>
                        <Space h='sm' />

                        <Box>
                            <Divider my="sm" />
                            <Group justify="center" gap="xs">
                                <Text size="sm" c="dimmed">
                                    Estimate ID:
                                </Text>
                                <Text fw={600} c="green">
                                    {rfqSubmissionResponse?.estID || "-"}
                                </Text>
                            </Group>
                        </Box>
                        <Space h='lg' />
                        <Group justify="center">
                            <Button onClick={handleCloseModal} size="sm" variant="filled" color="indigo">Close</Button>
                        </Group>

                    </div>
                )}
            </Modal>
            {/* Tasks for Estimate Id */}
            <Modal
                opened={opened}
                onClose={() => {
                    setOpened(false);
                    //   form.reset();
                }}
                size={600}
                title={
                    <>
                        <Group justify="space-between">
                            <Group>
                                <Badge variant="filled" color="teal" radius='sm' size="lg">{selectedEstimateTasks?.length}</Badge>
                                <Text c='gray' fw={600}>
                                    Tasks for :
                                </Text>
                                <Text fw={600}>
                                    {selectedEstimateId}
                                </Text>
                            </Group>


                            <Group>
                                <Tooltip label="Download Available Tasks">
                                    <Button
                                        size="xs"
                                        color="green"
                                        variant="light"
                                        rightSection={<IconDownload size='18' />}
                                        onClick={() => downloadCSV(true)}
                                    >
                                        {validatedTasks?.filter((ele) => ele?.status === true)?.length}
                                    </Button>
                                    {/* <ActionIcon size={25} color="green" variant="light" onClick={() => downloadCSV(true)}>
                                        <IconDownload />
                                    </ActionIcon> */}
                                </Tooltip>

                                {/* Button for Not Available Tasks */}
                                <Tooltip label="Download Not Available Tasks">
                                    <Button
                                        size="xs"
                                        color="blue"
                                        variant="light"
                                        rightSection={<IconDownload size='18' />}
                                        onClick={() => downloadCSV(false)}
                                    >
                                        {validatedTasks?.filter((ele) => ele?.status === false)?.length}
                                    </Button>
                                    {/* <ActionIcon size={25} color="blue" variant="light" onClick={() => downloadCSV(false)}>
                                        <IconDownload />
                                    </ActionIcon> */}
                                </Tooltip>
                            </Group>

                        </Group>
                        <Space h='sm' />
                    </>
                }
                scrollAreaComponent={ScrollArea.Autosize}
            >

                {
                    isValidating ? (
                        <LoadingOverlay
                            visible={isValidating}
                            zIndex={1000}
                            overlayProps={{ radius: 'sm', blur: 2 }}
                            loaderProps={{ color: 'indigo', type: 'bars' }}
                        />) : (
                        <SimpleGrid cols={4}>
                            {validatedTasks?.map((task, index) => {
                                const badgeColor = task?.status ? "green" : "blue"; // Blue for true, Orange for false
                                return task?.taskid?.length > 12 ? (
                                    <Tooltip key={index} label={task?.taskid} withArrow position="top">
                                        <Badge
                                            fullWidth
                                            key={index}
                                            color={badgeColor}
                                            variant="light"
                                            radius='sm'
                                            style={{ margin: "0.25em" }}
                                        >
                                            {task?.taskid}
                                        </Badge>
                                    </Tooltip>
                                ) : (
                                    <Badge
                                        fullWidth
                                        key={index}
                                        color={badgeColor}
                                        variant="light"
                                        radius='sm'
                                        style={{ margin: "0.25em" }}
                                    >
                                        {task?.taskid}
                                    </Badge>
                                )
                            })}
                        </SimpleGrid>
                    )
                }




            </Modal>
            {/* Probabiity wise data for estimate id */}
            <Modal
                opened={probOpened}
                onClose={() => {
                    setProbOpened(false);
                    //   form.reset();
                }}
                size={800}
                title={
                    <>
                        <Group>
                            <Title order={4} c='dimmed'>
                                Probability wise Details
                            </Title>
                            <Title order={4} >
                                {selectedEstimateIdProbability}
                            </Title>
                        </Group>

                    </>
                }
            >
                {
                    isProbWiseLoading && (
                        <LoadingOverlay
                            visible={isProbWiseLoading}
                            zIndex={1000}
                            overlayProps={{ radius: 'sm', blur: 2 }}
                            loaderProps={{ color: 'indigo', type: 'bars' }}
                        />
                    )
                }

                <Group p={10}>
                    <AreaChart
                        h={350}
                        //   data={probabilityData?.probData || []}
                        data={transformedData || []}
                        dataKey="prob"
                        withLegend
                        withTooltip
                        xAxisLabel="Probability (%)"
                        yAxisLabel="Value"
                        series={[
                            { name: 'totalManhrs', color: 'green.6' },
                            { name: 'totalSpareCost', color: 'blue.6' },
                        ]}
                        curveType="linear"
                    />
                </Group>

            </Modal>
            {/* Tasks for slected rfq file */}
            <Modal
                opened={selectedFileTasksOpened}
                onClose={() => {
                    setSelectedFileTasksOpened(false);
                    //   form.reset();
                }}
                size={800}
                title={
                    <>
                        <Group justify="space-between">
                            <Group>
                                <Badge variant="filled" color="teal" radius='sm' size="lg">{validatedTasks?.length}</Badge>
                                <Text c='gray' fw={600}>
                                    Tasks for :
                                </Text>
                                <Text fw={600}>
                                    {selectedEstimateId}
                                </Text>
                            </Group>


                            <Group>
                                <Tooltip label="Download Available Tasks">
                                    <Button
                                        size="xs"
                                        color="green"
                                        variant="light"
                                        rightSection={<IconDownload size='18' />}
                                        onClick={() => downloadCSV(true)}
                                    >
                                        {validatedTasks?.filter((ele) => ele?.status === true)?.length}
                                    </Button>
                                    {/* <ActionIcon size={25} color="green" variant="light" onClick={() => downloadCSV(true)}>
                                        <IconDownload />
                                    </ActionIcon> */}
                                </Tooltip>

                                {/* Button for Not Available Tasks */}
                                <Tooltip label="Download Not Available Tasks">
                                    <Button
                                        size="xs"
                                        color="blue"
                                        variant="light"
                                        rightSection={<IconDownload size='18' />}
                                        onClick={() => downloadCSV(false)}
                                    >
                                        {validatedTasks?.filter((ele) => ele?.status === false)?.length}

                                    </Button>
                                    {/* <ActionIcon size={25} color="blue" variant="light" onClick={() => downloadCSV(false)}>
                                        <IconDownload />
                                    </ActionIcon> */}
                                </Tooltip>
                            </Group>

                        </Group>
                        <Space h='sm' />
                        {sheetInfo && (
          <Group gap="xs" mb="xs">
            <Text size="sm" c="dimmed">Sheet:</Text>
            <Badge size="sm" color="black" variant="light">{sheetInfo.sheetName}</Badge>
            <Text size="sm" c="dimmed">Column:</Text>
            <Badge size="sm" color="black" variant="light">{sheetInfo.columnName}</Badge>
          </Group>
        )}
                <Group justify="space-between">
                    <Group mb='xs' align="center" >
                        <Text size="md" fw={500}>
                            Tasks Available
                        </Text>
                        {
                            validatedTasks?.length > 0 ? (
                                <Badge ta='center' color="green" size="md" radius="lg">
                                    {/* {validatedTasks?.filter((ele) => ele.status === true)?.length || 0} */}
                                    {Math.round(((validatedTasks?.filter((ele) => ele.status === true)?.length / validatedTasks?.length) * 100) || 0)} %
                                </Badge>
                            ) : (
                                <Badge variant="light" ta='center' color="green" size="md" radius="lg">
                                    0
                                </Badge>
                            )
                        }
                    </Group>
                    <Group mb='xs' align="center">
                        <Text size="md" fw={500}>
                            Tasks Not-Available
                        </Text>
                        {
                            validatedTasks?.length > 0 ? (
                                <Badge ta='center' color="blue" size="md" radius="lg">
                                    {/* {validatedTasks?.filter((ele) => ele.status === false)?.length || 0} */}
                                    {Math.round(((validatedTasks?.filter((ele) => ele.status === false)?.length / validatedTasks?.length) * 100) || 0)} %
                                </Badge>
                            ) : (
                                <Badge variant="light" ta='center' color="blue" size="md" radius="lg">
                                    0
                                </Badge>
                            )
                        }
                    </Group>
                </Group>
                    </>
                }
                scrollAreaComponent={ScrollArea.Autosize}
            >

                <LoadingOverlay
                    visible={isValidating}
                    zIndex={1000}
                    overlayProps={{ radius: 'sm', blur: 2 }}
                    loaderProps={{ color: 'indigo', type: 'bars' }}
                />

                {/* <Group justify="space-between">
                                <Group mb='xs' align="center" >
                                    <Text size="md" fw={500}>
                                        Tasks Available
                                    </Text>
                                    {
                                        extractedTasks?.length > 0 ? (
                                            <Badge ta='center' color="indigo" size="md" radius="lg">
                                                {extractedTasks?.length || 0}
                                            </Badge>
                                        ) : (
                                            <Badge variant="light" ta='center' color="indigo" size="md" radius="lg">
                                                0
                                            </Badge>
                                        )
                                    }
                                </Group>
                            </Group> */}
                            
                {/* <ScrollArea
                                style={{
                                    flex: 1, // Take remaining space for scrollable area
                                    overflow: "auto",
                                }}
                                offsetScrollbars
                                scrollHideDelay={1}
                                scrollbarSize={5}
                            > */}
                {validatedTasks?.length > 0 ? (
                    <SimpleGrid cols={5}>
                        {validatedTasks?.map((task, index) => (
                            <Badge
                                fullWidth
                                key={index}
                                color={task?.status === false ? "blue" : "green"}
                                variant="light"
                                radius='sm'
                                style={{ margin: "0.25em" }}
                            >
                                {task?.taskid}
                            </Badge>
                        ))}
                    </SimpleGrid>
                ) : (
                    <Text ta='center' size="sm" c="dimmed">
                        No tasks found. Please Select a file.
                    </Text>
                )}
                {/* </ScrollArea> */}




            </Modal>
            {/* Remarks for Estimate id */}
            <Modal
                opened={remarksOpened}
                onClose={() => {
                    setRemarksOpened(false);
                    //   form.reset();
                }}
                size={800}
                title={
                    <>
                        <Group>
                            <Group >
                                <ThemeIcon variant="white">
                                    <IconMessage />
                                </ThemeIcon>
                                <Title order={4} c='dimmed'>
                                    Remarks
                                </Title>
                            </Group>

                            <Title order={4} >
                                {selectedEstimateRemarks}
                            </Title>
                        </Group>

                    </>
                }
            >

                <Card h='50vh' withBorder bg='#f0eded' radius='lg'>
                    <ScrollArea
                        h="100%"
                        ref={scrollAreaRefRemark}
                        viewportRef={scrollViewportRefRemark}
                        scrollbarSize={0}
                        scrollHideDelay={0}

                    >
                        <Stack justify="flex-start" h="100%" gap="md">
                            {selectedEstRemarksData
                                ?.filter((remark: any, index: number) => !(index === 0 && !remark.remark.trim())) // Remove first object if empty
                                .length === 0 ? (
                                // If all remarks are removed, show "No Remarks Found"
                                <Text size="sm" c="dimmed" ta="center">
                                    No Remarks Found
                                </Text>
                            ) : (
                                selectedEstRemarksData
                                    ?.filter((remark: any, index: number) => !(index === 0 && !remark.remark.trim())) // Remove first object if empty
                                    .map((remark: any) => {
                                        const isCurrentUser = remark.updatedBy === currentUser; // Adjust as needed

                                        return (
                                            <Flex
                                                key={remark.createdAt}
                                                direction="column"
                                                align={isCurrentUser ? "flex-end" : "flex-start"}
                                            >
                                                <Paper
                                                    p="xs"
                                                    radius="md"
                                                    withBorder
                                                    bg="white"
                                                    style={{
                                                        maxWidth: "80%",
                                                        minWidth: "50%",
                                                        alignSelf: isCurrentUser ? "flex-end" : "flex-start",
                                                    }}
                                                >
                                                    <Group justify="space-between" gap="xs" mb={5}>
                                                        <Group gap="xs">
                                                            <Avatar
                                                                color={isCurrentUser ? "blue" : "cyan"}
                                                                radius="xl"
                                                                size="sm"
                                                            >
                                                                {remark.updatedBy.charAt(0)?.toUpperCase()}
                                                            </Avatar>
                                                            <Text size="sm" fw={500}>
                                                                {remark.updatedBy?.toUpperCase() || "N/A"}
                                                            </Text>
                                                        </Group>
                                                        <Text size="xs" c="dimmed">
                                                            {formatDate(remark.createdAt)}
                                                        </Text>
                                                    </Group>
                                                    <Text size="sm" ml={30}>
                                                        {remark.remark}
                                                    </Text>
                                                </Paper>
                                            </Flex>
                                        );
                                    })
                            )}
                        </Stack>


                    </ScrollArea>
                </Card>
                <Divider
                    variant="dashed"
                    labelPosition="center"
                    color={"gray"}
                    pb='sm'
                    pt='sm'
                    label={
                        <>
                            <Box ml={5}>Add Remarks</Box>
                        </>
                    }
                />

                <Textarea
                    radius='md'
                    // label="Add New Remark !"
                    //   description="Input description"
                    placeholder="Add your Remark here"
                    autosize
                    minRows={2}
                    maxRows={3}
                    value={newRemark}
                    onChange={(e) => setNewRemark(e.target.value)}
                />
                <Space h='xs' />
                <Group justify="flex-end">
                    <Button
                        size="xs"
                        variant="gradient"
                        gradient={{ from: 'blue', to: 'green', deg: 90 }}
                        onClick={handleRemark}
                    >
                        Submit
                    </Button>
                </Group>
                <Group>

                </Group>

            </Modal>


            <div style={{ padding: 60 }}>
                <Grid grow gutter="xs">
                    <Grid.Col span={4}>
                        {/* <Card withBorder
                            // className="glass-card"
                            h='20vh' radius='md'
                        // style={{
                        //     background: 'rgba(255, 255, 255, 0.1)',
                        //     backdropFilter : "blur(50px)",
                        //     boxShadow : "0 4px 30px rgba(0, 0, 0, 0.1)",
                        //     borderRadius: '8px',
                        //     padding: '16px',
                        //     display: 'flex',
                        //     flexDirection: "column",
                        // }}
                        > */}
                        {/* <Group> */}
                        {/* <Text size="md" fw={500}>
                                    Select Document
                                </Text> */}

                        {/* </Group>
                        </Card> */}
                        {/* <Space h='xs'/> */}
                        <Card withBorder h='60vh' radius='md'>
                            <Group justify="space-between">
                            <Text size="md" fw={500} >
                                    Select Document
                                </Text>

                                <Group>
                                <Tooltip label='Download RFQ Template Example'>
                                <ActionIcon
                                color="green"
                                variant="light"
                                onClick={downloadEmptyExcel}
                                >
                                    <IconFileDownload/>
                                </ActionIcon>
                                </Tooltip>
                                    {/* {
                                    selectedFile && ( */}
                                <Tooltip label={selectedFile ? "Show Tasks for Selected file" : "Select file for Tasks"}>
                                    <Button
                                        size='xs'
                                        color="#000480"
                                        radius='lg'
                                        variant="light"
                                        disabled={!selectedFile}
                                        onClick={() => {
                                            setSelectedEstimateId(selectedFile?.name);
                                            setSelectedFileTasksOpened(true);
                                        }}
                                        rightSection={<IconListCheck size={20} />}
                                    >
                                        Show Tasks
                                    </Button>
                                </Tooltip>
                                {/* )
                                } */}

                                

                                </Group>
                                

                            </Group>

                            <Space h='xs' />
                            <ScrollArea
                                style={{
                                    flex: 1, // Take remaining space for scrollable area
                                    overflow: "auto",
                                }}
                                offsetScrollbars
                                scrollHideDelay={1}
                                scrollbarSize={5}
                            >
                               <RFQUploadDropZoneExcel
                                    name="Excel or CSV file"
                                    changeHandler={handleFileChange}
                                    selectedFile={selectedFile}
                                    setSelectedFile={setSelectedFile}
                                    color="green"
                                    />
                                <Space h='sm' />
                                <Group justify="space-between" pb='sm'>
                                    <Text size="md" fw={500} >
                                        Add Tasks
                                    </Text>
                                    <Button size="xs" onClick={handleAddAdditionalTask} color="blue" variant="light" rightSection={<IconMessage2Plus size={18} />}>
                                        Add Task
                                    </Button>
                                </Group>

                                <Table withRowBorders withTableBorder withColumnBorders>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '100px', height: '100%' }}>Task ID</th> {/* Set a fixed width for Task ID */}
                                            <th style={{ width: '300px' }}>Description</th> {/* Set a wider width for Description */}
                                            {/* <th style={{ width: '120px' }}>Check Type</th> Set a fixed width for Check Type */}
                                            <th style={{ width: '50px' }}>Actions</th> {/* Set a fixed width for Actions */}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {additionalTasks?.map((task: any, index: any) => (

                                            <tr key={index}>
                                                <td style={{ alignContent: 'start' }}>
                                                    <TextInput
                                                        size="xs"
                                                        placeholder="Ex: 1234"
                                                        value={task.taskID}
                                                        onChange={(e) => handleTaskChange(index, 'taskID', e.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <Textarea
                                                        size="xs"
                                                        // w='18vw'
                                                        placeholder="Task Description"
                                                        autosize
                                                        minRows={1}
                                                        value={task.description}
                                                        onChange={(e) => handleTaskChange(index, 'taskDescription', e.target.value.replace(/\n/g, ' '))}
                                                    />
                                                </td>
                                                {/* <td>
                                                    <Select
                                                        size="xs"
                                                        // width='12vw'
                                                        placeholder="Check Type"
                                                        data={['Type 1', 'Type 2', 'Type 3']} // Replace with your check types
                                                        value={task.typeOfCheck}
                                                        onChange={(value) => handleTaskChange(index, 'typeOfCheck', value)}
                                                    />
                                                </td> */}
                                                <td>
                                                    <Center>
                                                        <ActionIcon variant="light" color="red" onClick={() => handleDeleteAdditionalTask(index)}>
                                                            <IconTrash size='20' />
                                                        </ActionIcon>
                                                    </Center>

                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>

                                {/* <SimpleGrid cols={1} spacing='xs'>
                                    <TextInput
                                        size="xs"
                                        leftSection={<IconChecklist />}
                                        placeholder="1234..."
                                        label="Task ID"
                                        {...form.getInputProps("taskID")}
                                    />
                                    <Textarea
                                        size="xs"
                                        label="Description"
                                        placeholder="Task Description"
                                        autosize
                                        minRows={4}
                                        {...form.getInputProps("taskDescription")}
                                    />
                                    <TextInput
                                        size="xs"
                                        leftSection={<IconFileCheck size='20' />}
                                        placeholder="check"
                                        label="Check Type"
                                        {...form.getInputProps("typeOfCheck")}
                                    />
                                    
                                </SimpleGrid> */}
                            </ScrollArea>
                        </Card>
                    </Grid.Col>

                    {/* <Grid.Col span={5}>
                        <Card withBorder h='60vh' radius='md'>

                            <LoadingOverlay
                                visible={isValidating}
                                zIndex={1000}
                                overlayProps={{ radius: 'sm', blur: 2 }}
                                loaderProps={{ color: 'indigo', type: 'bars' }}
                            />

                            <Group justify="space-between">
                                <Group mb='xs' align="center" >
                                    <Text size="md" fw={500}>
                                        Tasks Available
                                    </Text>
                                    {
                                        validatedTasks?.length > 0 ? (
                                            <Badge ta='center' color="green" size="md" radius="lg">
                                                {validatedTasks?.filter((ele) => ele.status === true)?.length || 0}
                                            </Badge>
                                        ) : (
                                            <Badge variant="light" ta='center' color="green" size="md" radius="lg">
                                                0
                                            </Badge>
                                        )
                                    }
                                </Group>
                                <Group mb='xs' align="center">
                                    <Text size="md" fw={500}>
                                        Tasks Not-Available
                                    </Text>
                                    {
                                        validatedTasks?.length > 0 ? (
                                            <Badge ta='center' color="blue" size="md" radius="lg">
                                                {validatedTasks?.filter((ele) => ele.status === false)?.length || 0}
                                            </Badge>
                                        ) : (
                                            <Badge variant="light" ta='center' color="blue" size="md" radius="lg">
                                                0
                                            </Badge>
                                        )
                                    }
                                </Group>
                            </Group>
                            <ScrollArea
                                style={{
                                    flex: 1, // Take remaining space for scrollable area
                                    overflow: "auto",
                                }}
                                offsetScrollbars
                                scrollHideDelay={1}
                                scrollbarSize={5}
                            >
                                {validatedTasks?.length > 0 ? (
                                    <SimpleGrid cols={4}>
                                        {validatedTasks?.map((task, index) => (
                                            <Badge
                                                key={index}
                                                color={task?.status === false ? "blue" : "green"}
                                                variant="light"
                                                radius='sm'
                                                style={{ margin: "0.25em" }}
                                            >
                                                {task?.taskid}
                                            </Badge>
                                        ))}
                                    </SimpleGrid>
                                ) : (
                                    <Text ta='center' size="sm" c="dimmed">
                                        No tasks found. Please Select a file.
                                    </Text>
                                )}
                            </ScrollArea>
                            
                        </Card>
                    </Grid.Col> */}

                    <Grid.Col span={4}>
                        <Card withBorder h="60vh" radius="md" >
                            {/* <Card bg='#dce1fc'> */}
                            <Group justify="space-between" onClick={() => setExpanded(!expanded)} style={{ cursor: "pointer" }}>
                                <Text size="md" fw={500}>
                                    RFQ Parameters
                                </Text>
                                <Group>
                                    {expanded ? <IconChevronUp color="gray" /> : <IconChevronDown color="gray" />}
                                </Group>
                            </Group>
                            {/* </Card> */}
                            

                            {expanded && (
                                <ScrollArea scrollbarSize={0} offsetScrollbars scrollHideDelay={1} style={{ height: "60vh"}}>
                                    <SimpleGrid cols={1} spacing="xs" >
                                        {fields.map((field) => (
                                            <Grid key={field.name} align="center">
                                                <Grid.Col span={8}>
                                                    <Text>{field.label}</Text>
                                                </Grid.Col>
                                                <Grid.Col span={4}>
                                                    <Checkbox
                                                        checked={selectedFields.includes(field.name)}
                                                        onChange={() => toggleFieldSelection(field.name)}
                                                    />
                                                </Grid.Col>
                                            </Grid>
                                        ))}
                                    </SimpleGrid>
                                    <Group justify="center">
                                        <Button variant="light" mt="sm" onClick={() => {
                                            setShowFields([...selectedFields]);
                                            setExpanded(false); // Collapse the accordion after showing inputs
                                        }}>
                                            Show Inputs
                                        </Button>
                                    </Group>
                                </ScrollArea>
                            )}

                            <ScrollArea style={{ flex: 1, overflow: "auto" }} offsetScrollbars scrollHideDelay={1}>
                                <Text size="md" m='sm' fw={500} >
                                    Required Parameters
                                </Text>
                                <SimpleGrid cols={2} >
                                    {/* <NumberInput
                                        size="xs"
                                        leftSection={<IconPercentage66 size={20} />}
                                        placeholder="Ex: 0.5"
                                        label="Select Probability"
                                        defaultValue={50}
                                        min={10}
                                        max={100}
                                        step={10}
                                        //   precision={2}
                                        {...form.getInputProps("probability")}
                                    /> */}
                                    <Select
                                        size="xs"
                                        // width='12vw' 
                                        searchable
                                        label='Check Type'
                                        placeholder="Check Type"
                                        data={['EOL', 'C CHECK', 'NON C CHECK', '18Y CHECK', '12Y CHECK', '6Y CHECK']}
                                        // value={task.typeOfCheck}
                                        // onChange={(value) => handleTaskChange(index, 'typeOfCheck', value)}
                                        {...form.getInputProps("typeOfCheck")}
                                    />
                                    <TextInput
                                        size="xs"
                                        leftSection={<IconPlaneTilt size='20' />}
                                        placeholder="Indigo, AirIndia"
                                        label="Operator"
                                        {...form.getInputProps("operator")}
                                    />
                                    <TextInput
                                        ref={aircraftRegNoRef}
                                        size="xs"
                                        leftSection={<IconPlaneTilt size='20' />}
                                        placeholder="Ex:N-64AB, SP-LR"
                                        label="Aircraft Reg No"
                                        {...form.getInputProps("aircraftRegNo")}
                                    />
                                    <TextInput
                                        // ref={aircraftRegNoRef}
                                        size="xs"
                                        leftSection={<IconPlaneTilt size='20' />}
                                        placeholder="Ex: A320"
                                        label="Aircraft Model"
                                        {...form.getInputProps("aircraftModel")}
                                    />

                                </SimpleGrid>
                                <Space h='xs' />
                                {
                                    showFields?.length > 0 ? (
                                        <>
                                        <Text size="md" m='sm' fw={500}>
                                    Optional Parameters
                                </Text>
                                {/* <Space h='sm'/> */}
                                </>
                                    ) : (
                                        <></>
                                    )
                                }
                                <SimpleGrid cols={1} spacing="xs">
                                    <SimpleGrid cols={2}>
                                        {showFields
                                            .filter(field => !["cappingManhrs", "cappingSpares"].includes(field)) // Exclude capping fields from the main display
                                            .map((field) => (
                                                <div key={field}>
                                                    <Text size="xs" fw={500}>
                                                        {fields.find(f => f.name === field)?.label}
                                                    </Text>
                                                    {fields.find(f => f.name === field)?.component}
                                                </div>
                                            ))}
                                    </SimpleGrid>
                                </SimpleGrid>

                                {/* Capping Fields Section */}
                                <SimpleGrid cols={1} spacing="xs" mt="sm">
                                    {selectedFields.includes("cappingManhrs") && (
                                        <Grid>
                                            <Grid.Col span={7}>
                                                <Select
                                                    size="xs"
                                                    label="Man Hrs Capping Type"
                                                    placeholder="Select Capping Type"
                                                    data={['Type - 1', 'Type - 2', 'Type - 3', 'Type - 4']}
                                                    allowDeselect
                                                    {...form.getInputProps("cappingDetails.cappingTypeManhrs")}
                                                />
                                            </Grid.Col>
                                            <Grid.Col span={5}>
                                                <TextInput
                                                    size="xs"
                                                    leftSection={<IconClockHour4 size={20} />}
                                                    placeholder="Ex: 40"
                                                    label="Man Hours"
                                                    {...form.getInputProps("cappingDetails.cappingManhrs")}
                                                />
                                            </Grid.Col>
                                        </Grid>
                                    )}

                                    {selectedFields.includes("cappingSpares") && (
                                        <Grid>
                                            <Grid.Col span={7}>
                                                <Select
                                                    size="xs"
                                                    label="Spares Capping Type"
                                                    placeholder="Select Capping Type"
                                                    data={['Type - 1', 'Type - 2', 'Type - 3', 'Type - 4']}
                                                    allowDeselect
                                                    {...form.getInputProps("cappingDetails.cappingTypeSpareCost")}
                                                />
                                            </Grid.Col>
                                            <Grid.Col span={5}>
                                                <TextInput
                                                    size="xs"
                                                    leftSection={<IconSettingsDollar size={20} />}
                                                    placeholder="Ex: 600$"
                                                    label="Cost($)"
                                                    {...form.getInputProps("cappingDetails.cappingSpareCost")}
                                                />
                                            </Grid.Col>
                                        </Grid>
                                    )}
                                </SimpleGrid>
                            </ScrollArea>
                        </Card>
                        {/* <Card withBorder h='60vh' radius='md'>
                            <Text size="md" fw={500} >
                                RFQ Parameters
                            </Text>
                            <ScrollArea
                                style={{
                                    flex: 1, // Take remaining space for scrollable area
                                    overflow: "auto",
                                }}
                                offsetScrollbars
                                scrollHideDelay={1}
                            // scrollbarSize={5}
                            >
                                <SimpleGrid cols={1} spacing='xs'>
                                    <SimpleGrid cols={2}>
                                        <NumberInput
                                            size="xs"
                                            leftSection={<IconPercentage66 size={20} />}
                                            placeholder="Ex: 0.5"
                                            label="Select Probability"
                                            defaultValue={50}
                                            min={10}
                                            max={100}
                                            step={10}
                                            //   precision={2}
                                            {...form.getInputProps("probability")}
                                        />

                                        <TextInput
                                            size="xs"
                                            leftSection={<MdPin />}
                                            placeholder="Ex:50"
                                            label="Aircraft Age"
                                            {...form.getInputProps("aircraftAge")}
                                        />
                                        <TextInput
                                            size="xs"
                                            leftSection={<IconPlaneTilt size='20' />}
                                            placeholder="Indigo, AirIndia"
                                            label="Operator"
                                            {...form.getInputProps("operator")}
                                        />
                                        <TextInput
                                            ref={aircraftRegNoRef}
                                            size="xs"
                                            leftSection={<IconPlaneTilt size='20' />}
                                            placeholder="Ex:N734AB, SP-LR"
                                            label="Aircraft Reg No"
                                            {...form.getInputProps("aircraftRegNo")}
                                        />
                                        <Select
                                            size="xs"
                                            // width='12vw' 
                                            searchable
                                            label='Check Type'
                                            placeholder="Check Type"
                                            data={['EOL', 'C CHECK', 'NON C CHECK', '18Y CHECK', '12Y CHECK', '6Y CHECK']}
                                            // value={task.typeOfCheck}
                                            // onChange={(value) => handleTaskChange(index, 'typeOfCheck', value)}
                                            {...form.getInputProps("typeOfCheck")}
                                        />
                                        <TextInput
                                            size="xs"
                                            leftSection={<IconRecycle size={20} />}
                                            placeholder="Ex:50"
                                            label="Flight Cycles"
                                            {...form.getInputProps("aircraftFlightCycles")}
                                        />
                                        <TextInput
                                            size="xs"
                                            leftSection={<IconHourglass size={20} />}
                                            placeholder="Ex:50"
                                            label="Flight Hours"
                                            {...form.getInputProps("aircraftFlightHours")}
                                        />

                                        <TextInput
                                            size="xs"
                                            leftSection={<IconShadow size={20} />}
                                            placeholder="Ex: Area"
                                            label="Area of Operations"
                                            {...form.getInputProps("areaOfOperations")}
                                        />
                                        <MultiSelect
                                            size="xs"
                                            label="Expert Insights"
                                            placeholder="Select from Insights"
                                            data={expertInsightsTasks?.map(task => ({ value: task.taskID, label: task.taskID }))}
                                            value={selectedExpertInsightsTaskIDs}
                                            onChange={handleExpertInsightsChange}
                                            style={(theme) => ({
                                                // Customize the selected badge styles
                                                selected: {
                                                    backgroundColor: theme.colors.green[6], // Change this to your desired color
                                                    color: theme.white, // Change text color if needed
                                                },
                                            })}
                                        />

                                    </SimpleGrid>


                                    <Text size="md" fw={500}>
                                        Capping
                                    </Text>

                                    <Grid>
                                        <Grid.Col span={7}>
                                            <Select
                                                size="xs"
                                                label="Man Hrs Capping Type"
                                                placeholder="Select Capping Type"
                                                data={['Type - 1', 'Type - 2', 'Type - 3', 'Type - 4']}
                                                defaultValue="React"
                                                allowDeselect
                                                {...form.getInputProps("cappingDetails.cappingTypeManhrs")}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={5}>
                                            <TextInput
                                                size="xs"
                                                leftSection={<IconClockHour4 size={20} />}
                                                placeholder="Ex: 40"
                                                label="Man Hours"
                                                {...form.getInputProps("cappingDetails.cappingManhrs")}
                                            />
                                        </Grid.Col>
                                    </Grid>

                                    <Grid>
                                        <Grid.Col span={7}>
                                            <Select
                                                size="xs"
                                                label="Spares Capping Type"
                                                placeholder="Select Capping Type"
                                                data={['Type - 1', 'Type - 2', 'Type - 3', 'Type - 4']}
                                                defaultValue="React"
                                                allowDeselect
                                                {...form.getInputProps("cappingDetails.cappingTypeSpareCost")}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={5}>
                                            <TextInput
                                                size="xs"
                                                leftSection={<IconSettingsDollar size={20} />}
                                                placeholder="Ex: 600$"
                                                label="Cost($)"
                                                {...form.getInputProps("cappingDetails.cappingSpareCost")}
                                            />
                                        </Grid.Col>
                                    </Grid>
                                </SimpleGrid>

                            </ScrollArea>
                        </Card> */}

                    </Grid.Col>
                </Grid>

                <Group justify="center" pt='sm' pb='sm'>
                    <Button
                        onClick={handleSubmit}
                        variant="gradient"
                        gradient={{ from: 'indigo', to: 'cyan', deg: 90 }}
                        // variant="filled"
                        // color='#1A237E'
                        disabled={extractedTasks?.length > 0 || additionalTasks?.length > 0 ? false : true}
                        leftSection={<MdLensBlur size={14} />}
                        rightSection={<MdOutlineArrowForward size={14} />}
                    >
                        Generate Estimate
                    </Button>
                </Group>

                <Space h='sm' />
                <Card>
                    <Group align="center" gap='sm'>
                        <ThemeIcon variant="light">
                            <IconReport />
                        </ThemeIcon>
                        <Title order={5} >
                            Estimations
                        </Title>
                    </Group>
                    <Space h='sm' />
                    <div
                        className="ag-theme-alpine"
                        style={{
                            width: "100%",
                            border: "none",
                            height: "100%",

                        }}
                    >
                        <style>
                            {`
/* Remove the borders and grid lines */
.ag-theme-alpine .ag-root-wrapper, 
.ag-theme-alpine .ag-root-wrapper-body,
.ag-theme-alpine .ag-header,
.ag-theme-alpine .ag-header-cell,
.ag-theme-alpine .ag-body-viewport {
border: none;
}

/* Remove the cell highlight (border) on cell click */
.ag-theme-alpine .ag-cell-focus {
outline: none !important; /* Remove focus border */
box-shadow: none !important; /* Remove any box shadow */
}

/* Remove row border */
.ag-theme-alpine .ag-row {
border-bottom: none;
}
`}
                        </style>

                        <AgGridReact
                            pagination
                            paginationPageSize={5}
                            domLayout="autoHeight" // Ensures height adjusts dynamically
                            rowData={estimatesStatusData || []}
                            columnDefs={[
                                {
                                    field: "createdAt",
                                    headerName: "Date",
                                    sortable: true,
                                    filter: true,
                                    floatingFilter: true,
                                    resizable: true,
                                    flex: 1,
                                    cellRenderer: (params: any) => {
                                        if (!params.value) return null; // Handle empty values

                                        // Parse the provided timestamp string to a Date object
                                        const date = new Date(params.value);

                                        // Manually add +5 hours and 30 minutes to the date for IST
                                        const istOffsetInMilliseconds = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
                                        date.setTime(date.getTime() + istOffsetInMilliseconds); // Adjust time

                                        // Format the adjusted date to the desired format
                                        const day = date.getDate().toString().padStart(2, "0");
                                        const month = date.toLocaleString("default", { month: "short" });
                                        const year = date.getFullYear();
                                        const hours = date.getHours().toString().padStart(2, "0");
                                        const minutes = date.getMinutes().toString().padStart(2, "0");
                                        const seconds = date.getSeconds().toString().padStart(2, "0");

                                        // Combine all parts into the formatted string
                                        const formattedDate = `${day}-${month}-${year}, ${hours}:${minutes}:${seconds}`;


                                        return <Text mt="xs">{formattedDate}</Text>;
                                    },
                                },
                                {
                                    field: "estID",
                                    headerName: "Estimate ID",
                                    sortable: true,
                                    filter: true,
                                    floatingFilter: true,
                                    resizable: true,
                                    flex: 2,
                                    // cellRenderer: (params: any) => (
                                    //     <Text
                                    //         mt='xs'
                                    //         style={{
                                    //             cursor: "pointer",
                                    //             color: "blue",
                                    //             textDecoration: "underline",
                                    //         }}
                                    //         onClick={() => {
                                    //             setSelectedEstimateId(params.data.estID);
                                    //             setSelectedEstimateTasks(params.data.tasks);
                                    //             handleValidateTasks(params.data.tasks);
                                    //             setOpened(true);
                                    //         }}
                                    //     >
                                    //         {params.value}
                                    //     </Text>
                                    // ),
                                },
                                {
                                    field: "aircraftRegNo",
                                    headerName: "Aircraft Reg No",
                                    sortable: true,
                                    filter: true,
                                    floatingFilter: true,
                                    resizable: true,
                                    flex: 1
                                },
                                {
                                    field: "totalMhs",
                                    headerName: "Total ManHrs (Hr)",
                                    sortable: true,
                                    // filter: true,
                                    floatingFilter: true,
                                    resizable: true,
                                    flex: 1,
                                    cellRenderer: (params: any) => (
                                        <Text mt='xs'>
                                            {Math.round(params.value)} {/* Use Math.round to round to the nearest whole number */}
                                        </Text>
                                    ),
                                },
                                {
                                    field: "totalPartsCost",
                                    headerName: "Total Cost ($)",
                                    sortable: true,
                                    // filter: true,
                                    floatingFilter: true,
                                    resizable: true,
                                    flex: 1,
                                    cellRenderer: (params: any) => (
                                        <Text
                                            mt='xs'
                                        >
                                            {Math.round(params.value)}
                                        </Text>
                                    ),
                                },
                                {
                                    field: "status",
                                    headerName: "Status",
                                    sortable: true,
                                    filter: true,
                                    floatingFilter: true,
                                    resizable: true,
                                    flex: 1.5,
                                    cellRenderer: (val: any) => {
                                        let badgeColor: string;
                                        let badgeIcon: JSX.Element;

                                        // Using switch case for status color and icon mapping
                                        switch (val.data.status.toLowerCase()) {
                                            case "completed":
                                                badgeColor = "#10b981"; // Green
                                                badgeIcon = <IconCircleCheck size={15} />; // Check circle badgeIcon
                                                break;
                                            case "progress":
                                                badgeColor = "#f59e0b"; // Amber/Orange
                                                badgeIcon = <IconLoader size={15} />; // Spinner badgeIcon (you can add CSS for the spinning effect)
                                                break;
                                            case "initiated":
                                                badgeColor = "#3b82f6"; // Light Blue
                                                badgeIcon = <IconClockUp size={15} />; // Play badgeIcon
                                                break;
                                            case "csv generated":
                                                badgeColor = "#9333ea"; // Purple
                                                badgeIcon = <IconFileCheck size={15} />; // File CSV badgeIcon
                                                break;
                                            default:
                                                badgeColor = "gray"; // Default color if status is not found
                                                badgeIcon = <IconFileCheck size={15} />; // Default badgeIcon (optional)
                                        }

                                        return (
                                            <Badge
                                                mt="xs"
                                                variant="light"
                                                fullWidth
                                                color={badgeColor}
                                                rightSection={badgeIcon}
                                            >
                                                {val.data.status}
                                            </Badge>
                                        );
                                    },
                                },
                                {
                                    // field: "actions",
                                    headerName: "Actions",
                                    // sortable: true,
                                    // filter: true,
                                    // floatingFilter: true,
                                    flex: 2,
                                    resizable: true,
                                    // editable: true,
                                    cellRenderer: (val: any) => {
                                        return (
                                            <Group mt='xs' align="center" justify="center">
                                                <Tooltip label="Show Tasks">
                                                    <ActionIcon
                                                        size={20}
                                                        color="indigo"
                                                        variant="light"
                                                        onClick={() => {
                                                            setSelectedEstimateId(val.data.estID);
                                                            setSelectedEstimateTasks(val.data.tasks);
                                                            handleValidateTasks(val.data.tasks);
                                                            setOpened(true);
                                                        }}

                                                    >
                                                        <IconListCheck />
                                                    </ActionIcon>
                                                </Tooltip>
                                                <Tooltip label="Get Estimate">
                                                    <ActionIcon
                                                        size={20}
                                                        color="teal"
                                                        variant="light"
                                                        disabled={val?.data?.status?.toLowerCase() !== "completed"}
                                                        onClick={() => {
                                                            setSelectedEstimateIdReport(val.data.estID);
                                                            handleValidateSkillsTasks(val.data.tasks);
                                                            // setOpened(true);
                                                        }}
                                                    >
                                                        <IconReport />
                                                    </ActionIcon>
                                                </Tooltip>
                                                <Tooltip label="Download Estimate">
                                                    <ActionIcon
                                                        size={20}
                                                        color="lime"
                                                        variant="light"
                                                        disabled={val?.data?.status?.toLowerCase() !== "completed"}
                                                        onClick={(values: any) => {
                                                            setSelectedDownloadEstimateId(val?.data?.estID);
                                                            handleDownload(val?.data?.estID);
                                                            // setAction("edit");
                                                            // setOpened(true);
                                                            // form.setValues(val?.data);
                                                        }}
                                                    >
                                                        <IconDownload />
                                                    </ActionIcon>
                                                </Tooltip>
                                                <Tooltip label="Probability Details">
                                                    <ActionIcon
                                                        size={20}
                                                        color="rgba(156, 104, 0, 1)"
                                                        variant="light"
                                                        disabled={val?.data?.status?.toLowerCase() !== "completed"}
                                                        onClick={(values: any) => {
                                                            setProbOpened(true);
                                                            setSelectedEstimateIdProbability(val?.data?.estID);
                                                        }}
                                                    >
                                                        <IconChartArcs3 />
                                                    </ActionIcon>
                                                </Tooltip>
                                                <Tooltip label="Remarks!">
                                                {/* <Indicator 
                                                label={val?.data?.remarks?.length || 0} 
                                                disabled={val?.data?.remarks?.length === 0} 
                                                color="red" 
                                                size={12}
                                                // withBorder
                                                inline
                                                 position="middle-end" 
                                                //  radius="xs"
                                                > */}
                                                    <ActionIcon
                                                        size={20}
                                                        color="blue"
                                                        variant="light"
                                                        disabled={val?.data?.status?.toLowerCase() !== "completed"}
                                                        onClick={(values: any) => {
                                                            setRemarksOpened(true);
                                                            setSelectedEstimateIdRemarks(val?.data?.estID);
                                                            setSelectedEstRemarksData(val?.data?.remarks);
                                                        }}
                                                    >
                                                        <IconMessage />
                                                    </ActionIcon>
                                                    {/* </Indicator> */}
                                                </Tooltip>
                                            </Group>

                                        );
                                    },
                                },
                            ]}
                        />
                    </div>

                </Card>
                <Space h='sm' />

                <SegmentedControl
                    color="indigo"
                    bg='white'
                    value={value}
                    onChange={setValue}
                    data={[
                        { label: 'Estimate', value: 'estimate' },
                        { label: 'Skill', value: 'skill' },
                    ]}
                />

                <Space h='sm' />
                {
                    estimateReportData !== null ? (
                        <Group>
                            <Title order={4} c='gray'>
                                Selected Estimate  :
                            </Title>
                            <Title order={4}>
                                {/* {estimateReportData?.estID || "-"} */}
                                {selectedEstimateIdReport || "-"}
                            </Title>
                        </Group>
                    ) : (
                        <></>
                    )
                }

                {
                    value === 'estimate' ? (
                        <>
                            {
                                estimateReportData !== null ? (
                                    <>
                                        <Divider
                                            variant="dashed"
                                            labelPosition="center"
                                            color={"gray"}
                                            pb='sm'
                                            pt='sm'
                                            label={
                                                <>
                                                    <Box ml={5}>Estimate</Box>
                                                </>
                                            }
                                        />

                                        <Group justify="space-between">
                                            {/* <Group>
                                                <Title order={4} c='gray'>
                                                    Overall Estimate Report
                                                </Title>
                                            </Group> */}

                                            {/* <Button
                                                size="xs"
                                                variant="filled"
                                                color="#1bb343"
                                                leftSection={<MdPictureAsPdf size={14} />}
                                                rightSection={<MdOutlineFileDownload size={14} />}
                                                onClick={handleDownload}
                                                loading={downloading}
                                            >
                                                {downloading ? "Downloading..." : "Download Estimate"}
                                            </Button> */}
                                        </Group>

                                        <Space h='sm' />

                                        <OverallEstimateReport
                                         totalTATTime={estimateReportData?.overallEstimateReport?.estimatedTatTime || 0}
                                            estimatedManHrs={estimateReportData?.overallEstimateReport?.estimateManhrs || {}}
                                            estimatedSparesCost={estimateReportData?.overallEstimateReport?.estimatedSpareCost || 0}
                                            cappingUnbilledCost={0}
                                            parts={
                                                estimateReportData?.overallEstimateReport?.spareParts || []
                                            //     [
                                            //       { partDesc: "Bolt", partName: "M12 Bolt", qty: 4.0, price: 10.00, unit: "" },
                                            //       { partDesc: "Screw", partName: "Wood Screw", qty: 2.0, price: 5.00, unit: "" },
                                            //     ]
                                        }
                                            spareCostData={[
                                                { date: "Min", Cost: Math.round(estimateReportData?.overallEstimateReport?.estimatedSpareCost * 0.85) },
                                                { date: "Estimated", Cost: Math.round(estimateReportData?.overallEstimateReport?.estimatedSpareCost) },
                                                { date: "Max", Cost: Math.round(estimateReportData?.overallEstimateReport?.estimatedSpareCost * 1.10) },
                                            ]}
                                            // totalTATTime={44}
                                            // estimatedManHrs={{ min: 40, estimated: 66, max: 46, capping: 46 }}
                                            // cappingUnbilledCost={44}
                                            // parts={[
                                            //     { partDesc: "Bolt", partName: "M12 Bolt", qty: 4.0, price: 10.00, unit: "" },
                                            //     { partDesc: "Screw", partName: "Wood Screw", qty: 2.0, price: 5.00, unit: "" },
                                            // ]}
                                            // estimatedSparesCost={44}
                                            // spareCostData={[
                                            //     { date: "Min", Cost: 100 },
                                            //     { date: "Estimated", Cost: 800 },
                                            //     { date: "Max", Cost: 1000 },
                                            // ]}
                                        />
                                        <Space h='xl' />

                                        {/* <FindingsWiseSection tasks={jsonData?.tasks} findings={jsonData.findings} /> */}
                                        <FindingsWiseSection tasks={estimateReportData?.tasks} findings={estimateReportData?.findings} />

                                        <Space h='md' />
                                        {/* <PreloadWiseSection tasks={jsonData?.tasks} /> */}
                                        <PreloadWiseSection tasks={estimateReportData?.tasks} />
                                    </>
                                ) : (
                                    <></>
                                )
                            }
                        </>
                    ) : (
                        <>
                            <SkillRequirementAnalytics skillAnalysisData={skillAnalysisData} />
                        </>
                    )
                }
            </div>
        </>
    )
}


// Define types for the data
interface SparePart {
    partId: any;
    desc: any;
    qty: any;
    unit: any;
    price: any;
}

interface ManHours {
    max: number;
    min: number;
    avg: number;
    est: number;
}

interface Task {
    sourceTask: string;
    desciption: string;
    mhs: ManHours;
    spareParts: any[];
}

interface FindingDetail {
    logItem?: string;
    description: string;
    probability?: number;
    prob?: number; // Alternative name based on your data
    mhs: ManHours;
    spareParts?: SparePart[];
    spare_parts?: any[]; // Alternative name based on your data
    skill: string[];
    cluster: string;
}

interface Finding {
    taskId: string;
    details: FindingDetail[];
}

interface FindingsWiseSectionProps {
    tasks: Task[];
    findings: Finding[];
}

interface Part {
    partDesc: string;
    partName: string;
    qty: number;
    price: number;
    unit: any;
}

interface ChartData {
    date: string;
    Cost: number;
}

interface TATDashboardProps {
    totalTATTime: number;
    estimatedManHrs: { min: number; estimated: number; max: number; capping: number };
    cappingUnbilledCost: number;
    parts: Part[];
    estimatedSparesCost: number;
    spareCostData: ChartData[];
}

const OverallEstimateReport: React.FC<TATDashboardProps> = ({
    totalTATTime,
    estimatedManHrs,
    cappingUnbilledCost,
    parts,
    estimatedSparesCost,
    spareCostData,
  }: any) => {
    return (
      <Box>
        <Title order={4} mb="md" fw={500} c="dimmed">Overall Estimate Report</Title>
        <Grid gutter="xs">
          {/* Left Section - Estimate Overview */}
          <Grid.Col span={3}>
            <Card withBorder radius="md" p="xs" h="100%">
              {/* <Title order={5} mb="md" fw={500} c="dimmed">Estimate Overview</Title> */}
              
              {/* Estimated Man Hours */}
              <Card withBorder radius="md" p="md" mb="md" bg="gray.0">
                <Text size="sm" fw={500} c="dimmed" mb="md">
                  Estimated Man Hours
                </Text>
                <Flex gap="md" direction="column">
                  {Object.entries(estimatedManHrs || {}).map(([key, value]: any) => {
                    // Determine color based on key
                    const color = key === "min" ? "teal.6" : 
                                  key === "max" ? "blue.6" :
                                  key === "avg" ? "teal.6" : 
                                  "green.6";
                    
                    // Format the label
                    const label = key.charAt(0).toUpperCase() + key.slice(1);
                    
                    return (
                      <Box key={key}>
                        <Group justify="apart" mb={5}>
                          <Text fz="xs" fw={500}>{label}</Text>
                          <Text fz="sm" fw={600} c={color}>
                            {typeof value === 'number' ? value.toFixed(0) : value} Hrs
                          </Text>
                        </Group>
                        <Progress 
                          color={color}
                          value={typeof value === 'number' ? Math.min(value / 100, 100) : 0} 
                          size="md"
                          radius="sm"
                        />
                      </Box>
                    );
                  })}
                </Flex>
              </Card>
  
              {/* Unbillable Cost */}
              <Card withBorder radius="md" p="xs" mb="md" bg="blue.0">
                <Group gap="md">
                  <ThemeIcon variant="light" radius="md" size={50} color="blue.6">
                    <IconSettingsDollar size={24} />
                  </ThemeIcon>
                  <Flex direction="column">
                    <Text size="sm" fw={500} c="dimmed">
                      Unbillable Cost
                    </Text>
                    <Text size="xl" fw={700} c="blue.6">
                      ${cappingUnbilledCost || 0}
                    </Text>
                  </Flex>
                </Group>
              </Card>
  
              {/* Estimated Spares Cost */}
              <Card withBorder radius="md" p="xs" bg="blue.0">
                <Group  gap="md">
                  <ThemeIcon variant="light" radius="md" size={50} color="blue.6">
                    <MdOutlineMiscellaneousServices size={24} />
                  </ThemeIcon>
                  <Flex direction="column">
                    <Text size="sm" fw={500} c="dimmed">
                      Estimated Spares Cost
                    </Text>
                    <Text size="xl" fw={700} c="blue.6">
                      ${estimatedSparesCost?.toFixed(2) || 0}
                    </Text>
                  </Flex>
                </Group>
              </Card>
            </Card>
          </Grid.Col>
  
          {/* Center Section - Parts Table (6 columns width) */}
          <Grid.Col span={6}>
            <Card withBorder radius="md" p="md" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
              <Title order={5} mb="md" fw={500} c="dimmed">Estimated Parts</Title>
              <Box style={{ flex: 1, height: '500px' }}>
                <div
                  className="ag-theme-alpine"
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <style>
                    {`
                      .ag-theme-alpine {
                        --ag-header-background-color: #f8f9fa;
                        --ag-odd-row-background-color: #ffffff;
                        --ag-even-row-background-color: #f9f9f9;
                        --ag-row-hover-color: #f1f3f5;
                        --ag-border-color: #e9ecef;
                        --ag-font-size: 13px;
                      }
                      
                      .ag-theme-alpine .ag-header-cell {
                        font-weight: 600;
                        color: #495057;
                      }
                      
                      .ag-theme-alpine .ag-row {
                        border-bottom: 1px solid var(--ag-border-color);
                      }
  
                      .ag-theme-alpine .ag-cell {
                        padding: 8px;
                      }
                    `}
                  </style>
                  <AgGridReact
                    rowData={parts || []}
                    domLayout="normal"
                    // defaultColDef={{
                    //   sortable: true,
                    //   resizable: true,
                    //   filter: true,
                    //   floatingFilter: true,

                    // }}
                    columnDefs={[
                      {
                        field: "partId",
                        headerName: "Part Number",
                        flex: 1.5,
                        minWidth: 120,
                        sortable: true,
                        resizable: true,
                        filter: true,
                        floatingFilter: true,
                      },
                      {
                        field: "desc",
                        headerName: "Description",
                        flex: 1.5,
                        minWidth: 120,
                        sortable: true,
                        resizable: true,
                        filter: true,
                        floatingFilter: true,
                      },
                      {
                        field: "qty",
                        headerName: "Qty",
                        flex: 0.8,
                        minWidth: 80,
                        filter: 'agNumberColumnFilter',
                      },
                      {
                        field: "unit",
                        headerName: "Units",
                        flex: 0.8,
                        minWidth: 80,
                      },
                      {
                        field: "price",
                        headerName: "Price ($)",
                        flex: 1,
                        minWidth: 90,
                        filter: 'agNumberColumnFilter',
                        valueFormatter: params => {
                          if (params.value === null || params.value === undefined) return '';
                          return `$${parseFloat(params.value).toFixed(2)}`;
                        },
                      },
                    ]}
                    pagination={true}
                    paginationPageSize={10}
                  />
                </div>
              </Box>
            </Card>
          </Grid.Col>
  
          {/* Right Section - Chart (3 columns width) */}
          <Grid.Col span={3}>
            <Card withBorder radius="md" p="xs" h="100%">
              <Title order={5} mb="md" fw={500} c="dimmed">Spare Cost Analysis</Title>
              
              <Card withBorder radius="md" p="md" bg="blue.0">
                {/* <Text size="sm" fw={500} c="dimmed" mb="md">
                  Spare Cost Trend
                </Text> */}
                <AreaChart
                  h={350}
                  data={spareCostData || [
                    { date: 'Min', Cost: 100 },
                    { date: 'Estimated', Cost: 750 },
                    { date: 'Max', Cost: 1000 }
                  ]}
                  dataKey="date"
                  series={[{ name: "Cost", color: "blue.9" }]}
                  curveType="monotone"
                  withGradient
                  connectNulls
                  gridAxis="y"
                  withLegend={false}
                  tooltipProps={{
                    content: ({ payload, label }) => {
                      if (payload && payload.length > 0) {
                        return (
                          <Card p="xs" withBorder>
                            <Text fw={500} size="sm">{label}</Text>
                            <Text size="sm">${payload[0].value}</Text>
                          </Card>
                        );
                      }
                      return null;
                    }
                  }}
                  yAxisProps={{
                    tickFormatter: (value) => `$${value}`,
                    domain: ['dataMin - 10', 'dataMax + 10']
                  }}
                />
              </Card>
            </Card>
          </Grid.Col>
        </Grid>
      </Box>
    );
  };
  
  

  const FindingsWiseSection: React.FC<FindingsWiseSectionProps> = ({ findings }) => {
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [selectedCluster, setSelectedCluster] = useState<any>(null);
    const [selectedFindingDetail, setSelectedFindingDetail] = useState<FindingDetail | null>(null);
    const [taskSearch, setTaskSearch] = useState<string>('');
    const [clusterSearch, setClusterSearch] = useState<string>('');
    const [tableOpened, setTableOpened] = useState(false);
    const [flattenedData, setFlattenedData] = useState([]);
    
    // Extract unique task IDs from findings
    const uniqueTaskIds = useMemo(() => {
        const taskIds = findings.map(finding => finding.taskId);
        return [...new Set(taskIds)];
    }, [findings]);

    // Filter tasks based on search
    const filteredTasks = useMemo(() => {
        if (!taskSearch.trim()) return uniqueTaskIds;
        
        return uniqueTaskIds.filter(taskId => 
            taskId.toLowerCase().includes(taskSearch.toLowerCase())
        );
    }, [uniqueTaskIds, taskSearch]);

    // Group tasks by the first special character
    const groupedTasks = useMemo(() => {
        return uniqueTaskIds.reduce((groups, taskId) => {
            const firstSpecialCharIndex = Math.min(
                taskId.indexOf('-') !== -1 ? taskId.indexOf('-') : Infinity,
                taskId.indexOf('/') !== -1 ? taskId.indexOf('/') : Infinity,
                taskId.indexOf(' ') !== -1 ? taskId.indexOf(' ') : Infinity,
                taskId.indexOf('+') !== -1 ? taskId.indexOf('+') : Infinity
            );

            const groupKey = firstSpecialCharIndex !== Infinity ? taskId.substring(0, firstSpecialCharIndex) : taskId;

            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }

            groups[groupKey].push(taskId);
            return groups;
        }, {} as Record<string, string[]>);
    }, [uniqueTaskIds]);

    // Filter tasks based on search
    const filteredGroups = useMemo(() => {
        if (!taskSearch.trim()) return groupedTasks;

        const filtered: Record<string, string[]> = {};

        Object.keys(groupedTasks).forEach((groupKey) => {
            const filteredTasks = groupedTasks[groupKey].filter(taskId =>
                taskId.toLowerCase().includes(taskSearch.toLowerCase())
            );

            if (filteredTasks.length > 0) {
                filtered[groupKey] = filteredTasks;
            }
        });

        return filtered;
    }, [groupedTasks, taskSearch]);

    // Get all group keys for default opened accordions
    const defaultOpenValues = useMemo(() => {
        return Object.keys(filteredGroups);
    }, [filteredGroups]);

    // Get all clusters for the selected task with their probability values
    const getClustersForTask = useMemo(() => {
        if (!selectedTaskId) return [];
        
        // Find all findings with the selected taskId
        const relatedFindings = findings.filter(f => f.taskId === selectedTaskId);
        if (relatedFindings.length === 0) return [];
        
        // Extract all clusters from all findings with this taskId along with their prob values
        const clusterMap: { cluster: string, prob: number }[] = [];
        
        relatedFindings.forEach(finding => {
            finding.details.forEach(detail => {
                if (detail.cluster && !clusterMap.some(item => item.cluster === detail.cluster)) {
                    clusterMap.push({
                        cluster: detail.cluster,
                        prob: detail.prob || 0 // Default to 0 if prob is not available
                    });
                }
            });
        });
        
        // Sort the clusters by prob value in descending order
        return clusterMap.sort((a, b) => b.prob - a.prob);
    }, [findings, selectedTaskId]);

    // Filter clusters based on search
    const filteredClusters = useMemo(() => {
        if (!clusterSearch.trim()) return getClustersForTask;
        
        return getClustersForTask.filter(clusterItem => 
            clusterItem.cluster.toLowerCase().includes(clusterSearch.toLowerCase())
        );
    }, [getClustersForTask, clusterSearch]);

    // Get finding detail for selected cluster
    const getSelectedFindingDetail = useMemo(() => {
        if (!selectedTaskId || !selectedCluster) return null;
        
        // Find the finding that contains the selected cluster
        for (const finding of findings) {
            if (finding.taskId === selectedTaskId) {
                for (const detail of finding.details) {
                    if (detail.cluster === selectedCluster) {
                        return detail;
                    }
                }
            }
        }
        
        return null;
    }, [findings, selectedTaskId, selectedCluster]);

    // Important: Auto-select first task from first accordion on initial load
    useEffect(() => {
        if (Object.keys(filteredGroups).length > 0 && !selectedTaskId) {
            const firstGroupKey = Object.keys(filteredGroups)[0];
            const firstTaskId = filteredGroups[firstGroupKey][0];
            
            setSelectedTaskId(firstTaskId);
        }
    }, [filteredGroups, selectedTaskId]);

    // UPDATED: Auto-select highest probability cluster when task changes
    useEffect(() => {
        if (selectedTaskId) {
            // Get sorted clusters for this task (already sorted by prob in getClustersForTask)
            const sortedClusters = getClustersForTask;
            
            // If there are clusters available, select the one with highest probability (first in the sorted array)
            if (sortedClusters.length > 0) {
                const highestProbCluster = sortedClusters[0].cluster;
                setSelectedCluster(highestProbCluster);
            } else {
                // Reset if no clusters found
                setSelectedCluster(null);
                setSelectedFindingDetail(null);
            }
        }
    }, [selectedTaskId, getClustersForTask]);

    // Update selected finding detail when cluster changes
    useEffect(() => {
        setSelectedFindingDetail(getSelectedFindingDetail);
    }, [getSelectedFindingDetail]);

    // Format spare parts for display
    const formattedSpareParts = useMemo(() => {
        if (!selectedFindingDetail) return [];
        
        // Check if using spareParts or spare_parts field based on data structure
        const parts = selectedFindingDetail.spare_parts || [];
        
        return parts.map(part => ({
            partId: part.partId,
            desc: part.desc,
            qty: part.qty || 1, // Default to 1 if not specified
            unit: part.unit,
            price: part.price || 0, // Default to 0 if not specified
            prob : part.prob || 0
        }));
    }, [selectedFindingDetail]);

    // Flatten the data structure when findings change
    useEffect(() => {
        const flattened: any = [];

        findings.forEach(finding => {
            finding.details.forEach(detail => {
                if (detail.spare_parts && detail.spare_parts.length > 0) {
                    detail.spare_parts.forEach(part => {
                        flattened.push({
                            sourceTask: finding.taskId,
                            description: detail.description,
                            cluster_id: detail.cluster,
                            mhsMin: detail.mhs.min,
                            mhsMax: detail.mhs.max,
                            mhsAvg: detail.mhs.avg,
                            mhsEst: detail.mhs.est,
                            partId: part.partId,
                            partDesc: part.desc,
                            unit: part.unit,
                            qty: part.qty,
                            price: part.price,
                            prob: part.prob
                        });
                    });
                } else {
                    flattened.push({
                        sourceTask: finding.taskId,
                        description: detail.description,
                        cluster_id: detail.cluster,
                        mhsMin: detail.mhs.min,
                        mhsMax: detail.mhs.max,
                        mhsAvg: detail.mhs.avg,
                        mhsEst: detail.mhs.est,
                        partId: '-',
                        partDesc: '-',
                        unit: '-',
                        qty: 0,
                        price:0,
                        prob: 0
                    });
                }
            });
        });

        setFlattenedData(flattened);
    }, [findings]);

    // Column definitions for the table
    const columnDefs : ColDef[] = [
        { headerName: 'Source Task', field: 'sourceTask', filter: true, sortable: true, floatingFilter: true, resizable: true, width: 200, pinned: 'left' },
        { headerName: 'Description', field: 'description', filter: true, floatingFilter: true, resizable: true, width: 400 },
        { headerName: 'Cluster ID', field: 'cluster_id', filter: true, sortable: true, floatingFilter: true, resizable: true, width: 280 },
        {
            headerName: 'Man Hours',
            field: 'mhsMin',
            sortable: true,
            floatingFilter: true,
            resizable: true,
            width: 300,
            cellRenderer: (val: any) => {
                return (
                    <Flex direction='row' justify='space-between'>
                        <Badge variant="light" color="teal" fullWidth>
                            Min : {val?.data?.mhsMin?.toFixed(0)  || "-"}
                        </Badge>
                        <Badge variant="light" color="blue" fullWidth>
                            Avg : {val?.data?.mhsAvg?.toFixed(0) || "-"}
                        </Badge>
                        <Badge variant="light" color="violet" fullWidth>
                            Max : {val?.data?.mhsMax?.toFixed(0) || "-"}
                        </Badge>
                    </Flex>
                );
            },
        },
        { headerName: 'Part Number', field: 'partId', filter: true, sortable: true, floatingFilter: true, resizable: true, width: 150 },
        { headerName: 'Part Description', field: 'partDesc', filter: true, sortable: true, floatingFilter: true, resizable: true, width: 200 },
        { 
            headerName: 'Quantity', 
            field: 'qty', 
            filter: true, 
            sortable: true, 
            floatingFilter: true, 
            resizable: true, 
            width: 200,
            cellRenderer: (val :any) => {
                return (
                    <Text>
                        {val?.data?.qty?.toFixed(2)  || "-"}
                    </Text>
                )
            }
        },
        { headerName: 'Unit', field: 'unit', filter: true, sortable: true, floatingFilter: true, resizable: true, width: 100 },
        { 
            headerName: 'Price ($)', 
            field: 'price', 
            filter: true, 
            sortable: true, 
            floatingFilter: true, 
            resizable: true, 
            width: 200,
            cellRenderer: (val :any) => {
                return (
                    <Text>
                        {val?.data?.price?.toFixed(2) || "-"}
                    </Text>
                )
            }
        },
        { 
            headerName: 'Part Probability (%)', 
            field: 'prob', 
            filter: true, 
            sortable: true, 
            floatingFilter: true, 
            resizable: true, 
            width: 200,
            cellRenderer: (val :any) => {
                return (
                    <Text>
                        {val?.data?.prob?.toFixed(2) || "-" } '%'
                    </Text>
                )
            }
        },
    ];

    const downloadCSV = () => {
        if (!flattenedData || flattenedData.length === 0) {
            console.warn("No data available for CSV export");
            return;
        }

        // Define CSV Headers (Column Titles)
        const csvHeaders = [
            "Source Task",
            "Description",
            "Cluster ID",
            "MHS Min",
            "MHS Max",
            "MHS Avg",
            "MHS Est",
            "Part Number",
            "Part Description",
            "Quantity",
            "Unit",
            "Price",
            "Part Probability",
        ];

        // Function to escape CSV fields
        const escapeCSVField = (field: any) => {
            if (field === null || field === undefined) return "-"; // Handle null or undefined
            const stringField = String(field);
            // If the field contains a comma, double quote, or newline, wrap it in double quotes
            if (stringField.includes(",") || stringField.includes('"') || stringField.includes("\n")) {
                return `"${stringField.replace(/"/g, '""')}"`; // Escape double quotes by doubling them
            }
            return stringField;
        };

        // Map Flattened Data to CSV Format
        const csvData = flattenedData.map((task: any) => [
            escapeCSVField(task.sourceTask),
            escapeCSVField(task.description),
            escapeCSVField(task.cluster_id),
            escapeCSVField(task.mhsMin),
            escapeCSVField(task.mhsMax),
            escapeCSVField(task.mhsAvg),
            escapeCSVField(task.mhsEst),
            escapeCSVField(task.partId),
            escapeCSVField(task.partDesc),
            escapeCSVField(task.qty),
            escapeCSVField(task.unit),
            escapeCSVField(task.price),
            escapeCSVField(task.prob),
        ]);

        // Convert array to CSV format
        const csvContent =
            "data:text/csv;charset=utf-8," +
            [csvHeaders.map(escapeCSVField), ...csvData.map(row => row.map(escapeCSVField))].map((row) => row.join(",")).join("\n");

        // Create a download link and trigger click
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Findings.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // UPDATED: Function to handle task selection and auto-select highest probability cluster
    const handleTaskSelection = (taskId: string) => {
        setSelectedTaskId(taskId);
        
        // We do not need to manually set the first cluster here as the useEffect will handle it
        // The useEffect watching selectedTaskId and getClustersForTask will automatically 
        // select the highest probability cluster when the task changes
    };

    return (
        <>
            <Modal
                opened={tableOpened}
                onClose={() => {
                    setTableOpened(false);
                }}
                size='100%'
                scrollAreaComponent={ScrollArea.Autosize}
                title={
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <Title order={4} c='white'>
                                Findings
                            </Title>
                            <Space w={50} />
                            <Button color="green" size="xs" onClick={downloadCSV} ml='60vw' >
                                Download CSV
                            </Button>
                        </div>
                    </>
                }
                styles={{
                    header: {
                        backgroundColor: "#124076",
                        padding: "12px",
                    },
                    close: {
                        color: 'white'
                    },
                }}
            >
                <div
                    className="ag-theme-alpine"
                    style={{
                        width: "100%",
                        border: "none",
                        height: "auto",
                    }}
                >
                    <style>
                        {`
                        /* Remove the borders and grid lines */
                        .ag-theme-alpine .ag-root-wrapper, 
                        .ag-theme-alpine .ag-root-wrapper-body,
                        .ag-theme-alpine .ag-header,
                        .ag-theme-alpine .ag-header-cell,
                        .ag-theme-alpine .ag-body-viewport {
                            border: none;
                        }

                        /* Remove the cell highlight (border) on cell click */
                        .ag-theme-alpine .ag-cell-focus {
                            outline: none !important; /* Remove focus border */
                            box-shadow: none !important; /* Remove any box shadow */
                        }

                        /* Remove row border */
                        .ag-theme-alpine .ag-row {
                            border-bottom: none;
                        }
                        `}
                    </style>

                    <AgGridReact
                        rowData={flattenedData}
                        columnDefs={columnDefs}
                        pagination={true}
                        paginationPageSize={10}
                        domLayout="autoHeight"
                    />
                </div>
            </Modal>
            
            <Card 
                p={10} 
                c='white' 
                bg='#124076'
                onClick={() => {
                    setTableOpened(true);
                }}
                style={{ cursor: 'pointer' }}
            >
                <Title order={4}>Findings</Title>
            </Card>

            <Card withBorder p={0} h="80vh" bg="none">
                <Space h="xs" />
                <Grid h="100%">
                    {/* Left Section: Grouped Task IDs List */}
                    <Grid.Col span={3}>
                        <Card h="100%" w="100%" p="md" bg="none">
                            <Group>
                                <Text size="md" fw={500} mb="xs" c="dimmed">
                                    Total Source Tasks
                                </Text>
                                <Text size="md" fw={500} mb="xs">
                                    {uniqueTaskIds.length}
                                </Text>
                            </Group>

                            <TextInput
                                placeholder="Search tasks..."
                                value={taskSearch}
                                onChange={(e) => setTaskSearch(e.target.value)}
                                mb="md"
                            />

                            <Card bg="none" p={0} h="calc(80vh - 150px)">
                                <ScrollArea h="100%" scrollbarSize={0}>
                                    <Accordion defaultValue={defaultOpenValues} multiple>
                                        {Object.keys(filteredGroups).map((groupKey) => (
                                            <Accordion.Item key={groupKey} value={groupKey}>
                                                <Accordion.Control>
                                                    <Text fw={600}>{groupKey}</Text>
                                                </Accordion.Control>
                                                <Accordion.Panel>
                                                    {filteredGroups[groupKey].map((taskId, index) => (
                                                        <Badge
                                                            fullWidth
                                                            key={index}
                                                            variant={selectedTaskId === taskId ? 'filled' : "light"}
                                                            color="#4C7B8B"
                                                            size="lg"
                                                            mb="md"
                                                            h={35}
                                                            radius="md"
                                                            onClick={() => handleTaskSelection(taskId)}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            <Text fw={500}>{taskId}</Text>
                                                        </Badge>
                                                    ))}
                                                </Accordion.Panel>
                                            </Accordion.Item>
                                        ))}
                                    </Accordion>
                                </ScrollArea>
                            </Card>
                        </Card>
                    </Grid.Col>

                    {/* Middle Section: All Unique Clusters for Selected Task - UPDATED WITH SORTING */}
                    <Grid.Col span={3}>
                        <Card h="100%" w="100%" p="md" bg="none">
                            <Group>
                                <Text size="md" fw={500} mb="xs" c='dimmed'>
                                    Clusters for
                                </Text>
                                <Text size="md" fw={500} mb="xs">
                                    {selectedTaskId || 'Selected Task'}
                                </Text>
                            </Group>
                            <TextInput
                                placeholder="Search clusters..."
                                value={clusterSearch}
                                onChange={(e) => setClusterSearch(e.target.value)}
                                mb="md"
                            />

                            {/* Scrollable Clusters List - Already sorted by prob in filteredClusters */}
                            <Card
                                bg="none"
                                p={0}
                                h="calc(80vh - 150px)"
                                style={{
                                    overflowY: 'auto',
                                    scrollbarWidth: 'thin',
                                }}
                            >
                                <div style={{ height: '100%', overflowY: 'auto', scrollbarWidth: 'thin' }}>
                                    {
                                        selectedTaskId ? (
                                            filteredClusters.length > 0 ? (
                                                filteredClusters.map((clusterItem, clusterIndex) => (
                                                    <Tooltip 
                                                    key={clusterIndex} 
                                                    label={clusterItem.cluster}
                                                    // label={`${clusterItem.cluster} (Probability: ${clusterItem.prob.toFixed(2)}%)`}
                                                    >
                                                        <Badge
                                                            fullWidth
                                                            variant={selectedCluster === clusterItem.cluster ? 'filled' : "light"}
                                                            color="#4C7B8B"
                                                            size="lg"
                                                            mb='md'
                                                            h={35}
                                                            radius="md"
                                                            onClick={() => setSelectedCluster(clusterItem.cluster)}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            <Text fw={500}>{clusterItem.cluster}</Text>
                                                        </Badge>
                                                    </Tooltip>
                                                ))
                                            ) : (
                                                <Text>No clusters found for this task.</Text>
                                            )
                                        ) : (
                                            <Text>Select a task to view clusters.</Text>
                                        )
                                    }
                                </div>
                            </Card>
                        </Card>
                    </Grid.Col>

                    {/* Right Section: Selected Finding Details */}
                    <Grid.Col span={6}>
                        <Card
                            radius="xl"
                            h="100%"
                            w="100%"
                            shadow="sm"
                            p="md"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden'
                            }}
                        >
                            <Space h="lg" />
                            <div
                                style={{
                                    flex: 1,
                                    overflowY: 'auto',
                                    scrollbarWidth: 'none',
                                    maxHeight: 'calc(70vh - 50px)',
                                }}
                            >
                                <Grid>
                                    <Grid.Col span={2}>
                                        <Text size="md" fw={500} c="dimmed">
                                            Cluster
                                        </Text>
                                    </Grid.Col>
                                    <Grid.Col span={10}>
                                        <Text size="sm" fw={500}>
                                            {selectedFindingDetail?.cluster || "-"}
                                        </Text>
                                    </Grid.Col>
                                </Grid>

                                <Space h="sm" />
                                <Grid>
                                    <Grid.Col span={2}>
                                        <Text size="md" fw={500} c="dimmed">
                                            Description
                                        </Text>
                                    </Grid.Col>
                                    <Grid.Col span={10}>
                                        <Text size="sm" fw={500}>
                                            {selectedFindingDetail?.description || "-"}
                                        </Text>
                                    </Grid.Col>
                                </Grid>

                                <Space h="lg" />
                                <Card shadow="0" bg="#f5f5f5">
                                    <Grid grow justify="left" align="center">
                                        <Grid.Col span={2}>
                                            <Text size="md" fw={500} c="dimmed">
                                                Probability
                                            </Text>
                                        </Grid.Col>
                                        <Grid.Col span={8}>
                                            <Progress w="100%" color="#E07B39" radius="md" size="lg" 
                                                value={(selectedFindingDetail?.prob)*100 || 0} />
                                        </Grid.Col>
                                        <Grid.Col span={2}>
                                            <Text size="sm" fw={600} c="#E07B39">
                                                { (selectedFindingDetail?.prob)*100 || 0} %
                                            </Text>
                                        </Grid.Col>
                                    </Grid>
                                </Card>

                                <Space h="lg" />

                                <Text size="md" fw={500} c="dimmed">
                                    Man Hours
                                </Text>
                                <SimpleGrid cols={4}>
                                    <Card bg='#daf7de' shadow="0" radius='md'>
                                        <Group justify="space-between" align="start">
                                            <Flex direction='column'>
                                                <Text fz='xs'>Min</Text>
                                                <Text fz='xl' fw={600}>{selectedFindingDetail?.mhs?.min?.toFixed(0) || 0} Hr</Text>
                                            </Flex>
                                            <IconClockDown color="green" size='25' />
                                        </Group>
                                    </Card>
                                    <Card bg='#fcebeb' shadow="0" radius='md'>
                                        <Group justify="space-between" align="start">
                                            <Flex direction='column'>
                                                <Text fz='xs'>Max</Text>
                                                <Text fz='xl' fw={600}>{selectedFindingDetail?.mhs?.max?.toFixed(0) || 0} Hr</Text>
                                            </Flex>
                                            <IconClockUp color="red" size='25' />
                                        </Group>
                                    </Card>
                                    <Card bg='#f3f7da' shadow="0" radius='md'>
                                        <Group justify="space-between" align="start">
                                            <Flex direction='column'>
                                                <Text fz='xs'>Avg</Text>
                                                <Text fz='xl' fw={600}>{selectedFindingDetail?.mhs?.avg?.toFixed(0) || 0} Hr</Text>
                                            </Flex>
                                            <IconClockCode color="orange" size='25' />
                                        </Group>
                                    </Card>
                                    <Card bg='#dae8f7' shadow="0" radius='md'>
                                        <Group justify="space-between" align="start">
                                            <Flex direction='column'>
                                                <Text fz='xs'>Est</Text>
                                                <Text fz='xl' fw={600}>{selectedFindingDetail?.mhs?.est?.toFixed(0) || 0} Hr</Text>
                                            </Flex>
                                            <IconClockCheck color="indigo" size='25' />
                                        </Group>
                                    </Card>
                                </SimpleGrid>

                                <Space h="lg" />

                                <Text size="md" fw={500} c="dimmed">
                                    Skills 
                                </Text>
                                
                                <SimpleGrid cols={4}>
                                    { 
                                     selectedFindingDetail?.skill?.map((skl: any, index: number) => (
                                        <Badge key={index} fullWidth color="cyan" size="lg" radius="md">
                                            {skl}
                                        </Badge>
                                    ))
                                    }
                                </SimpleGrid>
                                
                                <Space h="md" />

                                <Text size="md" mb="xs" fw={500} c="dimmed">
                                    Spare parts
                                </Text>
                                <div
                                    className="ag-theme-alpine"
                                    style={{
                                        width: "100%",
                                        border: "none",
                                    }}
                                >
                                    <style>
                                        {`
                                        /* Remove the borders and grid lines */
                                        .ag-theme-alpine .ag-root-wrapper, 
                                        .ag-theme-alpine .ag-root-wrapper-body,
                                        .ag-theme-alpine .ag-header,
                                        .ag-theme-alpine .ag-header-cell,
                                        .ag-theme-alpine .ag-body-viewport {
                                        border: none;
                                        }

                                        /* Remove the cell highlight (border) on cell click */
                                        .ag-theme-alpine .ag-cell-focus {
                                        outline: none !important; /* Remove focus border */
                                        box-shadow: none !important; /* Remove any box shadow */
                                        }

                                        /* Remove row border */
                                        .ag-theme-alpine .ag-row {
                                        border-bottom: none;
                                        }
                                        `}
                                    </style>
                                    <AgGridReact
                                        pagination
                                        paginationPageSize={6}
                                        domLayout="autoHeight" // Ensures height adjusts dynamically
                                        rowData={formattedSpareParts}
                                        columnDefs={[
                                            {
                                                field: "partId",
                                                headerName: "Part Number",
                                                sortable: true,
                                                filter: true,
                                                floatingFilter: true,
                                                resizable: true,
                                                flex: 1
                                            },
                                            {
                                                field: "desc",
                                                headerName: "Description",
                                                sortable: true,
                                                filter: true,
                                                floatingFilter: true,
                                                resizable: true,
                                                flex: 1
                                            },
                                            {
                                                field: "qty",
                                                headerName: "Qty",
                                                sortable: true,
                                                resizable: true,
                                                flex: 1,
                                                cellRenderer:(val:any)=>{
                                                    return (
                                                        <>
                                                        <Text>
                                                            {Math.round(val?.data?.qty) || "-"}
                                                        </Text>
                                                        </>
                                                    )
                                                }
                                            },
                                            {
                                                field: "unit",
                                                headerName: "Unit",
                                                sortable: true,
                                                resizable: true,
                                                flex: 1
                                            },
                                            {
                                                field: "price",
                                                headerName: "Price($)",
                                                sortable: true,
                                                resizable: true,
                                                flex: 1,
                                                cellRenderer:(val:any)=>{
                                                    return (
                                                        <>
                                                        <Text>
                                                            {val?.data?.price?.toFixed(2) || 0}
                                                        </Text>
                                                        </>
                                                    )
                                                }
                                            },
                                            {
                                                field: "prob",
                                                headerName: "Prob(%)",
                                                sortable: true,
                                                resizable: true,
                                                flex: 1,
                                                cellRenderer:(val:any)=>{
                                                    return (
                                                        <>
                                                        <Text>
                                                        {(val?.data?.prob ? val.data.prob * 100 : 0) + " %"}
                                                        </Text>
                                                        </>
                                                    )
                                                }
                                            },
                                        ]}
                                    />
                                </div>
                            </div>
                        </Card>
                    </Grid.Col>
                </Grid>
            </Card>
        </>
    );
};

const PreloadWiseSection: React.FC<{ tasks: any[] }> = ({ tasks }) => {
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [taskSearch, setTaskSearch] = useState<string>('');
    const [tableOpened, setTableOpened] = useState(false);
    const [flattenedData, setFlattenedData] = useState([]);
    // Filter tasks based on search query
    const filteredTasks = tasks?.filter((task) =>
        task.sourceTask.toLowerCase().includes(taskSearch.toLowerCase())
    );

    // Select the first task by default
    // useEffect(() => {
    //     if (tasks?.length > 0) {
    //         setSelectedTask(tasks[0]);
    //     }
    // }, [tasks]);

    // Group tasks by the first two digits before the first hyphen
    // const groupedTasks = useMemo(() => {
    //     if (!tasks) return {};

    //     return tasks.reduce((groups, task) => {
    //         // Extract the first group (first two digits before the first hyphen)
    //         const taskId = task.sourceTask;
    //         const groupKey = taskId.split('-')[0];

    //         if (!groups[groupKey]) {
    //             groups[groupKey] = [];
    //         }

    //         groups[groupKey].push(task);
    //         return groups;
    //     }, {});
    // }, [tasks]);.
    const groupedTasks = useMemo(() => {
        if (!tasks) return {};

        return tasks.reduce((groups, task) => {
            // Extract the task ID
            const taskId = task.sourceTask;

            // Find the first hyphen, first slash, and first space
            const firstHyphenIndex = taskId.indexOf('-');
            const firstSlashIndex = taskId.indexOf('/');
            const firstSpaceIndex = taskId.indexOf(' ');
            const firstPlusIndex = taskId.indexOf('+');

            // Determine the end index for the group key
            const endIndex = Math.min(
                firstHyphenIndex !== -1 ? firstHyphenIndex : Infinity,
                firstSlashIndex !== -1 ? firstSlashIndex : Infinity,
                firstSpaceIndex !== -1 ? firstSpaceIndex : Infinity,
                firstPlusIndex !== -1 ? firstPlusIndex : Infinity
            );

            // If no delimiters are found, use the entire taskId
            const groupKey = endIndex !== Infinity ? taskId.substring(0, endIndex) : taskId;

            // Initialize the group if it doesn't exist
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }

            // Add the task to the appropriate group
            groups[groupKey].push(task);
            return groups;
        }, {});
    }, [tasks]);

    // Filter tasks based on search
    const filteredGroups = useMemo(() => {
        if (!taskSearch.trim()) return groupedTasks;

        const filtered: any = {};

        Object.keys(groupedTasks).forEach((groupKey) => {
            const filteredTasks = groupedTasks[groupKey]?.filter((task: any) =>
                task.sourceTask.toLowerCase().includes(taskSearch.toLowerCase())
            );

            if (filteredTasks.length > 0) {
                filtered[groupKey] = filteredTasks;
            }
        });

        return filtered;
    }, [groupedTasks, taskSearch]);
    // Get all group keys for default opened accordions
    const defaultOpenValues = useMemo(() => {
        return Object.keys(filteredGroups);
    }, [filteredGroups]);

    useEffect(() => {
        if (!selectedTask && Object.keys(filteredGroups).length > 0) {
            const firstGroupKey = Object.keys(filteredGroups)[0];
            const firstTask = filteredGroups[firstGroupKey]?.[0];

            if (firstTask) {
                setSelectedTask(firstTask);
            }
        }
    }, [filteredGroups, selectedTask]);

    // Flatten the data structure when tasks change
    useEffect(() => {
        if (!tasks || tasks.length === 0) return;

        const flattened: any = [];

        tasks.forEach(task => {
            // If task has spare parts, create a row for each spare part
            if (task.spare_parts && task.spare_parts.length > 0) {
                task.spare_parts.forEach((part: any) => {
                    flattened.push({
                        sourceTask: task.sourceTask,
                        description: task.description,
                        cluster_id: task.cluster_id,
                        mhsMin: task.mhs.min,
                        mhsMax: task.mhs.max,
                        mhsAvg: task.mhs.avg,
                        mhsEst: task.mhs.est,
                        partId: part.partId,
                        partDesc: part.desc,
                        qty: part.qty,
                        unit: part.unit,
                        price: part.price
                    });
                });
            } else {
                // If task has no spare parts, create a single row with task data only
                flattened.push({
                    sourceTask: task.sourceTask,
                    description: task.description,
                    cluster_id: task.cluster_id,
                    mhsMin: task.mhs.min,
                    mhsMax: task.mhs.max,
                    mhsAvg: task.mhs.avg,
                    mhsEst: task.mhs.est,
                    partId: '-',
                    partDesc: '-',
                    qty: 0,
                    unit: '-',
                    price: 0
                });
            }
        });

        setFlattenedData(flattened);
    }, [tasks]);

    // Column definitions for the table
    const columnDefs: ColDef[] = [
        {
            headerName: 'Source Task',
            field: 'sourceTask',
            filter: true,
            sortable: true,
            floatingFilter: true,
            resizable: true,
            width: 150,
            // flex: 2,
            pinned: 'left'
        },
        {
            headerName: 'Description',
            field: 'description',
            filter: true,
            floatingFilter: true,
            resizable: true,
            width: 400,
            // flex: 4,
            // pinned: 'left'
        },
        // {
        //     headerName: 'Cluster ID',
        //     field: 'cluster_id',
        //     filter: true,
        //     sortable: true,
        //     floatingFilter: true,
        //     resizable: true,
        //     width: 100
        //     // flex: 1,
        //     // pinned:'left'
        // },

        {
            headerName: 'Man Hours',
            field: 'mhsMin',
            // filter: true,
            sortable: true,
            floatingFilter: true,
            resizable: true,
            // flex: 4,
            width: 300,
            cellRenderer: (val: any) => {
                return (

                    <Flex direction='row' justify='space-between'>

                        <Badge variant="light" color="teal" fullWidth>
                            Min : {val?.data?.mhsMin?.toFixed(0)  || "-"}
                        </Badge>
                        <Badge variant="light" color="blue" fullWidth>
                            Avg : {val?.data?.mhsAvg?.toFixed(0) || "-"}
                        </Badge>
                        <Badge variant="light" color="violet" fullWidth>
                            Max : {val?.data?.mhsMax?.toFixed(0) || "-"}
                        </Badge>

                    </Flex>
                );
            },
        },
        // { 
        //     headerName: 'Man Hours (Max)', 
        //     field: 'mhsMax', 
        //     filter: true,
        //     sortable:true,
        //     floatingFilter: true,
        //     resizable: true,
        //     flex: 1
        // },
        // { 
        //     headerName: 'Man Hours (Avg)', 
        //     field: 'mhsAvg', 
        //     filter: true,
        //     sortable:true,
        //     floatingFilter: true,
        //     resizable: true,
        //     flex: 1
        // },
        // { 
        //     headerName: 'Man Hours (Est)', 
        //     field: 'mhsEst', 
        //     filter: true,
        //     sortable:true,
        //     floatingFilter: true,
        //     resizable: true,
        //     flex: 1
        // },
        {
            headerName: 'Part Number',
            field: 'partId',
            filter: true,
            sortable: true,
            floatingFilter: true,
            resizable: true,
            // flex: 1
        },
        {
            headerName: 'Part Description',
            field: 'partDesc',
            filter: true,
            sortable: true,
            floatingFilter: true,
            resizable: true,
            // flex: 1
        },
        {
            headerName: 'Quantity',
            field: 'qty',
            // filter: true,
            sortable: true,
            floatingFilter: true,
            resizable: true,
            // flex: 1
            width: 150,
            cellRenderer: (val: any) => {
                return (
                    <Text>
                        {Math.round(val?.data?.qty) || "-"}
                    </Text>
                );
            },
        },
        {
            headerName: 'Unit',
            field: 'unit',
            // filter: true,
            sortable: true,
            floatingFilter: true,
            resizable: true,
            // flex: 1
            width: 150,
        },
        {
            headerName: 'Price ($)',
            field: 'price',
            // filter: true,
            sortable: true,
            floatingFilter: true,
            resizable: true,
            // flex: 1
            width: 150,
            cellRenderer: (val: any) => {
                return (
                    <Text>
                        {val?.data?.price?.toFixed(2) || "-"}
                    </Text>
                );
            },
        }
    ];

    const downloadCSV = () => {
        if (!flattenedData || flattenedData.length === 0) {
            console.warn("No data available for CSV export");
            return;
        }

        // Define CSV Headers (Column Titles)
        const csvHeaders = [
            "Source Task",
            "Description",
            // "Cluster ID",
            "MHS Min",
            "MHS Max",
            "MHS Avg",
            "MHS Est",
            "Part ID",
            "Part Description",
            "Quantity",
            "Unit",
            "Price"
        ];

        // Function to escape CSV fields
        const escapeCSVField = (field: any) => {
            if (field === null || field === undefined) return "-"; // Handle null or undefined
            const stringField = String(field);
            // If the field contains a comma, double quote, or newline, wrap it in double quotes
            if (stringField.includes(",") || stringField.includes('"') || stringField.includes("\n")) {
                return `"${stringField.replace(/"/g, '""')}"`; // Escape double quotes by doubling them
            }
            return stringField;
        };

        // Map Flattened Data to CSV Format
        const csvData = flattenedData.map((task: any) => [
            escapeCSVField(task.sourceTask),
            escapeCSVField(task.description),
            // escapeCSVField(task.cluster_id),
            escapeCSVField(task.mhsMin),
            escapeCSVField(task.mhsMax),
            escapeCSVField(task.mhsAvg),
            escapeCSVField(task.mhsEst),
            escapeCSVField(task.partId),
            escapeCSVField(task.partDesc),
            escapeCSVField(task.qty),
            escapeCSVField(task.unit),
            escapeCSVField(task.price)
        ]);

        // Convert array to CSV format
        const csvContent =
            "data:text/csv;charset=utf-8," +
            [csvHeaders.map(escapeCSVField), ...csvData.map(row => row.map(escapeCSVField))].map((row) => row.join(",")).join("\n");

        // Create a download link and trigger click
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `MPD_Tasks.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadExcel = () => {
        if (!flattenedData || flattenedData.length === 0) {
            console.warn("No data available for Excel export");
            return;
        }

        // Define Excel Headers (Column Titles)
        const excelHeaders = [
            "Source Task",
            "Description",
            "Cluster ID",
            "MHS Min",
            "MHS Max",
            "MHS Avg",
            "MHS Est",
            "Part ID",
            "Part Description",
            "Quantity",
            "Unit",
            "Price"
        ];

        // Function to process and clean data
        const processField = (field: any) => (field === null || field === undefined ? "-" : field);

        // Map Flattened Data to Excel Format
        const excelData = flattenedData.map((task: any) => ({
            "Source Task": processField(task.sourceTask),
            "Description": processField(task.description),
            "Cluster ID": processField(task.cluster_id),
            "MHS Min": processField(task.mhsMin),
            "MHS Max": processField(task.mhsMax),
            "MHS Avg": processField(task.mhsAvg),
            "MHS Est": processField(task.mhsEst),
            "Part ID": processField(task.partId),
            "Part Description": processField(task.partDesc),
            "Quantity": processField(task.qty),
            "Unit": processField(task.unit),
            "Price": processField(task.price),
        }));

        // Create a new Workbook and Worksheet
        const worksheet = XLSX.utils.json_to_sheet(excelData, { header: excelHeaders });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "MPD_Tasks");

        // Write the file and trigger download
        XLSX.writeFile(workbook, "MPD_Tasks.xlsx");
    };   



    return (
        <>
            <Modal
                opened={tableOpened}
                onClose={() => {
                    setTableOpened(false);
                    //   form.reset();
                }}
                size='100%'
                scrollAreaComponent={ScrollArea.Autosize}
                title={
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <Title order={4} c='white'>
                                MPD
                            </Title>
                            <Space w={50} />
                            <Text c='white'>
                                Total Source Tasks - {tasks?.length}
                            </Text>
                            {/* <Space w={600}/> */}
                            {/* Button aligned to the end */}
                            <Button color="green" size="xs" onClick={downloadCSV} ml='50vw' >
                                Download CSV
                            </Button>
                        </div>
                    </>
                }
                styles={{
                    header: {
                        backgroundColor: "#124076", // Set header background color
                        padding: "12px",
                    },
                    close: {
                        color: 'white'
                    },
                }}
            >
                <div
                    className="ag-theme-alpine"
                    style={{
                        width: "100%",
                        border: "none",
                        height: "auto",
                    }}
                >
                    <style>
                        {`
/* Remove the borders and grid lines */
.ag-theme-alpine .ag-root-wrapper, 
.ag-theme-alpine .ag-root-wrapper-body,
.ag-theme-alpine .ag-header,
.ag-theme-alpine .ag-header-cell,
.ag-theme-alpine .ag-body-viewport {
border: none;
}

/* Remove the cell highlight (border) on cell click */
.ag-theme-alpine .ag-cell-focus {
outline: none !important; /* Remove focus border */
box-shadow: none !important; /* Remove any box shadow */
}

/* Remove row border */
.ag-theme-alpine .ag-row {
border-bottom: none;
}
`}
                    </style>

                    <AgGridReact
                        rowData={flattenedData}
                        columnDefs={columnDefs}
                        pagination={true}
                        paginationPageSize={10}
                        domLayout="autoHeight"
                    // defaultColDef={{
                    //   sortable: true,
                    //   filter: true,
                    //   resizable: true,
                    //   minWidth: 100,
                    //   flex: 1
                    // }}
                    />
                </div>
            </Modal>
            <Card withBorder p={0} h="90vh" bg="none">
                <Card
                    p={10}
                    c='white'
                    bg='#124076'
                    onClick={(values: any) => {
                        setTableOpened(true);
                    }}
                    style={{ cursor: 'pointer' }}
                >

                    <Title order={4}>
                        MPD
                    </Title>
                </Card>
                <Card withBorder p={0} h="80vh" bg="none">
                    <Space h="xs" />
                    <Grid h="100%">
                        {/* Left Section: Tasks List with Tree Structure */}
                        <Grid.Col span={3}>
                            <Card h="100%" w="100%" p="md" bg="none">
                                <Group>
                                    <Text size="md" fw={500} mb="xs" c="dimmed">
                                        Total Source Tasks
                                    </Text>
                                    <Text size="md" fw={500} mb="xs">
                                        {tasks?.length}
                                    </Text>
                                </Group>

                                <TextInput
                                    placeholder="Search tasks..."
                                    value={taskSearch}
                                    onChange={(e) => setTaskSearch(e.target.value)}
                                    mb="md"
                                />

                                <Card
                                    bg="none"
                                    p={0}
                                    h="calc(80vh - 150px)"
                                >
                                    <ScrollArea h="100%" scrollbarSize={0} scrollHideDelay={0}>
                                        <Accordion defaultValue={defaultOpenValues} multiple>
                                            {Object.keys(filteredGroups).map((groupKey) => (
                                                <Accordion.Item key={groupKey} value={groupKey}>
                                                    <Accordion.Control>
                                                        <Text fw={600}> {groupKey}</Text>
                                                    </Accordion.Control>
                                                    <Accordion.Panel>
                                                        {filteredGroups[groupKey]?.map((task: any, taskIndex: any) => (
                                                            <Badge
                                                                fullWidth
                                                                key={taskIndex}
                                                                variant={selectedTask?.sourceTask === task.sourceTask ? 'filled' : "light"}
                                                                color="#4C7B8B"
                                                                size="lg"
                                                                mb="md"
                                                                h={35}
                                                                radius="md"
                                                                onClick={() => setSelectedTask(task)}
                                                                style={{ cursor: 'pointer' }}
                                                            >
                                                                <Text fw={500}>{task?.sourceTask}</Text>
                                                            </Badge>
                                                        ))}
                                                    </Accordion.Panel>
                                                </Accordion.Item>
                                            ))}
                                        </Accordion>
                                    </ScrollArea>
                                </Card>
                            </Card>
                        </Grid.Col>


                        {/* Right Section: Selected Task Details */}
                        <Grid.Col span={9}>
                            <Card
                                radius="xl"
                                h="100%"
                                w="100%"
                                shadow="sm"
                                p="md"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden'
                                }}
                            >
                                <div
                                    style={{
                                        flex: 1,
                                        overflowY: 'auto',
                                        scrollbarWidth: 'none',
                                        maxHeight: 'calc(70vh - 50px)'
                                    }}
                                >
                                    {selectedTask ? (
                                        <>
                                            <Grid>
                                                <Grid.Col span={2}>
                                                    <Text size="md" fw={500} c="dimmed">
                                                        Source Task
                                                    </Text>
                                                </Grid.Col>
                                                <Grid.Col span={10}>
                                                    <Text size="sm" fw={500}>
                                                        {selectedTask?.sourceTask || "-"}
                                                    </Text>
                                                </Grid.Col>
                                            </Grid>

                                            <Space h="sm" />
                                            <Grid>
                                                <Grid.Col span={2}>
                                                    <Text size="md" fw={500} c="dimmed">
                                                        Description
                                                    </Text>
                                                </Grid.Col>
                                                <Grid.Col span={10}>
                                                    <Text size="sm" fw={500}>
                                                        {selectedTask?.description || "-"}
                                                    </Text>
                                                </Grid.Col>
                                            </Grid>

                                            {/* <Space h="sm" />
                                            <Grid>
                                                <Grid.Col span={2}>
                                                    <Text size="md" fw={500} c="dimmed">
                                                        Cluster Id
                                                    </Text>
                                                </Grid.Col>
                                                <Grid.Col span={10}>
                                                    <Text size="sm" fw={500}>
                                                        {selectedTask?.cluster_id || "-"}
                                                    </Text>
                                                </Grid.Col>
                                            </Grid> */}
                                            <Space h="lg" />
                                            <Text size="md" fw={500} c="dimmed">
                                                Man Hours
                                            </Text>
                                            <SimpleGrid cols={4}>
                                                <Card bg='#daf7de' shadow="0" radius='md'>
                                                    <Group justify="space-between" align="start">
                                                        <Flex direction='column'>
                                                            <Text fz='xs'>Min</Text>
                                                            <Text fz='xl' fw={600}>{selectedTask?.mhs?.min?.toFixed(0) || 0} Hr</Text>
                                                        </Flex>
                                                        <IconClockDown color="green" size='25' />
                                                    </Group>
                                                </Card>
                                                <Card bg='#fcebeb' shadow="0" radius='md'>
                                                    <Group justify="space-between" align="start">
                                                        <Flex direction='column'>
                                                            <Text fz='xs'>Max</Text>
                                                            <Text fz='xl' fw={600}>{selectedTask?.mhs?.max?.toFixed(0) || 0} Hr</Text>
                                                        </Flex>
                                                        <IconClockUp color="red" size='25' />
                                                    </Group>
                                                </Card>
                                                <Card bg='#f3f7da' shadow="0" radius='md'>
                                                    <Group justify="space-between" align="start">
                                                        <Flex direction='column'>
                                                            <Text fz='xs'>Average</Text>
                                                            <Text fz='xl' fw={600}>{selectedTask?.mhs?.avg?.toFixed(0) || 0} Hr</Text>
                                                        </Flex>
                                                        <IconClockCode color="orange" size='25' />
                                                    </Group>
                                                </Card>
                                                <Card bg='#dae8f7' shadow="0" radius='md'>
                                                    <Group justify="space-between" align="start">
                                                        <Flex direction='column'>
                                                            <Text fz='xs'>Estimated</Text>
                                                            <Text fz='xl' fw={600}>{selectedTask?.mhs?.est?.toFixed(0) || 0} Hr</Text>
                                                        </Flex>
                                                        <IconClockCheck color="indigo" size='25' />
                                                    </Group>
                                                </Card>
                                            </SimpleGrid>
                                            <Space h="lg" />

                                <Text size="md" fw={500} c="dimmed">
                                    Skills  
                                </Text>
                                
                                    <SimpleGrid cols={8}>
                                   { selectedTask?.skill?.map((skl:any)=>
                                        <>
                                        <Badge fullWidth color="cyan" size="lg" radius="md">
                                            {skl}
                                        </Badge>
                                        </>
                                    )}
                                    </SimpleGrid>

                                            <Space h="md" />
                                            <Text size="md" mb="xs" fw={500} c="dimmed">
                                                Spare Parts
                                            </Text>
                                            <div
                                                className="ag-theme-alpine"
                                                style={{
                                                    width: "100%",
                                                    border: "none",
                                                    // height: "100%",

                                                }}
                                            >
                                                <style>
                                                    {`
/* Remove the borders and grid lines */
.ag-theme-alpine .ag-root-wrapper, 
.ag-theme-alpine .ag-root-wrapper-body,
.ag-theme-alpine .ag-header,
.ag-theme-alpine .ag-header-cell,
.ag-theme-alpine .ag-body-viewport {
border: none;
}

/* Remove the cell highlight (border) on cell click */
.ag-theme-alpine .ag-cell-focus {
outline: none !important; /* Remove focus border */
box-shadow: none !important; /* Remove any box shadow */
}

/* Remove row border */
.ag-theme-alpine .ag-row {
border-bottom: none;
}
`}
                                                </style>
                                                <AgGridReact
                                                    pagination
                                                    paginationPageSize={6}
                                                    domLayout="autoHeight" // Ensures height adjusts dynamically
                                                    rowData={selectedTask?.spare_parts || []}
                                                    columnDefs={[
                                                        {
                                                            field: "partId",
                                                            headerName: "Part Number",
                                                            sortable: true,
                                                            filter: true,
                                                            floatingFilter: true,
                                                            resizable: true,
                                                            flex: 1
                                                        },
                                                        {
                                                            field: "desc",
                                                            headerName: "Description                                                            ",
                                                            sortable: true,
                                                            filter: true,
                                                            floatingFilter: true,
                                                            resizable: true,
                                                            flex: 1
                                                        },
                                                        {
                                                            field: "qty",
                                                            headerName: "Qty",
                                                            sortable: true,
                                                            // filter: true,
                                                            // floatingFilter: true,
                                                            resizable: true,
                                                            flex: 1,
                                                            cellRenderer: (val: any) => {
                                                                return (
                                                                    <Text>
                                                                        {val?.data?.qty?.toFixed(2) || 0}
                                                                    </Text>
                                                                );
                                                            },
                                                        },
                                                        {
                                                            field: "unit",
                                                            headerName: "Unit",
                                                            sortable: true,
                                                            // filter: true,
                                                            // floatingFilter: true,
                                                            resizable: true,
                                                            flex: 1
                                                        },
                                                        {
                                                            field: "price",
                                                            headerName: "Price($)",
                                                            sortable: true,
                                                            // filter: true,
                                                            // floatingFilter: true,
                                                            resizable: true,
                                                            flex: 1,
                                                            cellRenderer: (val: any) => {
                                                                return (
                                                                    <Text>
                                                                        {val?.data?.price?.toFixed(4) || 0}
                                                                    </Text>
                                                                );
                                                            },
                                                        },
                                                    ]}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <Text>Select a task to view details.</Text>
                                    )}
                                </div>
                            </Card>
                        </Grid.Col>
                    </Grid>
                </Card>
            </Card>
        </>
    );
};

// RFQ PARAMETRS OLD
{/* 
    <Card withBorder h="60vh" radius="md">
     
      <Group justify="space-between" onClick={() => setExpanded(!expanded)} style={{ cursor: "pointer" }}>
      <Text size="md" mb='sm' fw={500} >
        RFQ Parameters
      </Text>
      <Group>
        {
            expanded ? <IconChevronUp color="gray"/> : <IconChevronDown color="gray"/>
        }
      </Group>
      </Group>
      

     
      {expanded && (
        <ScrollArea scrollbarSize={0} style={{ maxHeight: "50vh", overflowX: 'hidden' }}>
          <SimpleGrid cols={1} spacing="xs">
            {fields.map((field) => (
              <Grid key={field.name} align="center">
                <Grid.Col span={8}>
                  <Text>{field.label}</Text>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Checkbox
                    checked={selectedFields.includes(field.name)}
                    onChange={() => toggleFieldSelection(field.name)}
                  />
                </Grid.Col>
              </Grid>
            ))}
          </SimpleGrid>
          <Group justify="center">
          <Button variant="light" mt="sm" onClick={() => {
    setShowFields([...selectedFields]);
    setExpanded(false); // Collapse the accordion after showing inputs
}}>
            Show Inputs
          </Button>
          </Group>
          
        </ScrollArea>
      )}

      
      <ScrollArea style={{ flex: 1, overflow: "auto", marginTop: "10px" }} offsetScrollbars scrollHideDelay={1}>
        <SimpleGrid cols={1} spacing="xs">
          <SimpleGrid cols={2}>
            {fields
              .filter((field) => showFields.includes(field.name))
              .map((field) => (
                <div key={field.name}>
                  <Text size="xs" fw={500}>
                    {field.label}
                  </Text>
                  {field.component}
                </div>
              ))}
          </SimpleGrid>
        </SimpleGrid>
      </ScrollArea>
    </Card> */}
{/* Left Section: Tasks List */ }
{/* <Grid.Col span={3}>
                            <Card h="100%" w="100%" p="md" bg="none">
                                <Group>
                                    <Text size="md" fw={500} mb="xs" c='dimmed'>
                                        Total Source Tasks
                                    </Text>
                                    <Text size="md" fw={500} mb="xs">
                                        {tasks?.length}
                                    </Text>
                                </Group>

                                <TextInput
                                    placeholder="Search tasks..."
                                    value={taskSearch}
                                    onChange={(e) => setTaskSearch(e.target.value)}
                                    mb="md"
                                />

                                <Card
                                    bg="none"
                                    p={0}
                                    h="calc(80vh - 150px)"
                                    style={{
                                        overflowY: 'auto',
                                        scrollbarWidth: 'thin',
                                    }}
                                >
                                    <div style={{ height: '100%', overflowY: 'auto', scrollbarWidth: 'thin', }}>
                                        {filteredTasks?.map((task, taskIndex) => (
                                            <Badge
                                                fullWidth
                                                key={taskIndex}
                                                variant={selectedTask?.sourceTask === task.sourceTask ? 'filled' : "light"}
                                                color="#4C7B8B"
                                                size="lg"
                                                mb='md'
                                                h={35}
                                                radius="md"
                                                onClick={() => setSelectedTask(task)}
                                            >
                                                <Text fw={500}>{task?.sourceTask}</Text>
                                            </Badge>
                                        ))}
                                    </div>
                                </Card>
                            </Card>
                        </Grid.Col> */}
{/* <Group>
                        
<Tooltip label="Download Historical Tasks"  withArrow position="top">
<CsvDownloadButton
    data={validatedTasks?.filter((ele) => ele?.status === true)?.map((el) => {
        return {
            // ...el,
            tasks: el?.taskid || 0,
            status: el?.status
        };
    })}
    headers={[
        "Tasks",
        "Status"
    ]}
    filename={`Estimate_${selectedEstimateId}.csv`}
    delimiter=","
    style={{
        //pass other props, like styles
        // boxShadow: "inset 0px 1px 0px 0px #e184f3",
        height: "2em",
        background:
            "linear-gradient(to bottom, #0093E9 5%, #80D0C7 100%)",
        // backgroundColor: "#c123de",
        borderRadius: "6px",
        border: "1px solid #0093E9",
        display: "inline-block",
        cursor: "pointer",
        color: "#ffffff",
        fontSize: "15px",
        fontWeight: "bold",
        padding: "6px 24px",
        textDecoration: "none",
        // textShadow: "0px 1px 0px #9b14b3",
    }}
>
    Available Tasks - {" "}{validatedTasks?.filter((ele) => ele?.status === true)?.length}
</CsvDownloadButton>
</Tooltip>

<Tooltip label="Download New Tasks"  withArrow position="top">
<CsvDownloadButton
    data={validatedTasks?.filter((ele) => ele?.status === false)?.map((el) => {
        return {
            // ...el,
            tasks: el?.taskid || 0,
            status: el?.status
        };
    })}
    headers={[
        "Tasks",
        "Status"
    ]}
    filename={`Estimate_${selectedEstimateId}.csv`}
    delimiter=","
    style={{
        //pass other props, like styles
        // boxShadow: "inset 0px 1px 0px 0px #e184f3",
        height: "2em",
        background:
            "linear-gradient(to bottom, #FBAB7E 5%, #F7CE68 100%)",
        // backgroundColor: "#FBAB7E",
        borderRadius: "6px",
        border: "1px solid  #FBAB7E",
        display: "inline-block",
        cursor: "pointer",
        color: "#ffffff",
        fontSize: "15px",
        fontWeight: "bold",
        padding: "6px 24px",
        textDecoration: "none",
        // textShadow: "0px 1px 0px #9b14b3",
    }}
>
    NotAvaiable Tasks - {" "}{validatedTasks?.filter((ele) => ele?.status === false)?.length}
</CsvDownloadButton>
</Tooltip>
</Group> */}

// const createdEstimates = [
//     {
//         estId: "Est - 01",
//         date: "",
//         aircraft: "Indigo",
//         totalManHrs: "44",
//         totalCost: "4000",
//         status: "In Progress",
//     },
//     {
//         estId: "Est - 02",
//         date: "",
//         aircraft: "AirIndia",
//         totalManHrs: "44",
//         totalCost: "4000",
//         status: "In Progress",
//     },
//     {
//         estId: "Est - 03",
//         date: "",
//         aircraft: "Indigo",
//         totalManHrs: "44",
//         totalCost: "4000",
//         status: "Completed",
//     }
// ];

// const parts = [
//     {
//         partName: "Nut",
//         partDesc: "POO1",
//         qty: "6",
//         unit: "",
//         price: "20"
//     },
//     {
//         partName: "Foam Tape",
//         partDesc: "POO2",
//         qty: "2",
//         unit: "",
//         price: "80"
//     },
//     {
//         partName: "Blind Rivet",
//         partDesc: "POO3",
//         qty: "1",
//         unit: "",
//         price: "40"
//     },
//     {
//         partName: "Selant",
//         partDesc: "POO4",
//         qty: "4",
//         unit: "",
//         price: "20"
//     },
//     {
//         partName: "Nut",
//         partDesc: "POO1",
//         qty: "6",
//         unit: "",
//         price: "20"
//     },
//     {
//         partName: "Foam Tape",
//         partDesc: "POO2",
//         qty: "2",
//         unit: "",
//         price: "80"
//     },
//     {
//         partName: "Blind Rivet",
//         partDesc: "POO3",
//         qty: "1",
//         unit: "",
//         price: "40"
//     },
//     {
//         partName: "Selant",
//         partDesc: "POO4",
//         qty: "4",
//         unit: "",
//         price: "20"
//     }
// ];

// const jsonData = {
//     tasks: [
//         {
//             sourceTask: "255000-16-1",
//             desciption: "CARGO COMPARTMENTS\n\nDETAILED INSPECTION OF DIVIDER NETS, DOOR NETS AND\nNET ATTACHMENT POINTS\n\nNOTE:\nTHE NUMBER OF AFFECTED ZONES MAY VARY ACCORDING TO",
//             mhs: { max: 2, min: 2, avg: 2, est: 1.38 },
//             spareParts: [
//                 {
//                     partId: "Nut",
//                     desc: "POO1",
//                     qty: "6",
//                     unit: "",
//                     price: "20"
//                 },
//                 {
//                     partId: "Foam Tape",
//                     desc: "POO2",
//                     qty: "2",
//                     unit: "",
//                     price: "80"
//                 },
//                 {
//                     partId: "Blind Rivet",
//                     desc: "POO3",
//                     qty: "1",
//                     unit: "",
//                     price: "40"
//                 },
//                 {
//                     partId: "Selant",
//                     desc: "POO4",
//                     qty: "4",
//                     unit: "",
//                     price: "20"
//                 },
//                 {
//                     partId: "Nut",
//                     desc: "POO1",
//                     qty: "6",
//                     unit: "",
//                     price: "20"
//                 },
//                 {
//                     partId: "Foam Tape",
//                     desc: "POO2",
//                     qty: "2",
//                     unit: "",
//                     price: "80"
//                 },
//                 {
//                     partId: "Blind Rivet",
//                     desc: "POO3",
//                     qty: "1",
//                     unit: "",
//                     price: "40"
//                 },
//                 {
//                     partId: "Selant",
//                     desc: "POO4",
//                     qty: "4",
//                     unit: "",
//                     price: "20"
//                 }
//             ],
//         },
//         {
//             sourceTask: "256241-05-1",
//             desciption: "DOOR ESCAPE SLIDE\n\nCLEAN DOOR GIRT BAR FITTING STOP LEVERS\n\nNOTE:\nTASK IS NOT APPLICABLE FOR DEACTIVATED PASSENGER/CREW\nDOORS.",
//             mhs: { max: 2, min: 2, avg: 2, est: 0.92 },
//             spareParts: [
//                 { partId: "LOTOXANE", desc: "NON AQUEOUS CLEANER-GENERAL", qty: 0.1, unit: "LTR", price: 0 },
//             ],
//         },
//         {
//             sourceTask: "200435-01-1 (LH)",
//             desciption: "FAN COMPARTMENT\n\nDETAILED INSPECTION OF EWIS IN THE FAN AND ACCESSORY\nGEAR BOX (EWIS)",
//             mhs: { max: 4, min: 4, avg: 4, est: 0.73 },
//             spareParts: [],
//         },
//     ],
//     findings: [
//         {
//             taskId: "200435-01-1 (LH)",
//             details: [
//                 {
//                     logItem: "HMV23/000211/0324/24",
//                     probability: '66',
//                     desciption: "WHILE CARRYING OUT MPD # 200435-01-1 (LH) ,FAN COMPARTMENT DETAILED INSPECTION OF EWIS IN THE FAN AND ACCESSORY GEAR BOX (EWIS ) FOUND CLAMP QTY # 2 CUSHION DAMAGED.",
//                     mhs: { max: 2, min: 2, avg: 2, est: 4 },
//                     spareParts: [
//                         {
//                             partId: "Nut",
//                             desc: "POO1",
//                             qty: "6",
//                             unit: "",
//                             price: "20"
//                         },
//                         {
//                             partId: "Foam Tape",
//                             desc: "POO2",
//                             qty: "2",
//                             unit: "",
//                             price: "80"
//                         },
//                         {
//                             partId: "Blind Rivet",
//                             desc: "POO3",
//                             qty: "1",
//                             unit: "",
//                             price: "40"
//                         },
//                         {
//                             partId: "Selant",
//                             desc: "POO4",
//                             qty: "4",
//                             unit: "",
//                             price: "20"
//                         },
//                         {
//                             partId: "Nut",
//                             desc: "POO1",
//                             qty: "6",
//                             unit: "",
//                             price: "20"
//                         },
//                         {
//                             partId: "Foam Tape",
//                             desc: "POO2",
//                             qty: "2",
//                             unit: "",
//                             price: "80"
//                         },
//                         {
//                             partId: "Blind Rivet",
//                             desc: "POO3",
//                             qty: "1",
//                             unit: "",
//                             price: "40"
//                         },
//                         {
//                             partId: "Selant",
//                             desc: "POO4",
//                             qty: "4",
//                             unit: "",
//                             price: "20"
//                         }
//                     ],
//                 },
//                 {
//                     logItem: "HMV23/000211/25",
//                     probability: '44',
//                     desciption: "WHILE CARRYING OUT MPD # 200435-01-1 (LH) ,FAN COMPARTMENT DETAILED INSPECTION OF EWIS IN THE FAN AND ACCESSORY GEAR BOX (EWIS ) FOUND CLAMP QTY # 2 CUSHION DAMAGED.",
//                     mhs: { max: 2, min: 2, avg: 2, est: 4 },
//                     spareParts: [],
//                 },
//                 {
//                     logItem: "HMV23/000211/6",
//                     probability: '46',
//                     desciption: "WHILE CARRYING OUT MPD # 200435-01-1 (LH) ,FAN COMPARTMENT DETAILED INSPECTION OF EWIS IN THE FAN AND ACCESSORY GEAR BOX (EWIS ) FOUND CLAMP QTY # 2 CUSHION DAMAGED.",
//                     mhs: { max: 2, min: 2, avg: 2, est: 4 },
//                     spareParts: [
//                         {
//                             partId: "Nut",
//                             desc: "POO1",
//                             qty: "6",
//                             unit: "",
//                             price: "20"
//                         },
//                         {
//                             partId: "Foam Tape",
//                             desc: "POO2",
//                             qty: "2",
//                             unit: "",
//                             price: "80"
//                         },
//                         {
//                             partId: "Blind Rivet",
//                             desc: "POO3",
//                             qty: "1",
//                             unit: "",
//                             price: "40"
//                         },
//                         {
//                             partId: "Selant",
//                             desc: "POO4",
//                             qty: "4",
//                             unit: "",
//                             price: "20"
//                         },
//                         {
//                             partId: "Nut",
//                             desc: "POO1",
//                             qty: "6",
//                             unit: "",
//                             price: "20"
//                         },
//                         {
//                             partId: "Foam Tape",
//                             desc: "POO2",
//                             qty: "2",
//                             unit: "",
//                             price: "80"
//                         },
//                         {
//                             partId: "Blind Rivet",
//                             desc: "POO3",
//                             qty: "1",
//                             unit: "",
//                             price: "40"
//                         },
//                         {
//                             partId: "Selant",
//                             desc: "POO4",
//                             qty: "4",
//                             unit: "",
//                             price: "20"
//                         }
//                     ],
//                 },
//                 {
//                     logItem: "HMV23/000211/26",
//                     probability: '64',
//                     desciption: "WHILE CARRYING OUT MPD # 200435-01-1 (LH) ,FAN COMPARTMENT DETAILED INSPECTION OF EWIS IN THE FAN AND ACCESSORY GEAR BOX (EWIS ) FOUND CLAMP QTY # 2 CUSHION DAMAGED.",
//                     mhs: { max: 2, min: 2, avg: 2, est: 4 },
//                     spareParts: [],
//                 },
//             ],
//         },
//         {
//             taskId: "255000-16-1",
//             details: [
//                 {
//                     logItem: "HMV23/000211/0324/24",
//                     probability: '66',
//                     desciption: "WHILE CARRYING OUT MPD # 200435-01-1 (LH) ,FAN COMPARTMENT DETAILED INSPECTION OF EWIS IN THE FAN AND ACCESSORY GEAR BOX (EWIS ) FOUND CLAMP QTY # 2 CUSHION DAMAGED.",
//                     mhs: { max: 2, min: 2, avg: 2, est: 4 },
//                     spareParts: [],
//                 }
//             ],
//         },
//     ],
// };

{/* <SimpleGrid cols={3} spacing='xs'>
<Flex
    justify="flex-start"
    align="flex-start"
    direction="column"
>
    <Card withBorder w='100%' p={5}>
        <Group p={0} gap='sm'>
            <ThemeIcon variant="light" radius="md" size="60" color="indigo">
                <MdOutlineTimeline style={{ width: '70%', height: '70%' }} />
            </ThemeIcon>

            <Flex direction='column'>
                <Text size="md" fw={500} fz='h6' c='gray'>
                    Total TAT Time
                </Text>
                <Text size="md" fw={600} fz='h3' >
                    44
                </Text>
            </Flex>
        </Group>
    </Card>
    <Space h='sm' />
    <Card withBorder w='100%'>
        <Flex gap="lg" direction="column">
            <Title order={6} c='gray'>Est Man Hrs.</Title>
            <Grid justify="flex-start" align="center">
                <Grid.Col span={3}>
                    <Text fz='sm'>Min</Text>
                </Grid.Col>
                <Grid.Col span={9}>
                    <Group justify="flex-end" fz='xs' fw='600' c="green">{40} Hrs</Group>
                    <Progress color="green" value={40} />
                </Grid.Col>
            </Grid>

            <Grid justify="flex-start" align="center">
                <Grid.Col span={3}>
                    <Text fz='sm'>Estimated</Text>
                </Grid.Col>
                <Grid.Col span={9}>
                    <Group justify="flex-end" fz='xs' fw='600' c="yellow">{66} Hrs</Group>
                    <Progress color="yellow" value={66} />
                </Grid.Col>
            </Grid>

            <Grid justify="flex-start" align="center">
                <Grid.Col span={3}>
                    <Text fz='sm'>Max</Text>
                </Grid.Col>
                <Grid.Col span={9}>
                    <Group justify="flex-end" fz='xs' fw='600' c="red">{46} Hrs</Group>
                    <Progress color="red" value={46} />
                </Grid.Col>
            </Grid>

            <Grid justify="flex-start" align="center">
                <Grid.Col span={3}>
                    <Text fz='sm'>Capping</Text>
                </Grid.Col>
                <Grid.Col span={9}>
                    <Group justify="flex-end" fz='xs' fw='600' c="indigo">{46} Hrs</Group>
                    <Progress color="indigo" value={46} />
                </Grid.Col>
            </Grid>
        </Flex>
    </Card>
    <Space h='sm' />
    <Card withBorder w='100%' p={5}>
        <Group p={0} gap='sm'>
            <ThemeIcon variant="light" radius="md" size="60" color="indigo">
                <MdOutlineMiscellaneousServices style={{ width: '70%', height: '70%' }} />
            </ThemeIcon>
            <Flex direction='column'>
                <Text size="md" fw={500} fz='h6' c='gray'>
                    Capping Unbilled Costing ($)
                </Text>
                <Text size="md" fw={600} fz='h3' >
                    44
                </Text>
            </Flex>
        </Group>
    </Card>
</Flex>

<Card withBorder>
    <Text size="md" fw={500} fz="h6" c="gray">
        Estimated Parts
    </Text>

    
    <div style={{ position: 'relative', height: '40vh', overflow: 'hidden' }}>
        <Table
            stickyHeader
            striped
            highlightOnHover
            style={{
                // position: 'relative',
                overflow: 'auto',
                height: '100%',
            }}
        >
  
            <Table.Thead
                style={{
                    position: 'sticky',
                    top: 0,
                    backgroundColor: 'white',
                    zIndex: 1,
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                }}
            >
                <Table.Tr>
                    <Table.Th>Part Desc</Table.Th>
                    <Table.Th>Part Name</Table.Th>
                    <Table.Th>Qty</Table.Th>
                    <Table.Th>Price($)</Table.Th>
                </Table.Tr>
            </Table.Thead>


            <Table.Tbody style={{ overflow: 'auto', height: "50vh" }}>
                {parts.length > 0 ? (
                    parts.map((row, index) => (
                        <Table.Tr key={index}>
                            <Table.Td>{row.partDesc}</Table.Td>
                            <Table.Td>{row.partName}</Table.Td>
                            <Table.Td>{row.qty}</Table.Td>
                            <Table.Td>{row.price}</Table.Td>
                        </Table.Tr>
                    ))
                ) : (
                    <Table.Tr>
                        <Table.Td colSpan={4} style={{ textAlign: 'center' }}>
                            No data available
                        </Table.Td>
                    </Table.Tr>
                )}
            </Table.Tbody>
        </Table>
    </div>
</Card>

<Flex
    justify="flex-start"
    align="flex-start"
    direction="column"
>
    <Card withBorder w='100%' p={5}>
        <Group p={0} gap='sm'>
            <ThemeIcon variant="light" radius="md" size="60" color="indigo">
                <MdOutlineMiscellaneousServices style={{ width: '70%', height: '70%' }} />
            </ThemeIcon>
            <Flex direction='column'>
                <Text size="md" fw={500} fz='h6' c='gray'>
                    Estimated Spares Cost ($)
                </Text>
                <Text size="md" fw={600} fz='h3' >
                    44
                </Text>
            </Flex>
        </Group>
    </Card>
    <Space h='sm' />
    <Card w='100%' withBorder radius={10}>
        <Flex gap="lg" direction="column">
            <Title order={5}>Spare Cost ($)</Title>
            <AreaChart
                h={250}
                data={[
                    {
                        date: "Min",
                        Cost: 100,
                    },
                    {
                        date: "Estimated",
                        Cost: 800,
                    },
                    {
                        date: "Max",
                        Cost: 1000,
                    },
                ]}
                dataKey="date"
                series={[{ name: "Cost", color: "indigo.6" }]}
                curveType="natural"
                connectNulls
            />
        </Flex>
    </Card>
</Flex>

</SimpleGrid> */}
