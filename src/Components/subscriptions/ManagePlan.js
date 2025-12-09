import React, { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Button, Row, Col, Form, Badge, Collapse, Modal, Container } from "react-bootstrap";
import { FiUsers, FiCalendar, FiCheck, FiSave } from "react-icons/fi";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { BsTags } from "react-icons/bs";
import { createSubscription, saveAuthorization, getActiveSubscription, subscribeFreePlan, subscribeTrialPlan, cancelSubscription, updateSubscription, updateQuantity, getBillingdetails, saveBillingDetails } from "../../redux/actions/subscription.action";
import { plans } from "../../helpers/plans";
import { countries } from "../../helpers/countries";
import { useToast } from "../../context/ToastContext";
import { selectboxObserver } from "../../helpers/commonfunctions";
import { Listmembers, listCompanyinvite} from "../../redux/actions/members.action";
import { AlertDialog } from "../modals";

export default function ManagePlan() {
  const dispatch = useDispatch()
  const addToast = useToast();
  const qtyRef = useRef(null);
  const [spinner, setSpinner] = useState(true);
  const [showdialog, setShowDialog] = useState(false);
  const razorPayKey = process.env.REACT_APP_RAZORPAY_KEY
  const subscriptionState = useSelector((state) => state.subscription);
  const [activeSubscription, setActiveSubscription] = useState(null)
  const [billingCycle, setBillingCycle] = useState('yearly');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [memberFeeds, setMemberFeed] = useState([]);
  const invitationsFeed = useSelector((state) => state.member.invitations);
  const [invitationsTotal, setInvitationsTotal] = useState(0)
  const memberFeed = useSelector((state) => state.member.members);
  const [teamMembers, setTeamMembers] = useState(0);
  const [ totalmembers, setTotalMembers] = useState(0);
  const [showFeatures, setShowFeatures] = useState(false);
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
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

    const doCancel = () => {
      setShowDialog(true)
    }

    const handleCancelSubscription = () => {
        dispatch(cancelSubscription(activeSubscription?.subscriptionId))
        setShowDialog(false)
      }

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
    dispatch(getBillingdetails())
  }, [])

  useEffect(() => {
    setTeamMembers(totalmembers)
  },[totalmembers])

  useEffect(() => {
    if (memberFeed && memberFeed.memberData) {
      setMemberFeed(memberFeed.memberData);
      // setTotalMembers((totalmembers) + (memberFeed.memberData?.length || 0));

    }
    setTimeout(() => {
      setSpinner(false)
    },800)
  }, [memberFeed]);

    useEffect(() => {
      if (invitationsFeed && invitationsFeed.inviteData) {
        setInvitationsTotal(invitationsFeed.total);
        // setTotalMembers((totalmembers) + invitationsFeed.total || 0);
      }
      setTimeout(() => {
        setSpinner(false)
      },800)
    }, [invitationsFeed]);
  

  useEffect(() => {
    if (subscriptionState.activeSubscription) {
      setActiveSubscription(subscriptionState.activeSubscription)
      setTotalMembers(subscriptionState.activeSubscription?.quantity)
      setBillingCycle(subscriptionState.activeSubscription?.interval || 'monthly')
      const allPlans = [...plans.monthly, ...plans.quarterly, ...plans.yearly];

      const matchedPlan = allPlans.find(plan => plan.id === subscriptionState.activeSubscription.planId);
      // If found, set it in state
      if (matchedPlan) {
        setSelectedPlan(matchedPlan);
      } else {
        console.warn("No matching plan found for plan_id:", subscriptionState.activeSubscription.planId);
      }
       const current_dashboard = localStorage.getItem('current_dashboard');
      
      if (current_dashboard) {
        const parsedata = JSON.parse(current_dashboard)
        const updatedData = {...parsedata, ['subscription']: subscriptionState.activeSubscription}
        // localStorage.setItem('active_subscription', JSON.stringify(subscriptionState.activeSubscription))
        localStorage.setItem('current_dashboard', JSON.stringify(updatedData))
      }
    }
  }, [subscriptionState.activeSubscription])

  const handleConfirm = () => {
    setShowConfirm(true);
    setTimeout(() => {
      selectboxObserver()
    },1000)
  };

  const handleCloseConfirm = () => {
    setShowConfirm(false);
  };

  const handleProceedToPayment = () => {
    setLoading(true)
    updatePlan(); // your existing function
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
      selectboxObserver()
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


const handleSubmit = (e) => {
  e.preventDefault()
  
  if (!validateForm()) return;
  
  setLoading(true)
  dispatch(
    saveBillingDetails({
      ...formData
    })
  );
}
  const handleQuantitySubmit = (e) => {
    e.preventDefault()

    if(qtyRef.current.value === activeSubscription?.quantity){
      addToast('You have not changed the quantity.', 'danger');
      return false;
    }
    setLoading(true)
    const payload = {
      quantity: qtyRef.current.value,
      subscriptionId: activeSubscription?._id
    }
    dispatch(updateQuantity(payload))
    setLoading(true)
  }

 useEffect(() => {
  if (!plans[billingCycle] || !selectedPlan?.name) return;

  const updatedPlan = plans[billingCycle].find(
    (p) => p.name === selectedPlan.name
  );

  if (updatedPlan) {
    setSelectedPlan(updatedPlan);
  }
}, [billingCycle]);

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

    const activateFreePlan = () => {
      if(teamMembers < 1){
        addToast('Please add number of members first.', 'danger');
        return;
      }
      if(teamMembers > 3){
        addToast('You cannot activate free plan for more than 3 members.', 'danger');
        return;
      }
      setLoading(true)
      dispatch(subscribeFreePlan())
    }

  const updatePlan = () => {
    setLoading(true)

    if( selectedPlan.id === 'free'){
      activateFreePlan()
    }else{
      dispatch(updateSubscription({
        ...selectedPlan,
        total_count: 12,
        initial_quantity: qtyRef.current.value,
        billingCycle: billingCycle,
        name: selectedPlan?.name,
      }))
    }
    
  }

  useEffect(() => {
    setLoading(false)
    if (subscriptionState.success === 'success' && subscriptionState.authorizeData) {
      console.log('subscriptionState.authorizeData::: ', subscriptionState.authorizeData)
      authorizeSubscriptionPayment(subscriptionState.authorizeData)
    }
    setLoading(false)
    setShowConfirm(false);
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
      alert("Error creating subscription: " + err.message);
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
                <h2 className="fw-bold mb-1 d-flex align-items-center">Manage Your Plan 
                  {/* <a className="fs-6 ms-auto" href="/plan-details">View Active Subscription</a> */}
                </h2>
                <p>Upgrade, downgrade, or adjust your team size</p>
                <div className="bg-white rounded-4 shadow border p-4 mb-4">
                  <h4 className="text-xl fw-bold mb-4">Number of Team Members</h4>
                  <Form onSubmit={handleQuantitySubmit}>
                    <Form.Group className="d-flex align-items-center gap-2 gap-xl-3 flex-wrap">
                      <Form.Label className="d-inline-flex align-items-center gap-2 form-label w-auto mb-0"><FiUsers /> Team Members</Form.Label>
                      {/* <Form.Control type="number" className="w-50 flex-grow-1" min={totalmembers || 1} disabled={activeSubscription?.planId === 'free' || activeSubscription?.planId === 'trial'} value={teamMembers} onChange={(e) => {
                        if(activeSubscription?.planId !== 'free' && activeSubscription?.planId !== 'trial'){
                          setTeamMembers(Number(e.target.value)) 
                        }else{
                          return false;
                        }
                      }}/> */}
                      <div className="d-flex align-items-center gap-2 gap-xl-3 flex-grow-1">
                        {(() => {
                          const qty = activeSubscription?.quantity || 1;
                          const tmembers = memberFeeds?.length || 0;
                          const invites = invitationsTotal || 0;

                          // Calculate min value
                          const currentTotal = tmembers + invites;
                          const minValue = currentTotal < qty ? currentTotal : qty;

                          return (
                            <Form.Control
                              type="number"
                              className="w-50 flex-grow-1"
                              min={minValue}
                              id="qty-field"
                              ref={qtyRef}
                              // disabled={
                              //   activeSubscription?.planId === "free" ||
                              //   activeSubscription?.planId === "trial"
                              // }
                              value={teamMembers}
                              onChange={(e) => {
                                // if (
                                //   activeSubscription?.planId !== "free" &&
                                //   activeSubscription?.planId !== "trial"
                                // ) {
                                  setTeamMembers(Number(e.target.value));
                                // } else {
                                //   return false;
                                // }
                              }}
                            />
                          );
                        })()}
                        {
                          (selectedPlanData?.planId?.toLowerCase() !== 'free' && selectedPlanData?.planId?.toLowerCase() !== 'trial') && (
                            <Button type="submit" variant="primary" disabled={loading}>{ loading ? 'Please wait...': 'Update Members'}</Button>
                          )
                        }
                      </div>
                      
                    </Form.Group>
                  </Form>
                </div>
                {/* Plan Selection */}
                <div className="bg-white rounded-4 shadow border p-4 mb-4">
                  <h4 className="text-xl fw-bold mb-4">Choose Your Plan & Price Summary</h4>
                  <h6 className="fw-bold mb-2">Choose Your Plan</h6>
                  <Row className="mb-4">
                    {plans[billingCycle].map((plan) => (
                      <Col key={plan.id} data-plan={plan.id} xl={4} className="mb-3">
                        <Card className={`h-100 text-center shadow-sm ${selectedPlan?.name}  ${plan.name} ${selectedPlan?.name === plan.name ? "modal--plan--card--active modal--plan--card p-4" : "modal--plan--card p-4"}`}
                          onClick={() => setSelectedPlan(plan)}
                          style={{ cursor: "pointer" }}
                        >
                          <Card.Body className="p-0 m-0" key={`body-${plan.id}`}>
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
                    <Form.Select className="custom-selectbox" value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)}>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly (Save 20%)</option>
                      <option value="yearly">Yearly (Save 40%)</option>
                    </Form.Select>
                  </Form.Group>
                  {/* Price Summary */}
                  <Card className="p-0 border-0 mb-0 summary--card flex-column">
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
                          <h5 className="text-slate-700 text-uppercase fw-bold fs-6">Plan Features</h5>
                          <ul className="d-flex flex-column gap-2">
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
                            {
                              (selectedPlanData?.discount > 0) && (
                                <span className="text-decoration-line-through text-muted">₹{selectedPlanData.originalPrice.toFixed(0)}</span>
                              )
                            }
                            {selectedPlanData?.pricePerUser > 0 ?
                              <small className="fs-6 fw-bold d-block">
                                ₹{selectedPlanData?.pricePerUser}/month
                              </small>
                            : <small className="fs-6 fw-bold d-block">0</small>}
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
                        
                         {(selectedPlanData?.id !== "free" && 
                            (billingCycle === "yearly" || billingCycle === "quarterly")) && (
                            <div className="bg-gradient-green p-3 text-center mb-3 rounded-3">
                              <div className="text--small mb-1 text-uppercase text-emerald">
                                Total Savings in {billingCycle === "quarterly" ? "3 Months" : "1 Year"}
                              </div>

                              {/* <div className="text-slate-600 mt-1">
                                ₹{((selectedPlanData?.originalPrice - selectedPlanData?.pricePerUser) * teamMembers).toFixed(0)}
                                /month × {billingCycle === "quarterly" ? 3 : 12} months = ₹
                                {(((selectedPlanData?.originalPrice - selectedPlanData?.pricePerUser) * teamMembers) *
                                  (billingCycle === "quarterly" ? 3 : 12)).toFixed(0)}
                              </div> */}

                              <div className="text--large mb-0 text-emerald mt-2">
                                ₹{
                                  ((selectedPlanData?.originalPrice * teamMembers) -
                                    (selectedPlanData?.pricePerUser * teamMembers)) *
                                  (billingCycle === "yearly" ? 12 : billingCycle === "quarterly" ? 3 : 1)
                                }
                              </div>
                            </div>
                          )}

                        <p className="mb-3 d-flex align-items-center justify-content-between gap-3 fs-5 fw-bold border-top border-bottom py-2">
                          Total per month
                           <strong className="text-end fs-3">₹{(teamMembers * selectedPlanData?.pricePerUser).toFixed(0)}</strong>
                        </p> 
                        <p className="mb-0 d-flex align-items-center justify-content-between gap-3">
                          Total for{" "}
                          {billingCycle === "yearly"
                            ? "1 year"
                            : billingCycle === "quarterly"
                              ? "3 months"
                              : "1 month"}
                          : <strong className="text-end fs-5">₹{(teamMembers * selectedPlanData?.pricePerUser) * (billingCycle === "yearly" ? 12 : billingCycle === "quarterly" ? 3 : 1).toFixed(0)}</strong>
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
                  <Button variant="danger"  onClick={doCancel} className="w-100 fw-bold">Cancel Subscription</Button>
                </div>
                <Form className="bg-gradient-light bg-white rounded-4 shadow border p-4" onSubmit={handleSubmit}>
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
                          <Form.Select className="w-auto pe-5 custom-selectbox">
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
                    <Form.Group as={Col} xl="4" className="position-relative mb-0 form-group">
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
                    <Form.Group as={Col} xl="4" className="position-relative mb-0 form-group">
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
                    <Form.Group as={Col} xl="4" className="position-relative mb-0 form-group">
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
  
                  <Form.Group className="position-relative mb-0 form-group">
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
  
                  <Button variant="primary" type="submit" onClick={handleSubmit} className="w-100 mt-4 d-flex align-items-center justify-content-center gap-2 fw-bold" disabled={loading}><FiSave /> { loading ? 'Please wait...': 'Save Billing Information'}</Button>
                </Form>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
      <AlertDialog
        showdialog={showdialog}
        toggledialog={setShowDialog}
        msg="Are you sure you want to cancel your subscription?"
        callback={handleCancelSubscription}
      />
      <Modal show={showConfirm} onHide={handleCloseConfirm} centered size="lg" className="subscription--modal theme--modal">
        <Modal.Header closeButton>
          <Modal.Title>
              <span className="nav--item--icon"><BsTags /></span>
              <strong>Subscription Confirmation <small>Let’s make something amazing together</small></strong>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Subscription Details */}
          <div className="border rounded p-3 mb-4 bg-light">
            <h6 className="fw-bold mb-3">SUBSCRIPTION DETAILS</h6>
            <div className="bg-white rounded-3 p-3 border">
              <p className="mb-0">Team Members <strong className="d-block fs-6 fw-bold">{teamMembers} user{teamMembers > 1 ? "s" : ""}</strong></p>
            </div>
            <div className="bg-white rounded-3 p-3 border my-3">
              <p className="mb-0">
                Payment Type{" "}
                <strong className="d-block fs-6 fw-bold text-primary">
                  {billingCycle === "yearly"
                  ? "Annual Payment (Billed Once a Year)"
                  : billingCycle === "quarterly"
                  ? "Quarterly Payment (Billed Every 3 Months)"
                  : "Monthly Payment (Billed Every Month)"
                }
                </strong>
              </p>
            </div>
            <div className="bg-white rounded-3 p-3 border">
              <p className="mb-0">
                Next Payment Date{" "}
                <strong className="d-block fs-6 fw-bold">
                  {(() => {
                  const nextDate = new Date();
                  
                  if (billingCycle === "yearly") {
                    nextDate.setFullYear(nextDate.getFullYear() + 1);
                  } else if (billingCycle === "quarterly") {
                    nextDate.setMonth(nextDate.getMonth() + 3);
                  } else {
                    nextDate.setMonth(nextDate.getMonth() + 1);
                  }

                  return nextDate.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });
                })()}
                </strong>
              </p>
            </div>
          </div>

          {/* Price Calculation */}
          <div className="border rounded p-3 mb-4 bg-light">
            <h6 className="fw-bold mb-3">PRICE CALCULATION</h6>
            <div className="mb-2">
              {/* <p className="mb-1 text-muted">
                Regular price per user:{" "}
                <span className="text-decoration-line-through">
                  ₹{selectedPlanData?.pricePerUser}/user/month
                </span>
              </p> */}
              <div className="bg-white rounded-3 p-3 border mb-3">
                <p className="mb-0">
                {billingCycle === 'monthly' ? 'Regular': 'Discounted'} price per user{" "}
                <span className="d-block">
                  <strong className="text-primary fs-5">₹{selectedPlanData?.pricePerUser}</strong>/user/month
                </span>
              </p>
              </div>
              <div className="bg-white rounded-3 p-3 border">
                <p className="mb-1">Base Calculation
                  <span className="d-flex justify-content-between"> ₹{selectedPlanData?.pricePerUser} × {teamMembers} user(s) <strong className="fs-5">= ₹{(selectedPlanData?.pricePerUser * teamMembers).toFixed(0)}</strong></span>
                </p>
              </div>
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
                    <p className="text--small mb-1 fw-semibold text-amber">Total {billingCycle === 'yearly' ? 'Annual' : 'Quarterly'} Payment</p>
                    <div className="text--large mb-0 text-amber">₹{selectedPlanData?.pricePerUser.toFixed(0) * teamMembers * (billingCycle === 'quarterly' ? 3 : 12)}</div>
                  </div>
                </div>
                
                { <div className="bg-gradient-primary p-3 text-center mb-3 rounded-3">
                  <div className="text--small mb-1 text-uppercase text-emerald">Total Savings in {billingCycle === 'quarterly' ? '3 Months' : '1 Year' }</div>
                  {/* <div className="text-slate-600 mt-1">
                    ₹{((selectedPlanData?.originalPrice - selectedPlanData?.pricePerUser) *  teamMembers).toFixed(0)}/month × {billingCycle === 'quarterly' ? 3 : 12} months = ₹
                    {(((selectedPlanData?.originalPrice - selectedPlanData?.pricePerUser)) *  teamMembers * (billingCycle === 'quarterly' ? 3 : 12)).toFixed(0)}
                  </div> */}
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
          <Button variant="success" disabled={loading} onClick={handleProceedToPayment}>{loading ? 'Please wait...': 'Proceed to Payment'}</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}