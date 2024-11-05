import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  column: {
    flexDirection: "column",
    //flexWrap: "wrap",
  },
  margin: {
    margin: 5,
  },
  margin_instance: {
    marginBottom: 20
  },
  marginTop: {
    marginTop: 0,
  },
  bg_Color: {
    backgroundColor: "#EE4D2D"
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 20
  }, instance_size: {
    //width: 150,
    height: 150
  }, padding: {
    //paddingBottom: 5
    //marginBottom: 20
  }, subject: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#EE4D2D"
  },
  button: {
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    //shadowColor: '#000',
    //shadowOffset: { width: 0, height: 2 },
    //shadowOpacity: 0.8,
    //shadowRadius: 2,
    //elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buyButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ff4500', // Màu cam đặc trưng của Shopee
    //backgroundColor: '#fff', // Đảm bảo nền trắng phía sau nút
    //padding: 10,
    //borderTopWidth: 1,
    //borderColor: '#e0e0e0', // Đường viền phía trên của nút
    alignItems: 'center',
  },
  buttonComment: {
    textAlign: "center",
    backgroundColor: '#ff4500',
    color: "white",
    padding: 10
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 30,
  },
  storeAddress: {
    fontSize: 18,
    marginVertical: 5,
  },
  storeEmail: {
    fontSize: 18,
    marginVertical: 5,
  },
  storePhone: {
    fontSize: 18,
    marginVertical: 5,
  },
  inputLog: {
    width: "100%",
    height: 50,
    padding: 5,
    marginBottom: 5,
    // marginTop: 50,
    backgroundColor: "lightgray"
  }, buttonLog: {
    textAlign: "center",
    backgroundColor: '#ff4500',
    color: "white",
    padding: 10,
    marginHorizontal: 18
  }, avatarLog: {
    width: 80,
    height: 80,
    margin: 5
  }, comment: {
    width: 300,
    backgroundColor: "lightgray",
    padding: 5
  }, heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  stars: {
    display: 'flex',
    flexDirection: 'row',
  },
  starUnselected: {
    color: '#aaa',
  },
  starSelected: {
    color: '#ffb300',
  },
  avatarContainer: {
    position: 'absolute',
    top: 110,
    bottom: -30,
    left: "34%",
    width: 130,
    height: 130,
    borderRadius: 65,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'black',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarStore: {
    width: '100%',
    height: '100%',
    borderRadius: 65,
    alignItems:"center",
    justifyContent:"center"
  },orderItem: {
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  orderText: {
    fontSize: 16,
  },
  noOrdersText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  }, checkoutButton: {
    backgroundColor: 'green',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center'
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  }
});
