import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
import RNPickerSelect from 'react-native-picker-select';
import APIs, { endpoints } from "../../configs/APIs";
import MyStyles from "../../styles/MyStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TextInput } from "react-native-paper";
import * as ImagePicker from 'expo-image-picker';

const RegisterProduct = ({ route }) => {
    const store_id = route.params?.store_id;
    const user_id = route.params?.user_id;
    const [product, setProduct] = useState({
        "name": "",
        "description": "",
        "inventory_quantity": "",
        "price": "",
        "category": "",
        "image": null,
    });
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);


    const loadCategories = async () => {
        try {
            let res = await APIs.get(endpoints["categories"]);
            setCategories(res.data);
        } catch (ex) {
            console.error(ex);
        }
    };

    const registerProduct = async () => {
        setLoading(true);

        const form = new FormData();
        for (let key in product)
            if (key === 'image' && product[key]) {
                //const avatar = user[key];
                form.append(key, {
                    uri: product[key].uri,
                    name: product[key].fileName || 'avatar.jpg',
                    type: product[key].type || 'image/jpeg/png/jpg'
                })
            }
            else if (key !== 'image') {
                form.append(key, product[key]);
            }
        //else form.append(key, user[key]);

        try {
            const token = await AsyncStorage.getItem('access-token');
            let res = await APIs.post(endpoints['add-product'](store_id), form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            console.info(res.data);
            // navigation.navigate("Login");
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

    useEffect(() => {
        loadCategories();
    }, [])

    const categoryItems = categories.map(category => ({
        label: category.name,
        value: category.id
    }));

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
                change("image", res.assets[0])
            }
        }
    }

    const change = (field, value) => {
        setProduct(current => {
            return { ...current, [field]: value }
        })
    }

    return (
        <View style={[MyStyles.container, MyStyles.margin, { marginTop: 100 }]}>
            {/* <Text>ĐĂNG KÝ SẢN PHẨM {store_id} {user_id}</Text> */}
            <Text style={[MyStyles.subject, { textAlign: "center" }]}>ĐĂNG KÝ SẢN PHẨM</Text>
            <TextInput right={<TextInput.Icon style={{ paddingTop: 15 }} icon="store" />} value={product.name} onChangeText={t => change("name", t)} style={MyStyles.inputLog} label="Tên sản phẩm..." />
            <TextInput right={<TextInput.Icon style={{ paddingTop: 15 }} icon="pen" />} value={product.description} onChangeText={t => change("description", t)} style={MyStyles.inputLog} label="Mô tả..." />
            <TextInput right={<TextInput.Icon style={{ paddingTop: 15 }} icon="store" />} value={product.inventory_quantity} onChangeText={t => change("inventory_quantity", t)} style={MyStyles.inputLog} label="Số lượng..." />
            <TextInput right={<TextInput.Icon style={{ paddingTop: 15 }} icon="store" />} value={product.price} onChangeText={t => change("price", t)} style={MyStyles.inputLog} label="Giá..." />
            <RNPickerSelect
                onValueChange={(value) => {
                    setSelectedCategory(value);
                    change("category", value);
                }}
                items={categoryItems}
                placeholder={{ label: "Chọn danh mục...", value: null }}
            />
            <TouchableOpacity style={[MyStyles.input, MyStyles.margin]} onPress={picker}>
                <Text>Chọn ảnh đại diện...</Text>
            </TouchableOpacity>
            {product.image ? <Image style={MyStyles.avatarLog} source={{ uri: product.image.uri }} /> : ""}
            {/* {loading === true ? <ActivityIndicator /> : <> */}
            <TouchableOpacity onPress={registerProduct}>
                <Text style={MyStyles.buttonLog}>Đăng ký</Text>
            </TouchableOpacity>
            {/* </>} */}
        </View>
    );
}

export default RegisterProduct;