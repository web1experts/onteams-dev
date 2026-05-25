import React, { useState, useMemo, useEffect } from "react";
import { Button, Form, Row, Col, Alert, Card, Table } from "react-bootstrap";
import { BsPencil, BsTrash } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { handleSaveShifts, getShifts, deleteShift } from "../../redux/actions/attendance.action";

const END_TIME = "23:59";

const ShiftDetailsModal = (props) => {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState( false )
    const attendancesApi = useSelector(state => state.attendance)
  const [shifts, setShifts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
    const [shiftName, setShiftName] = useState("");
  const [startTime, setStartTime] = useState("00:00");
  const [windowTime, setWindowTime] = useState("00:00");
  const [endTime, setEndTime] = useState("00:00");
  const [error, setError] = useState("");

  const calculateEndTime = (startTime) => {
    const [h, m] = startTime.split(":").map(Number);

    const date = new Date();
    date.setHours(h, m, 0, 0);

    // Add 24 hours, then subtract 1 minute
    date.setMinutes(date.getMinutes() - 1);

    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
    };

    const endTimeFormatted = useMemo(() => {
        return calculateEndTime(windowTime);
    }, [windowTime]);

  const formatTime = (time) => {
    const [h, m] = time.split(":");
    const date = new Date();
    date.setHours(h, m);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const dynamicText = useMemo(() => {
    return `Attendance window:  
      ${formatTime(windowTime)} -> ${endTimeFormatted}
        All time entries within this window belong to the same attendance day.
    `;
    }, [windowTime]);


  useEffect(() => {
    dispatch(getShifts())
    setLoading( false )
  }, [])

  useEffect(() => {
    setShifts(attendancesApi?.shiftDetails)
  },[attendancesApi?.shiftDetails])

  

  // ✅ Add / Update Shift
  const handleSaveShift = () => {
    if (!shiftName.trim()) {
        setError("Shift name is required");
        return;
    }
    const nameExists = shifts?.some(
    (s, i) =>
        i !== editingIndex &&
        s?.name?.toLowerCase() === shiftName?.trim()?.toLowerCase()
    );

    if (nameExists) {
        setError("Shift name already exists");
        return;
    }
    if (!startTime) {
      setError("Start time is required");
      return;
    }

    // Convert time to minutes for comparison
    const toMinutes = (time) => {
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
    };

    const newStart = toMinutes(startTime);

    const hasConflict = shifts.some((shift, index) => {
        if (editingIndex === index) return false;

        const existingStart = toMinutes(shift.startTime);
        const newStart = toMinutes(startTime);

        return existingStart === newStart; // ❗ only exact duplicate allowed check
    });
    if (hasConflict) {
        setError("This shift conflicts with an existing shift.");
        return;
    }

    const newShift = {
        name: shiftName,
        windowTime,
      startTime,
      endTime//: calculateEndTime(startTime)
    };
    setLoading( true )
    if (editingIndex !== null) {
      const updated = [...shifts];
      updated[editingIndex]['name'] = newShift['name'];
      updated[editingIndex]['startTime'] = newShift['startTime'];
      updated[editingIndex]['endTime'] = newShift['endTime'];
      updated[editingIndex]['windowTime'] = newShift['windowTime'];
      setShifts(updated);
      dispatch(handleSaveShifts({shifts: updated[editingIndex]}))
    } else {
      setShifts([...shifts, newShift]);
      dispatch(handleSaveShifts({shifts: newShift}))
    }
    
    resetForm();
  };

  const resetForm = () => {
    setShiftName("");
    setStartTime("00:00");
    setEndTime("00:00");
    setEditingIndex(null);
    setShowForm(false);
    setError("");
  };

  // ✅ Edit
  const handleEdit = (index) => {
    const shift = shifts[index];
    setShiftName(shift.name);
    setStartTime(shift.startTime);
    setEndTime(shift.endTime)
    setWindowTime(shift.windowTime || '00:00')
    setEditingIndex(index);
    setShowForm(true);
  };

  // ✅ Delete
  const handleDelete = (index, id) => {
    const updated = shifts.filter((_, i) => i !== index);
    setShifts(updated);
    dispatch(deleteShift(id))
  };

  const getWindowEndTime = (windowTime) => {
        const [hours, minutes] = windowTime.split(":").map(Number);

        // Create date from windowTime
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);

        // Add 23 hours 59 minutes
        date.setHours(date.getHours() + 23);
        date.setMinutes(date.getMinutes() + 59);

        const endHours = String(date.getHours()).padStart(2, "0");
        const endMinutes = String(date.getMinutes()).padStart(2, "0");

        return `${endHours}:${endMinutes}`;
    }

  return (
    <>
      {!showForm && (
        <Button variant="primary" className="mb-3" onClick={() => setShowForm(true)}>
          + Add Shift
        </Button>
      )}
      {/* ✅ LIST VIEW */}
      {!showForm && (
        <>
          {shifts?.length === 0 ? (
            <p className="text-muted">No shifts added yet.</p>
          ) : (
            <div className="shift--table">
              <Table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Break Window</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts?.map((shift, index) => (
                    <tr key={index}>
                      <td>{shift?.name}</td>
                      <td>{formatTime(shift.startTime)}</td>
                      <td>{formatTime(shift.endTime)}</td>
                      <td>{formatTime(shift?.windowTime || '00:00')} - {getWindowEndTime(shift?.windowTime || '00:00')}</td>
                      <td>
                        <BsPencil
                          style={{ cursor: "pointer", marginRight: 10 }}
                          onClick={() => handleEdit(index)}
                        />
                        {
                            shifts?.length > 1 && (
                                <BsTrash
                                    style={{ cursor: "pointer", color: "red" }}
                                    onClick={() => handleDelete(index, shift?._id)}
                                />
                            )
                        }
                        
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </>
      )}

      
        {/* ✅ FORM VIEW */}
        {showForm && (
          <>
            <Row className="mb-3">
                <Col>
                    <Form.Label>Shift Name</Form.Label>
                    <Form.Control
                    type="text"
                    placeholder="e.g. Day Shift, Night Shift, General Shift"
                    value={shiftName}
                    onChange={(e) => setShiftName(e.target.value)}
                    />
                </Col>
            </Row>
            <div className="shift--setting bg-light p-3 border rounded-3 mb-3">
              <h4 className="mb-4 fs-6">Shift Settings<small className="d-block fw-normal">Define your work hours and when the attendance day resets.</small></h4>
              <p className="fw-semibold">Shift Hours</p>
              <Row className="mb-3">
                <Col>
                  <Form.Label>Start Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </Col>

                <Col>
                  <Form.Label>End Time</Form.Label>
                  <Form.Control type="time" readOnly value={endTime} onChange={(e) => setEndTime(e.target.value)} 
                  />
                </Col>
                <p className="mt-2">Tracked to identify late arrivals, early departures, and overtime.</p>
              </Row>

              {error && <Alert variant="danger">{error}</Alert>}

              <p className="fw-semibold border-top pt-4 mt-4">Attendance Day Window</p>
              <Row className="mb-3">
                <Col>
                  <Form.Label>When does the attendance day reset?</Form.Label>
                  <Form.Control
                    type="time"
                    value={windowTime}
                    onChange={(e) => setWindowTime(e.target.value)}
                  />
                </Col>
              </Row>
              <Alert variant="warning" style={{ whiteSpace: "pre-line" }}>
                {dynamicText}
              </Alert>
              <Alert variant="warning" style={{ whiteSpace: "pre-line" }}>
                Example:
                Night Shift: Work hours 21:00–06:00, day resets at 05:00. An employee clocking in at 02:00 is counted under the previous calendar date.
              </Alert>
            </div>
          </>
        )}
      {showForm && (
        <Card.Footer className="d-flex justify-content-end">
            <Button
              variant="outline-secondary"
              className="me-2"
              onClick={resetForm}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveShift}>
              {editingIndex !== null ? "Update" : "Save"}
            </Button>
          </Card.Footer>
        )}
      </>
  );
};

export default ShiftDetailsModal;