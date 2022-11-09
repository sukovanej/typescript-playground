import http from 'k6/http';

export const options = {
  vus: 15,
  duration: '5s',
};

export default function () {
  http.get('http://localhost:3000/fp');
}
