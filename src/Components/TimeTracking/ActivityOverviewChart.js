import React from "react";
import { Line } from "react-chartjs-2";

const ActivityOverviewChart = ({ eventsData }) => {

  const logs =
    eventsData?.[0]?.events_count || [];

  const labels = logs.map((item) =>
    new Date(item.time).toLocaleTimeString(
      "en-GB",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }
    )
  );

  const activityData = logs.map((item) => {

    const total =
      (item?.mouse_click_count || 0) +
      (item?.keyboard_count || 0);

    return Math.min(total, 100);
  });

  const data = {
    labels,

    datasets: [
      {
        label: "Activity level",
        data: activityData,

        borderColor: "#0ea5e9",

        backgroundColor:
          "rgba(14,165,233,0.18)",

        borderWidth: 4,

        pointRadius: 0,

        lineTension: 0.4,

        fill: true,
      },
    ],
  };

  const options = {
  responsive: true,
  maintainAspectRatio: false,

  legend: {
    display: true,
    position: "top",
    align: "end",
  },

  scales: {

    // Y AXIS
    yAxes: [
      {
        ticks: {
          min: 0,
          max: 100,
          stepSize: 25,

          callback: function(value) {
            return value + "%";
          },
        },

        gridLines: {
          borderDash: [5, 5],
          drawBorder: false,
        },
      },
    ],

    // X AXIS
    xAxes: [
  {
    ticks: {
      autoSkip: false,
      maxRotation: 0,
      minRotation: 0,

      callback: function(value, index) {

        const lastIndex = labels.length - 1;

        // show every 30th label
        // and always show last label

        if (
          index % 30 === 0 ||
          index === lastIndex
        ) {
          return value;
        }

        return "";
      },
    },

    gridLines: {
      display: false,
      drawBorder: false,
    },
  },
],
  },
};

  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "20px",
        height: "420px",
      }}
    >
      <h4
        style={{
          fontWeight: 700,
          marginBottom: "20px",
        }}
      >
        Activity Overview
      </h4>

      <Line
        data={data}
        options={options}
      />
    </div>
  );
};

export default ActivityOverviewChart;