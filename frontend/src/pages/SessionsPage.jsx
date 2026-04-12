import React, { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Badge, Button, Card, Flex, Heading, Text, TextArea, TextField } from '@radix-ui/themes';
import { useRole } from '../auth/RoleContext';
import {
  cancelTrainerSession,
  createTrainerSession,
  DEFAULT_TRAINER_ID,
  fetchClientSessions,
  fetchTrainerSessions,
  updateTrainerSession,
} from '../api/trainerSessions';

const toApiStatus = (status) => (status === 'Cancelled' ? 'cancelled' : 'active');

const buildSelectedEvent = (event) => ({
  id: event.id,
  title: event.title,
  description: event.extendedProps.description || '',
  start: event.startStr,
  end: event.endStr || '',
  trainer: event.extendedProps.trainer || event.extendedProps.coachName,
  sessionId: event.extendedProps.sessionId ?? event.id.replace(/^trainer-/, ''),
  trainerId: event.extendedProps.trainerId,
  location: event.extendedProps.location,
  status: event.extendedProps.status,
});

const SessionsPage = () => {
  const { role } = useRole();
  const [trainerEvents, setTrainerEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const title = role === 'trainer' ? 'Schedule' : 'My Sessions';
  const subtitle =
    role === 'trainer'
      ? 'Manage availability, update session details, and cancel sessions from your calendar.'
      : 'See your booked sessions, including trainer titles and descriptions, in calendar view.';

  useEffect(() => {
    let isMounted = true;
    const loadEvents = role === 'trainer' ? fetchTrainerSessions : fetchClientSessions;

    loadEvents()
      .then((rows) => {
        if (!isMounted) return;
        setTrainerEvents(rows.map((event) => ({ ...event, trainer: event.coachName })));
        setStatusMessage('');
      })
      .catch((error) => {
        if (!isMounted) return;
        setTrainerEvents([]);
        setStatusMessage(error.message);
      });

    return () => {
      isMounted = false;
    };
  }, [role]);

  useEffect(() => {
    setFormTitle(selectedEvent?.title || '');
    setFormDescription(selectedEvent?.description || '');
  }, [selectedEvent]);

  const events = useMemo(
    () =>
      trainerEvents.map((event) => ({
        ...event,
        classNames: [`fc-status-${String(event.status || '').toLowerCase()}`],
      })),
    [trainerEvents],
  );

  const todayCount = events.filter((event) => event.start.startsWith('2026-03-23')).length;

  const addTrainerDraftSession = (selection) => {
    if (role !== 'trainer') return;

    const draftEvent = {
      id: `draft-${selection.startStr}`,
      title: 'Availability Hold',
      description: '',
      start: selection.startStr,
      end: selection.endStr || selection.startStr,
      trainerId: DEFAULT_TRAINER_ID,
      trainer: `Trainer #${DEFAULT_TRAINER_ID}`,
      location: 'Trainer schedule',
      status: 'Pending',
    };

    setTrainerEvents((currentEvents) => [
      ...currentEvents.filter((event) => !event.id.startsWith('draft-')),
      draftEvent,
    ]);
    setSelectedEvent(draftEvent);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (role !== 'trainer' || !selectedEvent) {
      setIsDialogOpen(false);
      return;
    }

    setIsSaving(true);
    setStatusMessage('');

    try {
      const savedEvent = selectedEvent.id.startsWith('draft-')
        ? await createTrainerSession({
            start: selectedEvent.start,
            end: selectedEvent.end,
            trainerId: selectedEvent.trainerId || DEFAULT_TRAINER_ID,
            title: formTitle,
            description: formDescription,
          })
        : await updateTrainerSession({
            sessionId: Number(selectedEvent.sessionId),
            start: selectedEvent.start,
            end: selectedEvent.end,
            trainerId: selectedEvent.trainerId || DEFAULT_TRAINER_ID,
            title: formTitle,
            description: formDescription,
            status: toApiStatus(selectedEvent.status),
          });

      setTrainerEvents((currentEvents) =>
        selectedEvent.id.startsWith('draft-')
          ? [...currentEvents.filter((event) => event.id !== selectedEvent.id), { ...savedEvent, trainer: savedEvent.coachName }]
          : currentEvents.map((event) =>
              event.id === selectedEvent.id ? { ...savedEvent, trainer: savedEvent.coachName } : event,
            ),
      );
      setSelectedEvent({ ...savedEvent, trainer: savedEvent.coachName });
      setIsDialogOpen(false);
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSession = async () => {
    if (role !== 'trainer' || !selectedEvent || selectedEvent.id.startsWith('draft-')) {
      return;
    }

    setIsSaving(true);
    setStatusMessage('');

    try {
      const cancelledEvent = await cancelTrainerSession(Number(selectedEvent.sessionId));
      setTrainerEvents((currentEvents) =>
        currentEvents.map((event) =>
          event.id === selectedEvent.id ? { ...cancelledEvent, trainer: cancelledEvent.coachName } : event,
        ),
      );
      setSelectedEvent({ ...cancelledEvent, trainer: cancelledEvent.coachName });
      setIsDialogOpen(false);
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const persistCalendarUpdate = async (info) => {
    if (role !== 'trainer' || info.event.id.startsWith('draft-')) {
      return;
    }

    try {
      const updatedEvent = await updateTrainerSession({
        sessionId: Number(info.event.extendedProps.sessionId ?? info.event.id.replace(/^trainer-/, '')),
        start: info.event.startStr,
        end: info.event.endStr || info.event.startStr,
        trainerId: info.event.extendedProps.trainerId || DEFAULT_TRAINER_ID,
        title: info.event.title,
        description: info.event.extendedProps.description || '',
        status: toApiStatus(info.event.extendedProps.status),
      });
      setTrainerEvents((currentEvents) =>
        currentEvents.map((event) =>
          event.id === info.event.id ? { ...updatedEvent, trainer: updatedEvent.coachName } : event,
        ),
      );
      setStatusMessage('');
    } catch (error) {
      info.revert();
      setStatusMessage(error.message);
    }
  };

  return (
    <section className="sessions-page">
      <Flex justify="between" align="start" wrap="wrap" gap="4" className="sessions-hero">
        <div>
          <Heading size="8">{title}</Heading>
          <Text color="gray" className="sessions-subtitle">
            {subtitle}
          </Text>
        </div>
        <Flex gap="2" wrap="wrap">
          <Badge color={role === 'trainer' ? 'violet' : 'blue'} size="3">
            {role === 'trainer' ? 'Trainer View' : 'Client View'}
          </Badge>
          <Badge color="green" size="3">
            {todayCount} today
          </Badge>
        </Flex>
      </Flex>

      <div className="sessions-layout">
        <Card className="calendar-shell">
          {statusMessage ? (
            <Text color="red" size="2">
              {statusMessage}
            </Text>
          ) : null}
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            height="auto"
            events={events}
            selectable={role === 'trainer'}
            editable={role === 'trainer'}
            nowIndicator
            select={addTrainerDraftSession}
            eventClick={(info) => {
              setSelectedEvent(buildSelectedEvent(info.event));
              setIsDialogOpen(true);
            }}
            eventDrop={persistCalendarUpdate}
            eventResize={persistCalendarUpdate}
          />
        </Card>
      </div>

      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog-content">
            <Flex direction="column" gap="4">
              <div>
                <Dialog.Title asChild>
                  <Heading size="5">Session Details</Heading>
                </Dialog.Title>
                <Dialog.Description asChild>
                  <Text color="gray">
                    {role === 'trainer'
                      ? 'Edit the session title and description, save changes, or cancel the session.'
                      : 'Review your booked session details.'}
                  </Text>
                </Dialog.Description>
              </div>

              {selectedEvent ? (
                <Flex direction="column" gap="3" className="session-detail-stack">
                  <div>
                    {role === 'trainer' ? (
                      <TextField.Root value={formTitle} onChange={(event) => setFormTitle(event.target.value)} />
                    ) : (
                      <Text weight="bold">{selectedEvent.title}</Text>
                    )}
                    <Text color="gray">{new Date(selectedEvent.start).toLocaleString()}</Text>
                  </div>

                  {role === 'trainer' ? (
                    <div>
                      <Text size="2" color="gray">
                        Description
                      </Text>
                      <TextArea value={formDescription} onChange={(event) => setFormDescription(event.target.value)} />
                    </div>
                  ) : (
                    selectedEvent.description ? <Text color="gray">{selectedEvent.description}</Text> : null
                  )}

                  <div className="session-meta-row">
                    <Text color="gray">Coach</Text>
                    <Text>{selectedEvent.trainer}</Text>
                  </div>
                  <div className="session-meta-row">
                    <Text color="gray">Location</Text>
                    <Text>{selectedEvent.location}</Text>
                  </div>
                  <div className="session-meta-row">
                    <Text color="gray">Status</Text>
                    <Badge
                      color={
                        selectedEvent.status === 'Confirmed'
                          ? 'green'
                          : selectedEvent.status === 'Pending'
                            ? 'amber'
                            : 'gray'
                      }
                    >
                      {selectedEvent.status}
                    </Badge>
                  </div>
                  <Flex justify="between" gap="3" wrap="wrap">
                    {role === 'trainer' && !selectedEvent.id.startsWith('draft-') && selectedEvent.status !== 'Cancelled' ? (
                      <Button variant="soft" color="red" disabled={isSaving} onClick={handleCancelSession}>
                        {isSaving ? 'Cancelling...' : 'Cancel Session'}
                      </Button>
                    ) : null}
                    <Dialog.Close asChild>
                      <Button variant="soft" color="gray">
                        Close
                      </Button>
                    </Dialog.Close>
                    {role === 'trainer' ? (
                      <Button variant="soft" disabled={isSaving} onClick={handleSave}>
                        {selectedEvent.id.startsWith('draft-')
                          ? (isSaving ? 'Saving...' : 'Create Availability Slot')
                          : (isSaving ? 'Saving...' : 'Save Changes')}
                      </Button>
                    ) : null}
                  </Flex>
                </Flex>
              ) : null}
            </Flex>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
};

export default SessionsPage;
