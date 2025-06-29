import { Tabs } from 'expo-router';
import { ChartNoAxesColumnDecreasing, Home } from 'lucide-react-native';
import React from 'react';
import { Platform, View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#eee',
        tabBarInactiveTintColor: '#6E7D92',
        tabBarBackground: () => (
          <View style={{ flex: 1, backgroundColor: '#111' }} />
        ),
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) =>  <Home size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: 'Statistics',
          tabBarIcon: ({ color }) => <ChartNoAxesColumnDecreasing size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
