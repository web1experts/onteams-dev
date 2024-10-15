import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Modal, Form, FloatingLabel, Card, ListGroup, Table } from "react-bootstrap";
import { FaList, FaPlus, FaTrashAlt } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { BsGrid } from "react-icons/bs";
import { MdOutlineClose, MdSearch } from "react-icons/md";
import { ListClients, createClient, deleteClient, updateClient } from "../../redux/actions/client.action";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getFieldRules, validateField } from '../../helpers/rules';
import { jwtDecode } from "jwt-decode"
import { useToast } from "../../context/ToastContext";
import AddClient from "./AddClient";
import { AlertDialog } from "../modals";
import Spinner from 'react-bootstrap/Spinner';

function EditableField({ field, label, value, onChange, isEditing, onEditClick, error }) {
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
    <ListGroup.Item>

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
    </ListGroup.Item>
  );

}


function ClientsPage() {
  const [spinner, setSpinner] = useState(false)
  const inputs = document.querySelectorAll('.form-floating .form-control');

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
  const [errors, setErrors] = useState([]);
  const [fieldserrors, setFieldErrors] = useState({ name: '' });
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
  const [fields, setFields] = useState({ name: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);


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

  const handleFieldChange = (field, value) => {
   
    // if (field in editedClient) {
    if (field === "avatar") {
      setEditedClient((prevState) => ({
        ...prevState,
        [field]: value.target.files[0],
        ['remove_avatar']: true
      }));
      setAvatarPreview(URL.createObjectURL(value.target.files[0]));
    } else {
      setEditedClient((prevState) => ({
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


  const deleteSuccess = useSelector(state => state.client.deletedClient);

  useEffect(() => {
    if (selectedClient) { // Check if data is available
      setIsEditing({
        name: false,
        avatar: false,
        remove_avatar: false
      });
      setEditedClient({ ...selectedClient });
    }
  }, [selectedClient]);

  useEffect(() => {
    if( deleteSuccess ){
      setIsActive( false )
      setSelectedClient({})
    }
  }, [deleteSuccess])

  const [isEditing, setIsEditing] = useState({
    name: false,
    avatar: false
  });

  const handleListClients = async () => {
    setClientFeed([])
    await dispatch(ListClients(currentPage, search))
    setSpinner(false)
    // await dispatch(ListClients(currentPage, search));
    // setShowloader(false)
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


  }, [])

  useEffect(() => {

    if (apiResult.success) {
      handleClose();
      setShowDialog(false)
      //setTimeout(function () {
      // handleListClients();
      // }, 1000)
    }

    if (apiResult.success || apiResult.error) {
      setLoader(false)
      
    }
  }, [apiResult])

  const handleChange = (index, event, fieldname = '') => {
    const { name, value, type, files } = event.target;
    const updatedRows = [...rows];


    updatedRows[index] = { ...updatedRows[index], [name]: value };
    setRows(updatedRows);
    const updatedErrors = [...errors];
    // Check if there is an error message for the specified field at the given index
    if (updatedErrors[index] && updatedErrors[index][name]) {
      // If an error message exists, update it to an empty string to remove the error
      updatedErrors[index][name] = '';
    }
    // Update the errors state with the updated array
    setErrors(updatedErrors);

  };

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

    const changes = compareClient(selectedClient, editedClient);
    
    if (Object.keys(changes).length > 0) {
      setLoader(true)


      const updatedErrorsPromises = Object.entries(changes).map(async ([fieldName, value]) => {
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


        if (Object.keys(changes).length > 0) {

          const formData = new FormData();
          for (const [key, value] of Object.entries(changes)) {
            formData.append(key, value);
          }
          if (isEditing.remove_avatar === true) {
            formData.append('remove_avatar', true);
          }
          await dispatch(updateClient(selectedClient?._id, formData))

        }
        setIsEditing({
          name: false,
          avatar: false,
          remove_avatar: false
        });
        setLoader(false)
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
    setIsEditing({ ...isEditing, ['remove_avatar']: true })
    setEditedClient({ ...editedClient, ['avatar']: false })
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


  return (
    <>

      <div className={isActive ? 'show--details team--page' : 'team--page'}>
        <div className='page--title px-md-2 pt-3'>
          <Container fluid>
            <Row>
              <Col sm={12}>
                <h2>Clients
                  <Button variant="primary" className={isActive ? 'd-flex ms-md-auto' : 'd-lg-none ms-auto'} onClick={handleSearchShow}><MdSearch /></Button>
                  <Button variant="primary" onClick={handleShow}><FaPlus /></Button>
                  <ListGroup horizontal className={isActive ? 'd-none' : 'onlyIconsView ms-auto d-none d-lg-flex'}>
                    <ListGroup.Item className='d-none d-lg-block'>
                      <Form>
                        <Form.Group className="mb-0 form-group">
                          <Form.Control type="text" placeholder="Search Client.." onChange={(e) => setSearch(e.target.value)} />
                        </Form.Group>
                      </Form>
                    </ListGroup.Item>
                    <ListGroup.Item action className="view--icon d-none d-lg-flex" active={isActiveView === 1} onClick={() => setIsActiveView(1)}><BsGrid /></ListGroup.Item>
                    <ListGroup.Item action className="d-none d-lg-flex view--icon" active={isActiveView === 2} onClick={() => setIsActiveView(2)}><FaList /></ListGroup.Item>
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
                  <img src="images/OnTeam-icon-gray.png" className="flipchar" />
              </div>
          }
          <Container fluid>
            <Table responsive="xl" className={isActiveView === 1 ? 'project--grid--table clients--grid--table' : isActiveView === 2 ? 'project--table clients--table' : 'project--table clients--table'}>
              <thead>
                <tr key={'client-table-header'}>
                  {/* <th width={20}>#</th> */}
                  <th><abbr>#</abbr> Member Name</th>
                  <th className="onHide" width={50}>Action</th>
                </tr>
              </thead>
              <tbody>
                {
                  (!spinner && clientFeeds && clientFeeds.length > 0)
                    ? clientFeeds.map((client, index) => {
                      return (<>
                        <tr key={`client-row-${index}`} className={client._id === selectedClient?._id ? 'project--active' : ''} onClick={isActive ? () => handleClick(client) : () => { return false; }}>
                          {/* <td>{index + 1}</td> */}
                          <td className="cursor--pointer"><abbr>{index + 1}</abbr><span className="onHide"><img variant="top" src={client.avatar || "./images/default.jpg"} /></span>{client.name}</td>
                          <td className="onHide"><Button variant="primary" onClick={() => handleClick(client)}>View</Button></td>
                        </tr>
                      </>)
                    })
                    :
                     
                    !spinner && isActiveView === 2 &&
                      <tr>
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
          </Container>
        </div>
      </div>
      <div className="details--wrapper">
        <div className="wrapper--title">
          <div className="projecttitle">
            <h3><strong>Client Details</strong></h3>
          </div>
          <ListGroup horizontal>
            <ListGroup.Item onClick={() => handleClosePannel()}>
              <MdOutlineClose />
            </ListGroup.Item>
          </ListGroup>
        </div>
        <div className="rounded--box client--box">
          <Card>
            <div className="card--img">
              <Form.Control type="file" id="upload--img" hidden onChange={(e) => handleFieldChange('avatar', e)} accept=".jpg, .jpeg, .png, .gif" />
              <Form.Label for="upload--img">
                {
                  avatarPreview ? 
                    <Card.Img variant="top" src={avatarPreview} />
                  :
                  isEditing.remove_avatar === false && editedClient?.avatar ?
                  <Card.Img variant="top" src={editedClient?.avatar ?? "./images/default.jpg"} />
                  :
                    <Card.Img variant="top" src={"./images/default.jpg"} />
                }

                {!editedClient?.avatar &&
                  <span>Add Photo</span>
                }
                {editedClient?.avatar &&
                  <span>Edit Photo</span>
                }

              </Form.Label>
              {editedClient?.avatar && isEditing.remove_avatar === false &&
                <span className="remove--photo" onClick={removeAvatar}><FaTrashAlt /></span>
              }
            </div>
            <Card.Body>
              <Card.Title>Client Information</Card.Title>
              <Card.Text>
                <ListGroup>
                  <EditableField
                    field="name"
                    label="Client Name"
                    value={editedClient?.name}
                    onChange={(value) => handleFieldChange('name', value)}
                    isEditing={isEditing.name}
                    onEditClick={() => handleEditClick('name')}
                    error={fieldserrors['name'] && fieldserrors['name']}
                  />
                  {
                    fieldserrors['name'] &&
                    <span className="error">{fieldserrors.name}</span>
                  }
                </ListGroup>
              </Card.Text>
              <div className="text-end mt-3">
                <Button variant="danger" className="me-3" onClick={() => setShowDialog(true)}>Delete</Button>
                <Button variant="primary" onClick={handleUpdateSubmit} disabled={loader}> {loader ? 'Please wait...' : 'Save Changes'}</Button>
              </div>
            </Card.Body>
          </Card>
        </div>
        <AddClient show={show} toggleshow={setShow} />
        <AlertDialog
          showdialog={showdialog}
          toggledialog={setShowDialog}
          msg="Are you sure you want to delete the client?"
          callback={handledeleteClient}
        />
      </div>
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
    </>
  );
}

export default ClientsPage;