import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Animated, 
  Dimensions,
  StatusBar,
  ImageBackground
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const ArticleDetailScreen = ({ route }) => {
  const { title } = route.params;
  const navigation = useNavigation();
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);
  const [activeTab, setActiveTab] = useState('overview');

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const articles = {
    'Avian Influenza': {
      title: 'Understanding Avian Influenza (Bird Flu)',
      description: 'Avian Influenza, commonly known as Bird Flu, is a highly contagious viral infection that affects both wild and domestic birds. Key aspects include:\n\n' +
        '• Caused by Influenza A viruses\n' +
        '• Can spread to humans in certain cases\n' +
        '• High mortality in poultry populations\n' +
        '• Global concern for food security\n\n' +
        'Primary Transmission Routes:\n' +
        '🌍 Wild bird migration patterns\n' +
        '🤝 Direct bird-to-bird contact\n' +
        '👤 Human-mediated transmission\n' +
        '🧼 Contaminated equipment and surfaces',
      precautions: 'Comprehensive Prevention Measures:\n\n' +
        '🛡️ Biosecurity Essentials:\n' +
        '- Strict farm access control\n' +
        '- Regular disinfection protocols\n' +
        '- Proper waste management systems\n\n' +
        '💉 Vaccination Strategy:\n' +
        '- Implement routine vaccination\n' +
        '- Use approved vaccines\n' +
        '- Maintain proper cold chain\n\n' +
        '🧤 Personal Protection:\n' +
        '- Use proper PPE when handling birds\n' +
        '- Practice good hand hygiene\n' +
        '- Avoid contact with wild birds\n\n' +
        '🔍 Monitoring & Surveillance:\n' +
        '- Regular health checks\n' +
        '- Immediate reporting of symptoms\n' +
        '- Collaboration with veterinary authorities',
      remedies: 'Management and Control Measures:\n\n' +
        '💊 Veterinary Interventions:\n' +
        '- Antiviral medications (Oseltamivir, Zanamivir)\n' +
        '- Supportive care for affected birds\n' +
        '- Proper disposal of infected carcasses\n\n' +
        '🌿 Natural Supportive Measures:\n' +
        '- Garlic water for immune support\n' +
        '- Turmeric for anti-inflammatory benefits\n' +
        '- Probiotics for gut health\n\n' +
        '🚨 Outbreak Response:\n' +
        '- Immediate quarantine measures\n' +
        '- Rapid culling of infected flocks\n' +
        '- Thorough disinfection of premises\n\n' +
        '⚠️ Important Note:\n' +
        'Always consult with veterinary professionals for proper diagnosis and treatment plans.',
      images: {
        whatIs: [
          require('../assets/Avian1.jpg'),
          require('../assets/Avian2.jpg'),
          require('../assets/Avian3.jpg'),
          require('../assets/Avian4.jpg'),
        ],
        precautions: [
          require('../disease/EDSPrevention1.jpg'),
          require('../assets/AvianVaccine2.jpg'),
          require('../assets/AvianVaccine3.png'),
          require('../assets/AvianVaccine4.jpg'),
        ],
        remedies: [
          require('../assets/Avianmedicine.jpg'),
          require('../assets/Avianmedicine2.jpg'),
          require('../disease/FowlPoxMedicine3.jpg'),
          require('../assets/Avianmedicine4.jpg'),
        ],
      },
    },
    'Newcastle Disease': {
      title: 'Understanding Newcastle Disease',
      description: 'Newcastle Disease is a highly contagious viral infection that poses a significant threat to poultry worldwide. This disease primarily affects:\n\n' +
        '• Respiratory system\n' +
        '• Nervous system\n' +
        '• Digestive system\n\n' +
        'Key characteristics include:\n' +
        '• Rapid spread through air and direct contact\n' +
        '• High mortality rates (up to 100% in severe cases)\n' +
        '• Seasonal outbreaks during weather transitions\n' +
        '• Severe impact on commercial poultry operations',
      precautions: 'Essential Prevention Strategies:\n\n' +
        '🛡️ Biosecurity Measures:\n' +
        '- Strict quarantine protocols\n' +
        '- Controlled farm access\n' +
        '- Regular disinfection routines\n\n' +
        '💉 Vaccination Program:\n' +
        '- Implement routine vaccination\n' +
        '- Maintain proper vaccine storage\n' +
        '- Follow recommended schedules\n\n' +
        '🧼 Hygiene Practices:\n' +
        '- Daily cleaning of facilities\n' +
        '- Proper waste management\n' +
        '- Regular equipment sterilization',
      remedies: 'Management and Treatment Options:\n\n' +
        '⚠️ Immediate Actions:\n' +
        '- Isolate infected birds immediately\n' +
        '- Implement strict quarantine measures\n' +
        '- Notify local veterinary authorities\n\n' +
        '💊 Supportive Care:\n' +
        '- Provide electrolyte solutions\n' +
        '- Maintain optimal temperature\n' +
        '- Ensure proper ventilation\n\n' +
        '🚨 Critical Consideration:\n' +
        'Due to the extremely high mortality rate (99%) and rapid spread, culling of infected birds is often the most effective containment strategy to protect the remaining flock.',
      images: {
        whatIs: [
          require('../assets/Newcastle.jpg'),
          require('../assets/Newcastle2.jpg'),
          require('../assets/Newcastle3.jpg'),
          require('../disease/FeverDisease1.jpg'),
        ],
        precautions: [
          require('../disease/EDSPrevention1.jpg'),
          require('../assets/AvianVaccine2.jpg'),
          require('../assets/AvianVaccine3.png'),
          require('../assets/AvianVaccine4.jpg'),
        ],
        remedies: [
          require('../assets/NewcastleMedicine.jpg'),
          require('../assets/NewcastleMedicine2.jpg'),
          require('../assets/NewcastleMedicine3.jpg'),
          require('../assets/NewcastleMedicine4.jpeg'),
        ],
      },
    },

    // 'Coccidiosis'
    'Coccidiosis': {
      title: 'Understanding Coccidiosis',
      description: 'Coccidiosis is a parasitic disease caused by protozoa of the genus Eimeria. It primarily affects the intestinal tract of poultry, leading to:\n\n' +
        '• Severe diarrhea\n' +
        '• Weight loss\n' +
        '• Reduced feed efficiency\n' +
        '• Increased mortality in young birds\n\n' +
        'Key characteristics include:\n' +
        '• Common in young chicks (2-6 months old)\n' +
        '• Spread through contaminated feed, water, or litter\n' +
        '• Can cause long-term damage to the intestinal lining\n' +
        '• Significant economic losses in poultry farming',
      precautions: 'Essential Prevention Strategies:\n\n' +
        '🛡️ Biosecurity Measures:\n' +
        '- Maintain clean and dry litter\n' +
        '- Protect them from mosquitoes.\n' +
        '- Avoid overcrowding in poultry houses\n' +
        '- Regularly clean and disinfect feeders and waterers\n\n' +
        '💊 Vaccination Program:\n' +
        '- Use live vaccines for young chicks\n' +
        '- Follow proper vaccination schedules\n' +
        '- Monitor vaccine efficacy\n\n' +
        '🧼 Hygiene Practices:\n' +
        '- Provide clean drinking water\n' +
        '- Remove wet litter promptly\n' +
        '- Prevent access to contaminated areas',
      remedies: 'Management and Treatment Options:\n\n' +
        '⚠️ Immediate Actions:\n' +
        '- Isolate infected birds\n' +
        '- Provide supportive care (electrolytes, vitamins)\n' +
        '- Notify a veterinarian for proper diagnosis\n\n' +
        '💊 Medicines:\n' +
        '- Use medicines like Amprolium, Sulfadimethoxine, or Toltrazuril (Veterinary Store)\n' +
        '- OR\n' +
        '- For 1-2 months old chickens, divide one Disprin tablet into 8 parts and give one part daily for 8 days. And give some powder of velocsef capsule according to weight of chick\n' +
        '- For 2-6 months old chickens, divide one Disprin tablet into 4 parts and give one part daily for 8 days. And give some powder of velocsef capsule according to weight of chick\n' +
        '- Follow dosage instructions carefully\n' +
        '- Rotate drugs to prevent resistance\n\n' +
        '🌿 Natural Supportive Measures:\n' +
        '- Add apple cider vinegar to drinking water (2 cap of bottle in 1 litter water)\n' +
        '- Provide boiled egg daily or protein based diets like dry worms.\n' +
        '- Provide a balanced diet to boost immunity',
      images: {
        whatIs: [
          require('../assets/Coccidiosis1.jpg'),
          require('../assets/Coccidiosis2.jpg'),
          require('../assets/Coccidiosis3.jpg'),
          require('../assets/Coccidiosis4.jpg'),
        ],
        precautions: [
          require('../assets/CoccidiosisPrevention1.jpg'),
          require('../disease/SalmonellosisPrevention2.jpg'),
          require('../assets/CoccidiosisPrevention3.jpg'),
          require('../disease/FowlPoxPrevention1.jpg'),
        ],
        remedies: [
          require('../assets/CoccidiosisMedicine1.jpg'),
          require('../assets/CoccidiosisMedicine2.jpg'),
          require('../assets/CoccidiosisMedicine3.jpg'),
          require('../assets/CoccidiosisMedicine4.png'),
        ],
      },
    },
    // "Marek's Disease"
    "Marek's Disease": {
      title: "Understanding Marek's Disease",
      description: "Marek's Disease is a highly contagious viral disease in chickens caused by a herpesvirus. Key aspects include:\n\n" +
        "• Affects the nervous system\n" +
        "• Causes tumors in internal organs\n" +
        "• High mortality in young birds\n" +
        "• Spread through feather dander and dust\n\n" +
        "Primary Symptoms:\n" +
        "🐔 Paralysis of legs and wings\n" +
        "👀 Grey eye or blindness\n" +
        "💀 Sudden death in young birds",
      precautions: "Prevention Strategies:\n\n" +
        "🛡️ Vaccination:\n" +
        "- Vaccinate day-old chicks\n" +
        "- Use effective vaccines (e.g., HVT, SB-1)\n" +
        "- Maintain proper vaccine storage\n\n" +
        "🧼 Biosecurity:\n" +
        "- Isolate new birds for 2 weeks\n" +
        "- Regularly disinfect the coop\n" +
        "- Control wild bird access\n\n" +
        "⚠️ Important:\n" +
        "Once infected, birds remain carriers for life.",
      remedies: "Management and Treatment:\n\n" +
        "💊 No Cure:\n" +
        "- There is no cure for Marek's Disease\n" +
        "- Focus on prevention through vaccination\n\n" +
        "🌿 Supportive Care:\n" +
        "- Provide a stress-free environment\n" +
        "- Ensure proper nutrition\n" +
        "- Isolate affected birds immediately\n\n" +
        "🚨 Critical Note:\n" +
        "Culling of infected birds is often necessary to prevent spread.",
      images: {
        whatIs: [
          require('../disease/Marek1.jpg'),
          require('../disease/Marek2.jpg'),
          require('../disease/Marek3.jpg'),
          require('../disease/Marek4.jpg'),
        ],
        precautions: [
          require('../disease/MarekPrevention1.jpg'),
          require('../disease/MarekPrevention2.jpg'),
          require('../disease/MarekPrevention3.jpg'),
          require('../disease/MarekPrevention4.jpg'),
        ],
        remedies: [
          require('../disease/MarekMedicine1.jpg'),
          require('../disease/MarekMedicine2.png'),
          require('../disease/MarekMedicine3.jpg'),
          require('../disease/MarekMedicine4.jpg'),
        ],
      },
    },

    // Infectious Bronchitis
    "Infectious Bronchitis": {
      title: "Understanding Infectious Bronchitis",
      description: "Infectious Bronchitis is a highly contagious viral respiratory disease in poultry. Key aspects include:\n\n" +
        "• Fever and Stress\n" +
        "• Affects the respiratory tract\n" +
        "• Can lead to secondary infections\n" +
        "• Significant economic losses in poultry farming",
      precautions: "Prevention Strategies:\n\n" +
        "🛡️ Vaccination:\n" +
        "- Vaccinate chicks at an early age\n" +
        "- Use live or inactivated vaccines\n" +
        "- Follow proper vaccination schedules\n\n" +
        "🧼 Biosecurity:\n" +
        "- Maintain proper ventilation\n" +
        "- Avoid overcrowding\n" +
        "- Regularly disinfect the coop",
      remedies: "Management and Treatment:\n\n" +
        "💊 Supportive Care:\n" +
        "- Provide warm and dry housing\n" +
        "- Add vitamins to drinking water\n" +
        "- Ensure proper nutrition\n\n" +
        "⚠️ Important:\n" +
        "There is no specific treatment for the virus. Focus on preventing secondary infections.",
      images: {
        whatIs: [
          require('../disease/Bronchitis1.jpg'),
          require('../disease/Bronchitis2.jpg'),
          require('../disease/Bronchitis3.jpg'),
        ],
        precautions: [
          require('../disease/BronchitisPrevention1.jpg'),
          require('../disease/BronchitisPrevention2.jpg'),
          require('../disease/SalmonellosisPrevention1.jpg'),
          require('../disease/SalmonellosisPrevention2.jpg'),
        ],
        remedies: [
          require('../disease/BronchitisMedicine1.png'),
          require('../disease/BronchitisMedicine2.png'),
          require('../disease/AspergillosisMedicine2.jpg'),
          require('../disease/BronchitisMedicine4.png'),
        ],
      },
    },
    // Fowl Pox
    "Fowl Pox": {
      title: "Understanding Fowl Pox",
      description: "Fowl Pox is a slow-spreading viral disease in poultry. Key aspects include:\n\n" +
        "• Caused by the Avipoxvirus\n" +
        "• Two forms: Dry (cutaneous) and Wet (diphtheritic)\n" +
        "• Spread through mosquitoes and direct contact\n" +
        "• Can cause reduced egg production",
      precautions: "Prevention Strategies:\n\n" +
        "🛡️ Vaccination:\n" +
        "- Vaccinate birds at 6-8 weeks of age\n" +
        "- Use fowl pox vaccine\n" +
        "- Follow proper vaccination schedules\n\n" +
        "🧼 Biosecurity:\n" +
        "- Control mosquito populations\n" +
        "- Isolate infected birds\n" +
        "- Regularly disinfect the coop",
      remedies: "Management and Treatment:\n\n" +
        "💊 Supportive Care:\n" +
        "- Provide a stress-free environment\n" +
        "- Add vitamins to drinking water\n" +
        "- Ensure proper nutrition\n\n" +
        "⚠️ Important:\n" +
        "There is no specific treatment for fowl pox. Focus on preventing secondary infections.",
      images: {
        whatIs: [
          require('../disease/FowlPox1.jpg'),
          require('../disease/FowlPox2.jpg'),
          require('../disease/FowlPox3.jpg'),
          require('../disease/FowlPox4.jpg'),
        ],
        precautions: [
          require('../disease/FowlPoxPrevention1.jpg'),
          require('../disease/FowlPoxPrevention2.jpg'),
        ],
        remedies: [
          require('../disease/FowlPoxMedicine1.jpg'),
          require('../disease/FowlPoxMedicine2.jpeg'),
          require('../disease/FowlPoxMedicine3.jpg'),
          require('../disease/FowlPoxMedicine4.jpg'),
        ],
      },
    },

    // Salmonellosis
    "Salmonellosis": {
      title: "Understanding Salmonellosis",
      description: "Salmonellosis is a bacterial infection caused by Salmonella species. Key aspects include:\n\n" +
        "• Affects the digestive system\n" +
        "• Can spread to humans (zoonotic)\n" +
        "• Causes diarrhea, dehydration, and weight loss\n" +
        "• Significant economic losses in poultry farming",
      precautions: "Prevention Strategies:\n\n" +
        "🛡️ Biosecurity:\n" +
        "- Maintain proper hygiene\n" +
        "- Avoid contaminated feed and water\n" +
        "- Regularly disinfect the coop\n\n" +
        "🧤 Personal Protection:\n" +
        "- Use gloves when handling birds\n" +
        "- Wash hands thoroughly after contact",
      remedies: "Management and Treatment:\n\n" +
        "💊 Antibiotics:\n" +
        "- Use antibiotics like Enrofloxacin or Amoxicillin\n" +
        "- Follow veterinary advice\n\n" +
        "🌿 Supportive Care:\n" +
        "- Provide electrolytes in drinking water\n" +
        "- Ensure proper nutrition\n\n" +
        "⚠️ Important:\n" +
        "Early diagnosis and treatment are crucial.",
      images: {
        whatIs: [
          require('../disease/Salmonellosis1.jpg'),
          require('../disease/Salmonellosis2.jpg'),
          require('../disease/Salmonellosis3.jpg'),
          require('../disease/Salmonellosis4.png'),
        ],
        precautions: [
          require('../disease/SalmonellosisPrevention1.jpg'),
          require('../disease/SalmonellosisPrevention2.jpg'),
          require('../disease/SalmonellosisPrevention3.png'),
          require('../disease/SalmonellosisPrevention4.jpg'),
        ],
        remedies: [
          require('../disease/SalmonellosisMedicine1.jpg'),
          require('../disease/SalmonellosisMedicine2.jpg'),
          require('../disease/SalmonellosisMedicine3.jpg'),
          require('../disease/SalmonellosisMedicine4.jpg'),
        ],
      },
    },

    // Aspergillosis
    "Aspergillosis": {
      title: "Understanding Aspergillosis",
      description: "Aspergillosis is a fungal infection caused by Aspergillus species. It primarily affects the respiratory system of birds. Key aspects include:\n\n" +
        "• Caused by inhaling fungal spores\n" +
        "• Common in birds with weak immune systems\n" +
        "• Can lead to severe respiratory distress\n" +
        "• High mortality if untreated\n\n" +
        "Primary Symptoms:\n" +
        "🐔 Difficulty breathing\n" +
        "👀 Nasal discharge\n" +
        "💤 Lethargy and reduced appetite\n" +
        "🌡️ Swollen sinuses",
      precautions: "Prevention Strategies:\n\n" +
        "🛡️ Environmental Control:\n" +
        "- Maintain proper ventilation\n" +
        "- Avoid damp and moldy litter\n" +
        "- Regularly clean and disinfect the coop\n\n" +
        "🧼 Hygiene Practices:\n" +
        "- Provide clean drinking water\n" +
        "- Remove wet litter promptly\n" +
        "- Store feed in dry and clean conditions\n\n" +
        "⚠️ Important:\n" +
        "Preventing fungal growth is key to avoiding Aspergillosis.",
      remedies: "Management and Treatment:\n\n" +
        "💊 Antifungal Medications:\n" +
        "- Use antifungal drugs like Itraconazole or Amphotericin B\n" +
        "- Follow veterinary advice for dosage\n\n" +
        "🌿 Supportive Care:\n" +
        "- Provide a warm and dry environment\n" +
        "- Add vitamins to drinking water\n" +
        "- Ensure proper nutrition\n\n" +
        "🚨 Critical Note:\n" +
        "Early diagnosis and treatment are crucial to prevent high mortality.",
      images: {
        whatIs: [
          require('../disease/Aspergillosis1.jpg'),
          require('../disease/Aspergillosis2.jpg'),
          require('../disease/Aspergillosis3.jpg'),
          require('../disease/Aspergillosis4.jpg'),
        ],
        precautions: [
          require('../disease/AspergillosisPrevention1.jpg'),
          require('../disease/AspergillosisPrevention2.jpg'),
          require('../disease/SalmonellosisPrevention2.jpg'),
          require('../disease/BronchitisPrevention1.jpg'),
        ],
        remedies: [
          require('../disease/AspergillosisMedicine1.jpg'),
          require('../disease/AspergillosisMedicine2.jpg'),
          require('../disease/FowlPoxMedicine1.jpg'),
        ],
      },
    },

    // Egg Drop Syndrome
    "Egg Drop Syndrome": {
      title: "Understanding Egg Drop Syndrome",
      description: "Egg Drop Syndrome (EDS) is a viral disease that affects laying hens, leading to a sudden drop in egg production. Key aspects include:\n\n" +
        "• Caused by an adenovirus\n" +
        "• Affects egg quality and quantity\n" +
        "• Eggs may be shell-less or have thin shells\n" +
        "• Can spread through contaminated equipment or vertically\n\n" +
        "Primary Symptoms:\n" +
        "🥚 Sudden drop in egg production\n" +
        "🐔 Normal appetite and behavior\n" +
        "🥚 Misshapen or soft-shelled eggs\n" +
        "⚠️ No other visible signs of illness",
      precautions: "Prevention Strategies:\n\n" +
        "🛡️ Vaccination:\n" +
        "- Vaccinate hens before they start laying\n" +
        "- Use inactivated EDS vaccines\n" +
        "- Follow proper vaccination schedules\n\n" +
        "🧼 Biosecurity:\n" +
        "- Disinfect equipment and tools regularly\n" +
        "- Avoid introducing infected birds\n" +
        "- Practice strict farm hygiene\n\n" +
        "⚠️ Important:\n" +
        "Preventing the introduction of the virus is key to avoiding EDS.",
      remedies: "Management and Treatment:\n\n" +
        "💊 No Specific Treatment:\n" +
        "- There is no specific antiviral treatment for EDS\n" +
        "- Focus on supportive care and prevention\n\n" +
        "🌿 Supportive Care:\n" +
        "- Provide a balanced diet rich in calcium\n" +
        "- Ensure proper lighting and housing conditions\n" +
        "- Minimize stress in the flock\n\n" +
        "🚨 Critical Note:\n" +
        "Recovery can take several weeks, and egg production may not return to normal levels.",
      images: {
        whatIs: [
          require('../disease/EDSDisease1.jpg'),
          require('../disease/EDSDisease2.jpg'),
          require('../disease/EDSDisease3.jpg'),
        ],
        precautions: [
          require('../disease/EDSPrevention1.jpg'),
          require('../disease/SalmonellosisPrevention2.jpg'),
          require('../disease/SalmonellosisPrevention1.jpg'),
        ],
        remedies: [
          require('../disease/EDSMedicine1.jpg'),
          require('../disease/EDSMedicine2.jpg'),
          require('../disease/EDSMedicine3.jpg'),
        ],
      },
    },
    // Infectious Coryza
    "Infectious Coryza": {
        title: "Understanding Infectious Coryza",
        description: "Infectious Coryza is a bacterial respiratory disease caused by Avibacterium paragallinarum. It primarily affects chickens and can lead to significant economic losses. Key aspects include:\n\n" +
          "• Highly contagious\n" +
          "• Affects the upper respiratory tract\n" +
          "• Can cause secondary infections\n" +
          "• Spread through direct contact or contaminated equipment\n\n" +
          "Primary Symptoms:\n" +
          "🐔 Swelling of the face and wattles\n" +
          "👃 Nasal discharge and sneezing\n" +
          "👀 Watery eyes and conjunctivitis\n" +
          "💤 Reduced appetite and lethargy",
        precautions: "Prevention Strategies:\n\n" +
          "🛡️ Biosecurity:\n" +
          "- Isolate new birds for at least 2 weeks\n" +
          "- Avoid mixing birds from different sources\n" +
          "- Regularly disinfect equipment and coops\n\n" +
          "💉 Vaccination:\n" +
          "- Use bacterins or live vaccines\n" +
          "- Follow proper vaccination schedules\n\n" +
          "🧤 Hygiene Practices:\n" +
          "- Provide clean drinking water\n" +
          "- Maintain proper ventilation\n" +
          "- Remove wet litter promptly",
        remedies: "Management and Treatment:\n\n" +
          "💊 Antibiotics:\n" +
          "- Use antibiotics like Erythromycin or Oxytetracycline\n" +
          "- Follow veterinary advice for dosage\n\n" +
          "🌿 Supportive Care:\n" +
          "- Provide a warm and dry environment\n" +
          "- Add vitamins to drinking water\n" +
          "- Ensure proper nutrition\n\n" +
          "🚨 Critical Note:\n" +
          "Early treatment is crucial to prevent severe outbreaks and secondary infections.",
        images: {
          whatIs: [
            require('../disease/CoryzaDisease1.jpg'),
            require('../disease/CoryzaDisease2.jpg'),
            require('../disease/CoryzaDisease3.png'),
            require('../disease/CoryzaDisease4.jpg'),
          ],
          precautions: [
            require('../disease/EDSPrevention1.jpg'),
            require('../disease/SalmonellosisPrevention2.jpg'),
            require('../disease/SalmonellosisPrevention1.jpg'),
            require('../disease/AspergillosisPrevention2.jpg'),
          ],
          remedies: [
            require('../disease/CoryzaMedicine1.jpg'),
            require('../disease/FowlPoxMedicine1.jpg'),
            require('../disease/FowlPoxMedicine3.jpg'),
          ],
        },
      },
  
      // Cold in Chickens
      "Cold": {
        title: "Understanding Cold in Chickens",
        description: "Cold in chickens is a common respiratory issue, often caused by sudden temperature changes, poor ventilation, or exposure to damp conditions. Key aspects include:\n\n" +
          "• Not a disease but a condition caused by environmental factors\n" +
          "• Can weaken the immune system, leading to secondary infections\n" +
          "• More common in colder seasons or poorly ventilated coops\n" +
          "• Preventable with proper care and management\n\n" +
          "Primary Symptoms:\n" +
          "🐔 Mild sneezing and coughing\n" +
          "👃 Clear nasal discharge\n" +
          "🥶 Fluffed-up feathers and shivering\n" +
          "💤 Reduced activity and appetite",
        precautions: "Prevention Strategies:\n\n" +
          "🛡️ Coop Management:\n" +
          "- Ensure proper ventilation without direct drafts\n" +
          "- Keep bedding dry and clean\n" +
          "- Provide additional warmth during extreme cold\n\n" +
          "🍲 Nutrition Boost:\n" +
          "- Offer a balanced diet rich in vitamins\n" +
          "- Add garlic or apple cider vinegar to drinking water\n\n" +
          "🚰 Hydration & Cleanliness:\n" +
          "- Always provide fresh and clean water\n" +
          "- Avoid overcrowding to reduce stress",
        remedies: "Management and Treatment:\n\n" +
          "🌿 Natural Remedies:\n" +
          "- Warm water with honey to soothe the throat\n" +
          "- Herbal teas like chamomile for respiratory relief\n\n" +
          "💊 Supportive Care:\n" +
          "- Increase protein intake for immune support\n" +
          "- Provide dry and warm resting areas\n" +
          "- Use steam therapy to ease breathing\n\n" +
          "🚨 Critical Note:\n" +
          "Monitor for worsening symptoms like severe respiratory distress, which may indicate a secondary infection requiring veterinary attention.",
        images: {
          whatIs: [
            require('../disease/ColdDisease1.jpg'),
            require('../disease/ColdDisease2.jpg'),
            require('../disease/ColdDisease3.jpg'),
            require('../disease/ColdDisease4.jpg'),
          ],
          precautions: [
            require('../disease/MarekMedicine4.jpg'),
            require('../assets/CoccidiosisMedicine4.png'),
            require('../disease/SalmonellosisPrevention1.jpg'),
            require('../disease/SalmonellosisPrevention2.jpg'),
          ],
          remedies: [
            require('../disease/ColdMedicine1.jpg'),
            require('../disease/ColdMedicine2.jpg'),
          ],
        },
      },
  
      // Canker
      "Canker": {
        title: "Understanding Canker in Chickens",
        description: "Canker is a protozoal disease caused by *Trichomonas gallinae*. It primarily affects the upper digestive tract of chickens and other birds. Key aspects include:\n\n" +
          "• Affects the mouth, throat, and crop\n" +
          "• Can spread through contaminated water or direct contact\n" +
          "• More common in warm and humid conditions\n" +
          "• Can lead to weight loss and breathing difficulties\n\n" +
          "Primary Symptoms:\n" +
          "🐔 Yellowish-white lesions in the mouth\n" +
          "👃 Bad breath and difficulty swallowing\n" +
          "🥄 Thickened mucus in the throat\n" +
          "💤 Lethargy and loss of appetite",
        precautions: "Prevention Strategies:\n\n" +
          "🚰 Water & Food Hygiene:\n" +
          "- Provide clean and fresh water daily\n" +
          "- Avoid feeding spoiled or contaminated food\n\n" +
          "🛡️ Biosecurity Measures:\n" +
          "- Isolate infected birds immediately\n" +
          "- Clean and disinfect feeders and drinkers regularly\n\n" +
          "🌿 Environmental Control:\n" +
          "- Reduce  comoisture in theop\n" +
          "- Prevent wild birds from accessing feed and water",
        remedies: "Management and Treatment:\n\n" +
          "💊 Medications:\n" +
          "- Use antiprotozoal drugs like Metronidazole (under vet guidance)\n" +
          "- Follow the prescribed dosage strictly\n\n" +
          "🌿 Natural Support:\n" +
          "- Apple cider vinegar in drinking water\n" +
          "- Garlic and probiotics to boost immunity\n\n" +
          "🚨 Critical Note:\n" +
          "Early detection and treatment are crucial to prevent severe complications and spread within the flock.",
        images: {
          whatIs: [
            require('../disease/CankerDisease1.jpg'),
            require('../disease/CankerDisease2.jpg'),
            require('../disease/CankerDisease3.jpg'),
            require('../disease/CankerDisease4.jpg'),
          ],
          precautions: [
            require('../disease/SalmonellosisPrevention1.jpg'),
            require('../disease/SalmonellosisPrevention2.jpg'),
            require('../disease/CankerPrevention3.jpg'),
            require('../disease/MarekMedicine4.jpg'),
          ],
          remedies: [
            require('../disease/FowlPoxMedicine1.jpg'),
            require('../disease/ColdMedicine2.jpg'),
          ],
        },
      },
  
  
      // Fever
      "Fever": {
        title: "Understanding Fever in Chickens",
        description: "Fever in chickens is a symptom rather than a disease. It can be caused by infections, heat stress, or inflammation. Key aspects include:\n\n" +
          "• Often a sign of underlying illness\n" +
          "• Can be due to bacterial, viral, or fungal infections\n" +
          "• May result from overheating or dehydration\n" +
          "• Requires monitoring for additional symptoms\n\n" +
          "Primary Symptoms:\n" +
          "🌡️ Increased body temperature (hot to touch)\n" +
          "🥵 Lethargy and reduced activity\n" +
          "🐔 Pale or flushed comb and wattles\n" +
          "💧 Reduced water intake and dehydration",
        precautions: "Prevention Strategies:\n\n" +
          "🛡️ General Health Monitoring:\n" +
          "- Regularly check for infections or injuries\n" +
          "- Ensure a clean and stress-free environment\n\n" +
          "🚰 Hydration & Cooling:\n" +
          "- Provide cool, clean water at all times\n" +
          "- Offer electrolytes during hot weather\n\n" +
          "🧤 Biosecurity & Nutrition:\n" +
          "- Isolate sick birds to prevent disease spread\n" +
          "- Maintain a balanced diet with vitamins",
        remedies: "Management and Treatment:\n\n" +
          "💊 Medical Support:\n" +
          "- Consult a vet for antibiotics if bacterial infection is suspected\n" +
          "- Use anti-inflammatory medication under veterinary guidance\n\n" +
          "🌿 Natural Support:\n" +
          "- Apple cider vinegar to boost immunity\n" +
          "- Garlic and turmeric for natural anti-inflammatory benefits\n\n" +
          "🚨 Critical Note:\n" +
          "Persistent fever may indicate serious illness requiring immediate veterinary attention.",
        images: {
          whatIs: [
            require('../disease/FeverDisease1.jpg'),
            require('../disease/FeverDisease2.jpg'),
          ],
          precautions: [
            require('../disease/SalmonellosisPrevention2.jpg'),
            require('../disease/SalmonellosisMedicine2.jpg'),
            require('../disease/FeverPrevention3.jpg'),
            require('../disease/FeverPrevention4.jpg'),
          ],
          remedies: [
            require('../disease/ColdMedicine1.jpg'),
            require('../disease/FeverMedicine2.jpg'),
          ],
        },
      },
  
  
      // Mucus
      "Mucus": {
        title: "Understanding Mucus in Chickens",
        description: "Mucus buildup in chickens is usually a sign of respiratory infections or environmental issues. Key aspects include:\n\n" +
          "• Often linked to bacterial or viral infections\n" +
          "• Can be triggered by poor ventilation or dust\n" +
          "• May lead to breathing difficulties if untreated\n" +
          "• Requires early intervention to prevent complications\n\n" +
          "Primary Symptoms:\n" +
          "👃 Thick nasal discharge or mucus buildup\n" +
          "😮 Open-mouth breathing or wheezing\n" +
          "😪 Frequent sneezing and coughing\n" +
          "💤 Lethargy and loss of appetite",
        precautions: "Prevention Strategies:\n\n" +
          "💨 Ventilation & Air Quality:\n" +
          "- Keep the coop well-ventilated but draft-free\n" +
          "- Reduce dust by using low-dust bedding\n\n" +
          "🛡️ Hygiene & Clean Water:\n" +
          "- Regularly clean the coop and feeders\n" +
          "- Provide fresh, uncontaminated drinking water\n\n" +
          "🦠 Disease Control:\n" +
          "- Isolate sick birds to prevent disease spread\n" +
          "- Avoid overcrowding to reduce stress and infection risks",
        remedies: "Management and Treatment:\n\n" +
          "💊 Medications:\n" +
          "- Use antibiotics like Tylosin or Oxytetracycline (vet recommended)\n" +
          "- Steam therapy to ease respiratory discomfort\n\n" +
          "🌿 Natural Remedies:\n" +
          "- Add garlic and apple cider vinegar to drinking water\n" +
          "- Herbal steam with eucalyptus for easier breathing\n\n" +
          "🚨 Critical Note:\n" +
          "Persistent mucus may indicate chronic respiratory disease requiring veterinary intervention.",
        images: {
          whatIs: [
            require('../disease/MucusDisease1.jpeg'),
            require('../disease/MucusDisease2.jpg'),
            require('../disease/MucusDisease3.png'),
          ],
          precautions: [
            require('../disease/SalmonellosisPrevention2.jpg'),
          ],
          remedies: [
            require('../disease/SalmonellosisMedicine1.jpg'),
            require('../disease/MucusMedicine2.jpg'),
            require('../disease/FowlPoxMedicine3.jpg'),
          ],
        },
      },
      // Leg Swelling
      "Leg Swelling": {
        title: "Understanding Leg Swelling in Chickens",
        description: "Leg swelling in chickens can be caused by infections, injuries, nutritional deficiencies, or underlying diseases. Key aspects include:\n\n" +
          "• Can result from bacterial infections like Bumblefoot\n" +
          "• May indicate nutritional deficiencies (e.g., Vitamin B2)\n" +
          "• Injuries or joint inflammation are common causes\n" +
          "• Requires early diagnosis to prevent mobility issues\n\n" +
          "Primary Symptoms:\n" +
          "🐔 Swollen legs or joints\n" +
          "🚶 Limping or difficulty walking\n" +
          "🦶 Scabs, redness, or heat in the affected area\n" +
          "💤 Lethargy and reluctance to move",
        precautions: "Prevention Strategies:\n\n" +
          "🦵 Injury Prevention:\n" +
          "- Provide soft and clean bedding\n" +
          "- Ensure perches are at a safe height\n\n" +
          "🥦 Proper Nutrition:\n" +
          "- Provide a balanced diet rich in vitamins and minerals\n" +
          "- Ensure access to calcium and Vitamin B2 (Riboflavin)\n\n" +
          "🧼 Hygiene & Biosecurity:\n" +
          "- Regularly clean the coop and perches\n" +
          "- Inspect birds for early signs of leg infections",
        remedies: "Management and Treatment:\n\n" +
          "💊 Medications:\n" +
          "- Apply antibiotic ointment for bacterial infections\n" +
          "- Use anti-inflammatory medicine under veterinary guidance\n\n" +
          "🌿 Natural Support:\n" +
          "- Soak legs in warm water with Epsom salt\n" +
          "- Turmeric and garlic for natural anti-inflammatory benefits\n\n" +
          "🚨 Critical Note:\n" +
          "Persistent swelling may indicate serious conditions like Mycoplasma Synoviae or Gout. Consult a vet for accurate diagnosis.",
        images: {
          whatIs: [
            require('../disease/LegSwellingDisease1.jpg'),
            require('../disease/LegSwellingDisease2.jpg'),
            require('../disease/LegSwellingDisease3.jpg'),
            require('../disease/LegSwellingDisease4.jpg'),
          ],
          precautions: [
            require('../disease/LegSwellingPrevention1.jpg'),
            require('../disease/LegSwellingPrevention2.jpg'),
            require('../disease/LegSwellingPrevention3.jpg'),
          ],
          remedies: [
            require('../disease/FowlPoxMedicine4.jpg'),
            require('../disease/FowlPoxMedicine1.jpg'),
            require('../disease/FowlPoxMedicine2.jpeg'),
          ],
        },
      },
  
      // H-9 Disease
      "H-9 Disease": {
        title: "Understanding H-9 Disease in Chickens",
        description: "H-9 Disease, also known as Infectious Bronchitis, is a viral respiratory disease caused by the Infectious Bronchitis Virus (IBV). It primarily affects the respiratory system of chickens. Key aspects include:\n\n" +
          "• Highly contagious viral infection\n" +
          "• Affects the respiratory, renal, and reproductive systems\n" +
          "• Can cause significant egg production loss\n" +
          "• Spread through direct contact and contaminated feed or water\n\n" +
          "Primary Symptoms:\n" +
          "🐔 Coughing, sneezing, and nasal discharge\n" +
          "😷 Swollen eyes and facial swelling\n" +
          "💧 Watery eyes and mucus discharge\n" +
          "🥚 Reduced egg production and misshapen eggs",
        precautions: "Prevention Strategies:\n\n" +
          "🛡️ Biosecurity Measures:\n" +
          "- Isolate new birds for at least 2 weeks\n" +
          "- Disinfect all equipment and coops regularly\n\n" +
          "💉 Vaccination:\n" +
          "- Use live or killed vaccines to prevent the disease\n" +
          "- Follow proper vaccination schedules for your flock\n\n" +
          "🌿 Environmental Control:\n" +
          "- Provide proper ventilation and avoid overcrowding\n" +
          "- Keep feed and water sources clean and uncontaminated",
        remedies: "Management and Treatment:\n\n" +
          "💊 Medications:\n" +
          "- Use antibiotics like Oxytetracycline to prevent secondary bacterial infections\n" +
          "- Administer antiviral drugs if available and under veterinary guidance\n\n" +
          "🌿 Natural Support:\n" +
          "- Provide warm water with electrolytes to boost hydration\n" +
          "- Add garlic and apple cider vinegar to drinking water for immunity support\n\n" +
          "🚨 Critical Note:\n" +
          "H-9 Disease can lead to severe economic losses due to reduced egg production and the spread of infection. Immediate action and vaccination are essential.",
        images: {
          whatIs: [
            require('../disease/H9Disease1.jpg'),
            require('../disease/H9Disease2.jpg'),
            require('../disease/H9Disease3.jpg'),
            require('../disease/H9Disease4.png'),
          ],
          precautions: [
            require('../disease/EDSPrevention1.jpg'),
            require('../disease/SalmonellosisPrevention2.jpg'),
          ],
          remedies: [
            require('../disease/BronchitisMedicine1.png'),
            require('../disease/FeverMedicine2.jpg'),
            require('../disease/H9Medicine3.jpg'),
            require('../disease/H9Medicine4.jpg'),
          ],
        },
      },
  
  
      // Eye Infection
      "Eye Infection": {
        title: "Understanding Eye Infection in Chickens",
        description: "Eye infection in chickens is typically caused by bacterial, viral, or environmental factors. It can lead to discomfort and vision problems, often affecting the respiratory system as well. Key aspects include:\n\n" +
          "• Commonly caused by bacterial infections like Mycoplasma or viral infections like Infectious Laryngotracheitis\n" +
          "• Can be triggered by poor environmental conditions such as dust or ammonia\n" +
          "• May lead to blindness if untreated\n" +
          "• Spread through direct contact or contaminated equipment\n\n" +
          "Primary Symptoms:\n" +
          "👀 Swelling around the eyes\n" +
          "💧 Watery eyes and discharge\n" +
          "😷 Conjunctivitis (pink eye)\n" +
          "🐔 Squinting or rubbing eyes\n" +
          "🌡️ Increased eye irritation and sensitivity to light",
        precautions: "Prevention Strategies:\n\n" +
          "🧼 Biosecurity & Hygiene:\n" +
          "- Maintain a clean environment and avoid overcrowding\n" +
          "- Disinfect equipment and coops regularly\n\n" +
          "💨 Air Quality & Ventilation:\n" +
          "- Ensure proper ventilation to prevent dust accumulation\n" +
          "- Avoid excessive ammonia build-up in the coop\n\n" +
          "🦠 Isolation & Monitoring:\n" +
          "- Isolate infected birds to prevent the spread of infection\n" +
          "- Regularly check for early signs of eye infections",
        remedies: "Management and Treatment:\n\n" +
          "💊 Medical Treatment:\n" +
          "- Administer antibiotics like Oxytetracycline for bacterial infections\n" +
          "- Consult a vet for antiviral treatment if necessary\n\n" +
          "🌿 Natural Remedies:\n" +
          "- Use saline solution to flush the eyes and reduce irritation\n" +
          "- Apply honey or aloe vera gel around the eye area for soothing\n\n" +
          "🚨 Critical Note:\n" +
          "If the infection persists or worsens, consult a veterinarian for proper treatment to prevent long-term eye damage.",
        images: {
          whatIs: [
            require('../disease/EyeInfection1.jpg'),
            require('../disease/EyeInfection2.jpg'),
            require('../disease/EyeInfection4.jpg'),
          ],
          precautions: [
            require('../disease/CankerPrevention3.jpg'),
            require('../disease/EyeInfectionPrevention2.jpg'),
          ],
          remedies: [
            require('../disease/EyeInfectionMedicine1.jpg'),
          ],
        },
      },
  
  
      // Cough
      "Cough": {
        title: "Understanding Cough in Chickens",
        description: "Coughing in chickens can be a symptom of respiratory infections, irritants, or environmental stress. It is often associated with diseases like Avian Influenza, Mycoplasmosis, or respiratory infections. Key aspects include:\n\n" +
          "• Often caused by bacterial, viral, or fungal infections\n" +
          "• Can be triggered by poor air quality, dust, or ammonia\n" +
          "• May be accompanied by other respiratory symptoms like nasal discharge or wheezing\n" +
          "• Requires attention to prevent the spread of infection\n\n" +
          "Primary Symptoms:\n" +
          "🤧 Persistent coughing or wheezing\n" +
          "👃 Nasal discharge and sneezing\n" +
          "🐔 Difficulty breathing or open-mouth breathing\n" +
          "💧 Watery eyes and facial swelling",
        precautions: "Prevention Strategies:\n\n" +
          "🧼 Biosecurity & Hygiene:\n" +
          "- Maintain clean bedding and coops\n" +
          "- Regularly disinfect equipment to prevent infection spread\n\n" +
          "💨 Air Quality & Ventilation:\n" +
          "- Ensure proper ventilation in the coop to reduce dust and ammonia\n" +
          "- Avoid overcrowding to maintain good airflow\n\n" +
          "💉 Vaccination & Health Monitoring:\n" +
          "- Vaccinate for common respiratory diseases\n" +
          "- Isolate sick birds to prevent the spread of infection",
        remedies: "Management and Treatment:\n\n" +
          "💊 Medical Treatment:\n" +
          "- Consult a vet for antibiotics if a bacterial infection is suspected\n" +
          "- Use anti-inflammatory or expectorant medication under professional guidance\n\n" +
          "🌿 Natural Remedies:\n" +
          "- Use garlic and honey in drinking water for natural antimicrobial effects\n" +
          "- Add ginger or turmeric to improve respiratory health\n\n" +
          "🚨 Critical Note:\n" +
          "If coughing persists or worsens, consult a veterinarian for a more accurate diagnosis and treatment plan.",
        images: {
          whatIs: [
            require('../disease/CoughDisease1.jpg'),
          ],
          precautions: [
            require('../disease/EDSPrevention1.jpg'),
            require('../disease/EyeInfectionPrevention2.jpg'),
            require('../disease/SalmonellosisPrevention2.jpg'),
          ],
          remedies: [
            require('../disease/FowlPoxMedicine3.jpg'),
            require('../disease/CoughMedicine2.jpg'),
            require('../disease/CoughMedicine3.jpg'),
          ],
        },
      },
  
  
      // Bumblefoot
      "BumbleFoot": {
        title: "Understanding Bumblefoot in Chickens",
        description: "Bumblefoot is a common condition in chickens, primarily caused by bacterial infections that affect the feet, leading to swelling, abscesses, and discomfort. Key aspects include:\n\n" +
          "• Caused by bacteria, typically Staphylococcus aureus\n" +
          "• Often results from injury or rough surfaces in the coop\n" +
          "• Can lead to lameness if untreated\n" +
          "• More common in overweight chickens or those with poor foot health\n\n" +
          "Primary Symptoms:\n" +
          "🐔 Swollen foot or leg\n" +
          "👣 Visible abscess or pus in the foot pad\n" +
          "🥴 Lameness or limping\n" +
          "😖 Pain or discomfort when walking",
        precautions: "Prevention Strategies:\n\n" +
          "🧼 Clean and Safe Environment:\n" +
          "- Ensure bedding is soft and free from rough surfaces\n" +
          "- Regularly clean the coop to prevent infection\n\n" +
          "🦵 Foot Health:\n" +
          "- Trim nails regularly to prevent injury\n" +
          "- Maintain proper hygiene and check feet for injuries\n\n" +
          "⚖️ Proper Weight Management:\n" +
          "- Ensure chickens are not overweight, as excess weight can increase the risk of injury",
        remedies: "Management and Treatment:\n\n" +
          "💊 Medical Treatment:\n" +
          "- Use antibiotics to treat bacterial infections (under veterinary guidance)\n" +
          "- Clean the wound with antiseptic and apply topical antibiotics\n\n" +
          "🦶 Foot Care:\n" +
          "- Soak the foot in warm, salty water to reduce swelling and encourage healing\n" +
          "- Apply a bandage if necessary to protect the foot\n\n" +
          "🚨 Critical Note:\n" +
          "If left untreated, bumblefoot can lead to severe infection and permanent damage, requiring veterinary care.",
        images: {
          whatIs: [
            require('../disease/BumbleFootDisease1.jpg'),
            require('../disease/BumbleFootDisease2.jpg'),
            require('../disease/BumbleFootDisease3.jpg'),
            require('../disease/BumbleFootDisease4.png'),
          ],
          precautions: [
            require('../disease/BumbleFootPrevention1.jpg'),
          ],
          remedies: [
            require('../disease/FowlPoxMedicine4.jpg'),
            require('../disease/BumbleFootMedicine2.jpg'),
          ],
        },
      },
      // Paralysis
    "Paralysis": {
        title: "Understanding Paralysis in Chickens",
        description: "Paralysis in chickens is a condition where the bird loses the ability to move its legs or other parts of its body. It can be caused by several underlying factors, including neurological diseases, infections, or injury. Key aspects include:\n\n" +
          "• Often caused by viral or bacterial infections (such as Marek's Disease or Newcastle Disease)\n" +
          "• Can result from injury or trauma to the spinal cord or nervous system\n" +
          "• May be a sign of other systemic issues like poisoning or vitamin deficiencies\n" +
          "• Requires immediate attention to diagnose and treat the underlying cause\n\n" +
          "Primary Symptoms:\n" +
          "🦵 Loss of leg movement or weakness\n" +
          "🐔 Unable to stand or walk\n" +
          "😖 Inability to lift wings or use them properly\n" +
          "🍽️ Reduced appetite and lethargy",
        precautions: "Prevention Strategies:\n\n" +
          "🛡️ Vaccination & Biosecurity:\n" +
          "- Vaccinate against common viral diseases like Marek's Disease and Newcastle Disease\n" +
          "- Isolate infected birds to prevent the spread of disease\n\n" +
          "⚖️ Healthy Diet & Environment:\n" +
          "- Ensure chickens have a balanced diet with sufficient vitamins, especially Vitamin E and B12\n" +
          "- Maintain clean, safe living conditions to reduce stress and prevent injury\n\n" +
          "💉 Early Detection:\n" +
          "- Regularly monitor chickens for signs of paralysis or other neurological symptoms\n" +
          "- Consult a vet if paralysis is observed for prompt diagnosis and treatment",
        remedies: "Management and Treatment:\n\n" +
          "💊 Medical Support:\n" +
          "- Consult a vet to identify the cause of paralysis (may require tests for viruses or toxins)\n" +
          "- Use antibiotics or antiviral medications as prescribed by a vet\n\n" +
          "🌿 Supportive Care:\n" +
          "- Provide extra warmth and a comfortable environment to help the bird recover\n" +
          "- Administer vitamin supplements, especially Vitamin E, to support nerve function\n\n" +
          "🚨 Critical Note:\n" +
          "Paralysis can be a serious condition that may require veterinary intervention to determine the cause and provide proper treatment.",
        images: {
          whatIs: [
            require('../disease/ParalysisDisease1.jpg'),
            require('../disease/ParalysisDisease2.jpg'),
            require('../disease/ParalysisDisease3.jpg'),
            require('../disease/ParalysisDisease4.jpg'),
          ],
          precautions: [
            require('../disease/EDSPrevention1.jpg'),
            require('../disease/EDSMedicine2.jpg'),
            require('../disease/MarekPrevention1.jpg'),
          ],
          remedies: [
            require('../disease/ParalysisMedicine1.jpeg'),
            require('../disease/MarekMedicine1.jpg'),
            require('../disease/MarekMedicine3.jpg'),
            require('../disease/MarekMedicine4.jpg'),
          ],
        },
      },
   // Lethargy
      "Lethargy": {
        title: "Understanding Lethargy in Chickens",
        description: "Lethargy in chickens refers to a state of extreme tiredness or lack of energy. It is a common symptom of various underlying conditions, ranging from infections to nutritional deficiencies. Key aspects include:\n\n" +
          "• Often a sign of illness or stress\n" +
          "• Can result from infections, parasites, or vitamin deficiencies\n" +
          "• May be caused by environmental factors like temperature extremes or poor living conditions\n" +
          "• Requires a thorough investigation to identify the root cause\n\n" +
          "Primary Symptoms:\n" +
          "🐔 Reduced activity and movement\n" +
          "🍽️ Loss of appetite or reduced feeding\n" +
          "🥱 Sleeping more than usual\n" +
          "😞 Weakness or inability to stand or walk properly",
        precautions: "Prevention Strategies:\n\n" +
          "🧼 Clean and Comfortable Environment:\n" +
          "- Ensure a clean, dry, and well-ventilated living space\n" +
          "- Provide appropriate bedding and a safe place for chickens to rest\n\n" +
          "🍽️ Balanced Diet:\n" +
          "- Offer a balanced diet with sufficient vitamins and minerals, particularly B vitamins and Vitamin E\n" +
          "- Regularly check the food and water for contamination\n\n" +
          "🛡️ Disease Prevention:\n" +
          "- Vaccinate against common chicken diseases\n" +
          "- Monitor for signs of infections and seek veterinary care when needed",
        remedies: "Management and Treatment:\n\n" +
          "💊 Medical Treatment:\n" +
          "- Consult a vet to rule out infections, parasites, or other health issues\n" +
          "- Use antibiotics or antiparasitic medications if prescribed by the vet\n\n" +
          "🌿 Supportive Care:\n" +
          "- Provide a stress-free environment with plenty of rest and warmth\n" +
          "- Offer electrolyte solutions to prevent dehydration\n\n" +
          "🚨 Critical Note:\n" +
          "Lethargy can be a sign of a serious underlying issue. Immediate attention is necessary to prevent worsening conditions.",
        images: {
          whatIs: [
            require('../assets/Coccidiosis3.jpg'),
            require('../disease/LethargyDisease2.jpg'),
            require('../disease/LethargyDisease3.jpg'),
            require('../disease/LethargyDisease4.jpg'),
          ],
          precautions: [
            require('../disease/FowlPoxPrevention1.jpg'),
            require('../disease/FowlPoxPrevention2.jpg'),
            require('../disease/SalmonellosisPrevention2.jpg'),
          ],
          remedies: [
            require('../disease/FowlPoxMedicine1.jpg'),
            require('../disease/ColdMedicine1.jpg'),
            require('../assets/CoccidiosisMedicine1.jpg'),
            require('../assets/CoccidiosisMedicine3.jpg'),
          ],
        },
      },
  
  
      // Stomach Blockage
      "Stomach Blockage": {
        title: "Understanding Stomach Blockage in Chickens",
        description: "Stomach blockage in chickens occurs when the digestive tract is obstructed, preventing the normal movement of food through the system. This condition can be caused by various factors, including poor diet, ingestion of foreign objects, or infection. Key aspects include:\n\n" +
          "• Often caused by improper diet or ingestion of non-food items\n" +
          "• Can result in digestive distress or more severe conditions like impacted crops\n" +
          "• Requires prompt intervention to prevent further complications\n\n" +
          "Primary Symptoms:\n" +
          "🍽️ Loss of appetite or refusal to eat\n" +
          "🐔 Swollen or distended abdomen\n" +
          "💧 Reduced water intake or dehydration\n" +
          "💩 Abnormal or no droppings\n",
        precautions: "Prevention Strategies:\n\n" +
          "🍽️ Balanced Diet:\n" +
          "- Provide a proper, balanced diet that includes fiber, vitamins, and minerals\n" +
          "- Avoid feeding chickens food items that may cause blockage, such as large seeds or plastic\n\n" +
          "🧼 Clean Living Space:\n" +
          "- Regularly clean the coop and remove any foreign objects that chickens could ingest\n" +
          "- Ensure chickens have access to fresh, clean water at all times\n\n" +
          "🛡️ Regular Health Checks:\n" +
          "- Monitor for any signs of digestive distress, such as loss of appetite or abnormal droppings\n" +
          "- Seek prompt veterinary attention if symptoms persist",
        remedies: "Management and Treatment:\n\n" +
          "💊 Medical Treatment:\n" +
          "- Consult a vet to determine the severity and cause of the blockage\n" +
          "- Treatment may include gentle massage, fluids, or the use of medications to help clear the blockage\n\n" +
          "🌿 Supportive Care:\n" +
          "- Provide extra warmth and comfort to help ease digestive discomfort\n" +
          "- Offer easily digestible foods and ensure adequate hydration\n\n" +
          "🚨 Critical Note:\n" +
          "If the blockage is not cleared or if symptoms worsen, surgery may be required. Seek veterinary care as soon as possible.",
        images: {
          whatIs: [
            require('../disease/StomachBlockageDisease1.jpg'),
            require('../disease/StomachBlockageDisease2.png'),
            require('../disease/StomachBlockageDisease3.jpg'),
            require('../disease/StomachBlockageDisease4.jpg'),
          ],
          precautions: [
            require('../assets/AvianVaccine4.jpg'),
            require('../disease/SalmonellosisPrevention2.jpg'),
          ],
          remedies: [
            require('../disease/StomachBlockageMedicine1.jpg'),
            require('../disease/StomachBlockageMedicine2.jpg'),
            require('../disease/StomachBlockageMedicine3.jpg'),
          ],
        },
      },
  
  
      // Infectious Bursal Disease
      "Infection Bursal Disease": {
        title: "Understanding Infectious Bursal Disease in Chickens",
        description: "Infectious Bursal Disease (IBD), also known as Gumboro disease, is a highly contagious viral infection that affects chickens, particularly young birds. The disease targets the bursa of Fabricius, an important organ for the immune system. Key aspects include:\n\n" +
          "• Caused by a virus that weakens the immune system\n" +
          "• Primarily affects young chickens under 6 weeks of age\n" +
          "• Highly contagious and can spread rapidly in flocks\n" +
          "• Can lead to immunosuppression, making chickens more susceptible to secondary infections\n\n" +
          "Primary Symptoms:\n" +
          "🤢 Lethargy and reduced activity\n" +
          "💩 Diarrhea (often watery and grayish)\n" +
          "🐔 Swollen bursa or abdomen\n" +
          "🦠 Loss of appetite and poor weight gain",
        precautions: "Prevention Strategies:\n\n" +
          "🛡️ Vaccination:\n" +
          "- Use vaccines to prevent the spread of IBD, particularly in young birds\n" +
          "- Follow proper vaccination schedules and use appropriate vaccines for the region\n\n" +
          "🌱 Biosecurity Measures:\n" +
          "- Isolate new or sick birds to prevent the spread of the virus\n" +
          "- Disinfect equipment and living areas regularly\n\n" +
          "🧼 Good Management Practices:\n" +
          "- Maintain a stress-free environment\n" +
          "- Ensure proper nutrition and hydration for all chickens",
        remedies: "Management and Treatment:\n\n" +
          "💊 Supportive Care:\n" +
          "- There is no specific antiviral treatment for IBD\n" +
          "- Supportive care includes providing a stress-free environment and good nutrition\n\n" +
          "🌿 Secondary Infection Prevention:\n" +
          "- Administer antibiotics if secondary bacterial infections occur\n" +
          "- Keep the birds well-hydrated and provide electrolytes to combat dehydration\n\n" +
          "🚨 Critical Note:\n" +
          "IBD is a highly contagious disease. Early vaccination and strict biosecurity are key to preventing outbreaks.",
        images: {
          whatIs: [
            require('../disease/InfectiousBursalDisease1.jpg'),
            require('../disease/InfectiousBursalDisease2.jpg'),
            require('../disease/InfectiousBursalDisease3.jpg'),
            require('../disease/InfectiousBursalDisease4.jpg'),
          ],
          precautions: [
            require('../disease/StomachBlockageMedicine2.jpg'),
          ],
          remedies: [
            require('../disease/SalmonellosisPrevention2.jpg'),
          ],
        },
      },
  // Candidiasis
      "Candidiasis": {
        title: "Understanding Candidiasis in Chickens",
        description: "Candidiasis, also known as Thrush, is a fungal infection caused by the Candida species. It typically affects the digestive and respiratory systems of chickens, leading to a range of symptoms. Key aspects include:\n\n" +
          "• Caused by an overgrowth of the Candida fungus\n" +
          "• Can affect the crop, throat, and intestines\n" +
          "• Often associated with stress, poor nutrition, or antibiotic use\n" +
          "• Can lead to reduced feed intake, weight loss, and general weakness\n\n" +
          "Primary Symptoms:\n" +
          "🦠 White, cheesy lesions in the mouth, crop, or throat\n" +
          "🍽️ Loss of appetite or difficulty eating\n" +
          "🐔 Lethargy and weakness\n" +
          "💩 Diarrhea or abnormal droppings",
        precautions: "Prevention Strategies:\n\n" +
          "🧼 Good Hygiene:\n" +
          "- Regularly clean the chicken’s environment, including feeders and waterers\n" +
          "- Disinfect equipment to prevent fungal spores from spreading\n\n" +
          "🍽️ Balanced Diet:\n" +
          "- Provide a balanced diet to avoid stress on the immune system\n" +
          "- Avoid overuse of antibiotics, as they can disrupt gut flora and promote fungal overgrowth\n\n" +
          "🛡️ Stress Management:\n" +
          "- Minimize stress by maintaining a clean, quiet environment\n" +
          "- Ensure chickens have ample space, proper ventilation, and adequate hydration",
        remedies: "Management and Treatment:\n\n" +
          "💊 Antifungal Medication:\n" +
          "- Use antifungal medications such as Nystatin or Fluconazole under veterinary guidance\n" +
          "- Follow prescribed treatment doses and duration\n\n" +
          "🌿 Natural Remedies:\n" +
          "- Adding apple cider vinegar to the water can help restore gut balance\n" +
          "- Probiotics may also be beneficial for restoring normal gut flora\n\n" +
          "🚨 Critical Note:\n" +
          "Candidiasis can be difficult to treat, especially if it progresses. Early intervention is important to prevent severe health issues.",
        images: {
          whatIs: [
            require('../disease/CandidiasisDisease1.jpg'),
            require('../disease/CankerDisease3.jpg'),
          ],
          precautions: [
            require('../disease/SalmonellosisPrevention2.jpg'),
            require('../disease/MarekPrevention1.jpg'),
          ],
          remedies: [
            require('../disease/FowlPoxMedicine1.jpg'),
            require('../disease/AspergillosisMedicine1.jpg'),
            require('../disease/FowlPoxMedicine3.jpg'),
          ],
        },
      },
  // Vitamin A Deficiency
      "Vitamin A Deficiency": {
        title: "Understanding Vitamin A Deficiency in Chickens",
        description: "Vitamin A deficiency is a common nutritional problem in chickens, especially when their diet lacks adequate amounts of this essential vitamin. Vitamin A is vital for vision, growth, immune function, and overall health. Key aspects include:\n\n" +
          "• Caused by inadequate intake of Vitamin A-rich foods or supplements\n" +
          "• Can lead to poor growth, weak immunity, and reproductive issues\n" +
          "• Affects vision and can lead to blindness if untreated\n" +
          "• Common in birds fed low-quality or unbalanced diets\n\n" +
          "Primary Symptoms:\n" +
          "👁️ Poor vision or blindness\n" +
          "🍽️ Reduced appetite and poor growth\n" +
          "🐔 Swollen eyes or crusty eyelids\n" +
          "🦠 Respiratory issues and nasal discharge",
        precautions: "Prevention Strategies:\n\n" +
          "🍽️ Balanced Diet:\n" +
          "- Ensure the chickens are receiving a diet rich in Vitamin A, including leafy greens, carrots, and liver\n" +
          "- Use quality poultry feed that contains adequate amounts of Vitamin A\n\n" +
          "🧴 Vitamin Supplements:\n" +
          "- Add Vitamin A supplements to the feed or drinking water, especially if natural sources are insufficient\n" +
          "- Follow veterinary guidelines for supplementation to avoid overdosing\n\n" +
          "🧼 Good Management Practices:\n" +
          "- Provide clean, fresh water at all times\n" +
          "- Reduce stress by maintaining a comfortable living environment",
        remedies: "Management and Treatment:\n\n" +
          "💊 Vitamin A Supplementation:\n" +
          "- Provide Vitamin A-rich supplements to correct the deficiency\n" +
          "- Consult a vet for the correct dosage based on the severity of the deficiency\n\n" +
          "🌿 Nutritional Support:\n" +
          "- Ensure a well-balanced diet with a variety of vegetables and fruits that are rich in Vitamin A\n" +
          "- Offer vitamin-rich foods like carrots, kale, spinach, and liver\n\n" +
          "🚨 Critical Note:\n" +
          "Early correction of Vitamin A deficiency is crucial to prevent permanent damage, especially to vision and immunity.",
        images: {
          whatIs: [
            require('../disease/VitaminADeficiency1.jpg'),
            require('../disease/VitaminADeficiency2.jpg'),
            require('../disease/VitaminADeficiency3.jpg'),
            require('../disease/VitaminADeficiency4.jpg'),
          ],
          precautions: [
            require('../disease/SalmonellosisPrevention2.jpg'),
            require('../disease/MarekPrevention1.jpg'),
            require('../disease/VitaminADeficiencyPrevention3.jpg'),
            // require('../disease/VitaminADeficiencyPrevention4.jpg'),
          ],
          remedies: [
            require('../disease/CalciumDeficiencyPrevention2.jpg'),
            require('../disease/VitaminADeficiencyPrevention4.jpg'),
            // require('../disease/EDSMedicine2.jpg'),
          ],
        },
      },
  
  
      // Vitamin D Deficiency
      "Vitamin D Deficiency": {
        title: "Understanding Vitamin D Deficiency in Chickens",
        description: "Vitamin D deficiency is a common nutritional issue in chickens, leading to impaired calcium metabolism and various health problems. Vitamin D is essential for proper bone development, egg production, and immune function. Key aspects include:\n\n" +
          "• Caused by insufficient exposure to sunlight or lack of Vitamin D in the diet\n" +
          "• Leads to poor bone development, weak bones, and leg deformities\n" +
          "• Affects calcium absorption, leading to poor eggshell quality and egg production\n" +
          "• Can increase susceptibility to infections and stress\n\n" +
          "Primary Symptoms:\n" +
          "🦴 Weak, soft, or deformed bones\n" +
          "🐔 Lameness or difficulty walking\n" +
          "🍳 Poor eggshell quality (thin or soft shells)\n" +
          "🐣 Reduced egg production or irregular laying patterns",
        precautions: "Prevention Strategies:\n\n" +
          "☀️ Sunlight Exposure:\n" +
          "- Ensure chickens have access to natural sunlight for several hours a day\n" +
          "- Provide outdoor areas or well-lit coops to promote Vitamin D synthesis\n\n" +
          "🍽️ Vitamin D-Rich Diet:\n" +
          "- Feed chickens with a diet containing adequate levels of Vitamin D, such as fortified poultry feed\n" +
          "- Include foods like fish oil, liver, or other natural sources of Vitamin D in their diet\n\n" +
          "🧴 Vitamin D Supplements:\n" +
          "- Supplement the diet with Vitamin D if sunlight exposure is limited\n" +
          "- Consult a vet for the proper dosage and supplementation guidelines",
        remedies: "Management and Treatment:\n\n" +
          "💊 Vitamin D Supplementation:\n" +
          "- Administer Vitamin D supplements to correct the deficiency\n" +
          "- Follow veterinary advice to avoid over-supplementation and toxicity\n\n" +
          "🌿 Natural Sources:\n" +
          "- Offer Vitamin D-rich foods like fish oil, liver, or egg yolks\n" +
          "- Ensure chickens have access to natural sunlight or provide UVB light in enclosed spaces\n\n" +
          "🚨 Critical Note:\n" +
          "Vitamin D deficiency can cause long-term damage to bones and egg production. Early intervention is crucial for preventing severe health issues.",
        images: {
          whatIs: [
            require('../disease/VitaminDDeficiency1.jpg'),
            require('../disease/EDSDisease1.jpg'),
          ],
          precautions: [
            require('../disease/VitaminDDeficiencyPrevention1.jpg'),
            require('../disease/VitaminDDeficiencyPrevention2.jpg'),
            require('../disease/EDSMedicine2.jpg'),
          ],
          remedies: [
            require('../disease/VitaminDDeficiencyMedicine1.jpg'),
            require('../disease/VitaminDDeficiencyPrevention2.jpg'),
            require('../disease/EDSMedicine2.jpg'),
          ],
        },
      },
  
  
      // Calcium Deficiency
      "Calcium Deficiency": {
        title: "Understanding Calcium Deficiency in Chickens",
        description: "Calcium deficiency is a common nutritional disorder in chickens, leading to poor bone health and reduced egg production. Calcium is essential for bone strength, muscle function, and the production of strong eggshells. Key aspects include:\n\n" +
          "• Caused by insufficient calcium intake or poor absorption\n" +
          "• Leads to weak bones, egg shell abnormalities, and reproductive problems\n" +
          "• Common in hens with high egg production rates\n" +
          "• Requires monitoring of calcium-rich food intake and supplementation\n\n" +
          "Primary Symptoms:\n" +
          "🦴 Weak bones or leg deformities\n" +
          "🍳 Thin or soft eggshells\n" +
          "🐔 Reduced egg production\n" +
          "🐣 Laying of shell-less eggs or broken eggs",
        precautions: "Prevention Strategies:\n\n" +
          "🍽️ Calcium-Rich Diet:\n" +
          "- Provide a balanced diet with adequate calcium levels, including foods like crushed oyster shells, limestone, or calcium supplements\n" +
          "- Offer calcium-rich grains and vegetables such as kale, broccoli, and spinach\n\n" +
          "🧴 Proper Supplementation:\n" +
          "- Add calcium supplements to the feed if the chickens are not getting enough from their diet\n" +
          "- Ensure hens have access to a consistent calcium source, especially during peak egg production\n\n" +
          "🧼 Good Management Practices:\n" +
          "- Provide clean, fresh water at all times\n" +
          "- Ensure a stress-free and comfortable living environment to improve calcium absorption",
        remedies: "Management and Treatment:\n\n" +
          "💊 Calcium Supplements:\n" +
          "- Provide calcium supplements such as limestone, oyster shell grit, or calcium carbonate\n" +
          "- Consult a vet for the correct dosage and type of calcium supplement\n\n" +
          "🌿 Natural Sources:\n" +
          "- Include calcium-rich foods like leafy greens, dairy, or fish bones in their diet\n" +
          "- Ensure that hens have access to high-quality poultry feed with the right calcium levels\n\n" +
          "🚨 Critical Note:\n" +
          "Calcium deficiency can lead to permanent bone damage and poor egg production. Timely intervention is essential for maintaining health and productivity.",
        images: {
          whatIs: [
            require('../disease/VitaminDDeficiency1.jpg'),
            require('../disease/EDSDisease1.jpg'),
          ],
          precautions: [
            require('../disease/EDSMedicine2.jpg'),
            require('../disease/CalciumDeficiencyPrevention2.jpg'),
            require('../disease/SalmonellosisPrevention2.jpg'),
          ],
          remedies: [
            require('../disease/VitaminADeficiencyPrevention4.jpg'),
            require('../disease/AspergillosisMedicine1.jpg'),
          ],
        },
      },
   // Respiratory Issues
      "Respiratory Issues": {
        title: "Understanding Respiratory Issues in Chickens",
        description: "Respiratory issues in chickens can be caused by infections, environmental factors, or poor management practices. These issues can lead to severe health problems and reduced productivity. Key aspects include:\n\n" +
          "• Caused by viruses, bacteria, fungi, or environmental stressors\n" +
          "• Can lead to pneumonia, sinus infections, or other respiratory diseases\n" +
          "• Poor ventilation, overcrowding, and exposure to pollutants can exacerbate the issue\n" +
          "• Requires prompt diagnosis and management\n\n" +
          "Primary Symptoms:\n" +
          "🐔 Labored breathing or coughing\n" +
          "👃 Nasal discharge and sneezing\n" +
          "👀 Watery eyes or conjunctivitis\n" +
          "💨 Wheezing or open-mouthed breathing\n" +
          "💤 Lethargy and reduced appetite",
        precautions: "Prevention Strategies:\n\n" +
          "🛡️ Good Ventilation:\n" +
          "- Ensure proper airflow and ventilation in the coop\n" +
          "- Avoid overcrowding and ensure chickens have enough space to breathe freely\n\n" +
          "🧴 Biosecurity Measures:\n" +
          "- Isolate new or sick birds to prevent disease spread\n" +
          "- Regularly disinfect equipment and coops to prevent the buildup of pathogens\n\n" +
          "🌿 Environmental Management:\n" +
          "- Minimize exposure to dust, ammonia fumes, and other harmful pollutants\n" +
          "- Keep the coop dry and clean, ensuring that bedding is regularly changed",
        remedies: "Management and Treatment:\n\n" +
          "💊 Medical Support:\n" +
          "- Consult a vet for antibiotics or antiviral medications if necessary\n" +
          "- Use anti-inflammatory drugs or nebulizers under veterinary guidance\n\n" +
          "🌿 Natural Support:\n" +
          "- Provide a warm, dry, and well-ventilated environment\n" +
          "- Offer herbs like oregano, garlic, and thyme for their natural antimicrobial properties\n\n" +
          "🚨 Critical Note:\n" +
          "Respiratory issues can quickly lead to more serious conditions like pneumonia. Early diagnosis and treatment are crucial to prevent complications.",
        images: {
          whatIs: [
            require('../assets/Newcastle3.jpg'),
            require('../disease/Aspergillosis4.jpg'),
            require('../disease/LethargyDisease4.jpg'),
          ],
          precautions: [
            require('../disease/SalmonellosisPrevention2.jpg'),
            require('../disease/SalmonellosisPrevention1.jpg'),
            require('../disease/MarekPrevention1.jpg'),
            require('../disease/MarekPrevention4.jpg'),
          ],
          remedies: [
            require('../disease/BronchitisMedicine1.png'),
            require('../disease/FeverMedicine2.jpg'),
            require('../disease/H9Medicine3.jpg'),
            require('../disease/H9Medicine4.jpg'),
          ],
        },
      }
  };

  const article = articles[title] || articles['Avian Influenza'];

  const TabButton = ({ id, label, icon, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTab]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons 
        name={icon} 
        size={20} 
        color={isActive ? '#FFFFFF' : '#E68A50'} 
      />
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const SectionCard = ({ title, content, images, icon }) => (
    <Animated.View 
      style={[
        styles.sectionCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <LinearGradient
        colors={['#FFFFFF', '#FFF8F5']}
        style={styles.cardGradient}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name={icon} size={24} color="#E68A50" />
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.imageContainer}
          contentContainerStyle={styles.imageScrollContainer}
        >
          {images.map((image, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={image} style={styles.image} />
              <LinearGradient
                colors={['transparent', 'rgba(230, 138, 80, 0.1)']}
                style={styles.imageOverlay}
              />
            </View>
          ))}
        </ScrollView>

        <View style={styles.contentContainer}>
          <Text style={styles.sectionContent}>{content}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#E68A50" />
      
      {/* Enhanced Header */}
      <LinearGradient
        colors={['#E68A50', '#D17A45', '#BC6F3A']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <View style={styles.backButtonInner}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.headerSubtitle}>
              Comprehensive Guide & Treatment
            </Text>
          </View>

          <TouchableOpacity style={styles.shareButton} activeOpacity={0.7}>
            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Decorative Elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Critical Recommendation for Newcastle Disease */}
        {title === 'Newcastle Disease' && (
          <Animated.View 
            style={[
              styles.warningCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <LinearGradient
              colors={['#FFF3CD', '#FFF8DC']}
              style={styles.warningGradient}
            >
              <View style={styles.warningHeader}>
                <MaterialCommunityIcons name="alert-circle" size={28} color="#FF6B35" />
                <Text style={styles.warningTitle}>Critical Alert</Text>
              </View>
              <Text style={styles.warningText}>
                Due to the extremely high mortality rate (99%) and rapid transmission, 
                immediate culling of infected birds is strongly recommended to protect your flock.
              </Text>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TabButton
            id="overview"
            label="Overview"
            icon="information-outline"
            isActive={activeTab === 'overview'}
            onPress={() => setActiveTab('overview')}
          />
          <TabButton
            id="prevention"
            label="Prevention"
            icon="shield-check-outline"
            isActive={activeTab === 'prevention'}
            onPress={() => setActiveTab('prevention')}
          />
          <TabButton
            id="treatment"
            label="Treatment"
            icon="medical-bag"
            isActive={activeTab === 'treatment'}
            onPress={() => setActiveTab('treatment')}
          />
        </View>

        {/* Content Sections */}
        <View style={styles.contentWrapper}>
          {activeTab === 'overview' && (
            <SectionCard
              title={article.title}
              content={article.description}
              images={article.images.whatIs}
              icon="information-outline"
            />
          )}

          {activeTab === 'prevention' && (
            <SectionCard
              title="Prevention Strategies"
              content={article.precautions}
              images={article.images.precautions}
              icon="shield-check-outline"
            />
          )}

          {activeTab === 'treatment' && (
            <SectionCard
              title="Management & Treatment"
              content={article.remedies}
              images={article.images.remedies}
              icon="medical-bag"
            />
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <LinearGradient
            colors={['#E68A50', '#D17A45']}
            style={styles.footerGradient}
          >
            <MaterialCommunityIcons name="medical-bag" size={32} color="#FFFFFF" />
            <Text style={styles.footerTitle}>Professional Veterinary Care</Text>
            <Text style={styles.footerText}>
              Always consult with a qualified veterinarian for accurate diagnosis and treatment
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: StatusBar.currentHeight + 10,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: '#E68A50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  backButton: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  shareButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -40,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  scrollView: {
    flex: 1,
  },
  warningCard: {
    margin: 20,
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  warningGradient: {
    padding: 20,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginLeft: 10,
  },
  warningText: {
    fontSize: 16,
    color: '#8B4513',
    lineHeight: 24,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 5,
    elevation: 3,
    shadowColor: '#E68A50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: '#E68A50',
    elevation: 2,
    shadowColor: '#E68A50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E68A50',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  contentWrapper: {
    paddingHorizontal: 20,
  },
  sectionCard: {
    marginBottom: 20,
    borderRadius: 20,
    elevation: 6,
    shadowColor: '#E68A50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(230, 138, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  imageContainer: {
    marginHorizontal: 10,
  },
  imageScrollContainer: {
    paddingHorizontal: 10,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  image: {
    width: 220,
    height: 160,
    borderRadius: 15,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    borderRadius: 15,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 15,
  },
  sectionContent: {
    fontSize: 16,
    color: '#34495E',
    lineHeight: 26,
    fontWeight: '400',
  },
  footer: {
    margin: 20,
    marginTop: 30,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#E68A50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  footerGradient: {
    padding: 25,
    alignItems: 'center',
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
});