// ⬇️ PLACEHOLDER: Add your imports (React, Redux, etc.) above this line
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Button, Form, Row, Col, Card, Badge } from "react-bootstrap";
import { FiEdit3, FiTrash2, FiPlus } from "react-icons/fi";
import {
  ListAttendanceStatuses,
  saveAttendanceStatuses,
} from "../../redux/actions/attendance.action";
import { selectboxObserver } from "../../helpers/commonfunctions";

const AttendanceStatusManager = ({ toggle, show }) => {
  const dispatch = useDispatch();
  const apiResult = useSelector((state) => state.attendance);

  const [EditIndex, setEditIndex] = useState(false);
  const [showRules, setRulesShow] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    ruleName: "",
    startHour: "00",
    startMinute: "00",
    endHour: "00",
    endMinute: "00",
    color: "#eab308",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(ListAttendanceStatuses());
  }, []);

  useEffect(() => {
    if (apiResult.attendanceStatuses) {
      const sortedStatuses = [...apiResult.attendanceStatuses].sort((a, b) => a.from - b.from);
      setAttendanceStatus(sortedStatuses);
    }
  }, [apiResult]);

  useEffect(() => {
    if (attendanceStatus.length > 0 && EditIndex === false) {
      const rawMax = Math.max(...attendanceStatus.map((s) => parseFloat(s.to)));
      const totalMinutes = Math.round(rawMax * 60) + 1;
      const newDecimal = parseFloat((totalMinutes / 60).toFixed(2));
      const { hour, minute } = fromDecimal(newDecimal);

      setForm((prev) => ({
        ...prev,
        startHour: hour,
        startMinute: minute,
      }));
    }
  }, [attendanceStatus]);

  const decimalToTimeRange = (from, to) => {
    const formatTime = (decimal) => {
      const hours = Math.floor(decimal);
      const minutes = Math.round((decimal - hours) * 60);
      return `${hours}:${String(minutes).padStart(2, "0")}`;
    };
    return `${formatTime(from)} - ${formatTime(to)}`;
  };

  const toDecimal = (hour, minute) => {
    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);

    // Convert total minutes
    const totalMinutes = h * 60 + m;

    // Truncate to 2 decimal places without rounding
    const decimal = Math.floor((totalMinutes * 100) / 60) / 100;

    return decimal;
  };


  const fromDecimal = (decimal) => {
    const hour = String(Math.floor(decimal)).padStart(2, '0');
    const minute = String(Math.round((decimal - Math.floor(decimal)) * 60)).padStart(2, '0');
    return { hour, minute };
  };

  const handleRulesShow = () => {
    setRulesShow(true);
    setTimeout(() => selectboxObserver(), 700);
  };

  const handleRulesClose = () => {
    setEditIndex(false);
    setRulesShow(false);
    setErrors({});
    if (attendanceStatus.length > 0) {
      const maxTo = Math.max(...attendanceStatus.map((s) => s.to));
      const totalMinutes = Math.round(maxTo * 60) + 1;
      const newDecimal = totalMinutes / 60;
      const { hour, minute } = fromDecimal(newDecimal);
      setForm({
        ruleName: "",
        startHour: hour,
        startMinute: minute,
        endHour: "00",
        endMinute: "00",
        color: "#eab308",
      });
    }
  };

  const handleRulesChange = (field, value) => {
  const updatedForm = { ...form, [field]: value };
    setForm(updatedForm);
  const startDecimal = toDecimal(updatedForm.startHour, updatedForm.startMinute);
  const endDecimal = toDecimal(updatedForm.endHour, updatedForm.endMinute);

  const startMinutes = getTotalMinutes(updatedForm.startHour, updatedForm.startMinute);
const endMinutes = getTotalMinutes(updatedForm.endHour, updatedForm.endMinute);



  if (EditIndex !== false) {
    const updatedStatuses = [...attendanceStatus];
    const oneMinute = 1 / 60;
    const twoMinutes = 2 / 60;
    
    // ⏩ End time changes
    if (field === "endHour" || field === "endMinute") {
      const next = updatedStatuses[EditIndex + 1];
      if (next) {
       
        const isTooCloseToNextEnd = endDecimal > (next.to - oneMinute);
        const isSameAsNextEnd = endDecimal === next.to;
        //const isSameAsNextStart = endDecimal === next.from;

        if (isTooCloseToNextEnd === true || isSameAsNextEnd === true) {
          setErrors({
            timeConflict: `End time must be at least 2 minutes before "${next.label}" ends.`,
          });
          return;
        }

        // Update next.from = current.to + 1 minute
        updatedStatuses[EditIndex + 1] = {
          ...next,
          from: Math.floor((endDecimal + oneMinute) * 100) / 100,
        };
      }

      setErrors({});
    }

    // ⏮️ Start time changes
    if ((field === "startHour" || field === "startMinute") && EditIndex > 0) {
      const prev = updatedStatuses[EditIndex - 1];
      if (prev) {
        const minAllowedStart = prev.from + oneMinute;

        if (startDecimal < minAllowedStart) {
          setErrors({
            timeConflict: `Start time must be at least 1 minute after "${prev.label}" starts.`,
          });
          return;
        }
      }

      setErrors({});
    }

    
  }

  
};

const getTotalMinutes = (hour, minute) => {
  return parseInt(hour || 0, 10) * 60 + parseInt(minute || 0, 10);
};


  const handleColorSelect = (color) => {
    setForm({ ...form, color });
  };

  const showError = (field) => errors[field] ? <><span className="form-error">{errors[field]}</span><br /></> : null;

  const handleSubmit = (e) => {
  e.preventDefault();

  const newErrors = {};
  let hasError = false;

  const oneMinute = 1 / 60;
  const twoMinutes = 2 / 60;

  const startDecimal = toDecimal(form.startHour, form.startMinute);
  const endDecimal = toDecimal(form.endHour, form.endMinute);

  // Validate required fields
  for (const [key, val] of Object.entries(form)) {
    if (!val || val.trim() === "") {
      newErrors[key] = `${key} is required.`;
      hasError = true;
    }
  }

 const startMinutes = getTotalMinutes(form.startHour, form.startMinute);
const endMinutes = getTotalMinutes(form.endHour, form.endMinute);

if (endMinutes - startMinutes < 1) {
    newErrors.timeConflict = "Minimum slot duration is 1 minute.";
    hasError = true;
  }

  // Validate against next status
  if (EditIndex !== false && EditIndex < attendanceStatus.length - 1) {
    const next = attendanceStatus[EditIndex + 1];
    const nextFrom = parseFloat(next.from);
    const nextTo = parseFloat(next.to);

    if (
      endDecimal >= nextTo ||           // must be less than next.to
      //endDecimal === nextFrom ||        // cannot match next start
      endDecimal === nextTo ||          // cannot match next end
      endDecimal > nextTo - oneMinute  // must be at least 2 mins before next.to
    ) {
      newErrors.timeConflict = `End time must be at least 2 minutes before "${next.label}" ends and not match its start/end.`;
      hasError = true;
    }
  }

  // Validate against previous status
  if (EditIndex !== false && EditIndex > 0) {
    const prev = attendanceStatus[EditIndex - 1];
    const prevFrom = parseFloat(prev.from);

    if (startDecimal <= prevFrom || startDecimal - prevFrom < oneMinute) {
      newErrors.timeConflict = `Start time must be at least 1 minute after "${prev.label}" starts.`;
      hasError = true;
    }
  }

  if (hasError) {
    setErrors(newErrors);
    return;
  }

  // Prepare new rule
  const newRule = {
    label: form.ruleName.trim(),
    from: startDecimal,
    to: endDecimal,
    color: form.color,
  };

  let updatedStatuses = [...attendanceStatus];

  if (EditIndex === false) {
    // ➕ New rule
    updatedStatuses.push(newRule);
  } else {
    // ✏️ Update rule
    updatedStatuses[EditIndex] = newRule;

    // Update next rule’s start time if it exists
    if (EditIndex < updatedStatuses.length - 1) {
      const newNextStart = parseFloat((endDecimal + oneMinute).toFixed(2));
      updatedStatuses[EditIndex + 1] = {
        ...updatedStatuses[EditIndex + 1],
        from: newNextStart,
      };
    }

    // Update previous rule’s end time if it exists
   if (EditIndex > 0) {
      const prev = updatedStatuses[EditIndex - 1];
      const current = attendanceStatus[EditIndex];

      const originalStart = parseFloat(current.from);
      if (startDecimal !== originalStart) {
        updatedStatuses[EditIndex - 1] = {
          ...prev,
          to: parseFloat((startDecimal - oneMinute).toFixed(2)),
        };
      }
    }

  }

  const sortedStatuses = updatedStatuses.sort((a, b) => a.from - b.from);
  dispatch(saveAttendanceStatuses({ statuses: sortedStatuses }));
  setAttendanceStatus(sortedStatuses);
  handleRulesClose();
};






  const editRule = (index) => {
    const status = attendanceStatus[index];
    if (!status) return;

    setEditIndex(index);
    const { hour: startHour, minute: startMinute } = fromDecimal(status.from);
    const { hour: endHour, minute: endMinute } = fromDecimal(status.to);

    setForm({
      ruleName: status.label,
      startHour,
      startMinute,
      endHour,
      endMinute,
      color: status.color,
    });

    handleRulesShow();
  };

  const removeStatus = (indexToRemove) => {
    if (attendanceStatus.length <= 2) return;

    const updatedStatuses = [...attendanceStatus];
    updatedStatuses.splice(indexToRemove, 1);

    if (indexToRemove > 0 && updatedStatuses[indexToRemove]) {
      const prevTo = updatedStatuses[indexToRemove - 1].to;
      updatedStatuses[indexToRemove] = {
        ...updatedStatuses[indexToRemove],
        from: Math.floor((prevTo + 1 / 60) * 100) / 100,
      };
    }

    dispatch(saveAttendanceStatuses({ statuses: updatedStatuses }));
    setAttendanceStatus(updatedStatuses);
  };

  const AttendanceCard = ({ index, total, color, label, from, to }) => {
    const showTrashIcon = total > 2 && index !== 0 && index !== 1;
    return (
      <Card className="mb-3 rules--card">
        <Card.Body>
          <Row className="align-items-center">
            <Col xs="auto">
              <div className="rules--bg" style={{ background: color }}></div>
            </Col>
            <Col className="ps-0">
              <strong className="d-flex align-items-center gap-2">
                {label}
              </strong>
              <p className="mb-0">{decimalToTimeRange(from, to)}</p>
            </Col>
            <Col xs="auto" className="rules--actions">
              <FiEdit3 onClick={() => editRule(index)} />
              {showTrashIcon && <FiTrash2 onClick={() => removeStatus(index)} />}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
  const colorOptions = ["#ef4444", "#eab308", "#f97315", "#22c55d", "#3c82f6", "#a855f7", "#ec4899", "#6466f1"];

  return (
    <>
      <Modal show={show} onHide={toggle} centered size="lg" className="status--modal rules--modal">
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

      <Modal show={showRules} centered onHide={handleRulesClose} backdrop="static" keyboard={false} size="md">
        <Modal.Header className="pb-0">
          <Modal.Title>{EditIndex !== false ? "Edit Rule" : "Add New Rule"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {
              Object.keys(errors).length > 0 ?
              <>
                <p className="form-errors">Please fix the following errors:</p> 
                {showError("ruleName")}
                {showError("startHour")}
                {showError("endHour")}
                {showError("timeConflict")}
              </>
              : <></>
            }
            
            <Form.Group className="mb-3">
              <Form.Label>Rule Name</Form.Label>
              <Form.Control
                type="text"
                value={form.ruleName}
                onChange={(e) => handleRulesChange("ruleName", e.target.value)}
              />
              
            </Form.Group>

            

            <Row className="mb-3">
              <Form.Label>Start Time</Form.Label>
              <Col>
                <Form.Select
                  className="custom-selectbox"
                  value={form.startHour}
                  onChange={(e) => handleRulesChange("startHour", e.target.value)}
                  disabled={EditIndex === false || EditIndex === 0}
                >
                  {(EditIndex !== false && EditIndex !== 0
                    ? hours
                    : [form.startHour]
                  ).map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </Form.Select>

              </Col>
              <Col>
                <Form.Select
                className="custom-selectbox"
                  value={form.startMinute}
                  onChange={(e) => handleRulesChange("startMinute", e.target.value)}
                  disabled={EditIndex === false || EditIndex === 0}
                >
                  {(EditIndex !== false && EditIndex !== 0
                    ? minutes
                    : [form.startMinute]
                  ).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </Form.Select>

              </Col>
              
            </Row>

            <Row className="mb-3">
              <Form.Label>End Time</Form.Label>
              <Col>
                <Form.Select
                className="custom-selectbox"
                  value={form.endHour}
                  onChange={(e) => handleRulesChange("endHour", e.target.value)}
                >
                  {hours.map((h) => <option key={h} value={h}>{h}</option>)}
                </Form.Select>
              </Col>
              <Col>
                <Form.Select
                className="custom-selectbox"
                  value={form.endMinute}
                  onChange={(e) => handleRulesChange("endMinute", e.target.value)}
                >
                  {minutes.map((m) => <option key={m} value={m}>{m}</option>)}
                </Form.Select>
              </Col>
              
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Color</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <div
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    style={{
                      backgroundColor: color,
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      cursor: "pointer",
                      border: form.color === color ? "2px solid black" : "1px solid #ccc",
                    }}
                  />
                ))}
              </div>
            </Form.Group>
            
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
