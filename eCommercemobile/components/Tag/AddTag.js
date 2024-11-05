import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import MyStyles from "../../styles/MyStyles";
import APIs, { endpoints } from "../../configs/APIs";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNPickerSelect from 'react-native-picker-select';
import { TextInput } from "react-native-paper";


const AddTag = ({ route }) => {
    const [tag, setTag] = useState("");
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedTag, setSelectedTag] = useState(null);
    const user_id = route.params?.user_id;
    const [stores, setStores] = useState([]);


    const loadStores = async () => {
        setLoading(true);
        try {
            let res = await APIs.get(endpoints['stores']);
            // if (res.data && Array.isArray(res.data.results)) {
            //     setStores(res.data.results);
            // } else {
            //     console.error("Stores data is not an array:", res.data);
            // }
            if (Array.isArray(res.data)) {
                setStores(res.data); // directly setting the array of stores
            } else {
                console.error("Stores data is not an array:", res.data);
            }
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    };

    const loadProducts = async (storeIds) => {

        setLoading(true);
        const productsData = [];
        try {
            for (const storeId of storeIds) {
                let page = 1;
                let hasNextPage = true;
                while (hasNextPage) {
                    let res = await APIs.get(endpoints['store-products'](storeId) + `?page=${page}`);
                    if (Array.isArray(res.data.results)) {
                        productsData.push(...res.data.results);
                        hasNextPage = !!res.data.next;
                        page += 1;
                    } else {
                        console.error(`Products data from store ${storeId} is not an array:`, res.data.results);
                        hasNextPage = false;
                    }
                }
            }
            setProducts(productsData);
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    };





    useEffect(() => {
        const initializeData = async () => {
            await loadStores();
        };

        initializeData();
    }, []);

    useEffect(() => {
        if (stores.length > 0) {
            const userStores = stores.filter(store => store.owner === user_id);
            const userStoreIds = userStores.map(store => store.id);
            loadProducts(userStoreIds);
        }
    }, [stores, user_id]);



    const productItems = products.map(product => ({
        label: product.name,
        value: product.id
    }));

    const addTag = async () => {
        if (!selectedProduct || !tag) {
            alert("Please select a product and enter a tag name.");
            return;
        }

        setLoading(true);

        const form = new FormData();
        form.append("name", tag);

        try {
            const token = await AsyncStorage.getItem('access-token');
            const url = endpoints['add-tag'](selectedProduct);
            console.log('Posting to URL:', url); // Debugging log
            let res = await APIs.post(url, form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            console.info(res.data);
            alert("Tag added successfully!");
            setTag("");

        } catch (ex) {
            alert(ex.response.data["message"]);
        } finally {
            setLoading(false);
        }
    };


    return (
        <View style={[MyStyles.container, MyStyles.margin, { marginTop: 100, marginHorizontal:30 }]}>
            <Text style={[MyStyles.subject, { textAlign: "center" }]}>THÊM TAG</Text>
            <Text style={{ fontSize:16, fontWeight:"bold", marginTop:20 }}>Vui lòng chọn sản phẩm để gắn tag</Text>
            <View style={{ backgroundColor:"white", height:50, alignItems:"center", justifyContent:"center", marginBottom:10}}>
                <RNPickerSelect
                    onValueChange={(value) => {
                        setSelectedProduct(value);
                    }}
                    items={productItems}
                    placeholder={{ label: "Chọn sản phẩm...", value: null }}
                    style={{
                        inputIOS: {
                            fontSize: 16,
                            paddingVertical: 12,
                            paddingHorizontal: 10,
                            borderWidth: 1,
                            borderColor: 'gray',
                            borderRadius: 4,
                            color: 'black',
                            paddingRight: 30 
                        },
                        inputAndroid: {
                            fontSize: 16,
                            paddingHorizontal: 10,
                            paddingVertical: 8,
                            borderWidth: 0.5,
                            borderColor: 'lightgray',
                            borderRadius: 8,
                            color: 'gray',
                            paddingRight: 30,
                        }
                    }}
                />
            </View>
            

            <TextInput
                right={<TextInput.Icon style={{ paddingTop: 15 }} icon="pen" />}
                value={tag}
                onChangeText={setTag}
                style={[MyStyles.inputLog, {marginBottom:10}]}
                label="Thêm tag mới..."
            />
            <TouchableOpacity onPress={addTag}>
                <Text style={[MyStyles.buttonLog, {marginHorizontal:0}]}>Thêm tag</Text>
            </TouchableOpacity>

        </View>
    );
}

export default AddTag;
