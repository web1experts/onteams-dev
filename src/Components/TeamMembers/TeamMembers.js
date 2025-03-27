import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Row, Col, Button, Modal, Form, FloatingLabel, Card, ListGroup, Table } from "react-bootstrap";
import { FaList, FaPlus, FaRegTrashAlt } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { getMemberdata } from "../../helpers/commonfunctions";
import { BsGrid } from "react-icons/bs";
import { MdOutlineClose, MdSearch } from "react-icons/md";
import { Listmembers, deleteMember, updateMember } from "../../redux/actions/members.action";
import { leaveCompany } from "../../redux/actions/workspace.action";
import { useNavigate } from "react-router-dom";
import { getAvailableRolesByWorkspace } from "../../redux/actions/workspace.action";
import { getFieldRules, validateField } from "../../helpers/rules";
import { createMember } from "../../redux/actions/members.action";
import Invitation from "./Invitation";
import { AlertDialog, TransferOnwerShip } from "../modals";
import { selectboxObserver } from "../../helpers/commonfunctions";
import { socket } from "../../helpers/auth";

function EditableField({ selectedMember, field, label, value, onChange, isEditing, onEditClick, error, roles, printval }) {
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const [originalValue, setOriginalValue] = useState(value);

  useEffect(() => {
    // if( !value ){
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        if (inputRef.current && inputRef.current.contains(event.target)) {
          return; // Click is inside the select box or input field
        }
        if (inputRef.current.value.trim() === "") {
          onChange(originalValue);
        }

      }
    }

    if (isEditing) {
      setOriginalValue(value);
      if (inputRef.current) {
        inputRef.current.focus();
      }
      document.addEventListener("mousedown", handleClickOutside);
      selectboxObserver()
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      if (document.querySelector('.conditional-box')) { document.querySelector('.conditional-box').remove() }
    }


    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // }

  }, [isEditing]);

  if (field === "role") {
    console.log('Error: ', error)
    return (
      <ListGroup.Item ref={wrapperRef}>
        <strong>Role</strong>
        {isEditing ? (
          <>
            <Form.Group className="mb-0 form-group pb-0">
              <Form.Select
                ref={inputRef}
                className={
                  error
                    ? "input-error form-control custom-selectbox conditional-box"
                    : "form-control custom-selectbox conditional-box"
                }
                defaultValue={value}
                onChange={(e) => onChange(e.target.value)}
                name="role"
              >
                <option value="none">None</option>
                {roles.map((role, index) => (
                  <option key={index} value={role._id}>
                    {role.name}
                  </option>
                ))}
              </Form.Select>

              <span className="error">{error}</span>
            </Form.Group>
          </>
        ) : (
          <>
            {printval}
            <FiEdit
              onClick={() => onEditClick(true)}
              style={{ cursor: "pointer" }}
            />

          </>
        )}
      </ListGroup.Item>
    );
  } else if (field !== "email") {
    return (
      <li ref={wrapperRef}>
        <strong>{label}</strong>
        {isEditing ? (
          <>
            <Form.Control
              type="text"
              ref={inputRef}
              placeholder="Search Member.."
              onChange={(e) => onChange(e.target.value)}
              id={`${field}`}
              label={label}
              name={`${field}`}
              value={value}
            />
          </>
        ) : (
          <>
            {value}
            <FiEdit
              onClick={() => onEditClick(true)}
              style={{ cursor: "pointer" }}
            />
            <p className="MuiFormHelperText-root Mui-error">
              <span className="error">{error}</span>
            </p>
          </>
        )}
      </li>
    );
  }
  return null;
}

function TeamMembersPage() {
  //useFilledClass('.form-floating .form-control');
  const currentMember = getMemberdata();
  //const addToast = useToast();
  const [isActive, setIsActive] = useState(0);
  const handleClick = (event) => {
    setIsActive((current) => !current);
  };

  const handleTableToggle = (member) => {
    setSelectedMember(member);
    if (!isActive) {
      setIsActive(true);
    }
  };

  const [isActiveView, setIsActiveView] = useState(2);
  const [rows, setRows] = useState([{ email: "", role: "" }]);
  const [errors, setErrors] = useState([]);
  let fieldErrors = {};
  let hasError = false;
  const deleteSuccess = useSelector((state) => state.member.deletedMember);
  const [fields, setFields] = useState({ email: "", name: "", role: "" });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loader, setLoader] = useState(false);
  const [updateloader, setUpdateLoader] = useState(false);
  // const [memberMeta, setMemberMeta] = useState({})
  // const [disable, setDisable] = useState(true);
  const workspaceState = useSelector((state) => state.workspace);
  const [show, setShow] = useState(false);
  const handleClose = () => {
    requestAnimationFrame(() => {
      setRows([{ email: "", role: "" }]);
      setErrors([]);
      setShow(false);
    });
  };
  const handleShow = () => setShow(true);
  const [activeTab, setActiveTab] = useState("Members");
  // const [activeSubTab, setActiveSubTab] = useState("Grid");
  const [activeSubTab, setActiveSubTab] = useState('GridView');
  const [resetmemberList, setresetmemberList] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberFeeds, setMemberFeed] = useState([]);
  const [showloader, setShowloader] = useState(false);
  const apiResult = useSelector((state) => state.member);
  const [searchTerm, setsearchTerm] = useState("");
  const memberFeed = useSelector((state) => state.member.members);
  const [editedMember, setEditedMember] = useState({});
  const [showdialog, setShowDialog] = useState(false);
  const [roles, setRoles] = useState([]);
  const handleListMember = async () => {
    if (activeTab === "Members") {
      setMemberFeed([])

      await dispatch(Listmembers(currentPage, searchTerm));
      setShowloader(false);
    }
  };

  const [showSearch, setSearchShow] = useState(false);
  const handleSearchClose = () => setSearchShow(false);
  const handleSearchShow = () => setSearchShow(true);

  const handledeleteMember = async () => {
    await dispatch(deleteMember(selectedMember._id));
  };

  const handleleavecompany = async () => {

    await dispatch(
      leaveCompany({
        memberId: selectedMember._id,
        companyId: currentMember.company._id,
      })
    );
  };

  const handleownership = async () => {
    console.log("transfer ownership");
  };

  useEffect(() => {
    dispatch(getAvailableRolesByWorkspace());
  }, []);

  useEffect(() => {
    if (currentPage !== "") {
      setShowloader(true)
      handleListMember();
    }
  }, [currentPage, searchTerm]);

  const [isEditing, setIsEditing] = useState({
    name: false,
    role: false,
    email: false,
    avatar: false,
  });

  useEffect(() => {
    if (apiResult.success) {
      if(apiResult.updatedMember){
        socket.emit('refresh_record_type', selectedMember?._id)
      }
      setLoader(false);
      setUpdateLoader(false)
      setRows([{ email: "", role: "" }]);
      setErrors([]);
      setShow(false);
      handleListMember();
    }
    if (
      workspaceState.available_roles &&
      workspaceState.available_roles.length > 0
    ) {
      setRoles(workspaceState.available_roles);
    }
    if (apiResult.deletedMember) {
      setIsActive(false);
      setShowDialog(false)
    }

    
  }, [apiResult, workspaceState]);

  useEffect(() => {
    if (
      workspaceState.available_roles &&
      workspaceState.available_roles.length > 0
    ) {
      setRoles(workspaceState.available_roles);
    }
  }, [workspaceState]);

  useEffect(() => {
    if (memberFeed && memberFeed.memberData) {
      setMemberFeed(memberFeed.memberData);
    }
  }, [memberFeed]);

  useEffect(() => {
    if (selectedMember !== null) {
      // Check if data is available
      setIsEditing({
        role: false,
      });

      setEditedMember({
        name: selectedMember.name,
        role: selectedMember.role?._id,
        rolename: selectedMember.role?.name,
        memberMeta: selectedMember?.memberMeta
      });
      // if( selectedMember?.memberMetas && selectedMember?.memberMetas.length > 0){
      //   const memberMeta = selectedMember?.memberMetas.reduce((acc, meta) => {
      //     acc[meta.meta_key] = meta.meta_value;
      //     return acc;
      //   }, {});
      //   setMemberMeta(memberMeta)
      // }
      
    }
  }, [selectedMember]);

  const handleEditClick = (fieldName) => {
    setIsEditing((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const removeError = (field) => {
    setErrors({ ...fieldErrors, [field]: "" });
  };

  const handleFieldChange = (field, value) => {
    // if (field in editedMember) {
    if (field === "avatar") {
      setAvatarPreview(URL.createObjectURL(value.target.files[0]));
      setEditedMember((prevState) => ({
        ...prevState,
        [field]: value.target.files[0],
      }));
    } else if (field === "memberMeta") {
      
      console.log('role value: ', value.target.value)
      const metakey = value.target.name;
      const meta_value = value.target.value;

      setEditedMember((prevState) => ({
        ...prevState,
        memberMeta: {
          ...prevState.memberMeta,
          [metakey]: meta_value,
        },
      }));

    }
    else if (field === "role") {
      console.log('role value: ', value)
      const matchingRole = roles.find(role => role._id === value);
      setEditedMember((prevState) => ({
        ...prevState,
        ['rolename']: matchingRole?.name,
      }));
      if (value !== "") {
        removeError(field);
      }
    }
    else {
      setEditedMember((prevState) => ({
        ...prevState,
        [field]: value,
      }));

      if (value !== "") {
        removeError(field);
      }
    }
  };

  const handleChange = (index, event, fieldname = "") => {
    const { name, value, type, files } = event.target;
    const updatedRows = [...rows];
    updatedRows[index] = { ...updatedRows[index], [name]: value };
    setRows(updatedRows);
    const updatedErrors = [...errors];

    // Check if there is an error message for the specified field at the given index
    if (updatedErrors[index] && updatedErrors[index][name]) {
      // If an error message exists, update it to an empty string to remove the error
      updatedErrors[index][name] = "";
    }
    // Update the errors state with the updated array
    setErrors(updatedErrors);
  };
  const showError = (index, name) => {
    if (errors[index] && errors[index][name])
      return <span className="error">{errors[index][name]}</span>;
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoader(true);
    const updatedErrorsPromises = rows.map(async (row, rowIndex, allRows) => {
      let rowError = {};
      const emailSet = new Set();

      for (const [fieldName, value] of Object.entries(row)) {
        // Get rules for the current field
        const rules = getFieldRules("add_member", fieldName);
        // Validate the field
        const error = await validateField(
          "add_member",
          fieldName,
          value,
          rules
        );
        // If error exists, store it in rowError
        if (error) {
          rowError = { ...rowError, [fieldName]: error };
        }
      }
      return rowError;
    });

    // Check for unique email values across all rows
    const emailSet = new Set();
    rows.forEach((row, rowIndex) => {
      const email = row.email;
      if (email === "") return;

      if (emailSet.has(email)) {
        // Add an error to the current row if email is not unique
        updatedErrorsPromises[rowIndex] = updatedErrorsPromises[rowIndex].then(
          (rowError) => {
            return { ...rowError, email: "Email must be unique" };
          }
        );
      } else {
        emailSet.add(email);
      }
    });

    // const updatedErrors = await Promise.all(updatedErrorsPromises);
    // setErrors(updatedErrors);

    // Wait for all promises to resolve
    const updatedErrors = await Promise.all(updatedErrorsPromises);
    // Check if there are any errors
    const hasError = updatedErrors.some(
      (rowError) => Object.keys(rowError).length > 0
    );
    // If there are errors, update the errors state
    if (hasError) {
      setLoader(false);
      setErrors(updatedErrors);
    } else {
      const formData = new FormData();
      rows.forEach((row, index) => {
        formData.append(`members[${index}][email]`, row.email);
        formData.append(`members[${index}][role]`, row.role);
      });
      console.log("Member form data: ", formData);
      await dispatch(createMember(formData));
      setLoader(false);
    }
  };

  const addRow = () => {
    setRows([...rows, { email: "", role: "" }]);
  };

  const removeRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    const updatedErrors = errors.filter((_, i) => i !== index);
    setRows(updatedRows);
    setErrors(updatedErrors);
  };

  useEffect(() => {
    if (rows.length > 0) {
      selectboxObserver();
    }
  }, [rows])

  const compareMembers = (original, edited) => {
    const changes = {};
    for (const [key, value] of Object.entries(edited)) {
      if (original[key] !== value) {
        changes[key] = value;
      }
    }
    return changes;
  };

  const handleMetaChange = ({ target: { name, value } }) => {
   
  }

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();
    const changes = compareMembers(selectedMember, editedMember);

    
    if (Object.keys(changes).length > 0) {

      const updatedErrorsPromises = Object.entries(changes).map(async ([fieldName, value]) => {
        // Get rules for the current field
        const rules = getFieldRules('add_member', fieldName);
        // Validate the field
        const error = await validateField('add_member', fieldName, value, rules);
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
        setErrors(fieldErrors);
        selectboxObserver()
      } else {
        setIsEditing({
          name: false,
          role: false,
          email: false,
          avatar: false
          // Add other usermeta fields
        });
       
        if (Object.keys(changes).length > 0) {
          setUpdateLoader(true)
          const formData = new FormData();
          for (const [key, value] of Object.entries(changes)) {
            if (typeof value === 'object') {
              formData.append(key, JSON.stringify(value)); // Convert objects to JSON string
            } else {
              formData.append(key, value);
            }
          }
          await dispatch(updateMember(selectedMember?._id, formData))
          //  setLoader(false)
        }
      }
    } else { }
  };

  
  const pagetopbar = () => {
    return (
      <div className='page--title px-md-2 pt-3'>
        <Container fluid>
          <Row>
            <Col sm={12}>
              <h2>
                Members
                <Button variant="primary" className={isActive ? 'd-flex ms-auto' : 'd-lg-none ms-auto ms-md-2'} onClick={handleSearchShow}><MdSearch /></Button>
                <Button variant="primary" onClick={handleShow}><FaPlus /></Button>
                <ListGroup horizontal className={isActive ? "d-none" : "ms-auto d-none d-md-flex"}>
                  <ListGroup.Item className='d-none d-md-block' action active={activeTab === "Members"} onClick={() => { setsearchTerm(''); setActiveTab("Members") }}>Members</ListGroup.Item>
                  <ListGroup.Item className='d-none d-md-block' action active={activeTab === "Invitees"} onClick={() => { setsearchTerm(''); setActiveTab("Invitees") }}>Invitations</ListGroup.Item>
                  <ListGroup.Item className='d-none d-lg-block'>
                    <Form onSubmit={(e) => {e.preventDefault()}}>
                      <Form.Group className="mb-0 form-group">
                        <Form.Control type="text" placeholder={activeTab === "Members" ? "Search Member.." : "Search Invitations.."} onChange={(e) => setsearchTerm(e.target.value)} />
                      </Form.Group>
                    </Form>
                  </ListGroup.Item>
                  <ListGroup.Item action className="view--icon d-none d-lg-flex" active={isActiveView === 1} onClick={() => setIsActiveView(1)}><BsGrid /></ListGroup.Item>
                  <ListGroup.Item action className="d-none d-lg-flex view--icon" active={isActiveView === 2} onClick={() => setIsActiveView(2)}><FaList /></ListGroup.Item>

                </ListGroup>
              </h2>
            </Col>
            <Col sm={12} className={isActive ? "d-none" : "page--title"}>
              <ListGroup horizontal className='d-flex mt-3 mt-lg-0 d-md-none list-group--two'>
                <ListGroup.Item action active={activeTab === "Members"} onClick={() => { setsearchTerm(''); setActiveTab("Members") }}>Members</ListGroup.Item>
                <ListGroup.Item action active={activeTab === "Invitees"} onClick={() => { setsearchTerm(''); setActiveTab("Invitees") }}>Invitations</ListGroup.Item>
              </ListGroup>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }

  return (
    <>
      {activeTab === "Members" && (
        <div className={isActive ? 'show--details team--page' : 'team--page'}>
          {pagetopbar()}
          <div className="page--wrapper px-md-2 py-3">
            {
              showloader &&
              <div className="loading-bar">
                <img src="images/OnTeam-icon-gray.png" className="flipchar" />
              </div>
            }
            <Container fluid>
              <>
                <Table responsive="lg" className={isActiveView === 1 ? 'project--grid--table clients--grid--table' : isActiveView === 2 ? 'project--table clients--table' : 'project--table clients--table'}>
                  <thead>
                    <tr>
                      {/* <th width={20}>#</th> */}
                      <th><abbr>#</abbr> Member Name</th>
                      <th className="onHide">Role</th>
                      <th className="onHide">Email Address</th>
                      <th className="onHide">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!showloader && memberFeeds && memberFeeds.length > 0 ? (
                      memberFeeds.map((member, idx) => (
                        <tr key={`member-table-row-${idx}`} className={member._id === selectedMember?._id ? 'project--active' : ''} onClick={isActive ? () => handleTableToggle(member) : () => { return false; }}>
                          {/* <td>{idx + 1}</td> */}
                          <td className="cursor--pointer project--title--td">
                            <span className="onHide">
                              <img variant="top" src={member.avatar || "./images/default.jpg"} />
                            </span>
                            <span><abbr>{idx + 1}.</abbr> {member.name}</span>
                          </td>
                          <td className="onHide">
                            {member.role?.name}
                          </td>
                          <td className="onHide">{member.email}</td>
                          <td className="onHide">
                            <Button variant="primary" onClick={() => { handleTableToggle(member); setIsActive(true) }}>View</Button>
                          </td>
                        </tr>
                      ))
                    ) : !showloader && memberFeeds && memberFeeds.length === 0 &&
                    <tr className="no--invite">
                      <td colSpan={5}>
                        <h2 className="mt-2 text-center">
                          Members Not Found
                        </h2>
                      </td>
                    </tr>
                    }
                  </tbody>
                </Table>
              </>
            </Container>
          </div>
        </div>
      )}
      {activeTab === "Invitees" && (
        <Invitation
          activeTab={activeTab}
          topbar={pagetopbar}
          activeSubTab={isActiveView}
          searchTerm={searchTerm}
          listfor="company"
          handleIsActive={setIsActive}
          toggleActive={setIsActive}
        />
      )}

      <div className="details--member--view">
        <div className="wrapper--title">
          <div className="projecttitle">
            <h3><strong>Member Details</strong></h3>
          </div>
          <ListGroup horizontal>
            <ListGroup.Item onClick={() => setIsActive(0)}>
              <MdOutlineClose />
            </ListGroup.Item>
          </ListGroup>
        </div>
        <div className="rounded--box">
          <Card>
            <div className="card--img">
              <Card.Img variant="top" src={selectedMember?.avatar ?? "./images/default.jpg"} />
            </div>
            <Card.Body>
              <Card.Title>Member Information</Card.Title>
              <Card.Text>
                <ListGroup>
                  <ListGroup.Item>
                    <strong>Name</strong> {selectedMember?.name}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Email</strong> {selectedMember?.email}
                  </ListGroup.Item>
                  <EditableField
                    selectedMember={selectedMember}
                    field="role"
                    label="Role"
                    value={editedMember?.role}
                    onChange={(value) => handleFieldChange("role", value)}
                    isEditing={isEditing.role}
                    onEditClick={() => handleEditClick("role")}
                    error={errors["role"] && errors["role"]}
                    printval={editedMember.rolename}
                    roles={roles}
                  />
                </ListGroup>
                {currentMember &&
                  Object.keys(currentMember).length > 0 &&
                  currentMember.role?.slug !== "owner" &&
                  selectedMember?.role?.slug === "owner" ? null : (currentMember &&
                    Object.keys(currentMember).length > 0 &&
                    currentMember.role?.permissions?.members ===
                    "view_and_edit") ||
                    selectedMember?._id === currentMember?._id ? (
                  <>
                    <ListGroup.Item>
                      <strong>Recording Type</strong>
                      <Form.Select className="form-control" id="member-meta" onChange={(event) => handleFieldChange("memberMeta", event)}
                        value={editedMember?.memberMeta?.recording} name="recording">
                        <option key={`both`} value='both'>Screenshot And Video</option>
                        <option key={`screenshot_only`} value='screenshot_only'>Screenshot Only</option>
                        <option key={`video_only`} value='video_only'>Video Only</option>
                      </Form.Select>
                    </ListGroup.Item>
                  </>
                ) : (

                  <></>
                )}
                  
                  
                
              </Card.Text>
              <div className="text-end mt-3">
                {currentMember &&
                  Object.keys(currentMember).length > 0 &&
                  currentMember.role?.slug !== "owner" &&
                  selectedMember?.role?.slug === "owner" ? null : (currentMember &&
                    Object.keys(currentMember).length > 0 &&
                    currentMember.role?.permissions?.members ===
                    "view_and_edit") ||
                    selectedMember?._id === currentMember?._id ? (
                  <>
                    <Button variant="danger" className="me-3" onClick={() => setShowDialog(true)}>Delete</Button>
                  </>
                ) : (
                  <></>
                )}
                <Button variant="primary" disabled={updateloader} onClick={handleUpdateSubmit}>{updateloader ? 'Please Wait...' : 'Save Changes'}</Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Modal show={show} onHide={handleClose} centered size="lg" className="add--team--member--modal add--member--modal" onShow={() => selectboxObserver()}>
        <Modal.Header closeButton>
          <Modal.Title>Add Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {rows.map((row, index) => (
              <div className="form-row" key={`row-${index}`}>
                <Form.Group className="mb-0 form-group">
                  <FloatingLabel label="Email address *" controlId={`floatingInput-${index}`}>
                    <Form.Control
                      type="text"
                      className={
                        errors[index] &&
                          errors[index]["email"] &&
                          errors[index]["email"] !== ""
                          ? "input-error"
                          : "form-control"
                      }
                      placeholder="Email address"
                      name="email"
                      value={row.email}
                      onChange={(e) => handleChange(index, e)}
                    />
                  </FloatingLabel>
                  {showError([index], "email")}
                </Form.Group>
                {rows.length > 1 && (
                  <Button variant="link" className="d-md-none" onClick={() => removeRow(index)}>
                    <FaRegTrashAlt />
                  </Button>
                )}
                <Form.Group className="mb-0 form-group">
                  <Form.Select
                    placeholder="Select role"
                    area-label="Role"
                    name="role"
                    controlId="floatingSelect"
                    className={
                      errors[index] &&
                        errors[index]["role"] &&
                        errors[index]["role"] !== ""
                        ? "input-error custom-selectbox"
                        : "form-control custom-selectbox"
                    }
                    value={row.role}
                    onChange={(e) => handleChange(index, e, "role")}
                  >
                    <option value="role">Select role</option>
                    {roles.map((role, roleIndex) => (
                      <option key={`role-${roleIndex}`} value={role._id}>
                        {role.name}
                      </option>
                    ))}
                  </Form.Select>
                  {showError([index], 'role')}
                </Form.Group>
                {rows.length > 1 && (
                  <Button variant="link" onClick={() => removeRow(index)}>
                    <FaRegTrashAlt />
                  </Button>
                )}
              </div>
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-primary" onClick={addRow}>
            Add More
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loader}>
            {loader ? "Please Wait..." : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>

      {(currentMember &&
        currentMember.role?.slug === "owner" &&
        selectedMember?._id !== currentMember?._id) ||
        (selectedMember?._id !== currentMember?._id &&
          currentMember &&
          Object.keys(currentMember).length > 0 &&
          currentMember?.role?.permissions?.members === "view_and_edit" &&
          selectedMember?.role?.slug !== "owner") ? (
        <>
          <AlertDialog
            showdialog={showdialog}
            toggledialog={setShowDialog}
            msg="Are you sure you want to delete the member?"
            callback={handledeleteMember}
          />
        </>
      ) : currentMember &&
        Object.keys(currentMember).length > 0 &&
        currentMember.role?.slug !== "owner" &&
        selectedMember?._id === currentMember._id ? (
        <>
          <AlertDialog
            showdialog={showdialog}
            toggledialog={setShowDialog}
            msg="Are you sure you want leave from the company?"
            callback={handleleavecompany}
          />
        </>
      ) : currentMember &&
        Object.keys(currentMember).length > 0 &&
        currentMember?.role?.permissions?.members === "view_and_edit" &&
        currentMember.role?.slug === "owner" ? (
        <>
          <TransferOnwerShip
            currentMember={currentMember}
            showdialog={showdialog}
            toggledialog={setShowDialog}
            members={memberFeed?.memberData}
          />
        </>
      ) : (
        <></>
      )}
      {/*--=-=Search Modal**/}
      <Modal show={showSearch} onHide={handleSearchClose} size="md" className="search--modal">
        <Modal.Header closeButton>
          <Modal.Title>Search</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            <ListGroup.Item className="border-0 p-0">
              <Form>
                <Form.Group className="mb-0 form-group">
                  <Form.Control type="text" placeholder={activeTab === "Members" ? "Search Member.." : "Search Invitations.."} onChange={(e) => setsearchTerm(e.target.value)} />
                </Form.Group>
              </Form>
            </ListGroup.Item>
          </ListGroup>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default TeamMembersPage;