import { useContext, useState, useEffect } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View, Alert, Pressable, Platform } from "react-native";
import Contexts from "../../configs/Contexts";
import MyStyles from "../../styles/MyStyles";
import APIs, { endpoints } from "../../configs/APIs";
import { Card, TextInput, Button } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import mime from "mime"
const Profile = ({ route, navigation }) => {
    const [user, dispatch] = useContext(Contexts);
    const [isEditable, setIsEditable] = useState(false);
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [stores, setStores] = useState([]);
    const userStore = stores.find(store => store.owner === user.id);
    const loadStores = async () => {
        try {
            let res = await APIs.get(endpoints['stores']);
            setStores(res.data);
        } catch (ex) {
            console.error(ex);
        }
    };
    useEffect(() => {
        loadStores();
    }, []);
    const fields = [
        { label: 'username', value: user.username, icon: 'account', fieldName: 'username' },
        { label: 'email', value: user.email, icon: 'mail', fieldName: 'email' },
        { label: 'Tên', value: user.first_name, icon: 'account', fieldName: 'first_name' },
        { label: 'Họ và tên lót', value: user.last_name, icon: 'account', fieldName: 'last_name' },
        { label: 'Địa chỉ', value:user.address, icon:'map', fieldName:'address'},

        // { label: 'Giới tính', value: user.gender, icon: 'account', fieldName: 'gender' },
        { label: 'Ngày sinh', value: user.birth, icon: 'calendar', fieldName: 'birth' },
    ];
    const [userData, setUserData] = useState({
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        // gender: user.gender,
        address: user.address,
        birth: user.birth,
        email: user.email,
        avatar: user.avatar,
    });

    const handleChange = (name, value) => {
        setUserData({ ...userData, [name]: value });
    };

    const handleEdit = () => {
        setIsEditable(true);
    };


    const picker = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted')
            Alert.alert("Ecommerce", "Permissions Denied!");
        else {
            let res = await ImagePicker.launchImageLibraryAsync();
            if (!res.canceled) {
                handleChange("avatar", res.assets[0]);
            }
        }
    }

    const toggleDatePicker = () => {
        if (isEditable){
            setShowPicker(!showPicker);
        }         
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
                handleChange("birth", formatDate(currentDate));
            }


        } else {
            toggleDatePicker();
        }
    };

    const handleSave = async () => {
        try {
            let token = await AsyncStorage.getItem('access-token');
            console.log('Token:', token); // Log token để kiểm tra

            const formData = new FormData();
            for (const key in userData) {
                if (key === 'avatar' && userData.avatar.uri!== undefined) {
                    console.log(userData.avatar.uri)
                    formData.append(key, {
                        uri: userData.avatar.uri,
                        name: userData.avatar.fileName || userData.avatar.uri.split('/').pop(),
                        // name: user.avatar.fileName,
                        type: mime.getType(userData.avatar.uri)
                    });
                } 
                else
                    formData.append(key, userData[key]);
            }

            console.log('userData:', JSON.stringify(userData));

            // Sử dụng fetch trực tiếp để đảm bảo header được đặt đúng
            let response = await fetch('https://tuankiet.pythonanywhere.com/users/current-user/', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            const contentType = response.headers.get('content-type');
            let responseData;

            if (contentType && contentType.indexOf('application/json') !== -1) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            if (response.ok) {
                setIsEditable(false);
                Alert.alert("Success", "Profile updated successfully");
            } else {
                console.log('Response status:', response.status);
                console.log('Response data:', responseData);
                Alert.alert("Error", `Failed to update profile: ${responseData.detail || response.status}`);
            }
        } catch (error) {
            console.error("An error occurred:", error); // Log lỗi để kiểm tra
            Alert.alert("Error", `An error occurred while updating profile: ${error.message}`);
        }
    };

    


    if (!user) {
        return <Text style={MyStyles.subject}>No user logged in</Text>;
    }

    return (
        <ScrollView style={[MyStyles.container, MyStyles.margin]}>
            <Card>
                <Card.Cover style={{ backgroundColor:"orange"}}/>
                <View style={MyStyles.avatarContainer}>
                    <Image source={ userData.avatar && userData.avatar.uri ? { uri: userData.avatar.uri } : {uri: userData.avatar}} style={MyStyles.avatarStore} resizeMode="cover" />
                </View>
            </Card>
            {isEditable && 
            <TouchableOpacity style={{marginTop:50, textAlign:"center", alignItems:"center", color:"blue", height:30, padding:5}} onPress={picker}>
                    <Text style={{ color:"blue", fontSize:15 }}>Chỉnh sửa ảnh</Text>
            </TouchableOpacity>}
            <View style={{ marginTop: 45 }}>
                {fields.map((field, index) => { if (field.fieldName === 'birth') return (
                    <View>
                        {showPicker  && 
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
                                    key={index}
                                    right={<TextInput.Icon style={{ paddingTop: 15 }} icon={field.icon} />}
                                    value={userData["birth"]}
                                    style={{marginHorizontal:20, marginVertical:5, width: "90%", height: 50, padding: 5, backgroundColor:"white"}}
                                    label={field.label}
                                    editable={false}
                                    onChangeText={(text) => handleChange(field.fieldName, text)}
                                />
                            </Pressable>
                        )}  
                    </View>
                    )
                    else { return (
                        <TextInput
                        key={index}
                        right={<TextInput.Icon style={{ paddingTop: 15 }} icon={field.icon} />}
                        value={field.value}
                        style={{marginHorizontal:20, marginVertical:5, width: "90%", height: 50, padding: 5, backgroundColor:"white"}}
                        label={field.label}
                        editable={isEditable}
                        onChangeText={(text) => handleChange(field.fieldName, text)}
                    />)
                    }}) 
                    }

            </View>
            <Card style={[MyStyles.container, MyStyles.margin, {backgroundColor:"white", padding:5, marginHorizontal:20, borderRadius:0 }]}>
                <View style={{ margin: 15, borderBottomWidth:2, borderBottomColor:"lightgrey"}}>
                    <Text style={{ fontSize:20, fontWeight:"bold"}}>CHỨC NĂNG</Text>
                </View>
                {!isEditable && (
                    <>
                        {user.role === 'BUYER' && (
                            <>
                                <TouchableOpacity style={[MyStyles.buttonLog, { backgroundColor: 'white', borderWidth:3, borderRadius:20, marginVertical:5, borderColor:"orange" }]} onPress={() => navigation.navigate("Orders")}>
                                    <Text style={{ textAlign: "center", color: 'black', fontSize:16, fontWeight:"bold" }}>Đơn hàng của bạn</Text>
                                </TouchableOpacity>                                   
                            </>
                        )}
                        {user.role === 'SELLER' && (
                            <>
                                <TouchableOpacity style={[MyStyles.buttonLog, { backgroundColor: 'white', borderWidth:3, borderRadius:20, marginVertical:5, borderColor:"orange" }]} onPress={
                                    () => {
                                        navigation.navigate("RegisterStore", { 'store_id': userStore.id || store_id, 'user_id': user.id })
                                    }
                                }>
                                    <Text style={{ textAlign: "center", color: 'black', fontSize:16, fontWeight:"bold" }}>Thêm cửa hàng</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[MyStyles.buttonLog, { backgroundColor: 'white', borderWidth:3, borderRadius:20, marginVertical:5, borderColor:"orange" }]} onPress={() => navigation.navigate("RegisterProduct", { 'store_id': userStore.id || store_id, 'user_id': user.id })}>
                                    <Text style={{ textAlign: "center", color: 'black', fontSize:16, fontWeight:"bold" }}>Thêm sản phẩm</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[MyStyles.buttonLog, { backgroundColor: 'white', borderWidth:3, borderRadius:20, marginVertical:5, borderColor:"orange" }]} onPress={() => navigation.navigate("AddTag", { 'user_id': user.id })}>
                                    <Text style={{ textAlign: "center", color: 'black', fontSize:16, fontWeight:"bold" }}>Thêm tag</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[MyStyles.buttonLog, { backgroundColor: 'white', borderWidth:3, borderRadius:20, marginVertical:5, borderColor:"orange" }]} onPress={() => navigation.navigate("Orders")}>
                                    <Text style={{ textAlign: "center", color: 'black', fontSize:16, fontWeight:"bold" }}>Đơn hàng</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </>
                )}              
            </Card>
            <View style={[MyStyles.container, MyStyles.margin]}>            
                {!isEditable ? (
                    <>
                        <TouchableOpacity style={[MyStyles.buttonLog, { backgroundColor: 'orange' }]} onPress={handleEdit}>
                            <Text style={{ textAlign: "center", color: 'white' }}>Chỉnh sửa</Text>
                        </TouchableOpacity>
                        <Button icon="logout" onPress={() => dispatch({type: "logout"})}>Đăng xuất</Button>               
                    </>             
                ) : (
                    <>
                        <TouchableOpacity style={[MyStyles.buttonLog, { backgroundColor: 'green', marginBottom:10 }]} onPress={handleSave}>
                            <Text style={{ textAlign: "center", color: 'white' }}>Lưu</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[MyStyles.buttonLog, { backgroundColor: 'white' }]} onPress={() => setIsEditable(false)}>
                            <Text style={{ textAlign: "center", color: 'red' }}>Hủy</Text>
                        </TouchableOpacity>
                    </>
                    
                )}
            </View>
        </ScrollView>
    )
};

export default Profile;
