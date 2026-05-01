const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const toIsoStringFromUnix = (value) => new Date(Number(value) * 1000).toISOString();

const toUnixSeconds = (value) => Math.floor(new Date(value).getTime() / 1000);

const requireId = (value, label) => {
  const normalized = Number(value);
  if (!normalized) {
    throw new Error(`${label} is required`);
  }
  return normalized;
};

export const normalizeTrainerSession = (session) => ({
  id: `trainer-${session.id}`,
  sessionId: session.id,
  title: session.title || 'Availability Hold',
  description: session.description || '',
  start: toIsoStringFromUnix(session.startTime),
  end: toIsoStringFromUnix(session.endTime),
  trainerId: session.trainerId,
  coachLabel: 'Trainer',
  coachName: `Trainer #${session.trainerId}`,
  location: session.location || '',
  status: session.status === 'cancelled' ? 'Cancelled' : 'Confirmed',
});

export const normalizeAvailableTrainerSession = (session) => ({
  id: `available-${session.sessionId}`,
  sessionId: session.sessionId,
  title: session.title || 'Open Training Slot',
  description: session.description || '',
  start: toIsoStringFromUnix(session.startTime),
  end: toIsoStringFromUnix(session.endTime),
  trainerId: session.trainerId,
  coachLabel: 'Trainer',
  coachName: `Trainer #${session.trainerId}`,
  location: session.location || '',
  status: 'Available',
});

export const normalizeClientSession = (session) => ({
  id: `booking-${session.bookingId}`,
  sessionId: session.sessionId,
  bookingId: session.bookingId,
  title: session.title || 'Booked Session',
  description: session.description || '',
  start: toIsoStringFromUnix(session.startTime),
  end: toIsoStringFromUnix(session.endTime),
  trainerId: session.trainerId,
  coachLabel: 'Trainer',
  coachName: `Trainer #${session.trainerId}`,
  location: session.location || '',
  status: session.status === 'cancelled' ? 'Cancelled' : 'Confirmed',
});

export const fetchTrainerSessions = async (trainerId) => {
  const normalizedTrainerId = requireId(trainerId, 'trainerId');
  const response = await fetch(`${API_BASE_URL}/api/trainer-sessions?trainerId=${normalizedTrainerId}`);
  if (!response.ok) {
    throw new Error('Unable to load trainer sessions');
  }

  const rows = await response.json();
  return Array.isArray(rows) ? rows.map(normalizeTrainerSession) : [];
};

export const fetchAvailableTrainerSessions = async (trainerId) => {
  const query = trainerId ? `?trainerId=${trainerId}` : '';
  const response = await fetch(`${API_BASE_URL}/api/trainer-sessions/available${query}`);
  if (!response.ok) {
    throw new Error('Unable to load trainer availability');
  }

  const rows = await response.json();
  return Array.isArray(rows) ? rows.map(normalizeAvailableTrainerSession) : [];
};

export const fetchClientSessions = async (clientId) => {
  const normalizedClientId = requireId(clientId, 'clientId');
  const response = await fetch(`${API_BASE_URL}/api/client-sessions?clientId=${normalizedClientId}`);
  if (!response.ok) {
    throw new Error('Unable to load booked sessions');
  }

  const rows = await response.json();
  return Array.isArray(rows) ? rows.map(normalizeClientSession) : [];
};

export const createTrainerSession = async ({
  start,
  end,
  trainerId,
  title = 'Availability Hold',
  description = '',
  location = '',
}) => {
  const response = await fetch(`${API_BASE_URL}/api/trainer-sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startTime: toUnixSeconds(start),
      endTime: toUnixSeconds(end),
      trainerId: requireId(trainerId, 'trainerId'),
      title,
      description,
      location,
      status: 'active',
    }),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message || 'Unable to create trainer session');
  }

  return normalizeTrainerSession(body);
};

export const updateTrainerSession = async ({
  sessionId,
  start,
  end,
  trainerId,
  title = 'Availability Hold',
  description = '',
  location = '',
  status = 'active',
}) => {
  const response = await fetch(`${API_BASE_URL}/api/trainer-sessions/${sessionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startTime: toUnixSeconds(start),
      endTime: toUnixSeconds(end),
      trainerId: requireId(trainerId, 'trainerId'),
      title,
      description,
      location,
      status,
    }),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message || 'Unable to update trainer session');
  }

  return normalizeTrainerSession(body);
};

export const cancelTrainerSession = async (sessionId) => {
  const response = await fetch(`${API_BASE_URL}/api/trainer-sessions/${sessionId}/cancel`, {
    method: 'POST',
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message || 'Unable to cancel trainer session');
  }

  return normalizeTrainerSession(body);
};

export const createClientSessionBooking = async ({ sessionId, clientId }) => {
  const response = await fetch(`${API_BASE_URL}/api/client-sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      clientId: requireId(clientId, 'clientId'),
    }),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message || 'Unable to book trainer session');
  }

  return normalizeClientSession(body);
};
