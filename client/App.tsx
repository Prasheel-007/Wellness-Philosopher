import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView,
  StatusBar, TouchableOpacity, ActivityIndicator, Linking
} from 'react-native';

const App = () => {
  const [quote, setQuote] = useState({ text: "Fetching wisdom...", author: "" });
  const [loading, setLoading] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const fetchWisdom = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://192.168.0.6:5000/daily-wisdom');
      const data = await response.json();
      setQuote(data);
    } catch (error) {
      setQuote({ text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWisdom(); }, []);

  if (showAbout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.aboutContent}>
          <Text style={styles.aboutHeader}>About the Project</Text>

          <Text style={styles.aboutBody}>
            This application is a dedicated digital platform for the <Text style={styles.highlight}>MRCE Wellness Club</Text>.
            It is designed to promote mental well-being across the campus community by delivering daily
            philosophical insights to help students start their mornings with clarity and purpose.
          </Text>

          <View style={styles.separator} />

          <Text style={styles.developedBy}>Technical Development</Text>

          {/* Hyperlinked Name */}
          <TouchableOpacity onPress={() => Linking.openURL('https://github.com/prasheel-007')}>
            <Text style={styles.devName}>Prasheel Varma</Text>
          </TouchableOpacity>

          <Text style={styles.devDept}>B.Tech CSE (AI & ML)</Text>

          {/* GitHub Repo Button */}
          <TouchableOpacity
            style={styles.githubBtn}
            onPress={() => Linking.openURL('https://github.com/Prasheel-007/Wellness-Philosopher.git')}
          >
            <Text style={styles.githubText}>View Source on GitHub</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backBtn} onPress={() => setShowAbout(false)}>
            <Text style={styles.backBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WELLNESS</Text>
        <TouchableOpacity onPress={() => setShowAbout(true)}>
          <Text style={styles.infoIcon}>ⓘ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.quoteCard}>
          {loading ? (
            <ActivityIndicator size="large" color="#4CAF50" />
          ) : (
            <>
              <Text style={styles.quoteText}>"{quote.text}"</Text>
              <Text style={styles.author}>— {quote.author}</Text>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.refreshBtn} onPress={fetchWisdom}>
          <Text style={styles.refreshBtnText}>GET NEW WISDOM</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 25, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 2 },
  infoIcon: { color: '#4CAF50', fontSize: 24 },
  mainContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  quoteCard: { backgroundColor: '#1e1e1e', padding: 40, borderRadius: 20, width: '100%', borderLeftWidth: 4, borderLeftColor: '#4CAF50' },
  quoteText: { fontSize: 24, color: '#f0f0f0', fontStyle: 'italic', textAlign: 'center', lineHeight: 34 },
  author: { fontSize: 14, color: '#4CAF50', marginTop: 25, textAlign: 'right', fontWeight: 'bold' },
  refreshBtn: { marginTop: 50, backgroundColor: '#222', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 10 },
  refreshBtnText: { color: '#4CAF50', fontWeight: 'bold', fontSize: 12 },

  aboutContent: { flex: 1, padding: 40, justifyContent: 'center' },
  aboutHeader: { color: '#4CAF50', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  aboutBody: { color: '#aaa', fontSize: 16, lineHeight: 26, marginBottom: 30 },
  highlight: { color: '#fff', fontWeight: '600' },
  separator: { height: 1, backgroundColor: '#333', marginBottom: 30 },
  developedBy: { color: '#666', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  devName: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 5, textDecorationLine: 'underline' },
  devDept: { color: '#4CAF50', fontSize: 14, marginBottom: 25 },
  githubBtn: { backgroundColor: '#333', padding: 12, borderRadius: 8, alignSelf: 'flex-start' },
  githubText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  backBtn: { marginTop: 50, alignSelf: 'center' },
  backBtnText: { color: '#888', textDecorationLine: 'underline' }
});

export default App;