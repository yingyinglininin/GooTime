import React, { useState } from "react";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const preferences = [
  { title: "早上" },
  { title: "下午" },
  { title: "晚上" },
  { title: "平日" },
  { title: "假日" },
];

export default function PreferenceCheckbox({ onPreferenceChange }) {
  const storedPreferences =
    JSON.parse(localStorage.getItem("selectedPreferences")) || preferences;
  const [selectedPreferences, setSelectedPreferences] =
    useState(storedPreferences);

  const handleChange = (_, values) => {
    setSelectedPreferences(values);
    onPreferenceChange(values);

    // Save selected preferences to localStorage
    localStorage.setItem("selectedPreferences", JSON.stringify(values));
  };

  return (
    <Autocomplete
      multiple
      id="preference-checkbox"
      options={preferences}
      disableCloseOnSelect
      getOptionLabel={(option) => option.title}
      isOptionEqualToValue={(option, value) => option.title === value.title}
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Checkbox
            icon={icon}
            checkedIcon={checkedIcon}
            style={{ marginRight: 8 }}
            checked={selected}
          />
          {option.title}
        </li>
      )}
      renderInput={(params) => <TextField {...params} label="Preference" />}
      value={selectedPreferences}
      onChange={handleChange}
    />
  );
}
