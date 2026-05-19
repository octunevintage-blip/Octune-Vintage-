import jwt from 'jsonwebtoken';

const token = jwt.sign({ id: '65f123456789012345678901', role: 'admin' }, 'your_jwt_secret_here', { expiresIn: '1h' });

fetch('http://localhost:5000/api/admin/stats', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json().then(data => ({status: res.status, data})))
.then(console.log)
.catch(console.error);
