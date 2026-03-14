import React from "react";
import { Container, Typography, Box } from "@mui/material";
import SalarySubmissionForm from "./components/SalarySubmissionForm";
import Lottie from "lottie-react"; // <- default import
import onlinePaymentAnimation from "./assets/Digital Finance Animation.json";

function App() {
  return (
    <Container maxWidth="md">

      <Box display="flex" alignItems="center" justifyContent="center" mt={6} mb={4}>
        {/* Animated logo */}
        <Box mr={2} width={180} height={200}>
          <Lottie
            animationData={onlinePaymentAnimation}
            loop
            autoplay
            style={{ width: "100%", height: "100%" }}
          />
        </Box>

        {/* Title */}
        <Box textAlign="center">
          <Typography variant="h2" fontWeight="bold">
            Zalary
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Anonymous salary sharing platform for transparency
          </Typography>
        </Box>
      </Box>

      <SalarySubmissionForm />
    </Container>
  );
}

export default App;