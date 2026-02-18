import React, { useMemo } from "react";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import { planPrices } from "../../helpers/plans";
export default function InvoicePreview({ invoice }) {
  // ✅ Hooks must be called always (even if invoice is null)

  // const formatAmount = (amount) =>
  //   `₹${((amount || 0) / 100).toLocaleString("en-IN", {
  //     minimumFractionDigits: 2,
  //     maximumFractionDigits: 2,
  //   })}`;

  const formatAmount = (amount) => {
  const value = Number(amount) || 0;
  const isNegative = value < 0;

  const formatted = (Math.abs(value) / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if(invoice?.currency === 'usd'){
    return `${isNegative ? "-" : ""}$${formatted}`;
  }else{
    return `${isNegative ? "-" : ""}₹${formatted}`;
  }
  
};

  const formatDate = (ts) =>
    new Date(ts * 1000).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const now = Math.floor(Date.now() / 1000);

  const prorationLines = useMemo(() => {
    if (!invoice?.lines?.data) return [];
    return invoice.lines.data.filter(
      (l) => l.parent?.subscription_item_details?.proration
    );
  }, [invoice]);

  const recurringLines = useMemo(() => {
    if (!invoice?.lines?.data) return [];
    return invoice.lines.data.filter(
      (l) => !l.parent?.subscription_item_details?.proration
    );
  }, [invoice]);

  const sumAmount = (lines) =>
    (lines || []).reduce((sum, l) => sum + (l.amount || 0), 0);

  const prorationTotal = sumAmount(prorationLines);
  const recurringTotal = sumAmount(recurringLines);

  const isPlanChange = prorationLines.length > 0;
  const isNewSubscription = !isPlanChange;

  const totalDueNow = invoice?.total || 0;
  const hasAmountDueNow = totalDueNow > 0;
  const hasCredit = invoice?.customerDetails?.balance //totalDueNow < 0;

  const taxAmount =
    typeof invoice?.tax === "number"
      ? invoice.tax
      : typeof invoice?.total_tax_amounts?.[0]?.amount === "number"
      ? invoice.total_tax_amounts[0].amount
      : Math.max(0, (invoice?.total || 0) - (invoice?.subtotal || 0));

  const showTrial =
    invoice?.trialEnd !== false &&
    typeof invoice?.trialEnd === "number" &&
    invoice.trialEnd > now;

  const trialDaysPending = showTrial
    ? Math.max(0, Math.ceil((invoice.trialEnd - now) / 86400))
    : 0;

  // const currentPlanText = invoice?.currentPlanLabel || "Current Plan";
  // const newPlanText = invoice?.newPlanLabel || "New Plan";

  // Get current plan from first negative line
const currentPlanLine = invoice?.lines?.data.find(l => l.amount < 0);
const currentPlanText = currentPlanLine
  ? currentPlanLine?.description?.match(/(\d+\s*×.*)/)?.[1]?.split(" after ")[0] // "Elite"
  : null;

// Get new plan from first non-proration line
let newPlanLine = invoice?.lines?.data.find(l => !l.parent?.subscription_item_details?.proration);
if( !newPlanLine){
  newPlanLine = invoice?.lines?.data[ invoice?.lines?.data?.length - 1];
}
const newPlanText = newPlanLine
  ? newPlanLine?.description?.split(" after ")[0]?.match(/(\d+\s*×.*)/)?.[1] // "Elite"
  : null;

  


  const SummaryRow = ({ label, value }) => (
    <Row className="py-2 border-top">
      <Col className="text-muted">{label}</Col>
      <Col className="text-end fw-semibold">{value}</Col>
    </Row>
  );

  const PlanUpdateSummary = () => (
    <Card className="border-0 shadow-sm mb-3">
      <Card.Body>
        <div className="text-uppercase text-muted fw-semibold small mb-3">
          Plan Update Summary
        </div>

        <div className="mb-3">
          <div className="text-muted small">Current Plan</div>
          <div className="fw-semibold">{currentPlanText}</div>
        </div>

        <div>
          <div className="text-muted small">New Plan</div>
          <div className="fw-semibold text-success">{newPlanText}</div>
        </div>
      </Card.Body>
    </Card>
  );

  const ProrationCard = () => (
    <Card className="border-0 shadow-sm mb-3">
      <Card.Body>
        <div className="fw-semibold mb-3">Prorated Calculation</div>

        {prorationLines.map((line) => (
          <Row key={line.id} className="py-2 border-top">
            <Col className="text-muted">{line.description}</Col>
            <Col className="text-end fw-semibold">
              {/* {(line.amount < 0) ? "-" : ""} */}
              {formatAmount(line.amount)}
            </Col>
          </Row>
        ))}
        {
          (prorationLines?.length === 1) && (
            <Row key={'new-line-item'} className="py-2 border-top">
              <Col className="text-muted">{newPlanLine?.description}</Col>
              <Col className="text-end fw-semibold">
               {formatAmount(newPlanLine?.amount)}
              </Col>
            </Row>
          )
        }
        
        
        {hasCredit !== 0 && hasCredit != null && (
          <Row key={'new-line-item'} className="py-2 border-top">
            <Col className="text-muted">Credit Balance:</Col>
            <Col className="text-end fw-semibold">
              {formatAmount(hasCredit)}
            </Col>
          </Row>
        )}

        <Row className="py-2 border-top">
          <Col className="fw-semibold">Net Amount</Col>
          <Col className="text-end fw-semibold">
            {/* {totalDueNow < 0 ? "-" : ""} */}
            {/* {formatAmount(Math.abs(totalDueNow))} */}
            {
                (hasCredit !== 0 && hasCredit != null) ?
                  formatAmount((Number(totalDueNow) || 0) + (Number(hasCredit) || 0))
                :
                  formatAmount(totalDueNow)
              }
          </Col>
        </Row>

        {/* Total Due Now */}
        {((Number(totalDueNow) || 0) + (Number(hasCredit) || 0) > 0) && (
          <div className="mt-3 p-3 rounded bg-success bg-opacity-10 d-flex justify-content-between align-items-center">
            <div className="fw-semibold">Total Due Now</div>
            <div className="fw-bold fs-4 text-success">
              {
                (hasCredit !== 0 && hasCredit != null) ?
                  formatAmount((Number(totalDueNow) || 0) + (Number(hasCredit) || 0))
                :
                  formatAmount(totalDueNow)
              }
            </div>
          </div>
        )}

       

        <div className="mt-3 p-3 rounded bg-primary bg-opacity-10 d-flex justify-content-between align-items-center">
          <div className="fw-semibold">Effective Immediately</div>
          <div className="fw-semibold text-primary">
            {formatDate(invoice?.created || now)}
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  const NewSubscriptionTotalCard = () => (
    <Card className="border-0 shadow-sm mb-3">
      <Card.Body>
        {recurringLines?.[0] && (
          <div className="d-flex justify-content-between align-items-start mb-3">
            
            {
              (invoice.trialEnd !== null && Number(recurringLines?.[0]?.pricing?.unit_amount_decimal) === 0) ?
              
              <><div>
                <div className="fw-semibold">
                  {
                    (() => {
                      const line = recurringLines?.[0];
                      if (!line) return null;

                      const qty = line.quantity;
                      const priceId = line?.pricing?.price_details?.price;

                      switch (priceId) {
                        case "free":
                          return `${qty} × Free`;

                        case "trial":
                          return `${qty} × Trial`;

                        default:
                          return `${qty} × ${line.description}`;
                      }
                    })()
                  }
                </div>
              </div>
              <div className="fw-bold fs-4">{formatAmount(planPrices[recurringLines?.[0]?.pricing?.price_details?.price] * recurringLines?.[0]?.quantity)}</div>
              </>
              :
              <><div>
                <div className="fw-semibold">{recurringLines[0].description}</div>
              </div>
              <div className="fw-bold fs-4">{formatAmount(recurringTotal)}</div>
              </>
            }
            
          </div>
        )}

        <SummaryRow
          label="Subtotal"
          value={
            
              (invoice.trialEnd !== null && Number(recurringLines?.[0]?.pricing?.unit_amount_decimal) === 0) ?
              <div className="fw-bold fs-4">{formatAmount(planPrices[recurringLines?.[0]?.pricing?.price_details?.price] * recurringLines?.[0]?.quantity)}</div>
              :
            formatAmount(invoice?.subtotal || recurringTotal)
          }
        />

        {taxAmount > 0 && (
          <SummaryRow label="Tax (18% GST)" value={formatAmount(taxAmount)} />
        )}

        <div className="mt-3 p-3 rounded bg-success bg-opacity-10 d-flex justify-content-between align-items-center">
          <div className="fw-semibold">Total</div>
          <div className="fw-bold fs-4 text-success">
             {
              (invoice.trialEnd !== null && Number(recurringLines?.[0]?.pricing?.unit_amount_decimal) === 0) ?
              <div className="fw-bold fs-4">{formatAmount(planPrices[recurringLines?.[0]?.pricing?.price_details?.price] * recurringLines?.[0]?.quantity)}</div>
              :
                formatAmount(invoice?.total || 0)

            }
          </div>
        </div>

        {showTrial && (
          <>
            <div className="mt-3 p-3 rounded bg-primary bg-opacity-10 d-flex justify-content-between align-items-center">
              <div className="fw-semibold">Trial Days Pending</div>
              <div className="fw-semibold text-primary">
                {trialDaysPending} days
              </div>
            </div>

            <div className="mt-3 p-3 rounded bg-light d-flex justify-content-between align-items-center">
              <div className="fw-semibold">Due on</div>
              <div className="fw-semibold">{formatDate(invoice.trialEnd)}</div>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );

  // ✅ Now safe to return null (hooks already executed)
  if (!invoice) return null;

  return (
    <div>
      {/* MODE 1: NEW SUBSCRIPTION */}
      {isNewSubscription && <NewSubscriptionTotalCard />}

      {/* MODE 2/3: PLAN CHANGE */}
      {isPlanChange && (
        <>
          <PlanUpdateSummary />
          <ProrationCard />
        </>
      )}
    </div>
  );
}
