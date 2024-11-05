import { useCallback, useContext, useEffect, useState, useRef } from "react";
import { ActivityIndicator, Dimensions, FlatList, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import APIs, { endpoints } from "../../configs/APIs";
import { Chip, Searchbar, Icon, Modal } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import Item from "../Utils/Item";
// import { isCloseToBottom } from "../Utils/Utils";
// import ProductGrid from "./ProductGrid";
import debounce from 'lodash.debounce';
import Contexts from "../../configs/Contexts";

const { width } = Dimensions.get('window');

const Home = ({ route, navigation }) => {
  const [categories, setCategories] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [cateId, setCateId] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [sort, setSort] = useState("");
  const user = useContext(Contexts);
  const store_owner = route.params?.store_owner;
  const store_id = route.params?.store_id;
  const [stores, setStores] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const searchInputRef = useRef(null);

  const loadStores = async () => {
    try {
      let res = await APIs.get(endpoints['stores']);
      setStores(res.data);
    } catch (ex) {
      console.error(ex);
    }
  };

  const loadCate = async () => {
    try {
      let res = await APIs.get(endpoints["categories"]);
      setCategories(res.data);
    } catch (ex) {
      console.error(ex);
    }
  };

  const loadPro = async () => {
    if (page > 0 && !loading) {
      let url = `${endpoints['products']}?q=${q}&category_id=${cateId}&page=${page}`;
      try {
        setLoading(true);
        let res = await APIs.get(url);
        let loadedProducts = res.data.results;

        if (sort === "name") {
          loadedProducts = loadedProducts.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sort === "priceLowToHigh") {
          loadedProducts = loadedProducts.sort((a, b) => a.price - b.price);
        } else if (sort === "priceHighToLow") {
          loadedProducts = loadedProducts.sort((a, b) => b.price - a.price);
        }
        if (page === 1) setProducts(loadedProducts);
        else if (page > 1) {
          setProducts((current) => [...current, ...loadedProducts]);
        }
        if (res.data.next === null) setPage(0);
      } catch (ex) {
        console.error(ex);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  const sortProducts = (sortOrder) => {
    setSort(sortOrder);
    setPage(1);
  };

  useEffect(() => {
    loadCate();
  }, []);

  const debouncedLoadPro = useCallback(debounce(loadPro, 300), [q, cateId, page, sort]);
  
  useEffect(() => {
    debouncedLoadPro();
    return debouncedLoadPro.cancel;
  }, [q, cateId, page, sort]);

  const handleCategorySelect = (categoryId) => {
    setCateId(categoryId);
    setPage(1);
  };

  const handleSortChange = (sortOrder) => {
    setIsModalVisible(false);
    setSort(sortOrder);
    setPage(1);
  };

  const handleTouchFilter = () => {
    setIsModalVisible(true)
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  }
  const loadMore = () => {
    if (!loading && page !== 0) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const search = (value, callback) => {
    setPage(1);
    callback(value);
  }

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setSort(""); // Reset sort to default
    setCateId(""); // Reset category filter
    setQ("");
    loadPro().then(() => setRefreshing(false));
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={[MyStyles.bg_Color]}>
        <View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Searchbar
              style={{ width: "85%", marginTop: 10, marginHorizontal: 10, height: 50, borderRadius: 3 }}
              placeholder="Tìm sản phẩm..."
              value={q}
              onChangeText={(t) => search(t, setQ)}
              ref={searchInputRef}
            />
            <TouchableOpacity onPress={() => handleTouchFilter()}  style={{alignContent:"center", padding:5, marginTop:15}}>
              <Icon source="filter" size={25} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal={true} style={{ flexDirection: "row", margin: 5 }} showsHorizontalScrollIndicator={false}>
            <Chip mode={!cateId ? "outlined" : "flat"} style={{ margin: 5 }} onPress={() => handleCategorySelect("")} icon="shape-outline">
              Tất cả
            </Chip>
            {categories === null ? (
              <ActivityIndicator />
            ) : (
              categories.map((c) => (
                <Chip
                  mode={cateId === c.id ? "outlined" : "flat"}
                  onPress={() => handleCategorySelect(c.id)}
                  style={MyStyles.margin}
                  key={c.id}
                  icon="cart"
                >
                  {c.name}
                </Chip>
              ))
            )}
          </ScrollView>
        </View>
      </View>
      <FlatList
        style={{ flex: 1, marginLeft: 5 }}
        data={products}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ width: width / 2 - 5 }}
            onPress={() => navigation.navigate("ProductDetails", { 'productId': item.id })}
          >
            <Item instance={item} />
          </TouchableOpacity>
        )}
        ListHeaderComponent={loading && <ActivityIndicator />}
        ListFooterComponent={loading && page > 1 && <ActivityIndicator />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      />
      <Modal
        transparent={true}
        animationType="slide"
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
        onDismiss={() => setIsModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
          <View style={{ width: '80%', backgroundColor: 'white', borderRadius: 10, padding: 15, alignItems: 'center', height: 180 }}>
            <TouchableOpacity onPress={() => handleSortChange("name")} style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd', width: '100%', alignItems: 'center', height: 40 }}>
              <Text>Sắp xếp theo tên</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSortChange("priceLowToHigh")} style={{ padding:10, borderBottomWidth: 1, borderBottomColor: '#ddd', width: '100%', alignItems: 'center', height:50, flexDirection:"row", justifyContent:"center" }}>
              <Text>Sắp xếp giá từ thấp đến cao</Text>
            </TouchableOpacity>a
            <TouchableOpacity onPress={() => handleSortChange("priceHighToLow")} style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd', width: '100%', alignItems: 'center', height: 50, flexDirection:"row", justifyContent:"center" }}>
              <Text>Sắp xếp giá từ cao xuống thấp</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Home;