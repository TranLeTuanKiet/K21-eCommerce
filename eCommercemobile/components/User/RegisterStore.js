import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
import MyStyles from "../../styles/MyStyles";
import * as ImagePicker from 'expo-image-picker';
import APIs, { endpoints } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TextInput } from "react-native-paper";

const RegisterStore = ({ route, navigation }) => {
    const userId = route.params?.userId;
    const [store, setStore] = useState({
        "name": "",
        "email": "",
        "address": "",
        "phone_number": "",
        "owner": userId,
        "image": null,
    });
    const [loading, setLoading] = useState(false);

    // useEffect(() => {
    //     setStore(current => ({ ...current, owner: username }));
    // }, [username]);

    const registerStore = async () => {
        setLoading(true);

        const form = new FormData();
        for (let key in store) {
            if (key === 'image' && store[key]) {
                //const image = store[key];
                form.append(key, {
                    uri: store[key].uri,
                    name: store[key].fileName || 'avatar.jpg',
                    type: store[key].type || 'image/jpeg/png/jpg'
                })
            }
            // else if (key === 'owner') {
            //     // Convert owner object to JSON string
            //     form.append(key, JSON.stringify(store[key]));
            // }
            else {
                form.append(key, store[key]);

            }
        }
        try {
            const token = await AsyncStorage.getItem('access-token');
            let res = await APIs.post(endpoints['stores'], form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            console.info(res.data);

            const store_id = res.data.id;
            const store_owner = res.data.owner;
            navigation.navigate("Home", { 'store_owner': store_owner, 'store_id': store_id });
        } catch (ex) {
            if (ex.response) {
                console.error('Response data:', ex.response.data);
                console.error('Response status:', ex.response.status);
                console.error('Response headers:', ex.response.headers);
            } else if (ex.request) {
                console.error('Request data:', ex.request);
            } else {
                console.error('Error message:', ex.message);
            }
            console.error('Error config:', ex.config);
        } finally {
            setLoading(false);
        }
    }

    const picker = async () => {
        let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            alert("Permission Denied!");
        } else {
            let res = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });
            if (!res.canceled) {
                change("image", res.assets[0])//sửa lại avatar thành image
            }
        }
    }

    const change = (field, value) => {
        setStore(current => {
            return { ...current, [field]: value }
        })
    }

    return (
        <View style={[MyStyles.container, MyStyles.margin, { marginTop: 100 }]}>
            <Text style={[MyStyles.subject, { textAlign: "center" }]}>ĐĂNG KÝ CỬA HÀNG</Text>
            <TextInput right={<TextInput.Icon style={{ paddingTop: 15 }} icon="store" />} value={store.name} onChangeText={t => change("name", t)} style={MyStyles.inputLog} label="Tên cửa hàng..." />
            <TextInput right={<TextInput.Icon style={{ paddingTop: 15 }} icon="email" />} value={store.email} onChangeText={t => change("email", t)} style={MyStyles.inputLog} label="Email..." />
            <TextInput right={<TextInput.Icon style={{ paddingTop: 15 }} icon="map" />} value={store.address} onChangeText={t => change("address", t)} style={MyStyles.inputLog} label="Địa chỉ..." />
            <TextInput right={<TextInput.Icon style={{ paddingTop: 15 }} icon="phone" />} value={store.phone_number} onChangeText={t => change("phone_number", t)} style={MyStyles.inputLog} label="Số điện thoại..." />
            <TextInput right={<TextInput.Icon style={{ paddingTop: 15 }} icon="account" />} value={store.owner}
                editable={false} style={[MyStyles.inputLog, { fontWeight: "bold" }]} />
            <TouchableOpacity style={[MyStyles.input, MyStyles.margin]} onPress={picker}>
                <Text>Chọn ảnh đại diện...</Text>
            </TouchableOpacity>
            {store.image ? <Image style={MyStyles.avatarLog} source={{ uri: store.image.uri }} /> : ""}
            {/* <Text>{userId}</Text> */}
            {/* {store.image ? <Text>YES</Text> : <Text>NO</Text>} */}


            {/* <RNPickerSelect
                onValueChange={(value) => change("role", value)}
                items={[
                    { label: 'Seller', value: 'SELLER' },
                    { label: 'Buyer', value: 'BUYER' }
                ]}
                style={{ inputIOS: { ...MyStyles.inputLog }, inputAndroid: { ...MyStyles.inputLog } }} // Styles for iOS and Android
                placeholder={{ label: "Select a role...", value: null }}
            /> */}

            {/* <TextInput style={MyStyles.inputLog} placeholder="Xác nhận mật khẩu..." /> */}




            {loading === true ? <ActivityIndicator /> : <>
                <TouchableOpacity onPress={registerStore}>
                    <Text style={MyStyles.buttonLog}>Đăng ký</Text>
                </TouchableOpacity>
            </>}
        </View>
    );
}

export default RegisterStore;