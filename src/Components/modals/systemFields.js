import React, { useEffect, useState, useMemo, useCallback, useRef} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Form, Card, Badge, Row, Col } from "react-bootstrap";
import { FaRegTrashAlt, FaRegEdit, FaCircle } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { MdDragIndicator } from "react-icons/md";
import { LuSettings2 } from "react-icons/lu";
import { fetchSystemFields, updateSystemField } from "../../redux/actions/systemfield.action";
import { AlertDialog } from ".";
import { selectboxObserver } from "../../helpers/commonfunctions";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
export const SystemFieldModal = (props) => {
  const formRef = useRef();
  const dispatch = useDispatch();
  const commonState = useSelector((state) => state.common);
  const apiSystemfields = useSelector((state) => state.systemfields);
  useEffect(() => {
    dispatch(fetchSystemFields({ module: props.module }));
  }, []);

  const typeLabelMap = {
    text: "Text Field",
    email: "Email",
    phone: "Phone Number",
    textarea: "Textarea",
    dropdown: "Dropdown",
    badge: "Badge",
    date: "Date",
    password: "Password",
    range: "Range",
    checkbox: "Checkbox",
    radio: "Radio",
  };

  const typeColorMap = {
    text: "primary",
    email: "secondary",
    phone: "info",
    textarea: "warning",
    dropdown: "success",
    badge: "dark",
    date: "secondary",
    password: "danger",
    range: "info",
    checkbox: "secondary",
    radio: "secondary",
  };

  const FieldCard = ({ field, idx }) => {
    const { _id, type, label, options } = field || {};
    return (
      <Card className="mb-3">
        <Card.Body>
          <Row className="align-items-center">
            <Col xs="auto">
              <Badge pill bg="light" className="abbr--n" text="dark">#{idx}</Badge>
              <div className="drag--indicator"><MdDragIndicator /></div>
            </Col>
            <Col>
              <h5 className="mb-0 fw-bold">{label}</h5>
            </Col>
            
            <Col xs="auto" className="pe-0">
              <Badge bg={typeColorMap[type] || "secondary"}>
                {typeLabelMap[type] || type}
              </Badge>
            </Col>
            <Col xs="auto">
              <Button
                variant="outline-primary"
                className="me-2 border-0 p-0 text-info"
                onClick={() => {
                  handleFieldEdit(field);
                }}
              >
                <FaRegEdit />
              </Button>
              
            </Col>
          </Row>

          {["radio", "dropdown", "badge", "checkbox"].includes(type) && (
            <>
              <Badge bg="info" className="mt-2">
                {options.length} options
              </Badge>
              <Row>
                <div className="mt-2">
                  <div className="d-flex flex-wrap gap-1">
                    {options.map((opt, i) => (
                      <span
                        key={i}
                        className="text-xs bg-white text-secondary px-2 py-1 rounded border"
                        style={{ fontSize: "0.75rem" }} // Bootstrap doesn't have `text-xs` natively
                      >
                        {opt.label}
                      </span>
                    ))}
                  </div>
                </div>
              </Row>
            </>
          )}
        </Card.Body>
      </Card>
    );
  };

  const [showInitialMessage, setShowInitialMessage] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showAddedFields, setShowAddedFields] = useState(true);
  const [fieldType, setFieldType] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [options, setOptions] = useState([]);
  const [newOption, setNewOption] = useState("");
  const [badgeColor, setBadgeColor] = useState("#28a745");
  const [errors, setErrors] = useState({});
  const [systemFields, setSystemFields] = useState([]);
  const [includeColumn, setIncludeColumn] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedField, setSelectedField] = useState({});
  const [fields, setFields] = useState({
    name: "",
    type: "",
    showInTable: false,
    options: [],
  });

  useEffect(() => {
    setSelectedField({});
    setShowOptions(false);
    setFields({ name: "", type: "", showInTable: false, options: [] });
    if (apiSystemfields.systemFieldsArray) {
      setSystemFields(apiSystemfields.systemFieldsArray);
    }

    if (apiSystemfields.updatedField) {
      setSystemFields((prevSystemFields) =>
        prevSystemFields.map((field) =>
          field._id === apiSystemfields.updatedField._id
            ? apiSystemfields.updatedField
            : field
        )
      );
    }

  }, [apiSystemfields]);

  const handleFieldEdit = (field) => {
    setSelectedField(field);
    setIsEditing(true);
    setFields({
      name: field?.label,
      type: field.type,
      options: field?.options,
      showInTable: field?.showInTable,
      range_options: field?.range_options || {},
    });
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleAddFieldClick = () => {
    setShowOptions(true);
    setShowInitialMessage(false);
    setErrors({});
    setFieldName("");
    setFieldType("");
    setOptions([]);
    setTimeout(() => {
      selectboxObserver();
    }, 700);
  };

  function createSlug(fieldName) {
    return fieldName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with dashes
      .replace(/-+/g, "-"); // Replace multiple dashes with one
  }

  const handleUpdateField = async () => {
    const newErrors = {};
    if (!fields?.name.trim()) newErrors.fieldName = "Field name is required";
    if (
      ["radio", "dropdown", "badge", "checkbox"].includes(fields?.type) &&
      fields?.options.length === 0
    ) {
      newErrors.options = "At least one option is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    const payload = {
      label: fields?.name.trim(),
      options: ["radio", "dropdown", "badge", "checkbox"].includes(fields?.type)
        ? fields?.options
        : [],
      showInTable: fields?.showInTable,
      range_options: fields?.range_options || {},
    };
    try {
      await dispatch(updateSystemField(selectedField?._id, payload));

      setShowOptions(false);
      setFields({ name: "", type: "", showInTable: false, options: [] });
      setNewOption("");
      setBadgeColor("#28a745");
      setIsEditing(false);
      setSelectedField({});
    } catch (err) {
      console.error("Failed to add custom field:", err);
    }
  };

  

  const handleCancelClick = () => {
    setShowOptions(false);
    setErrors({});
    setFields({ name: "", type: "", showInTable: false, options: [] });
    setIsEditing(false);
    setSelectedField({});
  };


  const handleChange = ({ target: { name, value, type, checked } }) => {
    if (type === "checkbox") {
      setFields({ ...fields, [name]: checked });
    } else {
      setFields({ ...fields, [name]: value });
    }
  };

  const handleRangeChange = ({ target: { name, value } }) => {
    setFields({
      ...fields,
      range_options: { ...fields.range_options, [name]: value },
    });
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      const label = newOption.trim();
      const value = label;
      // .toLowerCase()
      // .replace(/\s+/g, '-')         // replace spaces with dashes
      // .replace(/[^a-z0-9\-]/g, ''); // remove special characters

      const newFieldOption = { label, value };
      if (fields?.type === "badge") {
        newFieldOption["color"] = badgeColor;
        setBadgeColor("#28a745");
      }
      setFields({
        ...fields,
        options: [...(fields.options || []), newFieldOption],
      });

      setNewOption("");
    }
  };

  const removeOption = (index) => {
    const newOpts = (fields.options || []).filter((_, i) => i !== index);
    setFields({
      ...fields,
      options: newOpts,
    });
  };


  

  const shouldShowOptions = ["dropdown", "badge", "radio", "checkbox"].includes(
    fields?.type
  );
  const shouldshowRangeOptions = ["range"].includes(fields?.type);

  return (
    <>
      
          {showInitialMessage && (
            <div className="custom--field">
              <h3>No system fields added yet</h3>
              <p>Click "Add Field" to create custom fields for your project</p>
              <Button
                variant="primary"
                className="field--btn"
                onClick={handleAddFieldClick}
              >
                Add Field
              </Button>
            </div>
          )}

          {(showOptions || isEditing) && (
            <div className="field--options">
              <div className="add--new--field">
                <h5>Edit System Field</h5>
                <Form ref={formRef}>
                  <Row>
                    <Col>
                      <Form.Group className="mb-3 col">
                        <Form.Label>Field Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          placeholder="Enter field name"
                          readOnly
                          disabled
                          value={fields?.name}
                          onChange={handleChange}
                          isInvalid={!!errors.fieldName}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.fieldName}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    {!isEditing && (
                      <Col>
                        <Form.Group className="mb-3 col">
                          <Form.Label>Field Type *</Form.Label>
                          <Form.Select
                            value={fields?.type || ""}
                            name="type"
                            onChange={handleChange}
                            isInvalid={!!errors.fieldType}
                            className="custom-selectbox"
                          >
                            <option value="">-- Select Type --</option>
                            <option value="text">Text Field</option>
                            <option value="email">Email</option>
                            <option value="phone">Phone Number</option>
                            <option value="textarea">Textarea</option>
                            <option value="dropdown">Dropdown</option>
                            <option value="badge">Badge</option>
                            <option value="date">Date</option>
                            <option value="password">Password</option>
                            <option value="range">Range</option>
                            <option value="checkbox">Checkbox</option>
                            <option value="radio">Radio</option>
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {errors.fieldType}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    )}
                  </Row>

                  {shouldshowRangeOptions && (
                    <Form.Group className="mb-3">
                      <Form.Label>Min.</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Minimum value"
                        name="min"
                        value={fields?.range_options?.min}
                        onChange={handleRangeChange}
                      />
                      <Form.Label>Max.</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Maximum value"
                        name="max"
                        value={fields?.range_options?.max}
                        onChange={handleRangeChange}
                      />
                      <Form.Label>Steps</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Steps"
                        name="steps"
                        value={fields?.range_options?.steps}
                        onChange={handleRangeChange}
                      />
                    </Form.Group>
                  )}

                  {shouldShowOptions && (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>Options *</Form.Label>
                        <div className="d-flex color--selection">
                          <Form.Control
                            type="text"
                            placeholder="Add option..."
                            value={newOption}
                            onChange={(e) => setNewOption(e.target.value)}
                          />
                          {fields?.type === "badge" && (
                            <>
                              <p className="selected-badge-color">
                                <Form.Control
                                  type="color"
                                  placeholder="#000DDD"
                                  value={badgeColor}
                                  onChange={(e) => setBadgeColor(e.target.value)}
                                />{" "}
                                <span style={{ badgeColor }}>{badgeColor}</span>
                              </p>
                            </>
                          )}
                          <Button type="button" onClick={handleAddOption}>Add</Button>
                        </div>
                        {errors.options && (
                          <div className="text-danger mt-1">
                            {errors.options}
                          </div>
                        )}
                      </Form.Group>

                      <div className="mb-3 d-flex flex-wrap gap-2">
                        {fields?.options.map((opt, idx) => (
                          <div
                            key={idx}
                            className="text-xs bg-white text-secondary px-2 py-1 rounded border d-flex align-items-center"
                            style={{
                              fontSize: '0.75rem'
                            }}
                          >
                            {fields?.type === "badge" && (
                              <FaCircle className="me-2" style={{ color: opt.color }}>
                                {opt.color}
                              </FaCircle>
                            )}
                            <span
                              style={{
                                marginRight: "10px",
                                fontWeight: 500,
                              }}
                            >
                              {opt.label}
                            </span>
                            
                            {( fields?.options?.length > 2) && (
                                <span style={{ cursor: "pointer" }} onClick={() => removeOption(idx)}>×</span>
                            )}

                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <Row>
                    
                    <Col className="text-end">
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={handleCancelClick}
                      >
                        Cancel
                      </Button>
                      
                        <Button
                          variant="info"
                          type="button"
                          className="add--new--btn ms-3"
                          onClick={handleUpdateField}
                        >
                          Update Field
                        </Button>
                    </Col>
                  </Row>
                </Form>
              </div>
            </div>
          )}

          
            <div className="added--fields">
              <h5>Systen Fields</h5>
                  <div>
                    {systemFields?.length === 0 ? (
                      <p className="text-muted">No system fields.</p>
                    ) : (
                      systemFields?.map((field, index) => (
                            <div>
                              <FieldCard idx={index + 1} field={field} />
                            </div>
                      ))
                    )}
                    
                  </div>
            </div>
    </>
  );
};
