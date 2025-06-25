import React, { useEffect, useState } from "react";
import { FiClock, FiCalendar } from "react-icons/fi";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { getMemberdata } from "../../helpers/commonfunctions";
import { Card } from "react-bootstrap";
const DateTimeCard = () => {
  const memberData = getMemberdata();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      //second: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }).format(date);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(date);
  };

  return (
    <Card className="daily--star daily--welcome">
      <div className="card--icon">
        <div className="star--icon">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-sunset w-6 h-6 text-white"
          >
            <path d="M12 10V2"></path>
            <path d="m4.93 10.93 1.41 1.41"></path>
            <path d="M2 18h2"></path>
            <path d="M20 18h2"></path>
            <path d="m19.07 10.93-1.41 1.41"></path>
            <path d="M22 22H2"></path>
            <path d="m16 6-4 4-4-4"></path>
            <path d="M16 18a4 4 0 0 0-8 0"></path>
          </svg>
        </div>
        <h6 className="mb-0">
          <strong>
            {getGreeting()}, <span>{memberData?.name}!</span>
          </strong>{" "}
          <small>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-sparkles w-4 h-4"
            >
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
              <path d="M5 3v4"></path>
              <path d="M19 17v4"></path>
              <path d="M3 5h4"></path>
              <path d="M17 19h4"></path>
            </svg>{" "}
            Ready to make today extraordinary?
          </small>
        </h6>
      </div>
      <div className="card-body">
        <h3>
          <FiClock /> {formatTime(currentTime)}
        </h3>
        <p className="text-end">
          <HiOutlineLocationMarker /> Asia/Kolkata
        </p>
        <h4>
          <FiCalendar /> {formatDate(currentTime)}
        </h4>
      </div>
    </Card>
  );
};

export default DateTimeCard;
