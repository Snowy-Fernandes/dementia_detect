import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MessageCircle, X, Send } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const faqAnswers = [
  {
    q: 'what do i do if i have dementia',
    a: "If you suspect dementia, the first step is to see a healthcare professional (GP, neurologist or memory clinic) for an evaluation. They can assess symptoms, run tests, and recommend care, medication, therapies, and support services. Also: simplify daily routines, maintain structure, get social support, and keep active mentally and physically.",
  },
  {
    q: 'how will i know if i have dementia or not',
    a: "Dementia is diagnosed by doctors using medical history, cognitive tests, physical exams, and sometimes brain scans or blood tests. Signs include persistent memory loss that affects daily life, trouble with language or problem solving, and changes in behaviour. A clinical assessment is needed — one-off forgetfulness alone doesn't mean dementia.",
  },
  {
    q: 'i forgot to bath yesterday does that mean i have dementia',
    a: "Missing one bath is not a sign of dementia by itself — people forget things for many reasons (busy day, tiredness, mood). Dementia is about repeated, progressive changes that affect daily independence. If this happens often or other everyday skills are affected, discuss it with a clinician.",
  },
  {
    q: 'i forgot what i ate in lunch today does that mean i have dementia',
    a: "Forgetting small recent details (like what you ate) occasionally is normal, especially when distracted. Dementia-related memory problems are more consistent and impact day-to-day functioning (e.g., repeating questions, getting lost, forgetting important events). If you're worried, monitor patterns and consult a doctor.",
  },
  {
    q: 'i forgot my friends birthday does that mean i have dementia',
    a: "Forgetting a friend's birthday occasionally doesn't mean dementia. People forget dates for many reasons. Dementia typically causes more persistent memory loss and decline in other mental abilities. If memory lapses become frequent or cause functional problems, see a healthcare professional.",
  },
  {
    q: 'what are early signs of dementia',
    a: "Early signs include: difficulty remembering recent events, trouble finding words, problems with problem-solving or planning, confusion about time or place, misplacing items frequently, changes in mood or personality, and difficulty completing familiar tasks. These symptoms progressively worsen and interfere with daily life.",
  },
  {
    q: 'can dementia be prevented',
    a: "While there's no guaranteed prevention, you can reduce risk through: regular physical exercise, healthy diet (Mediterranean diet), mental stimulation, social engagement, managing cardiovascular risk factors (blood pressure, cholesterol, diabetes), limiting alcohol, not smoking, and getting quality sleep.",
  },
  {
    q: 'is dementia hereditary',
    a: "Most dementia is not directly inherited. Having a family member with dementia slightly increases your risk, but lifestyle and other factors play bigger roles. Rare genetic forms exist but account for less than 5% of cases. Genetic testing is available if you have strong family history.",
  },
  {
    q: 'what is the difference between alzheimers and dementia',
    a: "Dementia is an umbrella term for symptoms affecting memory, thinking and daily abilities. Alzheimer's disease is the most common type of dementia (60-80% of cases). Other types include vascular dementia, Lewy body dementia, and frontotemporal dementia. Each has different causes and patterns.",
  },
  {
    q: 'how fast does dementia progress',
    a: "Progression varies widely by person and type. On average, people live 4-8 years after diagnosis, but some live 20+ years. Early stages may last years with mild symptoms, while later stages progress faster. Rate depends on dementia type, age, overall health, and other factors.",
  },
  {
    q: 'what medications are available for dementia',
    a: "Medications include: Cholinesterase inhibitors (donepezil, rivastigmine, galantamine) for mild to moderate Alzheimer's; Memantine for moderate to severe cases. These may temporarily improve or stabilize symptoms but don't cure or stop progression. Side effects and effectiveness vary by individual.",
  },
  {
    q: 'can stress cause dementia',
    a: "Chronic stress doesn't directly cause dementia, but it may increase risk over time by affecting brain health and cardiovascular function. Stress can also worsen symptoms in people with dementia. Managing stress through relaxation, exercise, and support is important for brain health.",
  },
  {
    q: 'should i tell someone they have dementia',
    a: "Generally, people have the right to know their diagnosis. Early disclosure allows them to participate in care planning, legal/financial decisions, and make life choices while able. Discuss with their doctor about best timing and approach. Be honest, supportive, and provide information gradually.",
  },
  {
    q: 'how can i support someone with dementia',
    a: "Be patient and compassionate; maintain routines; communicate clearly and simply; focus on their abilities, not limitations; ensure safety at home; encourage independence where possible; provide social interaction; take care of your own wellbeing; join support groups; and seek respite care when needed.",
  },
  {
    q: 'what foods help prevent dementia',
    a: "Brain-healthy foods include: fatty fish (omega-3s), berries, leafy greens, nuts, olive oil, whole grains, beans, and foods rich in antioxidants. The MIND diet (Mediterranean-DASH) combines these and may reduce dementia risk. Limit processed foods, red meat, and sugar.",
  },
  {
    q: 'what are the stages of dementia',
    a: "Dementia typically progresses through three stages: Early (mild forgetfulness, subtle changes), Middle (increased memory loss, confusion, need for assistance with daily tasks), and Late (severe memory loss, physical decline, full-time care needed). Each stage varies in duration and severity.",
  },
  {
    q: 'can young people get dementia',
    a: "Yes, though rare. Young-onset (early-onset) dementia affects people under 65. It can be caused by Alzheimer's, frontotemporal dementia, vascular issues, or genetic factors. Symptoms may be overlooked initially as stress or depression. Specialized support is available for younger patients.",
  },
  {
    q: 'how do i talk to someone with dementia',
    a: "Use simple, clear language; speak slowly and calmly; maintain eye contact; avoid arguing or correcting; give them time to respond; use non-verbal cues; reduce distractions; be patient; focus on feelings rather than facts; and validate their emotions even if reality is confused.",
  },
  {
    q: 'what is vascular dementia',
    a: "Vascular dementia is caused by reduced blood flow to the brain, often from strokes or blood vessel damage. It's the second most common type after Alzheimer's. Symptoms can appear suddenly or gradually. Prevention focuses on cardiovascular health: controlling blood pressure, cholesterol, and diabetes.",
  },
  {
    q: 'can exercise help with dementia',
    a: "Yes! Regular physical exercise (150 minutes/week of moderate activity) can reduce dementia risk by 30%, improve symptoms in those with dementia, boost mood, maintain physical function, and enhance overall quality of life. Both aerobic and strength training are beneficial.",
  },
];

export default function Chatbot({ faqs }: { faqs?: { q: string; a: string }[] } = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! How can I assist you today? I can help you navigate the app or answer questions about dementia.',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const router = useRouter();

  const quickActions = [
    { label: 'Start Scan', route: '/(tabs)/quick-scan' },
    { label: 'Play Games', route: '/(tabs)/games' },
    { label: 'Journal', route: '/(tabs)/journal' },
    { label: 'Emergency', route: '/(tabs)/emergency' },
    { label: 'Common FAQs', route: null },
  ];

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase().trim();

    // Check FAQ answers first - improved matching
    const sourceFaqs = faqs || faqAnswers;
    const matchedFaq = sourceFaqs.find(faq => {
      const faqLower = faq.q.toLowerCase();
      
      // Direct match
      if (lowerMessage.includes(faqLower)) {
        return true;
      }
      
      // Keyword matching
      const keywords = faqLower.split(' ').filter(word => word.length > 3);
      const messageWords = lowerMessage.split(' ');
      const matchCount = keywords.filter(keyword => 
        messageWords.some(word => word.includes(keyword) || keyword.includes(word))
      ).length;
      
      // If more than half of the keywords match, consider it a match
      return matchCount >= Math.ceil(keywords.length / 2);
    });

    if (matchedFaq) {
      return matchedFaq.a;
    }

    // Original bot responses for app navigation
    if (lowerMessage.includes('scan') || lowerMessage.includes('test')) {
      return 'You can take a Quick Scan for a brief assessment or a Full Scan for comprehensive testing. Would you like me to guide you there?';
    } else if (lowerMessage.includes('game') || lowerMessage.includes('play')) {
      return 'Our Games Hub includes Memory Recall, Puzzles, Math exercises, and Cooking challenges. These help keep your mind sharp!';
    } else if (lowerMessage.includes('doctor') || lowerMessage.includes('specialist')) {
      return 'You can find specialists in the Specialist Connect section. I can show you doctors near you with their availability.';
    } else if (lowerMessage.includes('emergency') || lowerMessage.includes('help')) {
      return 'For emergencies, use the Emergency tab. You can quickly call your emergency contact or medical services.';
    } else if (lowerMessage.includes('journal') || lowerMessage.includes('diary')) {
      return 'The Journal feature lets you record your thoughts, add photos, videos, or voice notes. It is a great way to track your daily experiences.';
    } else if (lowerMessage.includes('progress') || lowerMessage.includes('improvement')) {
      return 'Check your Profile to see detailed progress charts and the Improvement tab for personalized recommendations.';
    } else if (lowerMessage.includes('faq') || lowerMessage.includes('question')) {
      return 'I can answer many questions about dementia! Try asking things like: "What are early signs of dementia?", "Can dementia be prevented?", "What foods help brain health?", or "How can I support someone with dementia?"';
    } else {
      return 'I am here to help! You can ask me about dementia, scans, games, finding specialists, keeping a journal, or anything else about the app. Feel free to ask any questions!';
    }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(inputText),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 500);

    setInputText('');
  };

  const handleQuickAction = (route: string | null) => {
    if (!route) {
      // Show FAQ suggestions
      const faqMessage: Message = {
        id: Date.now().toString(),
        text: 'Here are some common questions:\n\n• What are early signs of dementia?\n• Can dementia be prevented?\n• What foods help brain health?\n• How fast does dementia progress?\n• How can I support someone with dementia?\n• What is the difference between Alzheimer\'s and dementia?\n\nFeel free to ask any question!',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, faqMessage]);
      return;
    }
    setIsVisible(false);
    router.push(route as any);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setIsVisible(true)}
        activeOpacity={0.8}
      >
        <MessageCircle color="#fff" size={28} />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.chatContainer}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Assistant</Text>
              <TouchableOpacity onPress={() => setIsVisible(false)}>
                <X color="#333" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.quickActionsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {quickActions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickActionButton}
                    onPress={() => handleQuickAction(action.route)}
                  >
                    <Text style={styles.quickActionText}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <ScrollView style={styles.messagesContainer}>
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageBubble,
                    message.sender === 'user'
                      ? styles.userMessage
                      : styles.botMessage,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      message.sender === 'user' && styles.userMessageText,
                    ]}
                  >
                    {message.text}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type your message..."
                placeholderTextColor="#999"
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSend}
                disabled={!inputText.trim()}
              >
                <Send
                  color={inputText.trim() ? '#4A90E2' : '#ccc'}
                  size={24}
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  chatContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  quickActionsContainer: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  quickActionButton: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  quickActionText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4A90E2',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    padding: 10,
  },
});