import React, { useEffect, useState, useMemo, useCallback, useRef} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Form, Card, Badge, Row, Col, ListGroup } from "react-bootstrap";
import { FaRegTrashAlt, FaRegEdit, FaCircle } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { MdDragIndicator } from "react-icons/md";
import { LuSettings2 } from "react-icons/lu";
import { createCustomField, fetchCustomFields, updateCustomField, deleteField, reorderedCustomFields } from "../../redux/actions/customfield.action";
import { AlertDialog } from ".";
import { selectboxObserver } from "../../helpers/commonfunctions";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { SystemFieldModal } from "./systemFields";
export const CustomFieldModal = (props) => {
  const formRef = useRef();
  const dispatch = useDispatch();
  const commonState = useSelector((state) => state.common);
  const apiCustomfields = useSelector((state) => state.customfields);
  const [activeTab, setActiveTab] = useState('custom')
  useEffect(() => {
    dispatch(fetchCustomFields({ module: props.module }));
  }, []);
  const [showdialog, setShowDialog] = useState(false);

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
    const { _id, type, label, options, showInTable } = field || {};
    return (
      <Card className="mb-3">
        <Card.Body>
          <Row className="align-items-center">
            <Col sm={12} md={6}>
              <div className="d-flex align-items-center gap-3 position-relative">
                <Badge pill bg="light" className="abbr--n" text="dark">#{idx}</Badge>
                <div className="drag--indicator"><MdDragIndicator /></div>
                <h5 className="mb-0 fw-bold">{label}</h5>
              </div>
            </Col>
            <Col xs="auto" className="ms-md-auto pe-0">
              {showInTable && (
                <Badge pill bg="success" className="me-2" text="dark">
                  In Columns
                </Badge>
              )}
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
              <Button
                variant="outline-danger"
                className="border-0 p-0"
                onClick={() => handleFieldDelete(field._id)}
              >
                <FaRegTrashAlt />
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
                       {
                        (opt?.color && opt.color != null) && 
                        <FaCircle className="me-2" style={{ color: opt.color }}></FaCircle>
                       }
                       
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
  const [customFields, setCustomFields] = useState([]);
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
    setShowDialog(false);
    setShowOptions(false);
    setFields({ name: "", type: "", showInTable: false, options: [] });
    if (apiCustomfields.customFields) {
      
      setCustomFields(apiCustomfields.customFields);
    }

    // if (apiCustomfields?.newField?._id) {
    //   setCustomFields((prevCustomFields) => {
    //     const updated = [
    //       ...prevCustomFields.filter(
    //         (field) => field?._id !== apiCustomfields.newField._id
    //       ),
    //       apiCustomfields.newField,
    //     ];
    //     return updated;
    //   });
    // }

    // if (apiCustomfields.updatedField) {
    //   setCustomFields((prevCustomFields) =>
    //     prevCustomFields.map((field) =>
    //       field._id === apiCustomfields.updatedField._id
    //         ? apiCustomfields.updatedField
    //         : field
    //     )
    //   );
    // }

    // if (apiCustomfields.deletedField) {
    //   setCustomFields((prevCustomFields) =>
    //     prevCustomFields.filter(
    //       (field) => field._id !== apiCustomfields.deletedField
    //     )
    //   );
    // }
  }, [apiCustomfields]);

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
    // setShowAddedFields(false);
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
      .replace(/[^a-z0-9\s_]/g, "") // Remove special characters except underscore
      .replace(/\s+/g, "_") // Replace spaces with underscore
      .replace(/_+/g, "_"); // Replace multiple underscores with one
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
      // dispatch action here
      //setCustomFields([...customFields, payload]);
      await dispatch(updateCustomField(selectedField?._id, payload));
      console.log("Submitting:", payload);

      setShowOptions(false);
      // setShowAddedFields(true);
      setFields({ name: "", type: "", showInTable: false, options: [] });
      setNewOption("");
      setBadgeColor("#28a745");
      setIsEditing(false);
      setSelectedField({});
    } catch (err) {
      console.error("Failed to add custom field:", err);
    }
  };

  const handleAddNewClick = async () => {
    const newErrors = {};
    if (!fields?.name.trim()) newErrors.fieldName = "Field name is required";
    if (!fields?.type) newErrors.fieldType = "Field type is required";
    if (
      ["radio", "dropdown", "badge", "checkbox"].includes(fields?.type) &&
      fields?.options.length === 0
    ) {
      newErrors.options = "At least one option is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    const payload = {
      name: createSlug(fields?.name.trim()),
      label: fields?.name.trim(),
      type: fields?.type,
      options: ["radio", "dropdown", "badge", "checkbox"].includes(fields?.type)
        ? fields?.options
        : [],
      showInTable: fields?.showInTable,
      module: props.module,
      range_options: fields?.range_options || {},
    };

    try {
      // dispatch action here
      // setCustomFields([...customFields, payload]);
      await dispatch(createCustomField(payload));

      //setShowOptions(false);
      // setShowAddedFields(true);

      setOptions([]);
      setNewOption("");
      setBadgeColor("#28a745");
    } catch (err) {
      console.error("Failed to add custom field:", err);
    }
  };

  const handleCancelClick = () => {
    setShowOptions(false);
    // setShowAddedFields(true);
    setErrors({});
    setFields({ name: "", type: "", showInTable: false, options: [] });
    setIsEditing(false);
    setSelectedField({});
  };

  // const handleFieldTypeChange = (e) => {
  //   setFieldType(e.target.value);
  //   setFields({
  //       ...fields,
  //       options: []
  //     });
  // };

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

  const handleFieldDelete = async (id) => {
    setShowDialog(true);
    setSelectedField({ _id: id });
  };

  const deleteCustomField = () => {
    dispatch(deleteField(selectedField._id));
    // setCustomFields((prevCustomFields) =>
    //   prevCustomFields.filter(
    //     (field) => field._id !== selectedField._id
    //   )
    // );
  };

  const handleCheck = (e) => {
    const { name, checked } = e.target;
    setIncludeColumn(checked);
  };

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    // If there's no destination (i.e., the item was dropped outside), do nothing
    if (!destination) return;
    const fieldId = draggableId.split("-")[1]; // Extract task ID from draggableId
    const sourceTabId = source.droppableId.split("-")[1]; // Get source tab ID
    const destinationTabId = destination.droppableId.split("-")[1]; // Get destination tab ID

    // Clone the projects array to avoid mutating the state directly
    let reorderedFields = [...customFields];
    if (sourceTabId === destinationTabId) {
      // If the task was moved within the same tab, reorder the tasks
      const [removed] = reorderedFields.splice(source.index, 1); // Remove task from the source position
      reorderedFields.splice(destination.index, 0, removed); // Insert task to the destination position
    } else {
      // Task was moved to a different tab (if needed, handle cross-tab logic here)
      const [removed] = reorderedFields.splice(source.index, 1); // Remove from source tab
      reorderedFields.splice(destination.index, 0, removed); // Add to destination tab
    }
    // Generate a list of newly ordered projects
    const newOrder = reorderedFields.map((field, index) => ({
      field_id: field._id, // Adjust this if your project ID key is different
      order: index,
    }));

    // Dispatch the action with the new order
    dispatch(reorderedCustomFields({ fields: newOrder, module: props.module }));
    // Update the state with reordered projects
    setCustomFields(reorderedFields);
  };

  const shouldShowOptions = ["dropdown", "badge", "radio", "checkbox"].includes(
    fields?.type
  );
  const shouldshowRangeOptions = ["range"].includes(fields?.type);

  return (
    <>
      <Modal show={true} onHide={props.toggle} centered size="lg" className="add--workflow--modal theme--modal">
        <Modal.Header closeButton>
          <Modal.Title>
            <span className="nav--item--icon"><LuSettings2 /></span>
            <strong>Custom Fields <small>create custom fields for your projects</small></strong>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showInitialMessage && (
            <div className="custom--field">
              <h3>No custom fields added yet</h3>
              <p>Click "Add Field" to create custom fields for your project</p>
              <Button variant="primary" className="field--btn" onClick={handleAddFieldClick}>Add Field</Button>
            </div>
          )}
          {
              props.module === 'projects' && (
            <ListGroup horizontal className="field__tabs">
              <ListGroup.Item className={`btn--view ${activeTab === 'custom' ? 'active' : ''}`} onClick={() => {
                setSelectedField({});
                setIsEditing(false);
                setActiveTab('custom')}}>Custom Fields</ListGroup.Item>
              
                  <ListGroup.Item className={`btn--view ${activeTab === 'system' ? 'active' : ''}`} onClick={() => setActiveTab('system')}>System Fields</ListGroup.Item>
              
            
          </ListGroup>
          )
            }
        { activeTab === 'custom' ? 
        <>
          {(showOptions || isEditing) && (
            <div className="field--options">
              <div className="add--new--field">
                <h5>{isEditing? 'Edit' : 'Add New'} Custom Field</h5>
                <Form ref={formRef}>
                  <Row>
                    <Col sm={12} md={6}>
                      <Form.Group className="mb-3 col">
                        <Form.Label>Field Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          placeholder="Enter field name"
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
                      <Col sm={12} md={6}>
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
                            
                            <span style={{ cursor: "pointer" }} onClick={() => removeOption(idx)}>×</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <Row>
                    <Col sm={12} md={6}>
                      <Form.Group controlId="formBasicCheckbox">
                        <Form.Check
                          type="checkbox"
                          label="Include in columns"
                          name="showInTable"
                          checked={fields?.showInTable}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col sm={12} md={6} className="text-end mt-3 mt-md-0">
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={handleCancelClick}
                      >
                        Cancel
                      </Button>
                      {!isEditing ? (
                        <Button
                          variant="info"
                          type="button"
                          className="add--new--btn ms-3"
                          onClick={handleAddNewClick}
                        >
                          Add Field
                        </Button>
                      ) : (
                        <Button
                          variant="info"
                          type="button"
                          className="add--new--btn ms-3"
                          onClick={handleUpdateField}
                        >
                          Update Field
                        </Button>
                      )}
                    </Col>
                  </Row>
                </Form>
              </div>
            </div>
          )}
          
          
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="added--fields">
                {!isEditing && (
                  <h4 className="d-flex align-items-center justify-content-between mb-4">
                    <Button
                      variant="primary"
                      className="field--btn"
                      onClick={handleAddFieldClick}
                    >
                      <FiPlus /> Add Field
                    </Button>
                  </h4>
                )}
                <h5>Added Custom Fields</h5>
                <Droppable
                  droppableId="droppable-custom-field-table"
                  direction="vertical"
                >
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      {customFields.length === 0 ? (
                        <p className="text-muted">No custom fields added yet.</p>
                      ) : (
                        customFields.map((field, index) => (
                          <Draggable
                            key={field?._id}
                            draggableId={`field-${field?._id}`}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <FieldCard idx={index + 1} field={field} />
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </DragDropContext>
            </>
            :
            <SystemFieldModal module={props.module}/>
            }
          {/* )} */}
        </Modal.Body>
      </Modal>

      {showdialog && (
        <AlertDialog
          showdialog={showdialog}
          toggledialog={setShowDialog}
          msg="Are you sure you want to delete this field?"
          callback={deleteCustomField}
        />
      )}
    </>
  );
};
