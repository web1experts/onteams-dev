import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Button, Form, Row, Col, Card, Badge} from 'react-bootstrap';
import { FiEdit3, FiTrash2 } from "react-icons/fi";
import { ListAttendanceStatuses, saveAttendanceStatuses } from "../../redux/actions/attendance.action";
import { FiPlus } from "react-icons/fi";

const AttendanceStatusManager = ({ toggle, show }) => {
  
  const [showRules, setRulesShow] = useState(false);
  const [form, setForm] = useState({
    ruleName: '',
    code: '',
    startHour: '00',
    startMinute: '00',
    endHour: '00',
    endMinute: '00',
    color: '#eab308',
  });
  const [errors, setErrors] = useState({
    ruleName: '',
    code: '',
    startHour: '',
    startMinute: '',
    endHour: '',
    endMinute: '',
    color: '',
  });
  const handleRulesClose = () => {
    setRulesShow(false);
    setForm({
      ruleName: '',
      code: '',
      startHour: '00',
      startMinute: '00',
      endHour: '00',
      endMinute: '00',
      color: '#eab308',
    })
  }
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


const removeStatus = (indexToRemove) => {
  if (attendanceStatus.length > 2) {
    // Filter out the removed index
    const updatedStatuses = attendanceStatus.filter((_, index) => index !== indexToRemove);

    // Build payload with updated statuses
    const payload = {
      statuses: updatedStatuses.map(status => ({
        label: status.label.trim(),
        from: status.from,
        code: status.code,
        to: status.to,
        color: status.color,
      }))
    };

    // Dispatch the updated payload
    dispatch(saveAttendanceStatuses(payload));
    setForm({
      ruleName: '',
      code: '',
      startHour: '00',
      startMinute: '00',
      endHour: '00',
      endMinute: '00',
      color: '#eab308',
    })
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
  

  const AttendanceCard = ({ index, total, color, label, code, from, to }) => {
    const showTrashIcon = total > 2 && index !== 0;

    return (
      <Card className="mb-3 rules--card">
        <Card.Body>
          <Row className="align-items-center">
            <Col xs="auto">
              <div className={`rules--bg`} style={{'background': color}}></div>
            </Col>
            <Col className="ps-0">
              <strong className="d-flex align-items-center gap-2">{label} <Badge bg="light" text="dark">{code}</Badge></strong>{' '}
              <p className="mb-0">{decimalToTimeRange(from, to)}</p>
            </Col>
            <Col xs="auto" className="rules--actions">
              <FiEdit3 />
              {showTrashIcon && <FiTrash2 onClick={() => removeStatus(index)} />}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  // const data = attendanceData; // Replace with state if dynamically updating
  // const totalCards = data.length;

  

 const handleRulesChange = (field, value) => {
  const updatedForm = { ...form, [field]: value };

  // If startHour or startMinute was updated, also update endHour
  if (field === 'startHour' || field === 'startMinute') {
    const startTime = parseInt(updatedForm.startHour) + parseInt(updatedForm.startMinute) / 60;

    // Find first hour > startTime
    const nextEndHour = hours.find((h) => parseInt(h) > startTime);

    // Set to found value or default to last hour
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
const convertToDecimalTime = (hour, minute) => {
  return parseFloat((parseInt(hour) + parseInt(minute) / 60).toFixed(2));
};

const decimalToTimeRange = (from, to) => {
  const formatTime = (decimal) => {
    const hours = Math.floor(decimal);
    const minutes = Math.round((decimal - hours) * 60);
    return `${hours}:${String(minutes).padStart(2, '0')}`;
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
    if (value.trim() === '') {
      hasError = true;
      newErrors[key] = `${key} cannot be blank.`;
    }
  }

  attendanceStatus.forEach((status) => {
    const existingFrom = parseFloat(status.from);
    const existingTo = parseFloat(status.to);
    console.log(`${startTime} < ${existingTo} && ${endTime} > ${existingFrom}`)
    
      // Only run conflict check if the time range is valid
      attendanceStatus.forEach((status) => {
        const existingFrom = parseFloat(status.from);
        const existingTo = parseFloat(status.to);

        const isOverlapping = startTime < existingTo && endTime > existingFrom;

        if (isOverlapping) {
          hasError = true;
          newErrors["timeConflict"] = `Time range conflicts with existing status "${status.label}".`;
        }
      });
    
  });
console.log(newErrors)
  setErrors(newErrors);

  if (hasError) {
    return;
  }

  setLoading(true)
  
    const payload = {
      statuses: [
        ...attendanceStatus.map(status => ({
          label: status.label.trim(),
          from: status.from,
          to: status.to,
          color: status.color,
        })),
        {
          label: form.ruleName.trim(),
          code: form.code.trim(),
          from: startTime,
          to: endTime,
          color: form.color
        }
      ]
    };
    dispatch(saveAttendanceStatuses(payload))
    setLoading(false)
    
    handleRulesClose()
  // Proceed with API logic or further actions
};


  return (
    <>
      <Modal show={show} onHide={toggle} centered size="lg" className="status--modal rules--modal">
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title>
            <strong>Attendance Rules Configuration <small>Configure time ranges and attendance categories</small></strong>
          </Modal.Title>
          {
            (attendanceStatus?.length < 7) && (
            <Button variant="primary" onClick={handleRulesShow}><FiPlus/> Add Rule</Button>
            )
          }
          
        </Modal.Header>
        <Modal.Body>
          {attendanceStatus.map((item, index) => (
            <AttendanceCard key={index} {...item} index={index} total={attendanceStatus?.length} />
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
              {showError("ruleName")}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Short Name (Max 2 characters)</Form.Label>
              <Form.Control type="text" maxLength={2} placeholder="e.g., P, A, HD" value={form.code} onChange={(e) => handleRulesChange('code', e.target.value)}/>
              {showError("code")}
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
                {showError("startHour")}
              </Col>
              <Col>
                <Form.Label><small>Minutes</small></Form.Label>
                <Form.Select value={form.startMinute} onChange={(e) => handleRulesChange('startMinute', e.target.value)}>
                  {minutes.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </Form.Select>
                {showError("startMinute")}
              </Col>
            </Row>

            <Row className="mb-3">
              <Form.Label>End Time</Form.Label>
              <Col>
                <Form.Label><small>Hours</small></Form.Label>
                <Form.Select
                  value={form.endHour}
                  onChange={(e) => handleRulesChange('endHour', e.target.value)}
                >
                  {(() => {
                    const startInMinutes = parseInt(form.startHour) * 60 + parseInt(form.startMinute);
                    
                    return hours
                      .filter((h) => {
                        const hourInMinutes = parseInt(h) * 60;
                        return hourInMinutes > startInMinutes;
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
                <Form.Label><small>Minutes</small></Form.Label>
                <Form.Select value={form.endMinute} onChange={(e) => handleRulesChange('endMinute', e.target.value)}>
                  {minutes.map((m) => (
                    <option key={m} value={m}>{m}</option>
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
            {showError("timeConflict")}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleRulesClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Save Rule</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AttendanceStatusManager;
