import React, { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  Button,
  Row,
  Col,
  Form,
  Badge,
  Container,
  Collapse,
  Modal
} from "react-bootstrap";
import { updateSubscription, saveAuthorization, getActiveSubscription } from "../../redux/actions/subscription.action";

const plans = {
  monthly: [
    { id: "free", name: "Free", price: 0, limit: 3, discount: 0,features: [
        "3 members",
        "Dedicated support",
        "Custom features & integrations",
        "Advanced security",
      ], },
    {id: "plan_RTjP0lgv1nmVhC", name: "Basic", price: 500, discount: 0,features: [
        "3 members",
        "Dedicated support",
        "Custom features & integrations",
        "Advanced security",
      ], },
    { id: "plan_RWvXN91H1qGktu", name: "Pro", price: 10000, discount: 0,features: [
        "3 members",
        "Dedicated support",
        "Custom features & integrations",
        "Advanced security",
      ], },
  ],
  quarterly: [
    { id: "free", name: "Free", price: 0, limit: 3, discount: 0,features: [
        "3 members",
        "Dedicated support",
        "Custom features & integrations",
        "Advanced security",
      ], },
    {id: "plan_RTjP0lgv1nmVhC", name: "Basic", price: 500, discount: 20,features: [
        "3 members",
        "Dedicated support",
        "Custom features & integrations",
        "Advanced security",
      ], },
    {  id: "plan_RWvXN91H1qGktu",name: "Pro", price: 10000, discount: 20,features: [
        "3 members",
        "Dedicated support",
        "Custom features & integrations",
        "Advanced security",
      ], },
  ],
  yearly: [
    { id: "free", name: "Free", price: 0, limit: 3, discount: 40,features: [
        "3 members",
        "Dedicated support",
        "Custom features & integrations",
        "Advanced security",
      ], },
    {id: "plan_RTjP0lgv1nmVhC", name: "Basic", price: 500, discount: 40,features: [
        "3 members",
        "Dedicated support",
        "Custom features & integrations",
        "Advanced security",
      ], },
    {  id: "plan_RWvXN91H1qGktu",name: "Pro", price: 10000, discount: 40,features: [
        "3 members",
        "Dedicated support",
        "Custom features & integrations",
        "Advanced security",
      ], },
  ],
};

export default function ManagePlan() {
  const dispatch = useDispatch()
  const razorPayKey = process.env.REACT_APP_RAZORPAY_KEY
  const subscriptionState = useSelector((state) => state.subscription);
  const [activeSubscription, setActiveSubscription] = useState(null)
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState({ id: "free", name: "Free", price: 0, limit: 3, discount: 0,features: [
        "3 members",
        "Dedicated support",
        "Custom features & integrations",
        "Advanced security",
      ], });
      
  const [teamMembers, setTeamMembers] = useState(1);
   const [showFeatures, setShowFeatures] = useState(false);
const [loading, setLoading] = useState( false)
const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    dispatch(getActiveSubscription())
  },[])

useEffect(() => {
    if(subscriptionState.activeSubscription){
      setActiveSubscription(subscriptionState.activeSubscription)
      const allPlans = [...plans.monthly, ...plans.quarterly, ...plans.yearly];

      const matchedPlan = allPlans.find(plan => plan.id === subscriptionState.activeSubscription.planId);

      // If found, set it in state
      if (matchedPlan) {
        setSelectedPlan(matchedPlan);
      } else {
        console.warn("No matching plan found for plan_id:",  subscriptionState.activeSubscription.planId);
      }
    }
  }, [subscriptionState.activeSubscription])

const handleConfirm = () => {
  setShowConfirm(true);
};

const handleCloseConfirm = () => {
  setShowConfirm(false);
};

const handleProceedToPayment = () => {
  
  updatePlan(); // your existing function
};
  const selectedPlanData = useMemo(() => {
    return plans[billingCycle]?.find((p) => p.name === selectedPlan?.name);
  }, [billingCycle, selectedPlan]);

  const discountPrice =
    selectedPlanData?.price -
    (selectedPlanData?.price * selectedPlanData?.discount) / 100;

  const cycleMultiplier =
    billingCycle === "yearly" ? 12 : billingCycle === "quarterly" ? 3 : 1;

  const totalPerCycle = discountPrice * teamMembers * cycleMultiplier;
  const totalSavings =
    (selectedPlanData?.price - discountPrice) * teamMembers * cycleMultiplier;

    const updatePlan = () => {
      setLoading(true)
      dispatch(updateSubscription({
        ...selectedPlan,
        total_count: 12,
        initial_quantity: teamMembers
      }))
      setLoading(false)
      setShowConfirm(false);
    }

    useEffect(() => {
        setLoading(false)
        if(subscriptionState.success === 'success' && subscriptionState.authorizeData){ console.log('subscriptionState.authorizeData::: ', subscriptionState.authorizeData)
          authorizeSubscriptionPayment(subscriptionState.authorizeData)
        }
      },[subscriptionState])

      const authorizeSubscriptionPayment = async (payload) => {
          try {
            setLoading(true)
            const { customer_id, subscription_id, planId } = payload;
            
            // Load Razorpay
            const options = {
              key: razorPayKey,
              subscription_id: subscription_id,
              recurring: 1,
              name: "Prime Teams",
              description: `${selectedPlan.name} Plan Subscription`,
              handler: function (response) {
                console.log("Subscription Authorized:", response);
                if(response?.razorpay_payment_id){
                  dispatch(saveAuthorization({...response, subscription_id}))
                }
                setLoading(false)
                setSelectedPlan(null)
              },
              theme: {
                color: "#F37254",
              },
            };
      
            const rzp = new window.Razorpay(options);
            rzp.open();
          } catch (err) {
            console.error(err);
            //alert("Error creating subscription: " + err.message);
          } finally {
            setLoading(false);
          }
        }

  return (
    <Container className="py-5" style={{ maxWidth: "800px" }}>
      <h4 className="fw-semibold mb-4">Choose Your Plan</h4>

      {/* Plan Selection */}
      <Row className="mb-4">
        {plans[billingCycle].map((plan) => (
          <Col key={plan.name} md={4} className="mb-3">
            <Card
              border={selectedPlan?.name === plan.name ? "primary" : "light"}
              className={`h-100 text-center shadow-sm ${
                selectedPlan?.name === plan.name ? "border-2" : ""
              }`}
              onClick={() => setSelectedPlan(plan)}
              style={{ cursor: "pointer" }}
            >
              <Card.Body>
                {plan.discount > 0 && (
                  <Badge bg="success" pill className="mb-2">
                    {plan.discount}% OFF
                  </Badge>
                )}
                <Card.Title>{plan.name}</Card.Title>
                <Card.Text className="text-muted small">
                  {plan.limit
                    ? `Free for up to ${plan.limit} members`
                    : "Unlimited Team Members"}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Billing Cycle */}
      <Form.Group className="mb-3">
        <Form.Label className="fw-medium">Billing Cycle</Form.Label>
        <Form.Select
          value={billingCycle}
          onChange={(e) => setBillingCycle(e.target.value)}
        >
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly (Save 20%)</option>
          <option value="yearly">Yearly (Save 40%)</option>
        </Form.Select>
      </Form.Group>

      {/* Team Members */}
      <Form.Group className="mb-4">
        <Form.Label className="fw-medium">Number of Team Members</Form.Label>
        <Form.Control
          type="number"
          min="1"
          value={teamMembers}
          onChange={(e) => setTeamMembers(Number(e.target.value))}
        />
      </Form.Group>

      {/* Price Summary */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <Card.Title className="fw-semibold mb-0">Price Summary</Card.Title>
            <Button
              variant="link"
              size="sm"
              className="text-decoration-none"
              onClick={() => setShowFeatures((prev) => !prev)}
            >
              {showFeatures ? "Hide Features ▲" : "View Features ▼"}
            </Button>
          </div>
          {/* Collapsible Feature List */}
          <Collapse in={showFeatures}>
            <div>
              <ul className="small text-muted mb-3">
                {selectedPlanData?.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
          </Collapse>
          
          <div className="text-muted small">
            <p className="mb-1">
              Price per user:{" "}
              {selectedPlanData?.price > 0 && (
                <span className="text-decoration-line-through me-2">
                  ₹{selectedPlanData?.price}/month
                </span>
              )}
              <span className="fw-semibold text-primary">
                ₹{discountPrice}/month
              </span>
            </p>
            <p className="mb-1">Number of users: {teamMembers}</p>
            <p className="text-success mb-1 fw-medium">
              You save: ₹{totalSavings.toLocaleString()}
            </p>
            <p className="mb-1">
              Total per {billingCycle}: ₹{totalPerCycle.toLocaleString()}
            </p>
            <p className="fw-semibold fs-5 mt-2">
              Total for 1{" "}
              {billingCycle === "yearly"
                ? "year"
                : billingCycle === "quarterly"
                ? "quarter"
                : "month"}
              : ₹{totalPerCycle.toLocaleString()}
            </p>
          </div>
        </Card.Body>
      </Card>

      <Button variant="primary" disabled={loading} size="lg" className="w-100 fw-semibold" onClick={() => handleConfirm()}>
        {loading ? 'Please wait...' : 'Update Plan'}
      </Button>
      <Modal show={showConfirm} onHide={handleCloseConfirm} centered size="lg">
  <Modal.Header closeButton>
    <Modal.Title className="fw-semibold">Subscription Confirmation</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {/* Subscription Details */}
    <div className="border rounded p-3 mb-4">
      <h6 className="fw-semibold mb-3">SUBSCRIPTION DETAILS</h6>
      <div className="border rounded p-3 bg-light mb-3">
        <p className="mb-2"><strong>Team Members:</strong> {teamMembers} user{teamMembers > 1 ? "s" : ""}</p>
        <p className="mb-2">
          <strong>Payment Type:</strong>{" "}
          {billingCycle === "yearly"
            ? "Annual Payment (Billed Once a Year)"
            : billingCycle === "quarterly"
            ? "Quarterly Payment (Billed Every 3 Months)"
            : "Monthly Payment"}
        </p>
        <p className="mb-0">
          <strong>Next Payment Date:</strong>{" "}
          {new Date(Date.now() + 
            (billingCycle === "yearly"
              ? 365
              : billingCycle === "quarterly"
              ? 90
              : 30
            ) * 24 * 60 * 60 * 1000
          ).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>
    </div>

    {/* Price Calculation */}
    <div className="border rounded p-3 mb-4">
      <h6 className="fw-semibold mb-3">PRICE CALCULATION</h6>
      <div className="mb-2">
        <p className="mb-1 text-muted">
          Regular price per user:{" "}
          <span className="text-decoration-line-through">
            ₹{selectedPlanData?.price}/user/month
          </span>
        </p>
        <p className="mb-1">
          Discounted price per user:{" "}
          <span className="fw-semibold text-primary">
            ₹{discountPrice}/user/month
          </span>
        </p>
        <p className="mb-1">Base calculation: ₹{discountPrice} × {teamMembers} user(s) = ₹{discountPrice * teamMembers}</p>
      </div>

      {selectedPlanData?.discount > 0 && (
        <div className="border rounded p-2 bg-warning-subtle mb-3">
          <p className="mb-0 text-danger fw-semibold">
            {selectedPlanData.discount}% Limited Offer Discount: -₹
            {((selectedPlanData.price * selectedPlanData.discount) / 100) * teamMembers}
          </p>
        </div>
      )}

      {/* Cost Breakdown */}
      <div className="border rounded p-3 bg-light">
        <h6 className="fw-semibold mb-2">COST BREAKDOWN</h6>
        <p className="mb-1">
          {billingCycle === "yearly"
            ? `Annual calculation: ₹${discountPrice * teamMembers}/month × 12 months`
            : billingCycle === "quarterly"
            ? `Quarterly calculation: ₹${discountPrice * teamMembers}/month × 3 months`
            : `Monthly calculation: ₹${discountPrice * teamMembers}/month × 1 month`}
        </p>
        <p className="fw-semibold text-dark mb-0">
          = ₹{totalPerCycle.toLocaleString()}
        </p>
      </div>

      {/* Total Savings */}
      {totalSavings > 0 && (
        <div className="border rounded p-2 bg-success-subtle mt-3">
          <p className="mb-0 text-success fw-semibold">
            You save ₹{totalSavings.toLocaleString()}!
          </p>
        </div>
      )}
    </div>

    {/* Final Total */}
    <div className="border rounded p-3 bg-light">
      <h6 className="fw-semibold mb-2">FINAL TOTAL</h6>
      <p className="fw-semibold fs-5 mb-0 text-primary">
        ₹{totalPerCycle.toLocaleString()}{" "}
        <small className="text-muted">
          for {billingCycle === "yearly"
            ? "1 Year"
            : billingCycle === "quarterly"
            ? "1 Quarter"
            : "1 Month"}
        </small>
      </p>
    </div>
  </Modal.Body>

  <Modal.Footer>
    <Button variant="secondary" onClick={handleCloseConfirm}>
      Cancel
    </Button>
    <Button variant="success" disabled={loading} onClick={handleProceedToPayment}>
      Proceed to Payment
    </Button>
  </Modal.Footer>
</Modal>


    </Container>
    
  );
}
