import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

export default function ActivityRequests() {
  const { id } = useParams(); // activity id
  const [requests, setRequests] = useState([]);
  const [activity, setActivity] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const [rRes, aRes] = await Promise.all([
        api.get(`/events/${id}/requests`),
        api.get(`/events/${id}`)
      ]);
      setRequests(rRes.data);
      setActivity(aRes.data);
    } catch (err) {
      toast.error('Unable to load requests');
    }
  };

  useEffect(() => { load(); }, [id]);

  const approve = async (reqId) => {
    try {
      await api.post(`/events/requests/${reqId}/approve`);
      toast.success('Approved');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approve failed');
    }
  };

  const reject = async (reqId) => {
    try {
      await api.post(`/events/requests/${reqId}/reject`, { note: 'Rejected by teacher' });
      toast.success('Rejected');
      load();
    } catch (err) {
      toast.error('Reject failed');
    }
  };

  if (!activity) return <p>Loading...</p>;

  return (
    <div className="dashboard">
      <Toaster />
      <h2>Requests for: {activity.title}</h2>
      <button onClick={() => navigate(-1)}>Back</button>
      {requests.length === 0 && <p>No requests</p>}
      <ul>
        {requests.map(r => (
          <li key={r._id} className="event">
            <p><strong>{r.student.name}</strong> — {r.student.email}</p>
            <p>Requested at: {new Date(r.requestedAt).toLocaleString()}</p>
            <p>Status: {r.status}</p>
            {r.status === 'pending' && (
              <>
                <button onClick={() => approve(r._id)}>Approve</button>
                <button onClick={() => reject(r._id)}>Reject</button>
              </>
            )}
            {r.status !== 'pending' && <p>Responded at: {r.respondedAt ? new Date(r.respondedAt).toLocaleString() : '—'}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}