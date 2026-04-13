import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Flex, Heading, RadioCards, Text, TextArea, TextField } from '@radix-ui/themes';
import { useRole } from '../auth/RoleContext';

const SignupPage = () => {
  const navigate = useNavigate();
  const { role, setRole } = useRole();
  const [signupChoice, setSignupChoice] = useState('client');

  useEffect(() => {
    if (role === 'client') navigate('/client', { replace: true });
    if (role === 'trainer') navigate('/trainer', { replace: true });
  }, [role, navigate]);

  const onSubmit = (event) => {
    event.preventDefault();
    setRole(signupChoice);
    navigate(signupChoice === 'client' ? '/client' : '/trainer');
  };

  return (
    <Flex direction="column" gap="4" className="signup-page" justify={"center"}>
      <Heading size="6">Sign Up</Heading>
      <Text color="gray">Choose your role to continue.</Text>

      <RadioCards.Root value={signupChoice} onValueChange={setSignupChoice}>
        <Flex gap={"2"}>
          <RadioCards.Item value="client">
            <Flex direction="column" gap="1">
              <Text weight="bold">Client</Text>
              <Text size="1" color="gray">
                Find trainers, book sessions, track progress.
              </Text>
            </Flex>
          </RadioCards.Item>
          <RadioCards.Item value="trainer">
            <Flex direction="column" gap="1">
              <Text weight="bold">Trainer</Text>
              <Text size="1" color="gray">
                Manage clients, plans, schedule, and payments.
              </Text>
            </Flex>
          </RadioCards.Item>
          
        </Flex>
      </RadioCards.Root>

      {signupChoice === 'client' && (
        <form className="stack-form" onSubmit={onSubmit}>
          <TextField.Root placeholder="Name"  />
          <TextField.Root type="email" placeholder="Email" />
          <TextField.Root type="password" placeholder="Password"  />
          <TextArea placeholder="Fitness goals" rows={3}  />
          <TextField.Root placeholder="Training styles (e.g. strength, HIIT)"  />
          <TextField.Root placeholder="Budget (monthly)"  />

          <Card className="verify-box">
            <Flex direction="column" gap="1">
              <Text weight="bold">Verification</Text>
              <Text size="1" color="gray">
                Complete email and phone verification after signup.
              </Text>
            </Flex>
          </Card>

          <Button type="submit">Create Client Account</Button>
        </form>
      )}
      {signupChoice === 'trainer' && (
        <form className="stack-form" onSubmit={onSubmit}>
          <TextField.Root placeholder="Name" />
          <TextField.Root type="email" placeholder="Email" />
          <TextField.Root type="password" placeholder="Password" />
          <TextField.Root placeholder="Certifications" />
          <TextField.Root placeholder="Experience (years)" />
          <TextField.Root placeholder="Specialties" />
          <TextField.Root placeholder="Pricing" />

          <label className="field-label">
            Upload profile photo
            <input type="file" accept="image/*" />
          </label>
          <label className="field-label">
            Upload intro video
            <input type="file" accept="video/*" />
          </label>

          <Card className="verify-box">
            <Flex direction="column" gap="1">
              <Text weight="bold">Verification</Text>
              <Text size="1" color="gray">
                Complete email and phone verification after signup.
              </Text>
            </Flex>
          </Card>

          <Button type="submit">Create Trainer Account</Button>
        </form>
      )}
    </Flex>
  );
};

export default SignupPage;
