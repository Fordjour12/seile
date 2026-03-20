import { View, Text, Button } from 'react-native'
import React from 'react'
import { Container } from '@/components/container'
import { OnboardingScreen } from '@/components/auth/onboarding-screen'

export default function Index() {
  return (
    <Container>
      <OnboardingScreen />
    </Container>
  )
}
