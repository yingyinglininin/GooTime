import React, { useEffect, useState } from "react";
import axios from "axios";
import ScheduleItem from "./ScheduleItem";
import LoadingSpinner from "../LoadingSpinner";

const MyScheduleTab = ({ token }) => {
  const [mySchedule, setMySchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data from the API using Axios
    axios
      .get("https://www.gootimetw.com/api/1.0.0/schedule/mySchedule", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setMySchedule(response.data.schedules);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        setLoading(false); // Handle the error and set loading to false
      });
  }, [token]);

  return (
    <div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        mySchedule.map((schedule) => (
          <ScheduleItem key={schedule.id} schedule={schedule} />
        ))
      )}
    </div>
  );
};

export default MyScheduleTab;
