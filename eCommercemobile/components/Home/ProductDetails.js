import { useContext, useEffect, useState } from "react"
import { ActivityIndicator, Animated, KeyboardAvoidingView, Image, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, useWindowDimensions, Platform } from "react-native";
import APIs, { authApi, endpoints } from "../../configs/APIs";
import MyStyles from "../../styles/MyStyles";
import { Card, Chip, Icon, List, SegmentedButtons, PaperProvider, Button, Portal, Dialog, HelperText } from "react-native-paper";
import RenderHTML from "react-native-render-html";
import moment, { relativeTimeRounding } from "moment";
import { isCloseToBottom } from "../Utils/Utils";
import 'moment/locale/vi';
import Item from "../Utils/Item";
import Contexts from "../../configs/Contexts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from '@expo/vector-icons';



const ProductDetails = ({ route, navigation }) => {
    const [product, setProduct] = useState(null);
    const [comments, setComments] = useState([]);
    const { width } = useWindowDimensions();
    const productId = route.params?.productId;
    const [loading, setLoading] = useState(true);
    const [stores, setStores] = useState([]);
    const [ratings, setRatings] = useState([]);
    const [showComments, setShowComments] = useState(false);
    const [showRatings, setShowRatings] = useState(false);
    const [contentComment, setContentComment] = useState();
    const [user,] = useContext(Contexts);
    const starRatingOptions = [1, 2, 3, 4, 5];
    const [starRating, setStarRating] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null); // State để lưu trữ ID bình luận đang được chỉnh sửa
    const [editedContentComment, setEditedContentComment] = useState(""); // State để lưu trữ nội dung bình luận được chỉnh sửa
    const [editingRatingId, setEditingRatingId] = useState(null);
    const [editedStarRating, setEditedStarRating] = useState(null);
    const [deletingCommentId, setDeletingCommentId] = useState(null);
    const [deletingRatingId, setDeletingRatingId] = useState(null);
    const [replyContent, setReplyContent] = useState("");
    const [replyingCommentId, setReplyingCommentId] = useState(null);
    const [value, setValue] = useState('comment');
    const [dialogVisible1, setDialogVisible1] = useState(false);
    const [dialogVisible2, setDialogVisible2] = useState(false);
    // dialog 1: Chỉnh sửa bình luận
    const openDialog1 = () => setDialogVisible1(true);
    const closeDialog1 = () => setDialogVisible1(false);
    // dialog 2: Xóa bình luận
    const openDialog2 = () => setDialogVisible2(true);
    const closeDialog2 = () => setDialogVisible2(false);

    const userHasRated = ratings.some(r => user && r.buyer.id === user.id);
    const [err, setErr] = useState(false);

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
        setEditingCommentId(id);
        setEditedContentComment(content);
        openDialog1();
    };
    
    const handleDelete = (id, choice) => {
        if ( choice === 'comment'){
            setDeletingCommentId(id);
        } else if ( choice === 'rating'){
            setDeletingRatingId(id)
        }
        openDialog2();
        
    }

    const loadRatings = async () => {
        try {
            // Gọi API và nhận phản hồi
            let res = await APIs.get(endpoints['ratings'](productId));

            // In dữ liệu ra console để kiểm tra
            //console.log('Data received from API:', res);

            // Trích xuất dữ liệu từ phản hồi
            let data = res.data;

            // Kiểm tra xem results có phải là mảng không
            let ratingsArray = Array.isArray(data.results) ? data.results : [data.results];
            setRatings(ratingsArray);
        } catch (ex) {
            console.error('Error fetching comments:', ex);
            setRatings([]);
        }
    };

    const loadStores = async () => {
        try {
            let res = await APIs.get(endpoints['product-details'](productId));
            setStores(res.data);
        } catch (ex) {
            console.error(ex);
        }
    };

    const loadProduct = async () => {
        try {
            let res = await APIs.get(endpoints['product-details'](productId));
            setProduct(res.data);
        } catch (ex) {
            console.error(ex);
        }
    }

    const loadComments = async () => {
        try {
            let res = await APIs.get(endpoints['comments'](productId));
            let data = res.data;
            let commentsArray = Array.isArray(data.results) ? data.results : [data.results];
            const nestedComments = nestComments(commentsArray);
            setComments(nestedComments);
        } catch (ex) {
            console.error('Error fetching comments:', ex);
            setComments([]);
        }

    };

    useEffect(() => {
        loadRatings();
    }, [productId])

    useEffect(() => {
        loadStores();
    }, [productId])

    useEffect(() => {
        loadProduct();
    }, [productId]);


    useEffect(() => {
        loadComments();
    }, [productId, comments]);

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


    const addRating = async () => {
        try {
            let token = await AsyncStorage.getItem('access-token');
            let res = await authApi(token).post(endpoints['add-rating'](productId), {
                'rating': starRating
            })
            setRatings(current => [res.data, ...current]);
        } catch (ex) {
            console.error(ex);
        }

    };

    const addComment = async () => {
        try {
            let token = await AsyncStorage.getItem('access-token');
            let res = await authApi(token).post(endpoints['add-comment'](productId), {
                'content': contentComment
            });
            
            setComments(current => [res.data, ...(current || [])]);
            setContentComment("");
            setErr("");
        } catch (ex) {
            setErr('Không được để trống bình luận');
        }


    };

    const addReply = async (parentId) => {

        try {
            let token = await AsyncStorage.getItem('access-token');
            let res = await authApi(token).post(endpoints['add-comment'](productId), {
                'content': replyContent,
                'parent': parentId
            });
            setComments(current => {
                const updatedComments = Array.isArray(current) ? [...current] : [];
                const parentComment = updatedComments.find(comment => comment.id === parentId);
                if (parentComment) {
                    parentComment.replies.push(res.data);
                }
                return updatedComments;
            });
            setReplyContent("");
            setReplyingCommentId(null);
        } catch (ex) {
            console.error('Error adding reply:', ex);
        }


    };

    const nestComments = (comments) => {
        const commentMap = new Map();
        comments.forEach(comment => commentMap.set(comment.id, { ...comment, replies: [] }));
        const nestedComments = [];
        commentMap.forEach(comment => {
            if (comment.parent === null) {
                nestedComments.push(comment);
            } else {
                const parentComment = commentMap.get(comment.parent);
                if (parentComment) {
                    parentComment.replies.push(comment);
                }
            }
        });
        return nestedComments;
    };

    const deleteComment = async (commentId) => {
        try {
            let token = await AsyncStorage.getItem('access-token');
            let res = await authApi(token).delete(endpoints['delete-comment'](commentId));
            setComments(current => current.filter(comment => comment.id !== commentId));
        } catch (ex) {
            console.error('Error deleting comment:', ex);
        }
    };

    const deleteRating = async (ratingId) => {
        try {
            let token = await AsyncStorage.getItem('access-token');
            await authApi(token).delete(endpoints['delete-rating'](ratingId));
            setRatings(current => current.filter(rating => rating.id !== ratingId));
        } catch (ex) {
            console.error('Error deleting rating:', ex);
        }
    };

    const updateComment = async (commentId) => {
        try {
            let token = await AsyncStorage.getItem('access-token');
            let res = await authApi(token).patch(endpoints['update-comment'](commentId), {
                'content': editedContentComment
            });
            setComments(current => current.map(comment => comment.id === commentId ? res.data : comment));
            setEditingCommentId(null); // Tắt chế độ chỉnh sửa sau khi cập nhật thành công
        } catch (ex) {
            console.error('Error updating comment:', ex);
        }
    };

    const updateRating = async (ratingId) => {
        try {
            let token = await AsyncStorage.getItem('access-token');
            let res = await authApi(token).patch(endpoints['update-rating'](ratingId), {
                'rating': editedStarRating
            });
            setRatings(current => current.map(rating => rating.id === ratingId ? res.data : rating));
            setEditingRatingId(null);
        } catch (ex) {
            console.error('Error updating rating:', ex);
        }
    };


    const handleShowComments = () => {
        setShowComments(true);
        setShowRatings(false);
    };

    const handleShowRatings = () => {
        setShowComments(false);
        setShowRatings(true);
    };

    const handleValueChange = (newValue) => {
        setValue(newValue);
        if (newValue === 'comment') {
            handleShowComments();
        } else if(newValue === 'rating') {
            handleShowRatings();
        }
    };

    const loadMoreInfo = ({ nativeEvent }) => {
        if (!comments && isCloseToBottom(nativeEvent)) {
            loadComments();
        }
    }



    const handleBuyPress = () => {
        // Xử lý sự kiện khi nhấn nút "Mua hàng"
        console.log('Mua hàng');
        // Bạn có thể điều hướng đến trang thanh toán hoặc xử lý logic khác ở đây
        navigation.navigate('Checkout');
    };



    return (
        <PaperProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor:"white", alignItems:"center"}}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView onScroll={loadMoreInfo} style={{ marginBottom: 50 }}>                  
                    {product === null ? <ActivityIndicator /> : <>
                        <Card style={{ borderRadius:0, backgroundColor:"white" }}>
                            <Card.Cover source={{ uri: product.image }} />
                            <View style={MyStyles.row}>
                                {product.tags.map(tag => (
                                    <Chip key={tag.id} style={MyStyles.margin} icon="tag">
                                        {tag.name}
                                    </Chip>
                                ))}
                            </View>
                            <Card.Title titleStyle={MyStyles.subject} title={product.name} />
                            <Card.Title titleStyle={{ fontSize: 18, fontWeight: "bold", color: "#EE4D2D" }} title={product.price+"đ"} />
                            <Card.Content style={{borderTopWidth:1, borderTopColor:"lightgray", padding:10}}>
                                <Text style={{ fontWeight:"bold", fontSize:16 }}>THÔNG TIN SẢN PHẨM</Text>
                                <RenderHTML contentWidth={width} source={{ html: product.description }} />
                                <Text style={{ fontWeight:"bold", fontSize:14 }}>Số lượng tồn: {product.inventory_quantity}</Text>
                            </Card.Content>
                        </Card>
                    </>}



                    {product && product.store && (
                        <Card style={{
                            borderRadius: 0,
                            marginTop: 10,
                            marginBottom: 10,
                            backgroundColor: "white",
                            padding: 10,
                            height: 90,
                            alignItems:"center",
                            flexDirection:"row"
                            }}>
                            <TouchableOpacity
                                key={product.store.id}
                                onPress={() => navigation.navigate("StoreDetails", { 'storeId': product.store.id })}
                                >
                                <List.Item
                                    style={{margin:5, paddingRight:100}}
                                    title={<Text style={{ color:"black"}}>{product.store.name}</Text>}
                                    description={() => (
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Icon source="map-marker" size={20} color="red" />
                                            <Text style={{ marginLeft: 3 }}>{product.store.address}</Text>
                                        </View>
                                    )}
                                    left={() => <Image resizeMode="contain" style={{ width: 70, height:70, borderRadius:35, borderColor:"lightgray", borderWidth:2 }} source={{ uri: product.store.image }} />}
                                />
                            </TouchableOpacity>
                        </Card>
                        
                    )}
                    
                    <Card style={{ padding:10, backgroundColor:"white", borderRadius:0 }}>
                    <Text style={{ fontSize: 20, fontWeight: "bold", color: "#EE4D2D", marginBottom:5 }}>PHẢN HỒI NGƯỜI DÙNG</Text>
                    <View style={{ padding: 10, borderTopWidth:1, borderTopColor:"lightgray", paddingVertical:30 }}>
                        <SegmentedButtons value={value} onValueChange={handleValueChange} buttons={feedback} theme={{ roundness: 0 }} density="medium" />
                    </View>

                    
                    {showComments && comments !== null && (
                        <>
                            <Text style={MyStyles.subject}>NHẬN XÉT</Text>
                            {user === null ? "" : <>
                                <View style={[MyStyles.row, { alignItems: "center", justifyContent: "center" }]}>
                                    <TextInput value={contentComment} onChangeText={t => setContentComment(t)} style={{ height:40, width: 300, backgroundColor: "lightgray", padding: 5, margin:5 }} placeholderTextColor="gray"  placeholder="Nội dung bình luận..." />
                                    <TouchableOpacity onPress={addComment} style={{ height:40 }}>
                                        <Text style={{ textAlign: "center", backgroundColor: '#ff4500', color: "white", padding: 11 }}>Bình luận</Text>
                                    </TouchableOpacity>
                                </View>
                                <HelperText style={{ color:"red" }} type="error" visible={!!err}>{err}</HelperText>
                            </>}
                            {editingCommentId !== null && (
                            <View>
                                <Portal>
                                <Dialog visible={dialogVisible1} onDismiss={closeDialog1} style={{ backgroundColor:"white"}}>
                                    <Dialog.Title style={{ color:"black", fontWeight:"bold"}}>Chỉnh sửa bình luận</Dialog.Title>
                                    <Dialog.Content>
                                        <TextInput
                                            value={editedContentComment}
                                            onChangeText={setEditedContentComment}
                                            style={{ height:50, width: 300, backgroundColor: "white", padding: 10, margin:5, borderWidth:2, borderColor:"lightgray", borderRadius:10 }}
                                            placeholder="Nội dung..."
                                            placeholderTextColor="gray"
                                        />
                                    </Dialog.Content>
                                    <Dialog.Actions>
                                        <TouchableOpacity onPress={() => {
                                            updateComment(editingCommentId)
                                            setEditingCommentId(null);
                                            closeDialog1();
                                        }}>
                                            <Text style={[MyStyles.buttonComment, { marginTop: 4 }]}>Lưu</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => {
                                            setEditingCommentId(null)
                                            closeDialog1();
                                            }}>
                                            <Text style={[MyStyles.margin, { paddingTop: 10, color: 'red' }]}>Hủy</Text>
                                        </TouchableOpacity>
                                    </Dialog.Actions>
                                </Dialog>
                                </Portal>
                            </View>
                            )}
                            {deletingCommentId !== null && (
                            <View>
                                <Portal>
                                <Dialog visible={dialogVisible2} onDismiss={closeDialog2} style={{ backgroundColor:"white"}}>
                                    <Dialog.Title style={{ color:"black", fontWeight:"bold"}}>Xóa bình luận</Dialog.Title>
                                    <Dialog.Content>
                                        <Text>
                                            Bạn có chắc chắn xóa bình luận này không?
                                        </Text>
                                    </Dialog.Content>
                                    <Dialog.Actions>
                                        <TouchableOpacity onPress={() => {
                                            deleteComment(deletingCommentId)
                                            setDeletingCommentId(null);
                                            closeDialog2();
                                        }}>
                                            <Text style={[MyStyles.buttonComment, { marginTop: 4 }]}>Xóa</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => {
                                            setDeletingCommentId(null)
                                            closeDialog2();
                                            }}>
                                            <Text style={[MyStyles.margin, { paddingTop: 10, color: 'red' }]}>Hủy</Text>
                                        </TouchableOpacity>
                                    </Dialog.Actions>
                                </Dialog>
                                </Portal>
                            </View>
                            )}    
                            {comments.map((c) => (
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
                                                <TouchableOpacity onPress={() => setReplyingCommentId(c.id)} style={{ marginLeft: 10 }}>
                                                    <Text style={{ color: 'green' }}>Phản hồi</Text>
                                                </TouchableOpacity>
                                            </>
                                        )}
                                        {user && user.id !== c.buyer.id && (
                                            <TouchableOpacity onPress={() => setReplyingCommentId(c.id)} style={{ marginLeft: 10 }}>
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

                                    {replyingCommentId === c.id && (
                                        <View style={MyStyles.row}>
                                            <TextInput
                                                value={replyContent}
                                                onChangeText={setReplyContent}
                                                style={{ height:40, width: 300, backgroundColor: "lightgray", padding: 5, margin:5}}
                                                placeholder="Nội dung phản hồi..."
                                                placeholderTextColor="gray"
                                            />
                                            <TouchableOpacity onPress={() => addReply(c.id)}>
                                                <Text style={{textAlign: "center", backgroundColor: '#ff4500', color: "white", width:40, height:40, padding:10, marginTop: 5}}>Gửi</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => setReplyingCommentId(null)}>
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

                    {showRatings && ratings !== null && (
                        <>
                            <Text style={MyStyles.subject}>ĐÁNH GIÁ</Text>
                            {!userHasRated && <>
                                <View style={[MyStyles.row, { alignItems: "center", justifyContent: "center" }]}>
                                    <Text style={MyStyles.heading}>{starRating ? `${starRating}*` : 'Tap to rate'}</Text>
                                    <View style={MyStyles.stars}>
                                        {starRatingOptions.map((option) => (
                                            <TouchableWithoutFeedback
                                                onPressIn={() => handlePressIn(option)}
                                                onPressOut={() => handlePressOut(option)}
                                                onPress={() => setStarRating(option)}
                                                key={option}
                                            >
                                                <Animated.View style={animatedScaleStyle}>
                                                    <MaterialIcons
                                                        name={starRating >= option ? 'star' : 'star-border'}
                                                        size={32}
                                                        style={starRating >= option ? MyStyles.starSelected : MyStyles.starUnselected}
                                                    />
                                                </Animated.View>
                                            </TouchableWithoutFeedback>
                                        ))}
                                    </View>
                                    {/* <TextInput value={contentRating} onChangeText={t => setContentRating(t)} style={MyStyles.comment} placeholder="Nội dung bình luận" /> */}
                                    <TouchableOpacity onPress={addRating} style={{ marginLeft: 30}}>
                                        <Text style={MyStyles.buttonComment}>Đánh giá</Text>
                                    </TouchableOpacity>
                                </View>
                            </>}
                            {deletingRatingId !== null && (
                            <View>
                                <Portal>
                                <Dialog visible={dialogVisible2} onDismiss={closeDialog2} style={{ backgroundColor:"white"}}>
                                    <Dialog.Title style={{ color:"black", fontWeight:"bold"}}>Xóa đánh giá</Dialog.Title>
                                    <Dialog.Content>
                                        <Text>
                                            Bạn có chắc chắn xóa đánh giá này không?
                                        </Text>
                                    </Dialog.Content>
                                    <Dialog.Actions>
                                        <TouchableOpacity onPress={() => {
                                            deleteRating(deletingRatingId)
                                            setDeletingRatingId(null);
                                            closeDialog2();
                                        }}>
                                            <Text style={[MyStyles.buttonComment, { marginTop: 4 }]}>Xóa</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => {
                                            setDeletingRatingId(null)
                                            closeDialog2();
                                            }}>
                                            <Text style={[MyStyles.margin, { paddingTop: 10, color: 'red' }]}>Hủy</Text>
                                        </TouchableOpacity>
                                    </Dialog.Actions>
                                </Dialog>
                                </Portal>
                            </View>
                            )} 
                            {ratings.map((r) => (
                                <View key={r.id}>
                                    {editingRatingId === r.id ? (
                                        <View style={[MyStyles.row, { justifyContent: "center" }]}>
                                            <Text style={[MyStyles.heading, MyStyles.margin]}>{editedStarRating ? `${editedStarRating}*` : 'Tap to rate'}</Text>
                                            <View style={[MyStyles.stars, MyStyles.margin]}>
                                                {starRatingOptions.map((option) => (
                                                    <TouchableWithoutFeedback
                                                        onPressIn={() => handlePressIn(option)}
                                                        onPressOut={() => handlePressOut(option)}
                                                        onPress={() => setEditedStarRating(option)}
                                                        key={option}
                                                    >
                                                        <Animated.View style={animatedScaleStyle}>
                                                            <MaterialIcons
                                                                name={editedStarRating >= option ? 'star' : 'star-border'}
                                                                size={32}
                                                                style={editedStarRating >= option ? MyStyles.starSelected : MyStyles.starUnselected}
                                                            />
                                                        </Animated.View>
                                                    </TouchableWithoutFeedback>
                                                ))}
                                            </View>
                                            <TouchableOpacity onPress={() => updateRating(r.id)}>
                                                <Text style={MyStyles.buttonComment}>Lưu</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => setEditingRatingId(null)}>
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
                                                                    setEditingRatingId(r.id);
                                                                    setEditedStarRating(r.rating);
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
                </ScrollView>
            </KeyboardAvoidingView>
            <View style={MyStyles.buyButtonContainer}>
                <TouchableOpacity style={{ borderRadius: 5, paddingVertical: 15, paddingHorizontal: 20, flexDirection:"row", alignItems: 'center', justifyContent: 'center'}} onPress={handleBuyPress}>
                    <Icon source="cart-variant" color="white" size={30} />
                    <Text style={MyStyles.buttonText}>Thêm vào giỏ hàng</Text>
                </TouchableOpacity>
            </View>
        
        </SafeAreaView>
        </PaperProvider>
    );
}

export default ProductDetails;
