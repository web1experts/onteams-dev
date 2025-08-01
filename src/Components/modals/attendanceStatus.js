import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Button, Form, Row, Col, Card, Badge } from "react-bootstrap";
import { FiEdit3, FiTrash2 } from "react-icons/fi";
import {
  ListAttendanceStatuses,
  saveAttendanceStatuses,
} from "../../redux/actions/attendance.action";
import { FiPlus } from "react-icons/fi";
import { selectboxObserver } from "../../helpers/commonfunctions";

const AttendanceStatusManager = ({ toggle, show }) => {
  const [EditIndex, setEditIndex] = useState(false);
  const [showRules, setRulesShow] = useState(false);
  const [form, setForm] = useState({
    ruleName: "",
    code: "",
    startHour: "00",
    startMinute: "00",
    endHour: "00",
    endMinute: "00",
    color: "#eab308",
  });
  const [errors, setErrors] = useState({
    ruleName: "",
    code: "",
    startHour: "",
    startMinute: "",
    endHour: "",
    endMinute: "",
    color: "",
  });
  const handleRulesClose = () => {
    setRulesShow(false);
    if (attendanceStatus.length > 0) {
      // Find the highest "to" value
      const rawMax = Math.max(...attendanceStatus.map((s) => parseFloat(s.to)));

      // Convert decimal to minutes, add 1 min, and convert back to decimal hours
      const totalMinutes = Math.round(rawMax * 60) + 1;
      const newDecimal = parseFloat((totalMinutes / 60).toFixed(2));

      // Convert to hour and minute parts
      const { hour, minute } = decimalToTimeParts(newDecimal);

      setForm({
        ruleName: "",
        code: "",
        startHour: hour,
        startMinute: minute,
        endHour: "00",
        endMinute: "00",
        color: "#eab308",
      });
    }
  };
  const handleRulesShow = () => {
    setRulesShow(true);
    setTimeout(() => {
      selectboxObserver();
    }, 600);
  };

  const dispatch = useDispatch();
  const apiResult = useSelector((state) => state.attendance);
  const [attendanceStatus, setAttendanceStatus] = useState([]);
  const [loading, setLoading] = useState(false);
  const listStatuses = () => {
    dispatch(ListAttendanceStatuses());
  };
  useEffect(() => {
    listStatuses();
  }, []);

  useEffect(() => {
    if (apiResult.attendanceStatuses) {
      const sortedStatuses = apiResult.attendanceStatuses.sort((a, b) => {
        if (a.from !== b.from) return a.from - b.from;
        return a.to - b.to;
      });
      setAttendanceStatus(sortedStatuses);
    }
  }, [apiResult]);

  useEffect(() => {
    if (attendanceStatus.length > 0) {
      // Find the highest "to" value
      const rawMax = Math.max(...attendanceStatus.map((s) => parseFloat(s.to)));

      // Convert decimal to minutes, add 1 min, and convert back to decimal hours
      const totalMinutes = Math.round(rawMax * 60) + 1;
      const newDecimal = parseFloat((totalMinutes / 60).toFixed(2));

      // Convert to hour and minute parts
      const { hour, minute } = decimalToTimeParts(newDecimal);

      setForm((prev) => ({
        ...prev,
        startHour: hour,
        startMinute: minute,
      }));
    }
  }, [attendanceStatus]);

  // const decimalToTimeParts = (decimal) => {
  //   const hour = String(Math.floor(decimal)).padStart(2, '0');
  //   const minute = String(Math.round((decimal - Math.floor(decimal)) * 60)).padStart(2, '0');
  //   return { hour, minute };
  // };
  const decimalToTimeParts = (decimal) => {
    const hour = Math.floor(decimal);
    const minute = Math.round((decimal - hour) * 60);
    return { hour, minute };
  };

  const editRule = (index) => {
    const status = attendanceStatus[index];
    if (!status) return;
    setEditIndex(index);
    const { hour: startHour, minute: startMinute } = decimalToTimeParts(
      status.from
    );
    const { hour: endHour, minute: endMinute } = decimalToTimeParts(status.to);

    setForm({
      ruleName: status.label || "",
      code: status.code || "",
      color: status.color || "",
      startHour: startHour,
      startMinute: startMinute,
      endHour: endHour,
      endMinute: endMinute,
    });
    setRulesShow(true);
  };

  useEffect(() => {
    console.log("form data:: ", form);
  }, [form]);

  const removeStatus = (indexToRemove) => {
    if (attendanceStatus.length <= 2) return;

    const roundToTwo = (num) => Math.round(num * 100) / 100;

    const updatedStatuses = [...attendanceStatus];

    // Remove the selected rule
    updatedStatuses.splice(indexToRemove, 1);

    // Get previous rule's to (new starting point for next rule)
    if (indexToRemove > 0 && updatedStatuses[indexToRemove]) {
      const prevTo = attendanceStatus[indexToRemove - 1].to;
      const newFrom = roundToTwo(prevTo + 0.1); // increment by 0.1

      updatedStatuses[indexToRemove] = {
        ...updatedStatuses[indexToRemove],
        from: newFrom,
        // to remains unchanged
      };
    }

    const payload = {
      statuses: updatedStatuses.map((status) => ({
        label: status.label.trim(),
        code: status.code,
        from: status.from,
        to: status.to,
        color: status.color,
      })),
    };

    dispatch(saveAttendanceStatuses(payload));
  };

  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0")
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0")
  );

  const colorOptions = [
    "#ef4444",
    "#eab308",
    "#f97315",
    "#22c55d",
    "#3c82f6",
    "#a855f7",
    "#ec4899",
    "#6466f1",
  ];

  const attendanceData = [
    { color: "absent", title: "Absent", code: "A", time: "0:00 - 1:59" },
    { color: "halfday", title: "Half Day", code: "HD", time: "2:00 - 4:00" },
    {
      color: "shortleave",
      title: "Short Leave",
      code: "SL",
      time: "4:01 - 6:00",
      badgeColor: "orange",
    },
    { color: "present", title: "Present", code: "P", time: "6:01 - 8:00" },
    { color: "overtime", title: "Overtime", code: "OT", time: "8:01 - 12:00" },
  ];

  const AttendanceCard = ({ index, total, color, label, code, from, to }) => {
    const showTrashIcon = total > 2 && index !== 0 && index !== 1;

    return (
      <Card className="mb-3 rules--card">
        <Card.Body>
          <Row className="align-items-center">
            <Col xs="auto">
              <div className={`rules--bg`} style={{ background: color }}></div>
            </Col>
            <Col className="ps-0">
              <strong className="d-flex align-items-center gap-2">
                {label}{" "}
                <Badge bg="light" text="dark">
                  {code}
                </Badge>
              </strong>{" "}
              <p className="mb-0">{decimalToTimeRange(from, to)}</p>
            </Col>
            <Col xs="auto" className="rules--actions">
              <FiEdit3 onClick={() => editRule(index)} />
              {showTrashIcon && (
                <FiTrash2 onClick={() => removeStatus(index)} />
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  // const data = attendanceData; // Replace with state if dynamically updating
  // const totalCards = data.length;

  //  const handleRulesChange = (field, value) => {
  //   const updatedForm = { ...form, [field]: value };

  //   // If startHour or startMinute was updated, also update endHour
  //   if (field === 'startHour' || field === 'startMinute') {
  //     const startTime = parseInt(updatedForm.startHour) + parseInt(updatedForm.startMinute) / 60;

  //     // Find first hour > startTime
  //     const nextEndHour = hours.find((h) => parseInt(h) > startTime);

  //     // Set to found value or default to last hour
  //     updatedForm.endHour = nextEndHour || hours[hours.length - 1];
  //   }

  //   setForm(updatedForm);
  // };

  const handleRulesChange = (field, value) => {
    const updatedForm = { ...form, [field]: value };

    // If startHour or startMinute was updated, also update endHour
    if (field === "startHour" || field === "startMinute") {
      const startHour = parseInt(updatedForm.startHour, 10);
      const startMinute = parseInt(updatedForm.startMinute, 10);
      const startTimeDecimal = parseFloat(
        (startHour + startMinute / 60).toFixed(2)
      );

      // Convert `hours` to numeric array if needed
      const nextEndHour = hours.find((h) => parseFloat(h) > startTimeDecimal);

      // Fallback to last hour if no greater hour found
      updatedForm.endHour = nextEndHour || hours[hours.length - 1];
    }

    setForm(updatedForm);
  };

  const handleColorSelect = (color) => {
    setForm({ ...form, color });
  };

  const showError = (name) => {
    if (errors && errors[name])
      return <span className="form-error">{errors[name]}</span>;
    return null;
  };

  // const convertToDecimalTime = (hour, minute) => {
  //   const decimal = parseInt(hour) + parseInt(minute) / 60;
  //   return Math.ceil(decimal * 100) / 100;
  // };
  const convertToDecimalTime = (hour, minute) => {
    const decimal = parseInt(hour) + parseInt(minute) / 60;
    return Math.floor(decimal * 100) / 100;
  };



  const decimalToTimeRange = (from, to) => {
    const formatTime = (decimal) => {
      const hours = Math.floor(decimal);
      const minutes = Math.round((decimal - hours) * 60);
      return `${hours}:${String(minutes).padStart(2, "0")}`;
    };

    return `${formatTime(from)} - ${formatTime(to)}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let hasError = false;
    const newErrors = {};

    const startTime = convertToDecimalTime(form.startHour, form.startMinute);
    const endTime = convertToDecimalTime(form.endHour, form.endMinute);
   
    // Check for empty fields
    for (const [key, value] of Object.entries(form)) {
      const isEmpty =
        typeof value === "string"
          ? value.trim() === ""
          : value === "" || value === null || value === undefined;

      if (isEmpty) {
        hasError = true;
        newErrors[key] = `${key} cannot be blank.`;
      }
    }

    setErrors(newErrors);

    if (hasError) {
      return;
    }

const formStatus = {
  label: form.ruleName.trim(),
  code: form.code.trim(),
  from: startTime,
  to: endTime,
  color: form.color,
};

let updatedStatuses = attendanceStatus.map((status) => ({
  label: status.label.trim(),
  code: status.code,
  from: parseFloat(status.from),
  to: parseFloat(status.to),
  color: status.color,
}));

if (EditIndex === false || EditIndex === null || EditIndex === undefined) {
  // New rule
  updatedStatuses.push(formStatus);
} else {
  // Update current rule
  updatedStatuses[EditIndex] = formStatus;

  const nextIndex = EditIndex + 1;

  if (nextIndex < updatedStatuses.length) {
    const nextStatus = updatedStatuses[nextIndex];

    // Calculate next start time (truncate to 2 decimal places)
    const nextFromRaw = formStatus.to + 1 / 60;
    const nextFrom = Math.floor(nextFromRaw * 100) / 100;

    // Check if new from overlaps or exceeds to of next status
    if (nextFrom >= nextStatus.to) {
      setErrors({
        timeConflict: `Cannot update. "${nextStatus.label}" will not have enough time left. Please adjust or remove overlapping statuses.`,
      });
      return;
    }

    // Update only 'from' of the immediate next status
    updatedStatuses[nextIndex] = {
      ...nextStatus,
      from: nextFrom,
    };
  }
}








    const sortedStatuses = updatedStatuses.sort((a, b) => {
      if (a.from !== b.from) return a.from - b.from;
      return a.to - b.to;
    });
    const payload = {
      statuses: sortedStatuses,
    };
      setLoading(true);
    console.log("Payload:: ", payload);
    dispatch(saveAttendanceStatuses(payload))
    setLoading(false);

    handleRulesClose();
    // Proceed with API logic or further actions
  };

  return (
    <>
      <Modal
        show={show}
        onHide={toggle}
        centered
        size="lg"
        className="status--modal rules--modal"
      >
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title>
            <strong>
              Attendance Rules Configuration{" "}
              <small>Configure time ranges and attendance categories</small>
            </strong>
          </Modal.Title>
          {attendanceStatus?.length < 7 && (
            <Button variant="primary" onClick={handleRulesShow}>
              <FiPlus /> Add Rule
            </Button>
          )}
        </Modal.Header>
        <Modal.Body>
          {attendanceStatus.map((item, index) => (
            <AttendanceCard
              key={index}
              {...item}
              index={index}
              total={attendanceStatus?.length}
            />
          ))}
        </Modal.Body>
      </Modal>
      <Modal
        show={showRules}
        centered
        onHide={handleRulesClose}
        backdrop="static"
        keyboard={false}
        size="md"
      >
        <Modal.Header className="pb-0">
          <Modal.Title>Add New Rule</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Rule Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Present, Absent, Half Day"
                value={form.ruleName}
                onChange={(e) => handleRulesChange("ruleName", e.target.value)}
              />
              {showError("ruleName")}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Short Name (Max 2 characters)</Form.Label>
              <Form.Control
                type="text"
                maxLength={2}
                placeholder="e.g., P, A, HD"
                value={form.code}
                onChange={(e) => handleRulesChange("code", e.target.value)}
              />
              {showError("code")}
            </Form.Group>

            <Row className="mb-3">
              <Form.Label>Start Time</Form.Label>
              <Col>
                <Form.Label>
                  <small>Hours</small>
                </Form.Label>
                <Form.Select
                  value={form.startHour}
                  onChange={(e) =>
                    handleRulesChange("startHour", e.target.value)
                  }
                  disabled
                >
                  <option key={form.startHour} value={form.startHour}>
                    {form.startHour}
                  </option>
                  {/* {hours.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))} */}
                </Form.Select>
                {showError("startHour")}
              </Col>
              <Col>
                <Form.Label>
                  <small>Minutes</small>
                </Form.Label>
                <Form.Select
                  value={form.startMinute}
                  onChange={(e) =>
                    handleRulesChange("startMinute", e.target.value)
                  }
                  disabled
                >
                  <option key={form.startMinute} value={form.startMinute}>
                    {form.startMinute}
                  </option>
                  {/* {minutes.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))} */}
                </Form.Select>
                {showError("startMinute")}
              </Col>
            </Row>

            <Row className="mb-3">
              <Form.Label>End Time</Form.Label>
              <Col>
                <Form.Label>
                  <small>Hours</small>
                </Form.Label>
                <Form.Select
                  className="custom-selectbox"
                  value={form.endHour}
                  onChange={(e) => handleRulesChange("endHour", e.target.value)}
                >
                  {(() => {
                    const startHour = parseInt(form.startHour);
                    const startMinute = parseInt(form.startMinute);
                    const startInMinutes = startHour * 60 + startMinute;

                    return hours
                      .filter((h) => {
                        const hour = parseInt(h);
                        const hourInMinutes = hour * 60;

                        // Allow hour if it's after startHour
                        // or if it's equal but user will pick later minutes
                        return (
                          hourInMinutes > startInMinutes ||
                          (hour === startHour && startMinute < 59)
                        );
                      })
                      .map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ));
                  })()}
                </Form.Select>

                {showError("endHour")}
              </Col>
              <Col>
                <Form.Label>
                  <small>Minutes</small>
                </Form.Label>
                <Form.Select
                  className="custom-selectbox"
                  value={form.endMinute}
                  onChange={(e) =>
                    handleRulesChange("endMinute", e.target.value)
                  }
                >
                  {minutes.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </Form.Select>
                {showError("endMinute")}
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Color</Form.Label>
              <div className="d-flex flex-wrap gap-3 justify-content-between mt-2">
                {colorOptions.map((color) => (
                  <div
                    className="color--bg"
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    style={{
                      backgroundColor: color,
                      border:
                        form.color === color
                          ? "2px solid #444"
                          : "2px solid transparent",
                    }}
                  ></div>
                ))}
              </div>
            </Form.Group>
            {showError("timeConflict")}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleRulesClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save Rule
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AttendanceStatusManager;
