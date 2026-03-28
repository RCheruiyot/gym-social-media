import React, { useState } from 'react';
import { Badge, Button, Card, Flex, Heading, Select, Text, TextField } from '@radix-ui/themes';

const trainers = [
  {
    id: 1,
    name: 'Maya Chen',
    specialty: 'Strength',
    format: 'Virtual',
    price: '$85/session',
    bio: 'Powerlifting coach focused on barbell technique, beginner confidence, and progressive programming.',
    rating: '4.9',
  },
  {
    id: 2,
    name: 'Jordan Miles',
    specialty: 'Conditioning',
    format: 'Hybrid',
    price: '$72/session',
    bio: 'Helps busy clients build cardio capacity with short, repeatable sessions and recovery planning.',
    rating: '4.8',
  },
  {
    id: 3,
    name: 'Alex Rivera',
    specialty: 'Mobility',
    format: 'Virtual',
    price: '$60/session',
    bio: 'Blends mobility, posture, and strength support for clients coming back from long desk-work weeks.',
    rating: '4.7',
  },
  {
    id: 4,
    name: 'Naomi Brooks',
    specialty: 'Nutrition',
    format: 'In Person',
    price: '$95/session',
    bio: 'Pairs meal planning with realistic training schedules and accountability for steady lifestyle change.',
    rating: '5.0',
  },
];

const FindTrainerPage = () => {
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('all');

  const filteredTrainers = trainers.filter((trainer) => {
    const matchesQuery =
      trainer.name.toLowerCase().includes(query.toLowerCase()) ||
      trainer.bio.toLowerCase().includes(query.toLowerCase()) ||
      trainer.specialty.toLowerCase().includes(query.toLowerCase());

    const matchesSpecialty = specialty === 'all' || trainer.specialty.toLowerCase() === specialty;

    return matchesQuery && matchesSpecialty;
  });

  return (
    <section className="find-trainer-page">
      <Flex justify="between" align="start" wrap="wrap" gap="4" className="find-trainer-hero">
        <div>
          <Heading size="8">Find Trainer</Heading>
          <Text color="gray" className="find-trainer-subtitle">
            Browse trainers by specialty, compare formats, and shortlist the right coach for your goals.
          </Text>
        </div>
        <Badge size="3" color="blue">
          {filteredTrainers.length} matches
        </Badge>
      </Flex>

      <Card className="trainer-filter-card">
        <Flex gap="3" wrap="wrap" align="center">
          <div className="trainer-search">
            <Text size="2" weight="medium">
              Search
            </Text>
            <TextField.Root
              placeholder="Search by trainer, focus, or vibe"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="trainer-select">
            <Text size="2" weight="medium">
              Specialty
            </Text>
            <Select.Root value={specialty} onValueChange={setSpecialty}>
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="all">All specialties</Select.Item>
                <Select.Item value="strength">Strength</Select.Item>
                <Select.Item value="conditioning">Conditioning</Select.Item>
                <Select.Item value="mobility">Mobility</Select.Item>
                <Select.Item value="nutrition">Nutrition</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>
        </Flex>
      </Card>

      <div className="trainer-grid">
        {filteredTrainers.map((trainer) => (
          <Card key={trainer.id} className="trainer-card">
            <Flex justify="between" align="start" gap="3">
              <div>
                <Heading size="4">{trainer.name}</Heading>
                <Text color="gray">{trainer.bio}</Text>
              </div>
              <Badge color="green">{trainer.rating}</Badge>
            </Flex>

            <Flex gap="2" wrap="wrap" className="trainer-badge-row">
              <Badge color="blue" variant="soft">
                {trainer.specialty}
              </Badge>
              <Badge color="gray" variant="soft">
                {trainer.format}
              </Badge>
              <Badge color="amber" variant="soft">
                {trainer.price}
              </Badge>
            </Flex>

            <Flex justify="between" align="center" className="trainer-card-footer">
              <Text size="2" color="gray">
                Next opening this week
              </Text>
              <Button>View Profile</Button>
            </Flex>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default FindTrainerPage;
