const app = require('./src/app');
const config = require('./src/config/config');

const PORT = config.port || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    
})
