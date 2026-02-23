import React, { useState } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import QuestionnaireForm from "./components/QuestionnaireForm";
import ThankYou from "./components/ThankYou";

// ICPAC Branded Theme - Teal primary with professional styling
const theme = createTheme({
  palette: {
    primary: {
      main: "#009997", // ICPAC Teal
      dark: "#007a78",
      light: "#00b3b0",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#1a365d", // Deep navy for contrast
      dark: "#0f2442",
      light: "#2a4a7f",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#f59e0b", // Amber - moderate conditions
      light: "#fbbf24",
      dark: "#d97706",
    },
    success: {
      main: "#10b981", // Green - normal/wet conditions
      light: "#34d399",
      dark: "#059669",
    },
    error: {
      main: "#dc2626", // Severe drought
      light: "#ef4444",
      dark: "#b91c1c",
    },
    info: {
      main: "#0891b2", // Cyan - complements teal
      light: "#22d3ee",
      dark: "#0e7490",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#1a365d",
      secondary: "#64748b",
    },
    grey: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.5rem",
      letterSpacing: "-0.01em",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.25rem",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1rem",
    },
    body1: {
      fontSize: "0.95rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
    },
    caption: {
      fontSize: "0.75rem",
      color: "#64748b",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#fafafa",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 10,
          padding: "12px 24px",
          fontSize: "0.95rem",
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            backgroundColor: "#fff",
            "& fieldset": {
              borderColor: "#e2e8f0",
            },
            "&:hover fieldset": {
              borderColor: "#cbd5e1",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#009997",
              borderWidth: 1.5,
            },
          },
          "& .MuiInputBase-input": {
            fontSize: "16px",
            padding: "14px 16px",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          fontSize: "16px",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: "#fff",
          "& fieldset": {
            borderColor: "#e2e8f0",
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "#cbd5e1",
          "&.Mui-checked": {
            color: "#009997",
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: "#cbd5e1",
          "&.Mui-checked": {
            color: "#009997",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          border: "1px solid #e2e8f0",
        },
        elevation1: {
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        },
        elevation2: {
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          border: "1px solid #e2e8f0",
          boxShadow: "none",
          borderRadius: "12px !important",
          marginBottom: 12,
          "&:before": {
            display: "none",
          },
          "&.Mui-expanded": {
            marginBottom: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          minHeight: 60,
          padding: "0 20px",
          "&.Mui-expanded": {
            minHeight: 60,
            borderBottom: "1px solid #e2e8f0",
          },
        },
        content: {
          margin: "16px 0",
          "&.Mui-expanded": {
            margin: "16px 0",
          },
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: "20px",
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          marginLeft: -8,
          marginRight: 0,
        },
        label: {
          fontSize: "0.9rem",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
  },
});

function App() {
  const [showThankYou, setShowThankYou] = useState(false);

  const handleSubmissionSuccess = () => {
    setShowThankYou(true);
  };

  const handleBackToForm = () => {
    setShowThankYou(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {showThankYou ? (
        <ThankYou onBackToForm={handleBackToForm} />
      ) : (
        <QuestionnaireForm onSubmissionSuccess={handleSubmissionSuccess} />
      )}
    </ThemeProvider>
  );
}

export default App;
