import LoginScreen from "@/app/(tabs)/login";
import MatchesScreen from "@/app/(tabs)/matches";
import OnboardingScreen from "@/app/(tabs)/onboarding";
import ProfileScreen from "@/app/(tabs)/profile";
import Register from "@/app/(tabs)/register";
import SelectJourneyScreen from "@/app/(tabs)/SelectJourney";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

export default function AppNavigation() {
  return (
    <Stack.Navigator initialRouteName="login">
      <Stack.Screen name="profile" component={ProfileScreen} options={{ headerShown: false }}/>
	<Stack.Screen name="login" component={LoginScreen} options={{ headerShown: false }}/>
	<Stack.Screen name="register" component={Register} options={{ headerShown: false }}/>
	<Stack.Screen name="onboarding" component={OnboardingScreen} options={{ headerShown: false }}/>
	<Stack.Screen name="selectjourney" component={SelectJourneyScreen} options={{ headerShown: false }}/>
	<Stack.Screen name="matching" component={MatchesScreen} options={{ headerShown: false }}/>
    </Stack.Navigator>
  );
}