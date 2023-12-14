import React, { useState } from "react";
import dayjs from "dayjs";
import TimeButton from "./TimeButton";

const TimeButtonGroup = ({
  availableTimesForSelectedDay,
  handleTimeSelect,
}) => {
  const [selectedButtons, setSelectedButtons] = useState([]);

  const handleButtonClick = (time) => {
    setSelectedButtons([time]);
    handleTimeSelect(dayjs(time.startTime).toDate());
  };

  const morningButtons = [];
  const afternoonButtons = [];
  const eveningButtons = [];

  availableTimesForSelectedDay.forEach((time, index) => {
    const startHour = dayjs(time.startTime).hour();

    const button = (
      <TimeButton
        key={index}
        time={time}
        isSelected={selectedButtons.includes(time)}
        onClick={() => handleButtonClick(time)}
      />
    );

    // Determine the appropriate array based on the start hour
    let targetArray;
    if (startHour >= 6 && startHour < 12) {
      targetArray = morningButtons;
    } else if (startHour >= 12 && startHour < 18) {
      targetArray = afternoonButtons;
    } else if (startHour >= 18 && startHour <= 24) {
      targetArray = eveningButtons;
    }

    targetArray.push(button);
  });

  const renderButtonRows = (buttons, label) => {
    if (buttons.length === 0) {
      return null;
    }

    return (
      <div className="flex flex-col items-start pl-12 pr-12">
        <div className="flex flex-row items-start p-2">
          <p>{label}</p>
        </div>
        <div className="flex flex-wrap">{buttons}</div>
      </div>
    );
  };

  return (
    <div>
      {renderButtonRows(morningButtons, "Morning")}
      {renderButtonRows(afternoonButtons, "Afternoon")}
      {renderButtonRows(eveningButtons, "Evening")}
    </div>
  );
};

export default TimeButtonGroup;
