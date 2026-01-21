import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Theme } from '../theme';
import { Home, Trophy, User } from 'lucide-react-native';

// Screens
import HomeScreen from '../screens/HomeScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import MarketDetailScreen from '../screens/MarketDetailScreen';
import AccountScreen from '../screens/AccountScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: Theme.colors.background,
                    borderTopColor: Theme.colors.border,
                    height: 60,
                    paddingBottom: 8,
                },
                tabBarActiveTintColor: Theme.colors.primary,
                tabBarInactiveTintColor: Theme.colors.textDim,
                tabBarIcon: ({ color, size }) => {
                    if (route.name === 'Home') return <Home size={size} color={color} />;
                    if (route.name === 'Leaderboard') return <Trophy size={size} color={color} />;
                    if (route.name === 'Account') return <User size={size} color={color} />;
                    return null;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen
                name="Leaderboard"
                component={LeaderboardScreen}
                options={{ tabBarLabel: 'Stars' }}
            />
            <Tab.Screen name="Account" component={AccountScreen} />
        </Tab.Navigator>
    );
}

export default function RootNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="MarketDetails" component={MarketDetailScreen} />
        </Stack.Navigator>
    );
}
