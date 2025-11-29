import React, { useEffect, useState } from 'react';
import { storage } from '../services/storage';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Requests() {
  const user = storage.getCurrentUser();
  const [requests, setRequests] = useState([]);
  const [activities, setActivities] = useState([]);
  const navigate = useNavigate();

  const load = async () => {
    const evs = await storage.getEvents();
    setActivities(evs);
    // gather requests for activities this teacher created
    const allReqs = [];
    for (const ev of evs.filter(e => e.createdBy === user.id)) {
      const r = await storage.getRequestsForActivity(ev.id);
      allReqs.push(...r.map(x => ({ ...x, activityTitle: ev.title })));
    }
    setRequests(allReqs);
  };

  useEffect(() => { load(); }, []);

  const approve = async (reqId) => {
    try {
      await storage.approveRequest(reqId, user.id);
      toast.success('Approved');
      load();
    } catch (err) { toast.error(err.message); }
  };

  const reject = async (reqId) => {
    try {
      await storage.rejectRequest(reqId, user.id, 'Not approved');
      toast.success('Rejected');
      load();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="dashboard">
      <h2>Join Requests</h2>
      <button className="btn btn-ghost" onClick={() => navigate(-1)}>Back</button>
      {requests.length === 0 && <p className="muted">No requests</p>}
      <ul className="events-list">
        {requests.map(r => {
          const users = JSON.parse(localStorage.getItem('seam_users') || '[]');
          const student = users.find(u => u.id === r.student);
          return (
            <li key={r.id} className="event">
              <div>
                <strong>{student ? student.name : r.student}</strong> • {student ? student.email : ''}
                <div className="muted small">For: {r.activityTitle} • Requested: {new Date(r.requestedAt).toLocaleString()}</div>
                <div>Status: {r.status}</div>
                {r.status === 'pending' && (
                  <div className="actions">
                    <button className="btn" onClick={() => approve(r.id)}>Approve</button>
                    <button className="btn btn-ghost" onClick={() => reject(r.id)}>Reject</button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}