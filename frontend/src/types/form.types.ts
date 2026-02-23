export interface FormData {
  firstName: string;
  lastName: string;
  role: string[];
  role_other_text: string;
  respondent_name: string;
  email: string;
  country: string;
  region: string;
  town: string;
  date_of_report: string;
  longitude: number | null;
  latitude: number | null;
  altitude: number | null;
  dry_wet_condition: string;
  experience_years: string;
  times_seen_like_this: string;
  when_was_it_once: string;
  when_most_recently_twice: string;
  when_other_text: string;
  normal_or_wet_conditions: string[];
  crop_production_effects: string[];
  crop_production_other_text: string;
  crop_conditions: string;
  planting_status: string;
  harvest_status: string;
  livestock_production_effects: string[];
  livestock_production_other_text: string;
  range_conditions: string;
  public_health_effects: string[];
  public_health_other_text: string;
  household_effects: string[];
  household_other_text: string;
  business_industry_effects: string[];
  business_industry_other_text: string;
  forest_effects: string[];
  forest_other_text: string;
  affected_area: string;
  crop_damage: string;
  livestock_losses: string;
  water_availability: string;
  drought_severity: string;
  response_actions: string;
  additional_info: string;
}

export interface LocationData {
  regions: string[];
  towns: Record<string, string[]>;
}

export const droughtSeverityOptions = [
  { value: "mild", label: "Mild" },
  { value: "moderate", label: "Moderate" },
  { value: "severe", label: "Severe" },
  { value: "extreme", label: "Extreme" },
] as const;

export type DroughtSeverity = (typeof droughtSeverityOptions)[number]["value"];
