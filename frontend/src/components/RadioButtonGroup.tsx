import React from "react";
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
  Typography,
  Box,
} from "@mui/material";

export interface RadioOption {
  value: string;
  label: string;
}

interface RadioButtonGroupProps {
  label: string;
  name: string;
  value: string;
  options: RadioOption[];
  onChange: (value: string) => void;
  required?: boolean;
  helperText?: string;
  error?: boolean;
  row?: boolean;
}

const RadioButtonGroup: React.FC<RadioButtonGroupProps> = ({
  label,
  name,
  value,
  options,
  onChange,
  required = false,
  helperText,
  error = false,
  row = true,
}) => {
  return (
    <FormControl
      component="fieldset"
      required={required}
      error={error}
      fullWidth
    >
      <FormLabel
        component="legend"
        sx={{
          mb: { xs: 1.5, sm: 1 },
          fontSize: { xs: "0.9rem", sm: "1rem" },
          fontWeight: 500,
          lineHeight: 1.4,
        }}
      >
        {label}
      </FormLabel>
      <RadioGroup
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        row={row}
        sx={{
          gap: { xs: 0.5, sm: 0 },
          "& .MuiFormControlLabel-root": {
            marginRight: { xs: 1, sm: 3 },
            marginBottom: { xs: 0.75, sm: 0.5 },
            marginLeft: 0,
            // Better touch targets on mobile
            minHeight: { xs: 44, sm: "auto" },
            borderRadius: 1,
            px: { xs: 0.5, sm: 0 },
            "&:active": {
              backgroundColor: "rgba(33, 77, 36, 0.04)",
            },
          },
        }}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={
              <Radio
                sx={{
                  "& .MuiSvgIcon-root": {
                    fontSize: { xs: "1.4rem", sm: "1.5rem" },
                  },
                  padding: { xs: "10px", sm: "9px" },
                }}
              />
            }
            label={
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: "0.875rem", sm: "0.95rem" },
                  lineHeight: 1.4,
                }}
              >
                {option.label}
              </Typography>
            }
            sx={{
              alignItems: "flex-start",
              "& .MuiFormControlLabel-label": {
                marginLeft: { xs: 0.5, sm: 0.75 },
                paddingTop: { xs: "10px", sm: "9px" },
              },
            }}
          />
        ))}
      </RadioGroup>
      {helperText && (
        <FormHelperText
          sx={{
            fontSize: { xs: "0.75rem", sm: "0.8rem" },
            mt: 1,
          }}
        >
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default RadioButtonGroup;
