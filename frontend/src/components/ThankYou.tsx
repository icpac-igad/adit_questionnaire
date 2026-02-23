import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import { CheckCircle, Add, Close } from "@mui/icons-material";

const ThankYou: React.FC<{ onBackToForm: () => void }> = ({ onBackToForm }) => {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: "#009997",
          color: "white",
          py: { xs: 1.5, sm: 2 },
          px: 2,
        }}
      >
        <Container maxWidth="md">
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
            <Box sx={{ borderLeft: "1px solid rgba(255,255,255,0.3)", pl: 2 }}>
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

      {/* Content */}
      <Container
        maxWidth="sm"
        sx={{
          pt: { xs: 8, sm: 12 },
          px: 3,
          textAlign: "center",
        }}
      >
        {/* Success Icon */}
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            bgcolor: "#ccfbf1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 4,
          }}
        >
          <CheckCircle sx={{ fontSize: 48, color: "#009997" }} />
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#0f766e",
            mb: 2,
          }}
        >
          Report Submitted
        </Typography>

        <Typography
          sx={{
            fontSize: "0.95rem",
            color: "#64748b",
            lineHeight: 1.6,
            mb: 4,
            maxWidth: 380,
            mx: "auto",
          }}
        >
          Your observations will contribute to the East Africa Drought Watch bulletins, helping communities and decision-makers across the region respond effectively to drought conditions.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={onBackToForm}
            sx={{
              bgcolor: "#009997",
              px: 4,
              py: 1.5,
              fontSize: "1rem",
              borderRadius: 2,
              "&:hover": { bgcolor: "#007a78" },
            }}
          >
            Submit Another Report
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<Close />}
            onClick={() => {
              // Try multiple methods to close
              if (window.opener) {
                window.close();
              } else {
                // If can't close, navigate to a blank page or show message
                window.location.href = "about:blank";
              }
            }}
            sx={{
              borderColor: "#99f6e4",
              color: "#0f766e",
              px: 4,
              py: 1.5,
              fontSize: "1rem",
              borderRadius: 2,
              "&:hover": {
                borderColor: "#5eead4",
                bgcolor: "#f0fdfa",
              },
            }}
          >
            Close
          </Button>
        </Box>

        <Typography
          sx={{
            mt: 6,
            fontSize: "0.7rem",
            color: "#94a3b8",
          }}
        >
          East Africa Drought Watch
        </Typography>
      </Container>
    </Box>
  );
};

export default ThankYou;
