import React from "react";
import { Container, Row, Col, Card, Button, Badge, ListGroup, Alert } from "react-bootstrap";

const PlanOverview = () => {
  return (
    <Container className="my-5" style={{ maxWidth: "800px" }}>
      {/* Upgrade Banner */}
      <Alert
        variant="success"
        className="d-flex justify-content-between align-items-center p-3 mb-4"
      >
        <div>
          <i className="bi bi-stars me-2"></i>
          <strong>Upgrade to yearly billing and save ₹6,000 in a year</strong>
        </div>
        <Button variant="success" className="fw-semibold">
          Upgrade Now <i className="bi bi-arrow-right"></i>
        </Button>
      </Alert>

      {/* Plan Card */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header
          className="bg-primary text-white d-flex justify-content-between align-items-center"
        >
          <div>
            <h5 className="mb-0">Pro Plan</h5>
            <small>Active</small>
          </div>
          <Badge bg="light" text="dark">
            Active
          </Badge>
        </Card.Header>

        <Card.Body>
          <h3 className="fw-bold mb-4">₹200 <small className="text-muted">/month</small></h3>

          <Row className="text-center mb-3">
            <Col>
              <div className="fw-semibold">Team Size</div>
              <div>5</div>
            </Col>
            <Col>
              <div className="fw-semibold">Billing Cycle</div>
              <div>Monthly</div>
            </Col>
            <Col>
              <div className="fw-semibold">Billing Day</div>
              <div>Day 15</div>
            </Col>
            <Col>
              <div className="fw-semibold">Next Billing</div>
              <div>15 November 2025</div>
            </Col>
          </Row>

          <div className="text-center">
            <Button variant="primary" className="px-4">
              Manage Plan
            </Button>
          </div>

          <Alert variant="warning" className="mt-4">
            <i className="bi bi-clock me-2"></i>
            <strong>14 Days Remaining in Trial</strong> – Submit your billing
            information — you won’t be billed until your trial period ends on{" "}
            <strong>8 November 2025</strong>.
          </Alert>

          <Alert variant="warning" className="d-flex justify-content-between align-items-center">
            <div>
              <i className="bi bi-exclamation-triangle me-2"></i>
              <strong>Scheduled Plan Change</strong> — Your plan will downgrade
              to <strong>Free Plan</strong> on your next billing cycle. <br />
              <small className="text-muted">Effective Date: 15 Nov 2025</small>
            </div>
            <Button variant="outline-danger" size="sm">
              Cancel
            </Button>
          </Alert>
        </Card.Body>
      </Card>

      {/* Billing History */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Billing History</h5>
          <Badge bg="secondary">3 Invoices</Badge>
        </Card.Header>

        <ListGroup variant="flush">
          {[
            {
              id: "INV-2024-001",
              date: "1 Oct 2024 - 31 Oct 2024",
              amount: "₹1,000",
              status: "Paid",
              latest: true,
            },
            {
              id: "INV-2024-002",
              date: "1 Sept 2024 - 30 Sept 2024",
              amount: "₹1,000",
              status: "Paid",
            },
            {
              id: "INV-2024-003",
              date: "1 Aug 2024 - 31 Aug 2024",
              amount: "₹800",
              status: "Paid",
            },
          ].map((invoice, i) => (
            <ListGroup.Item
              key={i}
              className="d-flex justify-content-between align-items-center"
            >
              <div>
                <div className="fw-semibold">{invoice.id}</div>
                <div className="text-muted small">{invoice.date}</div>
              </div>
              <div className="d-flex align-items-center gap-3">
                {invoice.latest && (
                  <Badge bg="info" text="dark">
                    Latest
                  </Badge>
                )}
                <div className="fw-semibold">{invoice.amount}</div>
                <Badge bg="success">{invoice.status}</Badge>
                <Button variant="outline-dark" size="sm">
                  <i className="bi bi-download"></i> Download
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card>
    </Container>
  );
};

export default PlanOverview;
