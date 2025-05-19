import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Row, Col, Button, Modal, Form, FloatingLabel, Card, ListGroup, Table, Accordion, Stack, FormGroup } from "react-bootstrap";
import { FaList, FaPlus, FaRegTrashAlt } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { TbLockAccess } from "react-icons/tb";
import { getMemberdata } from "../../helpers/commonfunctions";
import { BsGrid } from "react-icons/bs";
import { FaUserLock } from "react-icons/fa";
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
import { socket, currentMemberProfile } from "../../helpers/auth";
import {
  updatePermissions
} from "../../redux/actions/permission.action";
import { permissionModules } from "../../helpers/permissionsModules";


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
  const memberProfile = currentMemberProfile()
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
  const apiPermission = useSelector((state) => state.permissions);
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
  const [ showPermissions, setShowPermissions] = useState( false)
  const [memberIndex, setMemberIndex] = useState('')
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
  const [ tab, setTab] = useState('details')
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
    dispatch(getAvailableRolesByWorkspace({ fields: "_id name permissions" }));
    let prm = {};
    permissionModules.forEach((mod) => {
      prm[mod.slug] = {}; // Initialize object for each module
      mod.permissions.forEach((p) => {
        prm[mod.slug][p] = '';
      });
    });

    setPermissions(prm);
  }, []);

  useEffect(() => {
    if (currentPage !== "" && activeTab === "Members") {
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
      if (activeTab === "Members") {
        if(apiResult.updatedMember){
          socket.emit('refresh_record_type', selectedMember?._id)
          const updatedMemberFeeds = memberFeeds.map(m =>
            m._id.toString() === apiResult.updatedMember._id.toString()
              ? apiResult.updatedMember
              : m
          );
          
          setMemberFeed(updatedMemberFeeds);
          setSelectedMember(apiResult.updatedMember)
          
        }else{
          handleListMember();
        }
      }
      setLoader(false);
      setUpdateLoader(false)
      setRows([{ email: "", role: "" }]);
      setErrors([]);
      setShow(false);
      
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
      setLoader(false);
      if (apiPermission.success && activeTab === "Members") {
        
        if (apiPermission.updatedMember) {
          const updatedMemberFeeds = memberFeeds.map(m =>
            m._id.toString() === apiPermission.updatedMember._id.toString()
              ? apiPermission.updatedMember
              : m
          );
          
          setMemberFeed(updatedMemberFeeds);
        }
      }
    }, [apiPermission]);

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
      const merged = {};
            
      // Step 1: Initialize merged with empty string values
      permissionModules.forEach((mod) => {
        merged[mod.slug] = {};
        mod.permissions.forEach((p) => {
          merged[mod.slug][p] = '';
        });
      });
      

      setPermissions((prev) => {
        const newPerms = selectedMember?.memberMeta?.permissions || {};
      
        // Clone merged to avoid mutating the original reference
        const updated = { ...merged };
      
        // First, update existing keys in merged
        for (const module in updated) {
          updated[module] = { ...updated[module] }; // clone inner object
          for (const key in updated[module]) {
            if (newPerms?.[module] && key in newPerms[module]) {
              updated[module][key] = newPerms[module][key];
            } else {
              updated[module][key] = '';
            }
          }
        }
      
        // Then, add any missing modules or keys from newPerms
        for (const module in newPerms) {
          if (!updated[module]) {
            updated[module] = {};
          }
          for (const key in newPerms[module]) {
            if (!(key in updated[module])) {
              updated[module][key] = newPerms[module][key];
            }
          }
        }
      
        return updated;
      });
      
      
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
        ['role']: matchingRole._id,
        memberMeta: {
          ...prevState.memberMeta,
          ['permissions']: matchingRole.permissions,
        },
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
        if( row.permissions){
          formData.append(`members[${index}][permissions]`, JSON.stringify(row.permissions));
        }
      });
      
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

 const [permissions, setPermissions] = useState({});
  const [expanded, setExpanded] = useState({});
  const handleToggleExpandAll = () => {
    const areAllExpanded = permissionModules.every(mod => expanded[mod.slug]);
  
    const newExpandedState = {};
    permissionModules.forEach(mod => {
      newExpandedState[mod.slug] = !areAllExpanded;
    });
  
    setExpanded(newExpandedState);
  };
  
  const toggleExpand = (module) => {
    setExpanded((prev) => ({
      ...prev,
      [module]: !prev[module],
    }));
  };

  const toggleView = (module) => {
    const isChecked = !(permissions?.[module]?.view || false);

    const currentPerms = permissions?.[module] || {};
    const updated = {
      ...currentPerms,
      view: isChecked,
    };

    if (!isChecked) {
      const moduleData = permissionModules.find((m) => m.slug === module);
      if (moduleData) {
        (moduleData.permissions || []).forEach((perm) => {
          if (perm !== "view") {
            updated[perm] = false;
          }
        });
      }
    }

    setPermissions((prev) => ({
      ...prev,
      [module]: updated,
    }));
  };
  const togglePermission = (module, perm) => {
    setPermissions((prev) => {
      const currentPerms = prev?.[module] || {};
      return {
        ...prev,
        [module]: {
          ...currentPerms,
          [perm]: !currentPerms?.[perm],
        },
      };
    });
  };

  const handleSelectAll = (modSlug, isChecked) => {
    const memberIds = memberFeeds.map((member) => String(member._id));
    memberIds.push('unassigned')
    if (isChecked) {
      setPermissions((prev) => {
        const currentPerms = prev?.[modSlug] || {};
        const currentMembers = currentPerms['selected_members'] || [];
    
        return {
          ...prev,
          [modSlug]: {
            ...currentPerms,
            ['selected_members']: memberIds,
          },
        };
      });
    } else {
      setPermissions((prev) => {
        const currentPerms = prev?.[modSlug] || {};
        return {
          ...prev,
          [modSlug]: {
            ...currentPerms,
            ['selected_members']: [],
          },
        };
      });
    }
  };


  const handleSelectAllPermissions = (isChecked) => {
    const updatedPermissions = {};
  
    permissionModules.forEach((mod) => {
      const modSlug = mod.slug;
      const currentModPerms = permissions?.[modSlug] || {};
  
      const updatedModPerms = {};
  
      // Set all boolean permissions to true/false
      (mod.permissions || []).forEach((perm) => {
        updatedModPerms[perm] = isChecked;
      });
  
      // For modules that have selected_members, add them
      if (["tracking", "projects", "reports", "attendance"].includes(modSlug)) {
        if (isChecked) {
          const allMemberIds = memberFeeds.map((m) => String(m._id));
          if (modSlug === "projects") {
            allMemberIds.push("unassigned");
          }
          updatedModPerms["selected_members"] = allMemberIds;
        } else {
          updatedModPerms["selected_members"] = [];
        }
      }
  
      updatedPermissions[modSlug] = updatedModPerms;
    });
  
    setPermissions((prev) => ({ ...prev, ...updatedPermissions }));
  };
  
  

  const toggleMembers = (module, perm, memberId) => {
    setPermissions((prev) => {
      const currentPerms = prev?.[module] || {};
      const currentMembers = currentPerms[perm] || [];
  
      const updatedMembers = currentMembers.includes(memberId)
        ? currentMembers.filter((id) => id !== memberId)
        : [...currentMembers, memberId];
  
      return {
        ...prev,
        [module]: {
          ...currentPerms,
          [perm]: updatedMembers,
        },
      };
    });
  };
  

  useEffect(() => {
    console.log("permissions:: ", permissions);
  }, [permissions]);

  const handleSave = async (e) => {
    setLoader(true);
      try {
        const roleData = {
          memberId: selectedMember._id,
          permissions,
          type: "member",
        };
        setLoader(true);
        dispatch(updatePermissions(roleData));
      } catch (err) {
        setLoader(false);
        console.error("Error adding role:", err);
        alert("Error adding role");
      }
  };

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

  const showPermissionsModal = (id, index) => {
    setMemberIndex( index )
    if( rows[index] && rows[index]?.permissions && rows[index]?.role === id){
      setPermissions(rows[index]?.permissions)
    }else{
      const matchedRole = roles.find(role => role._id === id);
      const matchedPermissions = matchedRole ? matchedRole.permissions : [];
      setPermissions(matchedPermissions)
    }
    
    setShowPermissions( true )
  }

  const handleSavePermissions = () => {
    const updatedRows = [...rows];
    updatedRows[memberIndex] = { ...updatedRows[memberIndex], ['permissions']: permissions };
    setRows(updatedRows);
    setShowPermissions( false )
  }
  
  const pagetopbar = () => {
    return (
      <div className='page--title px-md-2 pt-3'>
        <Container fluid>
          <Row>
            <Col sm={12}>
              <h2>
                Members
                <Button variant="primary" className={isActive ? 'd-flex ms-auto' : 'd-lg-none ms-auto ms-md-2'} onClick={handleSearchShow}><MdSearch /></Button>
                {(memberProfile?.permissions?.members?.create_edit_delete === true || memberProfile?.role?.slug === "owner") && (
                  <Button variant="primary" onClick={handleShow}><FaPlus /></Button>
                  
                )}
                <ListGroup horizontal className={isActive ? "d-none" : "ms-auto d-none d-md-flex"}>
                  <ListGroup.Item className='d-none d-md-block' action active={activeTab === "Members"} onClick={() => { setsearchTerm(''); setActiveTab("Members") }}>Members</ListGroup.Item>
                  {(memberProfile?.permissions?.members?.create_edit_delete === true || memberProfile?.role?.slug === "owner") && (
                  <ListGroup.Item className='d-none d-md-block' action active={activeTab === "Invitees"} onClick={() => { setsearchTerm(''); setActiveTab("Invitees") }}>Invitations</ListGroup.Item>
                  )}
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
      { isActive &&
      <div className="details--member--view">
        <div className="wrapper--title">
          <div className="projecttitle">
            <h3><strong>Member Details</strong></h3>
          </div>
         
          <ListGroup horizontal>
          <Button variant="outline-primary" className={`btn--view d-none d-sm-flex${tab === 'details' ? ' active' : ''}`} onClick={() => setTab('details')}>Details</Button>
          { (memberProfile?.permissions?.members?.update_permissions === true || memberProfile?.role?.slug === "owner") && (
          <Button variant="outline-primary" className={`btn--view d-none d-sm-flex${tab === 'permissions' ? ' active' : ''}`} onClick={() => {
           setTab('permissions')
            }}>Permissions</Button>
          )}
            <ListGroup.Item onClick={() => setIsActive(0)}>
              <MdOutlineClose />
            </ListGroup.Item>
          </ListGroup>
        </div>
        { tab === 'details' ?
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
                    {(memberProfile?.permissions?.members?.create_edit_delete === true  || memberProfile?.role?.slug === "owner")?
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
                      :
                      <>
                      <ListGroup.Item>
                        <strong>Role</strong> {editedMember.rolename}
                      </ListGroup.Item>
                      </>
                    }
                  </ListGroup>
                  
                  <ListGroup.Item>
                    <strong>Recording Type</strong>
                    {
                      (memberProfile?.permissions?.members?.create_edit_delete === true &&
                      selectedMember?._id !== currentMember?._id || memberProfile?.role?.slug === "owner") ? 

                        <Form.Select className="form-control" id="member-meta" onChange={(event) => handleFieldChange("memberMeta", event)}
                        value={editedMember?.memberMeta?.recording} name="recording">
                        <option key={`both`} value='both'>Screenshot And Video</option>
                        <option key={`screenshot_only`} value='screenshot_only'>Screenshot Only</option>
                        <option key={`video_only`} value='video_only'>Video Only</option>
                      </Form.Select>
                      :
                      <span>{editedMember?.memberMeta?.recording
                        ?.replace(/_/g, ' ')
                        .replace(/^./, (char) => char.toUpperCase())}</span>
                    }
                   
                  </ListGroup.Item>
                    
                    
                    
                  
                </Card.Text>
                <div className="text-end mt-3">
                  {
                      (memberProfile?.permissions?.members?.create_edit_delete === true &&
                      selectedMember?._id !== currentMember?._id  || memberProfile?.role?.slug === "owner") ? (
                    <>
                      <Button variant="danger" className="me-3" onClick={() => setShowDialog(true)}>Delete</Button>
                    </>
                  ) : (
                    <></>
                  )}
                  {(memberProfile?.permissions?.members?.create_edit_delete === true || memberProfile?.role?.slug === "owner") ?
                  <Button variant="primary" disabled={updateloader} onClick={handleUpdateSubmit}>{updateloader ? 'Please Wait...' : 'Save Changes'}</Button>
                  :
                  <></>
                  }
                </div>
              </Card.Body>
            </Card>
          </div>
        :
        <div className="rounded-box">
        <Card>
          <Card.Body>
              <Card.Title>Permissions</Card.Title>
              
                <>
                <div className="card--header">
                  <FormGroup className="form-group mb-0 pb-0">
                  <Form.Check
                    type="checkbox"
                    id="all"
                    label="Select All Permissions"
                    checked={permissionModules.every((mod) => {
                      const modSlug = mod.slug;
                      const modPerms = permissions?.[modSlug] || {};

                      const allPermsChecked = (mod.permissions || []).every((perm) => modPerms[perm] === true);

                      const selectedIds = modPerms["selected_members"] || [];
                      const allMemberIds = memberFeeds.map((m) => String(m._id));
                      if (modSlug === "projects") allMemberIds.push("unassigned");

                      const allMembersChecked = selectedIds.length === allMemberIds.length &&
                        allMemberIds.every((id) => selectedIds.includes(id));

                      if (["tracking", "projects", "reports", "attendance"].includes(modSlug)) {
                        return allPermsChecked && allMembersChecked;
                      }

                      return allPermsChecked;
                    })}
                    onChange={(e) => handleSelectAllPermissions(e.target.checked)}
                  />

                  </FormGroup>
                  <Button type="button" variant="link" className="p-0" onClick={handleToggleExpandAll}>
                    {permissionModules.every(mod => expanded[mod.slug]) ? "Collapse All" : "Expand All"}
                  </Button>

                 
                </div>
                <Accordion  activeKey={Object.entries(expanded)
                    .filter(([_, v]) => v)
                    .map(([k]) => k)}
                  alwaysOpen>
                  {permissionModules.map((mod) => {
                    const modSlug = mod.slug;
                    const modPerms = permissions?.[modSlug] || {};
                    const isExpanded = expanded?.[modSlug] || false;
                    const isViewChecked = !!modPerms.view; console.log(Object.values(modPerms))
                    const truePermissionCount = Object.values(modPerms).filter(val => val === true).length;

                    return (
                      <Accordion.Item eventKey={modSlug}>
                            <Accordion.Header onClick={() => {
                              setExpanded(prev => ({
                                ...prev,
                                [modSlug]: !prev[modSlug]
                              }));
                            }}>{mod.name} <span className="per--count">{truePermissionCount}/{mod?.permissions?.length}</span> </Accordion.Header>
                            <Accordion.Body>
                            <div className="transition-all">
                            {(mod.permissions || []).map((perm) => {
                              if (perm === 'view') {
                                return (
                                  <Form.Check
                                    key={`${modSlug}--view`}
                                    type="checkbox"
                                    id={`${modSlug}-view`}
                                    label="View"
                                    checked={!!modPerms.view}
                                    disabled={selectedMember?.role?.slug === "owner"}
                                    onChange={() => {
                                      if(selectedMember?.role?.slug !== "owner"){ 
                                        toggleView(modSlug)
                                      }}
                                    }
                                  />
                                );
                              }

                              return (
                                <>
                                  <Form.Check
                                    key={perm}
                                    type="checkbox"
                                    id={`${modSlug}-${perm}`}
                                    label={perm
                                      .replace(/[_-]/g, " ")
                                      .replace(/^\w/, (l) => l.toUpperCase())}
                                    disabled={!isViewChecked}
                                    checked={!!modPerms[perm]}
                                    readOnly={selectedMember?.role?.slug === "owner"}
                                    onChange={() => {
                                      if(selectedMember?.role?.slug !== "owner"){ togglePermission(modSlug, perm)}

                                    }}
                                    className={!isViewChecked ? 'parent-item text-muted' : 'parent-item'}
                                  />
                              
                              {["tracking", "projects", "reports", "attendance"].includes(modSlug) &&
                                perm === "view_others" &&
                                modPerms[perm] === true &&
                                <>
                                <Form.Check
                                  key={`${modSlug}-${perm}-select-all`}
                                  type="checkbox"
                                  id={`${modSlug}-${perm}-select-all`}
                                  label="Select all"
                                  disabled={selectedMember?.role?.slug === "owner"}
                                  checked={memberFeeds.every((member) =>
                                    modPerms["selected_members"]?.includes(String(member._id))
                                  )}
                                  onChange={(e) => {
                                    if(selectedMember?.role?.slug !== "owner"){ 
                                      handleSelectAll(modSlug, e.target.checked)
                                    }
                                  }}
                                  className="sub-items"
                                />
                                <>
                                  {memberFeeds.map((member) => (
                                    <Form.Check
                                      key={`${modSlug}-${perm}-${member._id}`}
                                      type="checkbox"
                                      id={`${modSlug}-${perm}-${member._id}`}
                                      label={member.name}
                                      checked={modPerms["selected_members"]?.includes(String(member._id))}
                                      disabled={selectedMember?.role?.slug === "owner"}
                                      onChange={() => {
                                        if (selectedMember?.role?.slug !== "owner") {
                                          toggleMembers(modSlug, "selected_members", member._id);
                                        }
                                      }}
                                      className="sub-items"
                                    />
                                  ))}

                                  {modSlug === "projects" && (
                                    <Form.Check
                                      key={`${modSlug}-${perm}-unassigned`}
                                      type="checkbox"
                                      id={`${modSlug}-${perm}-unassigned`}
                                      label="Unassigned"
                                      checked={modPerms["selected_members"]?.includes('unassigned')}
                                      disabled={selectedMember?.role?.slug === "owner"}
                                      onChange={() => {
                                        if (selectedMember?.role?.slug !== "owner") {
                                          toggleMembers(modSlug, "selected_members", 'unassigned');
                                        }
                                      }}
                                      className="sub-items"
                                    />
                                  )}
                                  </>

                                </>
                                }
                                </>
                              );
                              
                            })}

                          </div>
                            </Accordion.Body>
                          </Accordion.Item>
                      
                    );
                  })}
                  </Accordion>
                  <div className="mt-4 text-end">
                    <Button variant="primary" onClick={handleSave} disabled={loader}>
                      { loader ? 'Please wait...' : 'Save Permissions'}
                    </Button>
                  </div>
                  </>
              </Card.Body>
          </Card>
        </div>
        }
      </div>
        }
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
                {/* {rows.length > 1 && (
                  <Button variant="link" className="d-md-none" onClick={() => removeRow(index)}>
                    <FaRegTrashAlt />
                  </Button>
                )} */}
                
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
                {
                  (row.role !== "") && (
                    <Button variant="link" className="view-perm-btn" onClick={() => {showPermissionsModal(row.role, index)}}><FaUserLock /></Button>
                  )
                }
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
      { showPermissions &&
        <Modal show={showPermissions} onHide={() => setShowPermissions( false )} centered size="lg" className="add--team--member--modal add--member--modal" >
          <Modal.Header closeButton>
            <Modal.Title>Permissions</Modal.Title>
          </Modal.Header>
            <Modal.Body>
              <Card>
                <Card.Body>
                    <Card.Title>Permissions</Card.Title>
                    
                      <>
                      <div className="card--header">
                        <FormGroup className="form-group mb-0 pb-0">
                        <Form.Check
                          type="checkbox"
                          id="all"
                          label="Select All Permissions"
                          checked={permissionModules.every((mod) => {
                            const modSlug = mod.slug;
                            const modPerms = permissions?.[modSlug] || {};

                            const allPermsChecked = (mod.permissions || []).every((perm) => modPerms[perm] === true);

                            const selectedIds = modPerms["selected_members"] || [];
                            const allMemberIds = memberFeeds.map((m) => String(m._id));
                            if (modSlug === "projects") allMemberIds.push("unassigned");

                            const allMembersChecked = selectedIds.length === allMemberIds.length &&
                              allMemberIds.every((id) => selectedIds.includes(id));

                            if (["tracking", "projects", "reports", "attendance"].includes(modSlug)) {
                              return allPermsChecked && allMembersChecked;
                            }

                            return allPermsChecked;
                          })}
                          onChange={(e) => handleSelectAllPermissions(e.target.checked)}
                        />

                        </FormGroup>
                        <Button type="button" variant="link" className="p-0" onClick={handleToggleExpandAll}>
                          {permissionModules.every(mod => expanded[mod.slug]) ? "Collapse All" : "Expand All"}
                        </Button>

                      
                      </div>
                      <Accordion  activeKey={Object.entries(expanded)
                          .filter(([_, v]) => v)
                          .map(([k]) => k)}
                        alwaysOpen>
                        {permissionModules.map((mod) => {
                          const modSlug = mod.slug;
                          const modPerms = permissions?.[modSlug] || {};
                          const isExpanded = expanded?.[modSlug] || false;
                          const isViewChecked = !!modPerms.view;
                          const truePermissionCount = Object.values(modPerms).filter(val => val === true).length;

                          return (
                            <Accordion.Item eventKey={modSlug}>
                                  <Accordion.Header onClick={() => {
                                    setExpanded(prev => ({
                                      ...prev,
                                      [modSlug]: !prev[modSlug]
                                    }));
                                  }}>{mod.name} <span className="per--count">{truePermissionCount}/{mod?.permissions?.length}</span> </Accordion.Header>
                                  <Accordion.Body>
                                  <div className="transition-all">
                                  {(mod.permissions || []).map((perm) => {
                                    if (perm === 'view') {
                                      return (
                                        <Form.Check
                                          key={`${modSlug}--view`}
                                          type="checkbox"
                                          id={`${modSlug}-view`}
                                          label="View"
                                          checked={!!modPerms.view}
                                          onChange={() => {
                                            toggleView(modSlug)
                                          }
                                          }
                                        />
                                      );
                                    }

                                    return (
                                      <>
                                        <Form.Check
                                          key={perm}
                                          type="checkbox"
                                          id={`${modSlug}-${perm}`}
                                          label={perm
                                            .replace(/[_-]/g, " ")
                                            .replace(/^\w/, (l) => l.toUpperCase())}
                                          
                                          checked={!!modPerms[perm]}
                                          onChange={() => {
                                            togglePermission(modSlug, perm)}

                                          }
                                          className={!isViewChecked ? 'parent-item text-muted' : 'parent-item'}
                                        />
                                    
                                    {["tracking", "projects", "reports", "attendance"].includes(modSlug) &&
                                      perm === "view_others" &&
                                      modPerms[perm] === true &&
                                      <>
                                      <Form.Check
                                        key={`${modSlug}-${perm}-select-all`}
                                        type="checkbox"
                                        id={`${modSlug}-${perm}-select-all`}
                                        label="Select all"
                                        
                                        checked={memberFeeds.every((member) =>
                                          modPerms["selected_members"]?.includes(String(member._id))
                                        )}
                                        onChange={(e) => {
                                          
                                            handleSelectAll(modSlug, e.target.checked)
                                          
                                        }}
                                        className="sub-items"
                                      />
                                      <>
                                        {memberFeeds.map((member) => (
                                          <Form.Check
                                            key={`${modSlug}-${perm}-${member._id}`}
                                            type="checkbox"
                                            id={`${modSlug}-${perm}-${member._id}`}
                                            label={member.name}
                                            checked={modPerms["selected_members"]?.includes(String(member._id))}
                                            
                                            onChange={() => {
                                              toggleMembers(modSlug, "selected_members", member._id);
                                            }}
                                            className="sub-items"
                                          />
                                        ))}

                                        {modSlug === "projects" && (
                                          <Form.Check
                                            key={`${modSlug}-${perm}-unassigned`}
                                            type="checkbox"
                                            id={`${modSlug}-${perm}-unassigned`}
                                            label="Unassigned"
                                            checked={modPerms["selected_members"]?.includes('unassigned')}
                                            onChange={() => {
                                                toggleMembers(modSlug, "selected_members", 'unassigned');
                                            }}
                                            className="sub-items"
                                          />
                                        )}
                                        </>

                                      </>
                                      }
                                      </>
                                    );
                                    
                                  })}

                                </div>
                                  </Accordion.Body>
                                </Accordion.Item>
                            
                          );
                        })}
                        </Accordion>
                        <div className="mt-4 text-end">
                          <Button variant="primary" onClick={handleSavePermissions}>
                          Save Permissions
                          </Button>
                        </div>
                        </>
                    </Card.Body>
                </Card>
            </Modal.Body>
        </Modal>
      }

      {(memberProfile &&
        memberProfile.role?.slug === "owner" &&
        selectedMember?._id !== memberProfile?._id) ||
        (selectedMember?._id !== memberProfile?._id &&
          memberProfile &&
          Object.keys(memberProfile).length > 0 &&
          memberProfile?.permissions?.members?.create_edit_delete === true &&
          memberProfile?.role?.slug !== "owner") ? (
        <>
          <AlertDialog
            showdialog={showdialog}
            toggledialog={setShowDialog}
            msg="Are you sure you want to delete the member?"
            callback={handledeleteMember}
          />
        </>
      ) : memberProfile &&
        Object.keys(memberProfile).length > 0 &&
        memberProfile.role?.slug !== "owner" &&
        selectedMember?._id === memberProfile._id ? (
        <>
          <AlertDialog
            showdialog={showdialog}
            toggledialog={setShowDialog}
            msg="Are you sure you want leave from the company?"
            callback={handleleavecompany}
          />
        </>
      ) : memberProfile &&
        Object.keys(memberProfile).length > 0 &&
        memberProfile?.role?.permissions?.members?.create_edit_delete === true ||
        memberProfile.role?.slug === "owner" ? (
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