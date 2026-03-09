import React from 'react';
import { createStackNavigator } from "@react-navigation/stack";
import OnboardingScreen from "../screens/OnboardingScreen";
import SignupScreen from "../screens/SignupScreen";
import LoginScreen from "../screens/LoginScreen";
import JobCategoryScreen from "../screens/JobCategoryScreen";
import DiseaseScreen from "../screens/DiseaseandcareScreen";
import GuideScreen from "../screens/PoultryFarmingGuideScreen";
import GuideDetail from "../screens/GuideDetailScreen";
import ArticleDetailScreen from "../screens/ArticleDetailScreen";
import BuySellNavigator from "../BuySellWork/BuySellNavigator";
import NewsModule from '../screens/NewsModule';
import DiseaseDetectionScreen from '../screens/DiseaseDetectionScreen';
import ChatbotScreen from '../screens/ChatbotScreen';

const Stack = createStackNavigator();

const RootNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }} 
      initialRouteName="Onboarding"
    >
      {/* Onboarding and Auth Screens */}
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      
      {/* Main App with Bottom Tabs */}
      <Stack.Screen name="MainApp" component={BuySellNavigator} />
      
      {/* Other Screens */}
      <Stack.Screen name="JobCategory" component={JobCategoryScreen} />
      <Stack.Screen name="Diseases" component={DiseaseScreen} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
      <Stack.Screen name="Guide" component={GuideScreen} />
      <Stack.Screen name="GuideDetail" component={GuideDetail} />
      <Stack.Screen name="LatestNews" component={NewsModule}/>
      <Stack.Screen name="ChatbotScreen" component={ChatbotScreen} />
      <Stack.Screen name="DiseaseDetectionScreen" component={DiseaseDetectionScreen} />
    </Stack.Navigator>
  );
}
export default RootNavigator;