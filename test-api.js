import axios from 'axios'
axios.get('http://localhost:8080/api/v1/catalog/products?size=1').then(res => console.log(res.data)).catch(console.error)
