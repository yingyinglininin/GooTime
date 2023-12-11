import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";

export default function ScheduleSelector({ setSelectedDate }) {
  const storedSelectedValue =
    localStorage.getItem("selectedScheduleValue") || "";

  const [selectedValue, setSelectedValue] = useState(storedSelectedValue);
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    // Update localStorage when selectedValue changes
    localStorage.setItem("selectedScheduleValue", selectedValue);
  }, [selectedValue]);

  useEffect(() => {
    // Restore selectedValue from localStorage on component mount
    setSelectedValue(storedSelectedValue);
  }, []); // Empty dependency array ensures this effect runs once on mount

  const handleChange = (event) => {
    setSelectedValue(event.target.value);

    // Close the DatePicker when "Custom Days" is selected again
    if (event.target.value === "Custom Days" && isDatePickerOpen) {
      setDatePickerOpen(false);
    } else {
      // Handle different cases based on selected value
      switch (event.target.value) {
        case "Today":
          setSelectedDate(new Date());
          break;
        case "This Week":
          const today = new Date();
          const lastDayOfWeek = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + (7 - today.getDay())
          );
          setSelectedDate(lastDayOfWeek);
          break;
        case "This Month":
          const lastDayOfMonth = new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            0
          );
          setSelectedDate(lastDayOfMonth);
          break;
        case "Custom Days":
          // Open the DatePicker when "Custom Days" is selected
          setDatePickerOpen(true);
          break;
        default:
          // Handle other cases if needed
          break;
      }
    }
  };

  const handleDatePickerClose = () => {
    setDatePickerOpen(false);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setDatePickerOpen(false);
  };

  return (
    <Box>
      <FormControl fullWidth>
        <InputLabel id="schedule-selector-label">Day Later</InputLabel>
        <Select
          labelId="schedule-selector-label"
          id="schedule-selector"
          value={selectedValue}
          label="dayLater"
          onChange={handleChange}
        >
          <MenuItem value={"Today"}>Today</MenuItem>
          <MenuItem value={"This Week"}>This Week</MenuItem>
          <MenuItem value={"This Month"}>This Month</MenuItem>
          <MenuItem value={"Custom Days"}>Custom Days</MenuItem>
        </Select>
      </FormControl>

      <Dialog open={isDatePickerOpen} onClose={handleDatePickerClose}>
        <DialogTitle>Custom Days</DialogTitle>
        <DialogContent>
          <StaticDatePicker onAccept={handleDateChange} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
