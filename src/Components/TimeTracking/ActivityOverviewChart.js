import React from "react";
import { Line } from "react-chartjs-2";
import { Row, Col } from "react-bootstrap";

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

  // const activityData = logs.map((item) => {

  //   const total =
  //     (item?.mouse_click_count || 0) +
  //     (item?.keyboard_count || 0);

  //   return Math.min(total, 100);
  // });

  const {
  activityData,
  mouseClicksData,
  keyboardClicksData,
  totalClicksData,
  idleTimeData,
  activeMinutes,
  idleMinutes,
  totalMouseClicks,
  totalKeyboardClicks,
  totalClicks,
} = logs.reduce(
  (acc, item) => {
    const mouseClicks = item?.mouse_click_count || 0;
    const keyboardClicks = item?.keyboard_count || 0;

    const total = mouseClicks + keyboardClicks;
    

    // idle determination
    const isIdle = total === 0;

    acc.activityData.push(Math.min(total, 100));
    acc.mouseClicksData.push(mouseClicks);
    acc.keyboardClicksData.push(keyboardClicks);

    acc.totalMouseClicks += mouseClicks;
    acc.totalKeyboardClicks += keyboardClicks;
    acc.totalClicks += total;


    acc.totalClicksData.push(total);

    acc.idleTimeData.push(
      isIdle ? 1 : 0
    );

    // active / idle minutes
    if (isIdle) {
      acc.idleMinutes += 1;
    } else {
      acc.activeMinutes += 1;
    }

    return acc;
  },
  {
    activityData: [],
    mouseClicksData: [],
    keyboardClicksData: [],
    totalClicksData: [],
    idleTimeData: [],
    activeMinutes: 0,
    idleMinutes: 0,
    totalMouseClicks: 0,
    totalKeyboardClicks: 0,
    totalClicks: 0,
  }
);
// totals
const totalTrackedMinutes = logs.length;

const avgActivity = Math.round(
  activityData.reduce(
    (a, b) => a + b,
    0
  ) / totalTrackedMinutes
);

  const data = {
    labels,

    datasets: [
      {
        label: "Activity level",
        data: activityData,
        mouseClicks: mouseClicksData,
        keyboardClicks: keyboardClicksData,
        totalClicksData: totalClicksData,
        idleTimeData: idleTimeData,

        borderColor: "#0ea5e9",

        backgroundColor: "rgba(14,165,233,0.18)",
        borderWidth: 2,
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

  tooltips: {
    mode: "index",
    intersect: false,

    callbacks: {
      label: function(tooltipItem, data) {
        const dataset = data.datasets[tooltipItem.datasetIndex];

        // Current percentage value
        const value = dataset.data[tooltipItem.index];

        // Custom values
        const mouseClicks =
          dataset.mouseClicks?.[tooltipItem.index] || 0;

        const keyboardClicks =
          dataset.keyboardClicks?.[tooltipItem.index] || 0;

          const totalClicks =
            dataset.totalClicksData[tooltipItem.index] || 0;

          const idle =
            dataset.idleTimeData[tooltipItem.index] || 0;


        return [
          `${dataset.label}: ${value}%`,
          `Total Clicks: ${totalClicks}`,
          `Mouse Clicks: ${mouseClicks}`,
          `Keyboard Clicks: ${keyboardClicks}`,
          // `Idle: ${idle ? "Yes" : "No"}`,
        ];
      },
    },
  },

  scales: {
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

    xAxes: [
      {
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,

          callback: function(value, index) {
            const lastIndex = labels.length - 1;

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
    <Row>
      <Col sm={12}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 20,
          padding: "8px 12px",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          background: "#fff",
          fontSize: 15,
          fontWeight: 500,
        }}
      >
        <span>
          <strong>{totalTrackedMinutes}</strong>{" "}
          minutes tracked
        </span>

        <span style={{ color: "#d1d5db" }}>|</span>

        <span>
          <strong style={{ color: "#16a34a" }}>
            {activeMinutes}
          </strong>{" "}
          active
        </span>

        <span style={{ color: "#d1d5db" }}>|</span>

        <span>
          <strong style={{ color: "#f59e0b" }}>
            {idleMinutes}
          </strong>{" "}
          idle
        </span>

        <span style={{ color: "#d1d5db" }}>|</span>

        <span>
          Avg activity:{" "}
          <strong style={{ color: "#2563eb" }}>
            {avgActivity}%
          </strong>
        </span>

        <span style={{ color: "#d1d5db" }}>|</span>

        <span>
          Mouse:{" "}
          <strong>
            {totalMouseClicks}
          </strong>
        </span>

        <span style={{ color: "#d1d5db" }}>|</span>

        <span>
          Keyboard:{" "}
          <strong>
            {totalKeyboardClicks}
          </strong>
        </span>

        <span style={{ color: "#d1d5db" }}>|</span>

        <span>
          Total Clicks:{" "}
          <strong>{totalClicks}</strong>
        </span>
      </div>
      </Col>
      <Col sm={12}>
      <div
        style={{
          background: "#fff",
          padding: "0",
          marginTop: "20px",
          borderRadius: "0",
          height: "220px",
        }}
      >
        <h5
          style={{
            marginBottom: "20px",
          }}
        >
          Activity Overview
        </h5>

        <Line
          data={data}
          options={options}
        />
      </div>
      </Col>
    </Row>
    
  );
};

export default ActivityOverviewChart;