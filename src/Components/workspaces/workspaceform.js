import React, { useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setupworkspace, updateworkspace } from "../../redux/actions/workspace.action";
import { getFieldRules, validateField } from '../../helpers/rules';
import { setAuthorization } from "../../helpers/api";
import useFilledClass from "../customHooks/useFilledclass";
import { selectboxObserver } from "../../helpers/commonfunctions";
const secretKey = process.env.REACT_APP_SECRET_KEY

function WorkspaceForm(props) {
  useFilledClass('.form-floating .form-control');


  const location = useLocation();
  const { pathname } = location;
  const [fields, setFields] = useState({ name: props.editworkspace?.name || '', industry: props.editworkspace?.industry || "" });
  /** -- Form Fields Errors -- */
  const [errors, setErrors] = useState({ name: '', industry: "" });
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const check = [null, undefined, 'null', 'undefined', ''];
  const workspace = useSelector(state => state.workspace)
  let fieldErrors = {};
  let hasError = false;

  // useEffect(() => {

  //   if( props.editworkspace){
  //       setLoader(false)
  //   }
  // },[props.editworkspace])

  const handleChange = ({ target: { name, value } }) => {

    let newFields = { ...fields };
    let newErrors = { ...errors };
    newFields[name] = value;
    newErrors[name] = '';
    setFields(newFields);
    setErrors(newErrors);
  };

  const showError = (name) => {
    if (errors[name]) return (<span className="error">{errors[name]}</span>)
    return null
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoader(true)
    const updatedErrorsPromises = Object.entries(fields).map(async ([fieldName, value]) => {
      // Get rules for the current field
      const rules = getFieldRules('workspace', fieldName);
      // Validate the field
      const error = await validateField('workspace', fieldName, value, rules);
      // If error exists, return it as part of the resolved promise
      return { fieldName, error };
    });

    // Wait for all promises to resolve
    const updatedErrorsArray = await Promise.all(updatedErrorsPromises);

    updatedErrorsArray.forEach(({ fieldName, error }) => {
      if (error) {

        fieldErrors[fieldName] = error;
      }
    });
    // Check if there are any errors
    const hasError = Object.keys(fieldErrors).length > 0;
    // If there are errors, update the errors state
    if (hasError) {
      setLoader(false)
      setErrors(fieldErrors);
    } else {

      const jsonPayload = {};
      for (const [key, value] of Object.entries(fields)) {
        jsonPayload[key] = value;
      }
      jsonPayload['role'] = 'owner';
      if (props.editworkspace && props.editworkspace !== "") {

        await dispatch(updateworkspace(props.editworkspace._id, jsonPayload))
        setLoader(false)
      } else {
        await dispatch(setupworkspace(jsonPayload))
        setLoader(false)
      }
    }
  };

  useEffect(() => {
    selectboxObserver()
  }, []);

  return (
    <Form onSubmit={handleSubmit}>
      {
        props.heading &&
        <h2>Create a Workspace</h2>
      }

      <Form.Group className="mb-3 form-group">
        <FloatingLabel label="Workspace Name" controlId="floatingInputGrid">
          <Form.Control type="text" className={errors['name'] && errors['name'] !== "" ? "input-error" : ''} placeholder="Workspace Name" onChange={handleChange} value={fields['name'] || ""} name="name" />
        </FloatingLabel>
        {showError('name')}
      </Form.Group>
      <Form.Group className="mb-3 form-group">
        <Form.Select aria-label="Select Industry Type" placeholder="Select Industry Type" 
          className={errors['industry'] && errors['industry'] !== "" ? "form-control input-error filled custom-selectbox" : 'form-control filled custom-selectbox'} 
          onChange={handleChange} value={fields['industry'] || ""} name="industry">
          <option value="">None</option>
          <option value="it">IT</option>
        </Form.Select>
        {showError('industry')}
      </Form.Group>
      <Button variant="primary" className="mb-3" type="submit" disabled={loader}>
        {loader ? 'Please Wait...' : 'Create Workspace'}
      </Button>
      {props.show_more_buttons ?
        <>
          <Button variant="outline-primary" className="mb-3"><Link to="/dashboard" variant="body2">Skip Creating Workspace</Link></Button>
        </>
        :
        null
      }
    </Form>
  );
}

export default WorkspaceForm;
