import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Button, Form, Row, Col, Card, Badge} from 'react-bootstrap';
import { FiEdit3, FiTrash2 } from "react-icons/fi";
import { ListAttendanceStatuses, saveAttendanceStatuses } from "../../redux/actions/attendance.action";
import { FiPlus } from "react-icons/fi";

const AttendanceStatusManager = ({ toggle, show }) => {
  
  const [showRules, setRulesShow] = useState(false);
  const handleRulesClose = () => setRulesShow(false);
  const handleRulesShow = () => setRulesShow(true);

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

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

const colorOptions = [
  '#ef4444', '#eab308', '#f97315', '#22c55d', '#3c82f6', '#a855f7', '#ec4899', '#6466f1'
];

  const attendanceData = [
    { color: 'absent', title: 'Absent', code: 'A', time: '0:00 - 1:59' },
    { color: 'halfday', title: 'Half Day', code: 'HD', time: '2:00 - 4:00' },
    { color: 'shortleave', title: 'Short Leave', code: 'SL', time: '4:01 - 6:00', badgeColor: 'orange' },
    { color: 'present', title: 'Present', code: 'P', time: '6:01 - 8:00' },
    { color: 'overtime', title: 'Overtime', code: 'OT', time: '8:01 - 12:00' },
  ];
  

  const AttendanceCard = ({ index, total, color, title, code, time }) => {
    const showTrashIcon = total > 1 && index !== 0;

    return (
      <Card className="mb-3 rules--card">
        <Card.Body>
          <Row className="align-items-center">
            <Col xs="auto">
              <div className={`rules--bg bg-${color}`}></div>
            </Col>
            <Col className="ps-0">
              <strong className="d-flex align-items-center gap-2">{title} <Badge bg="light" text="dark">{code}</Badge></strong>{' '}
              <p className="mb-0">{time}</p>
            </Col>
            <Col xs="auto" className="rules--actions">
              <FiEdit3 />
              {showTrashIcon && <FiTrash2 />}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  const data = attendanceData; // Replace with state if dynamically updating
  const totalCards = data.length;

  const [form, setForm] = useState({
    ruleName: '',
    shortName: '',
    startHour: '00',
    startMinute: '00',
    endHour: '00',
    endMinute: '00',
    color: '',
  });

  const handleRulesChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleColorSelect = (color) => {
    setForm({ ...form, color });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted form:', form);
    // add validation or API logic here
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
    <>
      <Modal show={show} onHide={toggle} centered size="lg" className="status--modal rules--modal">
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title>
            <strong>Attendance Rules Configuration <small>Configure time ranges and attendance categories</small></strong>
          </Modal.Title>
          <Button variant="primary" onClick={handleRulesShow}><FiPlus/> Add Rule</Button>
        </Modal.Header>
        <Modal.Body>
          {data.map((item, index) => (
            <AttendanceCard key={index} {...item} index={index} total={totalCards} />
          ))}
          {/* <Form>
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
          </Form> */}
        </Modal.Body>
      </Modal>
      <Modal show={showRules} centered onHide={handleRulesClose} backdrop="static" keyboard={false} size="md">
        <Modal.Header className="pb-0">
          <Modal.Title>Add New Rule</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Rule Name</Form.Label>
              <Form.Control type="text" placeholder="e.g., Present, Absent, Half Day" value={form.ruleName} onChange={(e) => handleRulesChange('ruleName', e.target.value)}/>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Short Name (Max 2 characters)</Form.Label>
              <Form.Control type="text" maxLength={2} placeholder="e.g., P, A, HD" value={form.shortName} onChange={(e) => handleRulesChange('shortName', e.target.value)}/>
            </Form.Group>

            <Row className="mb-3">
              <Form.Label>Start Time</Form.Label>
              <Col>
                <Form.Label><small>Hours</small></Form.Label>
                <Form.Select value={form.startHour} onChange={(e) => handleRulesChange('startHour', e.target.value)}>
                  {hours.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col>
                <Form.Label><small>Minutes</small></Form.Label>
                <Form.Select value={form.startMinute} onChange={(e) => handleRulesChange('startMinute', e.target.value)}>
                  {minutes.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            <Row className="mb-3">
              <Form.Label>End Time</Form.Label>
              <Col>
                <Form.Label><small>Hours</small></Form.Label>
                <Form.Select value={form.endHour} onChange={(e) => handleRulesChange('endHour', e.target.value)}>
                  {hours.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col>
                <Form.Label><small>Minutes</small></Form.Label>
                <Form.Select value={form.endMinute} onChange={(e) => handleRulesChange('endMinute', e.target.value)}>
                  {minutes.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Color</Form.Label>
              <div className="d-flex flex-wrap gap-3 justify-content-between mt-2">
                {colorOptions.map((color) => (
                  <div
                    className='color--bg'
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    style={{
                      backgroundColor: color,
                      border: form.color === color ? '2px solid #444' : '2px solid transparent',
                    }}
                  ></div>
                ))}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleRulesClose}>Cancel</Button>
          <Button variant="primary">Save Rule</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AttendanceStatusManager;
