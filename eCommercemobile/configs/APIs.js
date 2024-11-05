import axios from "axios";

const BASE_URL = 'https://tuankiet.pythonanywhere.com';

export const endpoints = {
  'categories': '/categories/',
  'products': '/products/',
  //'product': (cateId) => `/categories/${cateId}/products`,
  'product-details': (productId) => `/products/${productId}/`,
  'comments': (productId) => `/products/${productId}/comments/`,
  'stores': '/stores/',
  'store-products': (storeId) => `/stores/${storeId}/products/`,
  'comments-store': (storeId) => `/stores/${storeId}/comments`,
  'ratings': (productId) => `/products/${productId}/ratings/`,
  'rating-store': (storeId) => `/stores/${storeId}/ratings/`,
  'login': '/o/token/',
  'current-user': '/users/current-user/',
  'register': '/users/',
  'add-comment': (productId) => `/products/${productId}/add-comment/`,
  'add-comment-store': (storeId) => `/stores/${storeId}/add-comment/`,
  'add-rating': (productId) => `/products/${productId}/add-rating/`,
  'add-rating-store': (storeId) => `/stores/${storeId}/add-rating/`,
  'delete-comment': (commentId) => `/productcomments/${commentId}/`,
  'delete-comment-store': (commentId) => `/storecomments/${commentId}/`,
  'delete-rating': (ratingId) => `/productratings/${ratingId}/`,
  'delete-rating-store': (ratingId) => `/storeratings/${ratingId}/`,
  'update-comment': (commentId) => `/productcomments/${commentId}/`,
  'update-comment-store': (commentId) => `/storecomments/${commentId}/`,
  'update-rating': (ratingId) => `/productratings/${ratingId}/`,
  'update-rating-store': (ratingId) => `/storeratings/${ratingId}/`,
  'add-product': (storeId) => `/stores/${storeId}/add-product/`,
  'add-tag': (productId) => `/products/${productId}/add-tag/`,
  'orders-user': (userId) => `/users/${userId}/orders/`,
  'orders-store': (userId) => `/stores/${userId}/orders/`,
  'cart': '/carts/my_cart/',

};

// export const APIs = axios.create({
//   baseURL: 'https://tuankiet.pythonanywhere.com', // Thay đổi URL này thành URL API của bạn
//   headers: {
//     'Content-Type': 'multipart/form-data'
//   }
// });

export const authApi = (accessToken) => axios.create({
  baseURL: BASE_URL,
  headers: {
    "Authorization": `bearer ${accessToken}`
  }
})

export default axios.create({
  baseURL: BASE_URL,
});
