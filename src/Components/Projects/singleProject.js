import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Button, Modal, Form, FloatingLabel, ListGroup, Dropdown } from "react-bootstrap";
import { FaBold, FaChevronDown, FaItalic, FaPlus, FaRegTrashAlt, FaUpload, FaEllipsisV, FaCheck, FaPlusCircle, FaTimes } from "react-icons/fa";
import { MdFileDownload, MdOutlineClose } from "react-icons/md";
import { FiFileText } from "react-icons/fi";
import { GrAttachment } from "react-icons/gr";
import { updateProject, deleteProject } from "../../redux/actions/project.action"
import AddClient from "../Clients/AddClient";
import { getFieldRules, validateField } from "../../helpers/rules";
import { AlertDialog, MemberModal, StatusModal, WorkFlowModal, FilesModal, FilesPreviewModal } from "../modals";
import { useDropzone } from 'react-dropzone'
import fileIcon from './../../images/file-icon-image.jpg'
import { selectboxObserver } from "../../helpers/commonfunctions";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { togglePopups, updateStateData } from "../../redux/actions/common.action";
import {  EDIT_PROJECT_FORM, ASSIGN_MEMBER, RESET_FORMS, CURRENT_PROJECT, DIRECT_UPDATE } from "../../redux/actions/types";
import { MemberInitials } from "../common/memberInitials";

function SingleProject(props) {
    const dispatch = useDispatch();
    const commonState = useSelector( state => state.common)
    const [fields, setFields] = useState({ title: '', status: 'in-progress', members: [], client: '' });
    const [errors, setErrors] = useState({ title: '' });
    const [loader, setLoader] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [selectedMembers, setselectedMembers] = useState({});
    const[ editormode, setEditorMode] = useState( false )
    const apiResult = useSelector(state => state.project);
    const apiClient = useSelector(state => state.client)
    const [clientlist, setClientList] = useState([])
    const [members, setMembers] = useState([])
    const [isActive, setIsActive] = useState(2);
    const [currentProject, setCurrentProject] = useState({})
    const [showdialog, setShowDialog] = useState(false);
    const [allMembers, setAllmembers] = useState([{ value: 'all', label: 'All Members' }])
    const [showStatus, setStatusShow] = useState(false);
    const handleStatusClose = () =>  dispatch(togglePopups('status', false));
    const handleStatusShow = () => dispatch(togglePopups('status', true));
    const [isEdit, setIsEdit] = useState(false)
    const [showClient, setClientShow] = useState(false);
    const handleClientClose = () => setClientShow(false);
    const handleClientShow = () => setClientShow(true);
    const [ selectedworkflow, setSelectedWorkflow] = useState({})
    const [showWorkflow, setWorkflowShow] = useState(false);
    const handleWorkflowClose = () => dispatch( togglePopups('workflow',false ));
    const handleWorkflowShow = async () => {
       await dispatch( updateStateData(DIRECT_UPDATE, false))
        dispatch( togglePopups('workflow',true));
    }
    const [showAssign, setAssignShow] = useState(false);
    const handleAssignShow = () => setAssignShow(true);
    const [showUpload, setUploadShow] = useState(false);
    const handleUploadClose = () => {
        setUploadShow(false);
    }
    const handleUploadShow = () => setUploadShow(true);
    const [isEditor, setIsEditor] = useState(false);
    const [filetoPreview, setFiletoPreview] = useState(null);
    const [showPreview, setPreviewShow] = useState(false);
    const handlePreviewClose = () => setPreviewShow(false);
    const [clientsearchTerm, setClientSearchTerm] = useState('');
    let fieldErrors = {};

    useEffect(() => {
        selectboxObserver()
    }, []);

    useEffect(() => {
    }, [fields]);

    useEffect(() => {
        if (commonState.currentProject) {
            setIsEditor(false);
            setEditorMode( false);
            setCurrentProject(commonState.currentProject)
            setSelectedWorkflow(commonState.currentProject?.workflow || {} )
        }

    }, [commonState.currentProject])

    useEffect(() => {
        if (commonState.allclients && commonState.allclients.length > 0) {
            setClientList(commonState.allclients)
        } else {
            setClientList([])
        }
    }, [commonState.allclients])

      useEffect(() => {
        if( commonState.editProjectForm){
            setFields(commonState.editProjectForm)
        }
      },[ commonState.editProjectForm])


    useEffect(() => {
        if (currentProject && Object.keys(currentProject).length > 0) { console.log('here at project:: ', currentProject)
            setSelectedFiles([]);
            setImagePreviews([]);
            let fieldsSetup = {
                title: currentProject.title,
                status: currentProject.status,
                client: currentProject.client ? currentProject.client._id || fields['client'] : '',
                description: currentProject.description || '',
                start_date: currentProject.start_date ? new Date(currentProject.start_date).toISOString().split('T')[0] : '',
                due_date: currentProject.due_date ? new Date(currentProject.due_date).toISOString().split('T')[0] : '',
                files: currentProject.files ? currentProject.files.map(image => image._id) : [],
                workflow: currentProject.workflow ? currentProject.workflow : {}
            };

            if (currentProject.description && currentProject.description !== "") {
                setIsEditor(true);
            }

            // Set members if present
            if (currentProject.members && currentProject.members.length > 0) {
                let projectMembers = [];
                let membersdrop = {};

                currentProject.members.forEach(member => {
                    const { _id, name } = member;
                    projectMembers.push(_id);
                    membersdrop[_id] = name;
                });

                fieldsSetup.members = membersdrop;
               // setselectedMembers(membersdrop);
            } else {
                fieldsSetup.members = [];
                //setselectedMembers({});
            }
            setTimeout(function () {
                selectboxObserver()
            }, 150)
            dispatch ( updateStateData( EDIT_PROJECT_FORM, fieldsSetup))
        }
    }, [currentProject]);


    const handleattachfiles = (e) => {
        handleUploadClose()
    }

    useEffect(() => {
        if (apiResult.success) {
            setShowDialog(false)
        }
    }, [apiResult])

    function handleLabelClick(event) {
        event.preventDefault(); // Ensure the default behavior is prevented
        document.getElementById('updateattachments').click();
    }

    // const addMember = (member) => {
    //     setFields(prevFields => ({
    //         ...prevFields,
    //         members: Array.from(new Set([...prevFields.members, member._id]))
    //     }));

    //     const { _id, name } = member;
    //     setselectedMembers((prevSelectedMembers = {}) => {
    //         // Check if the memberId is not already in the selectedMembers object
    //         if (!prevSelectedMembers.hasOwnProperty(_id)) {
    //             return {
    //                 ...prevSelectedMembers,
    //                 [_id]: name,
    //             };
    //         } else {
    //             return prevSelectedMembers;
    //         }
    //     });

    // };

    const handleDownload = (url) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = '';
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
        if (selectedFiles?.length > 0) {
            setFields({ ...fields, images: selectedFiles });
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
    }, [selectedFiles])

    useEffect(() => {
    }, [selectedMembers])

    // Function to remove the last member
    const removeMember = (member, directUpdate = false) => {
        const updatedSelectedMembers = { ...commonState.editProjectForm.members };
            delete updatedSelectedMembers[member];
        if( directUpdate === true ){
            const memberIds = Object.keys(updatedSelectedMembers);
            dispatch(updateProject(currentProject._id, { members: memberIds }))
        }else{
            dispatch( updateStateData( EDIT_PROJECT_FORM, {...commonState.editProjectForm, members: updatedSelectedMembers}))
        }
    };


    const handleEditor = event => {
        setIsEditor(current => !current);
    };


    const handlePreviewShow = (file) => {
        setFiletoPreview(file)
        setPreviewShow(true)
    };

    const handleSelectedFiles = (acceptedFiles) => {
        //const newFiles = Array.from(event.target.files);
        setSelectedFiles((prevSelectedFiles) => {
            // Filter out duplicates by comparing file names or other unique properties
            const uniqueFiles = Array.from(new Set([...prevSelectedFiles, ...acceptedFiles]));

            return uniqueFiles;
        });
    };

    

    const handleclientSearch = (e) => {
        setClientSearchTerm(e.target.value);
    };

    const filteredItems = clientlist.filter(item =>
        item.name.toLowerCase().includes(clientsearchTerm.toLowerCase())
    );



    const handleRemove = (indexToRemove) => {
        // Filter out the file to remove from both selectedFiles and imagePreviews
        const updatedSelectedFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
        const updatedImagePreviews = imagePreviews.filter((_, index) => index !== indexToRemove);

        setSelectedFiles(updatedSelectedFiles);
        setImagePreviews(updatedImagePreviews);
    };


    const onDrop = useCallback(acceptedFiles => {
        handleSelectedFiles(acceptedFiles)
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    const handleChange = ({ target: { name, value, type, files } }) => {
        setFields({ ...fields, [name]: value });
        dispatch( updateStateData( EDIT_PROJECT_FORM,  {[name]: value }))
        setErrors({ ...errors, [name]: '' })
    };

    const handleWorkflowSelect = (flow) => {
        setFields({ ...fields, ['workflow']: flow });
        setSelectedWorkflow( flow )
    }

    const handleRemoveMember = async (project, memberId, targetelement = null) => {

        document.getElementById(targetelement).classList.add('disabled-pointer');
        const currentMembers = project.members;
        const updatedMembers = currentMembers
            .filter(member => member._id !== memberId)
            .map(member => member._id);
        await dispatch(updateProject(project._id, { members: updatedMembers, remove_member: true }))
        document.getElementById(targetelement).classList.remove('disabled-pointer');
        // removeMember(memberId)
    }

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
            // console.log('Updated Project Fields:: ', fields)
            // return;
            const formData = new FormData();
            for (const [key, value] of Object.entries(fields)) {
                if (typeof value === 'object' && key === 'images') {
                    value.forEach(attach => {
                        formData.append('images[]', attach);
                    });
                }else if (typeof value === 'object' && key === 'members') {
                    const memberids = Object.keys(fields['members'])
                    if( memberids.length > 0){
                        memberids.forEach(item => {
                            formData.append(`members[]`, item); // Append with the same key for non-empty arrays
                        });
                    }else{
                        formData.append(`members`, '[]');
                    }
                } else if (Array.isArray(value)) { // Check if the value is an array
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

            let payload = formData;


            await dispatch(updateProject(currentProject._id, payload))
            setLoader(false)

        }
    }

    const handledeleteProject = async () => {
        await dispatch(deleteProject(currentProject._id))
        await dispatch( updateStateData(CURRENT_PROJECT, {}))
        await dispatch(updateStateData(RESET_FORMS, 'edit_project'))
        //props.closeview(0)
    }

    const handleRemovefiles = (id) => {
        let previousfiles = fields['files']
        const updatedFiles = previousfiles.filter(file => file !== id);
        setFields({ ...fields, ['files']: updatedFiles })
        const previewfiles = currentProject.files.filter(file => file._id !== id);
        setCurrentProject({ ...currentProject, ['files']: previewfiles })
    }

    const renderPreview = (type, preview, index) => {
        const { src, _id } = preview;
        const mimetype = (preview.mimetype) ? preview.mimetype : src.split('.').pop().toLowerCase();

        const previewComponents = {
            image: (
                <div className="preview--cell" key={`image-${type}-${_id}`}>
                    <p onClick={() => handlePreviewShow({ src, _id, mimetype, filename: preview?.filename || `Preview file-${index}` })}>{preview?.filename || `Preview file-${index}`}</p>
                    {
                        type !== "new" &&
                        <Button variant="secondary" className="ms-auto" onClick={() => handleDownload(src)}><MdFileDownload /></Button>
                    }
                    <Button variant="primary" onClick={() => type === "new" ? handleRemove(index) : handleRemovefiles(_id)}><FaRegTrashAlt /></Button>
                </div>
            ),
            video: (
                <div className="preview--cell" key={`video-${type}-${_id}`}>
                    <p onClick={() => handlePreviewShow({ src, _id, mimetype, filename: preview?.filename || `Preview file-${index}` })}>{preview?.filename || `Preview file-${index}`}</p>
                    {
                        type !== "new" &&
                        <Button variant="secondary" className="ms-auto" onClick={() => handleDownload(src)}><MdFileDownload /></Button>
                    }
                    <Button variant="primary" onClick={() => type === "new" ? handleRemove(index) : handleRemovefiles(_id)}><FaRegTrashAlt /></Button>
                </div>
            ),
            pdf: (
                <div className="preview--cell" key={`pdf-${type}-${_id}`}>
                    <p onClick={() => handlePreviewShow({ src, _id, mimetype, filename: preview?.filename || `Preview file-${index}` })}>{preview?.filename || `Preview file-${index}`}</p>
                    {
                        type !== "new" &&
                        <Button variant="secondary" className="ms-auto" onClick={() => handleDownload(src)}><MdFileDownload /></Button>
                    }

                    <Button variant="primary" onClick={() => type === "new" ? handleRemove(index) : handleRemovefiles(_id)}><FaRegTrashAlt /></Button>
                </div>
            ),
            other: (
                <div className="preview--cell" key={`other-${type}-${_id}`}>
                    <p onClick={() => handlePreviewShow({ src, _id, mimetype, filename: preview?.filename || `Preview file-${index}` })}>{preview?.filename || `Preview file-${index}`}</p>
                    {
                        type !== "new" &&
                        <Button variant="secondary" className="ms-auto" onClick={() => handleDownload(src)}><MdFileDownload /></Button>
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


    // const MemberInitials = ({ id, children, title }) => {
    //     return (
    //         <OverlayTrigger overlay={<Tooltip id={id}>{title}</Tooltip>}>
    //             {children}
    //         </OverlayTrigger>

    //     )
    // };


    return (
        <>
            <div className="details--projects--view">
                <div className="wrapper--title">
                    <div className="projecttitle">
                        <h3 key={`project-title-${currentProject?._id}`}>
                            <strong>{currentProject?.title}</strong>
                            <span>{currentProject?.client?.name}</span>
                        </h3>
                    </div>
                    
                    <ListGroup horizontal className="members--list me-md-0 me-xl-auto ms-auto ms-md-2 d-none d-xxl-flex">
                        <ListGroup.Item key={`project-assign-${currentProject?._id}`} className="me-3">Members</ListGroup.Item>
                        
                        {fields['members'] && Object.keys(fields.members).length > 0 && (
                            <MemberInitials showRemove={true} members={currentProject?.members} directUpdate={true} showAssignBtn={true} postId={currentProject?._id} type = "project" 
                            // onMemberClick={(memberid, extraparam = false) => handleRemoveMember(currentProject, memberid, `member--${currentProject?._id}-${memberid}`)}
                            />
                        )}
                    </ListGroup>
                    <ListGroup horizontal className="ms-auto">
                        <Button variant="outline-primary" className="btn--view d-none d-lg-flex" onClick={() => props.closeview(1)}>Tasks</Button>
                        <Button variant="outline-primary" className="active btn--view d-none d-lg-flex" onClick={() => setIsActive(2)}>View</Button>
                        <ListGroup.Item key={`closekey`} onClick={() => props.closeview(0)}><MdOutlineClose /></ListGroup.Item>
                    </ListGroup>
                </div>
                <div className="project--form rounded--box">
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
                            <Form.Group className="mb-0 form-group" key={`clientbox-${currentProject?._id}`}>
                                <Form.Label>
                                    <small>Client</small>
                                </Form.Label>
                                <div className="client--input">
                                <Dropdown className={`select--dropdown`}>
                                    <Dropdown.Toggle variant="success" key={`success-selectkey-${Math.floor(Math.random() * 1001)}`}>
                                    {
                                        clientlist && clientlist.length > 0
                                            ? clientlist.find((client) => client._id === fields['client'])?.name || 'None'
                                            : 'None'
                                    }

                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <div className="drop--scroll">
                                            <Form>
                                                <Form.Group className="form-group mb-3">
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Search here.."
                                                        value={clientsearchTerm}
                                                        onChange={handleclientSearch}
                                                    />
                                                </Form.Group>
                                            </Form>
                                            <Dropdown.Item
                                                key={'None'}
                                                className={!fields['client'] ? 'selected--option' : ''}
                                                onClick={() => { handleChange({ target: { name: 'client', value: '' } })}}
                                                href="#"
                                            >
                                               None
                                            </Dropdown.Item>
                                            {
                                                filteredItems && filteredItems.length > 0 &&

                                                filteredItems.map((client, index) => {
                                                    return <Dropdown.Item
                                                            key={client._id}
                                                            className={client._id === fields['client'] ? 'selected--option' : ''}
                                                            onClick={() => { handleChange({ target: { name: 'client', value: client._id } })}}
                                                            href="#"
                                                        >
                                                            {client.name} {client._id === fields['client'] && <FaCheck />}
                                                        </Dropdown.Item>
                                                })

                                            }
                                        </div>
                                    </Dropdown.Menu>
                                </Dropdown>
                                  
                                    <Button variant="primary" onClick={handleClientShow}><FaPlus /> Client</Button>
                                </div>
                                <AddClient show={showClient} toggleshow={handleClientClose} />
                            </Form.Group>
                            <Form.Group className="mb-0 form-group">
                                <Form.Label>
                                    <small>Workflow</small>
                                    <div className="workflow--modal" onClick={handleWorkflowShow}>
                                        <span className="workflow--selected">{fields['workflow']?.title  ? 'Current Workflow' : 'Current Workflow'} <FaChevronDown /></span>
                                    </div>
                                </Form.Label>
                            </Form.Group>
                            <Form.Group className="mb-0 form-group">
                                <Form.Label className="w-100 m-0">
                                    <small>Description</small>
                                    {
                                        !isEditor &&
                                        <strong className="add-descrp" onClick={handleEditor}><FiFileText /> Add a description</strong>
                                    }
                                   
                                    <div className={(isEditor || isEditor && fields['description'] && fields['description'] !== "") ? 'text--editor show--editor' : 'text--editor'}>
                                        <textarea className="form-control" placeholder="Add a title" rows="2" name="description" onChange={handleChange} value={fields['description'] || ''}>{fields['description'] || ''}</textarea>
                                        <ul className="editor--options">
                                            <li><a href="javascript:;"><FaBold /></a></li>
                                            <li><a href="javascript:;"><FaItalic /></a></li>
                                        </ul>
                                    </div>
                                </Form.Label>
                            </Form.Group>
                            <Form.Group className="mb-0 form-group">
                                <Form.Label>
                                    <small>Start/Due Date</small>
                                </Form.Label>
                                <Row>
                                    <Col sm={12} lg={6}>
                                        <Form.Control type="date" name="start_date" onChange={handleChange} value={fields['start_date'] || ''} />
                                    </Col>
                                    <Col sm={12} lg={6} className="mt-3 mt-lg-0">
                                        <Form.Control type="date" name="due_date" onChange={handleChange} value={fields['due_date'] || ''} />
                                    </Col>
                                </Row>
                            </Form.Group>
                        </Form>
                    </div>
                    <div className="project--form--actions">
                        <h4>Actions</h4>
                        <ListGroup>
                            <ListGroup.Item key="assign-membermodal-key" onClick={() => {dispatch(togglePopups('members', true))}}><FaPlus /> Assign to</ListGroup.Item>
                            <div className="m-0 d-flex align-items-center flex-wrap">
                                    {
                                        fields.members && Object.keys(fields.members).length > 0 && 
                                        <MemberInitials directUpdate={false} members={fields['members']} showRemove={true} showall={true} showAssignBtn={false} postId={currentProject?._id} type = "project" 
                                        // onMemberClick={(memberid, extraparam = false) => removeMember( memberid)} 
                                        />

                                    }
                                {/* {fields.members && Object.keys(fields.members).length > 0 && (
                                    <>
                                        {Object.entries(fields.members).slice(0).map(([id, name], memberindex) => (
                                            <ListGroup.Item action key={`member-${memberindex}`}>
                                                <MemberInitials title={name} id={`member-${id}-${memberindex}`}>
                                                    <span className={`team--initial nm-${name.substring(0, 1).toLowerCase()}`}>{name?.substring(0, 1).toUpperCase()}</span>
                                                </MemberInitials>
                                                <span
                                                    className="remove-icon"
                                                    id={`member-${currentProject?._id}-${id}`}
                                                    onClick={() => removeMember(id)}
                                                >
                                                    <MdOutlineClose />
                                                </span>
                                            </ListGroup.Item>
                                        ))}
                                        
                                    </>
                                )} */}
                            </div>
                            <ListGroup.Item key="assign-files-key" onClick={handleUploadShow}><GrAttachment /> Attach files</ListGroup.Item>
                            <div className="output--file-preview">
                                <div className="preview--grid">

                                    {
                                        currentProject.files && currentProject.files.length > 0 &&
                                        currentProject.files.map((preview, index) => (
                                            <div key={index}>{renderPreview('old', preview, index)}</div>
                                        ))
                                    }
                                    {!showUpload && imagePreviews.map((preview, index) => (
                                        <div key={`uploaded-preview-${index}`} className="file-preview">{renderPreview('new', preview, index)}</div>
                                    ))}

                                </div>
                            </div>
                        </ListGroup>
                        <ListGroup className="mt-auto mb-0">
                            <ListGroup.Item className="text-center">
                                <Button variant="primary" onClick={handleSubmit} disabled={loader}>{loader ? 'Please wait...' : 'Save'}</Button>
                                <Button variant="danger" key='delete-key' onClick={() => setShowDialog(true)}>Delete</Button>
                            </ListGroup.Item>
                        </ListGroup>
                    </div>
                </div>
            </div>

            {/*--=-=Upload Files Modal**/}
            <Modal show={showUpload} onHide={handleUploadClose} centered size="md" className="upload--status">
                <Modal.Header closeButton>
                    <Modal.Title>Attach Files</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form {...getRootProps()}>
                        <Form.Group>
                            <Form.Control type="file" hidden multiple name="images[]" onChange={(e) => handleSelectedFiles(Array.from(e.target.files))} {...getInputProps()} id="updateattachments" />
                            <Form.Label className="file--upload" for="updateattachments" onClick="handleLabelClick(event)">
                                <span><FaUpload /></span>
                                <p>Drop your files here or <strong>browse</strong></p>
                            </Form.Label>
                        </Form.Group>

                    </Form>
                    <div className="preview--grid">
                        {imagePreviews.map((preview, index) => (
                            <div key={`uploaded-preview-${index}`} className="file-preview">{renderPreview('new', preview, index)}</div>
                        ))}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => { setSelectedFiles([]); setImagePreviews([]); handleUploadClose(); }}>Cancel</Button>
                    <Button variant="primary" onClick={handleattachfiles}>Attach</Button>
                </Modal.Footer>
            </Modal>


            {/*--=-=File Preview Modal**/}
            <Modal show={showPreview} onHide={handlePreviewClose} size="xl" className="file--preview--modal">
                <Modal.Header closeButton>
                    <Modal.Title>{filetoPreview?.filename}
                        <Dropdown>
                            <Dropdown.Toggle variant="light"><FaEllipsisV /></Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item key={`openfile-${filetoPreview?._id}`} onClick={() => handleDownload(filetoPreview?.src)}><MdFileDownload /> Download</Dropdown.Item>
                                {/* <Dropdown.Item href="#/action-2" onClick={() => //handleRemovefiles(filetoPreview?._id)}><FaTrashAlt /> Delete file</Dropdown.Item> */}
                            </Dropdown.Menu>
                        </Dropdown>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="file--flex">
                        <ListGroup>


                            {
                                currentProject?.files && currentProject?.files.length > 0 &&
                                currentProject.files.map((preview, index) => (
                                    <ListGroup.Item key={`preview-key-${index}`} onClick={() => setFiletoPreview({ src: preview.src, mimetype: preview.src.split('.').pop().toLowerCase(), _id: preview._id, filename: preview?.filename || `Preview file-${index}` })} className={preview._id === filetoPreview?._id ? "selected--file" : ''}>
                                        {preview?.filename}

                                    </ListGroup.Item>
                                ))
                            }
                            {imagePreviews.map((preview, index) => (
                                <>

                                    <ListGroup.Item key={`preview-key-new-${index}`} onClick={() => setFiletoPreview({ mimetype: preview.mimetype, src: preview.src, _id: index, filename: preview?.filename || `Preview file-${index}` })} className={index === filetoPreview?._id ? "selected--file" : ''}>
                                        {preview?.filename}

                                    </ListGroup.Item> </>
                                // <div key={`uploaded-preview-${index}`} className="file-preview">{renderPreview('new', preview, index)}</div>
                            ))}
                        </ListGroup>
                        <div className="file--preview">

                            {

                                ["jpg", "jpeg", "png", "webp", "gif", "ico"].includes(filetoPreview?.mimetype) ?
                                    <img src={filetoPreview?.src} alt=".." />
                                    :
                                    filetoPreview?.mimetype === "mp4" ?
                                        <video src={filetoPreview?.src} alt={`video--file`} width="200" controls />
                                        :
                                        filetoPreview?.mimetype === "pdf" ?
                                            <embed src={filetoPreview?.src} type="application/pdf" width="200" height="200" />
                                            :
                                            <>
                                                <img src={fileIcon} alt=".." width="100" height="100" /> <br />

                                            </>

                            }

                        </div>
                    </div>
                </Modal.Body>
            </Modal>
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

export default SingleProject;