import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Animated, Dimensions, FlatList, Image, RefreshControl, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, KeyboardAvoidingView, Platform, Alert, Modal } from "react-native";
import MyStyles from "../../styles/MyStyles";
import APIs, { authApi, endpoints } from "../../configs/APIs";
import { Card, Chip, Icon, List, SegmentedButtons, HelperText } from "react-native-paper";
import Item from "../Utils/Item";
import moment from "moment";
import Contexts from "../../configs/Contexts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from '@expo/vector-icons';
import Dialog from "react-native-dialog";
const { width } = Dimensions.get('window');

const StoreDetails = ({ route, navigation }) => {
    const storeId = route.params?.storeId;
    const [store, setStore] = useState([]);
    const [storeProduct, setStoreProduct] = useState([]);
    const specificStoreId = storeId;
    const [commentsStore, setCommentsStore] = useState([]);
    const [ratingStore, setRatingStore] = useState([]);
    const [showCommentsStore, setShowCommentsStore] = useState(false);
    const [showRatingsStore, setShowRatingsStore] = useState(false);
    const [contentCommentStore, setContentCommentStore] = useState();
    const [user,] = useContext(Contexts);
    const starRatingOptionsStore = [1, 2, 3, 4, 5];
    const [starRatingStore, setStarRatingStore] = useState(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [editingCommentStoreId, setEditingCommentStoreId] = useState(null); // State để lưu trữ ID bình luận đang được chỉnh sửa
    const [editingContentCommentStore, setEditingContentCommentStore] = useState("");
    const [editingRatingStoreId, setEditingRatingStoreId] = useState(null);
    const [editingStarRatingStore, setEditingStarRatingStore] = useState(null);
    const [replyContentStore, setReplyContentStore] = useState("");
    const [replyingCommentStoreId, setReplyingCommentStoreId] = useState(null);
    const [value, setValue] = useState('comment');
    const [err, setErr] = useState(false);
    const [dialogVisible1, setDialogVisible1] = useState(false);
    const [dialogVisible2, setDialogVisible2] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    // dialog 1: Chỉnh sửa bình luận
    const openDialog1 = () => setDialogVisible1(true);
    const closeDialog1 = () => setDialogVisible1(false);
    // dialog 2: Xóa bình luận
    const openDialog2 = () => setDialogVisible2(true);
    const closeDialog2 = () => setDialogVisible2(false);
    const userHasRated = ratingStore.some(r => user && r.buyer.id === user.id);

    const feedback = [{
        label: "Bình luận",
        value: "comment",
        checkedColor: "white",
        uncheckedColor: "black"
    },{
        label: "Rating",
        value: "rating",
        checkedColor: "white",
        uncheckedColor: "black"
    }];
    
    const handleEdit = (id, content) => {
        setEditingCommentStoreId(id);
        setEditingContentCommentStore(content);
        setIsModalVisible(true);
    };
    
    const handleDelete = (id, choice) => {
        
        if ( choice === 'comment'){
            Alert.alert('Xóa bình luận','Bạn có chắc chắn muốn xóa bình luận này', [
                {
                    text: 'OK', 
                    onPress:() => {
                        deleteCommentStore(id);
                        Alert.alert('Đã xóa thành công')
                    }
                },
                {
                    text: 'Cancel',
                    style: 'cancel'
                }
            ])
        } else if ( choice === 'rating'){
            Alert.alert('Xóa đánh giá','Bạn có chắc chắn muốn xóa đánh giá này', [
                {
                    text: 'OK', 
                    onPress:() => {
                        deleteRatingStore(id);
                        Alert.alert('Đã xóa thành công')
                    }
                }, {                   
                    text: 'Cancel',
                    style: 'cancel'                 
                }
            ])
        }
    };
    
    const handleValueChange = (newValue) => {
        setValue(newValue);
        if (newValue === 'comment') {
            handleShowComments();
        } else if(newValue === 'rating') {
            handleShowRatings();
        }
    };
    const loadStoreProduct = async () => {
        // if (page > 0) {
        //     let url = `${endpoints['store'](storeId)}?page=${page}`;
        //     try {
        //         let res = await APIs.get(url);
        //         let loadedProducts = res.data.results;
        //         if (page === 1) setStoreProduct(loadedProducts);

        //         else if (page > 1) {
        //             setStoreProduct((current) => [...current, ...loadedProducts]);
        //         }
        //         if (res.data.next === null) setPage(0);
        //     } catch (ex) {
        //         console.error(ex);
        //     }
        // }
        try {
            let res = await APIs.get(endpoints['store-products'](storeId));
            //console.log('Data: ', res.data)
            setStoreProduct(res.data.results);
        } catch (ex) {
            console.error(ex);
        }
    }
    const loadRatingStore = async () => {
        try {
            // Gọi API và nhận phản hồi
            let res = await APIs.get(endpoints['rating-store'](storeId));

            // In dữ liệu ra console để kiểm tra
            //console.log('Data received from API:', res);

            // Trích xuất dữ liệu từ phản hồi
            let data = res.data;

            // Kiểm tra xem results có phải là mảng không
            let ratingStoreArray = Array.isArray(data.results) ? data.results : [data.results];
            setRatingStore(ratingStoreArray);
        } catch (ex) {
            console.error('Error fetching comments:', ex);
            setRatingStore([]);
        }
    };

    const loadCommentsStore = async () => {
        try {
            // Gọi API và nhận phản hồi
            let res = await APIs.get(endpoints['comments-store'](storeId));

            // In dữ liệu ra console để kiểm tra
            //console.log('Data received from API:', res);

            // Trích xuất dữ liệu từ phản hồi
            let data = res.data;

            // Kiểm tra xem results có phải là mảng không
            let commentsArray = Array.isArray(data.results) ? data.results : [data.results];
            const nestedCommentsStore = nestCommentsStore(commentsArray);
            setCommentsStore(nestedCommentsStore);
            //setCommentsStore(commentsArray);
        } catch (ex) {
            console.error('Error fetching comments:', ex);
            setCommentsStore([]);
        }
    };


    const loadStore = async () => {
        try {
            let res = await APIs.get(endpoints['stores']);
            const specificStore = res.data.find(s => s.id === specificStoreId); // Tìm cửa hàng có id mong muốn
            setStore(specificStore);
        } catch (ex) {
            console.error(ex);
        }
    }

    useEffect(() => {
        loadRatingStore();
    }, [storeId])

    useEffect(() => {
        loadStoreProduct();
    }, [storeId]);

    useEffect(() => {
        loadStore();
    }, [storeId]);

    useEffect(() => {
        handleShowComments();
    }, []);
    
    const animatedButtonScale = new Animated.Value(1);

    const handlePressIn = () => {
        Animated.spring(animatedButtonScale, {
            toValue: 1.5,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(animatedButtonScale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    };

    const animatedScaleStyle = {
        transform: [{ scale: animatedButtonScale }],
    };


    const addRatingStore = async () => {
        try {
            let token = await AsyncStorage.getItem('access-token');
            let formData = new FormData();
            formData.append('rating', starRatingStore);

            let res = await authApi(token).post(endpoints['add-rating-store'](storeId), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            setRatingStore(current => [res.data, ...current]);
        } catch (ex) {
            console.error(ex);
        }
    };

    const addCommentStore = async () => {
        try {
            let token = await AsyncStorage.getItem('access-token');
            let formData = new FormData();
            formData.append('content', contentCommentStore);
            if (contentCommentStore === "") throw "Không bỏ trống bình luận";
            let res = await authApi(token).post(endpoints['add-comment-store'](storeId), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            setCommentsStore(current => [res.data, ...(current || [])]);
            setContentCommentStore("");
            setErr("");
        } catch (ex) {
            setErr(ex);
        }
    };

    const addReplyStore = async (parentId) => {

        try {
            let token = await AsyncStorage.getItem('access-token');
            let formData = new FormData();
            formData.append('content', replyContentStore);
            formData.append('parent', parentId);

            let res = await authApi(token).post(endpoints['add-comment-store'](storeId), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            const newReply = res.data;
            setCommentsStore(current => {
                if (!Array.isArray(current)) {
                    return [];
                }
                const updatedCommentsStore = current.map(comment => {
                    if (comment.id === parentId) {
                        return {
                            ...comment,
                            replies: [...(comment.replies || []), newReply]
                        };
                    } else {
                        return {
                            ...comment,
                            replies: (comment.replies || []).map(reply =>
                                reply.id === parentId ? { ...reply, replies: [...(reply.replies || []), newReply] } : reply
                            )
                        };
                    }
                });
                return updatedCommentsStore;
            });
            setReplyContentStore("");
            setReplyingCommentStoreId(null);
        } catch (ex) {
            console.error('Error adding reply:', ex);
        }

    };

    const nestCommentsStore = (comments) => {
        const commentMap = new Map();
        comments.forEach(comment => commentMap.set(comment.id, { ...comment, replies: [] }));
        const nestedCommentsStore = [];
        commentMap.forEach(comment => {
            if (comment.parent === null) {
                nestedCommentsStore.push(comment);
            } else {
                const parentCommentStore = commentMap.get(comment.parent);
                if (parentCommentStore) {
                    parentCommentStore.replies.push(comment);
                }
            }
        });
        return nestedCommentsStore;
    };

    const deleteCommentStore = async (commentId) => {
        try {
            let token = await AsyncStorage.getItem('access-token');
            let res = await authApi(token).delete(endpoints['delete-comment-store'](commentId));
            setCommentsStore(current => current.filter(comment => comment.id !== commentId));
        } catch (ex) {
            console.error('Error deleting comment:', ex);
        }
    };

    const deleteRatingStore = async (ratingId) => {
        try {
            let token = await AsyncStorage.getItem('access-token');
            await authApi(token).delete(endpoints['delete-rating-store'](ratingId));
            setRatingStore(current => current.filter(rating => rating.id !== ratingId));
        } catch (ex) {
            console.error('Error deleting rating:', ex);
        }
    };

    const updateCommentStore = async (commentId) => {
        try {
            let token = await AsyncStorage.getItem('access-token');
            let res = await authApi(token).patch(endpoints['update-comment-store'](commentId), {
                'content': editingContentCommentStore
            });
            setCommentsStore(current => current.map(comment => comment.id === commentId ? res.data : comment));
            setEditingCommentStoreId(null); // Tắt chế độ chỉnh sửa sau khi cập nhật thành công
        } catch (ex) {
            console.error('Error updating comment:', ex);
        }
    };

    const updateRatingStore = async (ratingId) => {
        try {
            let token = await AsyncStorage.getItem('access-token');
            let res = await authApi(token).patch(endpoints['update-rating-store'](ratingId), {
                'rating': editingStarRatingStore
            });
            setRatingStore(current => current.map(rating => rating.id === ratingId ? res.data : rating));
            setEditingRatingStoreId(null);
        } catch (ex) {
            console.error('Error updating rating:', ex);
        }
    };

    const handleShowComments = () => {
        setShowCommentsStore(true);
        setShowRatingsStore(false);
    };
    

    const handleShowRatings = () => {
        setShowCommentsStore(false);
        setShowRatingsStore(true);
    };

    const loadMoreInfo = ({ nativeEvent }) => {
        if (!commentsStore && isCloseToBottom(nativeEvent)) {
            loadCommentsStore();
        }
    }

    useEffect(() => {
        loadCommentsStore();
    }, [storeId]);


    const loadMore = ({ distanceFromEnd }) => {
        if (loading === false && distanceFromEnd < 10) {
            setPage((prevPage) => prevPage + 1);
        }
    };
    return (
        // <PaperProvider>
        <SafeAreaView style={MyStyles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            {store === null ? <ActivityIndicator /> : <> 
                <ScrollView style={{ backgroundColor:"red" }}>                         
                    <View style={MyStyles.container}>
                        <Card style={{ backgroundColor:"white", borderRadius:0 }}>
                            <Card.Cover source={{ uri: store.image }} resizeMode="cover" />
                            <Card.Content>
                                <Text style={MyStyles.storeName}>{store.name}</Text>
                                <Text style={MyStyles.storeAddress}>Địa chỉ: {store.address}</Text>
                                <Text style={MyStyles.storeEmail}>Email: {store.email}</Text>
                                <Text style={MyStyles.storePhone}>Số điện thoại: {store.phone_number}</Text>
                            </Card.Content>
                            <View style={MyStyles.avatarContainer}>
                                <Image resizeMode="contain" source={{ uri: store.image }} style={{ width:"100%", height:"100%", borderRadius: 50 }} />
                            </View>
                        </Card>

                        <Card style={{ marginTop:5, padding: 3, borderRadius:0, backgroundColor:"white"}}>
                            <Text style={{ fontSize: 20, fontWeight: "bold", color: "white", padding:10, backgroundColor:"#EE4D2D"}}>CÁC SẢN PHẨM CỦA CỬA HÀNG</Text>
                            <ScrollView style={{ borderTopWidth:1, borderTopColor:"#b43006", paddingTop:5, backgroundColor:"white" }} >
                                <FlatList
                                    scrollEnabled={false}
                                    style={{ flex: 1, backgroundColor:"white" }}
                                    data={storeProduct}
                                    numColumns={2}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={{ width: width / 2 - 5, height:"100%", backgroundColor:"white" }}
                                            onPress={() => navigation.navigate("ProductDetails", { 'productId': item.id })}
                                        >
                                            <Item instance={item} />
                                        </TouchableOpacity>
                                    )}
                                    />
                            </ScrollView>   
                        </Card>


                        <Card style={{ padding:10, backgroundColor:"white", borderRadius:0 }}>
                            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#EE4D2D", marginBottom:5 }}>PHẢN HỒI NGƯỜI DÙNG</Text>
                            <View style={{ padding: 10, borderTopWidth:1, borderTopColor:"lightgray", paddingVertical:30 }}>
                                <SegmentedButtons value={value} onValueChange={handleValueChange} buttons={feedback} theme={{ roundness: 0 }} density="medium" />
                            </View>
                            {showCommentsStore && commentsStore !== null && (
                                <>
                                    <Text style={MyStyles.subject}>NHẬN XÉT</Text>
                                    {user === null ? "" : <>
                                        <View style={[MyStyles.row, { alignItems: "center", justifyContent: "center" }]}>
                                            <TextInput value={contentCommentStore} onChangeText={t => setContentCommentStore(t)} style={{ height:40, width: 300, backgroundColor: "lightgray", padding: 5, margin:5 }} placeholderTextColor="gray"  placeholder="Nội dung bình luận..." />
                                            <TouchableOpacity onPress={addCommentStore} style={{ height:40 }}>
                                                <Text style={{ textAlign: "center", backgroundColor: '#ff4500', color: "white", padding: 11 }}>Bình luận</Text>
                                            </TouchableOpacity>
                                        </View>
                                    <HelperText style={{ color:"red" }} type="error" visible={!!err}>{err}</HelperText>
                                </>}
                                {editingCommentStoreId !== null && (
                                <Modal
                                    transparent={true}
                                    animationType="slide"
                                    visible={isModalVisible}
                                    presentationStyle="overFullScreen" 
                                    onRequestClose={() => setIsModalVisible(false)}
                                    onDismiss={() => setIsModalVisible(false)}
                                    >
                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
                                        <View style={{ backgroundColor:"white", width:"80%", height:150, padding:15, borderRadius:10}}>
                                            <Text style={{ fontSize: 20, fontWeight:"bold" }}>Chỉnh sửa bình luận</Text>
                                            <TextInput 
                                                value={editingContentCommentStore} 
                                                onChangeText={setEditingContentCommentStore}
                                                style={{ height:50, width: 300, backgroundColor: "white", padding: 10, margin:5, borderWidth:2, borderColor:"lightgray", borderRadius:10 }}
                                                placeholder="Nội dung..."
                                                placeholderTextColor="gray">
                                            </TextInput>
                                            <View style={{ flexDirection:"row", justifyContent:"flex-end"}}>
                                                <TouchableOpacity onPress={() => {
                                                updateCommentStore(editingCommentStoreId);
                                                setEditingCommentStoreId(null);
                                                setIsModalVisible(false);
                                                }}>
                                                    <Text style={[MyStyles.buttonComment, { margin: 5, marginHorizontal:10 }]}>Lưu</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => {
                                                    setEditingCommentStoreId(null);
                                                    setIsModalVisible(false);
                                                    }}>
                                                    <Text style={[MyStyles.margin, { paddingTop: 10, color: 'red' }]}>Hủy</Text>
                                                </TouchableOpacity>
                                            </View>
                                            
                                        </View>
                                    </View>
                                </Modal>
                                )}
                                {commentsStore.map((c) => (
                                    <View key={c.id}>
                                        <List.Item
                                        style={{ borderColor:"lightgray", borderWidth:1, borderRadius:10, height:100, justifyContent:"center", marginVertical:5 }}
                                        left={() => <View><Image source={{ uri: c.buyer.avatar }} style={{ width:50, height:50, borderRadius:25, marginLeft:10}}/></View>}
                                        title={
                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                            <Text style={{ fontSize: 15, fontWeight:"bold", marginRight:80}}>{c.buyer.username}</Text>
                                            {user && user.id === c.buyer.id && (
                                                <>
                                                    <TouchableOpacity onPress={() => handleDelete(c.id,'comment')} style={{ marginLeft: 10 }}>
                                                        <Text style={{ color: 'red' }}>Xóa</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => {
                                                        handleEdit(c.id, c.content)                                                              
                                                    }} style={{ marginLeft: 10 }}>
                                                        <Text style={{ color: 'blue' }}>Chỉnh sửa</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => setReplyingCommentStoreId(c.id)} style={{ marginLeft: 10 }}>
                                                        <Text style={{ color: 'green' }}>Phản hồi</Text>
                                                    </TouchableOpacity>
                                                </>
                                            )}
                                            {user && user.id !== c.buyer.id && (
                                                <TouchableOpacity onPress={() => setReplyingCommentStoreId(c.id)} style={{ marginLeft: 10 }}>
                                                    <Text style={{ color: 'green' }}>Phản hồi</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>}
                                        description={
                                            <View>
                                                <Text>{c.content}</Text>
                                                <Text>{moment(c.created_date).fromNow()}</Text>
                                            </View>                                                 
                                        }                                               
                                        />

                                        {replyingCommentStoreId === c.id && (
                                            <View style={MyStyles.row}>
                                                <TextInput
                                                    value={replyContentStore}
                                                    onChangeText={setReplyContentStore}
                                                    style={{ height:40, width: 300, backgroundColor: "lightgray", padding: 5, margin:5}}
                                                    placeholder="Nội dung phản hồi..."
                                                    placeholderTextColor="gray"
                                                />
                                                <TouchableOpacity onPress={() => addReplyStore(c.id)}>
                                                    <Text style={{textAlign: "center", backgroundColor: '#ff4500', color: "white", width:40, height:40, padding:10, marginTop: 5}}>Gửi</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => setReplyingCommentStoreId(null)}>
                                                    <Text style={{textAlign: "center", backgroundColor: 'white', color: "#ff4500", marginTop: 5, marginLeft:2, width:40, height:40, padding:10}}>Hủy</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                                
                                        {c.replies && c.replies.map((reply) => (
                                            <List.Item
                                                key={reply.id}
                                                style={{ borderColor:"lightgray", borderWidth:1, borderRadius:10, height:80, justifyContent:"center", marginLeft: 20, marginVertical:5 }}
                                                left={() => <View><Image source={{ uri: reply.buyer.avatar }} style={{ width:50, height:50, borderRadius:25, marginLeft:10}}/></View>}
                                                title={<View style={{ flexDirection: "row", alignItems: "center" }}>
                                                    <Text style={{fontSize: 15, fontWeight:"bold", marginRight:80}}>{reply.buyer.username}</Text>
                                                    {user && user.id === reply.buyer.id && (
                                                        <>
                                                            <TouchableOpacity onPress={() => handleDelete(reply.id,'comment')} style={{ marginLeft: 10 }}>
                                                                <Text style={{ color: 'red' }}>Xóa</Text>
                                                            </TouchableOpacity>
                                                            <TouchableOpacity onPress={() => {
                                                                handleEdit(reply.id, reply.content)
                                                            }} style={{ marginLeft: 10 }}>
                                                                <Text style={{ color: 'blue' }}>Chỉnh sửa</Text>
                                                            </TouchableOpacity>
                                                        </>
                                                    )}
                                                </View>}
                                                description={
                                                    <View>
                                                        <Text>{reply.content}</Text>
                                                        <Text>{moment(reply.created_date).fromNow()}</Text>
                                                    </View>                                                 
                                                }
                                            />
                                        ))}
                                    </View>
                                ))}
                            </>
                        )}
                        {showRatingsStore && ratingStore !== null && (
                            <>
                                <Text style={MyStyles.subject}>ĐÁNH GIÁ</Text>
                                {!userHasRated && <>
                                    <View style={[MyStyles.row, { alignItems: "center", justifyContent: "center" }]}>
                                        <Text style={MyStyles.heading}>{starRatingStore ? `${starRatingStore}*` : 'Tap to rate'}</Text>
                                        <View style={MyStyles.stars}>
                                            {starRatingOptionsStore.map((option) => (
                                                <TouchableWithoutFeedback
                                                    onPressIn={() => handlePressIn(option)}
                                                    onPressOut={() => handlePressOut(option)}
                                                    onPress={() => setStarRatingStore(option)}
                                                    key={option}
                                                >
                                                    <Animated.View style={animatedScaleStyle}>
                                                        <MaterialIcons
                                                            name={starRatingStore >= option ? 'star' : 'star-border'}
                                                            size={32}
                                                            style={starRatingStore >= option ? MyStyles.starSelected : MyStyles.starUnselected}
                                                        />
                                                    </Animated.View>
                                                </TouchableWithoutFeedback>
                                            ))}
                                        </View>
                                        <TouchableOpacity onPress={addRatingStore} style={{ marginLeft: 30}}>
                                            <Text style={MyStyles.buttonComment}>Đánh giá</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>}
                                {ratingStore.map((r) => (
                                    <View key={r.id}>
                                        {editingRatingStoreId === r.id ? (
                                            <View style={[MyStyles.row, { justifyContent: "center" }]}>
                                                <Text style={[MyStyles.heading, MyStyles.margin]}>{editingStarRatingStore ? `${editingStarRatingStore}*` : 'Tap to rate'}</Text>
                                                <View style={[MyStyles.stars, MyStyles.margin]}>
                                                    {starRatingOptionsStore.map((option) => (
                                                        <TouchableWithoutFeedback
                                                            onPressIn={() => handlePressIn(option)}
                                                            onPressOut={() => handlePressOut(option)}
                                                            onPress={() => setEditingStarRatingStore(option)}
                                                            key={option}
                                                        >
                                                            <Animated.View style={animatedScaleStyle}>
                                                                <MaterialIcons
                                                                    name={editingStarRatingStore >= option ? 'star' : 'star-border'}
                                                                    size={32}
                                                                    style={editingStarRatingStore >= option ? MyStyles.starSelected : MyStyles.starUnselected}
                                                                />
                                                            </Animated.View>
                                                        </TouchableWithoutFeedback>
                                                    ))}
                                                </View>
                                                <TouchableOpacity onPress={() => updateRatingStore(r.id)}>
                                                    <Text style={MyStyles.buttonComment}>Lưu</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => setEditingRatingStoreId(null)}>
                                                    <Text style={[MyStyles.margin, { paddingTop: 5, color: 'red' }]}>Hủy</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                            <List.Item
                                                style={{ borderColor:"lightgray", borderWidth:1, borderRadius:10, height:100, justifyContent:"center", marginVertical:5 }}
                                                left={() => <View><Image source={{ uri: r.buyer.avatar }} style={{ width:50, height:50, borderRadius:25, marginLeft:10}}/></View>}
                                                title={<View style={{ flexDirection: "row", alignItems: "center", marginLeft:100 }}>
                                                            <Text style={{ fontWeight:"bold", fontSize:16, marginRight:130 }}>{r.buyer.username}</Text>
                                                            {user && user.id === r.buyer.id && (
                                                                <>
                                                                    <TouchableOpacity onPress={() => handleDelete(r.id,'rating')} style={{ marginLeft: 10 }}>
                                                                        <Text style={{ color: 'red' }}>Xóa</Text>
                                                                    </TouchableOpacity>
                                                                    <TouchableOpacity onPress={() => {
                                                                        setEditingRatingStoreId(r.id);
                                                                        setEditingStarRatingStore(r.rating);
                                                                    }} style={{ marginLeft: 10 }}>
                                                                        <Text style={{ color: 'blue' }}>Chỉnh sửa</Text>
                                                                    </TouchableOpacity>
                                                                </>
                                                            )}
                                                    </View>}
                                                description={
                                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                        <Text>{r.rating}</Text>
                                                        <Icon source="star" size={20} color="gold" style={{ marginLeft:10 }} />
                                                        <Text>{moment(r.created_date).fromNow()}</Text>
                                                    </View>                                                 
                                                }       
                                            />
                                            
                                        )}
                                    </View>
                                ))}
                            </>
                        )}
                    </Card> 

                                    
                    </View>
                    
                </ScrollView>
                </>}
            </KeyboardAvoidingView>         
        </SafeAreaView>
        // {/* </PaperProvider> */}
    );
}

export default StoreDetails;

