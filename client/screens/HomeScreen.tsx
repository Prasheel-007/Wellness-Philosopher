import React, {useEffect, useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {SafeAreaView} from 'react-native-safe-area-context';

export interface DailyExperience {
  id?: number;
  quote_text: string;
  description: string;
  task_dare: string;
}

interface HomeScreenProps {
  dailyExperience: DailyExperience | null;
}

type CompletionChoice = 'yes' | 'no' | null;

const COLORS = {
  navy: '#0B132B',
  raisedNavy: '#101A35',
  gold: '#D4AF37',
  silver: '#E0E0E0',
  white: '#FFFFFF',
};

function HomeScreen({dailyExperience}: HomeScreenProps) {
  const {height, width} = useWindowDimensions();
  const [expanded, setExpanded] = useState(false);
  const [completionChoice, setCompletionChoice] =
    useState<CompletionChoice>(null);

  const cardProgress = useSharedValue(0);
  const promptPulse = useSharedValue(0);

  const quoteText =
    dailyExperience?.quote_text ?? 'Your reflection is almost ready.';
  const insightText = dailyExperience?.description ?? '';
  const challengeText = dailyExperience?.task_dare ?? '';

  const cardWidth = Math.min(width - 40, 430);
  const collapsedHeight = Math.min(Math.max(height * 0.26, 210), 260);
  const expandedHeight = Math.min(Math.max(height * 0.64, 500), height - 96);

  useEffect(() => {
    promptPulse.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0, {
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      false,
    );
  }, [promptPulse]);

  const handleCardPress = () => {
    if (expanded) {
      return;
    }

    setExpanded(true);
    cardProgress.value = withTiming(1, {
      duration: 720,
      easing: Easing.out(Easing.cubic),
    });
  };

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(
        cardProgress.value,
        [0, 1],
        ['rgba(212, 175, 55, 0.58)', 'rgba(212, 175, 55, 0.82)'],
      ),
      height: interpolate(
        cardProgress.value,
        [0, 1],
        [collapsedHeight, expandedHeight],
      ),
      shadowOpacity: interpolate(cardProgress.value, [0, 1], [0.18, 0.28]),
      transform: [
        {
          translateY: interpolate(cardProgress.value, [0, 1], [0, -8]),
        },
      ],
      width: cardWidth,
    };
  }, [cardWidth, collapsedHeight, expandedHeight]);

  const quoteAnimatedStyle = useAnimatedStyle(() => {
    return {
      fontSize: interpolate(cardProgress.value, [0, 1], [23, 20]),
      lineHeight: interpolate(cardProgress.value, [0, 1], [33, 29]),
      textAlign: 'center',
    };
  });

  const expandedContentStyle = useAnimatedStyle(() => {
    return {
      opacity: cardProgress.value,
      transform: [
        {
          translateY: interpolate(cardProgress.value, [0, 1], [18, 0]),
        },
      ],
    };
  });

  const promptAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity:
        interpolate(promptPulse.value, [0, 1], [0.48, 1]) *
        interpolate(cardProgress.value, [0, 1], [1, 0]),
      transform: [
        {
          translateY: interpolate(promptPulse.value, [0, 1], [0, -3]),
        },
      ],
    };
  });

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.centerStage}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open today's reflection"
          disabled={expanded}
          onPress={handleCardPress}>
          <Animated.View style={[styles.card, cardAnimatedStyle]}>
            <View style={styles.quoteWrap}>
              <Animated.Text
                ellipsizeMode="tail"
                numberOfLines={expanded ? 5 : 7}
                style={[styles.quoteText, quoteAnimatedStyle]}>
                {quoteText}
              </Animated.Text>
            </View>

            {expanded && (
              <Animated.ScrollView
                bounces={false}
                contentContainerStyle={styles.expandedContent}
                showsVerticalScrollIndicator={false}
                style={[styles.expandedScroll, expandedContentStyle]}>
                <View style={styles.goldRule} />

                <Text style={styles.sectionLabel}>The Insight</Text>
                <Text style={styles.bodyText}>{insightText}</Text>

                <Text style={styles.sectionLabel}>Today's Challenge</Text>
                <Text style={styles.bodyText}>{challengeText}</Text>

                <View style={styles.completionArea}>
                  <Text style={styles.completionQuestion}>
                    Did you complete this today?
                  </Text>

                  <View style={styles.choiceRow}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setCompletionChoice('yes')}
                      style={({pressed}) => [
                        styles.choiceButton,
                        completionChoice === 'yes' && styles.choiceButtonActive,
                        pressed && styles.choiceButtonPressed,
                      ]}>
                      <Text
                        style={[
                          styles.choiceText,
                          completionChoice === 'yes' && styles.choiceTextActive,
                        ]}>
                        YES
                      </Text>
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setCompletionChoice('no')}
                      style={({pressed}) => [
                        styles.choiceButton,
                        completionChoice === 'no' && styles.choiceButtonActive,
                        pressed && styles.choiceButtonPressed,
                      ]}>
                      <Text
                        style={[
                          styles.choiceText,
                          completionChoice === 'no' && styles.choiceTextActive,
                        ]}>
                        NO
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </Animated.ScrollView>
            )}
          </Animated.View>
        </Pressable>
      </View>

      {!expanded && (
        <Animated.Text style={[styles.tapPrompt, promptAnimatedStyle]}>
          Tap to dive deeper
        </Animated.Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.navy,
    flex: 1,
  },
  centerStage: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  card: {
    backgroundColor: COLORS.raisedNavy,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 10,
    overflow: 'hidden',
    paddingHorizontal: 24,
    paddingVertical: 24,
    shadowColor: COLORS.gold,
    shadowOffset: {height: 0, width: 0},
    shadowRadius: 18,
  },
  quoteWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 156,
  },
  quoteText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  expandedScroll: {
    flex: 1,
    marginTop: 4,
  },
  expandedContent: {
    paddingBottom: 6,
  },
  goldRule: {
    alignSelf: 'center',
    backgroundColor: COLORS.gold,
    borderRadius: 2,
    height: 2,
    marginBottom: 24,
    opacity: 0.76,
    width: 54,
  },
  sectionLabel: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  bodyText: {
    color: COLORS.silver,
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 24,
  },
  completionArea: {
    borderTopColor: 'rgba(224, 224, 224, 0.16)',
    borderTopWidth: 1,
    marginTop: 2,
    paddingTop: 20,
  },
  completionQuestion: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 14,
    textAlign: 'center',
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  choiceButton: {
    alignItems: 'center',
    borderColor: 'rgba(212, 175, 55, 0.52)',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 46,
    justifyContent: 'center',
  },
  choiceButtonActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  choiceButtonPressed: {
    opacity: 0.82,
  },
  choiceText: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  choiceTextActive: {
    color: COLORS.navy,
  },
  tapPrompt: {
    alignSelf: 'center',
    bottom: 28,
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    position: 'absolute',
    textTransform: 'uppercase',
  },
});

export default HomeScreen;
