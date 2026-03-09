import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen from './HomeScreen';
import SellScreen from './SellScreen';
import ProfileScreen from './ProfileScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EditProfileScreen from './EditProfileScreen';
import DashboardScreen from './DashboardScreen';
import ProductDetailScreen from './ProductDetailScreen';
import AllProductsScreen from './AllProductsScreen';
import { CommonActions } from '@react-navigation/native';
import { setLastFocusedTab, setSellEntryFrom } from '../lib/navHistory';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Custom Tab Bar Icon with modern design
const CustomTabIcon = ({ IconComponent, name, focused, color, size }) => {
  return (
    <View style={[
      styles.iconContainer,
      { backgroundColor: focused ? '#E68A50' : 'transparent' }
    ]}>
      <IconComponent 
        name={name} 
        size={focused ? 24 : 22} 
        color={focused ? '#fff' : color} 
      />
    </View>
  );
};

// Create a stack navigator for the Sell tab
const SellStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        cardStyle: { backgroundColor: '#fff' }
      }}
    >
      <Stack.Screen name="SellMain" component={SellScreen} />
    </Stack.Navigator>
  );
};

// Create a stack navigator for the Profile tab
const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        cardStyle: { backgroundColor: '#fff' }
      }}
    >
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
      />
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          headerShown: true,
          title: 'Business Dashboard',
          headerStyle: {
            backgroundColor: '#E68A50',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerBackTitle: 'Profile',
          headerBackTitleStyle: {
            fontSize: 16,
          },
        }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
      />
      <Stack.Screen
        name="AllProducts"
        component={AllProductsScreen}
      />
    </Stack.Navigator>
  );
};

const BuySellNavigator = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarShowLabel: false, // Remove labels
          tabBarStyle: {
            backgroundColor: '#fff',
            height: Platform.OS === 'ios' ? 85 : 75,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            position: 'absolute',
            shadowColor: '#E68A50',
            shadowOpacity: 0.15,
            shadowRadius: 15,
            shadowOffset: {
              width: 0,
              height: -5,
            },
            elevation: 20,
            borderTopWidth: 0,
            paddingTop: 8,
            paddingBottom: Platform.OS === 'ios' ? 25 : 8,
            paddingHorizontal: 20,
          },
          tabBarItemStyle: {
            paddingVertical: 5,
          },
          tabBarIcon: ({ focused, color, size }) => {
            if (route.name === 'Home') {
              return (
                <CustomTabIcon 
                  IconComponent={Feather}
                  name="home"
                  focused={focused}
                  color={color}
                  size={size}
                />
              );
            } else if (route.name === 'Sell') {
              return (
                <CustomTabIcon 
                  IconComponent={MaterialIcons}
                  name="add-box"
                  focused={focused}
                  color={color}
                  size={size}
                />
              );
            } else if (route.name === 'Profile') {
              return (
                <CustomTabIcon 
                  IconComponent={Ionicons}
                  name="person-circle-outline"
                  focused={focused}
                  color={color}
                  size={size}
                />
              );
            }
          },
          tabBarActiveTintColor: '#E68A50',
          tabBarInactiveTintColor: '#8B8B8B',
          headerShown: false,
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          listeners={{
            focus: () => setLastFocusedTab('Home')
          }}
        />
        <Tab.Screen 
          name="Sell" 
          component={SellStack}
          options={{
            unmountOnBlur: true,
          }}
          listeners={{
            focus: () => setLastFocusedTab('Sell')
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileStack}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              // Navigate directly to Profile stack root screen
              navigation.navigate('Profile', {
                screen: 'ProfileMain',
                params: {
                  userId: null,
                  forceViewMode: 'owner',
                  fromTab: true,
                },
              });
            },
            focus: () => setLastFocusedTab('Profile')
          })}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  iconContainer: {
    width: 45,
    height: 35,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    shadowColor: '#E68A50',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default BuySellNavigator;