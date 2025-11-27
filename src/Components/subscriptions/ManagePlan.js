import React, { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Button, Row, Col, Form, Badge, Collapse, Modal, Container } from "react-bootstrap";
import { FiUsers, FiCalendar, FiCheck, FiSave, FiCreditCard } from "react-icons/fi";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { createSubscription, saveAuthorization, getActiveSubscription, subscribeFreePlan, subscribeTrialPlan, getBillingdetails, updateSubscription, updateQuantity } from "../../redux/actions/subscription.action";
import { plans } from "../../helpers/plans";
import { useToast } from "../../context/ToastContext";
import { Listmembers, listCompanyinvite} from "../../redux/actions/members.action";

export default function ManagePlan() {
  const dispatch = useDispatch()
  const addToast = useToast();
  const [spinner, setSpinner] = useState(true);
  
  const razorPayKey = process.env.REACT_APP_RAZORPAY_KEY
  const subscriptionState = useSelector((state) => state.subscription);
  const [activeSubscription, setActiveSubscription] = useState(null)
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [memberFeeds, setMemberFeed] = useState([]);
  const invitationsFeed = useSelector((state) => state.member.invitations);
  const [invitationsTotal, setInvitationsTotal] = useState(0)
  const memberFeed = useSelector((state) => state.member.members);
  const [teamMembers, setTeamMembers] = useState(1);
  const [ totalmembers, setTotalMembers] = useState(0);
  const [showFeatures, setShowFeatures] = useState(false);
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false);

  const handleListMember = async () => {
     
        await dispatch(Listmembers(1,''));
        await dispatch(
          listCompanyinvite(0, 'company')
        );
    };

  useEffect(() => {
    setSpinner(true)
    dispatch(getActiveSubscription())
    handleListMember();
  }, [])

  useEffect(() => {
    setTeamMembers(totalmembers)
  },[totalmembers])

  useEffect(() => {
    if (memberFeed && memberFeed.memberData) {
      setMemberFeed(memberFeed.memberData);
      setTotalMembers((totalmembers) + (memberFeed.memberData?.length || 0));

    }
    setTimeout(() => {
      setSpinner(false)
    },800)
  }, [memberFeed]);

    useEffect(() => {
      if (invitationsFeed && invitationsFeed.inviteData) {
        setInvitationsTotal(invitationsFeed.total);
        setTotalMembers((totalmembers) + invitationsFeed.total || 0);
      }
      setTimeout(() => {
        setSpinner(false)
      },800)
    }, [invitationsFeed]);
  

  useEffect(() => {
    if (subscriptionState.activeSubscription) {
      setActiveSubscription(subscriptionState.activeSubscription)
      setBillingCycle(subscriptionState.activeSubscription?.interval || 'monthly')
      const allPlans = [...plans.monthly, ...plans.quarterly, ...plans.yearly];

      const matchedPlan = allPlans.find(plan => plan.id === subscriptionState.activeSubscription.planId);

      // If found, set it in state
      if (matchedPlan) {
        setSelectedPlan(matchedPlan);
      } else {
        console.warn("No matching plan found for plan_id:", subscriptionState.activeSubscription.planId);
      }
      // const current_dashboard = localStorage.getItem('current_dashboard');
      
      // if (current_dashboard) {
      //   const parsedata = JSON.parse(current_dashboard)
      //   const updatedData = {...parsedata, ['subscription']: subscriptionState.activeSubscription}
        localStorage.setItem('active_subscription', JSON.stringify(subscriptionState.activeSubscription))
      // }
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

  const handleQuantitySubmit = (e) => {
    e.preventDefault()
    const payload = {
      quantity: teamMembers,
      selectedPlan: selectedPlan?.id
    }
    dispatch(updateQuantity(payload))
  }
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
      initial_quantity: teamMembers,
      billingCycle: billingCycle,
      name: selectedPlan.plan.name,
    }))
    setLoading(false)
    setShowConfirm(false);
  }

  useEffect(() => {
    setLoading(false)
    if (subscriptionState.success === 'success' && subscriptionState.authorizeData) {
      console.log('subscriptionState.authorizeData::: ', subscriptionState.authorizeData)
      authorizeSubscriptionPayment(subscriptionState.authorizeData)
    }
  }, [subscriptionState])

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
          if (response?.razorpay_payment_id) {
            dispatch(saveAuthorization({ ...response, subscription_id }))
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
    <>
      <div className="team--page manage--page">
        <div className="page--wrapper py-5 pt-5 text-start h-100">
          <Container>
            <Row className="justify-content-center">
              <Col md={10} lg={8}>
                <h2 className="fw-bold mb-1 d-flex align-items-center">Manage Your Plan <a className="fs-6 ms-auto" href="/plan-details">View Active Subscription</a></h2>
                <p>Upgrade, downgrade, or adjust your team size</p>
                <div className="bg-white rounded-4 shadow border p-4 mb-4">
                  <h4 className="text-xl fw-bold mb-4">Number of Team Members</h4>
                  <Form onSubmit={handleQuantitySubmit}>
                    <Form.Group className="d-flex align-items-center gap-3">
                      <Form.Label className="d-inline-flex align-items-center gap-2 form-label w-auto mb-0"><FiUsers /> Team Members</Form.Label>
                      <Form.Control type="number" className="w-50 flex-grow-1" min={totalmembers || 1} disabled={activeSubscription?.planId === 'free' || activeSubscription?.planId === 'trial'} value={teamMembers} onChange={(e) => {
                        if(activeSubscription?.planId !== 'free' && activeSubscription?.planId !== 'trial'){
                          setTeamMembers(Number(e.target.value)) 
                        }else{
                          return false;
                        }
                      }}/>
                      
                        {
                          
                          (selectedPlanData?.planId?.toLowerCase() !== 'free' && selectedPlanData?.planId?.toLowerCase() !== 'trial') && (
                            <Button type="submit" variant="primary">Update Members</Button>
                          )
                        }
                      
                    </Form.Group>
                  </Form>
                </div>
                {/* Plan Selection */}
                <div className="bg-white rounded-4 shadow border p-4 mb-4">
                  <h4 className="text-xl fw-bold mb-4">Choose Your Plan & Price Summary</h4>
                  <h6 className="fw-bold mb-2">Choose Your Plan</h6>
                  <Row className="mb-4">
                    {plans[billingCycle].map((plan) => (
                      <Col key={plan.name} md={4} className="mb-3">
                        <Card className={`h-100 text-center shadow-sm ${selectedPlan?.name === plan.name ? "modal--plan--card--active modal--plan--card p-4" : "modal--plan--card p-4"}`}
                          onClick={() => setSelectedPlan(plan)}
                          style={{ cursor: "pointer" }}
                        >
                          <Card.Body className="p-0">
                            {plan.discount > 0 && (
                              <Badge bg="success" pill className="mb-2">
                                {plan.discount}% OFF
                              </Badge>
                            )}
                            <Card.Title>{plan.name}</Card.Title>
                            <Card.Text className="small">
                              {plan.id === 'free'
                                ? `Free for up to 3 members`
                                : "Unlimited Team Members"}
                            </Card.Text>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                  {/* Billing Cycle */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold mb-2 d-inline-flex align-items-center gap-2"><FiCalendar /> Billing Cycle</Form.Label>
                    <Form.Select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)}>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly (Save 20%)</option>
                      <option value="yearly">Yearly (Save 40%)</option>
                    </Form.Select>
                  </Form.Group>
                  {/* Price Summary */}
                  <Card className="p-0 border-0 mb-4 summary--card flex-column">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <Card.Title className="fw-bold mb-0">Price Summary</Card.Title>
                      <Button variant="link" size="sm" className="text-decoration-none px-3 py-1 border-0" onClick={() => setShowFeatures((prev) => !prev)}>
                        {showFeatures ? (
                          <>
                            <span>Hide Features</span>
                            <FaChevronUp />
                          </>
                        ) : (
                          <>
                            <span>View Features</span>
                            <FaChevronDown />
                          </>
                        )}
                      </Button>
                    </div>
                    <Card.Body className="p-0">
                      {/* Collapsible Feature List */}
                      <Collapse in={showFeatures}>
                        <div className="mb-3 border-bottom pb-3">
                          <h5 className="text-slate-700 text-uppercase fw-bold">Plan Features</h5>
                          <ul>
                            {selectedPlanData?.features.map((feature, idx) => (
                              <li className="d-flex align-items-center gap-2" key={idx}><FiCheck /> {feature}</li>
                            ))}
                          </ul>
                        </div>
                      </Collapse>

                      <div>
                        <div className="mb-2 d-flex align-items-center justify-content-between gap-3">
                          <p className="mb-0">Price per user:</p>
                          <p className="mb-0 text-end">
                            {selectedPlanData?.pricePerUser > 0 && (
                              <small className=" d-block">
                                ₹{selectedPlanData?.pricePerUser}/month
                              </small>
                            )}
                            {/* <span className="fw-bold d-block">
                              ₹{discountPrice}/month
                            </span> */}
                          </p>
                        </div>
                        <p className="mb-2 d-flex align-items-center justify-content-between gap-3">Number of users: <strong className="text-end">{teamMembers}</strong></p>
                        {/* <div className="bg-gradient-primary p-3 mb-3 rounded-3">
                            <div className="text--small mb-1 text-uppercase">You Save in 1 Year</div>
                            <div className="text--large display-8">₹{totalSavings.toLocaleString()}</div>
                        </div> */}
                        {/* <p className="mb-3 d-flex align-items-center justify-content-between gap-3 fw-bold border-bottom pb-3">
                          Total per {billingCycle}: <strong className="display-6 fw-bold text-end">₹{totalPerCycle.toLocaleString()}</strong>
                        </p> */}
                        <p className="mb-0 d-flex align-items-center justify-content-between gap-3">
                          Total for{" "}
                          {billingCycle === "yearly"
                            ? "1 year"
                            : billingCycle === "quarterly"
                              ? "3 months"
                              : "1 month"}
                          : <strong className="text-end">₹{(teamMembers * selectedPlanData?.pricePerUser).toFixed(0)}</strong>
                        </p>

                      </div>
                    </Card.Body>
                  </Card>
                </div>
                {
                  (activeSubscription?.planId !== selectedPlanData?.id) && (
                  <Button variant="primary" disabled={loading} size="lg" className="w-100 fw-semibold" onClick={() => handleConfirm()}>
                    {loading ? 'Please wait...' : 'Update Plan'}
                  </Button>)
                }
                
                <div className="bg-white rounded-4 shadow border p-4 mb-4 border-danger mt-4">
                  <h5 className="fw-bold text-danger mb-3">Danger Zone</h5>
                  <p className="mb-3">Cancel your subscription. Your access will continue until your next billing cycle.</p>
                  <Button variant="danger" className="w-100 fw-bold">Cancel Subscription</Button>
                </div>
                <Form className="bg-white rounded-4 shadow border p-4">
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="bg-primary rounded-4 d-flex align-items-center justify-content-center billing--title--icon"><FiCreditCard /></div>
                    <div className="billing--title">
                      <h4 className="fw-bold mb-1">Billing Information</h4>
                      <p className="mb-0">Manage your billing and payment details</p>
                    </div>
                  </div>
                  <Row className="mb-3">
                    <Form.Group as={Col} md="12">
                      <Form.Label>Full Name <sup className="text-danger">*</sup></Form.Label>
                      <Form.Control type="text" name="fullName" value='Rakesh Kumar' required/>
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
                          <Form.Control type="tel" name="phone" value='9876543210' required/>
                        </Col>
                      </Row>
                    </Form.Group>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Address Line 1 <sup className="text-danger">*</sup></Form.Label>
                    <Form.Control
                      type="text"
                      name="address1"
                      value='123 MG Road, Koramangala'
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Address Line 2</Form.Label>
                    <Form.Control
                      type="text"
                      name="address2"
                      value='Near Metro Station'
                    />
                  </Form.Group>

                  <Row className="mb-3">
                    <Form.Group as={Col} md="4">
                      <Form.Label>City <sup className="text-danger">*</sup></Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value='Bangalore'
                        required
                      />
                    </Form.Group>
                    <Form.Group as={Col} md="4">
                      <Form.Label>State/Province <sup className="text-danger">*</sup></Form.Label>
                      <Form.Control
                        type="text"
                        name="state"
                        value='Karnataka'
                        required
                      />
                    </Form.Group>
                    <Form.Group as={Col} md="4">
                      <Form.Label>Postal Code <sup className="text-danger">*</sup></Form.Label>
                      <Form.Control
                        type="text"
                        name="postal"
                        value='560034'
                        required
                      />
                    </Form.Group>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Country <sup className="text-danger">*</sup></Form.Label>
                    <Form.Select name="country" required>
                      <option selected>India</option>
                      <option>United States</option>
                      <option>United Kingdom</option>
                      <option>Canada</option>
                    </Form.Select>
                  </Form.Group>

                  <Button variant="primary" className="w-100 mt-4 d-flex align-items-center justify-content-center gap-2 fw-bold"><FiSave /> Save Billing Information</Button>
                </Form>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
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
                  : "Monthly Payment (Billed Every Month)"
                }
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
              {/* <p className="mb-1 text-muted">
                Regular price per user:{" "}
                <span className="text-decoration-line-through">
                  ₹{selectedPlanData?.pricePerUser}/user/month
                </span>
              </p> */}
              <p className="mb-1">
                Discounted price per user:{" "}
                <span className="fw-semibold text-primary">
                  ₹{selectedPlanData?.pricePerUser}/user/month
                </span>
              </p>
              <p className="mb-1">Base calculation: ₹{selectedPlanData?.pricePerUser} × {teamMembers} user(s) = ₹{(selectedPlanData?.pricePerUser * teamMembers).toFixed(0)}</p>
            </div>

            {/* Cost Breakdown */}
            {billingCycle === "yearly" || billingCycle === "quarterly" ?
              <>
                <div className="annual--cost rounded p-3 mt-3 mb-3 border-warning border-2">
                  <h6 className="fw-bold mb-2 text-uppercase text-amber">{billingCycle} COST BREAKDOWN</h6>
                  <div className="bg-white p-3 rounded fw-normal border-1 border-warning text-dark border">
                    <span className="text--small">{billingCycle === 'yearly' ? 'Annual' : 'Quarterly'} calculation</span>
                    <div className="d-flex align-items-center justify-content-between gap-3">
                      <p className="mb-0">
                        {billingCycle === "yearly"
                        ? `₹${(selectedPlanData?.pricePerUser * teamMembers).toFixed(0)}/month × 12 months`
                        : billingCycle === "quarterly"
                        ? `₹${(
                            selectedPlanData?.pricePerUser * teamMembers
                          ).toFixed(0)}/month × 3 months`
                        : `₹${(
                          selectedPlanData?.pricePerUser * teamMembers
                        ).toFixed(0)}/month × 1 month`}
                      </p>
                      <p className="fw-bold display-8 mb-0 text-amber">
                        = ₹{selectedPlanData?.pricePerUser.toFixed(0) *  teamMembers * (billingCycle === 'quarterly' ? 3 : 12)}
                      </p>
                    </div>
                  </div>
                  <div className="text-center mt-3">
                    <p className="text--small mb-1 fw-normal text-amber">Total {billingCycle === 'yearly' ? 'Annual' : 'Quarterly'} Payment</p>
                    <div className="text--large mb-0 text-amber">₹{selectedPlanData?.pricePerUser.toFixed(0) * teamMembers * (billingCycle === 'quarterly' ? 3 : 12)}</div>
                  </div>
                </div>
                
                { <div className="bg-gradient-primary p-3 text-center mb-3 rounded-3">
                  <div className="text--small mb-1 text-uppercase text-emerald">Total Savings in {billingCycle === 'quarterly' ? '3 Months' : '1 Year' }</div>
                  <div className="text-slate-600 mt-1">
                    ₹{((selectedPlanData?.originalPrice - selectedPlanData?.pricePerUser) *  teamMembers).toFixed(0)}/month × {billingCycle === 'quarterly' ? 3 : 12} months = ₹
                    {(((selectedPlanData?.originalPrice - selectedPlanData?.pricePerUser)) *  teamMembers * (billingCycle === 'quarterly' ? 3 : 12)).toFixed(0)}
                  </div>
                  <div className="text--large mb-0 text-emerald mt-2">₹{
                    (( selectedPlanData?.originalPrice * teamMembers ) - (selectedPlanData?.pricePerUser * teamMembers)) * (billingCycle === "yearly" ? 12 : billingCycle === "quarterly" ? 3 : 1)
                    
                  }</div>
                </div>}
                </>
                :
                
                <>
                  <div className="bg-gradient-primary p-3 text-center mb-3 rounded-3">
                    <div className="text--small mb-1 text-uppercase">Your monthly payment</div>
                    <div className="text--large mb-0 text-emerald">₹{(selectedPlanData?.pricePerUser * teamMembers).toFixed(0)}</div>
                    <div className="text--small mb-1 text-lowercase">for {teamMembers} users</div>
                  </div>
                </>
                }
            {/* <div className="border rounded p-3 bg-light">
              <h6 className="fw-semibold mb-2">COST BREAKDOWN</h6>
              <p className="mb-1">
                {billingCycle === "yearly"
                  ? `₹${(selectedPlanData.pricePerUser * teamMembers).toFixed(0)}/month × 12 months`
                  : billingCycle === "quarterly"
                  ? `₹${(
                      selectedPlanData.pricePerUser * teamMembers
                    ).toFixed(0)}/month × 3 months`
                  : `₹${(
                    selectedPlanData.pricePerUser * teamMembers
                  ).toFixed(0)}/month × 1 month`}
                
              </p>
              <p className="fw-semibold text-dark mb-0">
                 = ₹{selectedPlanData.pricePerUser.toFixed(0) *  teamMembers * (billingCycle === 'quarterly' ? 3 : 12)}
              </p>
            </div> */}

            {/* Total Savings */}
            {/* {totalSavings > 0 && (
              <div className="border rounded p-2 bg-success-subtle mt-3">
                <p className="mb-0 text-success fw-semibold">
                  You save ₹{totalSavings.toLocaleString()}!
                </p>
              </div>
            )} */}
          </div>

          {/* Final Total */}
          {/* <div className="border rounded p-3 bg-light">
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
          </div> */}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConfirm}>Cancel</Button>
          <Button variant="success" disabled={loading} onClick={handleProceedToPayment}>Proceed to Payment</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}