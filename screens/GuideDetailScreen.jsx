import React, { useMemo, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    Dimensions,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const GuideDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { monthId } = route.params || {};

    useEffect(() => {
        if (!monthId) {
            Alert.alert('Error', 'Invalid month ID. Please try again.');
            navigation.goBack();
        }
    }, [monthId, navigation]);

    // Guide content (keeping your existing content structure)
    const guideContent = useMemo(() => ({
        '0-1': {
            title: '0-1 Month Guide',
            subtitle: 'Critical First Month Care',
            icon: '🐣',
            description: `The first 30 days are extremely important for chicks. Because there is a risk of Gumboro disease until they reach 1 month of age.

First Day: Give jaggery(Gur) water to clean their stomach.
Second Day: Introduce soft food like bread.
Third Day & Onward: Start feeding them No. 4 feed, and if you can afford it, provide fly larvae and boiled eggs. For 5 chicks, 1 egg is enough; use this formula for the quantity based on the number of chicks you have. If you are giving larvae, offer a small quantity, about 8-10 pieces per chick.`,
            precautions: `🛑 Essential Precautions:
- Always keep your chick's coop clean, as the start of many diseases comes from dirt and poor hygiene. Cleanliness is essential for their health and well-being.
- Keep brooder at 95°F, reduce by 5°F weekly.
- If your chicks are not with their mother and you don't have a brooder, keep them in a proper cotton box or a cage. 
- Cover the coton box or cage properly from all sides with a plastic sheet, but make sure to cover it in a way that prevents ammonia buildup inside.
- Provide high-quality starter feed.
- Use vaccination to protect against Gumboro disease. The vaccine is typically given when the chicks are 1-2 weeks old to help boost their immunity and prevent the disease.
- Keep the number of chicks according to the space available. Avoid overcrowding them, as it can cause stress and health issues.
- Ensure fresh water supply (change every hour in summer).
- Give them a small piece of ginger(adrak) once or twice a week. This helps strengthen their immune system.`,
            remedies: `✅ Remedies:
- Small pieces of tomatoes and onions twice a week.
- If there is a risk of any respiratory illness, such as fever or mucus buildup, give them a small piece of ginger. It helps in recovery and strengthens their immune system.
- Lysovit syrup in water 4 times a week.
- Mix garlic water into the chicks' drinking water. Garlic has antimicrobial properties that help control infections and support their immune system.
- Mix turmeric powder into the chicks' feed. Turmeric has anti-inflammatory properties that help reduce inflammation and support overall health.`,
        },

        '1-2': {
            title: '1-2 Month Guide',
            subtitle: 'Growth & Development Phase',
            icon: '🐤',
            description: `Continuing critical care as chicks develop stronger immunity and begin to grow rapidly.

First Day: Give jaggery(Gur) water to clean their stomach.
Second Day: Introduce soft food like bread.
Third Day & Onward: Start feeding them No. 4 feed, and if you can afford it, provide fly larvae and boiled eggs. For 5 chicks, 1 egg is enough; use this formula for the quantity based on the number of chicks you have. If you are giving larvae, offer a small quantity, about 8-10 pieces per chick.`,
            precautions: `🛑 Essential Precautions:
- Always keep your chick's coop clean, as the start of many diseases comes from dirt and poor hygiene. Cleanliness is essential for their health and well-being.
- Keep brooder at 95°F, reduce by 5°F weekly.
- If your chicks are not with their mother and you don't have a brooder, keep them in a proper cotton box or a cage. 
- Cover the coton box or cage properly from all sides with a plastic sheet, but make sure to cover it in a way that prevents ammonia buildup inside.
- Provide high-quality starter feed.
- Use vaccination to protect against Gumboro disease. The vaccine is typically given when the chicks are 1-2 weeks old to help boost their immunity and prevent the disease.
- Keep the number of chicks according to the space available. Avoid overcrowding them, as it can cause stress and health issues.
- Ensure fresh water supply (change every hour in summer).
- Give them a small piece of ginger(adrak) once or twice a week. This helps strengthen their immune system.`,
            remedies: `✅ Remedies:
- Small pieces of tomatoes and onions twice a week.
- If there is a risk of any respiratory illness, such as fever or mucus buildup, give them a small piece of ginger. It helps in recovery and strengthens their immune system.
- Lysovit syrup in water 4 times a week.
- Mix garlic water into the chicks' drinking water. Garlic has antimicrobial properties that help control infections and support their immune system.
- Mix turmeric powder into the chicks' feed. Turmeric has anti-inflammatory properties that help reduce inflammation and support overall health.`,
        },

        '2-3': {
            title: '2-3 Month Guide',
            subtitle: 'Strengthening Immunity',
            icon: '🐥',
            description: `Chicks now develop stronger immunity:
- Broilers: Continue feed as a primary diet.
- Aseel/Fancy Breeds: Gradually reduce feed intake, replacing it with moong dal and mixed grains.
- Introduce mealworms for extra nutrition.`,
            precautions: `🛑 Precautions:
- Reduce feed gradually.
- Follow proper vaccination schedules.
- Keep a fresh water supply, changing it frequently.`,
            remedies: `✅ Remedies:
- Garlic water for respiratory health.
- Probiotics to support gut health.
- Lysovit syrup for vitamin and mineral supplementation.`
        },
        '3-4': {
            title: '3-4 Month Guide',
            subtitle: 'Transition to Juvenile Stage',
            icon: '🐔',
            description: `At the age of 3-4 months, your chicks are entering a crucial growth stage where their body structure and immunity get stronger. 
This is the period when they start moving towards adulthood and need more nutrition and care. 
They also become more active, so their feed and environment should support their growth and immunity.

Feed:
- Provide Grower Feed (No. 8 or No. 10) as the main diet.
- If affordable, include protein-rich items such as fly larvae, boiled eggs, or mealworms once or twice a week.
- Fresh vegetables like spinach, coriander, or finely chopped carrots can also be given in small amounts.
- Ensure grit (small stones) is available for proper digestion.`,

            precautions: `🛑 Essential Precautions:
- Keep the coop clean and dry; dampness at this age can lead to fungal and bacterial diseases.
- Ensure enough space: overcrowding at this stage can cause aggressive behavior and poor growth.
- Provide proper ventilation but avoid direct cold winds.
- Protect them from sudden weather changes; at this age, chicks can still get sick if exposed to cold nights without shelter.
- Maintain fresh, clean water supply (change twice a day in winter, more often in summer).
- Vaccination schedule should be followed as per local veterinary guidance to protect them from common poultry diseases.
- Monitor weight gain; underweight chicks may need special attention with extra protein in feed.`,

            remedies: `✅ Remedies:
- Garlic water once a week to maintain good immunity and control internal infections.
- Turmeric mixed in feed once a week to reduce inflammation and boost health.
- Lysovit syrup in water 2-3 times a week to support growth and immunity.
- For digestion support, you can add small quantities of apple cider vinegar (1-2 drops per chick in water) once a week.
- If there are signs of weakness, give them boiled egg yolk mixed with feed for quick energy and strength.`,
        },
        '4-5': {
            title: '4-5 Month Guide',
            subtitle: 'Young Adult Development',
            icon: '🐓',
            description: `By the age of 4-5 months, chicks are now growing into young pullets or cockerels. 
This stage is very important for their bone strength, feather growth, and preparation for laying (in the case of hens). 
They need a balanced diet with enough protein, calcium, and vitamins to support their fast development.

Feed:
- Provide Grower Feed (No. 10 or No. 12) as the primary diet.
- Start introducing calcium sources like crushed eggshells or oyster shells for stronger bones and future egg-laying.
- Offer small amounts of green vegetables like spinach, lettuce, or coriander.
- Protein sources (boiled eggs, fly larvae, or mealworms) can be given once or twice a week.
- Ensure grit (small stones) is always available for digestion.`,

            precautions: `🛑 Essential Precautions:
- Keep coop spacious; at this age, they need more room to move and exercise.
- Maintain strict cleanliness to avoid bacterial or parasitic infections.
- Provide good ventilation and natural sunlight for healthy growth, but protect them from cold winds and rain.
- Continue vaccinations as per schedule (consult local vet for exact timeline).
- Avoid giving too much fatty food, as it can slow down proper growth.
- Ensure constant fresh water supply; clean water containers daily.
- Monitor for early signs of illness (lethargy, diarrhea, weakness) and separate sick birds immediately.`,

            remedies: `✅ Remedies:
- Garlic water once a week to prevent infections and strengthen immunity.
- Mix turmeric powder into feed once a week to support overall health.
- Lysovit syrup or other multivitamin drops in water 2 times a week for better growth.
- Add apple cider vinegar (1 teaspoon per liter of water) once a week to aid digestion and maintain gut health.
- If chicks appear weak or stressed, give a mixture of boiled egg yolk and feed to boost energy.`,
        },
        '5-6': {
            title: '5-6 Month Guide',
            subtitle: 'Pre-Laying Preparation',
            icon: '🥚',
            description: `At the age of 5-6 months, your chickens are almost adults. 
Pullets (young hens) may soon start laying eggs, so their diet must be rich in calcium and protein to support egg production. 
This is the transition phase from grower to layer feed.

Feed:
- Start shifting from Grower Feed to Layer Feed (No. 14 or specially formulated layer mash).
- Provide calcium supplements like crushed oyster shells or eggshells to strengthen eggshell quality.
- Continue giving green vegetables (spinach, lettuce, coriander) 3-4 times a week.
- Provide occasional protein boosts such as fly larvae or mealworms once a week.
- Always keep grit (small stones) available to aid digestion.`,

            precautions: `🛑 Essential Precautions:
- Make sure each bird has enough space in the coop; overcrowding at this stage can cause stress and fights.
- Clean water containers daily and provide fresh water at all times.
- Maintain strict hygiene to prevent infections and parasites.
- Provide nesting boxes if hens are about to lay eggs; keep them clean and comfortable.
- Ensure proper ventilation in the coop without direct drafts.
- Avoid sudden diet changes; shift from grower to layer feed gradually to prevent digestive issues.
- Keep an eye on their weight and activity level; underactive or weak chickens may need extra care.`,

            remedies: `✅ Remedies:
- Garlic water once a week to boost immunity and prevent infections.
- Turmeric powder mixed in feed once a week to maintain overall health.
- Multivitamin syrup (like Lysovit) 2 times a week in water to support strong growth and egg-laying.
- Add apple cider vinegar (1 teaspoon per liter of water) once a week for digestive health.
- If hens show weakness before laying, provide boiled egg yolk mixed with feed for extra energy and protein.`,
        },
        '6-7': {
            title: '6-7 Month Guide',
            subtitle: 'Early Laying Phase',
            icon: '🥚',
            description: `By 6-7 months, your chickens are fully grown adults. 
Pullets (young hens) usually start laying their first eggs around this time. 
Their nutritional needs increase, especially for calcium and protein, to support egg production and overall health.

Feed:
- Provide Layer Feed (No. 14 or formulated layer mash) as their main diet.
- Always keep crushed oyster shells or eggshells available separately for calcium.
- Offer green vegetables (spinach, coriander, cabbage, lettuce) 3-4 times a week.
- Occasionally provide protein sources like mealworms, fly larvae, or boiled eggs to maintain strength.
- Ensure grit (small stones) is available at all times for digestion.`,

            precautions: `🛑 Essential Precautions:
- Keep nesting boxes clean, dry, and private to encourage egg-laying.
- Maintain proper hygiene in the coop to avoid mites, lice, or bacterial infections.
- Provide enough space and perches to reduce stress and pecking issues.
- Ensure a balanced diet; calcium deficiency can cause weak or thin eggshells.
- Fresh, clean water must be available at all times (change daily).
- Protect chickens from extreme weather (cold drafts in winter, overheating in summer).
- Watch for egg-binding or laying issues, especially in first-time layers.`,

            remedies: `✅ Remedies:
- Garlic water once a week to support immunity and prevent infections.
- Turmeric mixed into feed once a week for anti-inflammatory benefits.
- Multivitamin syrup in drinking water 1-2 times a week to maintain strength and improve egg quality.
- Apple cider vinegar (1 teaspoon per liter of water) once a week to aid digestion and gut health.
- If hens look weak after laying, give them boiled egg yolk or protein-rich treats for recovery.`,
        },
        '7-8': {
            title: '7-8 Month Guide',
            subtitle: 'Active Laying Period',
            icon: '🥚',
            description: `At 7-8 months, your chickens are in their active laying phase. 
Hens will be laying regularly, so they require a nutrient-rich diet to maintain good egg production and overall health. 
This stage is focused on maintaining strong immunity, egg quality, and preventing common laying-related issues.

Feed:
- Continue Layer Feed (No. 14 or layer mash) as the primary diet.
- Provide free access to crushed oyster shells or eggshells for extra calcium.
- Fresh green vegetables (spinach, cabbage, coriander, lettuce) should be given 3-4 times per week.
- Protein-rich treats like mealworms, fly larvae, or boiled eggs once a week to maintain strength.
- Keep grit (small stones) available to support digestion.`,

            precautions: `🛑 Essential Precautions:
- Keep nesting boxes clean and comfortable to encourage consistent egg laying.
- Maintain coop hygiene to prevent mites, lice, or bacterial infections.
- Provide enough space in the coop to reduce stress and pecking problems.
- Avoid sudden feed or routine changes as it can affect egg production.
- Monitor egg shells; thin or weak shells may indicate calcium deficiency.
- Ensure proper ventilation in the coop without exposing birds to harsh weather.
- Supply fresh, clean drinking water daily (more frequently in hot weather).`,

            remedies: `✅ Remedies:
- Garlic water once a week to keep immunity strong and prevent infections.
- Turmeric powder mixed into feed once a week to reduce inflammation and support health.
- Multivitamin syrup in water 1-2 times a week to maintain energy and egg production quality.
- Apple cider vinegar (1 teaspoon per liter of water) once a week to improve digestion and gut health.
- If hens show signs of weakness or stress from frequent laying, provide boiled egg yolk or protein treats for recovery.`,
        },
        '8-9': {
            title: '8-9 Month Guide',
            subtitle: 'Peak Production Phase',
            icon: '🥚',
            description: `At 8-9 months, your hens are in their peak laying stage. 
They are producing eggs regularly, and their bodies need strong support through a balanced diet, minerals, and vitamins. 
This stage is about maintaining productivity, preventing exhaustion, and keeping the flock healthy.

Feed:
- Continue Layer Feed (No. 14 or layer mash) as their main diet.
- Provide free access to crushed oyster shells or eggshells for calcium.
- Give fresh green vegetables (spinach, cabbage, coriander, lettuce) 3-4 times per week for extra nutrition.
- Add protein sources like mealworms, fly larvae, or boiled eggs once a week to maintain strength.
- Keep grit available at all times for digestion.`,

            precautions: `🛑 Essential Precautions:
- Ensure nesting boxes are always clean, dry, and private for stress-free egg laying.
- Maintain strict hygiene in the coop to prevent lice, mites, and diseases.
- Provide enough coop space and perches to avoid stress and aggressive behavior.
- Watch for signs of fatigue from continuous laying; provide rest and proper nutrition.
- Monitor eggshell strength regularly; weakness may point to calcium deficiency.
- Keep water supply fresh, clean, and changed daily.
- Protect hens from extreme weather; heat or cold stress can reduce egg laying.`,

            remedies: `✅ Remedies:
- Garlic water once a week to maintain immunity and prevent infections.
- Turmeric powder mixed into feed once a week for anti-inflammatory support.
- Multivitamin syrup in water 1-2 times weekly to maintain energy and egg quality.
- Apple cider vinegar (1 teaspoon per liter of water) once a week to improve digestion.
- If hens look tired or weak, provide high-protein treats (boiled egg yolk, fish meal, or soybean meal) to restore strength.`,
        },
        '9-10': {
            title: '9-10 Month Guide',
            subtitle: 'Sustained Production',
            icon: '🥚',
            description: `At 9-10 months, your hens are still in their laying stage but may start showing slight changes in egg production depending on breed and care. 
Their nutritional needs remain the same, but extra care is needed to prevent fatigue and maintain consistent egg quality.

Feed:
- Continue Layer Feed (No. 14 or specially formulated layer mash) as their primary diet.
- Provide constant access to crushed oyster shells or eggshells for strong eggshells.
- Offer fresh greens like spinach, coriander, lettuce, and cabbage 3-4 times per week.
- Protein-rich foods (mealworms, fly larvae, or boiled eggs) once a week for strength.
- Keep grit available all the time for proper digestion.`,

            precautions: `🛑 Essential Precautions:
- Regularly clean nesting boxes to keep them dry and safe for laying.
- Ensure coop hygiene to prevent parasites like mites and lice, which are common at this age.
- Monitor hens for signs of fatigue or decreased activity due to continuous laying.
- Avoid overcrowding in the coop; stress can reduce egg production.
- Provide proper ventilation while protecting hens from harsh weather.
- Check egg quality (size, shell strength) regularly to adjust diet if needed.
- Keep water containers clean and filled with fresh water daily.`,

            remedies: `✅ Remedies:
- Garlic water once a week to support immunity and prevent infections.
- Turmeric powder mixed into feed once a week for overall health and anti-inflammatory benefits.
- Multivitamin syrup in drinking water 1-2 times per week to maintain energy and egg quality.
- Apple cider vinegar (1 teaspoon per liter of water) once a week to aid digestion.
- If hens appear weak or stressed, provide extra protein through boiled egg yolk or soybean meal to restore strength.`,
        },
        '10-12': {
            title: '10-12 Month Guide',
            subtitle: 'Prime Laying Period',
            icon: '🥚',
            description: `At 10-12 months, your chickens are now fully mature and in their prime laying period. 
Most hens will lay regularly, but you may notice slight variations in egg size and frequency. 
This is the stage where long-term health management becomes more important than just rapid growth.

Feed:
- Continue Layer Feed (No. 14 or balanced layer mash) as the main diet.
- Provide constant access to calcium sources (oyster shells or crushed eggshells).
- Fresh vegetables (spinach, cabbage, coriander, lettuce) should be given 3-4 times weekly.
- Add protein sources like mealworms, fly larvae, or boiled eggs once every 10 days to maintain strength.
- Keep grit available at all times for digestion support.`,

            precautions: `🛑 Essential Precautions:
- Clean nesting boxes daily to encourage hens to lay comfortably.
- Maintain strict coop hygiene to prevent parasites (mites, lice, worms) which become common as birds age.
- Avoid overcrowding; mature hens need more space to prevent stress and fighting.
- Watch for laying fatigue; provide proper rest and a balanced diet.
- Ensure protection from harsh weather (winter drafts, summer heat).
- Regularly check eggshell quality; thin shells may indicate calcium deficiency.
- Fresh water must be available at all times and changed daily.`,

            remedies: `✅ Remedies:
- Garlic water once a week to prevent infections and maintain immunity.
- Turmeric powder mixed in feed once a week for anti-inflammatory and health benefits.
- Multivitamin syrup in water once or twice a week to maintain energy and egg production.
- Apple cider vinegar (1 teaspoon per liter of water) once a week for digestive health.
- If hens look tired after continuous laying, provide extra protein treats (boiled egg yolk, fish meal, soybean meal).`,

            afterOneYear: `✨ After 1 Year Tips & Tricks:
- Egg production may gradually decline after the first year; don't worry, this is natural.
- Continue Layer Feed, but you can reduce high-protein treats to avoid obesity.
- Focus more on greens, calcium, and vitamins to keep hens healthy and productive longer.
- Replace or refresh old bedding frequently to avoid parasites.
- Give hens rest periods; sometimes allowing a natural molting phase helps them regain strength.
- Keep a close eye on their health, as older hens are more prone to infections and weak eggshells.
- If keeping for eggs, rotate flock every 1.5–2 years for best productivity. If keeping as pets, focus on comfort and balanced nutrition rather than only egg production.`,
        },
        'hens-not-laying': {
            title: 'Hens Not Laying Guide',
            subtitle: 'Troubleshooting Egg Production',
            icon: '⚠️',
            description: `⚠️ Important: Before trying any remedy, always consult an experienced farmer or a veterinary doctor. 
Egg-laying issues can be caused by multiple factors (age, diet, stress, disease), so professional advice is the safest first step.`,

            causes: `🔎 Common Reasons Why Hens Stop Laying:
- Age factor (hens lay best in the first 1-1.5 years).
- Poor nutrition (lack of calcium, protein, or vitamins).
- Stress due to overcrowding, predators, or sudden changes in environment.
- Illnesses like respiratory infections, parasites, or egg-binding.
- Natural molting phase (hens shed old feathers and pause egg-laying).
- Seasonal changes (shorter daylight in winters reduces laying).`,

            layingHens: `🥚 For Hens That Are Laying:
- ✅ Healthy Layers: If the hen is active, eating well, and producing eggs, continue with a balanced Layer Feed + calcium sources (oyster shells/eggshells).
- ⚠️ Unhealthy Layers: If hen looks weak, thin-shelled eggs, or irregular laying:
   - Give garlic water once a week for immunity.
   - Add turmeric in feed weekly for recovery.
   - Provide multivitamin syrup (like Lysovit) 2-3 times a week.
   - Ensure calcium-rich diet (layer mash + oyster shells + greens).`,

            nonLayingHens: `❌ For Hens Not Laying:
- Step 1: Identify reason (age, molting, sickness, stress).
- Step 2: Improve nutrition and environment:
   - Provide Layer Feed (No. 14).
   - Increase daylight exposure (12–14 hrs recommended).
   - Give more protein (boiled eggs, mealworms, fish meal).
   - Add greens (spinach, cabbage, coriander) for vitamins.

🏡 Home Remedies:
- Garlic water (antimicrobial, boosts immunity).
- Turmeric powder in feed once a week (anti-inflammatory).
- Apple cider vinegar (1 tsp per liter of water once a week) for digestion.
- Small amount of ginger (adrak) twice a week for immune strength.
- Onion pieces once a week (helps with metabolism).

💊 Human Medicines (Use Carefully & Affordably):
- Vitamin D3 drops (1-2 drops in water once a week) to support calcium absorption.
- B-complex syrup (few drops in water 2-3 times a week) for energy and metabolism.
- Calcium tablets (Calcium + Vitamin D, crush a small piece and mix in feed once a week).

🐓 Veterinary Medicines (Affordable Options):
- Multivitamin poultry liquid (like Lysovit or Vita Sol) 2-3 times a week in water.
- Calcium supplements (available in local veterinary shops) to improve shell strength.
- Deworming syrup once every 3-4 months to remove internal parasites.
- Consult vet for specific egg-laying stimulant injections (only if absolutely needed, and under guidance).`,

            tips: `✨ Extra Tips & Tricks:
- Ensure stress-free coop (enough space, no overcrowding).
- Keep nesting boxes clean, dark, and comfortable.
- Protect hens from extreme weather (cover coop in winter, shade in summer).
- Rotate hens after 1.5–2 years if egg production becomes too low.
- Sometimes hens naturally stop laying during molting or seasonal changes — give them rest and good feed, and they'll return to laying.`,
        },
        'housing': {
            title: 'Chicken Housing Guide',
            subtitle: 'Creating the Perfect Home',
            icon: '🏠',
            description: `Proper housing is the backbone of healthy chickens. A clean, spacious, and well-ventilated coop keeps birds stress-free, prevents diseases, and supports better growth and egg production.`,

            size: `📏 Coop Size According to Chickens:
- 1-5 Chickens: Minimum 15–20 sq. ft. (approx. 3x5 ft space).
- 6-10 Chickens: Minimum 30–40 sq. ft. (approx. 5x6 ft space).
- 10-20 Chickens: Minimum 60–80 sq. ft. (approx. 8x10 ft space).
- More than 20: Build a large poultry shed or divide into sections for better hygiene.

👉 Rule of Thumb: Each chicken needs at least 3–4 sq. ft. indoor space + outdoor run space for free movement.`,

            cleaning: `🧹 Cleaning Schedule:
- 5-6 Chickens: Clean at least twice a week.
- More than 10 Chickens: Clean daily if possible, otherwise every 2 days.
- Large Flocks (20+): Daily cleaning is highly recommended to prevent smell, ammonia buildup, and diseases.
- Always remove wet bedding immediately; moisture leads to infections.`,

            summerCare: `☀️ Summer Care:
- Check if coop is producing too much heat; cover with green tarp or insulation foam to reduce temperature.
- Place mosquito netting (machar dani) at the front of cages to block insects and mosquitoes.
- Ensure shade and cross ventilation; direct sunlight should not hit chickens all day.
- Provide cool, clean water frequently (change every few hours).`,

            winterCare: `❄️ Winter Care:
- Use plastic sheets or thick covers around cages to block cold winds, but keep small ventilation for fresh air.
- Avoid overcrowding; chickens naturally huddle together for warmth.
- Provide dry bedding (straw/wood shavings) and change often.`,

            extra: `✨ Extra Tips:
- Always build cages/coops stress-free with enough space so chickens can move comfortably without fighting.
- Provide at least 1 perch (wooden bar) for every 3-4 chickens; they like to rest elevated at night.
- Nesting boxes: 1 box for every 3 hens to avoid crowding.
- Floor should be raised slightly from ground to prevent dampness and rats.
- Keep food and water containers elevated from the floor to avoid contamination.
- Try to give outdoor access (run space) if possible; chickens stay healthier and stress-free when they can scratch and roam.`,
        },
        'feeding': {
            title: 'Chicken Feeding Guide',
            subtitle: 'Nutrition for Optimal Health',
            icon: '🍽️',
            description: `Feeding is the foundation of healthy chickens. Always provide clean feed and fresh water — never stale, moldy, or fungus-contaminated. 
Dirty feed or water leads to infections, weak immunity, and reduced egg production.`,

            basics: `🥗 Basic Rules:
- Always use fresh, clean feed (avoid old, fungus-infected, or bad-smelling grains).
- Clean water must be available at all times.
- Regularly wash feeders and water containers; no fungus or dirt should remain.
- Store feed in a cool, dry place to avoid mold.`,

            water: `💧 Water Guide:
- Summer: Fresh, cool water should be available all the time. Change it every 2–3 hours. 
   👉 You can add mint (pudina), lemon drops, or electrolytes in water once or twice a week to reduce heat stress.
- Winter: Do not give very cold water. Use slightly room-temperature or lukewarm water. Change at least 2 times daily.
- Always keep water containers in shade to prevent heating in summer.`,

            flatbread: `📦 Recommended Box (About Flatbread [Roti]):
⚠️ Many local farmers and household keepers feed soaked stale flatbread (roti) to chickens — this is very dangerous. 
It can cause fungal infections, digestive problems, and even permanent loss of egg production. 

✔️ Correct Way to Give Flatbread (Roti):
- Flatbread (roti) should never be more than 20 hours old.
- Do not soak flatbread (roti) for more than 1 hour in water.
- In summer: Flatbread (roti) soaked in water is okay, but squeeze out excess water before giving.
- In winter: Never soak flatbread (roti) in water. Give dry, small pieces only.
- Always remove leftover flatbread (roti) after 30 minutes; do not leave in coop.`,

            extra: `✨ Extra Tips:
- Provide grit (small stones) for proper digestion.
- Give green vegetables (spinach, coriander, cabbage) 2-3 times weekly.
- For extra protein: add mealworms, fly larvae, or boiled eggs once a week.
- Avoid giving spicy, oily, salty, or sugary human food.
- In summers, cucumbers and watermelon pieces help chickens stay hydrated.
- Use separate feeders for water and feed to reduce contamination.
- Follow the "little but fresh" rule: give feed in smaller amounts but refill often to avoid staleness.`,

            mistakes: `🚫 Feeding Mistakes to Avoid:
- Do not feed stale or moldy grains.
- Never give spoiled kitchen leftovers.
- Avoid giving too much flatbread (roti); use only occasionally as a supplement, not a main diet.
- Do not soak flatbread (roti) in water for too long — it can cause infections.
- Avoid feeding chickens spicy, oily, salty, or sugary foods.
- Do not overfill feeders; leftover feed can become moldy and harmful.`,
        },

    }), []);

    const content = guideContent[monthId] || {
        title: 'Guide Not Found',
        subtitle: 'Information Unavailable',
        icon: '❓',
        description: 'No details available for this selection.',
        precautions: '',
        remedies: '',
    };

    const renderSection = (title, content, iconName, bgColor) => {
        if (!content) return null;
        
        return (
            <View style={[styles.sectionContainer, { backgroundColor: bgColor }]}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconContainer}>
                        <FontAwesome5 name={iconName} size={20} color="#E68A50" />
                    </View>
                    <Text style={styles.sectionTitle}>{title}</Text>
                </View>
                <Text style={styles.sectionText}>{content}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <StatusBar barStyle="light-content" backgroundColor="#E68A50" />
            <LinearGradient colors={['#FFF8F4', '#FDF2E9']} style={styles.container}>
                {/* Modern Header */}
                <LinearGradient colors={['#E68A50', '#D4734A']} style={styles.header}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                            activeOpacity={0.8}
                        >
                            <FontAwesome5 name="arrow-left" size={20} color="#FFF" />
                        </TouchableOpacity>
                        
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.headerIcon}>{content.icon}</Text>
                            <View style={styles.headerTitles}>
                                <Text style={styles.headerTitle}>{content.title}</Text>
                                <Text style={styles.headerSubtitle}>{content.subtitle}</Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>

                {/* Professional Alert Banner */}
                <View style={styles.alertBanner}>
                    <LinearGradient 
                        colors={['#4CAF50', '#45A049']} 
                        style={styles.alertGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <FontAwesome5 name="info-circle" size={18} color="#FFF" style={styles.alertIcon} />
                        <Text style={styles.alertText}>
                            Always provide clean grains and fresh water. Cleanliness is crucial for optimal health.
                        </Text>
                    </LinearGradient>
                </View>

                {/* Content ScrollView */}
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Main Description Card */}
                    <View style={styles.mainCard}>
                        <LinearGradient 
                            colors={['#FFFFFF', '#FAFAFA']} 
                            style={styles.cardGradient}
                        >
                            <View style={styles.cardHeader}>
                                <FontAwesome5 name="book-open" size={24} color="#E68A50" />
                                <Text style={styles.cardTitle}>Complete Guide</Text>
                            </View>
                            <Text style={styles.descriptionText}>{content.description}</Text>
                        </LinearGradient>
                    </View>

                    {/* Sections */}
                    <View style={styles.sectionsContainer}>
                        {renderSection('Essential Precautions', content.precautions, 'shield-alt', '#FFF5F5')}
                        {renderSection('Proven Remedies', content.remedies, 'medkit', '#F0FDF4')}
                        {renderSection('Common Causes', content.causes, 'search', '#FEF3C7')}
                        {renderSection('Laying Hens Care', content.layingHens, 'egg', '#EBF8FF')}
                        {renderSection('Non-Laying Solutions', content.nonLayingHens, 'exclamation-triangle', '#FEF2F2')}
                        {renderSection('Housing Specifications', content.size, 'home', '#F3E8FF')}
                        {renderSection('Cleaning Schedule', content.cleaning, 'broom', '#ECFDF5')}
                        {renderSection('Summer Care', content.summerCare, 'sun', '#FFFBEB')}
                        {renderSection('Winter Care', content.winterCare, 'snowflake', '#F0F9FF')}
                        {renderSection('Water Management', content.water, 'tint', '#EBF4FF')}
                        {renderSection('Feeding Basics', content.basics, 'utensils', '#F9FDF4')}
                        {renderSection('Flatbread Guidelines', content.flatbread, 'bread-slice', '#FEF7ED')}
                        {renderSection('Additional Tips', content.extra, 'lightbulb', '#FFFBF0')}
                        {renderSection('Feeding Mistakes', content.mistakes, 'times-circle', '#FEF2F2')}
                        {renderSection('Pro Tips & Tricks', content.tips, 'star', '#F0FDF4')}
                        {renderSection('After One Year', content.afterOneYear, 'calendar-alt', '#EEF2FF')}
                    </View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 20,
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 8,
        shadowColor: '#E68A50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    headerTextContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        fontSize: 40,
        marginRight: 15,
    },
    headerTitles: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },
    alertBanner: {
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    alertGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    alertIcon: {
        marginRight: 12,
    },
    alertText: {
        flex: 1,
        fontSize: 14,
        color: '#FFF',
        fontWeight: '600',
        lineHeight: 20,
    },
    scrollView: {
        flex: 1,
        marginTop: 15,
    },
    scrollContainer: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    mainCard: {
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    cardGradient: {
        padding: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginLeft: 12,
    },
    descriptionText: {
        fontSize: 16,
        lineHeight: 26,
        color: '#444',
        textAlign: 'justify',
    },
    sectionsContainer: {
        gap: 15,
    },
    sectionContainer: {
        borderRadius: 16,
        padding: 18,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(230, 138, 80, 0.1)',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(230, 138, 80, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#E68A50',
        flex: 1,
    },
    sectionText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#555',
        textAlign: 'justify',
    },
});

export default GuideDetailScreen;