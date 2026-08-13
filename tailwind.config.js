/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // Tailwind preflight 이 html 에 font-family 를 걸어주니, 기본 sans 스택만 바꾸면
      // App.jsx 를 건드리지 않고 전체 폰트가 교체됩니다.
      // 'Pretendard Variable' 이 먼저고, 폰트를 못 받은 환경에선 뒤 스택으로 자연스럽게 떨어져요.
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "Helvetica Neue",
          "Segoe UI",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "Malgun Gothic",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
