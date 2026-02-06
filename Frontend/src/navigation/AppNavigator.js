 
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

 
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import WelcomeScreen from "../screens/Auth/WelcomeScreen";

 
import CartScreen from "../screens/Buyer/CartScreen";
import ChatListScreen from "../screens/Buyer/ChatListScreen";
import ChatScreenBuyer from "../screens/Buyer/ChatScreen";
import ItemDetailsScreen from "../screens/Buyer/ItemDetailsScreen";
import PaymentScreen from "../screens/Buyer/PaymentScreen";
import ProductListScreen from "../screens/Buyer/ProductListScreen";
import SearchScreen from "../screens/Buyer/SearchScreen";
import BuyerProfileScreen from "../screens/Profile/BuyerProfileScreen";
import EditProfileScreen from "../screens/Profile/EditProfileScreen";

 
import VendorEditProfileScreen from "../screens/Profile/VendorEditProfileScreen";
import VendorProfileScreen from "../screens/Profile/VendorProfileScreen";
import AddProductScreen from "../screens/Vendor/AddProductScreen";
import AddSurplusScreen from "../screens/Vendor/AddSurplusScreen";
import ChatScreenVendor from "../screens/Vendor/ChatScreen";
import ChooseTypeScreen from "../screens/Vendor/ChooseTypeScreen";
import DashboardScreen from "../screens/Vendor/DashboardScreen";
import NotificationsScreen from "../screens/Vendor/NotificationsScreen";
import VendorChatListScreen from "../screens/Vendor/VendorChatListScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

 
const BuyerChatStack = createStackNavigator();
function BuyerChatNavigator() {
  return (
    <BuyerChatStack.Navigator initialRouteName="ChatList">
      <BuyerChatStack.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{ title: "Chats" }}
      />
      <BuyerChatStack.Screen
        name="ChatScreen"
        component={ChatScreenBuyer}
        options={({ route }) => ({ title: route.params?.vendorName || "Chat" })}
      />
    </BuyerChatStack.Navigator>
  );
}

 
const VendorChatStack = createStackNavigator();
function VendorChatNavigator() {
  return (
    <VendorChatStack.Navigator initialRouteName="VendorChatList">
      <VendorChatStack.Screen
        name="VendorChatList"
        component={VendorChatListScreen}
        options={{ title: "Chats" }}
      />
      <VendorChatStack.Screen
        name="ChatScreenVendor"
        component={ChatScreenVendor}
        options={({ route }) => ({ title: route.params?.buyerName || "Chat" })}
      />
    </VendorChatStack.Navigator>
  );
}

 
function BuyerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Search") iconName = "search";
          else if (route.name === "Cart") iconName = "cart";
          else if (route.name === "Profile") iconName = "person";
          else if (route.name === "Chat") iconName = "chatbubbles";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2E7D32",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          paddingHorizontal: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 2,
        },
        tabBarItemStyle: {
          flex: 1,
          paddingVertical: 5,
          justifyContent: "center",
          alignItems: "center",
        },
      })}
    >
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={BuyerProfileScreen} />

      
      <Tab.Screen
        name="Chat"
        component={BuyerChatNavigator}
        options={{
          unmountOnBlur: true,  
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
           
            e.preventDefault();
            navigation.navigate("Chat", { screen: "ChatList" });
          },
        })}
      />

      
      <Tab.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: "none" }, 
        }}
      />
    </Tab.Navigator>
  );
}

 
function VendorNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Dashboard") iconName = "home";
          else if (route.name === "Notifications") iconName = "notifications";
          else if (route.name === "Chat") iconName = "chatbubbles";
          else if (route.name === "Profile") iconName = "person";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2E7D32",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          paddingHorizontal: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 2,
        },
        tabBarItemStyle: {
          flex: 1,
          paddingVertical: 5,
          justifyContent: "center",
          alignItems: "center",
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Chat" component={VendorChatNavigator} />
      <Tab.Screen name="Profile" component={VendorProfileScreen} />

       
      <Tab.Screen
        name="AddProduct"
        component={AddProductScreen}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: "none" }, 
        }}
      />
      <Tab.Screen
        name="AddSurplus"
        component={AddSurplusScreen}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: "none" },  
        }}
      />
      <Tab.Screen
        name="ChooseType"
        component={ChooseTypeScreen}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: "none" },  
        }}
      />
    </Tab.Navigator>
  );
}

 
export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
       
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />

       
      <Stack.Screen
        name="BuyerSearchPreview"
        component={SearchScreen}
        initialParams={{ preview: true }}
      />

       
      <Stack.Screen name="Buyer" component={BuyerNavigator} />
      <Stack.Screen name="ItemDetails" component={ItemDetailsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="PaymentScreen" component={PaymentScreen} />

       
      <Stack.Screen name="Vendor" component={VendorNavigator} />
      <Stack.Screen
        name="VendorEditProfile"
        component={VendorEditProfileScreen}
      />
    </Stack.Navigator>
  );
}