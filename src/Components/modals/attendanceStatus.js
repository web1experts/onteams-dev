import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { BsTrash } from "react-icons/bs";
import { ListAttendanceStatuses, saveAttendanceStatuses } from "../../redux/actions/attendance.action";

const AttendanceStatusManager = ({ toggle, show }) => {
  const dispatch = useDispatch();
  const apiResult = useSelector((state) => state.attendance);
  const [attendanceStatus, setAttendanceStatus] = useState([]);
    const [loading, setLoading] = useState(false)
  const listStatuses = () => {
    dispatch(ListAttendanceStatuses());
  };
  useEffect(() => {
    listStatuses();
  }, []);

  useEffect(() => {
    if( apiResult.attendanceStatuses){
      setAttendanceStatus(apiResult.attendanceStatuses)
    }
  
  }, [apiResult])

 

const handleChange = (index, field, value) => {
  setAttendanceStatus((prev) =>
    prev.map((status, i) =>
      i === index
        ? { ...status, [field]: field === "label" ? value : Number(value) }
        : status
    )
  );
};


const addStatus = () => {
  setAttendanceStatus([...attendanceStatus, { from: 0, to: 1, label: "" }]);
};

const removeStatus = (indexToRemove) => {
  if (attendanceStatus.length > 2) {
    setAttendanceStatus(attendanceStatus.filter((_, index) => index !== indexToRemove));
  }
};

  const saveStatuses = () => {
    setLoading(true)
    const payload = {
        statuses: attendanceStatus.map(status => ({
            label: status.label.trim(),
            from: status.from,
            to: status.to,
        })),
    };
    dispatch(saveAttendanceStatuses(payload))
    setLoading(false)
  };

  return (
    <Modal
      show={show}
      onHide={toggle}
      centered
      size="md"
      className="status--modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Attendance Statuses</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {attendanceStatus.map((status, index) => (
            <div key={status.id} className="mb-4 p-3 border rounded bg-light">
              <Row className="align-items-center">
                <Col xs={12} md={6}>
                  <Form.Label>From: {status.from}h</Form.Label>
                  <Form.Range
                    min="0"
                    max="12"
                    step={0.01}
                    value={status.from}
                    onChange={(e) =>
                      handleChange(index, "from", e.target.value)
                    }
                  />
                </Col>
                <Col xs={12} md={6}>
                  <Form.Label>To: {status.to}h</Form.Label>
                  <Form.Range
                    min="0"
                    max="12"
                    step={0.01}
                    value={status.to}
                    onChange={(e) =>
                      handleChange(index, "to", e.target.value)
                    }
                  />
                </Col>
              </Row>
              <Row className="mt-3 align-items-center">
                <Col xs={10}>
                  <Form.Control
                    type="text"
                    placeholder="Status label (e.g. Present)"
                    value={status.label}
                    onChange={(e) =>
                      handleChange(index, "label", e.target.value)
                    }
                  />
                </Col>
                <Col xs={2} className="text-end">
                  {attendanceStatus.length > 2 && (
                    <Button
                      onClick={() => removeStatus(index)}
                      title="Remove Status"
                    >
                      <BsTrash />
                    </Button>
                  )}
                </Col>
              </Row>
            </div>
          ))}

          <div className="d-flex justify-content-between">
            <Button variant="outline-primary" onClick={addStatus}>
              <i className="bi bi-plus-circle me-2" />
              Add More
            </Button>
            <Button variant="primary" onClick={saveStatuses} disabled={loading}>
              <i className="bi bi-save me-2" />
              {loading ? 'Please wait...' :'Save'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AttendanceStatusManager;
