import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, List, Card, Chip, Divider, Button } from 'react-native-paper';
import { theme } from '../theme/theme';

const Section = ({ title, subtitle, items }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <List.Accordion
      title={title}
      description={subtitle}
      expanded={expanded}
      onPress={() => setExpanded(!expanded)}
      titleStyle={styles.sectionTitle}
      style={styles.accordion}
      right={props => <List.Icon {...props} icon={expanded ? 'chevron-up' : 'chevron-down'} />}
    >
      <Card style={styles.card}>
        <Card.Content>
          {items.map((text, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.itemText}>{text}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>
    </List.Accordion>
  );
};

const OfflineSafetyGuide = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Offline Safety Guide</Text>
      <Text style={styles.subheader}>
        Practical, predefined safety measures you can read anytime. No internet required.
      </Text>

      <View style={styles.tagsRow}>
        <Chip style={styles.tag} icon="shield-check">Prepared</Chip>
        <Chip style={styles.tag} icon="gesture-tap-hold">Actionable</Chip>
        <Chip style={styles.tag} icon="book-open-variant">Easy to follow</Chip>
      </View>

      <Divider style={styles.divider} />

      <Section
        title="Immediate Danger (Act Now)"
        subtitle="Fast steps if you feel unsafe right now"
        items={[
          'Move immediately to a well‑lit, crowded area such as a shop, pharmacy, or restaurant.',
          'Call emergency numbers: Police 100 or 112; if possible, put your phone on speaker.',
          'Describe your location with landmarks (near temple, bus stop name, store names).',
          'If approached, speak loudly and clearly: “Please stay away. I am calling the police.”',
          'Keep your phone visible; avoid turning your back; maintain distance and exit routes.',
        ]}
      />

      <Section
        title="Being Followed"
        subtitle="Situational guidance while walking or commuting"
        items={[
          'Do not go home directly. Change direction and enter a busy public place.',
          'Call a trusted contact and keep them on the line; share location when possible.',
          'Avoid isolated shortcuts. Walk on the main road, against traffic to increase visibility.',
          'If safe, record a short video noting time, place, clothing of the person.',
          'Ask a shopkeeper or guard for help. Say: “I feel unsafe. Can I wait here?”',
        ]}
      />

      <Section
        title="Public Transport"
        subtitle="Auto, cab, bus, and metro safety tips"
        items={[
          'Before boarding, note the vehicle number; sit near the driver or other women.',
          'Keep your bag on your lap and your phone in easy reach; avoid deep sleep.',
          'If route changes unexpectedly, ask to stop in a public area; call a contact.',
          'In shared rides, avoid being the last passenger; choose a seat with exit access.',
          'If harassed, announce clearly you need help and change seats or buses at next stop.',
        ]}
      />

      <Section
        title="At Home or PG/Hostel"
        subtitle="Personal boundaries and entry safety"
        items={[
          'Keep doors/windows locked; use door chain/peephole before opening to anyone.',
          'Do not share that you live alone; avoid revealing routines to strangers.',
          'Have emergency numbers displayed near the door and saved on speed dial.',
          'If someone insists to enter, say you are not alone and will call back later.',
          'If threatened, shout for help; move to a room with a second exit if possible.',
        ]}
      />

      <Section
        title="Events & Social Settings"
        subtitle="Crowds, outings, and gatherings"
        items={[
          'Stay with trusted friends; decide a regroup point and time in advance.',
          'Keep your drink with you; if lost, get a fresh one yourself.',
          'Trust discomfort. Leave respectfully; you do not need to explain.',
          'Share ride details with a friend; verify vehicle plates before boarding.',
          'Carry minimal valuables; keep an emergency cash note accessible.',
        ]}
      />

      <Section
        title="Online Harassment & Stalking"
        subtitle="Digital boundaries and reporting"
        items={[
          'Do not respond to abusive messages; take screenshots as evidence.',
          'Block and report accounts; change privacy settings to “contacts only”.',
          'Avoid sharing live location publicly; limit profile details and photos.',
          'If threats escalate, file a complaint with cybercrime portal when online.',
          'Tell a trusted person and keep a record of time, platform, and handles.',
        ]}
      />

      <Section
        title="Quick Escape Strategies"
        subtitle="Short, effective actions to disengage"
        items={[
          'Hold your phone as if on a call; say loudly "I see you, I\'m here near the CCTV".',
          'Use the app\'s Long Press Fake Call feature (press header for 2 seconds) to exit uncomfortable interactions.',
          'Walk with purpose; avoid arguing. Head to the nearest open shop or guard.',
          'If you fall, keep your feet toward the person to defend distance and push away.',
          'Carry a small whistle or alarm if available; use it to draw attention.',
        ]}
      />

      <Card style={styles.featuresCard}>
        <Card.Title 
          title="🚨 App's Unique Safety Features" 
          titleStyle={styles.featuresTitle}
          subtitle="Quick access emergency tools built into this app"
        />
        <Card.Content>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📞</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Emergency Call Button</Text>
              <Text style={styles.featureDescription}>
                Red floating button on the right side - instantly dials emergency services (100/112)
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>👆</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>3-Tap SOS Activation</Text>
              <Text style={styles.featureDescription}>
                Tap the header 3 times quickly to activate SOS - automatically records audio, gets location, and sends emergency alert via WhatsApp
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🤳</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Long Press Fake Call</Text>
              <Text style={styles.featureDescription}>
                Long press anywhere on the header for 2 seconds to generate a realistic fake incoming call - perfect for escaping uncomfortable situations
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎵</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>SOS Audio Playback</Text>
              <Text style={styles.featureDescription}>
                All SOS recordings are saved locally - access them anytime to review evidence or share with authorities
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.contactsCard}>
        <Card.Title title="Essential Emergency Numbers (India)" titleStyle={styles.contactsTitle} />
        <Card.Content>
          <View style={styles.row}><Text style={styles.label}>Police</Text><Text style={styles.value}>100</Text></View>
          <View style={styles.row}><Text style={styles.label}>National Emergency</Text><Text style={styles.value}>112</Text></View>
          <View style={styles.row}><Text style={styles.label}>Women Helpline</Text><Text style={styles.value}>1091</Text></View>
          <View style={styles.row}><Text style={styles.label}>Domestic Violence</Text><Text style={styles.value}>181</Text></View>
          <View style={styles.row}><Text style={styles.label}>Child Helpline</Text><Text style={styles.value}>1098</Text></View>
          <Divider style={styles.contactsDivider} />
          <Text style={styles.note}>Tip: Write these on a small card and keep it in your wallet.</Text>
        </Card.Content>
      </Card>

      <Card style={styles.kitCard}>
        <Card.Title title="Personal Safety Kit (Optional)" titleStyle={styles.contactsTitle} />
        <Card.Content>
          <View style={styles.bulletRow}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Whistle or personal alarm</Text></View>
          <View style={styles.bulletRow}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Small power bank and cable</Text></View>
          <View style={styles.bulletRow}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Emergency cash note</Text></View>
          <View style={styles.bulletRow}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Folded paper with emergency contacts</Text></View>
          <View style={styles.bulletRow}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Light snack and small water bottle (when commuting)</Text></View>
        </Card.Content>
      </Card>

      <View style={styles.footerNoteBox}>
        <Text style={styles.footerNote}>
          You are not alone. Trust your instincts. Your safety is the priority.
        </Text>
        <Button mode="text" textColor={theme.colors.durgaRed} onPress={() => {}}>
          Stay prepared
        </Button>
        
        {/* Testing button - remove in production */}
        <Button 
          mode="outlined" 
          onPress={() => {
            Alert.alert(
              'Testing Mode',
              'To test offline mode: 1. Turn off WiFi/Mobile data, or 2. In App.js, uncomment the test line: const [isOffline, setIsOffline] = React.useState(true);',
              [{ text: 'OK' }]
            );
          }}
          style={styles.testButton}
        >
          How to Test Offline Mode
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.durga.spacing.lg,
    paddingBottom: theme.durga.spacing.xl,
  },
  header: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.durgaRed,
    marginBottom: 6,
  },
  subheader: {
    fontSize: 14,
    color: theme.colors.durgaBrown,
    marginBottom: theme.durga.spacing.md,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: theme.durga.spacing.md,
  },
  tag: {
    backgroundColor: theme.colors.durgaLight,
  },
  divider: {
    marginVertical: theme.durga.spacing.sm,
    backgroundColor: theme.colors.durgaLight,
  },
  accordion: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.durga.borderRadius,
    marginBottom: theme.durga.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.durgaLight,
  },
  sectionTitle: {
    fontWeight: '700',
    color: theme.colors.durgaBrown,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.durga.borderRadius,
    borderWidth: 1,
    borderColor: theme.colors.durgaLight,
    marginHorizontal: theme.durga.spacing.sm,
    marginBottom: theme.durga.spacing.md,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    width: 18,
    fontSize: 18,
    lineHeight: 22,
    color: theme.colors.durgaBrown,
  },
  itemText: {
    flex: 1,
    color: theme.colors.durgaBrown,
    fontSize: 14,
    lineHeight: 20,
  },
  contactsCard: {
    marginTop: theme.durga.spacing.md,
    borderRadius: theme.durga.borderRadius,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.durgaLight,
  },
  contactsTitle: {
    color: theme.colors.durgaBrown,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    color: theme.colors.durgaBrown,
    fontWeight: '600',
  },
  value: {
    color: theme.colors.durgaRed,
    fontWeight: '700',
  },
  contactsDivider: {
    marginVertical: theme.durga.spacing.sm,
    backgroundColor: theme.colors.durgaLight,
  },
  note: {
    color: theme.colors.placeholder,
    fontSize: 12,
  },
  kitCard: {
    marginTop: theme.durga.spacing.md,
    borderRadius: theme.durga.borderRadius,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.durgaLight,
  },
  featuresCard: {
    marginTop: theme.durga.spacing.md,
    borderRadius: theme.durga.borderRadius,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.durgaRed,
    ...theme.durga.shadow,
  },
  featuresTitle: {
    color: theme.colors.durgaRed,
    fontWeight: '800',
    fontSize: 18,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.durga.spacing.md,
    paddingVertical: theme.durga.spacing.sm,
    paddingHorizontal: theme.durga.spacing.sm,
    backgroundColor: theme.colors.durgaLight,
    borderRadius: theme.durga.borderRadius,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: theme.durga.spacing.sm,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.durgaBrown,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: theme.colors.durgaBrown,
    lineHeight: 20,
  },
  footerNoteBox: {
    alignItems: 'center',
    marginTop: theme.durga.spacing.lg,
  },
  footerNote: {
    textAlign: 'center',
    color: theme.colors.durgaBrown,
    marginBottom: 8,
    fontWeight: '600',
  },
  testButton: {
    marginTop: 16,
    borderColor: theme.colors.durgaRed,
  },
});

export default OfflineSafetyGuide;


