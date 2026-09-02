import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colorTokens from '@/constants/colors';

const colors = colorTokens.light;

type ModelName = 'Gemini' | 'Grok' | 'OpenRouter';
type TabName = 'Home' | 'Chat' | 'Voice' | 'Memory' | 'Settings';

const models: ModelName[] = ['Gemini', 'Grok', 'OpenRouter'];
const tabs: { name: TabName; icon: keyof typeof Feather.glyphMap }[] = [
  { name: 'Home', icon: 'home' },
  { name: 'Chat', icon: 'message-circle' },
  { name: 'Voice', icon: 'mic' },
  { name: 'Memory', icon: 'archive' },
  { name: 'Settings', icon: 'settings' },
];
const particles = [
  { left: '13%', top: '16%', size: 2, opacity: 0.38 },
  { left: '82%', top: '14%', size: 3, opacity: 0.52 },
  { left: '7%', top: '44%', size: 2, opacity: 0.28 },
  { left: '92%', top: '39%', size: 2, opacity: 0.34 },
  { left: '18%', top: '70%', size: 3, opacity: 0.22 },
  { left: '78%', top: '75%', size: 2, opacity: 0.40 },
  { left: '31%', top: '9%', size: 2, opacity: 0.22 },
  { left: '66%', top: '28%', size: 2, opacity: 0.30 },
];

function GlassPanel({
  children,
  style,
  strong = false,
}: {
  children: React.ReactNode;
  style?: object;
  strong?: boolean;
}) {
  return (
    <View style={[styles.glassClip, style]}>
      <BlurView
        intensity={strong ? 30 : 22}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.glassFill, strong && styles.glassFillStrong]} />
      <View style={styles.glassEdge} />
      {children}
    </View>
  );
}

function Orb({ listening, onPress }: { listening: boolean; onPress: () => void }) {
  const pulse = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: listening ? 1900 : 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: listening ? 1900 : 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 16000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    pulseLoop.start();
    spinLoop.start();
    return () => {
      pulseLoop.stop();
      spinLoop.stop();
    };
  }, [listening, pulse, spin]);

  const outerScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] });
  const innerScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.13] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.28, 0.58] });
  const spinA = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spinB = spin.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });

  const handlePressIn = () =>
    Animated.spring(pressScale, { toValue: 0.96, useNativeDriver: true, speed: 28, bounciness: 4 }).start();
  const handlePressOut = () =>
    Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 26, bounciness: 6 }).start();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={listening ? 'Stop listening' : 'Start listening'}
      testID="voice-orb"
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.orbPressable}
    >
      <Animated.View style={[styles.orbStage, { transform: [{ scale: pressScale }] }]}>
        <Animated.View style={[styles.orbGlow, { opacity: glowOpacity, transform: [{ scale: outerScale }] }]} />
        <Animated.View style={[styles.orbRing, styles.orbRingOuter, { transform: [{ rotate: spinA }, { scale: outerScale }] }]} />
        <Animated.View style={[styles.orbRing, styles.orbRingMiddle, { transform: [{ rotate: spinB }, { scale: innerScale }] }]} />
        <Animated.View style={[styles.orbRing, styles.orbRingInner, { transform: [{ rotate: spinA }] }]} />
        <View style={styles.orbCore}>
          <View style={styles.orbCoreHighlight} />
          <View style={styles.orbCoreLight} />
        </View>
        <View style={styles.orbWaveOne} />
        <View style={styles.orbWaveTwo} />
      </Animated.View>
    </Pressable>
  );
}

function Header({ onSettings }: { onSettings: () => void }) {
  return (
    <View style={styles.header}>
      <View style={styles.brandLockup}>
        <View style={styles.brandMark}>
          <View style={styles.brandMarkDot} />
          <View style={styles.brandMarkArc} />
        </View>
        <Text style={styles.brandText}>RB<Text style={styles.brandDot}>.</Text>ai</Text>
      </View>
      <View style={styles.headerRight}>
        <View style={styles.onlinePill}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>ONLINE</Text>
        </View>
        <Pressable
          testID="open-settings"
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          onPress={onSettings}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          <Feather name="sliders" size={17} color={colors.whiteSoft} />
        </Pressable>
      </View>
    </View>
  );
}

function ModelSwitcher({
  model,
  open,
  onToggle,
  onSelect,
}: {
  model: ModelName;
  open: boolean;
  onToggle: () => void;
  onSelect: (model: ModelName) => void;
}) {
  return (
    <View style={styles.modelWrap}>
      <Pressable
        testID="model-switcher"
        accessibilityRole="button"
        accessibilityLabel={`Current model ${model}. Change model`}
        onPress={onToggle}
        style={({ pressed }) => [styles.modelCapsule, pressed && styles.pressed]}
      >
        <View style={styles.modelIndicator} />
        <Text style={styles.modelEyebrow}>MODEL</Text>
        <Text style={styles.modelName}>{model}</Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={15} color={colors.whiteSoft} />
      </Pressable>
      {open ? (
        <GlassPanel style={styles.modelMenu} strong>
          {models.map((option) => (
            <Pressable
              key={option}
              testID={`model-${option.toLowerCase()}`}
              accessibilityRole="button"
              onPress={() => onSelect(option)}
              style={({ pressed }) => [styles.modelOption, pressed && styles.pressed]}
            >
              <View style={[styles.optionRadio, option === model && styles.optionRadioActive]}>
                {option === model ? <View style={styles.optionRadioDot} /> : null}
              </View>
              <Text style={[styles.modelOptionText, option === model && styles.modelOptionActive]}>
                {option}
              </Text>
              {option === model ? <Feather name="check" size={14} color={colors.primary} /> : null}
            </Pressable>
          ))}
        </GlassPanel>
      ) : null}
    </View>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      testID={`quick-${label.toLowerCase().replace(' ', '-')}`}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.quickAction, pressed && styles.quickActionPressed]}
    >
      <View style={styles.quickIcon}>
        <Feather name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
      <Feather name="arrow-up-right" size={13} color={colors.mutedForeground} />
    </Pressable>
  );
}

function BottomNav({ active, onChange }: { active: TabName; onChange: (tab: TabName) => void }) {
  return (
    <GlassPanel style={styles.bottomNav} strong>
      {tabs.map((tab) => {
        const isActive = tab.name === active;
        return (
          <Pressable
            key={tab.name}
            testID={`tab-${tab.name.toLowerCase()}`}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${tab.name} tab`}
            onPress={() => onChange(tab.name)}
            style={({ pressed }) => [styles.navItem, pressed && styles.pressed]}
          >
            <View style={[styles.navIconWrap, isActive && styles.navIconWrapActive]}>
              <Feather name={tab.icon} size={17} color={isActive ? colors.primary : colors.mutedForeground} />
            </View>
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{tab.name}</Text>
          </Pressable>
        );
      })}
    </GlassPanel>
  );
}

function HomeView({
  model,
  modelOpen,
  listening,
  onModelToggle,
  onModelSelect,
  onOrbPress,
  onAction,
}: {
  model: ModelName;
  modelOpen: boolean;
  listening: boolean;
  onModelToggle: () => void;
  onModelSelect: (model: ModelName) => void;
  onOrbPress: () => void;
  onAction: (action: string) => void;
}) {
  return (
    <>
      <View style={styles.homeIntro}>
        <View>
          <Text style={styles.kicker}>PERSONAL COMMAND CENTER</Text>
          <Text style={styles.greeting}>Good evening, Raj.</Text>
        </View>
        <View style={styles.signalBadge}>
          <Feather name="activity" size={13} color={colors.primary} />
          <Text style={styles.signalText}>READY</Text>
        </View>
      </View>

      <ModelSwitcher
        model={model}
        open={modelOpen}
        onToggle={onModelToggle}
        onSelect={onModelSelect}
      />

      <View style={styles.orbSection}>
        <View style={styles.orbAmbientLine} />
        <Orb listening={listening} onPress={onOrbPress} />
        <Text style={styles.orbGreeting}>Hey RB</Text>
        <View style={styles.listeningRow}>
          <View style={[styles.listeningDot, listening && styles.listeningDotActive]} />
          <Text style={styles.listeningText}>{listening ? 'Listening…' : 'Tap to speak'}</Text>
        </View>
        <Text style={styles.orbHint}>Your private AI, always in reach</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <Text style={styles.sectionCount}>04</Text>
      </View>
      <View style={styles.quickGrid}>
        <QuickAction icon="message-circle" label="Ask RB" onPress={() => onAction('Chat ready')} />
        <QuickAction icon="eye" label="Vision" onPress={() => onAction('Vision ready')} />
        <QuickAction icon="globe" label="Web Search" onPress={() => onAction('Web search ready')} />
        <QuickAction icon="zap" label="Automation" onPress={() => onAction('Automation ready')} />
      </View>
    </>
  );
}

function UtilityView({ active, onAction }: { active: Exclude<TabName, 'Home'>; onAction: (action: string) => void }) {
  const content = {
    Chat: {
      eyebrow: 'CONVERSATION LAYER',
      title: 'Ready when you are.',
      body: 'Ask anything, brainstorm freely, or pick up where you left off.',
      icon: 'message-circle' as keyof typeof Feather.glyphMap,
      action: 'Start a conversation',
    },
    Voice: {
      eyebrow: 'VOICE INTERFACE',
      title: 'Speak naturally.',
      body: 'RB is tuned in and ready to turn your thoughts into momentum.',
      icon: 'mic' as keyof typeof Feather.glyphMap,
      action: 'Activate voice',
    },
    Memory: {
      eyebrow: 'PRIVATE MEMORY',
      title: 'Your context, preserved.',
      body: 'RB remembers what matters so every interaction feels more like you.',
      icon: 'archive' as keyof typeof Feather.glyphMap,
      action: 'Explore memory',
    },
    Settings: {
      eyebrow: 'SYSTEM PREFERENCES',
      title: 'Make RB yours.',
      body: 'Tune the way your personal AI looks, sounds, and responds.',
      icon: 'sliders' as keyof typeof Feather.glyphMap,
      action: 'Review preferences',
    },
  }[active];

  return (
    <View style={styles.utilityView}>
      <View style={styles.utilityIcon}>
        <Feather name={content.icon} size={24} color={colors.primary} />
      </View>
      <Text style={styles.kicker}>{content.eyebrow}</Text>
      <Text style={styles.utilityTitle}>{content.title}</Text>
      <Text style={styles.utilityBody}>{content.body}</Text>
      <Pressable
        testID={`utility-${active.toLowerCase()}`}
        accessibilityRole="button"
        onPress={() => onAction(content.action)}
        style={({ pressed }) => [styles.utilityButton, pressed && styles.quickActionPressed]}
      >
        <Text style={styles.utilityButtonText}>{content.action}</Text>
        <Feather name="arrow-up-right" size={15} color={colors.primaryForeground} />
      </Pressable>
      <View style={styles.utilityRule} />
      <View style={styles.utilityMeta}>
        <View style={styles.onlineDot} />
        <Text style={styles.utilityMetaText}>RB.ai core is online</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabName>('Home');
  const [model, setModel] = useState<ModelName>('Gemini');
  const [modelOpen, setModelOpen] = useState(false);
  const [listening, setListening] = useState(true);
  const [feedback, setFeedback] = useState('');
  const feedbackOpacity = useRef(new Animated.Value(0)).current;
  const webTopInset = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const webBottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const topPadding = useMemo(() => webTopInset + 9, [webTopInset]);

  useEffect(() => {
    if (!feedback) return;
    feedbackOpacity.setValue(0);
    Animated.sequence([
      Animated.timing(feedbackOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(1500),
      Animated.timing(feedbackOpacity, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start();
  }, [feedback, feedbackOpacity]);

  const showFeedback = (message: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFeedback(message);
  };

  const selectTab = (tab: TabName) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(tab);
    setModelOpen(false);
    Haptics.selectionAsync();
  };

  const selectModel = (nextModel: ModelName) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setModel(nextModel);
    setModelOpen(false);
    showFeedback(`${nextModel} selected`);
  };

  const toggleOrb = () => {
    setListening((current) => !current);
    showFeedback(listening ? 'Listening paused' : 'Listening resumed');
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <View style={styles.backgroundGlowA} />
      <View style={styles.backgroundGlowB} />
      {particles.map((particle, index) => (
        <View
          key={index}
          style={[
            styles.particle,
            {
              left: particle.left as `${number}%`,
              top: particle.top as `${number}%`,
              width: particle.size,
              height: particle.size,
              opacity: particle.opacity,
            },
          ]}
        />
      ))}
      <View style={[styles.content, { paddingTop: topPadding, paddingBottom: 90 + webBottomInset }]}>
        <Header onSettings={() => selectTab('Settings')} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          scrollEnabled
        >
          {activeTab === 'Home' ? (
            <HomeView
              model={model}
              modelOpen={modelOpen}
              listening={listening}
              onModelToggle={() => setModelOpen((open) => !open)}
              onModelSelect={selectModel}
              onOrbPress={toggleOrb}
              onAction={showFeedback}
            />
          ) : (
            <UtilityView active={activeTab} onAction={showFeedback} />
          )}
        </ScrollView>
      </View>
      <View style={[styles.bottomNavHolder, { bottom: Math.max(webBottomInset, 12) }]}>
        <BottomNav active={activeTab} onChange={selectTab} />
      </View>
      {feedback ? (
        <Animated.View style={[styles.feedback, { bottom: 99 + Math.max(webBottomInset, 12), opacity: feedbackOpacity }]}>
          <Feather name="check-circle" size={15} color={colors.primary} />
          <Text style={styles.feedbackText}>{feedback}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.deepNavy,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    zIndex: 2,
  },
  backgroundGlowA: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: colors.accentSoft,
    opacity: 0.32,
    top: 100,
    left: -230,
  },
  backgroundGlowB: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: colors.accentGlow,
    opacity: 0.10,
    top: 300,
    right: -230,
  },
  particle: {
    position: 'absolute',
    borderRadius: 4,
    backgroundColor: colors.primary,
    zIndex: 1,
  },
  header: {
    height: 42,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandLockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  brandMark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.7,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 0 },
  },
  brandMarkDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  brandMarkArc: {
    position: 'absolute',
    width: 26,
    height: 8,
    borderTopWidth: 1,
    borderColor: colors.primary,
    borderRadius: 13,
    transform: [{ rotate: '-35deg' }],
    opacity: 0.58,
  },
  brandText: {
    color: colors.foreground,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 19,
    letterSpacing: -0.8,
  },
  brandDot: {
    color: colors.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  onlineDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.9,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
  },
  onlineText: {
    color: colors.whiteSoft,
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    letterSpacing: 1.2,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.accentSoft,
  },
  pressed: {
    opacity: 0.58,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 26,
  },
  homeIntro: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 19,
  },
  kicker: {
    color: colors.mutedForeground,
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    letterSpacing: 1.8,
    marginBottom: 7,
  },
  greeting: {
    color: colors.foreground,
    fontFamily: 'Inter_400Regular',
    fontSize: 25,
    letterSpacing: -0.8,
  },
  signalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingBottom: 3,
  },
  signalText: {
    color: colors.primary,
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    letterSpacing: 1.1,
  },
  modelWrap: {
    zIndex: 10,
    marginBottom: 2,
  },
  modelCapsule: {
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.hairline,
    gap: 9,
  },
  modelIndicator: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  modelEyebrow: {
    color: colors.mutedForeground,
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    letterSpacing: 1.1,
  },
  modelName: {
    flex: 1,
    color: colors.foreground,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    letterSpacing: 0.1,
  },
  modelMenu: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    paddingVertical: 7,
  },
  modelOption: {
    height: 42,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  optionRadio: {
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.mutedForeground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRadioActive: {
    borderColor: colors.primary,
  },
  optionRadioDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  modelOptionText: {
    flex: 1,
    color: colors.mutedForeground,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  modelOptionActive: {
    color: colors.foreground,
    fontFamily: 'Inter_500Medium',
  },
  glassClip: {
    overflow: 'hidden',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  glassFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.glass,
  },
  glassFillStrong: {
    backgroundColor: colors.glassStrong,
  },
  glassEdge: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.accentSoft,
  },
  orbSection: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 27,
    position: 'relative',
  },
  orbAmbientLine: {
    position: 'absolute',
    top: 128,
    width: '76%',
    height: 1,
    backgroundColor: colors.accentSoft,
  },
  orbPressable: {
    width: 258,
    height: 258,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbStage: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbGlow: {
    position: 'absolute',
    width: 152,
    height: 152,
    borderRadius: 76,
    backgroundColor: colors.accentGlow,
    shadowColor: colors.primary,
    shadowOpacity: 0.75,
    shadowRadius: 52,
    shadowOffset: { width: 0, height: 0 },
  },
  orbRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: colors.accentGlow,
  },
  orbRingOuter: {
    width: 224,
    height: 114,
    borderRadius: 112,
    borderLeftColor: colors.primary,
    borderRightColor: colors.primary,
    opacity: 0.58,
  },
  orbRingMiddle: {
    width: 198,
    height: 198,
    borderRadius: 99,
    borderTopColor: colors.primary,
    borderBottomColor: colors.accentSoft,
    opacity: 0.42,
  },
  orbRingInner: {
    width: 175,
    height: 86,
    borderRadius: 86,
    borderTopColor: colors.primary,
    borderBottomColor: colors.primary,
    opacity: 0.70,
  },
  orbCore: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: colors.accent,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.76,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
    overflow: 'hidden',
  },
  orbCoreHighlight: {
    position: 'absolute',
    width: 92,
    height: 44,
    borderRadius: 46,
    backgroundColor: colors.primary,
    opacity: 0.32,
    top: -6,
    left: 10,
    transform: [{ rotate: '-24deg' }],
  },
  orbCoreLight: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    opacity: 0.9,
    shadowColor: colors.primary,
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  orbWaveOne: {
    position: 'absolute',
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 1,
    borderColor: colors.primary,
    opacity: 0.12,
  },
  orbWaveTwo: {
    position: 'absolute',
    width: 134,
    height: 134,
    borderRadius: 67,
    borderWidth: 1,
    borderColor: colors.primary,
    opacity: 0.17,
  },
  orbGreeting: {
    color: colors.foreground,
    fontFamily: 'Inter_500Medium',
    fontSize: 18,
    letterSpacing: 0.3,
    marginTop: -1,
  },
  listeningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 8,
  },
  listeningDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.mutedForeground,
  },
  listeningDotActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.9,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
  },
  listeningText: {
    color: colors.primary,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  orbHint: {
    color: colors.mutedForeground,
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    letterSpacing: 0.2,
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.foreground,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    letterSpacing: 0.1,
  },
  sectionCount: {
    color: colors.mutedForeground,
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    letterSpacing: 1,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickAction: {
    width: '48.2%',
    minHeight: 84,
    borderRadius: 17,
    padding: 13,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'space-between',
  },
  quickActionPressed: {
    opacity: 0.62,
    backgroundColor: colors.glassStrong,
  },
  quickIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickLabel: {
    color: colors.whiteSoft,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    letterSpacing: 0.1,
    marginTop: 8,
  },
  bottomNavHolder: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 20,
  },
  bottomNav: {
    height: 72,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 7,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 66,
    gap: 4,
  },
  navIconWrap: {
    width: 29,
    height: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  navIconWrapActive: {
    backgroundColor: colors.accent,
    shadowColor: colors.primary,
    shadowOpacity: 0.30,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  navLabel: {
    color: colors.mutedForeground,
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    letterSpacing: 0.1,
  },
  navLabelActive: {
    color: colors.primary,
    fontFamily: 'Inter_500Medium',
  },
  utilityView: {
    flex: 1,
    minHeight: 560,
    justifyContent: 'center',
    paddingBottom: 75,
  },
  utilityIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    shadowColor: colors.primary,
    shadowOpacity: 0.24,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  utilityTitle: {
    color: colors.foreground,
    fontFamily: 'Inter_400Regular',
    fontSize: 31,
    letterSpacing: -1,
    lineHeight: 38,
    maxWidth: 310,
  },
  utilityBody: {
    color: colors.mutedForeground,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 14,
    maxWidth: 300,
  },
  utilityButton: {
    height: 46,
    paddingHorizontal: 17,
    borderRadius: 15,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 17,
    backgroundColor: colors.primary,
    marginTop: 27,
  },
  utilityButtonText: {
    color: colors.primaryForeground,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    letterSpacing: 0.1,
  },
  utilityRule: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: 42,
    marginBottom: 17,
    width: '100%',
  },
  utilityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  utilityMetaText: {
    color: colors.mutedForeground,
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
  },
  feedback: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.glassStrong,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  feedbackText: {
    color: colors.foreground,
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
  },
});