import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';

import HomeScreen, { DailyExperience } from './screens/HomeScreen';
import { supabase } from './services/supabaseClient';

// --- 1. THE TRACER BULLET IMPORT ---
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';


enableScreens();

type RootTabParamList = {
  Home: undefined;
  Journey: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const COLORS = {
  navy: '#0B132B',
  gold: '#D4AF37',
  silver: '#E0E0E0',
  white: '#FFFFFF',
};

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.navy,
    card: COLORS.navy,
    primary: COLORS.gold,
    text: COLORS.white,
    border: 'rgba(212, 175, 55, 0.22)',
  },
};

function PlaceholderScreen({ title }: { title: string }) {
  return (
    <SafeAreaView style={styles.placeholderScreen}>
      <Text style={styles.placeholderText}>{title}</Text>
    </SafeAreaView>
  );
}

function App() {
  const [dailyData, setDailyData] = useState<DailyExperience | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchTodayExperience = async () => {
      try {
        const { data } = await supabase
          .from('production_quotes')
          .select('*')
          .order('id', { ascending: false })
          .limit(1)
          .single();

        if (data && isMounted) {
          setDailyData(data);
          await AsyncStorage.setItem('@daily_quote', JSON.stringify(data));
        }
      } catch {
        console.log('Offline or fetch error');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const loadInitialData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('@daily_quote');

        if (savedData && isMounted) {
          setDailyData(JSON.parse(savedData));
          setLoading(false);
        }

        fetchTodayExperience();
      } catch {
        fetchTodayExperience();
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading && !dailyData) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingScreen}>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />
      <NavigationContainer theme={navigationTheme}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: COLORS.gold,
            tabBarInactiveTintColor: 'rgba(224, 224, 224, 0.66)',
            tabBarLabelStyle: styles.tabLabel,
            tabBarStyle: styles.tabBar,
            tabBarItemStyle: styles.tabBarItem,
          }}>
          <Tab.Screen name="Home">
            {() => <HomeScreen dailyExperience={dailyData} />}
          </Tab.Screen>
          <Tab.Screen name="Journey">
            {() => <PlaceholderScreen title="Journey" />}
          </Tab.Screen>
          <Tab.Screen name="Settings">
            {() => <PlaceholderScreen title="Settings" />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    alignItems: 'center',
    backgroundColor: COLORS.navy,
    flex: 1,
    justifyContent: 'center',
  },
  placeholderScreen: {
    alignItems: 'center',
    backgroundColor: COLORS.navy,
    flex: 1,
    justifyContent: 'center',
  },
  placeholderText: {
    color: COLORS.silver,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  tabBar: {
    backgroundColor: COLORS.navy,
    borderTopColor: 'rgba(212, 175, 55, 0.24)',
    borderTopWidth: 1,
    height: 70,
    paddingBottom: 12,
    paddingTop: 10,
  },
  tabBarItem: {
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});

export default App;