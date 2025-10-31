import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form, Badge, ButtonGroup, ToggleButton, Modal, ListGroup } from "react-bootstrap";
import { FiGlobe, FiUsers, FiCheck } from "react-icons/fi";
import { BsTags } from "react-icons/bs";
import { MdOutlineClose } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { createSubscription, saveAuthorization, getActiveSubscription, subscribeFreePlan, subscribeTrialPlan } from "../../redux/actions/subscription.action";

function SubscriptionPlans() {
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
    }, 1000)
  }, [])

  useEffect(() => {
    setLoading(false)
    setShowConfirm(false);
    if (subscriptionState.success === 'success' && subscriptionState.authorizeData) {
      authorizeSubscriptionPayment(subscriptionState.authorizeData)
    }
  }, [subscriptionState])

  //   useEffect(() => {
  //     if(subscriptionState.activeSubscription){
  //       setActiveSubscription(subscriptionState.activeSubscription)
  //       navigate('/dashboard', { replace: true })

  //     }
  //   }, [subscriptionState.activeSubscription])

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
          if (response?.razorpay_payment_id) {
            dispatch(saveAuthorization({ ...response, subscription_id }))
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
    <>
      <div className="team--page subscription--page">
        <div className="page--wrapper py-5 pt-5 text-center">
          <Container>
            <h2 className="text-center mb-1">Choose Your Plan</h2>
            <p className="text-center mb-4">Start with a 14-day free trial. Charges apply only after the trial period.</p>
            {/* Number of Members Input */}
            <Form className="text-center">
              <Form.Group className="select--currency">
                <Form.Label><FiGlobe /> Select Currency</Form.Label>
                <Form.Select>
                  <option value="INR">₹ INR - Indian Rupee</option>
                  <option value="USD">$ USD - US Dollar</option>
                  <option value="EUR">€ EUR - Euro</option>
                  <option value="GBP">£ GBP - British Pound</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="select--size">
                <Form.Label><FiUsers /> Select Your Team Size</Form.Label>
                <div class="d-flex align-items-center gap-2 bg--teal p-2">
                  <Button variant="secondary" onChange={(e) => setMembers(Number(e.target.value))}>-</Button>
                  <Form.Control type="number" min="1" value={members} onChange={(e) => setMembers(Number(e.target.value))}/>
                  <Button variant="primary" onChange={(e) => setMembers(Number(e.target.value))}>+</Button>
                </div>
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
                      className={`h-100 plan-card text-center ${activeSubscription?.planId === plan.id ? "active-plan" : ""
                        }`}
                    >
                      {activeSubscription?.planId === plan.id && (
                        <Badge bg="success" style={{ position: "absolute", top: "10px", right: "10px" }}>Currently Active</Badge>
                      )}
                      <Card.Title>{plan.name}</Card.Title>
                      <Card.Body className="d-flex flex-column p-4">
                        
                        <p>Free for up to 3 members</p>
                        <div class="bg-gradient-primary p-3 mb-3 rounded-3">
                            <div class="text--small mb-1 text-uppercase">Free Forever</div>
                            <div class="text--large mb-2">FREE</div>
                            <div class="text-slate-600 mt-1">Up to 3 Team Members</div>
                        </div>
                        <div class="bg-gradient-primary bg-gradient-light p-3 mb-3 rounded-3">
                            <div class="text--small mb-1 text-uppercase">Discounted Price</div>
                            <div class="text--large mb-2">₹400<small>/user/month</small></div>
                            <div class="text-slate-600 mt-1">when billed yearly</div>
                        </div>
                        <div class="bg-gradient-primary bg-gradient-light p-3 mb-3 rounded-3">
                            <div class="text--small mb-1 text-uppercase">Your Total Cost</div>
                            <ListGroup>
                              <ListGroup.Item>Base Amount: <span>₹400</span></ListGroup.Item>
                              <ListGroup.Item className="font-weight-bold">50% Limited Offer: <span>-₹200</span></ListGroup.Item>
                              <ListGroup.Item className="font-weight-bold border-top pt-2">Final Price: <strong className="display-6">₹200</strong></ListGroup.Item>
                            </ListGroup>
                            <div class="text-slate-600 mt-1 mb-3 text-end">per month for 1 user</div>
                            <div class="bg-gradient-primary p-3 mb-3 rounded-3">
                              <div class="text--small mb-1 text-uppercase">You Save in 1 Year</div>
                              <div class="text--large display-5 mb-0">₹5,592</div>
                            </div>
                        </div>
                        <div className="in--free--plan">
                          <p className="mb-0"><strong>No Credit Card Required</strong></p>
                          <p><small>Get started immediately</small></p>
                        </div>
                        <div className="in--basic--plan">
                          <p className="mb-0"><strong>14 Days Free Trial</strong></p>
                          <p><small>Charges will apply after trial period</small></p>
                        </div>
                        <div className="in--pro--plan">
                          <p className="mb-0"><strong>14 Days Free Trial</strong></p>
                          <p><small>Charges will apply after trial period</small></p>
                        </div>
                        <Button
                          variant={
                            activeSubscription?.planId === plan.id
                              ? "outline-primary"
                              : "primary"
                          }
                          onClick={() => {
                            if (plan.id === 'free') {
                              activateFreePlan()
                            } else {
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
                        {/* <h5 className="text-muted text-decoration-line-through">
                          ₹{plan.pricePerUser}/user/month
                        </h5>
                        <h3 className="mb-3 text-primary">
                          ₹{finalPricePerUser.toFixed(0)}/user/{billingCycle}
                        </h3> */}

                        {/* Final Price Box */}
                        {/* <div
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
                        </div> */}
                        <h3 className="text-slate-700 text-uppercase mt-4 mb-3 border-bottom pb-2">Included Features</h3>
                        <ul className="list-unstyled text-start flex-grow-1 mb-4">
                          {plan.features.map((feature, idx) => (
                            <li key={idx}><FiCheck /> {feature}</li>
                          ))}
                        </ul>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
            <Row className="mt-5">
              <Col md="12">
                <div className="flex justify-center">
                  <Button disabled={loading} onClick={activateTrialPlan} className="d-flex align-items-center gap-2 px-6 py-3 shadow-3 mx-auto">
                    <span>{
                      loading ? 'Please wait...' : 'Skip for now and activate the 14 days free trial'
                    }</span>
                    <MdOutlineClose />
                  </Button>
                </div>
              </Col>
            </Row>

          </Container>
        </div>
      </div>
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered size="lg" className="subscription--modal theme--modal">
        <Modal.Header closeButton>
            <Modal.Title>
                <span className="nav--item--icon"><BsTags /></span>
                <strong>Subscription Confirmation <small>Let’s make something amazing together</small></strong>
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {priceDetails && (
            <>
              {/* Subscription Details */}
              <div className="bg-gradient-light rounded p-3 mb-4">
                <h6 className="fw-bold mb-3">SUBSCRIPTION DETAILS</h6>
                <ListGroup>
                  <ListGroup.Item>
                    <small>Plan Name</small>
                    <p className="text-uppercase mb-0">{priceDetails.plan.name}</p>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <small>Team Members</small>
                    {members} user{members > 1 ? "s" : ""}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <small>Payment Type</small>
                    <p className="text-primary mb-0">
                      {billingCycle === "yearly"
                        ? "Annual Payment (Billed Once a Year)"
                        : billingCycle === "quarterly"
                        ? "Quarterly Payment (Billed Every 3 Months)"
                        : "Monthly Payment"
                      }
                    </p>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <small>Next Payment Date</small>
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
                  </ListGroup.Item>
                </ListGroup>
              </div>

              {/* Price Calculation */}
              <div className="rounded bg-gradient-light p-3 mb-4">
                <h6 className="fw-bold mb-3">PRICE CALCULATION</h6>
                <ListGroup>
                  <ListGroup.Item>
                    <small>Discounted price per user</small>
                    <p className="mb-0 display-8">₹{priceDetails.discountedPricePerUser.toFixed(0)}<span>/user/month</span></p>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <small>Base calculation</small>
                    <p className="mb-0 d-flex align-items-center gap-3 justify-content-between w-100">
                      <span>₹{priceDetails.discountedPricePerUser.toFixed(0)} ×{" "}{members} user(s)</span> <strong className="display-8">= ₹{(priceDetails.discountedPricePerUser * members).toFixed(0)}</strong>
                    </p>
                  </ListGroup.Item>
                </ListGroup>
                {priceDetails.discountPercent > 0 && (
                  <div className="discount--offer rounded p-2 bg-warning-subtle my-3">
                    <small>{priceDetails.discountPercent}% Limited Offer Discount</small>
                  </div>
                )}
                <div className="annual--cost rounded p-3 bg-warning mt-3 mb-3">
                  <h6 className="fw-bold mb-2 text-uppercase">Annual COST BREAKDOWN</h6>
                  <div className="d-flex align-items-center justify-content-between gap-3 bg-white p-3 rounded fw-normal border border-warning">
                    <p className="mb-0">
                      {billingCycle === "yearly"
                      ? `₹${(priceDetails.discountedPricePerUser * members).toFixed(0)}/month × 12 months`
                      : billingCycle === "quarterly"
                      ? `₹${(
                          priceDetails.discountedPricePerUser * members
                        ).toFixed(0)}/month × 3 months`
                      : `₹${(
                        priceDetails.discountedPricePerUser * members
                      ).toFixed(0)}/month × 1 month`}
                    </p>
                    <p className="fw-bold display-8 mb-0">
                      = ₹{priceDetails.totalPerCycle.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="bg-gradient-primary p-3 text-center mb-3 rounded-3">
                  <div class="text--small mb-1 text-uppercase">Total Savings in 1 Year</div>
                  <div class="text-slate-600 mt-1">₹466/month × 12 months = ₹5,592</div>
                  <div class="text--large mb-0">₹5,592</div>
                </div>
                  
                
                {/* <p className="mb-1 text-muted">
                  Regular price per user:{" "}
                  <span className="text-decoration-line-through">
                    ₹{priceDetails.plan.pricePerUser}/user/month
                  </span>
                </p> */}

                

                {/* Cost Breakdown */}
                

                {/* Total Savings */}
                {/* {priceDetails.totalSavings > 0 && (
                  <div className="border rounded p-2 bg-success-subtle mt-3">
                    <p className="mb-0 text-success fw-bold">
                      You save ₹{priceDetails.totalSavings.toLocaleString()}!
                    </p>
                  </div>
                )} */}
              </div>

              {/* Final Total */}
              {/* <div className="border rounded p-3 bg-gradient-primary">
                <h6 className="fw-bold mb-2">FINAL TOTAL</h6>
                <p className="fw-bold fs-5 mb-0 text-primary">
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
              </div> */}

              <p className="bg-gradient-light mb-3 p-2 rounded-3">
                ✨ 14 Days Free Trial – Charges apply after trial period
              </p>

              <Form className="bg-gradient-light p-3 rounded" onSubmit={handleSubmit}>
                <h6 className="fw-bold mb-3 text-uppercase">Billing Information</h6>
                <Row className="mb-3">
                  <Form.Group as={Col} md="12">
                    <Form.Label>Full Name <sup className="text-danger">*</sup></Form.Label>
                    <Form.Control type="text" name="fullName" placeholder="Enter your full name" value={formData.fullName} onChange={handleChange} required/>
                  </Form.Group>
                </Row>

                <Row className="mb-3">
                  <Form.Group>
                    <Form.Label>Phone Number <sup className="text-danger">*</sup></Form.Label>
                    <Row>
                      <Col className="d-flex align-items-center gap-3">
                        <Form.Select disabled className="w-auto pe-5">
                          <option>+91</option>
                        </Form.Select>
                      
                        <Form.Control type="tel" name="phone" placeholder="Enter phone number" value={formData.phone} onChange={handleChange} required/>
                      </Col>
                    </Row>
                  </Form.Group>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Address Line 1 <sup className="text-danger">*</sup></Form.Label>
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
                    <Form.Label>City <sup className="text-danger">*</sup></Form.Label>
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
                    <Form.Label>State/Province <sup className="text-danger">*</sup></Form.Label>
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
                    <Form.Label>Postal Code <sup className="text-danger">*</sup></Form.Label>
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
                  <Form.Label>Country <sup className="text-danger">*</sup></Form.Label>
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

                <div className="p-3 border rounded bg-white mb-3" style={{ fontSize: "0.9rem" }}>
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
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>Cancel</Button>
          <Button variant="primary" disabled={loading}
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
    </>
  );
}

export default SubscriptionPlans;