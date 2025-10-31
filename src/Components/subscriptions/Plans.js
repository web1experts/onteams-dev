import React, { useEffect, useRef, useState } from "react";
import {useNavigate} from "react-router-dom";
import { Container, Row, Col, Card, Button, Form, Badge, ButtonGroup, ToggleButton, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { createSubscription, saveAuthorization, getActiveSubscription, subscribeFreePlan, subscribeTrialPlan } from "../../redux/actions/subscription.action";

function PlansPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const razorPayKey = process.env.REACT_APP_RAZORPAY_KEY
  const [plans] = useState([
    {
      id: "free",
      name: "Free",
      pricePerUser: 0,
      features: [
        "3 members",
        "Dedicated support",
        "Custom features & integrations",
        "Advanced security",
      ],
    },
    {
      id: "plan_RYrMylosZ72fKs",
      name: "Basic",
      pricePerUser: 1,
      features: [
        "Up to 5 members",
        "Basic support",
        "Access to core features",
      ],
    },
    {
      id: "plan_RYrNV77OrcUeIm",
      name: "Pro",
      pricePerUser: 2,
      features: [
        "Up to 50 members",
        "Priority support",
        "Advanced analytics",
        "Custom integrations",
      ],
    },
  ]);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postal: "",
    country: "India",
    agree: false,
  });
  const subscriptionState = useSelector((state) => state.subscription);
  const [activeSubscription, setActiveSubscription] = useState(null)
  const [authorizationData, setAuthorizationData] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [members, setMembers] = useState(1);
  const [loading, setLoading] = useState(false);
    const [billingCycle, setBillingCycle] = useState("monthly"); // monthly | quarterly | yearly
const [showConfirm, setShowConfirm] = useState(false);
const [priceDetails, setPriceDetails] = useState(null);
  // Adjust price based on billing cycle
  const getDiscountedPrice = (plan) => {
    switch (billingCycle) {
      case "yearly":
        return plan.pricePerUser * 0.6; // 40% OFF
      case "quarterly":
        return plan.pricePerUser * 0.8; // 20% OFF
      default:
        return plan.pricePerUser;
    }
  };

  const handlePlanSelect = (plan) => setSelectedPlan(plan);

  useEffect(() => {
    setTimeout(() => {
      dispatch(getActiveSubscription())
    },1000)
  },[])

  useEffect(() => {
    setLoading(false)
    setShowConfirm(false);
    if(subscriptionState.success === 'success' && subscriptionState.authorizeData){ 
      authorizeSubscriptionPayment(subscriptionState.authorizeData)
    }
  },[subscriptionState])

  useEffect(() => {
    if(subscriptionState.activeSubscription){
      setActiveSubscription(subscriptionState.activeSubscription)
      navigate('/dashboard', { replace: true })
     
    }
  }, [subscriptionState.activeSubscription])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handlePayment = async () => {
    
    if (!formData.agree) {
      alert("Please agree to the Terms & Conditions");
      return;
    }
    dispatch(
      createSubscription({
        plan_id: priceDetails.plan.id,
        initial_quantity: members,
        total_count: 12,
        ...formData
      })
    );
    
  }

  const handleSubmit = async (plan) => {
  if (!plan) return;
  

  const discountedPricePerUser = getDiscountedPrice(plan);
  const cycleMultiplier =
    billingCycle === "yearly" ? 12 : billingCycle === "quarterly" ? 3 : 1;
  const totalPerCycle = discountedPricePerUser * members * cycleMultiplier;
  const totalSavings =
    (plan.pricePerUser - discountedPricePerUser) * members * cycleMultiplier;
  const discountPercent =
    billingCycle === "yearly" ? 40 : billingCycle === "quarterly" ? 20 : 0;

  setPriceDetails({
    plan,
    discountedPricePerUser,
    cycleMultiplier,
    totalPerCycle,
    totalSavings,
    discountPercent,
  });

  setSelectedPlan(plan);
  setShowConfirm(true);
};


  const authorizeSubscriptionPayment = async (payload) => {
    try {
      setLoading(true)
      const { customer_id, subscription_id, plan_id } = payload;
      
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
          selectedPlan(null)
        },
        theme: {
          color: "#F37254",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Error creating subscription: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const activateFreePlan = () => {
    setLoading(true)
    dispatch(subscribeFreePlan())
  }

  const activateTrialPlan = () => {
    setLoading(true)
    dispatch(subscribeTrialPlan())
  }

  return (
    <div className="team--page dashboard--page">
      <div className="page--wrapper p-md-3 py-3 pt-5 mt-3 text-center">
      <Container>
      <h2 className="text-center mb-4">Choose Your Plan</h2>

      {/* Number of Members Input */}
      <Form className="text-center mb-4">
        <Form.Group className="d-inline-block">
          <Form.Label style={{ fontWeight: "bold", marginRight: "10px" }}>
            Number of Members:
          </Form.Label>
          <Form.Control
            type="number"
            min="1"
            style={{ display: "inline-block", width: "100px" }}
            value={members}
            onChange={(e) => setMembers(Number(e.target.value))}
          />
        </Form.Group>
      </Form>

      {/* Billing Cycle Tabs */}
      <div className="text-center mb-4">
        <ButtonGroup>
          {[
            { key: "yearly", label: "Yearly", discount: "40% OFF" },
            { key: "quarterly", label: "Quarterly", discount: "20% OFF" },
            { key: "monthly", label: "Monthly" },
          ].map((option) => (
            <ToggleButton
              key={option.key}
              id={`billing-${option.key}`}
              type="radio"
              variant={billingCycle === option.key ? "success" : "outline-secondary"}
              name="billing"
              value={option.key}
              checked={billingCycle === option.key}
              onChange={(e) => setBillingCycle(e.currentTarget.value)}
              style={{
                borderRadius: "25px",
                margin: "0 5px",
                position: "relative",
                padding: "10px 20px",
              }}
            >
              {option.discount && (
                <Badge
                  bg="warning"
                  text="dark"
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "-10px",
                    fontSize: "10px",
                    borderRadius: "8px",
                  }}
                >
                  {option.discount}
                </Badge>
              )}
              {option.label}
            </ToggleButton>
          ))}
        </ButtonGroup>
      </div>

      {/* Plan Cards */}
      <Row className="g-4">
        {plans.map((plan) => {
          const finalPricePerUser = getDiscountedPrice(plan);
          const total = finalPricePerUser * members;

          return (
            <Col key={plan.id} md={4}>
              <Card
                className={`h-100 plan-card text-center p-3 ${
                  activeSubscription?.planId === plan.id ? "active-plan" : ""
                }`}
              >
                {activeSubscription?.planId === plan.id && (
                  <Badge
                    bg="success"
                    style={{ position: "absolute", top: "10px", right: "10px" }}
                  >
                    Currently Active
                  </Badge>
                )}
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="mb-3">{plan.name}</Card.Title>

                  <h5 className="text-muted text-decoration-line-through">
                    ₹{plan.pricePerUser}/user/month
                  </h5>
                  <h3 className="mb-3 text-primary">
                    ₹{finalPricePerUser.toFixed(0)}/user/{billingCycle}
                  </h3>

                  {/* Final Price Box */}
                  <div
                    style={{
                      border: "2px solid #ddd",
                      borderRadius: "8px",
                      padding: "15px",
                      background: "#f9f9f9",
                      marginTop: "10px",
                    }}
                  >
                    <strong>Final Price:</strong>
                    <h4 className="mt-2 mb-0 text-success">₹{total.toFixed(0)}</h4>
                    <div style={{ fontSize: "14px", color: "#555" }}>
                      per {billingCycle} for {members} user
                      {members > 1 ? "s" : ""}
                    </div>
                  </div>

                  <ul className="list-unstyled text-start flex-grow-1 mt-3 mb-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx}>• {feature}</li>
                    ))}
                  </ul>

                  <Button
                    variant={
                      activeSubscription?.planId === plan.id
                        ? "outline-primary"
                        : "primary"
                    }
                    onClick={() => {
                      if(plan.id === 'free'){
                        activateFreePlan()
                      }else{
                        handleSubmit(plan)
                      }
                    }}
                    disabled={loading}
                  >
                    {activeSubscription?.planId === plan.id
                      ? "Selected"
                      : loading
                      ? "Please wait..."
                      : "Select Plan"}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
        <Row className="mt-5">
          <Col md="12">
            <div className="flex justify-center">
              <Button disabled={loading} onClick={activateTrialPlan} className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors px-6 py-3 rounded-lg bg-white hover:bg-slate-50 border-2 border-slate-400 font-semibold shadow-md">
                <span>{
                    loading ? 'Please wait...' : 'Skip for now and activate the 14 days free trial'
                  }</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x w-5 h-5"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
              </Button>
            </div>
          </Col>
        </Row>
      <style jsx>{`
        .plan-card {
          border: 1px solid #ddd;
          border-radius: 12px;
          transition: all 0.3s ease;
          position: relative;
        }

        .plan-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
        }

        .active-plan {
          border: 2px solid #007bff;
          background-color: #f0f8ff;
        }
      `}</style>
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered size="lg">
  <Modal.Header closeButton>
    <Modal.Title className="fw-semibold">Subscription Confirmation</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {priceDetails && (
      <>
        {/* Subscription Details */}
        <div className="border rounded p-3 mb-4">
          <h6 className="fw-semibold mb-3">SUBSCRIPTION DETAILS</h6>
          <div className="border rounded p-3 bg-light mb-3">
            <p className="mb-2">
              <strong>Plan:</strong> {priceDetails.plan.name}
            </p>
            <p className="mb-2">
              <strong>Team Members:</strong> {members} user
              {members > 1 ? "s" : ""}
            </p>
            <p className="mb-2">
              <strong>Payment Type:</strong>{" "}
              {billingCycle === "yearly"
                ? "Annual Payment (Billed Once a Year)"
                : billingCycle === "quarterly"
                ? "Quarterly Payment (Billed Every 3 Months)"
                : "Monthly Payment"}
            </p>
            <p className="mb-0 text-success">
              <strong>Next Payment Date:</strong>{" "}
              {new Date(
                Date.now() +
                  (billingCycle === "yearly"
                    ? 365
                    : billingCycle === "quarterly"
                    ? 90
                    : 30) *
                    24 *
                    60 *
                    60 *
                    1000
              ).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Price Calculation */}
        <div className="border rounded p-3 mb-4">
          <h6 className="fw-semibold mb-3">PRICE CALCULATION</h6>
          <p className="mb-1 text-muted">
            Regular price per user:{" "}
            <span className="text-decoration-line-through">
              ₹{priceDetails.plan.pricePerUser}/user/month
            </span>
          </p>
          <p className="mb-1">
            Discounted price per user:{" "}
            <span className="fw-semibold text-primary">
              ₹{priceDetails.discountedPricePerUser.toFixed(0)}/user/month
            </span>
          </p>
          <p className="mb-1">
            Base calculation: ₹{priceDetails.discountedPricePerUser.toFixed(0)} ×{" "}
            {members} user(s) = ₹
            {(priceDetails.discountedPricePerUser * members).toFixed(0)}
          </p>

          {priceDetails.discountPercent > 0 && (
            <div className="border rounded p-2 bg-warning-subtle my-3">
              <p className="mb-0 text-danger fw-semibold">
                {priceDetails.discountPercent}% Limited Offer Discount
              </p>
            </div>
          )}

          {/* Cost Breakdown */}
          <div className="border rounded p-3 bg-light">
            <h6 className="fw-semibold mb-2">COST BREAKDOWN</h6>
            <p className="mb-1">
              {billingCycle === "yearly"
                ? `Annual calculation: ₹${(
                    priceDetails.discountedPricePerUser * members
                  ).toFixed(0)}/month × 12 months`
                : billingCycle === "quarterly"
                ? `Quarterly calculation: ₹${(
                    priceDetails.discountedPricePerUser * members
                  ).toFixed(0)}/month × 3 months`
                : `Monthly calculation: ₹${(
                    priceDetails.discountedPricePerUser * members
                  ).toFixed(0)}/month × 1 month`}
            </p>
            <p className="fw-semibold text-dark mb-0">
              = ₹{priceDetails.totalPerCycle.toLocaleString()}
            </p>
          </div>

          {/* Total Savings */}
          {priceDetails.totalSavings > 0 && (
            <div className="border rounded p-2 bg-success-subtle mt-3">
              <p className="mb-0 text-success fw-semibold">
                You save ₹{priceDetails.totalSavings.toLocaleString()}!
              </p>
            </div>
          )}
        </div>

        {/* Final Total */}
        <div className="border rounded p-3 bg-light">
          <h6 className="fw-semibold mb-2">FINAL TOTAL</h6>
          <p className="fw-semibold fs-5 mb-0 text-primary">
            ₹{priceDetails.totalPerCycle.toLocaleString()}{" "}
            <small className="text-muted">
              for{" "}
              {billingCycle === "yearly"
                ? "1 Year"
                : billingCycle === "quarterly"
                ? "1 Quarter"
                : "1 Month"}
            </small>
          </p>
        </div>

        <p className="text-warning mb-3">
          ✨ 14 Days Free Trial – Charges apply after trial period
        </p>

        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group as={Col} md="12">
              <Form.Label>Full Name *</Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} md="3">
              <Form.Label>Country Code</Form.Label>
              <Form.Select disabled>
                <option>+91</option>
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} md="9">
              <Form.Label>Phone Number *</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Address Line 1 *</Form.Label>
            <Form.Control
              type="text"
              name="address1"
              placeholder="Street address, building, apartment"
              value={formData.address1}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Address Line 2</Form.Label>
            <Form.Control
              type="text"
              name="address2"
              placeholder="Additional address details (optional)"
              value={formData.address2}
              onChange={handleChange}
            />
          </Form.Group>

          <Row className="mb-3">
            <Form.Group as={Col} md="4">
              <Form.Label>City *</Form.Label>
              <Form.Control
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group as={Col} md="4">
              <Form.Label>State/Province *</Form.Label>
              <Form.Control
                type="text"
                name="state"
                placeholder="State or Province"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group as={Col} md="4">
              <Form.Label>Postal Code *</Form.Label>
              <Form.Control
                type="text"
                name="postal"
                placeholder="Postal code"
                value={formData.postal}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Country *</Form.Label>
            <Form.Select
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
            >
              <option>India</option>
              <option>United States</option>
              <option>United Kingdom</option>
              <option>Canada</option>
            </Form.Select>
          </Form.Group>

          <div
            className="p-3 border rounded bg-light mb-3"
            style={{ fontSize: "0.9rem" }}
          >
            <Form.Check
              type="checkbox"
              name="agree"
              checked={formData.agree}
              onChange={handleChange}
              label={
                <>
                  I agree to the{" "}
                  <a href="#" target="_blank" rel="noreferrer">
                    Terms & Conditions
                  </a>{" "}
                  and{" "}
                  <a href="#" target="_blank" rel="noreferrer">
                    Refund Policy
                  </a>
                </>
              }
              required
            />
          </div>
        </Form>
      </>
    )}
  </Modal.Body>

  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowConfirm(false)}>
      Cancel
    </Button>
    <Button
      variant="success"
      disabled={loading}
      onClick={() => {
        handlePayment()
      }}
    >
      {
        loading ? 'Please wait...' : 'Proceed to Payment'
      }
    </Button>
  </Modal.Footer>
</Modal>

    </Container>

      </div>
    </div>
  );
}

export default PlansPage;
