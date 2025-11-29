import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { storage } from '../services/storage';
import './EventDetails.css';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ev, setEv] = useState(null);
  const [myRequest, setMyRequest] = useState(null);
  const [requests, setRequests] = useState([]);
  const user = storage.getCurrentUser();

  const load = async () => {
    const e = await storage.getEvent(id);
    setEv(e);
    const myReqs = await storage.getMyRequests(user.id);
    setMyRequest(myReqs.find(r => r.activity === id) || null);
    
    if (user.role === 'teacher' && e.createdBy === user.id) {
      const reqs = await storage.getRequestsForActivity(id);
      setRequests(reqs);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (!ev) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading event details...</p>
    </div>
  );

  const isParticipant = ev.attendees.includes(user.id);
  const isCreator = user.role === 'teacher' && ev.createdBy === user.id;
  const spotsLeft = ev.maxAttendees > 0 ? ev.maxAttendees - ev.attendees.length : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;
  const eventDate = new Date(ev.date);
  const isPastEvent = eventDate < new Date();
  const users = JSON.parse(localStorage.getItem('seam_users') || '[]');
  const creator = users.find(u => u.id === ev.createdBy);

  return (
    <div className="event-details-page">
      <button className="btn-back" onClick={() => navigate(-1)}>
        <span className="material-symbols-outlined">arrow_back</span>
        Back
      </button>

      <div className="event-details-header">
        {ev.imageUrl && (
          <div className="event-banner">
            <img src={ev.imageUrl} alt={ev.title} onError={(e) => e.target.style.display = 'none'} />
            {ev.completed && <div className="event-status-badge completed">Completed</div>}
            {isFull && !ev.completed && <div className="event-status-badge full">Full</div>}
            {isPastEvent && !ev.completed && <div className="event-status-badge past">Past Event</div>}
          </div>
        )}
        
        <div className="event-header-content">
          <div className="event-title-section">
            <h1 className="event-detail-title">{ev.title}</h1>
            {ev.category && (
              <span className="category-badge">{ev.category}</span>
            )}
          </div>
          
          <div className="event-meta-grid">
            <div className="meta-item">
              <span className="material-symbols-outlined">schedule</span>
              <div>
                <div className="meta-label">Date & Time</div>
                <div className="meta-value">{eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <div className="meta-subvalue">{eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>

            <div className="meta-item">
              <span className="material-symbols-outlined">location_on</span>
              <div>
                <div className="meta-label">Location</div>
                <div className="meta-value">{ev.location || 'Not specified'}</div>
              </div>
            </div>

            <div className="meta-item">
              <span className="material-symbols-outlined">group</span>
              <div>
                <div className="meta-label">Attendees</div>
                <div className="meta-value">
                  {ev.attendees.length} {ev.maxAttendees > 0 ? `/ ${ev.maxAttendees}` : 'registered'}
                </div>
                {spotsLeft !== null && spotsLeft > 0 && (
                  <div className="meta-subvalue spots-left">{spotsLeft} spots left</div>
                )}
              </div>
            </div>

            {creator && (
              <div className="meta-item">
                <span className="material-symbols-outlined">person</span>
                <div>
                  <div className="meta-label">Organizer</div>
                  <div className="meta-value">{creator.name}</div>
                  <div className="meta-subvalue">{creator.email}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="event-details-body">
        <div className="event-section">
          <h3 className="section-title">
            <span className="material-symbols-outlined">description</span>
            About This Event
          </h3>
          <p className="event-description">{ev.description || 'No description provided.'}</p>
        </div>

        {ev.tags && ev.tags.length > 0 && (
          <div className="event-section">
            <h3 className="section-title">
              <span className="material-symbols-outlined">label</span>
              Tags
            </h3>
            <div className="tags-container">
              {ev.tags.map((tag, i) => (
                <span key={i} className="event-tag">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {user.role === 'student' && (
          <div className="event-section student-action-section">
            {isParticipant ? (
              <div className="participant-badge">
                <div>
                  <strong>You're registered!</strong>
                  <p>You are confirmed as a participant for this event.</p>
                </div>
              </div>
            ) : myRequest ? (
              <div className={`request-status-card ${myRequest.status}`}>
                <span className="material-symbols-outlined">
                  {myRequest.status === 'pending' ? 'pending' : myRequest.status === 'approved' ? 'check' : 'cancel'}
                </span>
                <div>
                  <strong>Request Status: {myRequest.status.toUpperCase()}</strong>
                  <p>Submitted on {new Date(myRequest.requestedAt).toLocaleDateString()}</p>
                  {myRequest.note && <p className="request-note">Note: {myRequest.note}</p>}
                </div>
              </div>
            ) : (
              <button 
                className="btn btn-join" 
                onClick={async () => {
                  try {
                    await storage.createRequest(id, user.id);
                    toast.success('Request sent successfully!');
                    load();
                  } catch (err) { 
                    toast.error(err.message); 
                  }
                }}
                disabled={isFull || isPastEvent || !ev.allowRequests}
              >
                <span className="material-symbols-outlined">person_add</span>
                {isFull ? 'Event Full' : isPastEvent ? 'Event Passed' : !ev.allowRequests ? 'Requests Closed' : 'Request to Join'}
              </button>
            )}
          </div>
        )}

        {isCreator && (
          <>
            <div className="event-section">
              <div className="section-header">
                <h3 className="section-title">
                  <span className="material-symbols-outlined">groups</span>
                  Participants ({ev.attendees.length})
                </h3>
                <button className="btn-small" onClick={() => navigate(`/events/${id}/edit`)}>
                  <span className="material-symbols-outlined">edit</span>
                  Edit Event
                </button>
              </div>
              
              {ev.attendees.length === 0 ? (
                <div className="empty-state">
                  <span className="material-symbols-outlined">person_off</span>
                  <p>No participants yet</p>
                </div>
              ) : (
                <div className="participants-grid">
                  {ev.attendees.map(aId => {
                    const u = users.find(u => u.id === aId);
                    return (
                      <div key={aId} className="participant-card">
                        <span className="material-symbols-outlined">account_circle</span>
                        <div className="participant-info">
                          <div className="participant-name">{u ? u.name : 'Unknown User'}</div>
                          <div className="participant-email">{u ? u.email : aId}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {ev.allowRequests && (
              <div className="event-section">
                <h3 className="section-title">
                  <span className="material-symbols-outlined">mail</span>
                  Join Requests ({requests.filter(r => r.status === 'pending').length} pending)
                </h3>
                
                {requests.length === 0 ? (
                  <div className="empty-state">
                    <span className="material-symbols-outlined">inbox</span>
                    <p>No join requests</p>
                  </div>
                ) : (
                  <div className="requests-list">
                    {requests.map(req => {
                      const student = users.find(u => u.id === req.student);
                      return (
                        <div key={req.id} className={`request-card ${req.status}`}>
                          <div className="request-header">
                            <div className="request-student">
                              <span className="material-symbols-outlined">person</span>
                              <div>
                                <div className="student-name">{student ? student.name : 'Unknown'}</div>
                                <div className="student-email">{student ? student.email : req.student}</div>
                              </div>
                            </div>
                            <span className={`status-badge ${req.status}`}>{req.status}</span>
                          </div>
                          
                          <div className="request-meta">
                            <span className="material-symbols-outlined">schedule</span>
                            Requested: {new Date(req.requestedAt).toLocaleDateString()}
                          </div>

                          {req.status === 'pending' && (
                            <div className="request-actions">
                              <button 
                                className="btn btn-approve"
                                onClick={async () => {
                                  try {
                                    await storage.approveRequest(req.id, user.id);
                                    toast.success('Request approved!');
                                    load();
                                  } catch (err) {
                                    toast.error(err.message);
                                  }
                                }}
                              >
                                <span className="material-symbols-outlined">check</span>
                                Approve
                              </button>
                              <button 
                                className="btn btn-reject"
                                onClick={async () => {
                                  try {
                                    await storage.rejectRequest(req.id, user.id, 'Declined by organizer');
                                    toast.success('Request rejected');
                                    load();
                                  } catch (err) {
                                    toast.error(err.message);
                                  }
                                }}
                              >
                                <span className="material-symbols-outlined">close</span>
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}