import { ActivityIndicator, KeyboardAvoidingView, Text, TouchableOpacity, View, SafeAreaView, RefreshControl } from "react-native";
import { useContext, useState, useCallback } from "react";
import Contexts from "../../configs/Contexts";
import APIs, { authApi, endpoints } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TextInput } from "react-native-paper";
import { ScrollView } from "react-native-gesture-handler";
import { useFocusEffect } from '@react-navigation/native';

const Login = ({ navigation }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [user, dispatch] = useContext(Contexts);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setUsername('');
        setPassword('');
        setError('');
        setRefreshing(false);
    }, []);
    useFocusEffect(
        useCallback(() => {
            onRefresh();
        }, [onRefresh])
    );
    const login = async () => {
        if (username === '' || password === '') {
            setError('Tên đăng nhập và mật khẩu không được để trống.');
            return;
        }
        setLoading(true);
        try {
            let res = await APIs.post(endpoints['login'], {
                "username": username,
                "password": password,
                "client_id": "RxA8NtRzi8MV4l7IlLazRF9fR0jSUF20YJEQTQKq",
                "client_secret": "lQKUXk0xHPFkJAIjujKGeRnBeV9bDPpsYfQ1ZtU6gfaE3SobgqwZXG1drJBLG5P0YH7qPv3CCZXDRaWXfApT1A0N2Qq63fYXfzmcF47xoImnIWQ0yvmnn0P3EEwIW4gA",
                "grant_type": "password"
            })

            //4tZ6JpduJGEdYUGaaqmKM8uqg9D9XAzEuf0fcziO
            //Qs0JfSw1B3UFPD0WZJhQc5FldG6reGF2h3nHkubsJ39xmpwyASDXp5pnkNnuCTEmSGzvnjziPPW6JLC40U3GMozZeKtzqUsR7g6s8XeqLb2BWrliAbhWlNd7vfXeCmvq
            await AsyncStorage.setItem("access-token", res.data.access_token)
            setTimeout(async () => {
                let user = await authApi(res.data.access_token).get(endpoints['current-user']);
                console.info(user.data);

                dispatch({
                    'type': "login",
                    'payload': user.data
                })

                navigation.navigate('Home');
            }, 100);

        } catch (ex) {
            console.log(ex);
            setError('Tên đăng nhập hoặc mật khẩu không đúng.');
        } finally {
            setLoading(false);
        }
    }


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor:"white", alignItems:"center"}}>
            <ScrollView contentContainerStyle={{ flex:1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>
                <KeyboardAvoidingView>
                    <View>
                        <Text style={{
                            fontSize: 20,
                            fontWeight: "bold",
                            marginTop: "30%",
                            color: "#041E42",
                            textAlign: "center"
                        }}>ECOMMERCE APP</Text>
                        <Text style={{
                            fontSize: 25,
                            fontWeight: "bold",
                            marginTop: 30,
                            color: "#041E42",
                            textAlign: "center"
                            }}>ĐĂNG NHẬP</Text>
                    </View>

                    <View style={{ marginTop: 30 }}>
                        <View>
                            <TextInput right={<TextInput.Icon style={{ paddingTop: 15 }} icon="account" />} value={username} onChangeText={t => setUsername(t)} style={{
                                width: 350
                            }} label="Tên đăng nhập..." />
                            <TextInput right={<TextInput.Icon style={{ paddingTop: 15 }} icon="eye" />} secureTextEntry={true} value={password} onChangeText={t => setPassword(t)} style={{
                                width: 350,
                                marginTop: 10,
                                marginBottom: 10
                            }} label="Mật khẩu..." />
                        </View>
                        {error !== '' && (
                        <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
                        )}
                        <Text style={{color:"#007FFF", fontWeight:"500", marginBottom:15}}>Quên mật khẩu?</Text>
                    </View>
                    {loading === true ? <ActivityIndicator /> : <>
                    <TouchableOpacity style={{alignItems:"center"}} onPress={login} >
                        <Text style={{
                            width: 200,
                            textAlign: "center",
                            backgroundColor: '#041E42',
                            color: "white",
                            fontSize: 16,
                            fontWeight:"bold",
                            padding: 10
                        }}>Đăng nhập</Text>
                    </TouchableOpacity></>}
                    <TouchableOpacity style={{alignItems:"center"}} onPress={() => navigation.navigate("Register")} >
                        <Text style={{
                            marginTop: 15,
                            textAlign: "center",
                            color: "darkblue",
                            fontSize: 16,
                            padding: 10
                        }}>Chưa có tài khoản? Đăng ký tại đây</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </ScrollView>
        </SafeAreaView>

    );
}

export default Login;
