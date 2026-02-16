import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView,
  StatusBar, TouchableOpacity, ActivityIndicator, Linking
} from 'react-native';

// --- 1. TYPESCRIPT DEFINITIONS ---
// Must match the keys in the Themes object exactly
type ThemeName = 'mrce' | 'wellness' | 'titanium';

interface ThemeColors {
  bg: string;
  card: string;
  text: string;
  accent: string;
  sub: string;
}

interface ThemeMode {
  dark: ThemeColors;
  light: ThemeColors;
}

// --- 2. THEME PALETTE ---
const Themes: Record<ThemeName, ThemeMode> = {
  mrce: {
    dark: { bg: '#002147', card: '#003366', text: '#FFFFFF', accent: '#FF6600', sub: '#FFD700' },
    light: { bg: '#FFFFFF', card: '#F0F4F8', text: '#002147', accent: '#FF6600', sub: '#555555' }
  },
  wellness: {
    dark: { bg: '#121212', card: '#1e1e1e', text: '#e0e0e0', accent: '#4CAF50', sub: '#888888' },
    light: { bg: '#f9fbf9', card: '#ffffff', text: '#2e7d32', accent: '#4CAF50', sub: '#666666' }
  },
  titanium: {
    dark: { bg: '#1a1a1a', card: '#2d2d2d', text: '#ffffff', accent: '#007AFF', sub: '#a1a1a1' },
    light: { bg: '#f2f2f7', card: '#ffffff', text: '#1c1c1e', accent: '#007AFF', sub: '#8e8e93' }
  }
};

const App = () => {
  const [quote, setQuote] = useState({ text: "Loading Today's Wisdom...", author: "" });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'main' | 'about' | 'settings'>('main');

  // States with explicit Types
  const [themeName, setThemeName] = useState<ThemeName>('mrce');
  const [isDark, setIsDark] = useState(false);

  const activeTheme = Themes[themeName][isDark ? 'dark' : 'light'];
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  useEffect(() => {
    const fetchDailyWisdom = async () => {
      try {
        const response = await fetch('http://192.168.0.6:5000/daily-wisdom');
        const data = await response.json();
        setQuote(data);
      } catch (error) {
        setQuote({ text: "Integrity is doing the right thing, even when no one is watching.", author: "C.S. Lewis" });
      } finally {
        setLoading(false);
      }
    };
    fetchDailyWisdom();
  }, []);

  // --- SETTINGS VIEW ---
  if (view === 'settings') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: activeTheme.bg }]}>
        <View style={styles.contentPad}>
          <Text style={[styles.aboutHeader, { color: activeTheme.text }]}>Settings</Text>

          <Text style={[styles.label, { color: activeTheme.text }]}>APPEARANCE</Text>
          <TouchableOpacity
            style={[styles.optionBtn, { backgroundColor: activeTheme.card, borderColor: activeTheme.accent, borderWidth: 1 }]}
            onPress={() => setIsDark(!isDark)}
          >
            <Text style={{ color: activeTheme.text, fontWeight: 'bold' }}>{isDark ? "🌙 Dark Mode" : "☀️ Light Mode"}</Text>
          </TouchableOpacity>

          <Text style={[styles.label, { color: activeTheme.text, marginTop: 30 }]}>SELECT THEME</Text>
          {(['mrce', 'wellness', 'titanium'] as ThemeName[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.optionBtn, {
                backgroundColor: activeTheme.card,
                borderColor: themeName === t ? activeTheme.accent : 'transparent',
                borderWidth: 2
              }]}
              onPress={() => setThemeName(t)}
            >
              <Text style={{ color: activeTheme.text, textTransform: 'uppercase', fontWeight: 'bold' }}>{t} theme</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.backBtn} onPress={() => setView('main')}>
            <Text style={[styles.backBtnText, { color: activeTheme.accent }]}>Save & Exit</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- ABOUT VIEW ---
  if (view === 'about') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: activeTheme.bg }]}>
        <View style={styles.aboutContent}>
          <Text style={[styles.aboutHeader, { color: activeTheme.text }]}>About the Project</Text>
          <Text style={[styles.aboutBody, { color: activeTheme.text }]}>
            This application is a dedicated digital platform for the <Text style={{ color: activeTheme.accent, fontWeight: 'bold' }}>MRCE Wellness Club</Text>.
            It is designed to promote mental well-being across the campus community by delivering daily
            philosophical insights to help students start their mornings with clarity and purpose.
          </Text>

          <View style={[styles.separator, { backgroundColor: activeTheme.accent }]} />
          <Text style={styles.developedBy}>Technical Development</Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://github.com/prasheel-007')}>
            <Text style={[styles.devName, { color: activeTheme.text }]}>Prasheel Varma</Text>
          </TouchableOpacity>
          <Text style={[styles.devDept, { color: activeTheme.accent }]}>B.Tech CSE (AI & ML)</Text>

          <TouchableOpacity
            style={[styles.githubBtn, { backgroundColor: activeTheme.accent }]}
            onPress={() => Linking.openURL('https://github.com/Prasheel-007/Wellness-Philosopher.git')}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>View Source on GitHub</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backBtn} onPress={() => setView('main')}>
            <Text style={[styles.backBtnText, { color: activeTheme.text }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- MAIN VIEW ---
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeTheme.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setView('settings')}>
          <Text style={{ color: activeTheme.accent, fontSize: 24 }}>⚙️</Text>
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.dateText, { color: activeTheme.accent }]}>{today.toUpperCase()}</Text>
          <Text style={[styles.headerTitle, { color: activeTheme.text }]}>WELLNESS</Text>
        </View>
        <TouchableOpacity onPress={() => setView('about')}>
          <Text style={{ color: activeTheme.accent, fontSize: 24 }}>ⓘ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        <View style={[styles.quoteCard, { backgroundColor: activeTheme.card, borderLeftColor: activeTheme.accent }]}>
          {loading ? (
            <ActivityIndicator size="large" color={activeTheme.accent} />
          ) : (
            <>
              <Text style={[styles.quoteText, { color: activeTheme.text }]}>"{quote.text}"</Text>
              <Text style={[styles.author, { color: activeTheme.accent }]}>— {quote.author}</Text>
            </>
          )}
        </View>
        <Text style={{ color: activeTheme.sub, marginTop: 40, fontSize: 10, letterSpacing: 1, textAlign: 'center' }}>
          A NEW MESSAGE ARRIVES EVERY MORNING
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 25, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', letterSpacing: 2 },
  dateText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 2 },
  mainContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  quoteCard: { padding: 40, borderRadius: 10, width: '100%', borderLeftWidth: 5, elevation: 5 },
  quoteText: { fontSize: 24, fontStyle: 'italic', textAlign: 'center', lineHeight: 34 },
  author: { fontSize: 14, marginTop: 25, textAlign: 'right', fontWeight: 'bold' },
  aboutContent: { flex: 1, padding: 40, justifyContent: 'center' },
  aboutHeader: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  aboutBody: { fontSize: 16, lineHeight: 26, marginBottom: 30 },
  separator: { height: 2, marginBottom: 30, width: 60 },
  developedBy: { color: '#666', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  devName: { fontSize: 22, fontWeight: 'bold', marginTop: 5, textDecorationLine: 'underline' },
  devDept: { fontSize: 14, marginBottom: 25 },
  githubBtn: { padding: 12, borderRadius: 5, alignSelf: 'flex-start' },
  backBtn: { marginTop: 50, alignSelf: 'center' },
  backBtnText: { textDecorationLine: 'underline', fontWeight: 'bold' },
  contentPad: { flex: 1, padding: 40, justifyContent: 'center' },
  label: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 10 },
  optionBtn: { padding: 15, borderRadius: 5, marginBottom: 10, alignItems: 'center' }
});

export default App;