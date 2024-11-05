import React, { useContext, useReducer, useEffect } from "react";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from "@react-navigation/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Icon } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "./configs/APIs";
import ProductDetails from "./components/Home/ProductDetails";
import Contexts from "./configs/Contexts";
import MyUserReducer from "./configs/MyUserReducer";
import Home from "./components/Home/Home";
import Login from "./components/User/Login";
import Register from "./components/User/Register";
import RegisterStore from "./components/User/RegisterStore";
import RegisterProduct from "./components/User/RegisterProduct";
import AddTag from "./components/Tag/AddTag";
import StoreDetails from "./components/Home/StoreDetails";
import Profile from "./components/User/Profile";
import Orders from "./components/User/Orders";
import { Alert } from "react-native";
const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const MyHomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: true}}>
      <Stack.Screen name='Home' component={Home} options={{title: 'Trang Chủ'}} />
      <Stack.Screen name='ProductDetails' component={ProductDetails} options={{title: 'Chi tiết sản phẩm'}} />
      <Stack.Screen name='StoreDetails' component={StoreDetails} options={{title: 'Cửa hàng'}} />
    </Stack.Navigator>
  );
}

const MyProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: true}}>
      <Stack.Screen name='Profile' component={Profile} options={{title: 'Profile '}} />
      <Stack.Screen name='RegisterStore' component={RegisterStore} options={{title: 'Tạo cửa hàng'}} />
      <Stack.Screen name='RegisterProduct' component={RegisterProduct} options={{title: 'Tạo sản phẩm'}} />
      <Stack.Screen name='AddTag' component={AddTag} options={{title: 'Thêm tag'}} />
      <Stack.Screen name='Orders' component={Orders} options={{title: 'Đơn hàng'}} />
    </Stack.Navigator>
  );
}

const Tab = createBottomTabNavigator();


const MyTab = () => {
  const user = useContext(Contexts); 

  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen name="Home" component={Home} options={{ title: "Trang chủ", tabBarIcon: () => <Icon size={30} color="blue" source="home" />}} />
      {user === null?<>
        <Tab.Screen name="Register" component={Register} options={{ title: "Đăng ký", tabBarIcon: () => <Icon size={30} color="blue" source="account" />}} />
        <Tab.Screen name="Login" component={Login} options={{title: "Đăng nhập", tabBarIcon: () => <Icon size={30} color="blue" source="login" />}} />
      </>:<>
        <Tab.Screen name="Profile" component={Profile} options={{ title: user.username, tabBarIcon: () => <Icon size={30} color="blue" source="account" />}} />
      </>}
      
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, dispatch] = useReducer(MyUserReducer, null);
  useEffect(() => {
    const checkUserToken = async () => {
      try {
        const token = await AsyncStorage.getItem('access-token');
        if (token) {
          // Here you should verify the token and fetch user data if necessary
          const userData = await authApi(token).get(endpoints['current-user']);
          dispatch({ type: 'login', payload: userData.data });
        }
      } catch (error) {
        Alert.alert('Vui lòng đăng nhập lại');
      }
    };

    checkUserToken();
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Contexts.Provider value={[user, dispatch]}>
        <NavigationContainer>
          {/* <Drawer.Navigator>
            <Drawer.Screen name="Home" component={Home} options={{ title: 'Trang chủ' }} />
            <Drawer.Screen name="ProductDetails" component={ProductDetails} options={{ title: "Chi tiết sản phẩm", drawerItemStyle: { display: "none" } }} />
            <Drawer.Screen name="StoreDetails" component={StoreDetails} options={{ title: "Chi tiết cửa hàng", drawerItemStyle: { display: "none" } }} />
            <Drawer.Screen name="RegisterStore" component={RegisterStore} options={{ title: "Đăng ký cửa hàng", drawerItemStyle: { display: "none" } }} />
            <Drawer.Screen name="RegisterProduct" component={RegisterProduct} options={{ title: "Đăng ký sản phẩm", drawerItemStyle: { display: "none" } }} />
            <Drawer.Screen name="AddTag" component={AddTag} options={{ title: "Thêm tag", drawerItemStyle: { display: "none" } }} />

            {user === null ? <>
              <Drawer.Screen name="Login" component={Login} />
              <Drawer.Screen name="Register" component={Register} />
            </> : <>
              <Drawer.Screen name={user.username} component={Home} />
            </>}

            </Drawer.Navigator> */}
          <Tab.Navigator 
            screenOptions={ ({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                if (route.name === 'Trang chủ') {
                  iconName = 'home';
                } else if (route.name === 'Register') {
                  iconName = 'account';
                } else if (route.name === 'Login') {
                  iconName = 'login';
                } else if (route.name === 'Hồ Sơ') {
                  iconName = 'account';
                }
                
                return <Icon source={iconName} size={size} color={color}/>
              },
              tabBarActiveTintColor: 'orange',
              tabBarInactiveTintColor: 'gray',
              headerShown: false,
            })}>
            <Tab.Screen name="Trang chủ" component={MyHomeStack} options={{ title: "Trang chủ"}} />
            {user === null?<>
              <Tab.Screen name="Register" component={Register} options={{ title: "Đăng ký" }} />
              <Tab.Screen name="Login" component={Login} options={{title: "Đăng nhập"}} />
            </>:<>
              <Tab.Screen name="Hồ Sơ" component={MyProfileStack} options={{ title: user.username }} />
            </>}    
          </Tab.Navigator>
        </NavigationContainer>
      
      </Contexts.Provider>
    </GestureHandlerRootView>

  );
}
