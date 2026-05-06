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
        return calculateEndTime(startTime);
    }, [startTime]);

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
    return `Attendance window: Between ${formatTime(startTime)} and ${endTimeFormatted} (next day)

    Example: If shift starts at ${formatTime(
        startTime
    )}, all entries between ${formatTime(startTime)} and ${endTimeFormatted} are counted for the same attendance day.`;
    }, [startTime]);


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
      startTime,
      endTime: calculateEndTime(startTime)
    };
    setLoading( true )
    if (editingIndex !== null) {
      const updated = [...shifts];
      updated[editingIndex]['name'] = newShift['name'];
      updated[editingIndex]['startTime'] = newShift['startTime'];
      updated[editingIndex]['endTime'] = newShift['endTime'];
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
    setEditingIndex(index);
    setShowForm(true);
  };

  // ✅ Delete
  const handleDelete = (index, id) => {
    const updated = shifts.filter((_, i) => i !== index);
    setShifts(updated);
    dispatch(deleteShift(id))
  };

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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts?.map((shift, index) => (
                    <tr key={index}>
                      <td>{shift?.name}</td>
                      <td>{formatTime(shift.startTime)}</td>
                      <td>{formatTime(shift.endTime)}</td>
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
                  <Form.Label>End Time (Auto)</Form.Label>
                  <Form.Control type="time" readOnly disabled value={endTimeFormatted} //onChange={(e) => setEndTime(e.target.value)} 
                  />
                </Col>
              </Row>

              {error && <Alert variant="danger">{error}</Alert>}

              <p className="fw-semibold border-top pt-4 mt-4">Attendance Day Window</p>
              <Row className="mb-3">
                <Col>
                  <Form.Label>When does the attendance day reset?</Form.Label>
                  <Form.Control
                    type="time"
                    value={startTime}
                  />
                </Col>
              </Row>
              <Alert variant="warning" style={{ whiteSpace: "pre-line" }}>
                {dynamicText}
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