import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form, Badge, ButtonGroup, ToggleButton, Modal, ListGroup } from "react-bootstrap";
import { FiGlobe, FiUsers, FiCheck } from "react-icons/fi";
import { BsTags } from "react-icons/bs";
import { MdOutlineClose } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { currentMemberProfile } from "../../helpers/auth";
import { createSubscription, saveAuthorization, getActiveSubscription, subscribeFreePlan, subscribeTrialPlan, getBillingdetails } from "../../redux/actions/subscription.action";
import { selectboxObserver } from "../../helpers/commonfunctions";
import { Listmembers, listCompanyinvite} from "../../redux/actions/members.action";
import { countries } from "../../helpers/countries";
import { plans } from "../../helpers/plans";
import { useToast } from "../../context/ToastContext";
function SubscriptionPlans() {
  const addToast = useToast();
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [spinner, setSpinner] = useState(true);
  const memberProfile = currentMemberProfile();
  const [errors, setErrors] = useState({});
  const razorPayKey = process.env.REACT_APP_RAZORPAY_KEY
  
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

  const handleListMember = async () => {
   
      await dispatch(Listmembers(1,''));
      await dispatch(
        listCompanyinvite(0, 'company')
      );
  };
  const [memberFeeds, setMemberFeed] = useState([]);
    const invitationsFeed = useSelector((state) => state.member.invitations);
    const [invitationsTotal, setInvitationsTotal] = useState(0)
    const memberFeed = useSelector((state) => state.member.members);
  const subscriptionState = useSelector((state) => state.subscription);
  const [activeSubscription, setActiveSubscription] = useState(null)
  const [authorizationData, setAuthorizationData] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [members, setMembers] = useState(0);
  const [ totalmembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState("monthly"); // monthly | quarterly | yearly
  const [showConfirm, setShowConfirm] = useState(false);
  const [priceDetails, setPriceDetails] = useState(null);
  // Adjust price based on billing cycle
  const getDiscountedPrice = (plan) => {
    switch (billingCycle) {
      case "yearly":
        return plan.originalPrice * 0.6; // 40% OFF
      case "quarterly":
        return plan.originalPrice * 0.8; // 20% OFF
      default:
        return plan.pricePerUser;
    }
  };

  const handlePlanSelect = (plan) => setSelectedPlan(plan);

  useEffect(() => {
    setSpinner(true)
    setTimeout(() => {
      dispatch(getActiveSubscription())
      dispatch(getBillingdetails())
    }, 1000)
    handleListMember();
    
  }, [])

  useEffect(() => {
    setLoading(false)
    setShowConfirm(false);
    if (subscriptionState.success === 'success' && subscriptionState.authorizeData) {
      authorizeSubscriptionPayment(subscriptionState.authorizeData)
    }
  }, [subscriptionState])

  useEffect(() => {
    if(subscriptionState.activeSubscription){

      setActiveSubscription(subscriptionState.activeSubscription)
        const current_dashboard = localStorage.getItem('current_dashboard');
      
      if (current_dashboard) {
        const parsedata = JSON.parse(current_dashboard)
        const updatedData = {...parsedata, ['subscription']: subscriptionState.activeSubscription}
        // localStorage.setItem('active_subscription', JSON.stringify(subscriptionState.activeSubscription))
        localStorage.setItem('current_dashboard', JSON.stringify(updatedData))
      }

      if(subscriptionState?.message && subscriptionState.message_variant === 'success'){
        navigate('/dashboard', { replace: true })
      }
     
    }
  }, [subscriptionState.activeSubscription])

  useEffect(() => {
    setMembers(totalmembers)
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
      if(subscriptionState.billing_info){
        const billingInfo = {
          fullName: subscriptionState.billing_info?.meta_value?.fullName || "",
          phone: subscriptionState.billing_info?.meta_value?.phone || "",
          address1: subscriptionState.billing_info?.meta_value?.address1 || "",
          address2:subscriptionState.billing_info?.meta_value?.address2 || "",
          city: subscriptionState.billing_info?.meta_value?.city || "",
          state: subscriptionState.billing_info?.meta_value?.state || "",
          postal: subscriptionState.billing_info?.meta_value?.postal || "",
          country: subscriptionState.billing_info?.meta_value?.country || "India"
        };

        setFormData(billingInfo)

      }
    }, [subscriptionState.billing_info])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newErrors = { ...errors };
    newErrors[name] = ""; 
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setErrors(newErrors);
  };


  const validateForm = () => {
  const requiredFields = [
    "fullName",
    "phone",
    "address1",
    "city",
    "state",
    "postal",
    "country",
  ];

  let newErrors = {};

  requiredFields.forEach((field) => {
    if (!formData[field]) {
      newErrors[field] = "This field is required";
    }
  });

  if (!formData.agree) {
    newErrors.agree = "You must agree to the Terms & Conditions";
  }

  setErrors(newErrors);

  // If no errors, return true
  return Object.keys(newErrors).length === 0;
};

const showError = (name) => {
  if (errors[name]) {
    return <span className="error">{errors[name]}</span>;
  }
  return null;
};

  const handlePayment = async () => {
    // const { fullName, phone, address1, city, state, postal, country, agree } = formData;

    // // Validate required fields
    // if (!fullName || !phone || !address1 || !city || !state || !postal || !country) {
    //   alert("Please fill in all required fields.");
    //   return;
    // }
    if (!validateForm()) return;
    if (!formData.agree) {
      addToast("Please agree to the Terms & Conditions", 'danger');
      return;
    }
    setLoading(true)
    dispatch(
      createSubscription({
        plan_id: priceDetails.plan.id,
        initial_quantity: members,
        total_count: 12,
        billingCycle: billingCycle,
        name: priceDetails.plan.name,
        ...formData
      })
    );

  }

  const handleSubmit = async (plan) => {
    if (!plan) return;
     if(members <= 0){
      addToast('Please add number of team members first.', 'danger');
      return;
    }

    const discountedPricePerUser = plan.pricePerUser;
    const cycleMultiplier =
      billingCycle === "yearly" ? 12 : billingCycle === "quarterly" ? 3 : 1;
    const totalPerCycle = discountedPricePerUser * members * cycleMultiplier;
    const totalWithoutDiscount = plan.originalPrice * members * cycleMultiplier;
    // const totalSavings =
    //   (plan.pricePerUser - discountedPricePerUser) * members * cycleMultiplier;
    const discountPercent =
      billingCycle === "yearly" ? 40 : billingCycle === "quarterly" ? 20 : 0;

      const baseAmount = plan.originalPrice * members
      const total = discountedPricePerUser * members;
      
      const totalSavings = (baseAmount - total) * cycleMultiplier;


    setPriceDetails({
      plan,
      pricePerUser: plan.pricePerUser,
      discountedPricePerUser,
      originalPrice: plan.originalPrice,
      cycleMultiplier,
      totalPerCycle,
      totalSavings,
      discountPercent,
      totalWithoutDiscount,
      billingCycle
    });

    setSelectedPlan(plan);
    setShowConfirm(true);
    setTimeout(() => {
      selectboxObserver()
    },1000)
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
          setSelectedPlan(null)
        },
        modal: {
          ondismiss: function () {
            console.warn("⚠️ Payment popup closed by user (cancelled).");
            setLoading(false);
            // Optional: show a message or alert
            alert("Payment was cancelled. You can try again anytime.");
          },
        },
        theme: {
          color: "#F37254",
        },
      };

      const rzp = new window.Razorpay(options);
      // 🔴 Handle payment failure
      rzp.on("payment.failed", function (response) {
        console.error("❌ Payment Failed:", response.error);
        alert(`Payment failed: ${response.error.description || "Unknown error"}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Error creating subscription: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const activateFreePlan = () => {
    if(members < 1){
      addToast('Please add number of members first.', 'danger');
      return;
    }
    if(members > 3){
      addToast('You cannot activate free plan for more than 3 members.', 'danger');
      return;
    }
    setLoading(true)
    dispatch(subscribeFreePlan())
  }

  const activateTrialPlan = () => {
    if(members < 1){
      addToast('Please add number of members first.', 'danger');
      return;
    }
    setLoading(true)
    dispatch(subscribeTrialPlan({
        initial_quantity: members
      }))
  }

  return (
    <>
      <div className="team--page subscription--page">
        <div className="page--wrapper py-5 pt-5 text-center h-100">
          {spinner ? (
            <div className="loading-bar">
              <img src="images/OnTeam-icon-gray.png" className="flipchar" />
            </div>
          ) : (
          <Container>
            <h2 className="text-center mb-1">Choose Your Plan</h2>
            <p className="text-center mb-4">Start with a 14-day free trial. Charges apply only after the trial period.</p>
            {/* Number of Members Input */}
            <Form className="text-center">
              <Form.Group className="select--currency">
                <Form.Label><FiGlobe /> Select Currency</Form.Label>
                <Form.Select>
                  <option value="INR">₹ INR - Indian Rupee</option>
                  {/* <option value="USD">$ USD - US Dollar</option>
                  <option value="EUR">€ EUR - Euro</option>
                  <option value="GBP">£ GBP - British Pound</option> */}
                </Form.Select>
              </Form.Group>
              <Form.Group className="select--size">
                <Form.Label><FiUsers /> Select Your Team Size</Form.Label>
                <div className="d-flex align-items-center gap-2 bg--teal p-2">
                  <Button variant="secondary" onClick={() => setMembers(prev => Math.max(0, prev - 1))}>-</Button>
                  <Form.Control type="number" min={totalmembers || 1} value={members}  onChange={(e) => setMembers(Number(e.target.value))}/>
                  <Button variant="primary" onClick={() => setMembers(prev => prev + 1)}>+</Button>
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
              {plans[billingCycle].map((plan) => {
                const finalPricePerUser = plan.pricePerUser;//getDiscountedPrice(plan);
                const baseAmount = plan.originalPrice * members
                const total = finalPricePerUser * members;
                let months = 1;
                if (billingCycle === "quarterly") months = 3;
                if (billingCycle === "yearly") months = 12;
                const savedAmount = (baseAmount - total) * months;


                
                return (
                  <Col key={plan.id} md={4}>
                    <Card
                      className={`h-100 plan-card text-center ${activeSubscription?.planId === plan.id ? "active-plan" : ""
                        }`}
                    >
                      {activeSubscription?.planId === plan.id && (
                        <Badge bg="success" style={{ position: "absolute", top: "10px", right: "10px" }}>Active</Badge>
                      )}
                      <Card.Title>{plan.name}</Card.Title>
                      <Card.Body className="d-flex flex-column p-4">
                        
                        <p>{plan.members_text}</p>
                        {plan.id === 'free' ? 
                          <div className="bg-gradient-primary p-3 mb-3 rounded-3">
                              <div className="text--small mb-1 text-uppercase">Free Forever</div>
                              <div className="text--large mb-2">FREE</div>
                              <div className="text-slate-600 mt-1">Up to 3 Team Members</div>
                          </div> 
                          :
                          billingCycle !== 'monthly' ? 
                            <>
                              {/* <p>Regular Price</p> */}
                              <div className="bg-gradient-primary bg-gradient-light p-3 mb-3 rounded-3">
                                <div className="text--small mb-1 text-uppercase">Discounted Price</div>
                                <div className="text--large display-5 mb-0">₹{plan.pricePerUser.toFixed(0)}<span className="text-slate-600 mt-1">/user/month</span></div>
                                <div className="text-slate-600 mt-1">when billed {billingCycle}</div>
                              </div> 
                            </>
                            :
                            <>
                              <div className="bg-gradient-primary bg-gradient-light p-3 mb-3 rounded-3">
                                <div className="text--small mb-1 text-uppercase">Regular Price</div>
                                <div className="text--large display-5 mb-0">₹{plan.pricePerUser.toFixed(0)}<span className="text-slate-600 mt-1">/user/month</span></div>
                                <div className="text-slate-600 mt-1">when billed {billingCycle}</div>
                              </div> 
                            </>
                        }
                        {/*(plan.id !== 'free' && billingCycle !== 'monthly') && (
                        <div className="bg-gradient-primary bg-gradient-light p-3 mb-3 rounded-3">
                            <div className="text--small mb-1 text-uppercase">Your Total Cost</div>
                            <ListGroup>
                              <ListGroup.Item>Base Amount: <span>₹{(plan.originalPrice.toFixed(0) * members).toFixed(0)}</span></ListGroup.Item>
                              {(plan.disount !== 0 && billingCycle !== 'monthly') &&(
                              <ListGroup.Item className="font-weight-bold">{plan.disount}% Limited Offer: <span>-₹{(plan.pricePerUser.toFixed(0) * members).toFixed(0)}</span></ListGroup.Item>
                              )}
                              {plan.id !== 'free' && 
                              <ListGroup.Item className="font-weight-bold border-top pt-2">Final Price: <strong className="display-6">₹{total.toFixed(0)}</strong></ListGroup.Item>
                              }
                            </ListGroup>
                             
                              <>
                              <div className="text-slate-600 mt-1 mb-3 text-end">per month for {members} user</div>
                                {(plan.disount !== 0 && billingCycle !== 'monthly') &&(
                                  <div className="bg-gradient-primary p-3 mb-3 rounded-3">
                                    <div className="text--small mb-1 text-uppercase">You Save in {billingCycle === 'quarterly' ? '3 Months' : '1 Year' }</div>
                                    <div className="text--large display-5 mb-0">₹{savedAmount.toFixed(0)}</div>
                                  </div>
                                )}
                              </>
                            
                        </div>)
                       */ }
                       {plan.id !== 'free' ?
                          <>
                            
                            
                            <div className="in--pro--plan">
                              <p className="mb-0"><strong>14 Days Free Trial</strong></p>
                              <p><small>Charges will apply after trial period</small></p>
                            </div>
                          </>
                          :
                          <>
                            <div className="in--free--plan">
                              <p className="mb-0"><strong>No Credit Card Required</strong></p>
                              <p><small>Get started immediately</small></p>
                            </div>
                          </>
                        }
                        {(memberProfile?.role?.slug === "owner") && (
                        <Button
                          
                          variant={
                            activeSubscription?.planId === plan.id
                              ? "outline-primary"
                              : "primary"
                          }
                          onClick={() => {
                            if(activeSubscription?.planId === plan.id){
                              return;
                            }
                            if (plan.id === 'free') {
                              activateFreePlan()
                            } else {
                              handleSubmit(plan)
                            }
                          }}
                          disabled={activeSubscription?.planId === plan.id || loading}
                        >
                          {activeSubscription?.planId === plan.id
                            ? "Selected"
                            : loading
                              ? "Please wait..."
                              : "Select Plan"}
                        </Button>)
                      }
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
            

          </Container>)
        }
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
                        : "Monthly Payment (Billed Every Month)"
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
                    <p className="mb-0 d-flex align-items-center gap-3 justify-content-between w-100">
                      <span>₹{priceDetails.pricePerUser.toFixed(0)}/user/month</span>
                    </p>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <small>Base calculation</small>
                    <p className="mb-0 d-flex align-items-center gap-3 justify-content-between w-100">
                      <span>₹{priceDetails.pricePerUser.toFixed(0)} ×{" "}{members} user(s)</span> <strong className="display-8">= ₹{(priceDetails.pricePerUser * members).toFixed(0)}</strong>
                    </p>
                  </ListGroup.Item>
                </ListGroup>
                {/*priceDetails.discountPercent > 0 && (
                  <div className="discount--offer rounded p-2 bg-warning-subtle my-3">
                    <small>{priceDetails.discountPercent}% Limited Offer Discount</small>
                    <p className="mb-0 d-flex align-items-center gap-3 justify-content-between w-100">
                      <span>₹{priceDetails.originalPrice.toFixed(0)} ×{" "}{priceDetails.discountPercent} </span> <strong className="display-8">= ₹{(priceDetails.pricePerUser).toFixed(0)}</strong>
                    </p>
                  </div>
                )*/}
                {billingCycle === "yearly" || billingCycle === "quarterly" ?
                <>
                  <div className="annual--cost rounded p-3 mt-3 mb-3 border-warning border-2">
                    <h6 className="fw-bold mb-2 text-uppercase text-amber">{billingCycle} COST BREAKDOWN</h6>
                    <div className="bg-white p-3 rounded fw-normal border-1 border-warning text-dark border">
                      <span className="text--small">{billingCycle === 'yearly' ? 'Annual' : 'Quarterly'} calculation</span>
                      <div className="d-flex align-items-center justify-content-between gap-3">
                        <p className="mb-0">
                          {billingCycle === "yearly"
                          ? `₹${(priceDetails.pricePerUser * members).toFixed(0)}/month × 12 months`
                          : billingCycle === "quarterly"
                          ? `₹${(
                              priceDetails.pricePerUser * members
                            ).toFixed(0)}/month × 3 months`
                          : `₹${(
                            priceDetails.pricePerUser * members
                          ).toFixed(0)}/month × 1 month`}
                        </p>
                        <p className="fw-bold display-8 mb-0 text-amber">
                          = ₹{priceDetails.pricePerUser.toFixed(0) *  members * (billingCycle === 'quarterly' ? 3 : 12)}
                        </p>
                      </div>
                    </div>
                    <div className="text-center mt-3">
                      <p className="text--small mb-1 fw-normal text-amber">Total {billingCycle === 'yearly' ? 'Annual' : 'Quarterly'} Payment</p>
                      <div className="text--large mb-0 text-amber">₹{priceDetails.pricePerUser.toFixed(0) * members * (billingCycle === 'quarterly' ? 3 : 12)}</div>
                    </div>
                  </div>
                  
                 { <div className="bg-gradient-primary p-3 text-center mb-3 rounded-3">
                    <div className="text--small mb-1 text-uppercase text-emerald">Total Savings in {billingCycle === 'quarterly' ? '3 Months' : '1 Year' }</div>
                    <div className="text-slate-600 mt-1">
                      ₹{((priceDetails.originalPrice - priceDetails.pricePerUser) *  members).toFixed(0)}/month × {billingCycle === 'quarterly' ? 3 : 12} months = ₹
                      {(((priceDetails.originalPrice - priceDetails.pricePerUser)) *  members * (billingCycle === 'quarterly' ? 3 : 12)).toFixed(0)}
                    </div>
                    <div className="text--large mb-0 text-emerald mt-2">₹{priceDetails.totalSavings.toFixed(0)}</div>
                  </div>}
                  </>
                  :
                  
                  <>
                    <div className="bg-gradient-primary p-3 text-center mb-3 rounded-3">
                      <div className="text--small mb-1 text-uppercase">Your monthly payment</div>
                      <div className="text--large mb-0 text-emerald">₹{(priceDetails.pricePerUser * members).toFixed(0)}</div>
                      <div className="text--small mb-1 text-lowercase">for {members} users</div>
                    </div>
                  </>
                  }
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

              <p className="bg-gradient-light bg--highlight mb-3 p-2 rounded-3">
                ✨ 14 Days Free Trial – Charges apply after trial period
              </p>

              <Form className="bg-gradient-light p-3 rounded" onSubmit={handleSubmit}>
                              <h6 className="fw-bold mb-3 text-uppercase">Billing Information</h6>
                              <Row>
                                <Form.Group as={Col} md="12" className="position-relative mb-0 form-group">
                                  <Form.Label>Full Name <sup className="text-danger">*</sup></Form.Label>
                                  <Form.Control type="text" className={errors?.fullName ? 'br-red' : ''} name="fullName" placeholder="Enter your full name" value={formData.fullName} onChange={handleChange} required/>
                                  {showError("fullName")}
                                </Form.Group>
                              </Row>
              
                              <Row>
                                <Form.Group className="position-relative mb-0 form-group">
                                  <Form.Label>Phone Number <sup className="text-danger">*</sup></Form.Label>
                                  <Row>
                                    <Col className="d-flex align-items-start gap-3">
                                      <Form.Select className="w-auto pe-5">
                                        {countries.map((country) => (
                                          <option key={`${country.isoCode}--${country.phoneCode}`} value={country.phoneCode}>
                                            {country.phoneCode}
                                          </option>
                                        ))}
                                      </Form.Select>
                                    
                                      <div className="flex-fill position-relative">
                                        <Form.Control className={errors?.phone ? 'br-red' : ''}  type="tel" name="phone" placeholder="Enter phone number" value={formData.phone} onChange={handleChange} required/>
                                        {showError("phone")}
                                      </div>
                                    </Col>
                                  </Row>
                                </Form.Group>
                              </Row>
              
                              <Form.Group  className="position-relative mb-0 form-group">
                                <Form.Label>Address Line 1 <sup className="text-danger">*</sup></Form.Label>
                                <Form.Control
                                  type="text"
                                  name="address1"
                                  className={errors?.address1 ? 'br-red' : ''} 
                                  placeholder="Street address, building, apartment"
                                  value={formData.address1}
                                  onChange={handleChange}
                                  required
                                />
                                {showError("address1")}
                              </Form.Group>
              
                              <Form.Group className="position-relative mb-0 form-group">
                                <Form.Label>Address Line 2</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="address2"
                                  placeholder="Additional address details (optional)"
                                  value={formData.address2}
                                  onChange={handleChange}
                                />
                              </Form.Group>
              
                              <Row className="">
                                <Form.Group as={Col} md="4" className="position-relative mb-0 form-group">
                                  <Form.Label>City <sup className="text-danger">*</sup></Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="city"
                                    className={errors?.city ? 'br-red' : ''} 
                                    placeholder="City"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                  />
                                  {showError("city")}
                                </Form.Group>
                                <Form.Group as={Col} md="4" className="position-relative mb-0 form-group">
                                  <Form.Label>State/Province <sup className="text-danger">*</sup></Form.Label>
                                  <Form.Control
                                    className={errors?.state ? 'br-red' : ''} 
                                    type="text"
                                    name="state"
                                    placeholder="State or Province"
                                    value={formData.state}
                                    onChange={handleChange}
                                    required
                                  />
                                  {showError("state")}
                                </Form.Group>
                                <Form.Group as={Col} md="4" className="position-relative mb-0 form-group">
                                  <Form.Label>Postal Code <sup className="text-danger">*</sup></Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="postal"
                                    className={errors?.postal ? 'br-red' : ''} 
                                    placeholder="Postal code"
                                    value={formData.postal}
                                    onChange={handleChange}
                                    required
                                  />
                                  {showError("postal")}
                                </Form.Group>
                              </Row>
              
                              <Form.Group  className="position-relative mb-0 form-group">
                                <Form.Label>Country <sup className="text-danger">*</sup></Form.Label>
                                <Form.Select
                                  className="custom-selectbox"
                                  name="country"
                                  value={formData.country}
                                  onChange={handleChange}
                                  required
                                >
                                  {countries.map((country) => (
                                    <option key={`country-${country.isoCode}--${country.phoneCode}`} value={country.value}>
                                      {country.name}
                                    </option>
                                  ))}
                                </Form.Select>
                                {showError("country")}
                              </Form.Group>
              
                              <div className="p-3 border rounded bg-white" style={{ fontSize: "0.9rem" }}>
                                <Form.Group className="form-group pb-0">
                                  <Form.Check
                                    type="checkbox"
                                    name="agree"
                                    className=""
                                    checked={formData.agree}
                                    onChange={handleChange}
                                    label={
                                      <>
                                        I agree to the{" "}
                                        <a href="https://primeteams.ai/terms-and-conditions/" target="_blank" rel="noreferrer">
                                          Terms & Conditions
                                        </a>{" "}
                                        and{" "}
                                        <a href="https://primeteams.ai/cancellation-refunds/" target="_blank" rel="noreferrer">
                                          Refund Policy
                                        </a>
                                      </>
                                    }
                                    required
                                  />
                                  {showError("agree")}
                                </Form.Group>
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