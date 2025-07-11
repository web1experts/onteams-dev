import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Modal, Form, FloatingLabel, Card, ListGroup, Table, Dropdown } from "react-bootstrap";
import { FaEye, FaList, FaPlus, FaTrashAlt, FaCog } from "react-icons/fa";
import { FiEdit, FiMail, FiPhone, FiSidebar } from "react-icons/fi";
import { BsGrid, BsEye } from "react-icons/bs";
import { TbArrowsSort } from "react-icons/tb";
import { GrExpand } from "react-icons/gr";
import { MdOutlineSearch, MdDragIndicator, MdOutlineClose, MdSearch } from "react-icons/md";
import { ListClients, deleteClient, updateClient } from "../../redux/actions/client.action";
import { toggleSidebar, toggleSidebarSmall } from "../../redux/actions/common.action";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getFieldRules, validateField } from '../../helpers/rules';
import { jwtDecode } from "jwt-decode"
import AddClient from "./AddClient";
import { AlertDialog } from "../modals";
import { renderDynamicField } from "../common/dynamicFields";
import { fetchCustomFields } from "../../redux/actions/customfield.action";
import { currentMemberProfile } from "../../helpers/auth";
import { CustomFieldModal } from "../modals/customFields";

/*function EditableField({ field, label, value, onChange, isEditing, onEditClick, error }) {
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const [originalValue, setOriginalValue] = useState(value);

  useEffect(() => {
    function handleClickOutside(event) {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        if (inputRef.current.value.trim() === '') {
          onChange(originalValue);
        }
        onEditClick(false);
      }
    }
    if (isEditing) {
      setOriginalValue(value);
      if (inputRef.current) {
        inputRef.current.focus();
      }
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, onEditClick, value]);


  return (
    <>

      {isEditing ? (
        <>
          <FloatingLabel label={label}>
            <Form.Control type="text" placeholder={label} name={`${field}`} ref={inputRef} value={value} onChange={(e) => onChange(e.target.value)} />
          </FloatingLabel>
        </>

      ) : (
        <>
          <strong>{label}</strong> {value} <FiEdit onClick={() => onEditClick(true)} />
          <p className='error'><span className='error'>{error}</span></p>
        </>
      )}
    </>
  );

}*/


function ClientsPage() {
  const [spinner, setSpinner] = useState(false)
  const inputs = document.querySelectorAll('.form-floating .form-control');
   const handleSidebar = () => dispatch(toggleSidebar(commonState.sidebar_open ? false : true))
   const handleSidebarSmall = () => dispatch(toggleSidebarSmall(commonState.sidebar_small ? false : true))
   const commonState = useSelector(state => state.common)
   const [ isEditing, setIsEditing] = useState( false )
  const memberProfile = currentMemberProfile()
  inputs.forEach(input => {
    input.addEventListener('input', function () {
      if (this.value) {
        this.classList.add('filled');
      } else {
        this.classList.remove('filled');
      }
    });

    // Initial check in case the input is pre-filled
    if (input.value) {
      input.classList.add('filled');
    }
  });

  const [isActiveView, setIsActiveView] = useState(2);
  const [rows, setRows] = useState([{ name: '' }]);
  const [errors, setErrors] = useState({});
  const [fieldserrors, setFieldErrors] = useState({ name: '' });
  const [customFields, setCustomFields] = useState([]);
  const apiCustomfields = useSelector( state => state.customfields)
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isActive, setIsActive] = useState(false);
  const [disable, setDisable] = useState(true);
  const handleClick = (client) => {
    setAvatarPreview(null)
    setSelectedClient(client)
    if (!isActive) {
      setIsActive(current => !current);
    }

  };
  let fieldErrors = {};
  let hasError = false;
  const [loader, setLoader] = useState(false);
  const [show, setShow] = useState(false);
  const handleClose = () => {
    requestAnimationFrame(() => {

      setRows([{ name: '' }]);
      setErrors([]);
      setShow(false);
    });

  }
  const [showdialog, setShowDialog] = useState(false);
  const handleShow = () => setShow(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState('');
  const [total, setTotal] = useState(0)
  const clientFeed = useSelector(state => state.client.clients);
  const [clientFeeds, setClientFeed] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null)
  const [userId, setuserId] = useState('');
  const pagesToDisplay = [];
  const [showloader, setShowloader] = useState(true)
  const apiResult = useSelector(state => state.client);
  const [editedClient, setEditedClient] = useState({});
  const [fields, setFields] = useState({ name: '', remove_avatar: false });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [ showCustomFields, setShowCustomFields] = useState( false )
  

  const [showSearch, setSearchShow] = useState(false);
  const handleSearchClose = () => setSearchShow(false);
  const handleSearchShow = () => setSearchShow(true);

  const handleClosePannel = () => {
    setIsEditing({
      name: false,
      avatar: false,
      remove_avatar: false
    });
    setIsActive(false)
  }

  const handledeleteClient = async () => {
    await dispatch(deleteClient(selectedClient._id))
  }

  const handleEditClick = (fieldName) => {
    setIsEditing((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  useEffect(() => {
    console.log(fields);
  },[fields])

  const handleFieldChange = (field, value) => {
   
    // if (field in editedClient) {
    if (field === "avatar") {
      setFields((prevState) => ({
        ...prevState,
        [field]: value.target.files[0],
        ['remove_avatar']: true
      }));
      setAvatarPreview(URL.createObjectURL(value.target.files[0]));
    } else {
      setFields((prevState) => ({
        ...prevState,
        [field]: value,
      }));
      if (value !== "") {
        setFieldErrors({ ...fieldErrors, [field]: "" })
      }
    }
    setDisable(false)
    // } else {
    //   setEditedClient((prevState) => ({
    //     ...prevState,
    //     [field]: value,
    //   }));
    //   setEditedClient((prevState) => ({
    //     ...prevState,
    //     usermeta: prevState.usermeta.map(meta =>
    //       meta.meta_key === field ? { ...meta, meta_value: value } : meta
    //     )
    //   }));
    // }
  };

  const toggleCustomFields = () => {
    setShowCustomFields(prev => !prev);
  }

  const deleteSuccess = useSelector(state => state.client.deletedClient);

  useEffect(() => {
    if (selectedClient) { // Check if data is available
      // setIsEditing({
      //   name: false,
      //   avatar: false,
      //   remove_avatar: false
      // });
      // setEditedClient({ ...selectedClient });
    }
    let fieldsSetup = {
      name: selectedClient?.name,
      remove_avatar: false
    }
    if (selectedClient?.customFields && Object.keys(selectedClient?.customFields).length > 0) {
        Object.values(selectedClient?.customFields).forEach(field => {
            fieldsSetup[`custom_field[${field.meta_key}]`] = field.meta_value;
        });
    }else{
        customFields.forEach(field => {
            fieldsSetup[`custom_field[${field.name}]`] = ''
        });
        
    }
    setFields(
      fieldsSetup
    )
  }, [selectedClient]);

  useEffect(() => {
    if( deleteSuccess ){
      setIsActive( false )
      setSelectedClient({})
    }
  }, [deleteSuccess])

  // const [isEditing, setIsEditing] = useState({
  //   name: false,
  //   avatar: false
  // });

  const handleListClients = async () => {
    setClientFeed([])
    await dispatch(ListClients(currentPage, search))
    setSpinner(false)
  }

  useEffect(() => {

    if (currentPage !== "") {
      setSpinner( true )
      handleListClients()
    }

  }, [currentPage, search])


  useEffect(() => {
    let token = localStorage.getItem('accessToken')
    let DecodedToken = jwtDecode(token)
    setuserId(DecodedToken.aud)
    dispatch(fetchCustomFields({module: 'clients'}))
  }, [])

  useEffect(() => {

    if (apiResult.success) {
      handleClose();
      setShowDialog(false)
    }

    if( apiResult.success === true && apiResult.updatedClient){
       
            setClientFeed((prevClients) =>
                prevClients.map((client) =>
                  client._id === apiResult.updatedClient._id ? apiResult.updatedClient : client
                )
            );  
            setSelectedClient(apiResult.updatedClient )
       
    }

    if (apiResult.success || apiResult.error) {
      setLoader(false)
      
    }
  }, [apiResult])

  useEffect(() => { 
      if( apiCustomfields.customFields){
        setCustomFields( apiCustomfields.customFields)
      }
  
      if( apiCustomfields.newField){
        setCustomFields((prevCustomFields) => [apiCustomfields.newField, ...prevCustomFields]);
      }
  
        if (apiCustomfields.updatedField) {
        setCustomFields((prevCustomFields) =>
          prevCustomFields.map((field) =>
            field._id === apiCustomfields.updatedField._id
              ? apiCustomfields.updatedField
              : field
          )
        );
      }
  
  }, [apiCustomfields]);

  const handleChange = ({ target: { name, value, type, files, checked } }) => { 
    const finalValue =
    type === 'checkbox' ? checked : type === 'file' ? files : value;
    
    setFields({ ...fields, [name]: finalValue });
    setErrors({ ...errors, [name]: '' })
  };

  // const handleChange = ( event, fieldname = '') => {
  //   const { name, value, type, files } = event.target;
  //   const updatedRows = [...rows];


  //   // updatedRows[index] = { ...updatedRows[index], [name]: value };
  //   // setRows(updatedRows);
  //   // const updatedErrors = [...errors];
  //   // // Check if there is an error message for the specified field at the given index
  //   // if (updatedErrors[index] && updatedErrors[index][name]) {
  //   //   // If an error message exists, update it to an empty string to remove the error
  //   //   updatedErrors[index][name] = '';
  //   // }
  //   // // Update the errors state with the updated array
  //   // setErrors(updatedErrors);

  // };

  useEffect(() => {
    const check = ['undefined', undefined, 'null', null, '']

    if (clientFeed && clientFeed.clientData) {
      setClientFeed(clientFeed.clientData)
      setTotalPages(clientFeed.totalPages)
      setTotal(clientFeed.total)
    }

  }, [clientFeed])

  useEffect(() => {
    // Example: Set currentProject initially if not already set
    if (clientFeeds && clientFeeds.length > 0 && selectedClient !== null && Object.keys(selectedClient).length > 0) {
      clientFeeds.forEach((c, inx) => {
        if (c._id === selectedClient._id) {
          setSelectedClient(c);
          setAvatarPreview(null)
          return;
        }
      })

    }
  }, [clientFeeds]);
  

  const showError = (index, name) => {
    if (errors[index] && errors[index][name]) return (<span className="error">{errors[index][name]}</span>);
    return null;
  };
  const handleUpdateSubmit = async (event) => {
    event.preventDefault();

    // const changes = compareClient(selectedClient, editedClient);
    
    if (Object.keys(fields).length > 0) {
      setLoader(true)


      const updatedErrorsPromises = Object.entries(fields).map(async ([fieldName, value]) => {
        // Get rules for the current field
        const rules = getFieldRules('clients', fieldName);
        // Validate the field
        const error = await validateField('clients', fieldName, value, rules);
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
        setFieldErrors(fieldErrors);
        setLoader(false)
      } else {
        if (Object.keys(fields).length > 0) {

          const formData = new FormData();
          for (const [key, value] of Object.entries(fields)) {
             if (key === 'avatar' && value instanceof File) {
                formData.append('files[]', value);
              }
            else if (Array.isArray(value)) { // Check if the value is an array
              if (value.length === 0) {
                  formData.append(`${key}[]`, []); // Append an empty array
              } else {
                  value.forEach(item => {
                      formData.append(`${key}[]`, item); // Append with the same key for non-empty arrays
                  });
              }
            }else if (typeof value === 'object'){
                formData.append(key, JSON.stringify(value))
            } else {
                formData.append(key, value)
            }
          }

          // if (isEditing.remove_avatar === true) {
          //   formData.append('remove_avatar', true);
          // }
          await dispatch(updateClient(selectedClient?._id, formData))

        }
        // setIsEditing({
        //   name: false,
        //   avatar: false,
        //   remove_avatar: false
        // });
        setFields({name: '', remove_avatar: false})
        setLoader(false);
        setIsEditing( false)
      }
    } else {
      setLoader(false)
    }
  };

  const addRow = () => {
    setRows([...rows, { name: '' }]);
    setErrors([...errors, { name: '' }]);
  };

  const removeRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    const updatedErrors = errors.filter((_, i) => i !== index);
    setRows(updatedRows);
    setErrors(updatedErrors);
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    setFields({...fields, ['remove_avatar']: true })
    // setIsEditing({ ...isEditing, ['remove_avatar']: true })
    // setEditedClient({ ...editedClient, ['avatar']: false })
    // setSelectedClient({...selectedClient, avatar: null})
  }


  const compareClient = (original, edited) => {
    const changes = {};
    for (const [key, value] of Object.entries(edited)) {
      
      if (original[key] !== value) {
        changes[key] = value;
      }
    }
    return changes;
  };

  const [projectToggle, setProjectToggle ] = useState(false)
  const handleToggles = () => {
      if(commonState.sidebar_small === false ){ console.log('1')
          handleSidebarSmall()
      }else{
          setProjectToggle(false)
          handleSidebarSmall()
            console.log('3')
      }
  }

  return (
    <>
      <div className={`${isActive ? 'show--details team--page project-collapse' : 'team--page'} ${projectToggle === true ? 'project-collapse' : ''}`}>
        <div className='page--title px-md-2 py-3 bg-white border-bottom'>
          <Container fluid>
            <Row>
              <Col sm={12}>
                <h2>
                  <span className="open--sidebar me-2 d-flex d-xl-none" onClick={() => {handleSidebarSmall(false);setIsActive(0);}}><FiSidebar /></span>
                  Clients
                  <ListGroup horizontal className={isActive ? 'd-none' : 'onlyIconsView ms-auto d-none d-lg-flex'}>
                      <ListGroup.Item className='d-none d-lg-block'>
                        <Form className="search-filter-list" onSubmit={(e) => {e.preventDefault()}}>
                            <Form.Group className="mb-0 form-group">
                                <MdOutlineSearch />
                                <Form.Control type="text" placeholder="Search Client.." onChange={(e) => setSearch(e.target.value)} />
                            </Form.Group>
                        </Form>
                      </ListGroup.Item>
                      <ListGroup horizontal>
                          <ListGroup.Item action className="view--icon d-none d-lg-flex" active={isActiveView === 1} onClick={() => setIsActiveView(1)}><BsGrid /></ListGroup.Item>
                          <ListGroup.Item action className="d-none d-lg-flex view--icon" active={isActiveView === 2} onClick={() => setIsActiveView(2)}><FaList /></ListGroup.Item>
                      </ListGroup>
                    </ListGroup>
                   <ListGroup horizontal className={isActive ? 'd-none' : 'd-none d-md-flex ms-auto ms-lg-0'}>
                    <ListGroup horizontal className="bg-white expand--icon ms-3">
                      <ListGroup.Item className="d-none d-md-flex me-2" key={`settingskey`} onClick={toggleCustomFields }><FaCog /></ListGroup.Item>
                        <ListGroup.Item className="d-none d-lg-flex" onClick={handleToggles}><GrExpand /></ListGroup.Item>
                        {(memberProfile?.permissions?.clients?.create_edit_delete === true || memberProfile?.role?.slug === "owner") && (
                          <ListGroup.Item className="btn btn-primary" onClick={handleShow}><FaPlus /></ListGroup.Item>
                        )}
                    </ListGroup>
                   </ListGroup>
                </h2>
              </Col>
            </Row>
          </Container>
        </div>
        <div className='page--wrapper px-md-2 py-3'>
          {
              spinner &&
              <div className="loading-bar">
                  <img src="images/OnTeam-icon.png" className="flipchar" />
              </div>
          }
          <Container fluid className="pb-5 pt-2">
            <div className={isActiveView === 1 ? 'project--grid--table project--grid--new--table table-responsive-xl' : isActiveView === 2 ? 'project--table draggable--table new--project--rows table-responsive-xl' : 'project--table new--project--rows table-responsive-xl'}>
              <Table>
                <thead className="onHide">
                    <tr key="project-table-header">
                      <th scope="col" className="sticky p-0 border-bottom-0" key="client-name-header">
                          <div className="d-flex align-items-center justify-content-between border-end border-bottom ps-3">
                              Clients <span key="client-action-header" className="onHide">Actions</span>
                          </div>
                      </th>
                      
                      {Array.isArray(customFields) && customFields
                        .filter(field => field?.showInTable !== false)
                        .map((field, idx) => (
                          <th scope="col" key={`client-field-${idx}-header`} className="onHide p-0 border-bottom-0"><div className="border-bottom padd--x">{field.label}</div></th>
                        ))
                      }
                    </tr>
                </thead>
                <tbody>
                  {
                    (!spinner && clientFeeds && clientFeeds.length > 0)
                      ? clientFeeds.map((client, index) => {
                        return (<>
                          <tr key={`client-row-${index}`} className={client._id === selectedClient?._id ? 'project--active' : ''} onClick={isActive ? () => handleClick(client) : () => { return false; }}>
                            {/* <td>{index + 1}</td> */}
                            <td className="project--title--td sticky" key={`title-index-${index}`} data-label="Client Name">
                              <div className="d-lg-flex justify-content-between border-end flex-wrap">
                                  <div className="project--name">
                                      <div className="drag--indicator"><abbr key={`index-${index}`}>{index + 1}</abbr></div>
                                      <div className="title--initial">{client.name.charAt(0)}</div>
                                      <div className="title--span flex-column align-items-start gap-0">
                                          <span>{client.name}</span>
                                      </div>
                                  </div>
                                   <div className="onHide task--buttons">
                                      <Button variant="primary" className="px-3 py-2" onClick={() => {handleClick(client);}}><BsEye /></Button>
                                  </div>
                              </div>
                            </td>
                            {Array.isArray(customFields) && customFields
                              .filter(field => field?.showInTable !== false)
                              .map((field, idx) => {
                                  const fieldname = field.name;
                                  let mvalue = client?.customFields?.[fieldname]?.meta_value;
                                  if (field.type === 'badge' && Array.isArray(field.options)) {
                                      const matchedOption = field.options.find(opt => opt.value === mvalue);
                                      if (matchedOption) {
                                      mvalue = (
                                          <span
                                            className="priority--badge"
                                            style={{
                                              backgroundColor: matchedOption.color,
                                              color: "#fff",
                                              display: "inline-block",
                                              borderColor: matchedOption.color,
                                              borderWidth: '1px',
                                              borderStyle: 'solid'
                                            }}
                                          >
                                          {client?.customFields?.[fieldname]?.meta_value}
                                          </span>
                                      );
                                      }
                                  }
                                  return (
                                      <td key={`client-${fieldname || idx}-${mvalue}`} className="onHide new--td">
                                          {mvalue}
                                      </td>
                                  );
                              })}
                            <td className="task--last--buttons mt-auto" key={`client-td3-${index}`}>
                              <div className="d-flex justify-content-between">
                                  <div className="onHide">
                                      <Button variant="dark" className="me-2 px-3 py-1" onClick={() => {handleClick(client);}}><BsEye /> View</Button>
                                  </div>
                              </div>
                            </td>
                          </tr>
                        </>)
                      })
                      :
                      
                      !spinner && isActiveView === 2 &&
                        <tr className="no--invite">
                          <td colSpan={3}>
                            <h2 className="mt-2 text-center">Clients Not Found</h2>
                          </td>
                        </tr>
                  }
                </tbody>
              </Table>
              {
                  isActiveView === 1 && !spinner && clientFeeds && clientFeeds.length == 0 &&
                  <div className="text-center mt-5">
                      <h2>No Clients Found</h2>
                  </div>
              }
            </div>
          </Container>
        </div>
      </div>
      {selectedClient &&
      <div className="details--wrapper common--project--grid">
        <div className="wrapper--title py-2 bg-white border-bottom">
          <span className="open--sidebar me-2 d-flex d-xl-none" onClick={() => {handleSidebarSmall(false);setIsActive(0);}}><FiSidebar /></span>
          <div className="projecttitle">
            <Dropdown>
              <Dropdown.Toggle variant="link" id="dropdown-basic">
                  <div className="title--initial">{selectedClient?.name?.charAt(0)}</div>
                  <div className="title--span flex-column align-items-start gap-0">
                      <h3>
                        <strong>{selectedClient?.name}</strong>
                    </h3>
                  </div>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                  <div className="drop--scroll">
                    {
                      clientFeeds.map((client, index) => {
                        return (
                          <Dropdown.Item onClick={() => {handleClick(client)}} key={`client-item-${index}`} className={(selectedClient?._id === client?._id) ? 'active-project': ''}>
                            <div className="title--initial">{client?.name.charAt(0)}</div>
                            <div className="title--span flex-column align-items-start gap-0">
                                <strong>{client?.name}</strong>
                            </div>
                          </Dropdown.Item>
                        )
                      })
                    }
                  </div>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <ListGroup horizontal className="ms-auto">
            <ListGroup.Item onClick={handleToggles} className="d-none d-lg-flex"><GrExpand /></ListGroup.Item>
            <ListGroup.Item className="btn btn-primary" onClick={() => {handleClosePannel(0);}}><MdOutlineClose /></ListGroup.Item>
          </ListGroup>
        </div>
        <div className="rounded--box client--box">
          <Card className="contact--card">
            <div className="card--img">
              <Form.Control type="file" id="upload--img" hidden onChange={(e) => handleFieldChange('avatar', e)} accept=".jpg, .jpeg, .png, .gif" />
              {(memberProfile?.permissions?.clients?.create_edit_delete === true || memberProfile?.role?.slug === "owner") ? (
                <>
                <Form.Label htmlFor="upload--img">
                  {
                    avatarPreview ? 
                      <Card.Img variant="top" src={avatarPreview} />
                    :
                    fields?.remove_avatar === false && selectedClient?.avatar ?
                    <Card.Img variant="top" src={selectedClient?.avatar ?? "./images/default.jpg"} />
                    :
                      <Card.Img variant="top" src={"./images/default.jpg"} />
                  }
                  
                  {!selectedClient?.avatar &&
                    <span>Add Photo</span>
                  }
                  {selectedClient?.avatar &&
                    <span>Edit Photo</span>
                  }

                </Form.Label>
                {selectedClient?.avatar && fields?.remove_avatar === false &&
                  <span className="remove--photo" onClick={removeAvatar}><FaTrashAlt /></span>
                }
                </>
                )
                :
                <Form.Label htmlFor="upload--img">
                  {
                    avatarPreview ? 
                      <Card.Img variant="top" src={avatarPreview} />
                    :
                    isEditing.remove_avatar === false && editedClient?.avatar ?
                    <Card.Img variant="top" src={editedClient?.avatar ?? "./images/default.jpg"} />
                    :
                      <Card.Img variant="top" src={"./images/default.jpg"} />
                  }
                
                </Form.Label>
              }
            </div>
            <Card.Body>
              <Card.Title>
                <FiMail /> Client Information
                {(memberProfile?.permissions?.clients?.create_edit_delete === true || memberProfile?.role?.slug === "owner") &&
                        <FiEdit onClick={() => setIsEditing(true)} />
                      }
              </Card.Title>
              <Card.Text>
                <ListGroup>
                  {
                    (isEditing === false) ? 
                    <>
                      <ListGroup.Item>
                        <span className="info--icon"><FiMail /></span>
                        <p><small>Client Name</small>{selectedClient?.name}</p>
                        </ListGroup.Item>
                          {customFields?.length > 0 && (
                          <>
                            {customFields.map((field, index) => (
                              <ListGroup.Item key={index}>
                                <p><small>{field.label}</small>{selectedClient?.customFields[field.name]?.meta_value || ''}</p>
                              </ListGroup.Item>
                            ))}
                          </>
                        )}
                        </>
                        :
                        <>
                        <ListGroup.Item>
                          <Form.Group className="mb-3">
                            <Form.Label>Cliet Name</Form.Label>
                            <Form.Control type="text" placeholder={'Name'} name={`name`}  value={fields?.name} onChange={handleChange} />
                           </Form.Group>
                          </ListGroup.Item>
                            {customFields?.length > 0 && (
                            <>
                              {customFields.map((field, index) => (
                                <ListGroup.Item key={index}>
                                  {renderDynamicField({
                                    name: `custom_field[${field.name}]`,
                                    type: field.type,
                                    label: field.label,
                                    value: fields[`custom_field[${field.name}]`] || '',
                                    options: field?.options || [],
                                    onChange: (e) => handleChange(e, field.name),
                                    range_options: field?.range_options || {}
                                  })}
                                </ListGroup.Item>
                              ))}
                            </>
                          )}
                          </>
                  }
                  

                  
                    {/* <span className="info--icon"><FiPhone /></span>
                    <p><small>Phone</small>+1 (555) 123-4567</p>
                  </ListGroup.Item> */}
                </ListGroup>
              </Card.Text>
              <div className="text-end mt-3">
                {(memberProfile?.permissions?.clients?.create_edit_delete === true || memberProfile?.role?.slug === "owner") && (
                <>
                  <Button variant="secondary" className="me-3" onClick={() => setShowDialog(true)}>Delete</Button>
                  <Button variant="primary" onClick={handleUpdateSubmit} disabled={loader}> {loader ? 'Please wait...' : 'Save Changes'}</Button>
                  </>
                  
                )}
              </div>
            </Card.Body>
          </Card>
        </div>

        <AlertDialog
          showdialog={showdialog}
          toggledialog={setShowDialog}
          msg="Are you sure you want to delete the client?"
          callback={handledeleteClient}
        />
      </div>
      }
      {show && <AddClient show={show} toggleshow={setShow} customFields={customFields} /> }
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
                  <Form.Control type="text" placeholder="Search Client.." onChange={(e) => setSearch(e.target.value)} />
                </Form.Group>
              </Form>
            </ListGroup.Item>
          </ListGroup>
        </Modal.Body>
      </Modal>
      { showCustomFields && <CustomFieldModal toggle={setShowCustomFields} module='clients' />}
    </>
  );
}

export default ClientsPage;