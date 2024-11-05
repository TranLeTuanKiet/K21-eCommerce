import { Card, List } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import { Dimensions, Image, View } from "react-native";

const { width } = Dimensions.get('window');

const Item = ({ instance }) => {
    return (
        <View style={{ width: width / 2 - 10, margin: 5 }} >
            {/* <List.Item style={[MyStyles.margin_instance, MyStyles.margin]} title={instance.name} description={instance.price} left={() => <Image style={MyStyles.image} source={{ uri: instance.image }} />} /> */}
            <Card >
                <Card.Cover source={{ uri: instance.image }} />
                {/* <View style={MyStyles.row}>
                            {product.tags.map(tag => (
                                <Chip key={tag.id} style={MyStyles.margin} icon="tag">
                                    {tag.name}
                                </Chip>
                            ))}
                        </View> */}
                <Card.Title titleStyle={[{}]} title={instance.name} />

                <Card.Title titleStyle={MyStyles.subject} title={instance.price} />
                <Card.Title title={instance.store.name} />
                {/* <Card.Content>
                            <RenderHTML contentWidth={width} source={{ html: product.description }} />
                        </Card.Content> */}
            </Card>
        </View>
    );
}

export default Item;