import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Form, ListGroup, FloatingLabel, Row, Col } from "react-bootstrap";
import { MdFileDownload, MdOutlineClose } from "react-icons/md";
import { FaBold, FaChevronDown, FaItalic, FaPlus, FaRegTrashAlt } from "react-icons/fa";
import { selectboxObserver } from "../../helpers/commonfunctions";
import { updateStateData, togglePopups } from '../../redux/actions/common.action';
import { TASK_FORM } from '../../redux/actions/types';
import { FiFileText } from "react-icons/fi";
import { GrAttachment } from "react-icons/gr";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

export const TaskForm = () => {
    const dispatch = useDispatch()
    const modalstate = useSelector(state => state.common.taskmodal);
    const commonState = useSelector( state => state.common)
    const [currentProject, setCurrentProject] = useState({})
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loader, setLoader] = useState(false);
    const [fields, setFields] = useState({title: '', status: 'in-progress', members: []})
    const [ errors, setErrors ] = useState({})
    const handleStatusClose = () => dispatch(togglePopups('status', false));
    const handleStatusShow = () => dispatch(togglePopups('status', true));
    const handleUploadShow = () => dispatch(togglePopups('files', true)) 
    const [isdescEditor, setIsDescEditor] = useState(false);
    const [filetoPreview, setFiletoPreview] = useState(null);
    const [showPreview, setPreviewShow] = useState(false);
    const handlePreviewClose = () => setPreviewShow(false);
    const handlePreviewShow = (file) => {
        setFiletoPreview(file)
        setPreviewShow(true)
    };
    const refreshstates = (formtype) => { 
        switch (formtype) {
          case 'task':
            const stateObject = {}
            // stateObject['status'] = commonState.projectForm.status
            stateObject['formtype'] = commonState.active_formtype
           return stateObject
           
          case 'edit_task':
            const editstateObject = {}
            // editstateObject['status'] = commonState.editProjectForm.status
            editstateObject['formtype'] = commonState.active_formtype
           return editstateObject
          
          default:
            return {}
            break;
        }
    }

    const handleSubmit = () => {

    }

    const showError = (name) => {
        if (errors[name]) return (<span className="error">{errors[name]}</span>)
        return null
    }

    const MemberInitials = ({ id, children, title }) => {
        return (
            <OverlayTrigger placement="bottom" overlay={<Tooltip id={id}>{title}</Tooltip>}>
                {children}
            </OverlayTrigger>
        )
    };

    const handleRemovefiles = (id) => {
        let previousfiles = fields['files']
        const updatedFiles = previousfiles.filter(file => file !== id);
        setFields({ ...fields, ['files']: updatedFiles })
    }

    const handleRemove = (indexToRemove) => {
        const selectedFiles = commonState.projectForm.images
        const updatedSelectedFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
        const updatedImagePreviews = imagePreviews.filter((_, index) => index !== indexToRemove);
        // setSelectedFiles(updatedSelectedFiles);
        dispatch(updateStateData(TASK_FORM, { images: updatedSelectedFiles }))
        setImagePreviews(updatedImagePreviews);
    };

    const renderPreview = (type, preview, index) => {
        console.log(type)
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

    // Function to remove the last member
    const removeMember = (member) => {
        delete fields['members'][member]
        dispatch(updateStateData(TASK_FORM, { members: fields['members'] || {} }))
    };
    
    const [taskModalState, setTaskModalState] = useState(refreshstates(commonState.active_formtype || false))

    const handleChange = ({ target: { name, value, type, files } }) => {
        dispatch(updateStateData(TASK_FORM, { [name]: value }))
        setErrors({ ...errors, [name]: '' })
    };


    return (
        <Modal show={modalstate} onHide={() => {dispatch(togglePopups('taskform', false))}} centered size="lg" className="add--member--modal modalbox" onShow={() => selectboxObserver()}>
            <Modal.Header closeButton>
                <Modal.Title>{currentProject?._id ? 'Edit Task' : 'Create New Task'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="project--form">
                    <div className="project--form--inputs">
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-0 form-group">
                                <FloatingLabel label="Task Title *">
                                    <Form.Control type="text" name="title" placeholder="Task Title" value={fields['title'] || ""} onChange={handleChange} />
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
                            
                           
                            <Form.Group className="mb-0 form-group">
                                <Form.Label className="w-100 m-0">
                                    <small>Description</small>
                                    <strong className="add-descrp" onClick={setIsDescEditor}><FiFileText /> Add a description</strong>
                                    <div className={isdescEditor ? 'text--editor show--editor' : 'text--editor'}>
                                        <textarea className="form-control" placeholder="Add a title" rows="2" name="description" value={fields['description'] || ''} onChange={handleChange}>{fields['description'] || ''}</textarea>
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
                            <ListGroup.Item onClick={() => { dispatch(togglePopups('members', true)) }}><FaPlus /> Assign to</ListGroup.Item>
                            <p className="m-0">
                                {fields['members'] && Object.keys(fields['members']).length > 0 && (
                                    Object.entries(fields['members']).map(([key, value]) => (
                                        <ListGroup.Item action key={`key-member-${key}`}>
                                            <MemberInitials title={value} id={`assign_member-${key}`}>
                                                <span className="team--initial nm-k">{value?.charAt(0)}</span>
                                            </MemberInitials>
                                            <span className="remove-icon" onClick={() => removeMember(key)}>
                                                <MdOutlineClose />
                                            </span>
                                        </ListGroup.Item>
                                    ))
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
                        <Button variant="primary" onClick={handleSubmit} disabled={loader}>{loader ? 'Please wait...' : 'Save'}</Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    )
}