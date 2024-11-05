import { useContext, useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import Contexts from "../../configs/Contexts";
import APIs, { authApi, endpoints } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MyStyles from "../../styles/MyStyles";
//import Picker from "react-native-picker-select";
import { Picker } from "@react-native-picker/picker";

const Orders = () => {
    const [user,] = useContext(Contexts);
    const [orders, setOrders] = useState([]);
    const [store, setStore] = useState(null);

    const loadStore = async (token, userId) => {
        try {
            let res = await authApi(token).get('/stores/');
            const store = res.data.find(store => store.owner === userId);
            if (store) {
                setStore(store);
                return store.id;
            } else {
                console.log("No store found for this user.");
                return null;
            }
        } catch (ex) {
            console.error("Error loading stores:", ex);
            return null;
        }
    };

    const loadOrders = async () => {
        try {
            let token = await AsyncStorage.getItem('access-token');
            console.log("Token:", token)

            if (token && user) {
                if (user.role === 'SELLER') {
                    const storeId = await loadStore(token, user.id);
                    if (storeId) {
                        let res = await authApi(token).get(endpoints['orders-store'](storeId));
                        console.log("Orders:", res.data.results);
                        setOrders(res.data.results);
                    }
                } else {
                    let res = await authApi(token).get(endpoints['orders-user'](user.id));
                    console.log("OrdersUser:", res.data.results);
                    setOrders(res.data.results);
                }
            }
        } catch (ex) {
            if (ex.response) {
                console.error("Response data:", ex.response.data);
                console.error("Response status:", ex.response.status);
                console.error("Response headers:", ex.response.headers);
            } else if (ex.request) {
                console.error("Request data:", ex.request);
            } else {
                console.error("Error message:", ex.message);
            }
            console.error("Error config:", ex.config);
        }
    }

    // useEffect(() => {
    //     loadOrders();
    // }, []);

    useEffect(() => {
        if (user) {
            loadOrders();
        }
    }, [user]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            let token = await AsyncStorage.getItem('access-token');
            if (token) {
                let res = await authApi(token).patch(`https://tuankiet.pythonanywhere.com/orders/${orderId}/update_status/`, { status: newStatus });
                console.log("Status updated:", res.data);

                // Update the order status in the state
                setOrders(prevOrders => prevOrders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                ));
            }
        } catch (ex) {
            console.error("Error updating status:", ex);
            Alert.alert("Error", "Failed to update order status.");
        }
    };

    const renderOrderItem = ({ item }) => (
        <View style={MyStyles.orderItem}>
            <Text style={MyStyles.orderText}>Order ID: {item.id}</Text>
            {user.role === "SELLER" ? <Text style={MyStyles.orderText}>Buyer ID: {item.buyer}</Text> : <Text style={MyStyles.orderText}>Store ID: {item.store}</Text>}
            {/* <Text style={MyStyles.orderText}>Status: {item.status}</Text> */}
            <Text style={MyStyles.orderText}>Total Price: {item.total_price}</Text>
            <Text style={MyStyles.orderText}>Created Date: {new Date(item.created_date).toLocaleDateString()}</Text>
            <Text style={MyStyles.orderText}>Updated Date: {new Date(item.updated_date).toLocaleDateString()}</Text>
            {/* <Picker
                selectedValue={item.status}
                style={{ height: 50, width: 150 }}
                onValueChange={(itemValue) => handleStatusChange(item.id, itemValue)}
            >
                <Picker.Item label="Pending" value="PENDING" />
                <Picker.Item label="Ongoing" value="ONGOING" />
                <Picker.Item label="Success" value="SUCCESS" />
                <Picker.Item label="On Hold" value="ONHOLD" />
            </Picker> */}
            {user.role === "SELLER" ? (
                <Picker
                    selectedValue={item.status}
                    style={{ height: 50, width: 150 }}
                    onValueChange={(itemValue) => handleStatusChange(item.id, itemValue)}
                >
                    <Picker.Item label="Pending" value="PENDING" key="pending" />
                    <Picker.Item label="Ongoing" value="ONGOING" key="ongoing" />
                    <Picker.Item label="Success" value="SUCCESS" key="success" />
                    <Picker.Item label="On Hold" value="ONHOLD" key="onhold" />
                </Picker>
            ) : (
                <Text style={MyStyles.orderText}>Status: {item.status}</Text>
            )}
        </View>
    );

    return (
        <View style={MyStyles.container}>
            <Text style={MyStyles.headerText}>User Name: {user?.username}</Text>
            <Text style={MyStyles.headerText}>User Role: {user?.role}</Text>
            <Text style={MyStyles.headerText}>User ID: {user?.id}</Text>
            {store && <Text style={MyStyles.headerText}>Store ID: {store.id}</Text>}
            {/* {orders ? <Text>YES</Text> : <Text>NO</Text>} */}
            {orders && (user.role === "SELLER" || user.role === "BUYER") ? (
                <FlatList
                    data={orders}
                    renderItem={renderOrderItem}
                    keyExtractor={item => item.id.toString()}
                />
            ) : (
                <Text style={MyStyles.noOrdersText}>No Orders Available</Text>
            )}
        </View>
    );
}

export default Orders;

