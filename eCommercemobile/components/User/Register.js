import { useState, useCallback } from "react";
import { View, Text, ActivityIndicator, Image, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, RefreshControl, Pressable } from "react-native";
import MyStyles from "../../styles/MyStyles";
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import APIs, { endpoints } from "../../configs/APIs";
import RNPickerSelect from 'react-native-picker-select';
import { Button, HelperText, TextInput, TouchableRipple } from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import mime from "mime"
const Register = ({ }) => {
    const [user, setUser] = useState({});
    const [err, setErr] = useState(false);
    const fields = [{
        "label": "Họ và tên lót",
        "icon": "text",
        "name": "last_name"
    },{
        "label": "Tên",
        "icon": "text",
        "name": "first_name"
    }, {
        "label": "Email",
        "icon": "email",
        "name": "email"
    }, {
        "label": "Ngày Sinh",
        "icon": "calendar",
        "name": "birth",
    }, {
        "label": "Địa chỉ",
        "icon": "map",
        "name": "address",
    }, {
        "label": "Tên đăng nhập",
        "icon": "account",
        "name": "username"
    }, {
        "label": "Mật khẩu",
        "icon": "eye",
        "name": "password",
        "secureTextEntry": true
    }, {
        "label": "Xác nhận mật khẩu",
        "icon": "eye",
        "name": "confirm",
        "secureTextEntry": true
    }];
    const nav = useNavigation();
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    const toggleDatePicker = () => {
        setShowPicker(!showPicker);
    };
    const formatDate = (rawDate) => {
        let date = new Date(rawDate);
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();

        return `${year}-${month}-${day}`;
    };
    const onChange = ({type}, selectedDate) => {
        if (type == "set") {
            const currentDate = selectedDate;
            setDate(currentDate);

            if (Platform.OS === "android") {
                toggleDatePicker();
                updateState("birth", formatDate(currentDate));
            }


        } else {
            toggleDatePicker();
        }
    };
    
    const updateState = (field, value) => {
        setUser(current => {
            return {...current, [field]: value}
        });
    }
    
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fields.forEach(field => updateState(field.name, ''));
        setErr('');
        setRefreshing(false);
    }, []);
    
    useFocusEffect(
        useCallback(() => {
            onRefresh();
        }, [onRefresh])
    )
    const picker = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted')
            Alert.alert("Ecommerce", "Permissions Denied!");
        else {
            let res = await ImagePicker.launchImageLibraryAsync();
            if (!res.canceled) {
                updateState("avatar", res.assets[0]);
            }
        }
    }

    const register = async () => {
        
        for (let field of fields){
            if(!user[field.name]){
                setErr(`Vui lòng nhập ${field.label}`);
                return;
            }
        }

        if (user['password'] !== user['confirm']) {
            setErr('Mật khẩu không khớp');
            return;
        } 

        if (!validateEmail(user['email'])) {
            setErr('Email không hợp lệ');
            return;
        }

        let form = new FormData();
        for (let key in user)
            if (key !== 'confirm')
                if (key === 'avatar') {
                    // console.info(user.avatar.uri)
                    // console.info(user.avatar.fileName)
                    // console.info(mime.getType(user.avatar.uri))
                    form.append(key, {
                        uri: user.avatar.uri,
                        name: user.avatar.fileName || user.avatar.uri.split('/').pop(),
                        type: mime.getType(user.avatar.uri)
                    });
                } else
                    form.append(key, user[key]);

        console.info(form);
        setErr('');
        setLoading(true);
        try {
            let res = await APIs.post(endpoints['register'], form, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (res.status === 201){
                nav.navigate("Login");
            }      
            else {
                setErr('Đăng ký thất bại');
            }
        } catch (ex) {
            if (ex.response && ex.response.status === 400) 
                setErr('Tên đăng nhập đã tồn tại');            
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor:"white", alignItems:"center"}}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>                   
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
                        marginBottom: 30,
                        color: "#041E42",
                        textAlign: "center"
                        }}>ĐĂNG KÝ NGƯỜI DÙNG</Text>

                    {fields.map(c => { if (c.name === 'birth') return (
                    <View>
                        {showPicker && 
                            (<DateTimePicker 
                                mode="date" 
                                display="spinner" 
                                value={date} 
                                onChange={onChange} />
                            )
                        }
                        {!showPicker && (
                            <Pressable onPress={toggleDatePicker}>
                                <TextInput
                                    secureTextEntry={c.secureTextEntry} 
                                    value={user[c.name]} 
                                    onChangeText={t => updateState(c.name, t)}
                                    editable={false}
                                    style={{ width: 350, marginBottom: 10}}
                                    key={c.name} 
                                    label={c.label} 
                                    right={<TextInput.Icon icon={c.icon} style={{paddingTop: 15}} />}
                                />
                            </Pressable>
                        )}  
                    </View>
                    )
                    else { return (
                        <TextInput secureTextEntry={c.secureTextEntry} value={user[c.name]} onChangeText={t => updateState(c.name, t)} key={c.name} label={c.label} right={<TextInput.Icon icon={c.icon} style={{paddingTop: 15}} />} style={{
                            width: 350,
                            marginBottom: 10
                        }}/>);
                    }}) 
                    }
                    <TouchableOpacity style={{marginTop:10, textAlign:"center", alignItems:"center", color:"blue", height:30, padding:5}} onPress={picker}>
                        <Text style={{ color:"blue", fontSize:15 }}>Chọn ảnh đại diện</Text>
                    </TouchableOpacity>

                    {user.avatar && <Image source={{ uri: user.avatar.uri} } style={{ width: 100, height: 100, margin: 5, borderWidth:3, borderRadius:50, borderColor:"lightgray"}} />}

                    <HelperText type="error" visible={!!err}>{err}</HelperText>

                    <Text style={{ fontWeight:"bold", fontSize:16 }}>Giới tính</Text>
                    <RNPickerSelect
                        onValueChange={(value) => updateState("gender", value)}
                        items={[
                            { label: 'Male', value: 'male' },
                            { label: 'Female', value: 'female' },
                            { label: 'Other', value: 'other' }
                        ]}
                        style={{ inputAndroid: { width:"100%", backgroundColor:"grey", margin:5, color:"white"} }} // Styles for iOS and Android
                        placeholder={{ label: "Select gender...", value: null }}
                    />
                    <Text style={{ fontWeight:"bold", fontSize:16 }}>Vai trò người dùng</Text>
                    <RNPickerSelect
                        onValueChange={(value) => updateState("role", value)}
                        items={[
                            { label: 'Admin', value: 'ADMIN' },
                            { label: 'Staff', value: 'STAFF' },
                            { label: 'Seller', value: 'SELLER' },
                            { label: 'Buyer', value: 'BUYER' }
                        ]}
                        style={{ inputAndroid: { width:"100%", backgroundColor:"grey", margin:5, color:"white"} }} // Styles for iOS and Android
                        placeholder={{ label: "Select a role...", value: null }}
                    />
                    {loading === true ? <ActivityIndicator /> : <>
                        <TouchableOpacity style={{alignItems:"center"}} onPress={register} >
                            <Text style={{
                                width: 200,
                                textAlign: "center",
                                backgroundColor: '#041E42',
                                color: "white",
                                fontSize: 16,
                                fontWeight:"bold",
                                padding: 10,
                                margin:10
                            }}>Đăng ký</Text>
                    </TouchableOpacity>
                    </>}
                </ScrollView>    
            </KeyboardAvoidingView>    
        </SafeAreaView>
    );
}

export default Register;