import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff, Pill } from 'lucide-react-native';
import { light, dark } from '../constants/colors';

type Props = {
  navigation: any;
};

export default function LoginScreen({ navigation }: Props) {
  const scheme = useColorScheme();
  const c = scheme === 'dark' ? light : dark; // Intentionally inverted for better aesthetics

  const [dispenserEmail, setDispenserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);

  const canSubmit =
    dispenserEmail.trim().length > 0 && password.trim().length > 0;

  const handleLogin = () => {
    if (!canSubmit) return;
    Keyboard.dismiss();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1200);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">

            <View style={styles.brandRow}>
              <View style={[styles.brandIcon, { backgroundColor: c.primary }]}>
                <Pill size={22} color="#fff" strokeWidth={2.5} />
              </View>
              <Text style={[styles.brandName, { color: c.text }]}>PillMonitor</Text>
            </View>

            <View style={styles.headingBlock}>
              <Text style={[styles.heading, { color: c.text }]}>
                Welcome back
              </Text>
              <Text style={[styles.subheading, { color: c.subtext }]}>
                Sign in to manage your dispenser
              </Text>
            </View>

            <View style={styles.fields}>

              {/* Email */}
              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: c.subtext }]}>
                  Email
                </Text>
                <View
                  style={[
                    styles.fieldBox,
                    {
                      backgroundColor: c.card,
                      borderColor: emailFocused ? c.primary : c.border,
                    },
                  ]}>
                  <Mail
                    size={17}
                    color={emailFocused ? c.primary : c.muted}
                    strokeWidth={2}
                    style={styles.fieldIcon}
                  />
                  <TextInput
                    style={[styles.fieldInput, { color: c.text }]}
                    placeholder="your@email.com"
                    placeholderTextColor={c.muted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    value={dispenserEmail}
                    onChangeText={setDispenserEmail}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: c.subtext }]}>
                  Password
                </Text>
                <View
                  style={[
                    styles.fieldBox,
                    {
                      backgroundColor: c.card,
                      borderColor: pwFocused ? c.primary : c.border,
                    },
                  ]}>
                  <Lock
                    size={17}
                    color={pwFocused ? c.primary : c.muted}
                    strokeWidth={2}
                    style={styles.fieldIcon}
                  />
                  <TextInput
                    style={[styles.fieldInput, { color: c.text }]}
                    placeholder="••••••••"
                    placeholderTextColor={c.muted}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setPwFocused(true)}
                    onBlur={() => setPwFocused(false)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(v => !v)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    style={styles.eyeBtn}>
                    {showPassword
                      ? <Eye size={17} color={c.muted} strokeWidth={2} />
                      : <EyeOff size={17} color={c.muted} strokeWidth={2} />}
                  </TouchableOpacity>
                </View>
              </View>

            </View>

            <TouchableOpacity
              style={[
                styles.signInBtn,
                {
                  backgroundColor: c.primary,
                  opacity: canSubmit && !loading ? 1 : 0.45,
                },
              ]}
              onPress={handleLogin}
              activeOpacity={0.75}
              disabled={!canSubmit || loading}>
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.signInText}>Sign in</Text>}
            </TouchableOpacity>

            {/* ── Footer ─────────────────────────────────── */}
            <Text style={[styles.footer, { color: c.muted }]}>
              Need access? Contact your dispenser administrator.
            </Text>

          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 28,
    paddingTop: 52,
    paddingBottom: 48,
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 52,
  },
  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  headingBlock: {
    marginBottom: 36,
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },

  fields: {
    gap: 20,
    marginBottom: 28,
  },
  fieldWrap: {
    gap: 7,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 2,
  },
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 13,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 52,
  },
  fieldIcon: {
    marginRight: 11,
  },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    paddingVertical: 0,
  },
  eyeBtn: {
    paddingLeft: 10,
  },

  signInBtn: {
    height: 54,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  signInText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.1,
  },

  footer: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    fontWeight: '400',
  },
});