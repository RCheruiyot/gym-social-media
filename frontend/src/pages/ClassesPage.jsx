import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';

const ClassesPage = () => {
  return (
    <section>
      <h2>Training Plans</h2>
      <p>Browse plans by focus and open details in a Radix dialog.</p>

      <Tabs.Root className="tabs-root" defaultValue="strength">
        <Tabs.List className="tabs-list" aria-label="Training plans">
          <Tabs.Trigger className="tabs-trigger" value="strength">
            Strength
          </Tabs.Trigger>
          <Tabs.Trigger className="tabs-trigger" value="conditioning">
            Conditioning
          </Tabs.Trigger>
          <Tabs.Trigger className="tabs-trigger" value="mobility">
            Mobility
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content className="tabs-content" value="strength">
          <h3>Progressive Overload</h3>
          <p>Three weekly lifting sessions focused on squat, bench, and deadlift.</p>
        </Tabs.Content>
        <Tabs.Content className="tabs-content" value="conditioning">
          <h3>Engine Builder</h3>
          <p>Interval circuits and short runs to improve work capacity.</p>
        </Tabs.Content>
        <Tabs.Content className="tabs-content" value="mobility">
          <h3>Recovery Flow</h3>
          <p>Daily 20-minute guided mobility to improve movement quality.</p>
        </Tabs.Content>
      </Tabs.Root>

      <Dialog.Root>
        <Dialog.Trigger asChild>
          <button type="button">Open Coaching Notes</button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog-content">
            <Dialog.Title>Coach Notes</Dialog.Title>
            <Dialog.Description>
              Keep one rest day every week and track your sets in the app feed.
            </Dialog.Description>
            <Dialog.Close asChild>
              <button type="button">Close</button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
};

export default ClassesPage;
