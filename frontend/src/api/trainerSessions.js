const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export const DEFAULT_TRAINER_ID = 1;

const toIsoStringFromUnix = (value) => new Date(Number(value) * 1000).toISOString();

const toUnixSeconds = (value) => Math.floor(new Date(value).getTime() / 1000);

export const normalizeTrainerSession = (session) => ({
  id: `trainer-${session.id}`,
  title: 'Availability Hold',
  start: toIsoStringFromUnix(session.startTime),
  end: toIsoStringFromUnix(session.endTime),
  trainerId: session.trainerId,
  coachLabel: 'Trainer',
  coachName: `Trainer #${session.trainerId}`,
  location: 'Trainer schedule',
  status: 'Confirmed',
});

export const fetchTrainerSessions = async (trainerId = DEFAULT_TRAINER_ID) => {
  const response = await fetch(`${API_BASE_URL}/api/trainer-sessions?trainerId=${trainerId}`);
  if (!response.ok) {
    throw new Error('Unable to load trainer sessions');
  }

  const rows = await response.json();
  return Array.isArray(rows) ? rows.map(normalizeTrainerSession) : [];
};

export const createTrainerSession = async ({ start, end, trainerId = DEFAULT_TRAINER_ID }) => {
  const response = await fetch(`${API_BASE_URL}/api/trainer-sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startTime: toUnixSeconds(start),
      endTime: toUnixSeconds(end),
      trainerId,
    }),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message || 'Unable to create trainer session');
  }

  return normalizeTrainerSession(body);
};
