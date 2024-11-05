import { DefaultTheme } from 'react-native-paper';

export const theme = {
    ...DefaultTheme, // Sử dụng DefaultTheme làm base theme
    colors: {
      ...DefaultTheme.colors,
      primary: '#3498db', // Màu chủ đạo
      accent: '#f1c40f', // Màu phụ
      background: 'black', // Màu nền
      text: '#2c3e50', // Màu văn bản chính
      secondaryText: '#7f8c8d', // Màu văn bản phụ
    }
}