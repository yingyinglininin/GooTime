import React, { useEffect, useState } from "react";
import axios from "axios";
import ScheduleItem from "./ScheduleItem";
import LoadingSpinner from "../LoadingSpinner";

const OtherScheduleTab = ({ token }) => {
  const [otherSchedule, setOtherSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch other schedule data from the API using Axios
    axios
      .get("http://localhost:4000/api/1.0.0/schedule/otherSchedule", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setOtherSchedule(response.data.otherSchedules);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching other schedule data:", error);
        setLoading(false); // Set loading to false in case of an error
      });
  }, [token]);

  return (
    <div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        otherSchedule.map((schedule) => (
          <ScheduleItem key={schedule.id} schedule={schedule} />
        ))
      )}
    </div>
  );
};

export default OtherScheduleTab;
