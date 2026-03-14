import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Typography,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert
} from "@mui/material";

import { submitSalary, fetchCurrencies, fetchCountries } from "../api/salaryApi";

const experienceLevels = [
  { label: "Intern", value: "INTERN" },
  { label: "Junior", value: "JUNIOR" },
  { label: "Mid", value: "MID" },
  { label: "Senior", value: "SENIOR" },
  { label: "Lead", value: "LEAD" },
];

function SalarySubmissionForm() {
  const [formData, setFormData] = useState({
    company: "",
    country: "",
    role: "",
    salary: "",
    yearsOfExperience: "",
    experienceLevel: "MID", // default API value
    currency: "LKR",
    anonymize: false
  });

  const [message, setMessage] = useState(null);
  const [currencies, setCurrencies] = useState(["LKR", "USD"]);
  const [countries, setCountries] = useState(["Sri Lanka", "United States"]);

  // Load countries and currencies in parallel
  useEffect(() => {
    const loadData = async () => {
      try {
        const [countryData, currencyData] = await Promise.all([
          fetchCountries(),
          fetchCurrencies()
        ]);
        setCountries(countryData);
        setCurrencies(currencyData);
      } catch (error) {
        console.error("Failed to load countries or currencies", error);
      }
    };
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await submitSalary({
        ...formData,
        salary: Number(formData.salary),
        yearsOfExperience: Number(formData.yearsOfExperience)
      });

      setMessage({ type: "success", text: res.message });
      setFormData({
        company: "",
        country: "",
        role: "",
        salary: "",
        yearsOfExperience: "",
        experienceLevel: "MID",
        currency: "LKR",
        anonymize: false
      });
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Submission failed" });
    }
  };

  return (
    <Card elevation={4}>
      <CardContent>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontFamily: "'Poppins', sans-serif" }}>
          Submit Salary Information
        </Typography>

        {message && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>

            <Grid item xs={12}>
              <TextField
                label="Company"
                name="company"
                fullWidth
                required
                value={formData.company}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                label="Country"
                name="country"
                fullWidth
                required
                value={formData.country}
                onChange={handleChange}
              >
                {countries.map((country) => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Role"
                name="role"
                fullWidth
                required
                value={formData.role}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Salary"
                name="salary"
                type="number"
                fullWidth
                required
                value={formData.salary}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                select
                label="Currency"
                name="currency"
                fullWidth
                value={formData.currency}
                onChange={handleChange}
              >
                {currencies.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Years of Experience"
                name="yearsOfExperience"
                type="number"
                fullWidth
                required
                value={formData.yearsOfExperience}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                select
                label="Experience Level"
                name="experienceLevel"
                fullWidth
                value={formData.experienceLevel}
                onChange={handleChange}
              >
                {experienceLevels.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    {level.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="anonymize"
                    checked={formData.anonymize}
                    onChange={handleChange}
                  />
                }
                label="Submit anonymously"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                size="large"
                type="submit"
                fullWidth
              >
                Submit Salary
              </Button>
            </Grid>

          </Grid>
        </form>
      </CardContent>
    </Card>
  );
}

export default SalarySubmissionForm;