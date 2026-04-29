import React, { useState } from "react";
import { Modal, Tabs, Tab } from "react-bootstrap";
import AttendanceStatusManager from "./attendanceStatus";
import ShiftDetailsModal from "./shiftDetails";

const AttendanceSettingsModal = ({ show, toggle }) => {
  const [activeTab, setActiveTab] = useState("attendance");

  return (
    <Modal show={show} onHide={toggle} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Attendance Settings</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-3"
        >
          <Tab eventKey="attendance" title="Attendance Rule">
            <AttendanceStatusManager />
          </Tab>

          <Tab eventKey="shifts" title="Working Shifts">
            <ShiftDetailsModal />
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
};

export default AttendanceSettingsModal;