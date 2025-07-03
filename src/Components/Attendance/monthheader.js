import React from 'react';

const MonthHeader = ({ month, year }) => {
  // Default to current month/year if not provided
 const today = new Date();
const currentMonth = (month !== undefined && month !== null) ? parseInt(month) : today.getMonth() + 1; // month = 1-based
const currentYear = year ?? today.getFullYear();

// Correct way: use next month and day=0 to get last day of the target month
const daysInMonth = new Date(currentYear, currentMonth, 0).getDate(); // currentMonth is 1-based here

  // Generate array of days
  const headers = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth - 1, day); 
    const dayName = date.toLocaleString('default', { weekday: 'short' }); // "Sun", "Mon", etc.

    headers.push(
      <th key={day} className="text-center">
        <small>{dayName}</small>
        <strong>{day}</strong>
      </th>
    );
  }

  return <>{headers}</>;
};

export default MonthHeader;
