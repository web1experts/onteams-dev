import React, { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";
import Alert from "react-bootstrap/Alert";

export default function InvoicePreview({ invoice }) {
  if (!invoice) return null;

  const isUpgrade = invoice.total > 0;
    const isDowngrade = invoice.total <= 0; 

  const formatAmount = (amount) =>
    `₹${(amount / 100).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    })}`;

  const formatDate = (ts) =>
    new Date(ts * 1000).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <Card className="shadow-sm">
      <Card.Body>
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <h5 className="mb-0">{invoice.account_name}</h5>
            <small className="text-muted">Upcoming invoice preview</small>
          </Col>
          <Col className="text-end">
            {/* <Badge bg="secondary">Draft</Badge> */}
            <div className="text-muted mt-1">
              Next billing: {formatDate(invoice.period_end)}
            </div>
          </Col>
        </Row>

        {/* Customer */}
        <Row className="mb-4">
          <Col>
            <strong>Billed to</strong>
            <div>{invoice.customer_name}</div>
            <div className="text-muted">{invoice.customer_email}</div>
          </Col>
          <Col className="text-end text-muted">
            {invoice.customer_address?.city},{" "}
            {invoice.customer_address?.state},{" "}
            {invoice.customer_address?.country}
          </Col>
        </Row>

<Row className="justify-content-end mt-4">
            <Col md={4}>
                {isUpgrade && (
                <>
                    <Row className="mb-2">
                    <Col className="text-muted">Due now</Col>
                    <Col className="text-end fw-semibold">
                        {formatAmount(invoice.total)}
                    </Col>
                    </Row>
                    <Row className="text-muted small">
                    <Col>Next invoice</Col>
                    <Col className="text-end">
                        {formatAmount(0)}
                    </Col>
                    </Row>
                </>
                )}

                {isDowngrade && (
                <>
                    <Row className="mb-2">
                    <Col className="text-muted">Due now</Col>
                    <Col className="text-end fw-semibold">₹0.00</Col>
                    </Row>
                    <Row className="fw-semibold fs-5 border-top pt-2">
                    <Col>Next invoice credit</Col>
                    <Col className="text-end">
                        {formatAmount(Math.abs(invoice.total))}
                    </Col>
                    </Row>
                </>
                )}
            </Col>
            </Row>
        {/* Line items */}
        <Table responsive borderless>
          <thead className="border-bottom">
            <tr>
              <th>Description</th>
              <th className="text-end">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.data.map((line) => (
              <tr key={line.id}>
                <td>
                  {line.description}
                  {line.proration && (
                    <div className="text-muted small">
                      Proration adjustment
                    </div>
                  )}
                </td>
                <td className="text-end">
                  {formatAmount(line.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Summary */}
        {/* <Row className="justify-content-end mt-4">
          <Col md={4}>
            <Row className="mb-2">
              <Col className="text-muted">Subtotal</Col>
              <Col className="text-end">
                {formatAmount(invoice.subtotal)}
              </Col>
            </Row>

            {invoice.total_taxes > 0 && (
              <Row className="mb-2">
                <Col className="text-muted">Tax</Col>
                <Col className="text-end">
                  {formatAmount(invoice.total_taxes)}
                </Col>
              </Row>
            )}

            <Row className="fw-semibold fs-5 border-top pt-2">
              <Col>Total</Col>
              <Col className="text-end">
                {formatAmount(invoice.total)}
              </Col>
            </Row>
          </Col>
        </Row> */}
        <Row className="justify-content-end mt-4">
  <Col md={4}>

    {/* UPGRADE */}
    {isUpgrade && (
      <>
        <Row className="mb-2">
          <Col className="text-muted">Due now</Col>
          <Col className="text-end fw-semibold">
            {formatAmount(invoice.total)}
          </Col>
        </Row>

        <Row className="text-muted small">
          <Col>Next invoice</Col>
          <Col className="text-end">₹0.00</Col>
        </Row>
      </>
    )}

    {/* DOWNGRADE */}
    {isDowngrade && (
      <>
        <Row className="mb-2">
          <Col className="text-muted">Due now</Col>
          <Col className="text-end fw-semibold">₹0.00</Col>
        </Row>

        <Row className="fw-semibold fs-5 border-top pt-2">
          <Col>Next invoice credit</Col>
          <Col className="text-end">
            {formatAmount(Math.abs(invoice.total))}
          </Col>
        </Row>
      </>
    )}

  </Col>
</Row>


        {/* Footer */}
        <Alert variant="light" className="mt-4 mb-0 text-center small">
  {isUpgrade
    ? "This amount will be charged immediately."
    : "No payment will be charged today."}
</Alert>

      </Card.Body>
    </Card>
  );
}
