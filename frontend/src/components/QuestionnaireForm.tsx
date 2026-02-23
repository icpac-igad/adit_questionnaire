import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Paper,
  Chip,
  SelectChangeEvent,
  LinearProgress,
  IconButton,
  Fade,
  Divider,
} from "@mui/material";
import {
  WaterDrop,
  Thermostat,
  Agriculture,
  LocalHospital,
  Home,
  Business,
  Forest,
  Person,
  LocationOn,
  Send,
  Warning,
  CheckCircle,
  Info,
  Grass,
  ArrowBack,
  ArrowForward,
  Check,
  Edit,
} from "@mui/icons-material";
import { FormData } from "../types/form.types";
import MapComponent from "./Map";

interface Country {
  id: number;
  code: string;
  name: string;
}

interface Region {
  id: number;
  code: string;
  name: string;
  name_local?: string;
}

interface City {
  id: number;
  code: string;
  name: string;
  name_local?: string;
}

// Step definitions
const STEPS = [
  { id: 1, title: "About You", icon: Person, description: "Your information" },
  { id: 2, title: "Location", icon: LocationOn, description: "Area being reported" },
  { id: 3, title: "Conditions", icon: Thermostat, description: "Current situation" },
  { id: 4, title: "Impacts", icon: Agriculture, description: "Effects observed" },
  { id: 5, title: "Review", icon: CheckCircle, description: "Confirm & submit" },
];

// CAP Alert Severity Colors
const severityColors = {
  extreme: { bg: "#7f1d1d", text: "#fff", border: "#dc2626", light: "#fef2f2" },
  severe: { bg: "#dc2626", text: "#fff", border: "#ef4444", light: "#fef2f2" },
  moderate: { bg: "#f59e0b", text: "#000", border: "#fbbf24", light: "#fffbeb" },
  minor: { bg: "#fef3c7", text: "#92400e", border: "#f59e0b", light: "#fffbeb" },
  normal: { bg: "#d1fae5", text: "#065f46", border: "#10b981", light: "#ecfdf5" },
  wet: { bg: "#dbeafe", text: "#1e40af", border: "#3b82f6", light: "#eff6ff" },
};

// Drought condition options with full descriptions
const dryWetConditionOptions = [
  {
    value: "severely_dry",
    label: "Severely Dry",
    severity: "extreme",
    icon: "🔥",
    description: "No soil moisture. Ponds, lakes, streams and wells may be nearly empty or dry. Mandatory water restrictions may be in place.",
  },
  {
    value: "moderately_dry",
    label: "Moderately Dry",
    severity: "severe",
    icon: "☀️",
    description: "Plants may be brown. Streams, reservoirs or well water levels may be low. Voluntary water use restrictions may be in place.",
  },
  {
    value: "mildly_dry",
    label: "Mildly Dry",
    severity: "moderate",
    icon: "🌤️",
    description: "Growth may have slowed for plants, crops or pastures. Soil is somewhat dry. Recovery may not be complete.",
  },
  {
    value: "near_normal",
    label: "Near Normal",
    severity: "normal",
    icon: "✓",
    description: "What you're seeing is what you expect for this time of year.",
  },
  {
    value: "mildly_wet",
    label: "Mildly Wet",
    severity: "wet",
    icon: "💧",
    description: "Local plants, crops or pastures are healthy, recovering from dry conditions. Soil moisture is above normal.",
  },
  {
    value: "moderately_wet",
    label: "Moderately Wet",
    severity: "wet",
    icon: "🌧️",
    description: "Plants are healthy and lush. Soil is very damp and the ground may be saturated. Standing water in low areas.",
  },
  {
    value: "severely_wet",
    label: "Severely Wet",
    severity: "wet",
    icon: "🌊",
    description: "Water levels well above normal. Standing water covers some areas that are normally dry. There may be flooding.",
  },
];

const formatDateDDMMYYYY = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const convertDateToISO = (dateString: string): string => {
  const [day, month, year] = dateString.split("-");
  return `${year}-${month}-${day}`;
};

// Generate year options for the past 20 years
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= currentYear - 20; i--) {
    years.push(i.toString());
  }
  return years;
};

// All original data arrays
const roleOptions = [
  "Farmer or livestock producer",
  "Water supplier",
  "Homeowner",
  "Natural or water resources professional",
  "Field worker",
  "Climate or weather professional",
  "Outdoor enthusiast",
  "Student or researcher",
  "Other",
];

const normalOrWetConditionsOptions = [
  "Normal conditions for this time of year",
  "More green than usual for this time of year",
  "More standing or flowing water than usual",
  "Increased moisture or humidity",
  "Groundwater wells above normal static level",
  "Soil moisture is adequate to good",
  "Non-irrigated crops or pastures are doing well",
  "Lawn and garden watering is not necessary",
  "Low fire danger",
  "Abundant insects or water-loving wildlife",
  "Fisheries in good condition",
];

const cropProductionEffectsOptions = [
  "Less water for irrigation",
  "Reduced yield",
  "Insect infestation",
  "Crop disease",
  "Plant stress",
  "Added well, dam, pipe, etc.",
  "Increased irrigation",
  "Erosion",
  "Less water in ponds, creeks, etc.",
  "Other",
];

const livestockProductionEffectsOptions = [
  "Reduced pasture, forage",
  "Feeding hay early",
  "Supplemental feed",
  "Purchased hay",
  "More invasive species (plants)",
  "Decreased stock weights",
  "Animal stress",
  "Mortality",
  "Reduced grazing on public lands",
  "Less water in ponds, creeks, etc.",
  "Hauled water",
  "Sold livestock",
  "Erosion",
  "Other",
];

const publicHealthEffectsOptions = [
  "Air quality, dust, pollen",
  "More vector-borne disease",
  "Special meetings or activities held",
  "Ceremonies or festivals cancelled",
  "Less food for subsistence",
  "Garden needs more water or yields less",
  "People relocating",
  "Stress",
  "Increased algal blooms",
  "Other",
];

const householdEffectsOptions = [
  "Reduced outdoor water use",
  "Reduced indoor water use",
  "Increased lawn, landscape watering",
  "Dry lawn",
  "Cracked foundation",
  "Increased power bill",
  "Increased use of cistern, rainwater",
  "Low or dry well",
  "Install graywater system",
  "Change landscaping",
  "Other",
];

const businessIndustryEffectsOptions = [
  "Landscaping business down",
  "Lawn implement sales down",
  "Barge traffic curtailed",
  "Reduced sales",
  "Reduced production due to lack of water",
  "Reduced workforce",
  "Closed business or bankruptcy",
  "More golf course irrigation",
  "Other",
];

const forestEffectsOptions = [
  "Change in timing of plant growth",
  "No new season growth (no new buds)",
  "Leaves discolored, shriveled, burnt",
  "Dead branch tips and/or dead top",
  "Leaf drop or sparse canopy",
  "Needle drop or sparse canopy",
  "Excessive cone production",
  "Dead trees",
  "Fewer saplings or reduced survival",
  "Reduced diameter growth",
  "Change in fruit, nut, berry production",
  "More pests, diseases",
  "More invasive species",
  "Other",
];

const cropConditionOptions = [
  { value: "very_poor", label: "Very Poor" },
  { value: "poor", label: "Poor" },
  { value: "fair", label: "Fair" },
  { value: "good", label: "Good" },
  { value: "excellent", label: "Excellent" },
];

const rangeConditionOptions = [
  { value: "very_poor", label: "Very Poor" },
  { value: "poor", label: "Poor" },
  { value: "fair", label: "Fair" },
  { value: "good", label: "Good" },
  { value: "excellent", label: "Excellent" },
];

interface QuestionnaireFormProps {
  onSubmissionSuccess?: () => void;
}

const QuestionnaireForm: React.FC<QuestionnaireFormProps> = ({ onSubmissionSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    role: [],
    role_other_text: "",
    respondent_name: "",
    email: "",
    country: "",
    region: "",
    town: "",
    date_of_report: formatDateDDMMYYYY(new Date()),
    longitude: null,
    latitude: null,
    altitude: null,
    dry_wet_condition: "",
    experience_years: "",
    times_seen_like_this: "",
    when_was_it_once: "",
    when_most_recently_twice: "",
    when_other_text: "",
    normal_or_wet_conditions: [],
    crop_production_effects: [],
    crop_production_other_text: "",
    crop_conditions: "",
    planting_status: "",
    harvest_status: "",
    livestock_production_effects: [],
    livestock_production_other_text: "",
    range_conditions: "",
    public_health_effects: [],
    public_health_other_text: "",
    household_effects: [],
    household_other_text: "",
    business_industry_effects: [],
    business_industry_other_text: "",
    forest_effects: [],
    forest_other_text: "",
    affected_area: "",
    crop_damage: "",
    livestock_losses: "",
    water_availability: "",
    drought_severity: "",
    response_actions: "",
    additional_info: "",
  });

  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [towns, setTowns] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [error, setError] = useState("");
  const [stepErrors, setStepErrors] = useState<string[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const countriesLoadedRef = useRef(false);

  // Geolocation with reverse geocoding
  useEffect(() => {
    if ("geolocation" in navigator) {
      setDetectingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { longitude, latitude, altitude } = position.coords;
          setFormData((prev) => ({
            ...prev,
            longitude,
            latitude,
            altitude: altitude || null,
          }));

          // Reverse geocode using Nominatim (OpenStreetMap)
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
              { headers: { "Accept-Language": "en" } }
            );
            const data = await response.json();

            if (data && data.address) {
              const detectedCountry = data.address.country;
              const detectedRegion = data.address.state || data.address.county || data.address.region;
              const detectedTown = data.address.city || data.address.town || data.address.village || data.address.suburb;

              // Store detected location for auto-population
              setFormData((prev) => ({
                ...prev,
                _detectedCountry: detectedCountry,
                _detectedRegion: detectedRegion,
                _detectedTown: detectedTown,
              } as any));

              setLocationDetected(true);
            }
          } catch (err) {
            console.error("Reverse geocoding failed:", err);
          }
          setDetectingLocation(false);
        },
        () => {
          setDetectingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoadingLocations(true);
        const response = await fetch("/api/locations/countries");
        const data = await response.json();
        if (data.success) setCountries(data.data);
      } catch (err) {
        console.error("Error fetching countries:", err);
      } finally {
        setLoadingLocations(false);
      }
    };
    fetchCountries();
  }, []);

  // Scroll to top when step changes
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCountryChange = async (e: SelectChangeEvent<string>) => {
    const countryCode = e.target.value;
    const selectedCountry = countries.find((c) => c.code === countryCode);
    setFormData({ ...formData, country: selectedCountry?.name || countryCode, region: "", town: "" });
    setRegions([]);
    setTowns([]);

    if (countryCode) {
      try {
        setLoadingLocations(true);
        const response = await fetch(`/api/locations/countries/${countryCode}/regions`);
        const data = await response.json();
        if (data.success) setRegions(data.data);
      } catch (err) {
        console.error("Error fetching regions:", err);
      } finally {
        setLoadingLocations(false);
      }
    }
  };

  const handleRegionChange = async (e: SelectChangeEvent<string>) => {
    const regionCode = e.target.value;
    const selectedRegion = regions.find((r) => r.code === regionCode);
    setFormData({ ...formData, region: selectedRegion?.name || regionCode, town: "" });
    setTowns([]);

    const countryCode = countries.find((c) => c.name === formData.country)?.code;
    if (regionCode && countryCode) {
      try {
        setLoadingLocations(true);
        const response = await fetch(`/api/locations/countries/${countryCode}/regions/${regionCode}/cities`);
        const data = await response.json();
        if (data.success) setTowns(data.data);
      } catch (err) {
        console.error("Error fetching cities:", err);
      } finally {
        setLoadingLocations(false);
      }
    }
  };

  const toggleArrayValue = (field: keyof FormData, value: string) => {
    const current = formData[field] as string[];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setFormData({ ...formData, [field]: updated });
  };

  // Auto-populate location from GPS detection
  const autoPopulateLocation = async () => {
    const detected = formData as any;
    if (!detected._detectedCountry || countries.length === 0) return;

    setLoadingLocations(true);

    try {
      // Find matching country
      const matchedCountry = countries.find(
        (c) => c.name.toLowerCase() === detected._detectedCountry?.toLowerCase()
      );

      if (matchedCountry) {
        // Fetch regions for this country
        const regionsResponse = await fetch(`/api/locations/countries/${matchedCountry.code}/regions`);
        const regionsData = await regionsResponse.json();

        if (regionsData.success) {
          setRegions(regionsData.data);

          // Find matching region
          const matchedRegion = regionsData.data.find(
            (r: Region) =>
              r.name.toLowerCase() === detected._detectedRegion?.toLowerCase() ||
              (r.name_local && r.name_local.toLowerCase() === detected._detectedRegion?.toLowerCase())
          );

          if (matchedRegion) {
            // Fetch towns for this region
            const townsResponse = await fetch(
              `/api/locations/countries/${matchedCountry.code}/regions/${matchedRegion.code}/cities`
            );
            const townsData = await townsResponse.json();

            if (townsData.success) {
              setTowns(townsData.data);

              // Find matching town
              const matchedTown = townsData.data.find(
                (t: City) =>
                  t.name.toLowerCase() === detected._detectedTown?.toLowerCase() ||
                  (t.name_local && t.name_local.toLowerCase() === detected._detectedTown?.toLowerCase())
              );

              setFormData((prev) => ({
                ...prev,
                country: matchedCountry.name,
                region: matchedRegion.name,
                town: matchedTown?.name || "",
              }));
            }
          } else {
            setFormData((prev) => ({
              ...prev,
              country: matchedCountry.name,
            }));
          }
        }
      }
    } catch (err) {
      console.error("Error auto-populating location:", err);
    } finally {
      setLoadingLocations(false);
    }
  };

  // Validation for each step
  const validateStep = (step: number): string[] => {
    const errors: string[] = [];
    switch (step) {
      case 1:
        if (!formData.firstName.trim()) errors.push("First name is required");
        if (!formData.lastName.trim()) errors.push("Last name is required");
        if (!formData.email.trim()) errors.push("Email is required");
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.push("Valid email is required");
        break;
      case 2:
        if (!formData.country) errors.push("Country is required");
        if (!formData.region) errors.push("Region is required");
        if (!formData.town) errors.push("Town/City is required");
        break;
      case 3:
        if (!formData.dry_wet_condition) errors.push("Please select current conditions");
        if (!formData.experience_years) errors.push("Please select your experience level");
        if (!formData.times_seen_like_this) errors.push("Please indicate how often you've seen this");
        if (formData.times_seen_like_this === "once" && !formData.when_was_it_once) {
          errors.push("Please select when it was like this before");
        }
        if (formData.times_seen_like_this === "twice_or_more" && !formData.when_most_recently_twice) {
          errors.push("Please select when it was most recently like this");
        }
        if (formData.times_seen_like_this === "other" && !formData.when_other_text) {
          errors.push("Please describe when this occurred");
        }
        break;
      case 4:
        if (!formData.crop_conditions) errors.push("Crop conditions are required");
        if (!formData.range_conditions) errors.push("Range/pasture conditions are required");
        break;
    }
    return errors;
  };

  const nextStep = () => {
    const errors = validateStep(currentStep);
    if (errors.length > 0) {
      setStepErrors(errors);
      return;
    }
    setStepErrors([]);
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const prevStep = () => {
    setStepErrors([]);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const goToStep = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
      const dataToSend = {
        ...formData,
        respondent_name: fullName,
        date_of_report: convertDateToISO(formData.date_of_report),
      };
      // Remove fields not needed by backend
      delete (dataToSend as any).firstName;
      delete (dataToSend as any).lastName;
      delete (dataToSend as any)._detectedCountry;
      delete (dataToSend as any)._detectedRegion;
      delete (dataToSend as any)._detectedTown;

      const response = await fetch("/api/responses/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Submission failed");
      }

      if (onSubmissionSuccess) onSubmissionSuccess();
    } catch (err) {
      setError("Failed to submit. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get severity info for selected condition
  const selectedCondition = dryWetConditionOptions.find(
    (opt) => opt.value === formData.dry_wet_condition
  );
  const severityInfo = selectedCondition
    ? severityColors[selectedCondition.severity as keyof typeof severityColors]
    : null;

  // Progress percentage
  const progress = (currentStep / STEPS.length) * 100;

  // Check if dry condition is selected
  const isDryCondition = formData.dry_wet_condition && formData.dry_wet_condition.includes("dry");

  // Checkbox group component
  const CheckboxGroup = ({
    options,
    selected,
    field,
    otherField,
    otherText,
  }: {
    options: string[];
    selected: string[];
    field: keyof FormData;
    otherField?: keyof FormData;
    otherText?: string;
  }) => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
      {options.map((option) => (
        <FormControlLabel
          key={option}
          control={
            <Checkbox
              checked={selected.includes(option)}
              onChange={() => toggleArrayValue(field, option)}
              size="small"
            />
          }
          label={<Typography sx={{ fontSize: "0.85rem" }}>{option}</Typography>}
          sx={{
            m: 0,
            py: 0.5,
            px: 1,
            borderRadius: 1,
            "&:hover": { bgcolor: "#f8fafc" },
          }}
        />
      ))}
      {selected.includes("Other") && otherField && (
        <TextField
          size="small"
          placeholder="Please specify..."
          value={otherText || ""}
          onChange={(e) => setFormData({ ...formData, [otherField]: e.target.value })}
          sx={{ mt: 1, ml: 4 }}
        />
      )}
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: "#009997",
          color: "white",
          py: 1.5,
          px: 2,
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Logo */}
            <Box
              component="img"
              src="https://www.icpac.net/media/ICPAC_Logo_White.svg"
              alt="Logo"
              sx={{
                height: 36,
                width: "auto",
              }}
            />
            <Box sx={{ borderLeft: "1px solid rgba(255,255,255,0.3)", pl: 2, ml: 0.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", lineHeight: 1.2 }}>
                Drought Impact Reporter
              </Typography>
              <Typography sx={{ fontSize: "0.6rem", opacity: 0.85 }}>
                East Africa Drought Watch
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Progress Bar */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 4,
          bgcolor: "#e2e8f0",
          "& .MuiLinearProgress-bar": {
            bgcolor: currentStep === STEPS.length ? "#10b981" : "#009997",
          },
        }}
      />

      {/* Step Indicator */}
      <Box sx={{ bgcolor: "white", borderBottom: "1px solid #e2e8f0", py: 2 }}>
        <Container maxWidth="sm">
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {STEPS.map((step) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const isClickable = step.id < currentStep;

              return (
                <Box
                  key={step.id}
                  onClick={() => isClickable && goToStep(step.id)}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: isClickable ? "pointer" : "default",
                    opacity: isActive || isCompleted ? 1 : 0.4,
                    transition: "all 0.2s ease",
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: isCompleted ? "#10b981" : isActive ? "#009997" : "#e2e8f0",
                      color: isCompleted || isActive ? "white" : "#64748b",
                      transition: "all 0.3s ease",
                      transform: isActive ? "scale(1.1)" : "scale(1)",
                    }}
                  >
                    {isCompleted ? <Check sx={{ fontSize: 20 }} /> : <StepIcon sx={{ fontSize: 20 }} />}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "0.6rem",
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? "#009997" : "#64748b",
                      mt: 0.5,
                    }}
                  >
                    {step.title}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Box ref={contentRef} sx={{ flex: 1, py: 2, overflow: "auto" }}>
        <Container maxWidth="sm">
          {/* Step Title - Compact */}
          <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#0f172a" }}>
              {STEPS[currentStep - 1].title}
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", color: "#94a3b8" }}>
              — {STEPS[currentStep - 1].description}
            </Typography>
          </Box>

          {/* Error Messages */}
          {stepErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2, py: 0.5 }}>
              {stepErrors.map((err, i) => (
                <Typography key={i} sx={{ fontSize: "0.8rem" }}>• {err}</Typography>
              ))}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2, py: 0.5 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {/* Step Content */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: "1px solid #e2e8f0", bgcolor: "white" }}>
            {/* Step 1: About You */}
            {currentStep === 1 && (
              <Fade in={true} timeout={300}>
                <Box>
                  {/* Introduction */}
                  <Box
                    sx={{
                      mb: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <Typography sx={{ fontSize: "0.8rem", color: "#475569", lineHeight: 1.6 }}>
                      This form collects ground-level drought impact observations to support the development of drought bulletins for the <strong>East Africa Drought Watch</strong>. The information you provide helps inform early warning systems and regional response planning.
                    </Typography>
                    <Box
                      sx={{
                        mt: 1.5,
                        pt: 1.5,
                        borderTop: "1px solid #e2e8f0",
                        display: "flex",
                        gap: 3,
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontSize: "0.65rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Duration
                        </Typography>
                        <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#334155" }}>
                          3-5 minutes
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: "0.65rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Sections
                        </Typography>
                        <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#334155" }}>
                          5 steps
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Grid container spacing={1.5}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        type="email"
                        label="Email Address"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, mb: 1, color: "#374151" }}>
                        Your Role (select all that apply)
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                        {roleOptions.map((role) => (
                          <Chip
                            key={role}
                            label={role}
                            size="small"
                            onClick={() => toggleArrayValue("role", role)}
                            sx={{
                              borderRadius: "6px",
                              fontWeight: 500,
                              fontSize: "0.7rem",
                              bgcolor: formData.role.includes(role) ? "#009997" : "#f1f5f9",
                              color: formData.role.includes(role) ? "white" : "#475569",
                              "&:hover": {
                                bgcolor: formData.role.includes(role) ? "#007a78" : "#e2e8f0",
                              },
                            }}
                          />
                        ))}
                      </Box>
                      {formData.role.includes("Other") && (
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Please specify your role"
                          value={formData.role_other_text}
                          onChange={(e) => setFormData({ ...formData, role_other_text: e.target.value })}
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Grid>
                  </Grid>
                </Box>
              </Fade>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <Fade in={true} timeout={300}>
                <Box>
                  {/* Map */}
                  <Box sx={{ mb: 3 }}>
                    <MapComponent
                      selectedCountry={formData.country}
                      userLocation={
                        formData.latitude && formData.longitude
                          ? { latitude: formData.latitude, longitude: formData.longitude }
                          : null
                      }
                      onCountrySelect={(country) => {
                        handleCountryChange({ target: { value: country } } as SelectChangeEvent<string>);
                      }}
                    />
                  </Box>

                  {/* Auto-detect location button */}
                  {locationDetected && !formData.country && (
                    <Box
                      sx={{
                        mb: 3,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "#f0fdfa",
                        border: "1px solid #99f6e4",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <LocationOn sx={{ color: "#009997" }} />
                          <Box>
                            <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#0f766e" }}>
                              Location detected from GPS
                            </Typography>
                            <Typography sx={{ fontSize: "0.75rem", color: "#115e59" }}>
                              {(formData as any)._detectedTown && `${(formData as any)._detectedTown}, `}
                              {(formData as any)._detectedRegion && `${(formData as any)._detectedRegion}, `}
                              {(formData as any)._detectedCountry}
                            </Typography>
                          </Box>
                        </Box>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={autoPopulateLocation}
                          disabled={loadingLocations}
                          sx={{
                            bgcolor: "#009997",
                            "&:hover": { bgcolor: "#007a78" },
                            fontSize: "0.75rem",
                            px: 2,
                          }}
                        >
                          {loadingLocations ? "Loading..." : "Use This"}
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {detectingLocation && (
                    <Box
                      sx={{
                        mb: 3,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <CircularProgress size={20} sx={{ color: "#009997" }} />
                      <Typography sx={{ fontSize: "0.85rem", color: "#64748b" }}>
                        Detecting your location...
                      </Typography>
                    </Box>
                  )}

                  <Grid container spacing={1.5}>
                    <Grid item xs={12}>
                      <FormControl fullWidth required size="small">
                        <InputLabel>Country</InputLabel>
                        <Select
                          value={countries.find((c) => c.name === formData.country)?.code || ""}
                          onChange={handleCountryChange}
                          label="Country"
                          sx={{ borderRadius: 2 }}
                        >
                          {countries.map((c) => (
                            <MenuItem key={c.id} value={c.code}>{c.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth required size="small" disabled={!formData.country || loadingLocations}>
                        <InputLabel>Region/County</InputLabel>
                        <Select
                          value={regions.find((r) => r.name === formData.region)?.code || ""}
                          onChange={handleRegionChange}
                          label="Region/County"
                          sx={{ borderRadius: 2 }}
                        >
                          {regions.map((r) => (
                            <MenuItem key={r.id} value={r.code}>
                              {r.name_local && r.name_local !== "NA" ? r.name_local : r.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Town/City/Village"
                        name="town"
                        value={formData.town}
                        onChange={handleChange}
                        placeholder="Enter town, city, or village name"
                        required
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Fade>
            )}

            {/* Step 3: Conditions */}
            {currentStep === 3 && (
              <Fade in={true} timeout={300}>
                <Box>
                  {/* Condition Selection */}
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, mb: 1.5, color: "#374151" }}>
                    How would you describe conditions? *
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2.5 }}>
                    {dryWetConditionOptions.map((option) => {
                      const colors = severityColors[option.severity as keyof typeof severityColors];
                      const isSelected = formData.dry_wet_condition === option.value;

                      return (
                        <Box
                          key={option.value}
                          onClick={() => setFormData({ ...formData, dry_wet_condition: option.value })}
                          sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            border: "2px solid",
                            borderColor: isSelected ? colors.border : "#e2e8f0",
                            bgcolor: isSelected ? colors.light : "white",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            "&:hover": { borderColor: colors.border },
                          }}
                        >
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: "8px",
                              bgcolor: isSelected ? colors.bg : colors.light,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1rem",
                              flexShrink: 0,
                            }}
                          >
                            {option.icon}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: "0.8rem", color: "#0f172a" }}>
                              {option.label}
                            </Typography>
                            <Typography sx={{ fontSize: "0.7rem", color: "#64748b", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {option.description}
                            </Typography>
                          </Box>
                          {isSelected && <CheckCircle sx={{ color: colors.border, fontSize: 18 }} />}
                        </Box>
                      );
                    })}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Experience */}
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, mb: 1, color: "#374151" }}>
                    Your experience with conditions here? *
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 2 }}>
                    {[
                      { value: "less_than_5", label: "< 5 yrs" },
                      { value: "5_to_10", label: "5-10 yrs" },
                      { value: "10_to_20", label: "10-20 yrs" },
                      { value: "20_or_more", label: "20+ yrs" },
                    ].map((opt) => (
                      <Chip
                        key={opt.value}
                        label={opt.label}
                        size="small"
                        onClick={() => setFormData({ ...formData, experience_years: opt.value })}
                        sx={{
                          borderRadius: "6px",
                          fontWeight: 500,
                          fontSize: "0.75rem",
                          bgcolor: formData.experience_years === opt.value ? "#009997" : "#f1f5f9",
                          color: formData.experience_years === opt.value ? "white" : "#475569",
                        }}
                      />
                    ))}
                  </Box>

                  {/* Times Seen */}
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, mb: 1, color: "#374151" }}>
                    Times you've seen this? *
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.5 }}>
                    {[
                      { value: "never", label: "Never" },
                      { value: "once", label: "Once" },
                      { value: "twice_or_more", label: "2+ times" },
                      { value: "other", label: "Other" },
                    ].map((opt) => (
                      <Chip
                        key={opt.value}
                        label={opt.label}
                        size="small"
                        onClick={() => setFormData({
                          ...formData,
                          times_seen_like_this: opt.value,
                          when_was_it_once: "",
                          when_most_recently_twice: "",
                          when_other_text: "",
                        })}
                        sx={{
                          borderRadius: "6px",
                          fontWeight: 500,
                          fontSize: "0.75rem",
                          bgcolor: formData.times_seen_like_this === opt.value ? "#009997" : "#f1f5f9",
                          color: formData.times_seen_like_this === opt.value ? "white" : "#475569",
                        }}
                      />
                    ))}
                  </Box>

                  {/* Conditional: Once */}
                  {formData.times_seen_like_this === "once" && (
                    <FormControl fullWidth size="small" sx={{ mt: 1 }} required>
                      <InputLabel>When was it like this?</InputLabel>
                      <Select
                        value={formData.when_was_it_once}
                        onChange={(e) => setFormData({ ...formData, when_was_it_once: e.target.value })}
                        label="When was it like this?"
                        sx={{ borderRadius: 2 }}
                      >
                        {generateYearOptions().map((year) => (
                          <MenuItem key={year} value={year}>{year}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  {/* Conditional: Twice or more */}
                  {formData.times_seen_like_this === "twice_or_more" && (
                    <FormControl fullWidth size="small" sx={{ mt: 1 }} required>
                      <InputLabel>Most recent occurrence?</InputLabel>
                      <Select
                        value={formData.when_most_recently_twice}
                        onChange={(e) => setFormData({ ...formData, when_most_recently_twice: e.target.value })}
                        label="Most recent occurrence?"
                        sx={{ borderRadius: 2 }}
                      >
                        {generateYearOptions().map((year) => (
                          <MenuItem key={year} value={year}>{year}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  {/* Conditional: Other */}
                  {formData.times_seen_like_this === "other" && (
                    <TextField
                      fullWidth
                      size="small"
                      label="Describe when this occurred"
                      value={formData.when_other_text}
                      onChange={(e) => setFormData({ ...formData, when_other_text: e.target.value })}
                      sx={{ mt: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      required
                    />
                  )}

                  {/* Normal/Wet Conditions - show if not dry */}
                  {formData.dry_wet_condition && !isDryCondition && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, mb: 1, color: "#374151" }}>
                        <WaterDrop sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }} />
                        Normal/Wet Conditions Observed
                      </Typography>
                      <CheckboxGroup
                        options={normalOrWetConditionsOptions}
                        selected={formData.normal_or_wet_conditions}
                        field="normal_or_wet_conditions"
                      />
                    </>
                  )}
                </Box>
              </Fade>
            )}

            {/* Step 4: Impacts */}
            {currentStep === 4 && (
              <Fade in={true} timeout={300}>
                <Box>
                  {/* Crop Production */}
                  <Box sx={{ mb: 2.5 }}>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, mb: 1, color: "#374151", display: "flex", alignItems: "center", gap: 0.75 }}>
                      <Agriculture sx={{ fontSize: 16, color: "#059669" }} />
                      Crop Production Effects
                    </Typography>
                    <CheckboxGroup
                      options={cropProductionEffectsOptions}
                      selected={formData.crop_production_effects}
                      field="crop_production_effects"
                      otherField="crop_production_other_text"
                      otherText={formData.crop_production_other_text}
                    />
                    <Box sx={{ mt: 1.5 }}>
                      <Typography sx={{ fontSize: "0.75rem", fontWeight: 500, mb: 0.75 }}>
                        Crop conditions? *
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {cropConditionOptions.map((opt) => (
                          <Chip
                            key={opt.value}
                            label={opt.label}
                            size="small"
                            onClick={() => setFormData({ ...formData, crop_conditions: opt.value })}
                            sx={{
                              fontSize: "0.7rem",
                              bgcolor: formData.crop_conditions === opt.value ? "#059669" : "#f1f5f9",
                              color: formData.crop_conditions === opt.value ? "white" : "#475569",
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Livestock Production */}
                  <Box sx={{ mb: 2.5 }}>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, mb: 1, color: "#374151", display: "flex", alignItems: "center", gap: 0.75 }}>
                      <Grass sx={{ fontSize: 16, color: "#d97706" }} />
                      Livestock & Pasture Effects
                    </Typography>
                    <CheckboxGroup
                      options={livestockProductionEffectsOptions}
                      selected={formData.livestock_production_effects}
                      field="livestock_production_effects"
                      otherField="livestock_production_other_text"
                      otherText={formData.livestock_production_other_text}
                    />
                    <Box sx={{ mt: 1.5 }}>
                      <Typography sx={{ fontSize: "0.75rem", fontWeight: 500, mb: 0.75 }}>
                        Range/pasture conditions? *
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {rangeConditionOptions.map((opt) => (
                          <Chip
                            key={opt.value}
                            label={opt.label}
                            size="small"
                            onClick={() => setFormData({ ...formData, range_conditions: opt.value })}
                            sx={{
                              fontSize: "0.7rem",
                              bgcolor: formData.range_conditions === opt.value ? "#d97706" : "#f1f5f9",
                              color: formData.range_conditions === opt.value ? "white" : "#475569",
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Public Health */}
                  <Box sx={{ mb: 2.5 }}>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, mb: 1, color: "#374151", display: "flex", alignItems: "center", gap: 0.75 }}>
                      <LocalHospital sx={{ fontSize: 16, color: "#dc2626" }} />
                      Public & Community Health
                    </Typography>
                    <CheckboxGroup
                      options={publicHealthEffectsOptions}
                      selected={formData.public_health_effects}
                      field="public_health_effects"
                      otherField="public_health_other_text"
                      otherText={formData.public_health_other_text}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Household */}
                  <Box sx={{ mb: 2.5 }}>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, mb: 1, color: "#374151", display: "flex", alignItems: "center", gap: 0.75 }}>
                      <Home sx={{ fontSize: 16, color: "#7c3aed" }} />
                      Household Effects
                    </Typography>
                    <CheckboxGroup
                      options={householdEffectsOptions}
                      selected={formData.household_effects}
                      field="household_effects"
                      otherField="household_other_text"
                      otherText={formData.household_other_text}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Business */}
                  <Box sx={{ mb: 2.5 }}>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, mb: 1, color: "#374151", display: "flex", alignItems: "center", gap: 0.75 }}>
                      <Business sx={{ fontSize: 16, color: "#0891b2" }} />
                      Business & Industry
                    </Typography>
                    <CheckboxGroup
                      options={businessIndustryEffectsOptions}
                      selected={formData.business_industry_effects}
                      field="business_industry_effects"
                      otherField="business_industry_other_text"
                      otherText={formData.business_industry_other_text}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Forest */}
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, mb: 1, color: "#374151", display: "flex", alignItems: "center", gap: 0.75 }}>
                      <Forest sx={{ fontSize: 16, color: "#15803d" }} />
                      Forest & Environment
                    </Typography>
                    <CheckboxGroup
                      options={forestEffectsOptions}
                      selected={formData.forest_effects}
                      field="forest_effects"
                      otherField="forest_other_text"
                      otherText={formData.forest_other_text}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Additional Info */}
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    label="Additional comments (optional)"
                    name="additional_info"
                    value={formData.additional_info}
                    onChange={handleChange}
                    placeholder="Any other observations..."
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                </Box>
              </Fade>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <Fade in={true} timeout={300}>
                <Box>
                  {/* Condition Status Banner */}
                  {selectedCondition && (
                    <Box
                      sx={{
                        p: 2.5,
                        mb: 3,
                        borderRadius: 2,
                        bgcolor: severityInfo?.light || "#f8fafc",
                        border: `2px solid ${severityInfo?.border || "#e2e8f0"}`,
                        textAlign: "center",
                      }}
                    >
                      <Typography sx={{ fontSize: "2rem", mb: 1 }}>{selectedCondition.icon}</Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#0f172a", mb: 0.5 }}>
                        {selectedCondition.label}
                      </Typography>
                      <Typography sx={{ fontSize: "0.8rem", color: "#64748b" }}>
                        {selectedCondition.description}
                      </Typography>
                    </Box>
                  )}

                  {/* Summary Sections */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

                    {/* Location Card */}
                    <Box
                      sx={{
                        borderRadius: 2,
                        border: "1px solid #e2e8f0",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          px: 2,
                          py: 1.5,
                          bgcolor: "#f8fafc",
                          borderBottom: "1px solid #e2e8f0",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <LocationOn sx={{ fontSize: 18, color: "#009997" }} />
                          <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#0f172a" }}>
                            Location
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          onClick={() => goToStep(2)}
                          sx={{ minWidth: "auto", color: "#009997", fontSize: "0.75rem" }}
                        >
                          Edit
                        </Button>
                      </Box>
                      <Box sx={{ p: 2, bgcolor: "white" }}>
                        <Typography sx={{ fontSize: "0.95rem", fontWeight: 500, color: "#0f172a" }}>
                          {formData.town}, {formData.region}
                        </Typography>
                        <Typography sx={{ fontSize: "0.8rem", color: "#64748b" }}>
                          {formData.country}
                        </Typography>
                        {formData.latitude && formData.longitude && (
                          <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", mt: 0.5 }}>
                            GPS: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Experience Card */}
                    <Box
                      sx={{
                        borderRadius: 2,
                        border: "1px solid #e2e8f0",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          px: 2,
                          py: 1.5,
                          bgcolor: "#f8fafc",
                          borderBottom: "1px solid #e2e8f0",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Thermostat sx={{ fontSize: 18, color: "#009997" }} />
                          <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#0f172a" }}>
                            Experience & History
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          onClick={() => goToStep(3)}
                          sx={{ minWidth: "auto", color: "#009997", fontSize: "0.75rem" }}
                        >
                          Edit
                        </Button>
                      </Box>
                      <Box sx={{ p: 2, bgcolor: "white" }}>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                              Experience
                            </Typography>
                            <Typography sx={{ fontSize: "0.85rem", fontWeight: 500, color: "#0f172a" }}>
                              {formData.experience_years === "less_than_5" && "< 5 years"}
                              {formData.experience_years === "5_to_10" && "5-10 years"}
                              {formData.experience_years === "10_to_20" && "10-20 years"}
                              {formData.experience_years === "20_or_more" && "20+ years"}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                              Times Seen
                            </Typography>
                            <Typography sx={{ fontSize: "0.85rem", fontWeight: 500, color: "#0f172a" }}>
                              {formData.times_seen_like_this === "never" && "Never"}
                              {formData.times_seen_like_this === "once" && `Once (${formData.when_was_it_once})`}
                              {formData.times_seen_like_this === "twice_or_more" && `2+ times (last: ${formData.when_most_recently_twice})`}
                              {formData.times_seen_like_this === "other" && formData.when_other_text}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>

                    {/* Crop & Pasture Conditions */}
                    <Box
                      sx={{
                        borderRadius: 2,
                        border: "1px solid #e2e8f0",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          px: 2,
                          py: 1.5,
                          bgcolor: "#f8fafc",
                          borderBottom: "1px solid #e2e8f0",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Agriculture sx={{ fontSize: 18, color: "#009997" }} />
                          <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#0f172a" }}>
                            Crop & Pasture Conditions
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          onClick={() => goToStep(4)}
                          sx={{ minWidth: "auto", color: "#009997", fontSize: "0.75rem" }}
                        >
                          Edit
                        </Button>
                      </Box>
                      <Box sx={{ p: 2, bgcolor: "white" }}>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                              Crops
                            </Typography>
                            <Chip
                              label={formData.crop_conditions ? formData.crop_conditions.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()) : "Not specified"}
                              size="small"
                              sx={{
                                mt: 0.5,
                                bgcolor: formData.crop_conditions ? "#d1fae5" : "#f1f5f9",
                                color: formData.crop_conditions ? "#065f46" : "#64748b",
                                fontWeight: 500,
                                fontSize: "0.75rem",
                              }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                              Range/Pasture
                            </Typography>
                            <Chip
                              label={formData.range_conditions ? formData.range_conditions.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()) : "Not specified"}
                              size="small"
                              sx={{
                                mt: 0.5,
                                bgcolor: formData.range_conditions ? "#fef3c7" : "#f1f5f9",
                                color: formData.range_conditions ? "#92400e" : "#64748b",
                                fontWeight: 500,
                                fontSize: "0.75rem",
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>

                    {/* Impacts Summary */}
                    {(formData.crop_production_effects.length > 0 ||
                      formData.livestock_production_effects.length > 0 ||
                      formData.public_health_effects.length > 0 ||
                      formData.household_effects.length > 0 ||
                      formData.business_industry_effects.length > 0 ||
                      formData.forest_effects.length > 0) && (
                      <Box
                        sx={{
                          borderRadius: 2,
                          border: "1px solid #e2e8f0",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            px: 2,
                            py: 1.5,
                            bgcolor: "#f8fafc",
                            borderBottom: "1px solid #e2e8f0",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Warning sx={{ fontSize: 18, color: "#f59e0b" }} />
                            <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#0f172a" }}>
                              Reported Impacts
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            onClick={() => goToStep(4)}
                            sx={{ minWidth: "auto", color: "#009997", fontSize: "0.75rem" }}
                          >
                            Edit
                          </Button>
                        </Box>
                        <Box sx={{ p: 2, bgcolor: "white" }}>
                          {formData.crop_production_effects.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography sx={{ fontSize: "0.7rem", color: "#059669", fontWeight: 600, mb: 0.5 }}>
                                Crop Production ({formData.crop_production_effects.length})
                              </Typography>
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {formData.crop_production_effects.map((effect, i) => (
                                  <Chip key={i} label={effect} size="small" sx={{ fontSize: "0.7rem", bgcolor: "#ecfdf5", color: "#065f46" }} />
                                ))}
                              </Box>
                            </Box>
                          )}
                          {formData.livestock_production_effects.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography sx={{ fontSize: "0.7rem", color: "#d97706", fontWeight: 600, mb: 0.5 }}>
                                Livestock & Pasture ({formData.livestock_production_effects.length})
                              </Typography>
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {formData.livestock_production_effects.map((effect, i) => (
                                  <Chip key={i} label={effect} size="small" sx={{ fontSize: "0.7rem", bgcolor: "#fffbeb", color: "#92400e" }} />
                                ))}
                              </Box>
                            </Box>
                          )}
                          {formData.public_health_effects.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography sx={{ fontSize: "0.7rem", color: "#dc2626", fontWeight: 600, mb: 0.5 }}>
                                Public Health ({formData.public_health_effects.length})
                              </Typography>
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {formData.public_health_effects.map((effect, i) => (
                                  <Chip key={i} label={effect} size="small" sx={{ fontSize: "0.7rem", bgcolor: "#fef2f2", color: "#991b1b" }} />
                                ))}
                              </Box>
                            </Box>
                          )}
                          {formData.household_effects.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography sx={{ fontSize: "0.7rem", color: "#7c3aed", fontWeight: 600, mb: 0.5 }}>
                                Household ({formData.household_effects.length})
                              </Typography>
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {formData.household_effects.map((effect, i) => (
                                  <Chip key={i} label={effect} size="small" sx={{ fontSize: "0.7rem", bgcolor: "#f5f3ff", color: "#5b21b6" }} />
                                ))}
                              </Box>
                            </Box>
                          )}
                          {formData.business_industry_effects.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography sx={{ fontSize: "0.7rem", color: "#0891b2", fontWeight: 600, mb: 0.5 }}>
                                Business & Industry ({formData.business_industry_effects.length})
                              </Typography>
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {formData.business_industry_effects.map((effect, i) => (
                                  <Chip key={i} label={effect} size="small" sx={{ fontSize: "0.7rem", bgcolor: "#ecfeff", color: "#0e7490" }} />
                                ))}
                              </Box>
                            </Box>
                          )}
                          {formData.forest_effects.length > 0 && (
                            <Box>
                              <Typography sx={{ fontSize: "0.7rem", color: "#15803d", fontWeight: 600, mb: 0.5 }}>
                                Forest & Environment ({formData.forest_effects.length})
                              </Typography>
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {formData.forest_effects.map((effect, i) => (
                                  <Chip key={i} label={effect} size="small" sx={{ fontSize: "0.7rem", bgcolor: "#f0fdf4", color: "#166534" }} />
                                ))}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    )}

                    {/* Additional Comments */}
                    {formData.additional_info && (
                      <Box
                        sx={{
                          borderRadius: 2,
                          border: "1px solid #e2e8f0",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            px: 2,
                            py: 1.5,
                            bgcolor: "#f8fafc",
                            borderBottom: "1px solid #e2e8f0",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Info sx={{ fontSize: 18, color: "#009997" }} />
                            <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#0f172a" }}>
                              Additional Comments
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ p: 2, bgcolor: "white" }}>
                          <Typography sx={{ fontSize: "0.85rem", color: "#475569", fontStyle: "italic" }}>
                            "{formData.additional_info}"
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {/* Consent */}
                  <Box sx={{ mt: 3, p: 2, bgcolor: "#f0fdfa", borderRadius: 2, border: "1px solid #99f6e4" }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                      <CheckCircle sx={{ fontSize: 18, color: "#009997", mt: 0.2 }} />
                      <Typography sx={{ fontSize: "0.8rem", color: "#0f766e" }}>
                        By submitting this report, you confirm that the information provided is accurate to the best of your knowledge and will be used to support drought monitoring efforts in the region.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Fade>
            )}
          </Paper>
        </Container>
      </Box>

      {/* Bottom Navigation */}
      <Box sx={{ bgcolor: "white", borderTop: "1px solid #e2e8f0", p: 2, position: "sticky", bottom: 0 }}>
        <Container maxWidth="sm">
          <Box sx={{ display: "flex", gap: 2 }}>
            {currentStep > 1 && (
              <Button
                variant="outlined"
                onClick={prevStep}
                startIcon={<ArrowBack />}
                sx={{
                  flex: 1,
                  py: 1.5,
                  borderRadius: 2,
                  borderColor: "#e2e8f0",
                  color: "#64748b",
                  "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
                }}
              >
                Back
              </Button>
            )}

            {currentStep < STEPS.length ? (
              <Button
                variant="contained"
                onClick={nextStep}
                endIcon={<ArrowForward />}
                sx={{
                  flex: currentStep === 1 ? 1 : 2,
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: "#009997",
                  "&:hover": { bgcolor: "#007a78" },
                }}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                sx={{
                  flex: 2,
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: "#059669",
                  "&:hover": { bgcolor: "#047857" },
                }}
              >
                {loading ? "Submitting..." : "Submit Report"}
              </Button>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default QuestionnaireForm;
