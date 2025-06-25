import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Col, Row, Card, Button,ListGroup, Image, CardTitle, CardBody, CardGroup, Tab, Tabs, Modal, Form } from "react-bootstrap";
import { toggleSidebarSmall } from "../../redux/actions/common.action";
import { FaRegStar, FaDesktop, FaRegFileAlt, FaQuoteRight, FaImage, FaStar, FaRegQuestionCircle, FaDotCircle, FaRegEnvelope, FaRegEye } from 'react-icons/fa';
import { FiSidebar, FiShield, FiGlobe, FiDownload, FiUpload, FiX, FiClock, FiCalendar, FiSend, FiYoutube } from "react-icons/fi";
import { GrExpand } from "react-icons/gr";
import { LuVideo } from "react-icons/lu";
import { MdLaptopMac, MdOutlineChatBubbleOutline } from "react-icons/md";
import { BsChat, BsHeart, BsClock } from "react-icons/bs";
import { HiOutlineLightningBolt, HiOutlineLocationMarker } from "react-icons/hi";
import { acceptCompanyinvite, listCompanyinvite, deleteInvite} from "../../redux/actions/members.action";
import { createPost, ListPosts, likePost } from "../../redux/actions/post.action";
import { LuQuote } from "react-icons/lu";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import DateTimeCard from "../common/DateTimeCard";
dayjs.extend(relativeTime);
function DashboardPage() {
  const dispatch = useDispatch()
  
  const memberstate = useSelector((state) => state.member);
  const invitationsFeed = useSelector((state) => state.member.invitations);
  const postFeed = useSelector((state) => state.post.posts);
  const postApi = useSelector( (state) => state.post);
  const [invitationsFeeds, setInvitationsFeed] = useState([]);
  const [isActive, setIsActive] = useState(0);
  const handleSidebarSmall = () => dispatch(toggleSidebarSmall(commonState.sidebar_small ? false : true))
  const commonState = useSelector(state => state.common)
  const [show, setShow] = useState(false);
  const [ posts, setPosts] = useState([])
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [ loading, setLoading] = useState( false);
  const [ fields, setFields ] = useState(
    { 
      type: 'text',
      content: '',
      files: [],
    });
  const [ error, setError] = useState('');

  const handlevideoTypeChange = (type) => {
    setFields({
      ...fields, ['videoType']: type
    });
  }
  const handletypeChange = (type) => { 
    setFields({
      type: type,
      title: '',
      content: '',
      caption: '',
      imageUrl: '',
      quote: '',
      quoteAuthor: '',
      videoType: 'youtube',
      youtubeUrl: '',
      vimeoUrl: '',
      videoUrl: '',
      description: ''
    });

  }

  const handleTextChange = ({ target: { name, value, type } }) => {
    setFields({ ...fields, [name]: value });
  };
  const removeFile = (index) => {
    const newFiles = [...fields.files];
    newFiles.splice(index, 1);
    setFields({ ...fields, files: newFiles });
  };

  const handleSubmit = async () => {
  const {
    type,
    title,
    content,
    caption,
    quote,
    quoteAuthor,
    videoType,
    youtubeUrl,
    vimeoUrl,
    description,
    files,
  } = fields;

  // Basic validation
  if (!type) {
    setError('Please select a post type.');
    return;
  }

  if (type === 'text' && !content.trim()) {
    setError('Text content cannot be empty.');
    return;
  }

  if (type === 'quote' && !quote.trim()) {
    setError('Quote content cannot be empty.');
    return;
  }

  if (type === 'image' && (!files || files.length === 0)) {
    setError('Please upload at least one image.');
    return;
  }

  if (type === 'video') {
    if (!videoType) {
      setError('Please select a video type.');
      return;
    }

    if (videoType === 'youtube' && !youtubeUrl.trim()) {
      setError('Please provide a YouTube URL.');
      return;
    }

    if (videoType === 'vimeo' && !vimeoUrl.trim()) {
      setError('Please provide a Vimeo URL.');
      return;
    }

    if (videoType === 'upload' && (!files || files.length === 0)) {
      setError('Please upload at least one video file.');
      return;
    }
  }

  setLoading(true);

  try {
    const formData = new FormData();
    formData.append('type', type);

    if (type === 'text') {
      formData.append('title', title || '');
      formData.append('content', content);
    }

    if (type === 'quote') {
      formData.append('quote', quote);
      formData.append('quoteAuthor', quoteAuthor || '');
    }

    if (type === 'image') {
      formData.append('caption', caption || '');
    }

    if (type === 'video') {
      formData.append('videoType', videoType);
      formData.append('description', description || '');

      if (videoType === 'youtube') {
        formData.append('youtubeUrl', youtubeUrl);
      }

      if (videoType === 'vimeo') {
        formData.append('vimeoUrl', vimeoUrl);
      }
    }

    // Attach files if present
    if (files && files.length > 0) {
      files.forEach((file) => formData.append('files', file));
    }

    // Dispatch the post creation
    const res = await dispatch(createPost(formData))

    // Add the new post to the top of the list
    if (res?.post) {
      setPosts((prevPosts) => [res.post, ...prevPosts]);
    }

    // Reset and close modal
    handleClose();
    setFields({
      type: 'text',
      title: '',
      content: '',
      caption: '',
      quote: '',
      quoteAuthor: '',
      videoType: '',
      youtubeUrl: '',
      vimeoUrl: '',
      description: '',
      files: [],
    });
  } catch (err) {
    console.error('Error creating post:', err);
    setError('Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }
};


  const handleFileChange = (e) => {
    const fileList = Array.from(e.target.files);
    const accepted = fields.type === 'image' 
      ? fileList.filter(f => f.type.startsWith('image/')) 
      : fileList.filter(f => f.type.startsWith('video/'));
    setFields({ ...fields, files: accepted });
  };
  const handlePosts = async () => {
    await dispatch(ListPosts());
  }

  const handleInvitationList = async () => {
    await dispatch(
      listCompanyinvite()
    );
  };

  useEffect(() => {
    const check = ["undefined", undefined, "null", null, ""];

    if (invitationsFeed && invitationsFeed.inviteData) {
      setInvitationsFeed(invitationsFeed.inviteData);
    }
  }, [invitationsFeed]);

  useEffect(() => {
    if( postFeed ){
      setPosts(postFeed)
    }
  }, [postFeed])

  useEffect(() => {
    if( postApi.singlePost){
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postApi.singlePost._id ? postApi.singlePost : post
        )
      );
    }

    if (postApi.createPost) {
      setPosts((prevPosts) => [postApi.createPost, ...prevPosts]);
    }
  }, [postApi])

  const acceptInvite = (token) => {
    dispatch(acceptCompanyinvite({ token: token }));
  };

  const rejectInvite = (inviteId) => {
    dispatch(deleteInvite(inviteId));
  };

  useEffect(() => {
    
    if (memberstate.invite) {
      handleInvitationList();
    }
  }, [memberstate]);

  useEffect(() => {
    handleInvitationList()
    handlePosts()
  },[ ])

  const handleLike = async (postId) => {
    try {
      dispatch(likePost(postId));
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };
  
  

  
  return (
    <>
      <div className={isActive === 1 ? 'show--details team--page dashboard--page' : isActive === 2 ? ' view--project team--page dashboard--page' : 'team--page dashboard--page'}>
        <div className='page--title px-md-2 py-3 bg-white border-bottom'>
          <Container fluid>
              <Row>
                  <Col sm={12} lg={12}>
                      <h2>
                          <span className="open--sidebar" onClick={() => {handleSidebarSmall(false);setIsActive(0);}}><FiSidebar /></span>
                          Dashboard
                          <ListGroup horizontal className={isActive !== 0 ? 'd-none' : 'ms-auto d-none d-lg-flex'}>
                              <ListGroup horizontal className="bg-white expand--icon ms-3">
                                  <ListGroup.Item onClick={() => {handleSidebarSmall(false);}}><GrExpand /></ListGroup.Item>
                              </ListGroup>
                          </ListGroup>
                      </h2>
                  </Col>
              </Row>
          </Container>
        </div>
        <div className='page--wrapper p-md-3 py-3 pt-5 mt-3 text-center'>
          <Container fluid>
            <Row className="justify-content-center">
              <Col sm={12}>
                <DateTimeCard />
              </Col>
              <Col lg={8}>
                <ListGroup className="invitation--list">
                  {invitationsFeeds && invitationsFeeds.length > 0 &&
                        invitationsFeeds.map((invitation, index) => {
                          return (
                            <>
                            <ListGroup.Item>
                                <p className="mb-0">You got an invitation from <strong>{invitation.company?.name}</strong> to join their team as a &nbsp;<strong>{invitation.role?.name?.replace(/\b\w/g,
                                  function (char) {
                                    return char.toUpperCase();
                                  }
                                )}
                                </strong></p>
                                <div className="ms-lg-auto mt-3 mt-lg-0">
                                  <Button onClick={() => rejectInvite(invitation._id)} className="me-2" variant="outline-primary">
                                  Decline
                                  </Button>
                                  <Button onClick={() => acceptInvite(invitation.inviteToken)} variant="primary">
                                    Accept
                                  </Button>
                                </div>
                            </ListGroup.Item>
                        </>
                          )
                    })
                  }
                </ListGroup>
                <Card className="daily--star">
                  <div className="card--icon">
                    <div className="star--icon"><FaRegStar color="white" /></div>
                    <h6 className="mb-0">Daily Inspiration</h6>
                  </div>
                  <blockquote className="blockquote mb-0">
                    <p>"Success is not final, failure is not fatal: it is the courage to continue that counts."</p>
                    <p><strong>- Winston Churchill</strong></p>
                  </blockquote>
                </Card>

                <Card className="p-4 border-0 rounded-4 team--updates">
                  <Row className="align-items-center mb-4">
                    <Col xs="auto">
                      <div className="team--chat p-2 rounded d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                        <BsChat color="white" />
                      </div>
                    </Col>
                    <Col>
                      <h5 className="mb-0 d-flex align-items-center justify-content-between">Team Updates <Button onClick={handleShow} variant="primary">Create Update</Button></h5>
                    </Col>
                  </Row>

                  {
                  (!posts || posts.length === 0) ?
                    <div className="text-center text-muted py-5">
                      <p>No team updates yet.</p>
                    </div>

                  :
                  posts.map((post) => (
                    <Card key={post._id} className="mb-4 p-3 rounded-4 inner--card">
                      <Row className="mb-2">
                        <Col xs="auto">
                          <Image
                            src={post.author?.avatar || '/images/default.jpg'}
                            roundedCircle
                            width={40}
                            height={40}
                          />
                        </Col>
                        <Col>
                          <strong>{post.author?.name || 'Unknown'}</strong>{' '}
                          <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                            • {dayjs(post.createdAt).fromNow()}
                          </span>

                          <div className="mt-3">
                            {/* Text Post */}
                            {post.post_type === 'text' && (
                              <>
                                {post.title && <h5>{post.title}</h5>}
                                <p>{post.content}</p>
                              </>
                            )}

                            {/* Image Post */}
                            {post.post_type === 'image' && (
                              <>
                                {post.caption && <p>{post.caption}</p>}
                                {Array.isArray(post.files) &&
                                  post.files.map((img, i) => (
                                    <Image
                                      key={i}
                                      src={img.url}
                                      alt={img.file_name}
                                      fluid
                                      className="rounded"
                                    />
                                  ))}
                              </>
                            )}

                            {/* Quote Post */}
                            {post.post_type === 'quote' && (
                              <blockquote className="blockquote p-3 rounded mt-3">
                                <LuQuote className="me-2" />
                                <p className="mb-0" style={{ fontStyle: 'italic' }}>
                                {post.content}
                                </p>
                                {post?.quoteAuthor && (
                                  <p><strong>- {post.quoteAuthor}</strong></p>
                                )}
                              </blockquote>
                            )}

                            {/* Video Post */}
                            {post.post_type === 'video' && (
                              <>
                                {post.videoType === 'youtube' && (
                                  <div className="ratio ratio-16x9">
                                    <iframe
                                      src={post.content}
                                      title="YouTube Video"
                                      allowFullScreen
                                    ></iframe>
                                  </div>
                                )}
                                {post.videoType === 'vimeo' && (
                                  <div className="ratio ratio-16x9">
                                    <iframe
                                      src={post.content}
                                      title="Vimeo Video"
                                      allowFullScreen
                                    ></iframe>
                                  </div>
                                )}
                                {post.videoType === 'upload' && Array.isArray(post.files) && (
                                  post.files.map((vid, i) => (
                                    <video
                                      key={i}
                                      controls
                                      className="mb-2 rounded w-100"
                                      style={{ maxHeight: 400 }}
                                    >
                                      <source src={vid.url} type="video/mp4" />
                                      Your browser does not support the video tag.
                                    </video>
                                  ))
                                )}
                                {post.description && <p>{post.description}</p>}
                              </>
                            )}
                          </div>

                          {/* Likes / Comments */}
                          <div className="d-flex gap-3 text-muted mt-3 align-items-center">
                            <span>
                              <BsHeart onClick={() => handleLike(post._id)} className="me-1" />{' '}
                              {post.likes?.length || 0}
                            </span>
                            <span>
                              <BsChat className="me-1" /> 0
                            </span>
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  ))}


                </Card> 
              </Col>
              <Col lg={4}>
                  <div className="download--wrapper">
                    <div className="app--title">
                      <div className="image--title">
                        <span><BsClock /></span>
                        <h3>OnTeams.ai Time Tracker <small>Professional Edition</small></h3>
                      </div>
                      <p className="heading--text">Experience the future of productivity with our advanced desktop application. Track time seamlessly, monitor team performance, and collaborate in real-time with enterprise-grade security and beautiful analytics.</p>
                      <CardGroup>
                        <Card className="track--features">
                          <CardTitle>
                            <span><HiOutlineLightningBolt /></span>Fast
                          </CardTitle>
                        </Card>
                        <Card className="track--features Enterprise">
                          <CardTitle>
                            <span><FiShield /></span>Secure
                          </CardTitle>
                        </Card>
                        <Card className="track--features global">
                          <CardTitle>
                            <span><FiGlobe /></span>Global Sync
                          </CardTitle>
                        </Card>
                        <Card className="track--features rating">
                          <CardTitle>
                            <span><FiGlobe /></span>4.7 Rating
                          </CardTitle>
                        </Card>
                      </CardGroup>
                    </div>
                    
                    <CardGroup className="card--download">
                      <Card className="win--download app--download">
                        <Card.Link href='/downloads/onteams-win32-ia32.zip' download>
                          <CardTitle>
                            <span><FaDesktop /></span>
                            <h4>Download for Windows <small>Windows 10 or later • 64-bit • Intel & AMD</small></h4>
                          </CardTitle>
                          <CardBody><FiDownload /></CardBody>
                        </Card.Link>
                      </Card>
                      <Card className="mac--download app--download" href='/downloads/onteams-darwin-x64.zip' download>
                        <Card.Link href='/downloads/onteams-win32-ia32.zip' download>
                          <CardTitle>
                            <span><MdLaptopMac /></span>
                            <h4>Download for macOS <small>macOS 11 or later • Intel & Apple Silicon</small></h4>
                          </CardTitle>
                          <CardBody><FiDownload /></CardBody>
                        </Card.Link>
                      </Card>
                    </CardGroup>
                    {/* <div className="latest--version">
                      <Container>
                        <Card className="mb-3 version--card">
                          <Card.Body className="p-2">
                            <Row>
                              <Col>
                                <h5 className="mb-1 fw-bold d-flex align-items-center gap-2"><FaDotCircle className="text-success" /> Latest Version</h5>
                                <div className="text-muted">Released: Jan 15, 2024</div>
                                <div className="mt-2">
                                  {[...Array(5)].map((_, i) => (
                                    <FaStar key={i} color="gold" />
                                  ))}
                                  <span className="ms-2 fw-bold">4.9/5</span>
                                  <span className="text-muted fw-bold"> (2.1k reviews)</span>
                                </div>
                              </Col>
                              <Col xs="auto" className="text-end">
                                <div className="fw-bold fs-5">v2.1.0</div>
                                <div className="text-muted">Size: 45.2 MB</div>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>

                        <Card className="new--card">
                          <Card.Body className="p-2">
                            <h5 className="fw-bold mb-3"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles w-4 h-4"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg> What's New</h5>
                            <ListGroup variant="flush">
                              <ListGroup.Item className="border-0 ps-0">
                                • Enhanced screenshot quality
                              </ListGroup.Item>
                              <ListGroup.Item className="border-0 ps-0">
                                • Improved offline sync
                              </ListGroup.Item>
                              <ListGroup.Item className="border-0 ps-0">
                                • New productivity insights
                              </ListGroup.Item>
                            </ListGroup>
                          </Card.Body>
                        </Card>
                      </Container>
                    </div> */}
                  </div>
                  <div className="download--wrapper mt-5">
                    <div className="image--title help--card">
                      <span><FaRegQuestionCircle /></span>
                      <h3>Need Support? <small>We're here to help you</small></h3>
                    </div>
                    <div className="latest--version">
                      <Container>
                        <Card className="new--card">
                          <Card.Body className="p-2">
                            <h5 className="fw-bold mb-3"><FaRegEnvelope /> Email Support</h5>
                            <ListGroup variant="flush">
                              <ListGroup.Item className="border-0 ps-0">Get help via email within 24 hours</ListGroup.Item>
                              <ListGroup.Item className="border-0 ps-0"><strong><a href="mailto:support@onteams.ai">support@onteams.ai</a></strong></ListGroup.Item>
                            </ListGroup>
                          </Card.Body>
                        </Card>
                        <Button variant="primary" className="w-100 my-3"><MdOutlineChatBubbleOutline /> Start Live Chat</Button>
                        <p>Average response time: <strong>2 minutes</strong></p>
                      </Container>
                    </div>
                  </div>
                  {/* <div className="download--wrapper mt-5 mb-5">
                    <div className="help--card today--card">
                      <span><FaRegEye /></span>
                      <h3>Today's Overview <small>Quick insights</small></h3>
                    </div>
                    <div className="latest--version">
                      <Container>
                        <Card className="overview--card">
                          <Card.Body className="p-2">
                            <ListGroup variant="flush">
                              <ListGroup.Item className="from--blue">Active Projects<strong>8</strong></ListGroup.Item>
                              <ListGroup.Item className="from--green">Team Members Online<strong>12/15</strong></ListGroup.Item>
                              <ListGroup.Item className="from--slate">Hours Tracked Today<strong>94.5h</strong></ListGroup.Item>
                              <ListGroup.Item className="from--orange">Completed Tasks<strong>23</strong></ListGroup.Item>
                            </ListGroup>
                          </Card.Body>
                        </Card>
                      </Container>
                    </div>
                  </div> */}
              </Col>
            </Row>
          </Container>
        </div>
      </div>

      <Modal show={show} onHide={handleClose} centered size="lg" className="theme--modal">
        <Modal.Header closeButton className="py-3">
           <Modal.Title>
              <span className="nav--item--icon"><FiSend /></span>
              <strong>Share Team Update <small>Share your progress, thoughts, or inspiration</small></strong>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Tabs defaultActiveKey="text" id="icon-tabs" activeKey={fields?.type}
          onSelect={(k) => handletypeChange(k)}>
            <Tab eventKey="text" title={<span><FaRegFileAlt /> Text</span>}>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Title (Optional)</Form.Label>
                  <Form.Control type="text" placeholder="Add a title to your post..." name="title" value={fields?.title} onChange={handleTextChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Content *</Form.Label>
                  <Form.Control required as="textarea" placeholder="What's happening with you work? Share updates, achievements, or insights..." rows={5} name="content" value={fields?.content} onChange={handleTextChange} />
                </Form.Group>
              </Form>
            </Tab>
            <Tab eventKey="quote"  title={<span><FaQuoteRight /> Quote</span>}>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Add a Quote</Form.Label>
                  <Form.Control as="textarea" placeholder="Share an inspiring quote or meaningful message..." rows={5} name="quote" value={fields?.quote} onChange={handleTextChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Author (Optional)</Form.Label>
                  <Form.Control type="text" placeholder="Quote author..." name="quoteAuthor" value={fields?.quoteAuthor} onChange={handleTextChange} />
                </Form.Group>
              </Form>
            </Tab>
            <Tab eventKey="image" title={<span><FaImage /> Image</span>}>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Upload Image *</Form.Label>
                  <label for="imageUpload" className="update--file--upload" onChange={handleFileChange} accept="image/*" >
                    <Form.Control type="file" multiple id="imageUpload" hidden />
                    <span><FiUpload /> Click to upload an image <small>PNG, JPG, GIF up to 10MB</small></span>
                  </label>
                  <div className="mt-3 d-flex flex-wrap gap-3">
                  {fields?.files?.map((file, idx) => (
                    <div key={idx} className="position-relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        width="100"
                        height="100"
                        style={{ objectFit: 'cover', borderRadius: 8 }}
                      />
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => removeFile(idx)}
                        className="position-absolute top-0 end-0 p-1"
                      >
                        <FiX size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Caption</Form.Label>
                  <Form.Control as="textarea" placeholder="Add a caption to your image..." rows={5} value={fields?.caption} name="caption" onChange={handleTextChange} />
                </Form.Group>
              </Form>
            </Tab>
            <Tab eventKey="video"  title={<span><LuVideo /> Video</span>}>
              <Form>
                <Form.Label>Video Type</Form.Label>
                <Tabs defaultActiveKey="youtube" id="video--type" activeKey={fields?.videoType}
                  onSelect={(k) => handlevideoTypeChange(k)}>
                  <Tab eventKey="youtube" title={<span><FiYoutube /> Youtube</span>}>
                    <Form.Group className="mb-3">
                        <Form.Label>YouTube URL *</Form.Label>
                        <Form.Control type="url" placeholder="https://www.youtube.com/watch?v=..." value={fields?.youtubeUrl} name="youtubeUrl" onChange={handleTextChange}  />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control as="textarea" name="description" value={fields?.description} onChange={handleTextChange} placeholder="Why are you sharing this video?" rows={5} />
                      </Form.Group>
                  </Tab>
                  <Tab eventKey="vimeo" title={<span><LuVideo /> Vimeo</span>}>
                    <Form.Group className="mb-3">
                      <Form.Label>Vimeo URL *</Form.Label>
                      <Form.Control type="url" placeholder="https://vimeo.com/..." value={fields?.vimeoUrl} name="vimeoUrl" onChange={handleTextChange}  />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control as="textarea" name="description" value={fields?.description} onChange={handleTextChange} placeholder="Why are you sharing this video?" rows={5} />
                    </Form.Group>
                  </Tab>
                  <Tab eventKey="upload" title={<span><FiUpload /> Upload</span>}>
                      <Form.Group className="mb-3">
                        <Form.Label>Upload Video *</Form.Label>
                        <label for="videoUpload" className="update--file--upload">
                          <Form.Control type="file" id="videoUpload" hidden accept="video/mp4"  onChange={handleFileChange} />
                          <span><FiUpload /> Click to upload a video <small>MP4, MOV, AVI up to 100MB</small></span>
                        </label>
                        <div className="mt-3">
                          {fields?.files?.map((file, idx) => (
                            <div key={idx} className="d-flex align-items-center justify-content-between mb-2">
                              <div><strong>{file.name}</strong> – {(file.size / 1024 / 1024).toFixed(2)} MB</div>
                              <Button size="sm" variant="outline-danger" onClick={() => removeFile(idx)} ><FiX /></Button>
                            </div>
                          ))}
                        </div>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control as="textarea" name="description" value={fields?.description} onChange={handleTextChange} placeholder="Why are you sharing this video?" rows={5} />
                      </Form.Group>
                  </Tab>
                </Tabs>
              </Form>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}><FiSend /> { loading ? 'Sharing...' : 'Share Update '}</Button>
          <p>{error}</p>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default DashboardPage;