import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Modal, Table, Dropdown, ListGroup} from "react-bootstrap";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { FiSidebar, FiUsers, FiTarget } from "react-icons/fi";
import { GrExpand } from "react-icons/gr";
import { MdDragIndicator } from "react-icons/md";
import { toggleSidebar, toggleSidebarSmall } from "../../redux/actions/common.action";
import WorkspaceForm from "./workspaceform";
import { refreshUserWorkspace } from "../../redux/actions/auth.actions";
import { useDispatch, useSelector } from "react-redux";
import { getloggedInUser } from "../../helpers/auth";
import { AlertDialog, TransferOnwerShip } from "../modals";
import { getMemberdata } from "../../helpers/commonfunctions";
import { deleteWorkspace } from "../../redux/actions/workspace.action";
import Spinner from 'react-bootstrap/Spinner';
import { BsTrash2, BsEye } from "react-icons/bs";
function Workspace(props) {
  const [spinner, setSpinner] = useState( true)
  const handleSidebarSmall = () => dispatch(toggleSidebarSmall(commonState.sidebar_small ? false : true));
  const handleSidebar = () => dispatch(toggleSidebar(commonState.sidebar_open ? false : true));
  const commonState = useSelector(state => state.common)
  const dispatch = useDispatch();
  const currentMember = getMemberdata();
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [ editworkspace, setEditWorkspace] = useState('')
  const workspacefeed = useSelector(state => state.auth.userCompanies);
  const [workspaces, setWorkspaces] = useState([])
  const apiResult = useSelector((state) => state.member);
  const [showdialog, setShowDialog] = useState(false);
  const workspace = useSelector(state => state.workspace)

  const handleworkspacelist = async () => {
    setWorkspaces([])
    
    await dispatch(refreshUserWorkspace())
    setSpinner( false )
  }

  useEffect(() => {
    setSpinner( true )
    handleworkspacelist()
  },[])

  useEffect(() => {
    if( workspacefeed && workspacefeed.length > 0){
      setWorkspaces( workspacefeed )
    }
  },[workspacefeed])

  useEffect(() => {
    if( workspace.message && workspace.message_variant && workspace.message_variant === "success"){
      setEditWorkspace('')
      setShowDialog(false)
      handleClose()
    }
  }, [workspace])

  const handledelete = (company) => {
    setEditWorkspace( company )
    setShowDialog(true)
  }
  const handledeleteWorkspace = async (id) => {
    
    await dispatch(
      deleteWorkspace(id)
    );
  };


  const handleownership = async () => {
    console.log("transfer ownership");
  };

  const handleEdit = (workspace) => {
    setEditWorkspace( workspace )
    handleShow( true )
  }

  return (
  
      <div className="team--page">
        <div className="page--title p-md-3 py-3 bg-white border-bottom">
          <Container fluid>
            <Row>
              <Col sm={12}>
                <h2>
                  <span className="open--sidebar me-2" onClick={() => { handleSidebarSmall(false); }}><FiSidebar /></span>
                  Workspace{" "}
                  <ListGroup horizontal className="ms-auto">
                    <ListGroup horizontal className="bg-white expand--icon ms-3">
                        <ListGroup.Item className="d-none d-lg-flex" onClick={() => {handleSidebarSmall(false);}}><GrExpand /></ListGroup.Item>
                        <ListGroup.Item className="btn btn-primary" onClick={handleShow}><FaPlus /></ListGroup.Item>
                    </ListGroup>
                  </ListGroup>
                </h2>
              </Col>
            </Row>
          </Container>
        </div>
        <div className='page--wrapper px-md-2 pb-4 pt-4'>
        {
          spinner ?
          <div class="loading-bar">
              <img src="images/OnTeam-icon-gray.png" className="flipchar" />
          </div>
          :
          <Container fluid>
            <div className="attendance--table members--view">
              <div className="attendance--table--list">
                <Table responsive="lg">
                  <thead className="onHide">
                    <tr key="project-table-header">
                      <th scope="col" className="sticky pe-0 py-0" key="project-name-header">
                        <FiUsers className="me-1" /> Name
                      </th>
                      <th scope="col" key="client-action-header" className="onHide">
                        <FiTarget className="me-1" /> Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      !spinner && workspaces && workspaces.length > 0 ?
                      workspaces.map((workspace, index) => (
                        <tr key={`row-${index}`}>
                          {/* <td width={30}>{index + 1 }</td> */}
                          <td className="cursor--pointer project--title--td">
                            <div className="d-flex justify-content-between">
                              <div className="project--name d-flex gap-3 align-items-center">
                                  <div className="drag--indicator"><abbr>{index + 1 }</abbr><MdDragIndicator /></div>
                                  <div className="title--initial">{workspace.company?.name?.substring(0,1)}</div>
                                  <div className="title--span flex-column d-flex align-items-start gap-0">
                                    <span>{workspace.company?.name}</span>
                                  </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex gap-3 align-items-center justify-content-md-end">
                              <Button variant="dark" className="px-2 py-1 d-flex gap-2 align-items-center"  onClick={() => handleEdit(workspace.company)}><BsEye /> Edit</Button>
                              <Button variant="danger" className="px-2 py-1 d-flex gap-2 align-items-center"  onClick={() => handledelete( workspace.company)}><FaTrashAlt /> Delete</Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    :
                    !spinner && workspaces && workspaces.length === 0 &&
                    <tr>
                        <td colSpan={3}>
                          <h2 className="mt-2 text-center">No workspace found.</h2>
                        </td>
                      </tr>
                    }
                  </tbody>
                </Table>
              </div>
            </div>
          </Container>
        }
        </div>
        <Modal show={show} onHide={handleClose} centered size="md" className="add--workspace--modal">
        <Modal.Header closeButton>
          <Modal.Title>Create a Workspace</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <WorkspaceForm editworkspace={editworkspace} />
        </Modal.Body>
      </Modal>

      {(currentMember &&
        currentMember.role?.slug === "owner" &&
        
        <>
          <AlertDialog
            showdialog={showdialog}
            toggledialog={setShowDialog}
            msg={`Are you sure you want delete workspace: ${editworkspace.name}`}
            callback={() => handledeleteWorkspace( editworkspace._id)}
          />
        </>
      
      )}
      </div>
      

  );
}

export default Workspace;
