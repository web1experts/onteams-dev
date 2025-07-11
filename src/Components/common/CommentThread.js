// CommentThread.js
import React, {useState} from 'react';
import { Card, Button, Form, ButtonGroup } from 'react-bootstrap';
import { getMemberdata } from '../../helpers/commonfunctions';
import { socket, SendComment, DeleteComment, UpdateComment } from '../../helpers/auth';
const Comment = ({ comment, memberdata, parentId }) => {
   
  return (              
    <Card className="mb-2">
        <Card.Body>
            <Card.Title>{comment.author?.name}</Card.Title>
            <Card.Text>{comment.text}</Card.Text>
            
        </Card.Body>
    </Card>
  );
};

const CommentThread = ({ comments, post, toggle }) => {
const memberdata = getMemberdata()
const [comment, setComment] = useState('')
 const postComment = () => {
    SendComment('post',comment, post, memberdata?._id);
    setComment('');
  }

  return (
    <div>
        {comments?.length > 0 &&
            <div className="bg-light p-3 rounded-4 mt-3 d-flex flex-column align-items-start gap-3 border-light">
            {comments.map(comment => (
                <Comment key={comment._id} comment={comment} memberdata={memberdata} />
            ))}
            </div>
        }
      <div className="bg-light p-3 rounded-4 mt-3 d-flex flex-column align-items-end gap-3 border-light">
        <textarea
            className="form-control"
            placeholder="Write a comment..."
            rows={3}
            value={comment || ''}
            onChange={(e) => {
            setComment( e.target.value)
            }}
        />
        <ButtonGroup>
            <Button variant="primary" className='mr-2' onClick={() => toggle(false)}>Cancel</Button>
            <Button variant="primary" onClick={postComment}>Post</Button>
        </ButtonGroup>
        </div>
    </div>
  );
};

export default CommentThread;
