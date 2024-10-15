import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Row, Col, Button, Modal, Form, FloatingLabel, ListGroup, Table, Dropdown } from "react-bootstrap";
import { FaBold, FaChevronDown, FaItalic, FaPlus, FaList, FaRegTrashAlt, FaPlusCircle, FaTimes, FaCog, FaEllipsisV, FaTrashAlt } from "react-icons/fa";
import { MdFileDownload, MdFilterList, MdOutlineClose, MdSearch } from "react-icons/md";
import { FiFileText } from "react-icons/fi";
import { GrAttachment } from "react-icons/gr";
import { BsGrid } from "react-icons/bs";
import { ListProjects, createProject, updateProject, deleteProject } from "../../redux/actions/project.action"
import { Listmembers } from "../../redux/actions/members.action";
import { formatStatus } from "../../utils/common";
import { StatusModal, MemberModal, WorkFlowModal, FilesModal, FilesPreviewModal } from "../modals";
import { ListClients } from "../../redux/actions/client.action";
import AddClient from "../Clients/AddClient";
import { getFieldRules, validateField } from "../../helpers/rules";
import { AlertDialog } from "../modals";
import fileIcon from './../../images/file-icon-image.jpg'
import { selectboxObserver, getMemberdata, parseDateWithoutTimezone } from "../../helpers/commonfunctions";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import SingleProject from "./singleProject";
import { TaskForm } from "../Tasks/taskform";
import TasksList from "../Tasks/list";
import { togglePopups, updateStateData } from "../../redux/actions/common.action";
import { MemberInitials } from "../common/memberInitials";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DatePicker from "react-multi-date-picker";
import { ALL_MEMBERS, ACTIVE_FORM_TYPE, PROJECT_FORM, RESET_FORMS, CURRENT_PROJECT, ALL_CLIENTS, ASSIGN_MEMBER, DIRECT_UPDATE } from "../../redux/actions/types";
function ProjectsPage() {
    const [isActiveView, setIsActiveView] = useState(2);
    const dispatch = useDispatch();
    const memberdata = getMemberdata()
    const [projects, setProjects] = useState([]);
    const [filters, setFilters] = useState({})
    const [fields, setFields] = useState({ title: '', status: 'in-progress', members: [] });
    const [errors, setErrors] = useState({ title: '' });
    const [loader, setLoader] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [selectedMembers, setselectedMembers] = useState([]);
    const projectFeed = useSelector(state => state.project.projects);
    const apiResult = useSelector(state => state.project);
    const clientFeed = useSelector(state => state.client.clients);
    const apiClient = useSelector(state => state.client)
    const memberFeed = useSelector((state) => state.member.members);
    const commonState = useSelector(state => state.common)
    const projectform = useSelector( state => state.common.projectForm)
    const [clientlist, setClientList] = useState([])
    const [members, setMembers] = useState([])
    const [currentPage, setCurrentPage] = useState(0);
    const [isEdit, setIsEdit] = useState(false)
    const [total, setTotal] = useState(0)
    const [isActive, setIsActive] = useState(0);
    const [currentProject, setCurrentProject] = useState({})
    const [showdialog, setShowDialog] = useState(false);
    const [allMembers, setAllmembers] = useState([{ value: 'all', label: 'All Members' }])
    const [spinner, setSpinner] = useState(false)
    let fieldErrors = {};
    let active = 2;
    const workflowstate = useSelector(state => state.workflow)
    const modules = {
        toolbar: [
          [{ 'header': '1'}, {'header': '2'}],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{'list': 'ordered'}, {'list': 'bullet'}, 
           {'indent': '-1'}, {'indent': '+1'}],
           ['link'],
        ],
        clipboard: {
          // toggle to add extra line breaks when pasting HTML:
          matchVisual: false,
        }
      };

      const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link'
      ];
      
    useEffect(() => {
        selectboxObserver()
        dispatch(updateStateData(PROJECT_FORM, { title: '', status: 'in-progress', members: [] }))
    }, [dispatch]);
    useEffect(() => {
        if (clientFeed && clientFeed.clientData && clientFeed.clientData.length > 0) {
            setClientList(clientFeed.clientData)
            dispatch(updateStateData(ALL_CLIENTS, clientFeed.clientData))
        }
    }, [clientFeed, dispatch])

    useEffect(() => {
        if (apiClient.createClient) {
            setFields({ ...fields, client: apiClient.createClient })
            handleChange({ target: { name: 'client', value: apiClient.createClient } });
            setTimeout(function () {
                selectboxObserver()
            }, 200)
        }
    }, [apiClient]);

    useEffect(() => {
        if (commonState.selectedMembers) {
            setselectedMembers(commonState.selectedMembers)
        }
    }, [commonState.selectedMembers])

    useEffect(() => { 
        if (commonState.projectForm) {
            setFields(prevFields => {
                const updatedFields = {
                    ...prevFields, // Retain the existing properties of fields
                    ...commonState.projectForm // Merge properties from commonState.projectForm
                };
            
                // Log updated fields for debugging
                // console.log("Updated Fields:", updatedFields);
            
                return updatedFields; // Return the new state
            });
            
        }
    }, [projectform]);
    


    // Function to remove the last member
    // const removeMember = (member) => {
    //     delete fields['members'][member]
    //     dispatch(updateStateData(PROJECT_FORM, { members: fields['members'] || {} }))
    // };

    const [isdescEditor, setIsDescEditor] = useState(false);
    const [isTaskEditor, setIsTaskEditor] = useState(false);
    const handleTaskEditor = event => {
        setIsTaskEditor(current => !current);
    };

    const [activeTab, setActiveTab] = useState('GridView');
    const [activeSubTab, setActiveSubTab] = useState('Grid');

    const [show, setShow] = useState(false);
    const handleClose = () => {
        setFields({ title: '', status: 'in-progress', members: [] })
        if( isActive === 2 || isActive === 1){
            dispatch(updateStateData(ACTIVE_FORM_TYPE, 'edit_project'))
        }else{
            dispatch(updateStateData(ACTIVE_FORM_TYPE, null))
        }
        
        dispatch(updateStateData(RESET_FORMS))
        setSelectedFiles([])
        setselectedMembers([])
        setImagePreviews([])
        setShow(false);
    }
    const handleShow = async (type) => {
       
        await dispatch(updateStateData(ACTIVE_FORM_TYPE, 'project'))
        await dispatch(updateStateData(RESET_FORMS, 'project'))
        setFields({ title: '', status: 'in-progress', members: [] })
        await dispatch(updateStateData(PROJECT_FORM, { title: '', status: 'in-progress', members: [] }))
        if (type === "new") {
            if( isActive !== 2 && isActive !== 1){
                setCurrentProject({})
            }
            
            setselectedMembers({})
            setImagePreviews([])

        }
        setShow(true);
    }

    const handleStatusClose = () => dispatch(togglePopups('status', false));
    const handleStatusShow = () => dispatch(togglePopups('status', true));
    const selectedStatus = useSelector(state => state.common.selectedStatus)

    const [showClient, setClientShow] = useState(false);
    const handleClientClose = () => setClientShow(false);
    const handleClientShow = () => setClientShow(true);
    const [showWorkflow, setWorkflowShow] = useState(false);
    const handleWorkflowClose = () => dispatch(togglePopups('workflow', false));
    const handleWorkflowShow = () => dispatch(togglePopups('workflow', true));
    const [showSetting, setSettingShow] = useState(false);
    const handleSettingClose = () => setSettingShow(false);
    const handleSettingShow = () => setSettingShow(true);
    const [showEdit, setEditShow] = useState(false);
    const handleEditClose = () => setEditShow(false);
    const handleEditShow = () => setEditShow(true);
    const [showAdd, setAddShow] = useState(false);
    const handleAddClose = () => setAddShow(false);
    const handleAddShow = () => setAddShow(true);
    const [showAssign, setAssignShow] = useState(false);
    const handleAssignClose = () => setAssignShow(false);
    const handleAssignShow = () => setAssignShow(true);
    const [showUpload, setUploadShow] = useState(false);
    const handleUploadClose = () => {
        setUploadShow(false);
    }
    const handleUploadShow = () => dispatch(togglePopups('files', true)) //setUploadShow(true);
    const [showDelete, setDeleteShow] = useState(false);
    const handleDeleteClose = () => setDeleteShow(false);
    const [showFilter, setFilterShow] = useState(false);
    const handleFilterClose = () => setFilterShow(false);
    const handleFilterShow = () => setFilterShow(true);

    const [showSearch, setSearchShow] = useState(false);
    const handleSearchClose = () => setSearchShow(false);
    const handleSearchShow = () => setSearchShow(true);
    const [filetoPreview, setFiletoPreview] = useState(null);
    const [showPreview, setPreviewShow] = useState(false);
    const handlePreviewClose = () => setPreviewShow(false);
    const handlePreviewShow = (file) => {
        setFiletoPreview(file)
        setPreviewShow(true)
    };

    useEffect(() => {
        if (currentProject && Object.keys(currentProject).length > 0 && isActive !== 2) {
            handleStatusClose()
            dispatch(updateProject(currentProject._id, { status: selectedStatus }))
        } else {
            setFields({ ...fields, ['status']: selectedStatus });
            handleStatusClose()
        }
    }, [selectedStatus, dispatch]);

    const handleListProjects = async () => {
        let selectedfilters = { currentPage: currentPage }
        if (Object.keys(filters).length > 0) {
            selectedfilters = { ...selectedfilters, ...filters }
        }
        await dispatch(ListProjects(selectedfilters));
        setSpinner(false)
    }

    useEffect(() => {
        dispatch(Listmembers(0, '', false));
        dispatch(ListClients());
    }, [])



    useEffect(() => { 
        if (commonState.projectForm.images?.length > 0) {
            const selectedFiles = commonState.projectForm.images
            const previews = [];
            for (let i = 0; i < selectedFiles.length; i++) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const fileExtension = selectedFiles[i].name.split('.').pop().toLowerCase();
                    previews.push({
                        src: e.target.result,
                        file: selectedFiles[i],
                        mimetype: fileExtension,
                        filename: selectedFiles[i].name,
                        _id: i
                    });
                    if (previews.length === selectedFiles.length) {
                        setImagePreviews(previews);
                    }
                };
                reader.readAsDataURL(selectedFiles[i]);
            }
        } else {
            const { images, ...updatedFields } = fields;
            setFields(updatedFields);
        }
    }, [projectform.images])

    const handleRemove = (indexToRemove) => {
        // Filter out the file to remove from both selectedFiles and imagePreviews
        const selectedFiles = commonState.projectForm.images
        const updatedSelectedFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
        const updatedImagePreviews = imagePreviews.filter((_, index) => index !== indexToRemove);
        // setSelectedFiles(updatedSelectedFiles);
        dispatch(updateStateData(PROJECT_FORM, { images: updatedSelectedFiles }))
        setImagePreviews(updatedImagePreviews);
    };

    useEffect(() => {
        setProjects([])
        handleListProjects()
        setSpinner(true)

    }, [])

    useEffect(() => {
        if (currentPage > 0) {
            setProjects([])
            handleListProjects()
            setSpinner(true)
        }
    }, [currentPage])

    useEffect(() => {
        if (Object.keys(filters).length > 0 && !showFilter) {
            handleListProjects()
        }
    }, [filters])

    const dofilters = () => {
        handleListProjects()
        handleFilterClose()
        selectboxObserver()
    }

    const handleChange = ({ target: { name, value, type, files } }) => {
        setFields({...fields, [name]: value})
        dispatch(updateStateData(PROJECT_FORM, { [name]: value }))
        setErrors({ ...errors, [name]: '' })
    };

    const handlefilterchange = (name, value) => {
        if (name === "search" && value === "" || name === "search" && value.length > 1 || name !== "search") {
            setFilters({ ...filters, [name]: value })
        }
    }

    useEffect(() => {
        if (memberFeed && memberFeed.memberData) {
            dispatch(updateStateData(ALL_MEMBERS, memberFeed.memberData))
            setMembers(memberFeed.memberData);
            const memberarray = [{ value: 'all', label: 'All Members' }]
            memberFeed.memberData.forEach(member => {
                memberarray.push({ value: member._id, label: member.name })
            });
            setAllmembers(memberarray)
        }
    }, [memberFeed, dispatch]);

    useEffect(() => {
        const check = ['undefined', undefined, 'null', null, '']
        if (projectFeed && projectFeed.projectData) {
            setProjects(projectFeed.projectData)
            setTotal(projectFeed.total)
            // if (currentProject && Object.keys(currentProject).length > 0) {
            //     let hasopened = false;
            //     projectFeed.projectData.forEach((p, inx) => {
            //         if (p._id === currentProject._id) {
            //             setCurrentProject(p);
            //             dispatch(updateStateData(ACTIVE_FORM_TYPE, 'edit_project'))
            //             hasopened = true;
            //             return;
            //         }
            //     })
            //     if (hasopened === false) {
            //         setIsActive(0)
            //     }
            // }
        }
    }, [projectFeed])

    // const handleRemoveMember = async (project, memberId, targetelement = null) => {
    //     document.getElementById(targetelement).classList.add('disabled-pointer');
    //     const currentMembers = project.members;
    //     const updatedMembers = currentMembers
    //         .filter(member => member._id !== memberId)
    //         .map(member => member._id);
    //     await dispatch(updateProject(project._id, { members: updatedMembers, remove_member: true }))
    //     document.getElementById(targetelement).classList.remove('disabled-pointer');
    // }


    // const handleRemoveMember = async (project, memberId, targetelement = null) => {
    //     try {
    //         const targetElement = document.getElementById(targetelement);
    
    //         if (targetElement) {
    //             // Disable the button or make it non-interactive
    //             targetElement.classList.add('disabled-pointer');
    //         }
    
    //         const currentMembers = project.members;
    //         const updatedMembers = currentMembers
    //             .filter(member => member._id !== memberId)
    //             .map(member => member._id);
    
    //         // Dispatch the async action to update the project members
    //         await dispatch(updateProject(project._id, { members: updatedMembers, remove_member: true }));
    
    //         if (targetElement) {
    //             // Re-enable the button or make it interactive again
    //             targetElement.classList.remove('disabled-pointer');
    //         }
    
    //     } catch (error) {
    //         console.error("Error removing member:", error);
    
    //         // Ensure target element is re-enabled even if there's an error
    //         const targetElement = document.getElementById(targetelement);
    //         if (targetElement) {
    //             targetElement.classList.remove('disabled-pointer');
    //         }
    //     }
    // };

    const showError = (name) => {
        if (errors[name]) return (<span className="error">{errors[name]}</span>)
        return null
    }

    const handleSubmit = async (e) => { 
        e.preventDefault();
        setLoader(true)
        const updatedErrorsPromises = Object.entries(fields).map(async ([fieldName, value]) => {
            // Get rules for the current field
            const rules = getFieldRules('project', fieldName);
            // Validate the field
            const error = await validateField('project', fieldName, value, rules);
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
            const formData = new FormData();
            for (const [key, value] of Object.entries(fields)) {
                if (typeof value === 'object' && key === 'images') {
                    value.forEach(attach => {
                       
                        formData.append('images[]', attach);
                    });
                } else if (typeof value === 'object' && key === 'members') {
                    const memberids = Object.keys(fields['members'])
                    memberids.forEach(item => {
                        formData.append(`members[]`, item); // Append with the same key for non-empty arrays
                    });
                } else if (Array.isArray(value)) { // Check if the value is an array
                    if (value.length === 0) {
                        formData.append(`${key}[]`, []); // Append an empty array
                    } else {
                        value.forEach(item => {
                            formData.append(`${key}[]`, item); // Append with the same key for non-empty arrays
                        });
                    }
                } else if (typeof value === 'object') {
                    formData.append(key, JSON.stringify(value))
                } else {
                    formData.append(key, value)
                }
            }
            let payload = formData;

            if (currentProject && currentProject._id) {
                await dispatch(updateProject(currentProject._id, payload))
                setLoader(false)
            } else {
                await dispatch(createProject(payload))
                setLoader(false)
            }
        }
    }

    const handledeleteProject = () => {
        dispatch(deleteProject(currentProject._id))
    }

    const viewTasks = () => {
        if (isActive) {
            return true;
        }
    }

    useEffect(() => {
        // Example: Set currentProject initially if not already set
        if (currentProject && projects.length > 0 && Object.keys(currentProject).length > 0) {
            let found = false;
            let hasopened = false;
            projects.forEach((p, inx) => {
                if (p._id === currentProject._id) {
                    found = true;
                    hasopened = true;
                    setCurrentProject(p);
                    dispatch(updateStateData(ACTIVE_FORM_TYPE, 'edit_project'))
                    return;
                }
            })
            if (hasopened === false) {
                setIsActive(0)
            }
            if( found === false ){
                setCurrentProject({})
            }
        }
    }, [projects]);

    const handleattachfiles = (e) => {
        handleUploadClose()
    }

    useEffect(() => {
        if (apiResult.deletedProject) {
            setIsActive(0)
            setCurrentPage({})
        }

        if (apiResult.success) {
            setIsDescEditor( false )
            // dispatch(updateStateData(DIRECT_UPDATE, false));
            // dispatch(updateStateData(RESET_FORMS))
            setFields({ title: '', status: 'in-progress', members: [] })
            handleClose()
            setSelectedFiles([]);
            setImagePreviews([]);
            setShowDialog(false)
            handleListProjects()
        }

    }, [apiResult])

    const handleRemovefiles = (id) => {
        let previousfiles = fields['files']
        const updatedFiles = previousfiles.filter(file => file !== id);
        setFields({ ...fields, ['files']: updatedFiles })
    }

    const renderPreview = (type, preview, index) => {
       
        const { src, _id } = preview;
        const mimetype = (preview.mimetype) ? preview.mimetype : src.split('.').pop().toLowerCase();
        const previewComponents = {
            image: (
                <div className="preview--cell">
                    <p onClick={() => handlePreviewShow({ src, _id, mimetype, filename: preview?.filename || `Preview file-${index}` })}>{preview?.filename || `Preview file-${index}`}</p>
                    {
                        type !== "new" &&
                        <Button variant="secondary" className="ms-auto"><a target="_blank" className="btn-secondary" download={preview?.filename} href={src}><MdFileDownload /></a></Button>
                    }
                    <Button variant="primary" onClick={() => type === "new" ? handleRemove(index) : handleRemovefiles(_id)}><FaRegTrashAlt /></Button>
                </div>
            ),
            video: (
                <div className="preview--cell">
                    <p onClick={() => handlePreviewShow({ src, _id, mimetype, filename: preview?.filename || `Preview file-${index}` })}>{preview?.filename || `Preview file-${index}`}</p>
                    {
                        type !== "new" &&
                        <Button variant="secondary" className="ms-auto"><a target="_blank" className="btn-secondary" download={preview?.filename} href={src}><MdFileDownload /></a></Button>
                    }
                    <Button variant="primary" onClick={() => type === "new" ? handleRemove(index) : handleRemovefiles(_id)}><FaRegTrashAlt /></Button>
                </div>
            ),
            pdf: (
                <div className="preview--cell">
                    <p onClick={() => handlePreviewShow({ src, _id, mimetype, filename: preview?.filename || `Preview file-${index}` })}>{preview?.filename || `Preview file-${index}`}</p>
                    {
                        type !== "new" &&
                        <Button variant="secondary" className="ms-auto"><a target="_blank" className="btn-secondary" download={preview?.filename} href={src}><MdFileDownload /></a></Button>
                    }
                    <Button variant="primary" onClick={() => type === "new" ? handleRemove(index) : handleRemovefiles(_id)}><FaRegTrashAlt /></Button>
                </div>
            ),
            other: (
                <div className="preview--cell">
                    <p onClick={() => handlePreviewShow({ src, _id, mimetype, filename: preview?.filename || `Preview file-${index}` })}>{preview?.filename || `Preview file-${index}`}</p>
                    {
                        type !== "new" &&
                        <Button variant="secondary" className="ms-auto"><a target="_blank" className="btn-secondary" download={preview?.filename} href={src}><MdFileDownload /></a></Button>
                    }
                    <Button variant="primary" onClick={() => type === "new" ? handleRemove(index) : handleRemovefiles(_id)}><FaRegTrashAlt /></Button>
                </div>
            ),
        };

        if (["jpg", "jpeg", "png", "webp"].includes(mimetype)) {
            return previewComponents.image;
        } else if (mimetype === "mp4") {
            return previewComponents.video;
        } else if (mimetype === "pdf") {
            return previewComponents.pdf;
        } else {
            return previewComponents.other;
        }

        return null;
    };

    useEffect(() => {
        if (currentProject && Object.keys(currentProject).length > 0) {

            dispatch(updateStateData(CURRENT_PROJECT, currentProject))
        }
    }, [currentProject]);


    // const MemberInitials = ({ id, children, title }) => {
    //     return (
    //         <OverlayTrigger placement="bottom" overlay={<Tooltip id={id}>{title}</Tooltip>}>
    //             {children}
    //         </OverlayTrigger>
    //     )
    // };

    const handleProjectChange = (project) => {
        dispatch(updateStateData(ACTIVE_FORM_TYPE, 'edit_project'))
        setCurrentProject(project)
    }


    return (
        <>
            <div className={isActive === 1 ? 'show--details team--page' : isActive === 2 ? ' view--project team--page' : 'team--page'}>
                <div className='page--title px-md-2 pt-3'>
                    <Container fluid>
                        <Row>
                            <Col sm={12} lg={12}>
                                <h2>Projects
                                    <Button variant="primary" className={isActive !== 0 ? 'd-flex ms-auto' : 'd-lg-none ms-auto'} onClick={handleSearchShow}><MdSearch /></Button>
                                    <Button variant="primary" className={isActive !== 0 ? 'd-flex' : 'd-lg-none'} onClick={handleFilterShow}><MdFilterList /></Button>
                                    <Button variant="primary" onClick={() => handleShow('new')}><FaPlus /></Button>
                                    <ListGroup horizontal className={isActive !== 0 ? 'd-none' : 'ms-auto d-none d-lg-flex'}>
                                        {/* <ListGroup.Item key="showfor-filter-list">
                                            <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('show_for', event.target.value)} value={filters['show_for'] || 'all'}>
                                                <option value="all">All Projects</option>
                                                <option value="my">My Projects</option>
                                            </Form.Select>
                                        </ListGroup.Item> */}
                                        <ListGroup.Item key="member-filter-list">
                                            <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('member', event.target.value)} value={filters['member'] || 'all'}>
                                                <option value="my">My Projects</option>
                                                {
                                                    allMembers.map((member, index) => {
                                                        return <option key={`member-projects-${index}`} value={member.value}>{member.label}</option>
                                                    })
                                                }
                                                
                                                <option value="unassigned">Unassigned</option>
                                            </Form.Select>
                                        </ListGroup.Item>
                                        <ListGroup.Item key="status-filter-list">
                                            <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('status', event.target.value)} value={filters['status'] || 'all'}>
                                                <option value="all">View All</option>
                                                <option value="in-progress">In Progress</option>
                                                <option value="on-hold">On Hold</option>
                                                <option value="completed">Completed</option>
                                            </Form.Select>
                                        </ListGroup.Item>
                                        <ListGroup.Item key="search-filter-list">
                                            <Form>
                                                <Form.Group className="mb-0 form-group">
                                                    <Form.Control type="text" placeholder="Search by Project or Client" onChange={(event) => handlefilterchange('search', event.target.value)} />
                                                </Form.Group>
                                            </Form>
                                        </ListGroup.Item>
                                        <ListGroup.Item action className="d-none d-lg-flex view--icon" active={isActiveView === 1} onClick={() => setIsActiveView(1)}><BsGrid /></ListGroup.Item>
                                        <ListGroup.Item action className="d-none d-lg-flex view--icon" active={isActiveView === 2} onClick={() => setIsActiveView(2)}><FaList /></ListGroup.Item>
                                    </ListGroup>
                                </h2>
                                <ListGroup horizontal className={isActive ? 'd-none' : 'd-none d-lg-none mt-3 mt-xl-0'}>
                                    <ListGroup.Item action className="view--icon" active={isActiveView === 1} onClick={() => setIsActiveView(1)}><BsGrid /></ListGroup.Item>
                                    <ListGroup.Item action className="view--icon" active={isActiveView === 2} onClick={() => setIsActiveView(2)}><FaList /></ListGroup.Item>
                                </ListGroup>
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
                        <Table responsive="xl" className={isActiveView === 1 ? 'project--grid--table' : isActiveView === 2 ? 'project--table' : 'project--table'}>
                            <thead>
                                <tr key="project-table-header">
                                    {/* <th scope="col" width={20} key="project-hash-header">#</th> */}
                                    <th scope="col" width='20%' key="project-name-header"><abbr>#</abbr> Project Name</th>
                                    <th scope="col" width='20%' key="project-client-header" className="onHide">Client Name</th>
                                    <th scope="col" width='30%' key="project-member-header" className="onHide">Assigned Members</th>
                                    <th scope="col" key="project-status-header" className="onHide">Status</th>
                                    <th scope="col" width='25%' key="project-action-header" className="onHide text-md-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    (!spinner && projects && projects.length > 0)
                                        ? projects.map((project, index) => {

                                            return (<>
                                                <tr key={`project-row-${project._id}`} onClick={() => { handleProjectChange(project) }} className={project._id === currentProject?._id ? 'project--active' : ''}>
                                                    {/* <td key={`index-${index}`}>{index + 1} </td> */}
                                                    <td className="project--title--td" key={`title-index-${index}`} data-label="Project Name" onClick={viewTasks}><span><abbr key={`index-${index}`}>{index + 1}.</abbr> {project.title}</span></td>
                                                    <td key={`cname-index-${index}`} data-label="Client Name" className="onHide">{project.client?.name || <span className='text-muted'>__</span>}</td>
                                                    <td key={`amember-index-${index}`} data-label="Assigned Member" className="onHide member--circles">
                                                        <MemberInitials directUpdate={true} key={`MemberNames-${index}-${project._id}`} members={project.members} showRemove={true} showAssignBtn={true} postId={project._id} type = "project" 
                                                        // onMemberClick={(memberid, extraparam = false) => handleRemoveMember(project, memberid, `member--${project._id}-${memberid}`)} 
                                                        />

                                                    </td>
                                                    <td key={`status-index-${index}`} data-label="Status" className="onHide">

                                                        <Dropdown className="select--dropdown" key='status-key'>
                                                            <Dropdown.Toggle onClick={() => {dispatch(updateStateData(DIRECT_UPDATE, true));handleStatusShow()}} variant={`${project.status === 'in-progress' ? 'warning' : project.status === 'on-hold' ? 'secondary' : project.status === 'completed' ? 'success' : ''}`}>{formatStatus(project.status || "in-progress")}</Dropdown.Toggle>

                                                        </Dropdown>
                                                    </td>
                                                    <td key={`actions-index-${index}`} data-label="Actions" className="onHide text-md-end">
                                                        <Button variant="outline-primary" onClick={() => setIsActive(1)}>Tasks</Button>
                                                        <Button variant="outline-primary" className="ms-2" onClick={() => setIsActive(2)}>View</Button>
                                                    </td>
                                                </tr>
                                            </>)
                                        })
                                        :

                                        !spinner && isActiveView === 2 &&
                                        <>
                                            <tr key={`noresults-row`} className="no--invite">
                                                <td key={`empty-index`} colSpan={9} className="text-center">
                                                    <h2 className="mt-2 text-center">No Projects Found</h2>
                                                </td>
                                            </tr>
                                        </>

                                }
                            </tbody>
                        </Table>
                        {
                            isActiveView === 1 && !spinner && projects && projects.length == 0 &&
                            <div className="text-center mt-5">
                                <h2>No Projects Found</h2>
                            </div>
                        }
                    </Container>
                </div>
            </div>
            <div className="details--projects--grid projects--grid">
                <div className="wrapper--title">
                    <div className="projecttitle">
                        <h3>
                            <strong>{currentProject?.title}</strong>
                            <span>{currentProject?.client?.name}</span>
                        </h3>
                    </div>
                    <ListGroup horizontal className="members--list me-md-0 me-xl-auto ms-auto ms-md-2 d-none d-xxl-flex">
                        <ListGroup.Item key={`memberskey`} className="me-3">Members</ListGroup.Item>
                        {
                            (currentProject?.members && currentProject?.members.length > 0) &&
                            <MemberInitials directUpdate={true} key={`MemberNames-header-${currentProject?._id}`} showRemove={true} members={currentProject?.members} showAssignBtn={true} postId={currentProject?._id} type = "project"
                            //  onMemberClick={(memberid, extraparam = false) => handleRemoveMember(currentProject, memberid, `remove-member-${currentProject._id}-${memberid}`)}
                            />
                        }
                    </ListGroup>
                    <ListGroup horizontal className="ms-auto ms-xl-0 mt-0 mt-md-0">
                        <Button variant="outline-primary" className="active btn--view d-none d-lg-flex" onClick={() => { setIsActive(1); }}>Tasks</Button>
                        <Button variant="outline-primary" className="btn--view d-none d-lg-flex" onClick={() => setIsActive(2)}>View</Button>
                        <ListGroup.Item className="d-none d-lg-flex" key={`settingskey`} onClick={() => { dispatch(updateStateData(DIRECT_UPDATE, true));dispatch( togglePopups('workflow', true))}}><FaCog /></ListGroup.Item>
                        <ListGroup.Item key={`gridview`} className="gridView ms-1" action active={activeTab === 'GridView'} onClick={() => setActiveTab('GridView')}><BsGrid /></ListGroup.Item>
                        <ListGroup.Item key={`listview`} className="ListView ms-1" action active={activeTab === 'ListView'} onClick={() => setActiveTab('ListView')}><FaList /></ListGroup.Item>
                        <ListGroup.Item key={`closekey`} onClick={() => setIsActive(0)}><MdOutlineClose /></ListGroup.Item>
                    </ListGroup>
                </div>
                <TasksList activeTab={activeTab} currentProject={currentProject} />
            </div>

            <SingleProject key={`single-project-view-${currentProject?._id}`} currentProject={currentProject} clientlist={clientlist} members={members} closeview={setIsActive} />
            <TaskForm />
            <Modal show={show} onHide={handleClose} centered size="lg" className="add--member--modal modalbox" onShow={() => selectboxObserver()}>
                <Modal.Header closeButton>
                    <Modal.Title>{currentProject?._id ? 'Edit Project' : 'Create New Project'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="project--form">
                        <div className="project--form--inputs">
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-0 form-group">
                                    <FloatingLabel label="Project Title *">
                                        <Form.Control type="text" name="title" placeholder="Project Title" value={fields['title'] || ""} onChange={handleChange} />
                                    </FloatingLabel>
                                    {showError('title')}
                                </Form.Group>
                                <Form.Group className="mb-0 form-group">
                                    <Form.Label>
                                        <small>Status</small>
                                        <div className="status--modal" onClick={handleStatusShow}>
                                            <span className={`${fields['status'] === 'in-progress' ? 'progress--circle' : fields['status'] === 'on-hold' ? 'hold--circle' : fields['status'] === 'completed' ? 'complete--circle' : ''} status--circle`}></span> {fields['status']?.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase())} <FaChevronDown />
                                        </div>
                                    </Form.Label>
                                </Form.Group>
                                <Form.Group className="mb-0 form-group client--input">
                                    <Form.Select className="form-control custom-selectbox" placeholder="Select Client" id="client-select" name="client" onChange={handleChange} value={fields['client'] || ''}>
                                        <option value="none">None</option>
                                        {
                                            clientlist && clientlist.length > 0 &&
                                            clientlist.map((client, index) => {
                                                return <option key={client._id} value={client._id}>{client.name}</option>
                                            })

                                        }
                                    </Form.Select>

                                    <Button variant="primary" onClick={handleClientShow}><FaPlus /> Clients</Button>
                                    <AddClient show={showClient} toggleshow={handleClientClose} />
                                </Form.Group>
                                <Form.Group className="mb-0 form-group">
                                    <Form.Label>
                                        <small>Workflow</small>
                                        <div className="workflow--modal" onClick={(handleWorkflowShow)}>
                                            <span className="workflow--selected">{fields['workflow']?.title ? fields['workflow']?.title  : workflowstate?.workflows?.[0]?.title || 'Select' } <FaChevronDown /></span>
                                        </div>
                                    </Form.Label>
                                </Form.Group>
                                <Form.Group className="mb-0 form-group">
                                    <Form.Label className="w-100 m-0">
                                        <small>Description</small>
                                        {
                                            !isdescEditor &&
                                            <strong className="add-descrp" onClick={setIsDescEditor}><FiFileText /> Add a description</strong>
                                        }
                                    </Form.Label>
                                    <div className={isdescEditor ? 'text--editor show--editor' : 'text--editor'}>
                                            
                                            <ReactQuill 
                                                value={fields['description'] || ''}
                                                onChange={(value) => {
                                                    setFields({...fields, ['description']: value})
                                                    dispatch(updateStateData(PROJECT_FORM, { ['description']: value }))
                                                    setErrors({ ...errors, ['description']: '' });
                                                }}
                                                formats={formats} 
                                                modules={modules}
                                                
                                            />
                                            
                                        </div>
                                </Form.Group>
                                <Form.Group className="mb-0 form-group">
                                    <Form.Label>
                                        <small>Start/Due Date</small>
                                    </Form.Label>
                                    <Row>
                                        <Col sm={12} lg={6}>
                                            {/* <Form.Control type="date" name="start_date" onChange={handleChange} value={fields['start_date'] || ''} /> */}
                                            <DatePicker 
                                                name="start_date"
                                                value={fields['start_date'] ? parseDateWithoutTimezone(fields.start_date) : ''} 
                                                onChange={async (value) => {
                                                        const date = value.toDate();
                                                        // Manually format the date to YYYY-MM-DDTHH:mm:ss.sss+00:00 without converting to UTC
                                                        const year = date.getFullYear();
                                                        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth is zero-indexed
                                                        const day = date.getDate().toString().padStart(2, '0');
                                                        const hours = date.getHours().toString().padStart(2, '0');
                                                        const minutes = date.getMinutes().toString().padStart(2, '0');
                                                        const seconds = date.getSeconds().toString().padStart(2, '0');
                                                        const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
                                                    
                                                        // Combine into the desired format
                                                        const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+00:00`;
                                                        handleChange({ target: { name: 'start_date', value: formattedDate } });
                                                    }
                                                }
                                               
                                                minDate={new Date()}
                                                className="form-control"
                                                placeholder="dd/mm/yyyy"
                                            />
                                        </Col>
                                        <Col sm={12} lg={6} className="mt-3 mt-lg-0">
                                            {/* <Form.Control type="date" name="due_date" onChange={handleChange} value={fields['due_date'] || ''} /> */}
                                            <DatePicker 
                                                name="due_date"
                                                value={fields['due_date'] ? parseDateWithoutTimezone(fields.due_date) : ''} 
                                                onChange={async (value) => {
                                                        const date = value.toDate();
                                                        // Manually format the date to YYYY-MM-DDTHH:mm:ss.sss+00:00 without converting to UTC
                                                        const year = date.getFullYear();
                                                        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth is zero-indexed
                                                        const day = date.getDate().toString().padStart(2, '0');
                                                        const hours = date.getHours().toString().padStart(2, '0');
                                                        const minutes = date.getMinutes().toString().padStart(2, '0');
                                                        const seconds = date.getSeconds().toString().padStart(2, '0');
                                                        const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
                                                    
                                                        // Combine into the desired format
                                                        const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+00:00`;
                                                        handleChange({ target: { name: 'due_date', value: formattedDate } });
                                                    }
                                                }
                                                minDate={new Date()}
                                                className="form-control"
                                                placeholder="dd/mm/yyyy"
                                            />
                                        </Col>
                                    </Row>
                                </Form.Group>
                            </Form>
                        </div>
                        <div className="project--form--actions">
                            <h4>Actions</h4>
                            <ListGroup>
                                <ListGroup.Item onClick={() => { dispatch(togglePopups('members', true)) }}><FaPlus /> Assign to</ListGroup.Item>
                                <p className="m-0">
                                    {fields['members'] && Object.keys(fields['members']).length > 0 && (
                                        <MemberInitials directUpdate={false} key={`MemberNames-header-new`}  showall={true} members={fields['members']} showAssignBtn={false} postId="new" type="project" showRemove={true} 
                                        // onMemberClick={(memberid, extraparam = false) =>  removeMember(memberid)}
                                         />

                                        // Object.entries(fields['members']).map(([key, value]) => (
                                        //     <ListGroup.Item action key={`key-member-${key}`}>
                                        //         <MemberInitials title={value} id={`assign_member-${key}`}>
                                        //             <span className={`team--initial nm-${value?.charAt(0).toLowerCase()}`}>{value?.charAt(0).toUpperCase()}</span>
                                        //         </MemberInitials>
                                        //         <span className="remove-icon" onClick={() => removeMember(key)}>
                                        //             <MdOutlineClose />
                                        //         </span>
                                        //     </ListGroup.Item>
                                        // ))
                                    )}
                                </p>

                                <ListGroup.Item onClick={handleUploadShow}><GrAttachment /> Attach files</ListGroup.Item>
                                <div className="output--file-preview">
                                    <div className="preview--grid">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={`uploaded-preview-${index}`} className="file-preview">{renderPreview('new', preview, index)}</div>
                                        ))}
                                    </div>
                                </div>
                            </ListGroup>
                            <ListGroup className="mt-auto mb-0">
                                <ListGroup.Item className="text-center">
                                    <Button variant="primary" onClick={handleSubmit} disabled={loader}>{loader ? 'Please wait...' : 'Save'}</Button>
                                </ListGroup.Item>
                            </ListGroup>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
            <StatusModal key="create-project-status" />
            <MemberModal isedit={isEdit} />
            <WorkFlowModal />
            <FilesModal />
            <FilesPreviewModal showPreview={showPreview} imagePreviews={imagePreviews} toggle={setPreviewShow} filetoPreview={filetoPreview} />
            {/*--=-=Delete Modal**/}
            <Modal show={showDelete} onHide={handleDeleteClose} centered size="md" className="add--member--modal">
                <Modal.Header closeButton>
                    <Modal.Title>Delete Task</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Deleting a task permanently removes it from your taskboard.</p>
                    <p>You can still access your discussions and attachments in your communication channel.</p>
                    <p><strong>Are you sure you want to continue?</strong></p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleDeleteClose}>Cancel</Button>
                    <Button variant="danger">Delete</Button>
                </Modal.Footer>
            </Modal>
            
            {/*--=-=Filter Modal**/}
            <Modal show={showFilter} onHide={handleFilterClose} centered size="md" className="filter--modal" onShow={() => selectboxObserver()}>
                <Modal.Header closeButton>
                    <Modal.Title>Filters</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ListGroup>
                        <ListGroup.Item key="showfor-filter-list">
                            <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('show_for', event.target.value)} value={filters['show_for'] || 'all'}>
                                <option value="all">All Projects</option>
                                <option value="my">My Projects</option>
                            </Form.Select>
                        </ListGroup.Item>

                        <ListGroup.Item key="member-filter-list">
                            <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('member', event.target.value)} value={filters['member'] || 'all'} >
                                {
                                    allMembers.map((member, index) => {
                                        return <option key={`member-option--${index}`} value={member.value}>{member.label}</option>
                                    })
                                }
                            </Form.Select>
                        </ListGroup.Item>
                        <ListGroup.Item key="status-filter-list">
                            <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('status', event.target.value)} value={filters['status'] || 'all'}>
                                <option key={`view-all--option`} value="all">View All</option>
                                <option key={`progress--option`} value="in-progress">In Progress</option>
                                <option key={`hold--option`} value="on-hold">On Hold</option>
                                <option key={`completed--option`} value="completed">Completed</option>
                            </Form.Select>
                        </ListGroup.Item>
                    </ListGroup>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleFilterClose}>Cancel</Button>
                    <Button variant="primary" onClick={dofilters}>Save</Button>
                </Modal.Footer>
            </Modal>
            {/*--=-=Search Modal**/}
            <Modal show={showSearch} onHide={handleSearchClose} size="md" className="search--modal">
                <Modal.Header closeButton>
                    <Modal.Title>Search</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ListGroup>
                        <ListGroup.Item className="border-0 p-0" key="search-filter-list">
                            <Form>
                                <Form.Group className="mb-0 form-group">
                                    <Form.Control type="text" placeholder="Search by Project or Client" onChange={(event) => handlefilterchange('search', event.target.value)} />
                                </Form.Group>
                            </Form>
                        </ListGroup.Item>
                    </ListGroup>
                </Modal.Body>
            </Modal>
            {/*--=-=File Preview Modal**/}
            <>
                <AlertDialog
                    showdialog={showdialog}
                    toggledialog={setShowDialog}
                    msg="Are you sure you want to delete this project?"
                    callback={handledeleteProject}
                />
            </>
        </>
    );
}

export default ProjectsPage;